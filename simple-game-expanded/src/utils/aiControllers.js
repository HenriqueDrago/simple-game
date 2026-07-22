import { constants, presetAi } from "./constants.js";
import { simulators } from "./simulators.js";
import {
    canUseAction,
    getEntityDef,
    getEntityMaxHealth,
    getEntityTotalHealth,
    getEntityTotalMana,
    getEntityUsableStars,
    isEntityDead,
    processActionTypeUsed,
    restoreResources,
    translateElementIntoCrystals,
} from "./entities.js";
import { actionKeys, effectKeys, elementalKeys, moonKeys } from "./enums.js";
import { commitTurn, processUpkeep } from "./turnManagement.js";

// Auxiliary Functions
function createSimulator({ agent, agentKey, nonAgent, nonAgentKey, prev }) {
    return (actionKey, overrides = {}) =>
        processActionTypeUsed(
            simulators[actionKey]({
                agent,
                agentKey,
                nonAgent,
                nonAgentKey,
                prev,
                ...overrides,
            }),
            agentKey,
            nonAgentKey,
            actionKey,
        );
}

function willEntityDieImmediately(entity) {
    return isEntityDead(entity);
}

function willEntityEffectivelyDie(entity) {
    if (getEntityTotalHealth(entity) <= 0) {
        return true;
    }

    if (getEntityMaxHealth(entity) <= 0) {
        return true;
    }

    return false;
}

function willEntityImmediatelyDieByNextUpkeep(sim, queriedKey, nonQueriedKey) {
    const currTargetEntity = sim.entities[queriedKey];
    const futureTargetEntity = processUpkeep(sim, queriedKey, nonQueriedKey)
        .entities[queriedKey];

    return (
        willEntityDieImmediately(currTargetEntity) ||
        willEntityDieImmediately(futureTargetEntity)
    );
}

function willEntityEffectivelyDieByNextUpkeep(sim, queriedKey, nonQueriedKey) {
    const currTargetEntity = sim.entities[queriedKey];
    const futureTargetEntity = processUpkeep(sim, queriedKey, nonQueriedKey)
        .entities[queriedKey];

    return (
        willEntityEffectivelyDie(currTargetEntity) ||
        willEntityEffectivelyDie(futureTargetEntity)
    );
}

function willEntityEffectivelyDieByNextCommit(sim, queriedKey, nonQueriedKey) {
    const currTargetEntity = sim.entities[queriedKey];
    const futureTargetEntity = commitTurn(sim, queriedKey, nonQueriedKey)
        .entities[queriedKey];

    return (
        willEntityEffectivelyDie(currTargetEntity) ||
        willEntityEffectivelyDie(futureTargetEntity)
    );
}

function willEntityEffectivelyDieByNextCommitPostUpkeep(
    sim,
    queriedKey,
    nonQueriedKey,
) {
    const currTargetEntity = sim.entities[queriedKey];

    const postUpkeepState = processUpkeep(sim, queriedKey, nonQueriedKey);
    const futureTargetEntity = postUpkeepState.entities[queriedKey];
    const futureFutureTargetEntity = commitTurn(
        postUpkeepState,
        queriedKey,
        nonQueriedKey,
    ).entities[queriedKey];

    return (
        willEntityEffectivelyDie(currTargetEntity) ||
        willEntityEffectivelyDie(futureTargetEntity) ||
        willEntityEffectivelyDie(futureFutureTargetEntity)
    );
}

// Star Assignment
export function assignStarsAI(context) {
    const { agent } = context;

    // Initial allocations
    let allocations = {
        [effectKeys.RED_STAR]: 0,
        [effectKeys.ORANGE_STAR]: 0,
        [effectKeys.YELLOW_STAR]: 0,
        [effectKeys.GREEN_STAR]: 0,
        [effectKeys.BLUE_STAR]: 0,
        [effectKeys.INDIGO_STAR]: 0,
        [effectKeys.VIOLET_STAR]: 0,
    };

    let totalStars = getEntityUsableStars(agent);

    // Early return if no stars
    if (totalStars <= 0) {
        return allocations;
    }

    return allocations;
}

