import { constants, presetAi } from "./constants.js";
import {
    canUseAction,
    consumeResources,
    getEntityDef,
    getEntityMaxHealth,
    getEntityTotalHealth,
    getEntityTotalMana,
    getEntityUsableStars,
    isEntityDead,
    processDeathCheck,
    restoreResources,
    translateElementIntoCrystals,
} from "./entities.js";
import {
    actionKeys,
    effectKeys,
    elementalKeys,
    moonKeys,
    roundPhases,
} from "./enums.js";
import { simulateFullStarfall } from "./starfall.js";
import {
    commitTurn,
    processActionUse,
    processUpkeep,
} from "./turnManagement.js";

// Auxiliary Functions
function createSimulator({ agentKey, nonAgentKey, prev }) {
    return (actionKey, overrides = {}) =>
        processDeathCheck(
            processActionUse(
                { ...prev, ...overrides },
                agentKey,
                nonAgentKey,
                actionKey,
            ),
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

function simulateStarsHelper(
    sim,
    agentKey,
    nonAgentKey,
    red,
    orange,
    yellow,
    green,
    blue,
    indigo,
    violet,
) {
    const newSim = {
        ...sim,
        entities: {
            ...sim.entities,
            [agentKey]: {
                ...sim.entities[agentKey],
                stars: {
                    ...sim.entities[agentKey].stars,
                    [effectKeys.RED_STAR]: red,
                    [effectKeys.ORANGE_STAR]: orange,
                    [effectKeys.YELLOW_STAR]: yellow,
                    [effectKeys.GREEN_STAR]: green,
                    [effectKeys.BLUE_STAR]: blue,
                    [effectKeys.INDIGO_STAR]: indigo,
                    [effectKeys.VIOLET_STAR]: violet,
                },
            },
        },
    };

    return simulateFullStarfall(newSim, agentKey, nonAgentKey);
}

export function setConstellation(sim, targetkey, constellation) {
    const totalConst =
        sim.entities[targetkey][effectKeys.CONSTELLATION] +
        sim.entities[targetkey][effectKeys.AZURE_CONSTELLATION] +
        sim.entities[targetkey][effectKeys.CRIMSON_CONSTELLATION];
    return {
        ...sim,
        entities: {
            ...sim.entities,
            [targetkey]: {
                ...sim.entities[targetkey],
                [effectKeys.CONSTELLATION]:
                    constellation === effectKeys.CONSTELLATION ? totalConst : 0,
                [effectKeys.AZURE_CONSTELLATION]:
                    constellation === effectKeys.AZURE_CONSTELLATION
                        ? totalConst
                        : 0,
                [effectKeys.CRIMSON_CONSTELLATION]:
                    constellation === effectKeys.CRIMSON_CONSTELLATION
                        ? totalConst
                        : 0,
            },
        },
    };
}

// Select Constellation
export function selectConstellationAI() {
    return effectKeys.CRIMSON_CONSTELLATION;
}

// Star Assignment
export function assignStarsAI(context) {
    const { prev, agentKey, nonAgentKey, agent, isSingularity } = context;

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

    let remainingWhite = getEntityUsableStars(agent);

    // Early return if no stars
    if (remainingWhite <= 0 || isSingularity) {
        return allocations;
    }

    const relevantActions = [
        actionKeys.SPECIAL_ATTACK,
        actionKeys.ATTACK,
        actionKeys.AEGIS,
        actionKeys.GUARD,
        actionKeys.HEAL,
        actionKeys.CHART,
    ];

    let simulations = {};
    for (let action of relevantActions) {
        simulations = {
            ...simulations,
            [action]: processDeathCheck(
                commitTurn(
                    processDeathCheck(
                        processActionUse(prev, agentKey, nonAgentKey, action),
                    ),
                    agentKey,
                    nonAgentKey,
                ),
            ),
        };
    }

    // === Death Checks ===

    // Normal Red Star
    for (let action of relevantActions) {
        const simStar = simulateStarsHelper(
            simulations[action],
            agentKey,
            nonAgentKey,
            remainingWhite,
            0,
            0,
            0,
            0,
            0,
            0,
        );

        if (
            !willEntityDieImmediately(simStar.entities[agentKey]) &&
            willEntityEffectivelyDieByNextUpkeep(
                simStar,
                nonAgentKey,
                agentKey,
            ) &&
            canUseAction(prev, agentKey, action)
        ) {
            allocations = {
                ...allocations,
                [effectKeys.RED_STAR]: remainingWhite,
            };

            return allocations;
        }
    }

    // Augmented Red Star
    for (let action of relevantActions) {
        const simStar = simulateStarsHelper(
            simulations[action],
            agentKey,
            nonAgentKey,
            Math.ceil(remainingWhite / 2),
            0,
            0,
            0,
            0,
            0,
            Math.floor(remainingWhite / 2),
        );

        if (
            !willEntityDieImmediately(simStar.entities[agentKey]) &&
            willEntityEffectivelyDieByNextUpkeep(
                simStar,
                nonAgentKey,
                agentKey,
            ) &&
            canUseAction(prev, agentKey, action)
        ) {
            allocations = {
                ...allocations,
                [effectKeys.RED_STAR]: Math.ceil(remainingWhite / 2),
                [effectKeys.VIOLET_STAR]: Math.floor(remainingWhite / 2),
            };

            return allocations;
        }
    }

    // Augmented Orange Star
    for (let action of relevantActions) {
        const maxConsume = Math.max(
            0,
            consumeResources(
                simulations[action].entities[agentKey],
                Infinity,
                effectKeys.ORANGE_STAR,
            ).resourcesConsumed.totalConsumption - 1,
        );

        const orangeAssign = Math.min(
            maxConsume,
            Math.ceil(remainingWhite / 2),
        );
        const violetAssign = Math.min(
            orangeAssign,
            Math.floor(remainingWhite / 2),
        );

        const simStar = simulateStarsHelper(
            simulations[action],
            agentKey,
            nonAgentKey,
            0,
            orangeAssign,
            0,
            0,
            0,
            0,
            violetAssign,
        );

        if (
            !willEntityDieImmediately(simStar.entities[agentKey]) &&
            willEntityEffectivelyDieByNextUpkeep(
                simStar,
                nonAgentKey,
                agentKey,
            ) &&
            canUseAction(prev, agentKey, action)
        ) {
            allocations = {
                ...allocations,
                [effectKeys.ORANGE_STAR]: orangeAssign,
                [effectKeys.VIOLET_STAR]: violetAssign,
            };

            return allocations;
        }
    }

    // Yellow Star: Variant A (Max Starblight then Constellation)
    const starsForMaxGrav =
        constants.MAX_GRAVITATION / constants.GRAVITATION_GAIN; // 20
    const starsForMaxAcc =
        (constants.MAX_GRAVITATION + constants.MAX_ACCRETION) /
        constants.GRAVITATION_GAIN; // 40
    if (remainingWhite >= starsForMaxGrav) {
        for (let action of relevantActions) {
            const normalYellow = Math.min(
                starsForMaxAcc +
                    getEntityTotalHealth(
                        simulations[action].entities[agentKey],
                    ) -
                    1,
                remainingWhite,
            );
            const augmentedYellow = Math.floor(
                (remainingWhite - normalYellow) / 2,
            );
            const violetAssign = augmentedYellow;

            let simStar = simulateStarsHelper(
                simulations[action],
                agentKey,
                nonAgentKey,
                0,
                0,
                normalYellow + augmentedYellow,
                0,
                0,
                0,
                violetAssign,
            );

            simStar = setConstellation(
                simStar,
                agentKey,
                effectKeys.CRIMSON_CONSTELLATION,
            );

            for (let singAction of relevantActions) {
                const singSim = processDeathCheck(
                    processActionUse(
                        simStar,
                        agentKey,
                        nonAgentKey,
                        singAction,
                    ),
                );

                if (
                    !willEntityDieImmediately(singSim.entities[agentKey]) &&
                    willEntityEffectivelyDieByNextUpkeep(
                        singSim,
                        nonAgentKey,
                        agentKey,
                    ) &&
                    canUseAction(simStar, agentKey, singAction) &&
                    canUseAction(prev, agentKey, action)
                ) {
                    allocations = {
                        ...allocations,
                        [effectKeys.YELLOW_STAR]:
                            normalYellow + augmentedYellow,
                        [effectKeys.VIOLET_STAR]: violetAssign,
                    };

                    return allocations;
                }
            }
        }
    }

    // Yellow Star: Variant B (Singularity +  Full Constellation)
    if (remainingWhite >= starsForMaxGrav) {
        for (let action of relevantActions) {
            const normalYellow = Math.min(starsForMaxGrav, remainingWhite);
            const augmentedYellow = Math.ceil(
                (remainingWhite - normalYellow) / 2,
            );
            const violetAssign = Math.floor(
                (remainingWhite - normalYellow) / 2,
            );

            let simStar = simulateStarsHelper(
                simulations[action],
                agentKey,
                nonAgentKey,
                0,
                0,
                normalYellow + augmentedYellow,
                0,
                0,
                0,
                violetAssign,
            );

            simStar = setConstellation(
                simStar,
                agentKey,
                effectKeys.CRIMSON_CONSTELLATION,
            );

            for (let singAction of relevantActions) {
                const singSim = processDeathCheck(
                    processActionUse(
                        simStar,
                        agentKey,
                        nonAgentKey,
                        singAction,
                    ),
                );

                if (
                    !willEntityDieImmediately(singSim.entities[agentKey]) &&
                    willEntityEffectivelyDieByNextUpkeep(
                        singSim,
                        nonAgentKey,
                        agentKey,
                    ) &&
                    canUseAction(simStar, agentKey, singAction) &&
                    canUseAction(prev, agentKey, action)
                ) {
                    allocations = {
                        ...allocations,
                        [effectKeys.YELLOW_STAR]:
                            normalYellow + augmentedYellow,
                        [effectKeys.VIOLET_STAR]: violetAssign,
                    };

                    return allocations;
                }
            }
        }
    }

    // Yellow Star: Variant C (Singularity +  Half Constellation / Half Accretion + Starblight)
    if (remainingWhite >= starsForMaxGrav) {
        for (let action of relevantActions) {
            const normalYellow = Math.min(
                starsForMaxGrav +
                    Math.min(
                        (remainingWhite - starsForMaxGrav) / 2,
                        starsForMaxAcc -
                            starsForMaxGrav +
                            getEntityTotalHealth(
                                simulations[action].entities[agentKey],
                            ) -
                            1,
                    ),
                remainingWhite,
            );
            const augmentedYellow = Math.ceil(
                (remainingWhite - normalYellow) / 2,
            );
            const violetAssign = Math.floor(
                (remainingWhite - normalYellow) / 2,
            );

            let simStar = simulateStarsHelper(
                simulations[action],
                agentKey,
                nonAgentKey,
                0,
                0,
                normalYellow + augmentedYellow,
                0,
                0,
                0,
                violetAssign,
            );

            simStar = setConstellation(
                simStar,
                agentKey,
                effectKeys.CRIMSON_CONSTELLATION,
            );

            for (let singAction of relevantActions) {
                const singSim = processDeathCheck(
                    processActionUse(
                        simStar,
                        agentKey,
                        nonAgentKey,
                        singAction,
                    ),
                );

                if (
                    !willEntityDieImmediately(singSim.entities[agentKey]) &&
                    willEntityEffectivelyDieByNextUpkeep(
                        singSim,
                        nonAgentKey,
                        agentKey,
                    ) &&
                    canUseAction(simStar, agentKey, singAction) &&
                    canUseAction(prev, agentKey, action)
                ) {
                    allocations = {
                        ...allocations,
                        [effectKeys.YELLOW_STAR]:
                            normalYellow + augmentedYellow,
                        [effectKeys.VIOLET_STAR]: violetAssign,
                    };

                    return allocations;
                }
            }
        }
    }

    // === Survival ===
    const postCommitAgent = commitTurn(prev, agentKey, nonAgentKey).entities[
        agentKey
    ];
    const missingHp =
        getEntityMaxHealth(postCommitAgent) -
        postCommitAgent[effectKeys.HEALTH];
    const spAtkCost =
        postCommitAgent[effectKeys.MAX_MANA] * constants.SP_ATTACK_COST;
    const missingRelevantMana = spAtkCost - getEntityTotalMana(postCommitAgent);

    if ((missingHp > 0 || missingRelevantMana > 0) && remainingWhite > 0) {
        const greenAssign = Math.min(
            missingHp + Math.max(missingRelevantMana, 0),
            Math.floor(remainingWhite / 2),
        );
        const violetAssign = greenAssign;

        allocations = {
            ...allocations,
            [effectKeys.GREEN_STAR]: greenAssign,
            [effectKeys.VIOLET_STAR]:
                allocations[effectKeys.VIOLET_STAR] + violetAssign,
        };

        remainingWhite -= greenAssign + violetAssign;
    }

    // === Engine ===
    if (remainingWhite > 0) {
        const maxConsume = Math.max(
            0,
            consumeResources(postCommitAgent, Infinity, effectKeys.ORANGE_STAR)
                .resourcesConsumed.totalConsumption -
                getEntityTotalHealth(postCommitAgent) -
                spAtkCost,
        );

        const orangeAssign = Math.min(
            maxConsume,
            allocations[effectKeys.GREEN_STAR] > 0
                ? Math.floor(remainingWhite / 2)
                : Math.ceil(remainingWhite / 2),
        );
        const violetAssign = Math.min(
            orangeAssign,
            Math.floor(remainingWhite / 2),
        );

        allocations = {
            ...allocations,
            [effectKeys.ORANGE_STAR]: orangeAssign,
            [effectKeys.VIOLET_STAR]:
                allocations[effectKeys.VIOLET_STAR] + violetAssign,
        };

        remainingWhite -= orangeAssign + violetAssign;
    }

    if (remainingWhite > 0) {
        const indigoAssign = Math.ceil(remainingWhite / 2);
        const violetAssign = Math.floor(remainingWhite / 2);

        allocations = {
            ...allocations,
            [effectKeys.INDIGO_STAR]: indigoAssign,
            [effectKeys.VIOLET_STAR]:
                allocations[effectKeys.VIOLET_STAR] + violetAssign,
        };
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

    // If not on Selenian, forced on dulled
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
        const tempPrev = {
            ...prev,
            entities: {
                ...prev.entities,
                [agentKey]: tempAgent,
            },
        };
        return createSimulator({
            agentKey,
            nonAgentKey,
            prev: tempPrev,
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
        willEntityEffectivelyDieByNextUpkeep(
            attackSim,
            nonAgentKey,
            agentKey,
        ) ||
        agent.resources[effectKeys.MOONSHINE] >
            getEntityTotalHealth(agent) * 0.5
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
        agent.resources[effectKeys.MANA_OVERFLOW] > 0 ||
        agent.resources[effectKeys.DISSONANCE] > 0;

    if (hasBadResources) {
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

    const currPhase =
        prev.roundQueue && prev.roundQueue.length > 0
            ? prev.roundQueue[prev.roundIndex]
            : null;

    const isSingularity =
        currPhase === roundPhases.P1_SINGULARITY ||
        currPhase === roundPhases.P2_SINGULARITY;

    let context = {
        prev,
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        hasManaForSpecial:
            getEntityTotalMana(agent) >=
            constants.SP_ATTACK_COST * agent[effectKeys.MAX_MANA],
        isSingularity,
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

    // Process Constellation
    const selectedConstellation = selectConstellationAI();

    context = {
        ...context,
        assignedStars,
        selectedElement,
        selectedConstellation,
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
        selectedConstellation,
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
    const { agent, agentKey, nonAgentKey, hasManaForSpecial } = context;

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
    const { agent, agentKey, nonAgentKey, nonAgent, hasManaForSpecial } =
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
    const { prev, agent, agentKey, nonAgentKey, hasManaForSpecial } = context;

    const simulate = createSimulator(context);
    const simAtk = simulate(actionKeys.ATTACK);

    // Use Attack if it kills
    if (willEntityEffectivelyDieByNextUpkeep(simAtk, nonAgentKey, agentKey)) {
        return actionKeys.ATTACK;
    }

    const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);

    // Use Special Attack if it kills
    if (
        willEntityEffectivelyDieByNextUpkeep(simSpecial, nonAgentKey, agentKey)
    ) {
        return actionKeys.SPECIAL_ATTACK;
    }

    if (
        agent.resources[effectKeys.RADIANCE] >=
        getEntityTotalHealth(agent) * 0.5
    ) {
        return actionKeys.ATTACK;
    }

    // Logic when divine spark is  near full
    if (
        agent[effectKeys.DIVINE_SPARK] > constants.MAX_DIVINE_SPARK * 0.9 &&
        hasManaForSpecial
    ) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // If cannot use Aegis, use Warlock AI
    if (!canUseAction(prev, agentKey, actionKeys.AEGIS)) {
        return warlockAI(context);
    }

    // default: Aegis
    return actionKeys.AEGIS;
}

export function augurAI(context) {
    return simpleAI(context);
}

export function shadowSorcererAI(context) {
    const { prev, agent, agentKey, nonAgentKey, hasManaForSpecial } = context;

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
    const { agent, agentKey, nonAgentKey, hasManaForSpecial } = context;
    const simulate = createSimulator(context);

    // Extract stats and states
    const dynamo = agent[effectKeys.DYNAMO];
    const overheat = agent[effectKeys.OVERHEAT];

    // Pre-calculated HEAL evaluation
    const healWorth =
        agent[effectKeys.MANA] >= 5 &&
        getEntityTotalHealth(agent) <= getEntityMaxHealth(agent) * 0.5;

    // Thermal Overload -> Meltdown
    if (agent.states[effectKeys.THERMAL_OVERLOAD]) {
        return actionKeys.MELTDOWN;
    }

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

    // Not on the Cyborg states -> Deploy
    const inAnyStance =
        agent.states[effectKeys.VENTING] ||
        agent.states[effectKeys.WEAPONS_DEPLOYED] ||
        agent.states[effectKeys.THERMAL_OVERLOAD] ||
        agent.states[effectKeys.DEPLOYMENT];

    if (!inAnyStance) {
        return actionKeys.DEPLOY;
    }

    // On Venting, use defensive
    if (agent.states[effectKeys.VENTING]) {
        if (healWorth) {
            return actionKeys.HEAL;
        } else {
            return actionKeys.GUARD;
        }
    }

    // Generate baseline simulation for next steps
    const simLaser = simulate(actionKeys.LASER);

    // laser kills -> laser
    if (willEntityEffectivelyDieByNextUpkeep(simLaser, nonAgentKey, agentKey)) {
        return actionKeys.LASER;
    }

    // Check if laser sets us to >= 100 overheat (100% or above threshold)
    if (simLaser.entities[agentKey][effectKeys.OVERHEAT] >= 100) {
        // Check if meltdown kills the opponent -> laser
        // Passes post-laser simulation states into the meltdown simulator
        const simMeltdown = simulate(actionKeys.MELTDOWN, {
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
            // Else, use defensive
            if (healWorth) {
                return actionKeys.HEAL;
            } else {
                return actionKeys.GUARD;
            }
        }
    }

    // 6. overheat > 30 and dynamo >= 70 and dynamo < 100 then
    if (overheat >= 30 && dynamo >= 70 && dynamo < 100) {
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
    const { hasManaForSpecial, prev, nonAgentKey, agentKey, assignedStars } =
        context;

    function simulateActionStarfallHelper(action) {
        return simulateStarsHelper(
            processDeathCheck(
                commitTurn(
                    processDeathCheck(
                        processActionUse(prev, agentKey, nonAgentKey, action),
                    ),
                    agentKey,
                    nonAgentKey,
                ),
            ),
            agentKey,
            nonAgentKey,
            assignedStars[effectKeys.RED_STAR],
            assignedStars[effectKeys.ORANGE_STAR],
            assignedStars[effectKeys.YELLOW_STAR],
            assignedStars[effectKeys.GREEN_STAR],
            assignedStars[effectKeys.BLUE_STAR],
            assignedStars[effectKeys.INDIGO_STAR],
            assignedStars[effectKeys.VIOLET_STAR],
        );
    }

    // === Immediate Kill Sims ===

    const simulate = createSimulator(context);

    // Simulate Special Attack
    // If it kills, use it
    if (hasManaForSpecial) {
        const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
        if (willEntityDieImmediately(simSpecial.entities[nonAgentKey])) {
            return actionKeys.SPECIAL_ATTACK;
        }
    }

    // Simulate Attack
    // If it kills, use it
    const simAttack = simulate(actionKeys.ATTACK);
    if (willEntityDieImmediately(simAttack.entities[nonAgentKey])) {
        return actionKeys.ATTACK;
    }

    const relevantActions = [
        actionKeys.SPECIAL_ATTACK,
        actionKeys.ATTACK,
        actionKeys.AEGIS,
        actionKeys.GUARD,
        actionKeys.HEAL,
        actionKeys.CHART,
    ];

    // Death checks taking starfall into consideration
    for (let action of relevantActions) {
        const sim = simulateActionStarfallHelper(action);

        if (
            !willEntityDieImmediately(sim.entities[agentKey]) &&
            willEntityEffectivelyDieByNextUpkeep(sim, nonAgentKey, agentKey)
        ) {
            return action;
        }
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
            if (getEntityDef(agent) >= 15 && agent[effectKeys.MOONLIGHT] > 5) {
                return actionKeys.LUNAR_SHROUD;
            }

            return actionKeys.MIRROR;
        }
        case elementalKeys.NATURE: {
            const simGrowth = simulate(actionKeys.LUNAR_GROWTH);
            const simHeal = simulate(actionKeys.HEAL);

            const hpGrowth = getEntityTotalHealth(simGrowth.entities[agentKey]);
            const hpHeal = getEntityTotalHealth(simHeal.entities[agentKey]);

            if (hpGrowth >= hpHeal) {
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

            if (
                enemyHpStrike >= enemyHpAttack ||
                (agent.resources[effectKeys.MOONSHINE] > 0 && enemyHpAttack > 0)
            ) {
                return actionKeys.LUNAR_STRIKE;
            } else {
                return actionKeys.ATTACK;
            }
        }
        case elementalKeys.OCEAN: {
            return actionKeys.LUNAR_TIDE;
        }
        case elementalKeys.WITHER: {
            if (agent[effectKeys.MOONLIGHT] > 5) {
                return actionKeys.LUNAR_SHED;
            }

            return actionKeys.MIRROR;
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
