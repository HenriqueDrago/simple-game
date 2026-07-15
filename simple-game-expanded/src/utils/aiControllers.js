import { constants, presetAi } from "./constants.js";
import { simulators } from "./simulators.js";
import {
    createBaseEntity,
    getEntityMaxHealth,
    getEntityTotalHealth,
    getEntityTotalMana,
    isEntityDead,
    processActionTypeUsed,
} from "./entities.js";
import { actionKeys, effectKeys, eyeKeys } from "./enums.js";
import { commitTurn, processUpkeep } from "./turnManagement.js";
import {
    processGreenStar,
    processOrangeStar,
    processRedStar,
} from "./starfall.js";

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
    if (entity[effectKeys.BURDEN_OF_STIGMA] > 0) {
        return false;
    }

    if (entity[effectKeys.TARNISHED_SIN] >= 100) {
        return true;
    }

    if (entity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        if (entity[effectKeys.ENLIGHTENMENT] <= 0) {
            return true;
        }
        return false;
    }

    if (getEntityTotalHealth(entity) <= 0) {
        return true;
    }

    return false;
}

function willEntityImmediatelyDieByNextUpkeep(sim, queriedKey, nonQueriedKey) {
    const currTargetEntity = sim.entities[queriedKey];
    const futureTargetEntity = processUpkeep(sim, queriedKey, nonQueriedKey)
        .entities[queriedKey];

    return willEntityDieImmediately(currTargetEntity) || willEntityDieImmediately(futureTargetEntity);
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
    const { prev, agent, agentKey, nonAgent, nonAgentKey } = context;

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

    // Calculate the complete star pool
    const colors = [
        effectKeys.RED_STAR,
        effectKeys.ORANGE_STAR,
        effectKeys.YELLOW_STAR,
        effectKeys.GREEN_STAR,
        effectKeys.BLUE_STAR,
        effectKeys.INDIGO_STAR,
        effectKeys.VIOLET_STAR,
    ];

    let totalStars = agent.stars[effectKeys.WHITE_STAR] || 0;
    colors.forEach((color) => {
        totalStars += agent.stars[color] || 0;
    });

    let remainingWhite = totalStars;

    // Early return if no stars
    if (totalStars <= 0) {
        return allocations;
    }

    // === Lethal Checks ===

    // A: Normal Red Star
    if (remainingWhite > 0) {
        const { draftMaster, draftNonMaster } = processRedStar(
            { master: agent, nonMaster: nonAgent },
            remainingWhite,
            0,
        );

        const simState = {
            ...prev,
            entities: {
                [agentKey]: draftMaster,
                [nonAgentKey]: draftNonMaster,
            },
        };

        if (
            willEntityEffectivelyDieByNextUpkeep(
                simState,
                nonAgentKey,
                agentKey,
            )
        ) {
            allocations = {
                ...allocations,
                [effectKeys.RED_STAR]: remainingWhite,
            };
            remainingWhite = 0;
        }
    }

    // B: Augmented Red Star
    if (remainingWhite > 0) {
        const violetAlloc = Math.floor(remainingWhite / 2);
        const redAlloc = remainingWhite - violetAlloc;

        const { draftMaster, draftNonMaster } = processRedStar(
            { master: agent, nonMaster: nonAgent },
            redAlloc,
            violetAlloc,
        );

        const simState = {
            ...prev,
            entities: {
                [agentKey]: draftMaster,
                [nonAgentKey]: draftNonMaster,
            },
        };

        if (
            willEntityEffectivelyDieByNextUpkeep(
                simState,
                nonAgentKey,
                agentKey,
            )
        ) {
            allocations = {
                ...allocations,
                [effectKeys.RED_STAR]: redAlloc,
                [effectKeys.VIOLET_STAR]: violetAlloc,
            };

            remainingWhite = 0;
        }
    }

    // C: Augmented Orange Star
    if (remainingWhite > 0) {
        const violetAlloc = Math.floor(remainingWhite / 2);

        const { draftMaster, draftNonMaster } = processOrangeStar(
            { master: agent, nonMaster: nonAgent },
            0,
            violetAlloc,
        );

        const simState = {
            ...prev,
            entities: {
                [agentKey]: draftMaster,
                [nonAgentKey]: draftNonMaster,
            },
        };

        if (
            willEntityEffectivelyDieByNextUpkeep(
                simState,
                nonAgentKey,
                agentKey,
            )
        ) {
            allocations = {
                ...allocations,
                [effectKeys.ORANGE_STAR]: violetAlloc,
                [effectKeys.VIOLET_STAR]: violetAlloc,
            };
            remainingWhite -= violetAlloc * 2;
        }
    }

    // D: Augmented Green Star
    if (remainingWhite > 0) {
        const violetAlloc = Math.floor(remainingWhite / 2);
        const greenAlloc = remainingWhite - violetAlloc;

        const { draftMaster, draftNonMaster } = processGreenStar(
            { master: agent, nonMaster: nonAgent },
            0,
            violetAlloc,
        );

        const simState = {
            ...prev,
            entities: {
                [agentKey]: draftMaster,
                [nonAgentKey]: draftNonMaster,
            },
        };

        // Check if the opponent dies from the delayed True Damage after commit
        if (
            willEntityEffectivelyDieByNextCommitPostUpkeep(
                simState,
                nonAgentKey,
                agentKey,
            )
        ) {
            allocations = {
                ...allocations,
                [effectKeys.GREEN_STAR]: greenAlloc,
                [effectKeys.VIOLET_STAR]: violetAlloc,
            };
            remainingWhite = 0;
        }
    }

    // === Default Logic ===

    // Restore up to max hp with green
    if (remainingWhite > 0) {
        const missingHealth =
            getEntityMaxHealth(agent) - agent[effectKeys.HEALTH];
        const spentGreen = Math.min(missingHealth, remainingWhite);

        allocations = {
            ...allocations,
            [effectKeys.GREEN_STAR]: spentGreen,
        };
        remainingWhite -= spentGreen;
    }

    // Use yellow/augmented yellow for resource generation
    if (remainingWhite > 0) {
        const spentYellow = Math.ceil(remainingWhite / 2);
        const spentViolet = Math.floor(remainingWhite / 2);

        allocations = {
            ...allocations,
            [effectKeys.YELLOW_STAR]: spentYellow,
            [effectKeys.VIOLET_STAR]: spentViolet,
        };
        // remainingWhite = 0;
    }

    return allocations;
}