// Element AI
export function selectElementAI(context) {
    const { prev, agent, agentKey, nonAgent, nonAgentKey } = context;

    const maxHealthNature = getEntityMaxHealth({
        ...agent,
        [effectKeys.ELEMENTAL_CRYSTALS]: translateElementIntoCrystals(
            elementalKeys.NATURE,
        ),
    });

    // If shattered, remain shattered
    if (
        agent[effectKeys.ELEMENTAL_CRYSTALS].includes(elementalKeys.SHATTERED)
    ) {
        return elementalKeys.SHATTERED;
    }

    // If not on Selenian, if forced on dulled
    if (!agent.states[effectKeys.SELENIAN]) {
        return elementalKeys.DULLED;
    }

    // Helper function for using the simulations with the correct element
    const simWithElement = (element, actionKey) => {
        const tempAgent = {
            ...agent,
            [effectKeys.ELEMENTAL_CRYSTALS]:
                translateElementIntoCrystals(element),
        };
        return createSimulator({
            agent: tempAgent,
            agentKey,
            nonAgent,
            nonAgentKey,
            prev,
        })(actionKey);
    };

    // Simulate lethal attacks with Scorch
    const strikeSim = simWithElement(
        elementalKeys.SCORCH,
        actionKeys.LUNAR_STRIKE,
    );
    const attackSim = simWithElement(elementalKeys.SCORCH, actionKeys.ATTACK);

    if (
        willEntityEffectivelyDieByNextUpkeep(
            strikeSim,
            nonAgentKey,
            agentKey,
        ) ||
        willEntityEffectivelyDieByNextUpkeep(attackSim, nonAgentKey, agentKey)
    ) {
        return elementalKeys.SCORCH;
    }

    // Simulate lethal attacks with Ash
    const smiteSim = simWithElement(elementalKeys.ASH, actionKeys.LUNAR_SMITE);

    if (willEntityEffectivelyDieByNextUpkeep(smiteSim, nonAgentKey, agentKey)) {
        return elementalKeys.ASH;
    }

    const tideSim = simWithElement(elementalKeys.OCEAN, actionKeys.LUNAR_TIDE);
    const hasBadResources =
        agent.resources[effectKeys.POISON] > 0 ||
        agent.resources[effectKeys.SHACKLED_MANA] > 0 ||
        agent.resources[effectKeys.MANA_OVERFLOW] > 0 ||
        agent.resources[effectKeys.DISSONANCE] > 0;

    if (hasBadResources) {
        if (tideSim.entities[agentKey].resources[effectKeys.POISON] > 0) {
            return elementalKeys.NATURE;
        }

        return elementalKeys.OCEAN;
    }

    // If low on health, compare our options
    if (agent[effectKeys.HEALTH] <= maxHealthNature * 0.5) {
        const growthSim = simWithElement(
            elementalKeys.NATURE,
            actionKeys.LUNAR_GROWTH,
        );
        const healSim = simWithElement(elementalKeys.NATURE, actionKeys.HEAL);

        const moon = growthSim.entities[agentKey][effectKeys.MIRRORED_MOON];
        const extraMoonlight = moon === moonKeys.CORONAL ? 1 : 0;

        const hpTide = getEntityTotalHealth(tideSim.entities[agentKey]);
        const hpGrowth = getEntityTotalHealth(
            restoreResources(
                growthSim.entities[agentKey],
                growthSim.entities[agentKey][effectKeys.MOONLIGHT] +
                    extraMoonlight,
            ),
        );

        const hpHeal = getEntityTotalHealth(healSim.entities[agentKey]);

        let bestElement = elementalKeys.NATURE;
        let maxHp = hpHeal;

        if (hpGrowth > maxHp) {
            maxHp = hpGrowth;
            bestElement = elementalKeys.NATURE;
        }
        if (hpTide >= maxHp) {
            // maxHp = hpTide;
            bestElement = elementalKeys.OCEAN;
        }
        return bestElement;
    }

    // Simulate chalk
    // If our Chalk is strong enough, proceed to enter shattered
    const chalkSim = simWithElement(elementalKeys.SHATTERED, actionKeys.CHALK);
    const chalkDamage =
        getEntityMaxHealth(nonAgent) -
        getEntityMaxHealth(chalkSim.entities[nonAgentKey]);

    if (chalkDamage >= getEntityMaxHealth(nonAgent) * 0.5) {
        return elementalKeys.ALBEDO;
    }

    // Default elements
    const moon = agent[effectKeys.MIRRORED_MOON];
    const isWaxing = moon === moonKeys.WAXING;

    // If Waxing, use Wither when it won't leave us too low
    // otherwise frost
    if (isWaxing) {
        const simWither = simWithElement(
            elementalKeys.WITHER,
            actionKeys.LUNAR_SHED,
        );

        if (
            getEntityTotalHealth(simWither.entities[agentKey]) >=
            getEntityMaxHealth(agent) * 0.5
        ) {
            return elementalKeys.WITHER;
        } else {
            return elementalKeys.FROST;
        }
    }

    // If on Waning, use Frost
    return elementalKeys.FROST;
}