// Element
export function selectElementAI(context) {
    return [];
}

// Central router
export function centralAIManagement(prev, agentKey, nonAgentKey) {
    // Build context
    const agent = prev.entities[agentKey];
    const nonAgent = prev.entities[nonAgentKey];

    const context = {
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

    // Use Angel AI if on Ascendence
    if (agent.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        caller = angelAI;
    }

    // Calculate action
    let action = caller(context);

    // Action overrides
    // Use Judgement if Annointed
    if (agent.states[effectKeys.ANOINTED_PROXY]) {
        action = actionKeys.JUDGEMENT;
    }

    // Use Ascend if on Zenith
    if (agent.states[effectKeys.ZENITH_OF_MORTALITY]) {
        action = actionKeys.ASCEND;
    }

    // Use Meltdown if on Overload
    if (agent.states[effectKeys.THERMAL_OVERLOAD]) {
        action = actionKeys.MELTDOWN;
    }

    // Process Stars
    const assignedStars = assignStarsAI(context);

    // Process Element
    const selectedElement = selectElementAI(context);

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
    = half their max health (or a third of enlit if they're ascended)
    */
    if (nonAgent.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        const enemyEnlitLost =
            nonAgent[effectKeys.ENLIGHTENMENT] -
            simAttack.entities[nonAgentKey][effectKeys.ENLIGHTENMENT];

        if (
            enemyEnlitLost >= nonAgent[effectKeys.MAX_ENLIGHTENMENT] * 0.25 ||
            simAttack.entities[nonAgentKey][effectKeys.ENLIGHTENMENT] <= 0
        ) {
            return actionKeys.ATTACK;
        }
    } else {
        const enemyHealthLost =
            getEntityTotalHealth(nonAgent) -
            getEntityTotalHealth(simAttack.entities[nonAgentKey]);

        if (
            enemyHealthLost >= getEntityMaxHealth(nonAgent) * 0.5 ||
            simAttack.entities[nonAgentKey][effectKeys.HEALTH] <= 0
        ) {
            return actionKeys.ATTACK;
        }
    }

    // Sacrifice to accumulate damage
    /*
    Conditions:
    - Health is high enough = more than 60% full
    */
    if (getEntityTotalHealth(agent) >= getEntityMaxHealth(agent) * 0.6) {
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
    const { agent, agentKey, nonAgentKey } = context;

    const simulate = createSimulator(context);
    const simAtk = simulate(actionKeys.ATTACK);

    // Use ATTACK if it kills
    if (willEntityEffectivelyDieByNextUpkeep(simAtk, nonAgentKey, agentKey)) {
        return actionKeys.ATTACK;
    }

    // Use AEGIS if available
    if (!agent.states[effectKeys.CUTOFF_WINGS]) {
        return actionKeys.AEGIS;
    }

    // otherwise, play sacrifice
    return bloodknightAI(context);
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
    const { agent, agentKey } = context;
    const simulate = createSimulator(context);

    const simSound = simulate(actionKeys.SOUND_OF_SILENCE);

    const willSoundKill =
        simSound.entities[agentKey].resources[effectKeys.MANA_OVERFLOW] >=
        simSound.entities[agentKey][effectKeys.HEALTH];

    const willNextSoundKill =
        simSound.entities[agentKey].resources[effectKeys.MANA_OVERFLOW] + 2 >=
        simSound.entities[agentKey][effectKeys.HEALTH];

    // If on thermal, use the only action available
    if (agent.states[effectKeys.THERMAL_OVERLOAD]) {
        return actionKeys.MELTDOWN;
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
        if (!willSoundKill) {
            return actionKeys.SOUND_OF_SILENCE;
        } else {
            return actionKeys.GUARD;
        }
    }

    // if only negative, but not on the lowest low and next willKill, but not this one
    if (agent[effectKeys.SONORITY] < 0 && willNextSoundKill && !willSoundKill) {
        return actionKeys.SOUND_OF_SILENCE;
    }

    // If on venting
    if (agent.states[effectKeys.VENTING]) {
        if (agent[effectKeys.SONORITY] < 0 && !willSoundKill) {
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

export function angelAI(context) {
    const { prev, agent, nonAgent, agentKey, nonAgentKey } = context;
    const simulate = createSimulator(context);

    const isEyeOpen = prev[effectKeys.EYE_OF_HEAVENS] === eyeKeys.OPEN;

    const maledictionSafe =
        !isEyeOpen ||
        agent[effectKeys.REVELATION] <
            constants.MAX_TARNISHED_SIN - agent[effectKeys.TARNISHED_SIN];

    // 1. Seraph kill
    const simSeraph = simulate(actionKeys.SERAPH_OF_CONDEMNATION);

    if (
        maledictionSafe &&
        willEntityEffectivelyDieByNextUpkeep(simSeraph, nonAgentKey, agentKey)
    ) {
        return actionKeys.SERAPH_OF_CONDEMNATION;
    }

    // 2. Flames kill
    const simFlames = simulate(actionKeys.BAPTISM_OF_THE_FLAMES);

    if (
        willEntityEffectivelyDieByNextUpkeep(simFlames, nonAgentKey, agentKey)
    ) {
        return actionKeys.BAPTISM_OF_THE_FLAMES;
    }

    // 3. Hymmns
    const simHymmnsAgent = simulate(actionKeys.HYMNS_OF_SANCTIFICATION)
        .entities[agentKey];

    // Case 1: we have poison
    if (agent.resources[effectKeys.POISON] > 0) {
        return actionKeys.HYMNS_OF_SANCTIFICATION;
    }

    // Case 2: we're low on enlit and this will recover it significantly (20%+)
    if (
        agent[effectKeys.ENLIGHTENMENT] <
            agent[effectKeys.MAX_ENLIGHTENMENT] * 0.5 &&
        simHymmnsAgent[effectKeys.ENLIGHTENMENT] >
            agent[effectKeys.ENLIGHTENMENT] +
                agent[effectKeys.MAX_ENLIGHTENMENT] * 0.2
    ) {
        return actionKeys.HYMNS_OF_SANCTIFICATION;
    }

    // 4. Celestial Scale
    /* 
    Conditions:
    - Won't bring us to low enligtement
    - Will raise Insight considerably (>15)
    - Won't waste much (more than 5) inspiration
    */
    const simScaleAgent = simulate(actionKeys.CELESTIAL_SCALE).entities[
        agentKey
    ];

    const missingInsightPostScale =
        simScaleAgent[effectKeys.MAX_INSIGHT] -
        simScaleAgent[effectKeys.INSIGHT];

    if (
        simScaleAgent[effectKeys.ENLIGHTENMENT] >=
            simScaleAgent[effectKeys.MAX_ENLIGHTENMENT] * 0.5 &&
        simScaleAgent[effectKeys.INSIGHT] - agent[effectKeys.INSIGHT] >= 15 &&
        missingInsightPostScale - 5 >=
            simScaleAgent.resources[effectKeys.INSPIRATION]
    ) {
        return actionKeys.CELESTIAL_SCALE;
    }

    // 5. Glimpse
    /* 
    Conditions:
    - eye is not open
    - enemy is not on ascendence
    - enemy has resources we wanna get rid of
    */
    const undesirableResources =
        nonAgent.resources[effectKeys.BLOOD_SACRIFICE] +
        nonAgent.resources[effectKeys.RADIANCE] +
        nonAgent.resources[effectKeys.MOONDUST];
    if (
        !isEyeOpen &&
        !nonAgent.states[effectKeys.ASCENDENCE_OF_SPIRIT] &&
        nonAgent.resources[effectKeys.SACRED_FLAMES] >=
            undesirableResources * 0.4 &&
        undesirableResources >= 10
    ) {
        return actionKeys.GLIMPSE_OF_PANDEMONIUM;
    }

    // 6. Flames

    // Case 1: Enemy has ascended or has a high amount of divine spark
    if (
        nonAgent.states[effectKeys.ASCENDENCE_OF_SPIRIT] ||
        nonAgent[effectKeys.DIVINE_SPARK] > constants.MAX_DIVINE_SPARK * 0.5
    ) {
        return actionKeys.BAPTISM_OF_THE_FLAMES;
    }

    // Case 2: Enemy has a resource we want to consume and not enough flame
    if (
        !nonAgent.states[effectKeys.ASCENDENCE_OF_SPIRIT] &&
        undesirableResources >= 10 &&
        nonAgent.resources[effectKeys.SACRED_FLAMES] <
            undesirableResources * 0.4
    ) {
        return actionKeys.BAPTISM_OF_THE_FLAMES;
    }

    // 7. Seraph if malediction is safe
    if (maledictionSafe) {
        return actionKeys.SERAPH_OF_CONDEMNATION;
    }

    // 8. flames fall back
    return actionKeys.BAPTISM_OF_THE_FLAMES;
}

/* Starfarer AI
- Use Attack or Special Attack if it can finish the enemy
- Use Chart otherwise
*/
export function starfarerAI(context) {
    return actionKeys.CHART;
}