// Central router
export function centralAIManagement(prev, agentKey, nonAgentKey) {
    // Build context
    const agent = prev.entities[agentKey];
    const nonAgent = prev.entities[nonAgentKey];

    let context = {
        prev,
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        isArrayActive: prev[effectKeys.RUNIC_ARRAY] > 0,
        hasManaForSpecial:
            getEntityTotalMana(agent) >= constants.SP_ATTACK_COST,
    };

    let caller = presetAi[agent.controller].caller || simpleAI;

    // AI overrides
    // Use SS AI if on Umbral
    if (agent.states[effectKeys.UMBRAL_CORE]) {
        caller = shadowSorcererAI;
    }

    // Process Stars
    const assignedStars = assignStarsAI(context);

    // Process Element
    const selectedElement = selectElementAI(context);

    context = {
        ...context,
        assignedStars,
        selectedElement,
        agent: {
            ...agent,
            [effectKeys.ELEMENTAL_CRYSTALS]:
                translateElementIntoCrystals(selectedElement),
        },
    };

    // Calculate action
    let action = caller(context);

    // Action overrides
    // Use Meltdown if on Overload
    if (agent.states[effectKeys.THERMAL_OVERLOAD]) {
        action = actionKeys.MELTDOWN;
    }

    return {
        assignedStars,
        selectedElement,
        action,
    };
}

// AIs

/* 1. Mundane AI
- Use Attack when possible
- Heal at low health
- Guard to recover Mana
*/
export function simpleAI(context) {
    const { agent } = context;

    // Low health
    if (getEntityTotalHealth(agent) <= getEntityMaxHealth(agent) * 0.5) {
        // If high enough mana, heal
        // otherwise, guard to recover it
        if (getEntityTotalMana(agent) >= 4) {
            return actionKeys.HEAL;
        } else {
            return actionKeys.GUARD;
        }
    }

    // standard attack
    return actionKeys.ATTACK;
}

/* 2. Warlock AI
- Use Attack or Special Attack if it can finish the enemy
- Use Guard to recover mana
- Use Special Attack when at full mana
- Heal if at low health
*/
export function warlockAI(context) {
    const { agent, agentKey, nonAgentKey, isArrayActive, hasManaForSpecial } =
        context;

    const simulate = createSimulator(context);

    // Simulate Special Attack
    // If it kills, use it
    if (hasManaForSpecial) {
        const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
        if (
            willEntityEffectivelyDieByNextUpkeep(
                simSpecial,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.SPECIAL_ATTACK;
        }
    }

    // Simulate Attack
    // If it kills, use it
    const simAttack = simulate(actionKeys.ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(simAttack, nonAgentKey, agentKey)
    ) {
        return actionKeys.ATTACK;
    }

    // Simulate Curse
    // If it kills, use it
    if (isArrayActive) {
        const simCurse = simulate(actionKeys.CURSE);
        if (
            willEntityEffectivelyDieByNextUpkeep(
                simCurse,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.CURSE;
        }
    }

    if (
        getEntityTotalMana(agent) <=
        agent[effectKeys.MAX_MANA] -
            agent[effectKeys.MAX_MANA] * constants.GUARD_MANA_REGEN
    ) {
        return actionKeys.GUARD;
    }

    // if has enough mana, use special attack as fallback
    if (hasManaForSpecial) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // else, se default attack
    return actionKeys.ATTACK;
}

export function bloodknightAI(context) {
    const {
        agent,
        agentKey,
        nonAgentKey,
        nonAgent,
        isArrayActive,
        hasManaForSpecial,
    } = context;

    const simulate = createSimulator(context);

    // Simulate Special Attack
    // If it kills, use it
    if (hasManaForSpecial) {
        const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
        if (
            willEntityEffectivelyDieByNextUpkeep(
                simSpecial,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.SPECIAL_ATTACK;
        }
    }

    // Simulate Attack
    // If it kills, use it
    const simAttack = simulate(actionKeys.ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(simAttack, nonAgentKey, agentKey)
    ) {
        return actionKeys.ATTACK;
    }

    const missingHp = getEntityMaxHealth(agent) - getEntityTotalHealth(agent);
    const missingMana = agent[effectKeys.MAX_MANA] - getEntityTotalMana(agent);
    const nextTurnHeal = Math.min(
        getEntityTotalMana(agent),
        agent[effectKeys.MANA_BLEED],
    );

    // Guard to recover mana
    /*
    Conditions:
    - Array not active
    - next turn mana bleed heal won't heal all of our missing Health
    - we have mana bleed and it will consume all out mana
    - we won't lose any of the mana gained from guard (due to overcap)
    - missing hp is considerable (25% of max)
    */
    if (
        !isArrayActive &&
        nextTurnHeal < missingHp &&
        agent[effectKeys.MANA_BLEED] > getEntityTotalMana(agent) &&
        missingMana >=
            agent[effectKeys.MAX_MANA] * constants.GUARD_MANA_REGEN &&
        missingHp >= getEntityMaxHealth(agent) * 0.25
    ) {
        return actionKeys.GUARD;
    }

    // Attack
    /*
    Conditions
    - We'll deal a considerable amount of damage
    = half their max health
    */
    const enemyHealthLost =
        getEntityTotalHealth(nonAgent) -
        getEntityTotalHealth(simAttack.entities[nonAgentKey]);

    if (
        enemyHealthLost >= getEntityMaxHealth(nonAgent) * 0.5 ||
        simAttack.entities[nonAgentKey][effectKeys.HEALTH] <= 0
    ) {
        return actionKeys.ATTACK;
    }

    // Sacrifice to accumulate damage
    /*
    Conditions:
    - Health is high enough = more than 60% full
    - Sacrifice won't kill us
    */
    const simSac = simulate(actionKeys.SACRIFICE);
    if (
        getEntityTotalHealth(agent) >= getEntityMaxHealth(agent) * 0.6 &&
        !willEntityEffectivelyDieByNextUpkeep(simSac, agentKey, nonAgentKey)
    ) {
        return actionKeys.SACRIFICE;
    }

    // If no bloodsacrifice and low hp, use heal or guard
    if (
        getEntityTotalHealth(agent) < getEntityMaxHealth(agent) * 0.6 &&
        agent[effectKeys.MANA_BLEED] <= 0
    ) {
        if (agent[effectKeys.MANA] >= 5) {
            return actionKeys.HEAL;
        } else {
            return actionKeys.GUARD;
        }
    }

    // Attack if not array or halo or divinity
    if (
        !(
            isArrayActive ||
            nonAgent.resources[effectKeys.HALO] > 0 ||
            nonAgent.resources[effectKeys.REFRACTED_DIVINITY] > 0
        )
    ) {
        return actionKeys.ATTACK;
    }

    // Guard fallback
    return actionKeys.GUARD;
}

export function paladinAI(context) {
    const { prev, agent, agentKey, nonAgentKey } = context;

    const simulate = createSimulator(context);
    const simAtk = simulate(actionKeys.ATTACK);

    // Use Attack if it kills
    if (willEntityEffectivelyDieByNextUpkeep(simAtk, nonAgentKey, agentKey)) {
        return actionKeys.ATTACK;
    }

    const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);

    // Use Special Attack if it kills
    if (willEntityEffectivelyDieByNextUpkeep(simSpecial, nonAgentKey, agentKey)) {
        return actionKeys.SPECIAL_ATTACK;
    }

    if(agent.resources[effectKeys.RADIANCE] >= getEntityTotalHealth(agent) * 0.5) {
        return actionKeys.ATTACK;
    }

    // If cannot use Aegis or at Max Divine Spark, use Warlock AI
    if(!canUseAction(prev, agentKey, actionKeys.AEGIS) || agent[effectKeys.DIVINE_SPARK] >= constants.MAX_DIVINE_SPARK) {
        return warlockAI(context);
    }

    // default: Aegis
    return actionKeys.AEGIS;
}

export function hexerAI(context) {
    const { agent, agentKey, nonAgentKey, isArrayActive, hasManaForSpecial } =
        context;

    const simulate = createSimulator(context);

    // Simulate Special Attack
    // If it kills, use it
    if (hasManaForSpecial) {
        const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
        if (
            willEntityEffectivelyDieByNextUpkeep(
                simSpecial,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.SPECIAL_ATTACK;
        }
    }

    // Simulate Attack
    // If it kills, use it
    const simAttack = simulate(actionKeys.ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(simAttack, nonAgentKey, agentKey)
    ) {
        return actionKeys.ATTACK;
    }

    // if has poison on self, heal to cleanse
    if (agent.resources[effectKeys.POISON] > 0) {
        return actionKeys.HEAL;
    }

    // When Array is active...
    if (isArrayActive) {
        // Simulate CURSE
        const simCurse = simulate(actionKeys.CURSE);

        // If enemy dies for sure, use CURSE
        if (
            willEntityImmediatelyDieByNextUpkeep(
                simCurse,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.CURSE;
        }

        // If we don't die, also use CURSE
        if (
            !willEntityImmediatelyDieByNextUpkeep(
                simCurse,
                agentKey,
                nonAgentKey,
            )
        ) {
            return actionKeys.CURSE;
        }

        // otherwise, guard for the upcoming MANA redistribution
        return actionKeys.GUARD;
    }

    // if not on array and has mana
    // dumps mana with either HEAL or SPECIAL ATTACK
    if (
        getEntityTotalHealth(agent) <= getEntityMaxHealth(agent) * 0.5 &&
        getEntityTotalMana(agent) >= 5
    ) {
        return actionKeys.HEAL;
    }

    if (hasManaForSpecial) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // lastly, casts ARRAY
    return actionKeys.ARRAY;
}

export function shadowSorcererAI(context) {
    const {
        prev,
        agent,
        agentKey,
        nonAgentKey,
        isArrayActive,
        hasManaForSpecial,
    } = context;

    const simulate = createSimulator(context);

    // === Outside Umbral ===
    if (!agent.states[effectKeys.UMBRAL_CORE]) {
        // Simulate Special Attack
        // If it kills, use it
        if (hasManaForSpecial) {
            const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
            if (
                willEntityEffectivelyDieByNextUpkeep(
                    simSpecial,
                    nonAgentKey,
                    agentKey,
                )
            ) {
                return actionKeys.SPECIAL_ATTACK;
            }
        }

        // Simulate Attack
        // If it kills, use it
        const simAttack = simulate(actionKeys.ATTACK);
        if (
            willEntityEffectivelyDieByNextUpkeep(
                simAttack,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.ATTACK;
        }

        // if has poison on self, heal to cleanse
        if (agent.resources[effectKeys.POISON] > 0) {
            return actionKeys.HEAL;
        }

        // When Array is active...
        if (isArrayActive) {
            // Simulate CURSE
            const simCurse = simulate(actionKeys.CURSE);

            // If enemy dies for sure, use CURSE
            if (
                willEntityImmediatelyDieByNextUpkeep(
                    simCurse,
                    nonAgentKey,
                    agentKey,
                )
            ) {
                return actionKeys.CURSE;
            }
        }

        // Bleak redirect
        if (agent.states[effectKeys.BLEAK_DECEPTION]) {
            return bloodknightAI(context);
        }

        // Umbral Entry
        return actionKeys.SHADOW_PACT;
    }

    // === Inside Umbral ===
    else {
        // Simulate Black Mayhem
        // use if it kills immediatelly either now or on the enemy's next upkeep
        // don't use likely since it might kill us first
        const simMayhem = simulate(actionKeys.BLACK_MAYHEM);
        if (
            willEntityImmediatelyDieByNextUpkeep(
                simMayhem,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.BLACK_MAYHEM;
        }

        // If we are dying on turn end, exit UMBRAL CORE
        if (willEntityEffectivelyDieByNextCommit(prev, agentKey, nonAgentKey)) {
            return actionKeys.DARK_PROMISE;
        }

        // verify DARK PROMISE lethality
        const simPromise = simulate(actionKeys.DARK_PROMISE);

        // if enemy dies by their next commit, use it
        if (
            willEntityEffectivelyDieByNextCommitPostUpkeep(
                simPromise,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.DARK_PROMISE;
        }

        // Burn Management

        // If low hp, check how beneficial is SM
        if (getEntityTotalHealth(agent) <= getEntityMaxHealth(agent) * 0.5) {
            const simMantle = simulate(actionKeys.SHADOW_MANTLE);
            const simPostUpkeep = processUpkeep(
                simMantle,
                agentKey,
                nonAgentKey,
            );
            const simPostCommit = commitTurn(
                simPostUpkeep,
                agentKey,
                nonAgentKey,
            );

            const netHpGain =
                getEntityTotalHealth(simPostCommit.entities[agentKey]) -
                getEntityTotalHealth(agent);

            if (netHpGain > 0) {
                return actionKeys.SHADOW_MANTLE;
            }
        }

        // Avoid lethal burn
        if (willEntityEffectivelyDieByNextUpkeep(prev, agentKey, nonAgentKey)) {
            return actionKeys.RITUAL_OF_ASH;
        }

        // use black mayhem
        return actionKeys.BLACK_MAYHEM;
    }
}

export function cyborgAI(context) {
    const { agent, agentKey, nonAgentKey } = context;
    const simulate = createSimulator(context);

    // Extract stats and states
    const dynamo = agent[effectKeys.DYNAMO];
    const overheat = agent[effectKeys.OVERHEAT];

    // Pre-calculated HEAL evaluation
    const healWorth =
        agent[effectKeys.MANA] >= 5 &&
        getEntityTotalHealth(agent) <= getEntityMaxHealth(agent) * 0.5;

    // 1. Thermal Overload -> Meltdown
    if (agent.states[effectKeys.THERMAL_OVERLOAD]) {
        return actionKeys.MELTDOWN;
    }

    // 2. !venting/weaponsdeployed/thermaloverload/deployment -> Deploy
    const inAnyStance =
        agent.states[effectKeys.VENTING] ||
        agent.states[effectKeys.WEAPONS_DEPLOYED] ||
        agent.states[effectKeys.THERMAL_OVERLOAD] ||
        agent.states[effectKeys.DEPLOYMENT];

    if (!inAnyStance) {
        return actionKeys.DEPLOY;
    }

    // 3. if venting then healWorth -> heal else guard
    if (agent.states[effectKeys.VENTING]) {
        if (healWorth) {
            return actionKeys.HEAL;
        } else {
            return actionKeys.GUARD;
        }
    }

    // Generate baseline simulation for steps 4 & 5
    const simLaser = simulate(actionKeys.LASER);

    // 4. check if laser kills -> laser
    if (willEntityEffectivelyDieByNextUpkeep(simLaser, nonAgentKey, agentKey)) {
        return actionKeys.LASER;
    }

    // 5. check if laser sets us to >= 100 overheat (100% or above threshold)
    if (simLaser.entities[agentKey][effectKeys.OVERHEAT] >= 100) {
        // 5.1 check if meltdown kills the opponent -> laser
        // Passes post-laser simulation states into the meltdown simulator
        const simMeltdown = simulate(actionKeys.MELTDOWN, {
            agent: simLaser.entities[agentKey],
            nonAgent: simLaser.entities[nonAgentKey],
            prev: simLaser,
        });

        // Check if the enemy die with the upcoming MELTDOWN
        // if yes, use LASER to advance to the MELTDOWN state
        if (
            willEntityEffectivelyDieByNextUpkeep(
                simMeltdown,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.LASER;
        } else {
            // 5.2 else: healWorth -> heal else guard
            if (healWorth) {
                return actionKeys.HEAL;
            } else {
                return actionKeys.GUARD;
            }
        }
    }

    // 6. overheat > 30 and dynamo >= 70 and dynamo < 100 then
    if (overheat > 30 && dynamo >= 70 && dynamo < 100) {
        // 6.1 healWorth -> heal / 6.2 else guard
        if (healWorth) {
            return actionKeys.HEAL;
        } else {
            return actionKeys.GUARD;
        }
    }

    // 7. laser if can
    if (agent.states[effectKeys.WEAPONS_DEPLOYED]) {
        return actionKeys.LASER;
    }

    // Guard fallback
    return actionKeys.GUARD;
}

export function maestroAI(context) {
    const { agent, hasManaForSpecial, nonAgentKey, agentKey } = context;

    // If on thermal, use the only action available
    if (agent.states[effectKeys.THERMAL_OVERLOAD]) {
        return actionKeys.MELTDOWN;
    }

    const simulate = createSimulator(context);

    // Simulate Special Attack
    // If it kills, use it
    if (hasManaForSpecial) {
        const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
        if (
            willEntityEffectivelyDieByNextUpkeep(
                simSpecial,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.SPECIAL_ATTACK;
        }
    }

    // Simulate Attack
    // If it kills, use it
    const simAttack = simulate(actionKeys.ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(simAttack, nonAgentKey, agentKey)
    ) {
        return actionKeys.ATTACK;
    }

    // if not on resonant, attune
    if (!agent.states[effectKeys.RESONANT]) {
        return actionKeys.ATTUNE;
    }

    // if not on any of the laser states, deploy
    if (
        !agent.states[effectKeys.DEPLOYMENT] &&
        !agent.states[effectKeys.WEAPONS_DEPLOYED] &&
        !agent.states[effectKeys.VENTING] &&
        !agent.states[effectKeys.THERMAL_OVERLOAD]
    ) {
        return actionKeys.DEPLOY;
    }

    // if positive on sonority, babel
    if (agent[effectKeys.SONORITY] > 0) {
        return actionKeys.BABEL;
    }

    // if absolute negative on sonority, check safety
    if (agent[effectKeys.SONORITY] <= constants.SONORITY_LOWER_LIMIT) {
        return actionKeys.SOUND_OF_SILENCE;
    }

    // If on venting
    if (agent.states[effectKeys.VENTING]) {
        if (agent[effectKeys.SONORITY] < 0) {
            return actionKeys.SOUND_OF_SILENCE;
        }

        if (agent[effectKeys.SONORITY] > 0) {
            return actionKeys.BABEL;
        }
    }

    // if available, use laser
    if (agent.states[effectKeys.WEAPONS_DEPLOYED]) {
        return actionKeys.LASER;
    }

    return actionKeys.GUARD;
}

/* Starfarer AI
- Use Attack or Special Attack if it can finish the enemy
- Use Chart otherwise
*/
export function starfarerAI(context) {
    const { hasManaForSpecial, nonAgentKey, agentKey } = context;

    const simulate = createSimulator(context);

    // Simulate Special Attack
    // If it kills, use it
    if (hasManaForSpecial) {
        const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
        if (
            willEntityEffectivelyDieByNextUpkeep(
                simSpecial,
                nonAgentKey,
                agentKey,
            )
        ) {
            return actionKeys.SPECIAL_ATTACK;
        }
    }

    // Simulate Attack
    // If it kills, use it
    const simAttack = simulate(actionKeys.ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(simAttack, nonAgentKey, agentKey)
    ) {
        return actionKeys.ATTACK;
    }

    // default: CHART
    return actionKeys.CHART;
}

/* Lunatic AI
- Enter Selenian if not already
- decides which action to use according to the element received
*/
export function lunaticAI(context) {
    const { agent, agentKey, nonAgentKey, selectedElement } = context;

    // Enter Selenian if not already on it
    if (!agent.states[effectKeys.SELENIAN]) {
        return actionKeys.REFRACT;
    }

    const simulate = createSimulator(context);

    switch (selectedElement) {
        case elementalKeys.FROST: {
            if (getEntityDef(agent) >= 15) {
                return actionKeys.LUNAR_SHROUD;
            }

            return actionKeys.MIRROR;
        }
        case elementalKeys.NATURE: {
            const simGrowth = simulate(actionKeys.LUNAR_GROWTH);
            const simHeal = simulate(actionKeys.HEAL);

            const hpGrowth = getEntityTotalHealth(simGrowth.entities[agentKey]);
            const hpHeal = getEntityTotalHealth(simHeal.entities[agentKey]);

            if (hpGrowth >= hpHeal && agent.resources[effectKeys.POISON] <= 0) {
                return actionKeys.LUNAR_GROWTH;
            } else {
                return actionKeys.HEAL;
            }
        }
        case elementalKeys.SCORCH: {
            const simStrike = simulate(actionKeys.LUNAR_STRIKE);
            const simAttack = simulate(actionKeys.ATTACK);

            const enemyHpStrike = getEntityTotalHealth(
                simStrike.entities[nonAgentKey],
            );
            const enemyHpAttack = getEntityTotalHealth(
                simAttack.entities[nonAgentKey],
            );

            if (enemyHpStrike <= enemyHpAttack) {
                return actionKeys.LUNAR_STRIKE;
            } else {
                return actionKeys.ATTACK;
            }
        }
        case elementalKeys.OCEAN: {
            return actionKeys.LUNAR_TIDE;
        }
        case elementalKeys.WITHER: {
            return actionKeys.LUNAR_SHED;
        }
        case elementalKeys.ASH: {
            return actionKeys.LUNAR_SMITE;
        }
        case elementalKeys.ALBEDO: {
            return actionKeys.SHATTER;
        }
        case elementalKeys.SHATTERED: {
            // Simulate lethal attacks
            const chalkSim = simulate(actionKeys.CHALK);
            if (
                willEntityEffectivelyDieByNextUpkeep(
                    chalkSim,
                    nonAgentKey,
                    agentKey,
                )
            ) {
                return actionKeys.CHALK;
            }

            const strikeSim = simulate(actionKeys.LUNAR_STRIKE);
            if (
                willEntityEffectivelyDieByNextUpkeep(
                    strikeSim,
                    nonAgentKey,
                    agentKey,
                )
            ) {
                return actionKeys.LUNAR_STRIKE;
            }

            const smiteSim = simulate(actionKeys.LUNAR_SMITE);
            if (
                willEntityEffectivelyDieByNextUpkeep(
                    smiteSim,
                    nonAgentKey,
                    agentKey,
                )
            ) {
                return actionKeys.LUNAR_SMITE;
            }

            return actionKeys.CHALK;
        }
        case elementalKeys.DULLED:
        default: {
            return actionKeys.MIRROR;
        }
    }
}
