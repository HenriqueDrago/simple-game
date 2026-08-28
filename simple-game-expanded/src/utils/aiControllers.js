import { constants, FREE_ACTIONS, playerMap, presetAi } from "./constants.js";
import {
    canUseAction,
    consumeMitigationResources,
    consumeResources,
    getEntityDef,
    getEntityDefEffect,
    getEntityDefPen,
    getEntityMaxHealth,
    getEntityStr,
    getEntityTotalHealth,
    getEntityTotalMana,
    getEntityUsableStars,
    isElementActive,
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
} from "./enums.js";
import { simulateFullStarfall } from "./starfall.js";
import {
    commitTurn,
    processActionUse,
    processMoonPhase,
    processUpkeep,
} from "./turnManagement.js";

// Auxiliary Functions
function createSimulator({ agentKey, nonAgentKey, prev }) {
    return (actionKey, overrides = {}) => {
        const baseState = overrides?.prev || prev;
        return processDeathCheck(
            processActionUse(
                { ...baseState, ...overrides },
                agentKey,
                nonAgentKey,
                actionKey,
            ),
        );
    };
}

function createAvailabilityChecker({ agentKey, prev }) {
    return (actionKey, overrides = {}) => {
        const baseState = overrides?.prev || prev;
        return canUseAction(
            { ...baseState, ...overrides },
            agentKey,
            actionKey,
        );
    };
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
    const { prev, agentKey, nonAgentKey, agent, isExtraTurn } = context;

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

    // Early return if no stars or during singularity
    if (remainingWhite <= 0 || isExtraTurn) {
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
    for (const action of relevantActions) {
        simulations[action] = commitTurn(
            processDeathCheck(
                processActionUse(prev, agentKey, nonAgentKey, action),
            ),
            agentKey,
            nonAgentKey,
        );
    }

    // === Kill Scenarios Pipeline ===
    const starsForMaxGrav =
        constants.MAX_GRAVITATION / constants.GRAVITATION_GAIN; // 20
    const starsForMaxAcc =
        (constants.MAX_GRAVITATION + constants.MAX_ACCRETION) /
        constants.GRAVITATION_GAIN; // 40

    const scenarioGenerators = [
        // 1. Normal Red Star
        () => ({
            [effectKeys.RED_STAR]: remainingWhite,
        }),

        // 2. Augmented Red Star
        () => ({
            [effectKeys.RED_STAR]: Math.ceil(remainingWhite / 2),
            [effectKeys.VIOLET_STAR]: Math.floor(remainingWhite / 2),
        }),

        // 3. Augmented Orange Star
        (actionSim) => {
            const maxConsume = Math.max(
                0,
                consumeResources(
                    actionSim.entities[agentKey],
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

            return {
                [effectKeys.ORANGE_STAR]: orangeAssign,
                [effectKeys.VIOLET_STAR]: violetAssign,
            };
        },
    ];

    // Helper for calculating max starblight
    const calcMaxStarblight = (sim) => {
        return Math.ceil(
            (Math.max(
                0,
                Math.floor(
                    getEntityDef(sim.entities[nonAgentKey]) *
                        getEntityDefEffect(sim, nonAgentKey),
                ) - getEntityDefPen(sim, agentKey),
            ) *
                constants.ACC_STARBLIGHT_CONVERSION) /
                constants.GRAVITATION_GAIN,
        );
    };

    // Yellow Star Variants
    if (remainingWhite >= starsForMaxGrav) {
        scenarioGenerators.push(
            // Variant A: Max Starblight then Constellation
            (actionSim) => {
                const normalYellow = Math.min(
                    starsForMaxAcc + calcMaxStarblight(actionSim),
                    remainingWhite,
                );
                const augmentedYellow = Math.ceil(
                    (remainingWhite - normalYellow) / 2,
                );
                const violet = Math.floor((remainingWhite - normalYellow) / 2);
                return {
                    [effectKeys.YELLOW_STAR]: normalYellow + augmentedYellow,
                    [effectKeys.VIOLET_STAR]: violet,
                };
            },

            // Variant B: Singularity + Full Constellation
            () => {
                const normalYellow = Math.min(starsForMaxGrav, remainingWhite);
                const augmentedYellow = Math.ceil(
                    (remainingWhite - normalYellow) / 2,
                );
                const violetAssign = Math.floor(
                    (remainingWhite - normalYellow) / 2,
                );
                return {
                    [effectKeys.YELLOW_STAR]: normalYellow + augmentedYellow,
                    [effectKeys.VIOLET_STAR]: violetAssign,
                };
            },

            // Variant C: Singularity + Half Constellation / Half Accretion + Starblight
            (actionSim) => {
                const normalYellow = Math.min(
                    starsForMaxGrav +
                        Math.min(
                            Math.floor((remainingWhite - starsForMaxGrav) / 2),
                            starsForMaxAcc -
                                starsForMaxGrav +
                                calcMaxStarblight(actionSim),
                        ),
                    remainingWhite,
                );
                const augmentedYellow = Math.ceil(
                    (remainingWhite - normalYellow) / 2,
                );
                const violetAssign = Math.floor(
                    (remainingWhite - normalYellow) / 2,
                );
                return {
                    [effectKeys.YELLOW_STAR]: normalYellow + augmentedYellow,
                    [effectKeys.VIOLET_STAR]: violetAssign,
                };
            },

            // Variant A + Mana: Raw Green for SP ATK + Max Accretion then Constellation
            (actionSim) => {
                const agentEnt = actionSim.entities[agentKey];
                const missingHp = Math.max(
                    0,
                    getEntityMaxHealth(agentEnt) - agentEnt[effectKeys.HEALTH],
                );
                const spCost =
                    agentEnt[effectKeys.MAX_MANA] * constants.SP_ATTACK_COST;
                const missingMana = Math.max(
                    0,
                    Math.ceil(spCost - getEntityTotalMana(agentEnt)),
                );
                const rawGreenNeeded = missingHp + missingMana;
                const budget = remainingWhite - rawGreenNeeded;

                if (missingMana <= 0 || budget < starsForMaxGrav) {
                    return null;
                }

                const normalYellow = Math.min(starsForMaxAcc, budget);
                const augmentedYellow = Math.ceil((budget - normalYellow) / 2);
                const violet = Math.floor((budget - normalYellow) / 2);

                return {
                    [effectKeys.GREEN_STAR]: rawGreenNeeded,
                    [effectKeys.YELLOW_STAR]: normalYellow + augmentedYellow,
                    [effectKeys.VIOLET_STAR]: violet,
                };
            },

            // Variant B + Mana: Raw Green for SP ATK + Singularity + Full Constellation
            (actionSim) => {
                const agentEnt = actionSim.entities[agentKey];
                const missingHp = Math.max(
                    0,
                    getEntityMaxHealth(agentEnt) - agentEnt[effectKeys.HEALTH],
                );
                const spCost =
                    agentEnt[effectKeys.MAX_MANA] * constants.SP_ATTACK_COST;
                const missingMana = Math.max(
                    0,
                    Math.ceil(spCost - getEntityTotalMana(agentEnt)),
                );
                const rawGreenNeeded = missingHp + missingMana;
                const budget = remainingWhite - rawGreenNeeded;

                if (missingMana <= 0 || budget < starsForMaxGrav) {
                    return null;
                }

                const normalYellow = Math.min(starsForMaxGrav, budget);
                const augmentedYellow = Math.ceil((budget - normalYellow) / 2);
                const violetAssign = Math.floor((budget - normalYellow) / 2);

                return {
                    [effectKeys.GREEN_STAR]: rawGreenNeeded,
                    [effectKeys.YELLOW_STAR]: normalYellow + augmentedYellow,
                    [effectKeys.VIOLET_STAR]: violetAssign,
                };
            },

            // Variant C + Mana: Raw Green for SP ATK + Singularity + Half Constellation / Half Accretion
            (actionSim) => {
                const agentEnt = actionSim.entities[agentKey];
                const missingHp = Math.max(
                    0,
                    getEntityMaxHealth(agentEnt) - agentEnt[effectKeys.HEALTH],
                );
                const spCost =
                    agentEnt[effectKeys.MAX_MANA] * constants.SP_ATTACK_COST;
                const missingMana = Math.max(
                    0,
                    Math.ceil(spCost - getEntityTotalMana(agentEnt)),
                );
                const rawGreenNeeded = missingHp + missingMana;
                const budget = remainingWhite - rawGreenNeeded;

                if (missingMana <= 0 || budget < starsForMaxGrav) {
                    return null;
                }

                const normalYellow = Math.min(
                    starsForMaxGrav +
                        Math.min(
                            Math.floor((budget - starsForMaxGrav) / 2),
                            starsForMaxAcc - starsForMaxGrav,
                        ),
                    budget,
                );
                const augmentedYellow = Math.ceil((budget - normalYellow) / 2);
                const violetAssign = Math.floor((budget - normalYellow) / 2);

                return {
                    [effectKeys.GREEN_STAR]: rawGreenNeeded,
                    [effectKeys.YELLOW_STAR]: normalYellow + augmentedYellow,
                    [effectKeys.VIOLET_STAR]: violetAssign,
                };
            },
        );
    }

    // Evaluate All Kill Scenarios Centrally
    for (const getScenario of scenarioGenerators) {
        for (const action of relevantActions) {
            if (!canUseAction(prev, agentKey, action)) {
                continue;
            }

            const simAction = simulations[action];
            const candidateStars = getScenario(simAction);

            if (!candidateStars) {
                continue;
            }

            const fullStars = {
                ...allocations,
                ...candidateStars,
            };

            let simStar = simulateStarsHelper(
                simAction,
                agentKey,
                nonAgentKey,
                fullStars[effectKeys.RED_STAR],
                fullStars[effectKeys.ORANGE_STAR],
                fullStars[effectKeys.YELLOW_STAR],
                fullStars[effectKeys.GREEN_STAR],
                fullStars[effectKeys.BLUE_STAR],
                fullStars[effectKeys.INDIGO_STAR],
                fullStars[effectKeys.VIOLET_STAR],
            );

            // Direct Kill Check
            if (
                !willEntityDieImmediately(simStar.entities[agentKey]) &&
                willEntityEffectivelyDieByNextUpkeep(
                    simStar,
                    nonAgentKey,
                    agentKey,
                )
            ) {
                return fullStars;
            }

            // Singularity Kill Check
            if (simStar.entities[agentKey].states[effectKeys.EVENT_HORIZON]) {
                simStar = setConstellation(
                    simStar,
                    agentKey,
                    effectKeys.CRIMSON_CONSTELLATION,
                );

                for (const singAction of relevantActions) {
                    if (!canUseAction(simStar, agentKey, singAction)) {
                        continue;
                    }

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
                        )
                    ) {
                        return fullStars;
                    }
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

    const incomingThreatActions = [
        actionKeys.SPECIAL_ATTACK,
        actionKeys.ATTACK,
        actionKeys.BLACK_MAYHEM,
        actionKeys.CURSE,
        actionKeys.LASER,
        actionKeys.MELTDOWN,
        actionKeys.LUNAR_STRIKE,
        actionKeys.LUNAR_SMITE,
    ];

    // Helper for evaluating threats
    const checkThreatSurvival = (testAllocations) => {
        const simPostCommit = commitTurn(prev, agentKey, nonAgentKey);
        const simStar = simulateStarsHelper(
            simPostCommit,
            agentKey,
            nonAgentKey,
            testAllocations[effectKeys.RED_STAR],
            testAllocations[effectKeys.ORANGE_STAR],
            testAllocations[effectKeys.YELLOW_STAR],
            testAllocations[effectKeys.GREEN_STAR],
            testAllocations[effectKeys.BLUE_STAR],
            testAllocations[effectKeys.INDIGO_STAR],
            testAllocations[effectKeys.VIOLET_STAR],
        );
        const simPostUpkeep = processUpkeep(simStar, nonAgentKey, agentKey);

        const isSelenian =
            simPostUpkeep.entities[nonAgentKey].states[effectKeys.SELENIAN];
        const simUsed =
            isSelenian && prev.startingPlayer !== agentKey
                ? processMoonPhase(simPostUpkeep)
                : simPostUpkeep;

        const evaluateAction = (simulation, depth) => {
            if (depth > 10) {
                return true;
            }

            for (const threatAction of incomingThreatActions) {
                if (canUseAction(simulation, nonAgentKey, threatAction)) {
                    const enemyActionSim = processDeathCheck(
                        processActionUse(
                            simulation,
                            nonAgentKey,
                            agentKey,
                            threatAction,
                        ),
                    );

                    if (
                        willEntityEffectivelyDieByNextUpkeep(
                            enemyActionSim,
                            agentKey,
                            nonAgentKey,
                        )
                    ) {
                        return false;
                    }

                    if (FREE_ACTIONS.includes(threatAction)) {
                        if (!evaluateAction(enemyActionSim, depth + 1)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };

        if (
            isSelenian &&
            !isElementActive(
                simUsed.entities[nonAgentKey],
                elementalKeys.SHATTERED,
            )
        ) {
            const relevantElements = [
                elementalKeys.NATURE,
                elementalKeys.FROST,
                elementalKeys.SCORCH,
                elementalKeys.WITHER,
                elementalKeys.OCEAN,
                elementalKeys.ASH,
                elementalKeys.ALBEDO,
            ];

            for (let element of relevantElements) {
                const simElement = {
                    ...simUsed,
                    entities: {
                        ...simUsed.entities,
                        [nonAgentKey]: {
                            ...simUsed.entities[nonAgentKey],
                            [effectKeys.ELEMENTAL_CRYSTALS]:
                                translateElementIntoCrystals(element),
                        },
                    },
                };

                if (!evaluateAction(simElement, 0)) {
                    return false;
                }
            }

            return true;
        }

        return evaluateAction(simUsed, 0);
    };

    // Survivability Helper
    const distributeSurvival = (alloc, remStars) => {
        if (checkThreatSurvival(alloc)) {
            return { testAlloc: alloc, unnasignedStars: remStars };
        }

        // Try Augmented Blue
        if (remStars >= 2) {
            const maxAugBlue = Math.min(
                Math.floor(remStars / 2),
                constants.MAX_IRRADIATION / constants.IRRADIATION_GAIN_RATE +
                    getEntityTotalHealth(postCommitAgent),
            );

            for (let b = 1; b <= maxAugBlue; b++) {
                const testAlloc = {
                    ...alloc,
                    [effectKeys.BLUE_STAR]: b,
                    [effectKeys.VIOLET_STAR]: alloc[effectKeys.VIOLET_STAR] + b,
                };
                if (checkThreatSurvival(testAlloc)) {
                    const unnasignedStars = remStars - b * 2;
                    return { testAlloc, unnasignedStars };
                }
            }
        }

        // Try Normal Blue
        if (remStars > 0) {
            const maxBlue = Math.min(
                remStars,
                getEntityTotalHealth(postCommitAgent),
            );

            for (let b = 1; b <= maxBlue; b++) {
                const testAlloc = {
                    ...alloc,
                    [effectKeys.BLUE_STAR]: b,
                };
                if (checkThreatSurvival(testAlloc)) {
                    const unnasignedStars = remStars - b;
                    return { testAlloc, unnasignedStars };
                }
            }
        }

        return null;
    };

    // Distribute stars for survival
    // Augmented Green
    if (
        remainingWhite > 0 &&
        !checkThreatSurvival(allocations) &&
        missingHp > 0
    ) {
        const maxAugGreen = Math.min(missingHp, Math.floor(remainingWhite / 2));

        let survived = false;
        let remStars = remainingWhite;
        let testAlloc = {
            ...allocations,
        };

        for (let g = 1; g <= maxAugGreen; g++) {
            testAlloc = {
                ...testAlloc,
                [effectKeys.GREEN_STAR]: g,
                [effectKeys.VIOLET_STAR]:
                    allocations[effectKeys.VIOLET_STAR] + g,
            };

            remStars -= 2;

            if (checkThreatSurvival(testAlloc)) {
                allocations = {
                    ...allocations,
                    ...testAlloc,
                };

                remainingWhite -= g * 2;
                survived = true;
                break;
            }
        }

        if (!survived) {
            const distResult = distributeSurvival(testAlloc, remStars);
            if (distResult) {
                allocations = {
                    ...allocations,
                    ...distResult.testAlloc,
                };

                remainingWhite = distResult.unnasignedStars;
            }
        }
    }

    // Normal Green
    if (
        remainingWhite > 0 &&
        !checkThreatSurvival(allocations) &&
        missingHp > 0
    ) {
        const maxGreen = Math.min(missingHp, remainingWhite);

        let survived = false;
        let remStars = remainingWhite;
        let testAlloc = {
            ...allocations,
        };

        for (let g = 1; g <= maxGreen; g++) {
            testAlloc = {
                ...testAlloc,
                [effectKeys.GREEN_STAR]: g,
            };

            remStars -= 1;

            if (checkThreatSurvival(testAlloc)) {
                allocations = {
                    ...allocations,
                    ...testAlloc,
                };

                remainingWhite -= g;
                survived = true;
                break;
            }
        }

        if (!survived) {
            const distResult = distributeSurvival(testAlloc, remStars);
            if (distResult) {
                allocations = {
                    ...allocations,
                    ...distResult.testAlloc,
                };

                remainingWhite = distResult.unnasignedStars;
            }
        }
    }

    // Pure Blue
    if (remainingWhite > 0 && !checkThreatSurvival(allocations)) {
        const distResult = distributeSurvival(allocations, remainingWhite);
        if (distResult) {
            allocations = {
                ...allocations,
                ...distResult.testAlloc,
            };

            remainingWhite = distResult.unnasignedStars;
        } else {
            allocations = {
                ...allocations,
                [effectKeys.BLUE_STAR]:
                    allocations[effectKeys.BLUE_STAR] + remainingWhite,
            };
            remainingWhite = 0;
        }
    }

    // === Engine  ===

    // Orange
    if (remainingWhite > 0) {
        const maxConsume = Math.max(
            0,
            consumeResources(postCommitAgent, Infinity, effectKeys.ORANGE_STAR)
                .resourcesConsumed.totalConsumption - 1,
        );

        const maxOrangePairs = Math.min(
            maxConsume,
            Math.floor(remainingWhite / 2),
        );

        let safeOrangePairs = 0;
        for (let o = maxOrangePairs; o >= 1; o--) {
            const testAlloc = {
                ...allocations,
                [effectKeys.ORANGE_STAR]: o,
                [effectKeys.VIOLET_STAR]:
                    allocations[effectKeys.VIOLET_STAR] + o,
            };

            if (checkThreatSurvival(testAlloc)) {
                safeOrangePairs = o;
                break;
            }
        }

        if (safeOrangePairs > 0) {
            allocations = {
                ...allocations,
                [effectKeys.ORANGE_STAR]: safeOrangePairs,
                [effectKeys.VIOLET_STAR]:
                    allocations[effectKeys.VIOLET_STAR] + safeOrangePairs,
            };
            remainingWhite -= safeOrangePairs * 2;
        }
    }

    // Indigo
    if (remainingWhite > 0) {
        let starSum = 0;
        for (let star of Object.values(allocations)) {
            starSum += star;
        }
        const balanced =
            starSum - allocations[effectKeys.VIOLET_STAR] ===
            allocations[effectKeys.VIOLET_STAR];

        const indigoAssign = balanced
            ? Math.ceil(remainingWhite / 2)
            : remainingWhite;
        const violetAssign = balanced ? Math.floor(remainingWhite / 2) : 0;

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
        agent.resources[effectKeys.MOONSHINE] >=
            getEntityTotalHealth(agent) * 0.7
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

        let bestElement = elementalKeys.NATURE;
        let maxHp = hpGrowth;

        const simSpAtkOcean = processDeathCheck(
            processActionUse(
                processDeathCheck(commitTurn(tideSim, agentKey, nonAgentKey)),
                nonAgentKey,
                agentKey,
                actionKeys.SPECIAL_ATTACK,
            ),
        );

        if (
            hpTide >= maxHp &&
            !willEntityEffectivelyDieByNextUpkeep(
                simSpAtkOcean,
                agentKey,
                nonAgentKey,
            )
        ) {
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
        const tempAgent = {
            ...agent,
            [effectKeys.ELEMENTAL_CRYSTALS]: translateElementIntoCrystals(
                elementalKeys.DULLED,
            ),
        };

        // Heal before Chalk
        if (getEntityTotalHealth(agent) <= getEntityMaxHealth(tempAgent)) {
            return elementalKeys.NATURE;
        }
        return elementalKeys.ALBEDO;
    }

    // Default elements
    const moon = agent[effectKeys.MIRRORED_MOON];
    const isWaxing = moon === moonKeys.WAXING;

    // If Waxing, use scorch if we have moonshine
    // else, Wither when it won't leave us too low
    // otherwise frost
    if (isWaxing) {
        if (agent.resources[effectKeys.MOONSHINE] > 0) {
            return effectKeys.SCORCH;
        }

        const simWither = simWithElement(
            elementalKeys.WITHER,
            actionKeys.LUNAR_SHED,
        );

        if (getEntityTotalHealth(simWither.entities[agentKey]) > 0) {
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

    const isExtraTurn = playerMap[agentKey].extra.includes(currPhase);

    let context = {
        prev,
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        hasManaForSpecial:
            getEntityTotalMana(agent) >=
            constants.SP_ATTACK_COST * agent[effectKeys.MAX_MANA],
        isExtraTurn,
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

    let newAgent = {
        ...agent,
        [effectKeys.ELEMENTAL_CRYSTALS]:
            translateElementIntoCrystals(selectedElement),
        stars: {
            ...agent.stars,
            ...assignedStars,
        },
    };

    let post = {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: newAgent,
        },
    };

    post = setConstellation(post, agentKey, selectedConstellation);

    context = {
        ...context,
        assignedStars,
        selectedElement,
        selectedConstellation,
        agent: post.entities[agentKey],
        prev: post,
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
        enemyHealthLost > getEntityMaxHealth(nonAgent) * 0.5 ||
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
        const simPromise = commitTurn(
            simulate(actionKeys.DARK_PROMISE),
            agentKey,
            nonAgentKey,
        );
        const simSpAtkPromise = processActionUse(
            processDeathCheck(processUpkeep(simPromise, nonAgentKey, agentKey)),
            nonAgentKey,
            agentKey,
            actionKeys.SPECIAL_ATTACK,
        );

        // if enemy dies by their next commit after they use an sp atk and we don't, use it
        if (
            willEntityEffectivelyDieByNextCommit(
                simSpAtkPromise,
                nonAgentKey,
                agentKey,
            ) &&
            !willEntityDieImmediately(simSpAtkPromise.entities[agentKey])
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
    const { prev, agent, agentKey, nonAgentKey, hasManaForSpecial } = context;
    const simulate = createSimulator(context);

    // Helper for selecting end of turn action
    function selectDefense() {
        const healWorth =
            agent[effectKeys.MANA] >= 5 &&
            getEntityTotalHealth(agent) <= getEntityMaxHealth(agent) * 0.5;

        if (
            agent.resources[effectKeys.RADIANCE] >
            0.5 * getEntityTotalHealth(agent)
        ) {
            return actionKeys.ATTACK;
        }

        if (healWorth) {
            return actionKeys.HEAL;
        }

        if (
            getEntityTotalMana(agent) +
                constants.GUARD_MANA_REGEN * agent[effectKeys.MAX_MANA] <=
                agent[effectKeys.MAX_MANA] &&
            canUseAction(prev, nonAgentKey, actionKeys.SPECIAL_ATTACK)
        ) {
            return actionKeys.GUARD;
        }

        if (getEntityDef(agent) > 5) {
            return actionKeys.AEGIS;
        }

        return actionKeys.GUARD;
    }

    // Thermal Overload -> Meltdown
    if (agent.states[effectKeys.THERMAL_OVERLOAD]) {
        return actionKeys.MELTDOWN;
    }

    // Simulate Attack
    // If it kills, use it
    const simAttack = simulate(actionKeys.ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(simAttack, nonAgentKey, agentKey)
    ) {
        return actionKeys.ATTACK;
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
        return selectDefense();
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
            return selectDefense();
        }
    }

    // 6. overheat > 30 and dynamo >= 70 and dynamo < 100 then
    if (
        agent[effectKeys.OVERHEAT] >= 30 &&
        agent[effectKeys.DYNAMO] >= 70 &&
        agent[effectKeys.DYNAMO] < 100
    ) {
        // use defense
        return selectDefense();
    }

    // 7. laser if can
    if (canUseAction(prev, agentKey, actionKeys.LASER)) {
        return actionKeys.LASER;
    }

    // defense fallback
    return selectDefense();
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

export function starfarerAI(context) {
    const { prev, nonAgentKey, agentKey, assignedStars, isExtraTurn } =
        context;

    function simulateActionStarfallHelper(action) {
        return simulateStarsHelper(
            commitTurn(
                processDeathCheck(
                    processActionUse(prev, agentKey, nonAgentKey, action),
                ),
                agentKey,
                nonAgentKey,
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

    const relevantActions = [
        actionKeys.SPECIAL_ATTACK,
        actionKeys.ATTACK,
        actionKeys.AEGIS,
        actionKeys.GUARD,
        actionKeys.HEAL,
        actionKeys.CHART,
    ];

    for (let action of relevantActions) {
        const sim = simulate(action);
        if (
            canUseAction(prev, agentKey, action) &&
            willEntityDieImmediately(sim.entities[nonAgentKey])
        ) {
            return action;
        }
    }

    // Death checks taking starfall into consideration
    for (let action of relevantActions) {
        if (!canUseAction(prev, agentKey, action)) {
            continue;
        }

        const sim = simulateActionStarfallHelper(action);

        if (
            !willEntityDieImmediately(sim.entities[agentKey]) &&
            willEntityEffectivelyDieByNextUpkeep(sim, nonAgentKey, agentKey)
        ) {
            return action;
        }

        // Singularity Check
        if (
            sim.entities[agentKey].states[effectKeys.EVENT_HORIZON] &&
            !isExtraTurn
        ) {
            const settedSim = setConstellation(
                sim,
                agentKey,
                selectConstellationAI(),
            );

            for (let subAction of relevantActions) {
                if (!canUseAction(settedSim, agentKey, subAction)) {
                    continue;
                }

                const newSim = simulate(subAction, { prev: settedSim });

                if (
                    !willEntityDieImmediately(sim.entities[agentKey]) &&
                    !willEntityDieImmediately(newSim.entities[agentKey]) &&
                    willEntityEffectivelyDieByNextUpkeep(
                        newSim,
                        nonAgentKey,
                        agentKey,
                    )
                ) {
                    return action;
                }
            }
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
            return actionKeys.LUNAR_GROWTH;
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
                (enemyHpStrike >= enemyHpAttack ||
                    (agent.resources[effectKeys.MOONSHINE] > 0 &&
                        enemyHpAttack > 0)) &&
                !willEntityEffectivelyDieByNextUpkeep(
                    simAttack,
                    nonAgentKey,
                    agentKey,
                )
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

export function augurAI(context) {
    const { agent, agentKey, nonAgentKey, nonAgent } = context;

    // === SIMULATIONS ===
    const simulate = createSimulator(context);
    const simAttack = simulate(actionKeys.ATTACK);
    const simSpAtk = simulate(actionKeys.SPECIAL_ATTACK);
    const simGuard = simulate(actionKeys.GUARD);
    const simHeal = simulate(actionKeys.HEAL);

    const simCurse = simulate(actionKeys.CURSE);
    const simCurseAttack = simulate(actionKeys.ATTACK, { prev: simCurse });
    const simCurseSpAtk = simulate(actionKeys.SPECIAL_ATTACK, {
        prev: simCurse,
    });
    // const simCurseGuard = simulate(actionKeys.GUARD, { prev: simCurse });
    const simCurseHeal = simulate(actionKeys.HEAL, { prev: simCurse });

    // === DEATH CHECKS ===
    const isAvailable = createAvailabilityChecker(context);
    const survivesCurse = !willEntityDieImmediately(
        simCurse.entities[agentKey],
    );

    // Special Attack
    if (
        isAvailable(actionKeys.SPECIAL_ATTACK) &&
        willEntityEffectivelyDieByNextUpkeep(simSpAtk, nonAgentKey, agentKey)
    ) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // Attack
    if (
        isAvailable(actionKeys.ATTACK) &&
        willEntityEffectivelyDieByNextUpkeep(simAttack, nonAgentKey, agentKey)
    ) {
        return actionKeys.ATTACK;
    }

    // Curse + Special Attack
    if (
        isAvailable(actionKeys.CURSE) &&
        isAvailable(actionKeys.SPECIAL_ATTACK, { prev: simCurse }) &&
        survivesCurse &&
        willEntityEffectivelyDieByNextUpkeep(
            simCurseSpAtk,
            nonAgentKey,
            agentKey,
        )
    ) {
        return actionKeys.CURSE;
    }

    // Curse + Attack
    if (
        isAvailable(actionKeys.CURSE) &&
        isAvailable(actionKeys.ATTACK, { prev: simCurse }) &&
        survivesCurse &&
        willEntityEffectivelyDieByNextUpkeep(
            simCurseAttack,
            nonAgentKey,
            agentKey,
        )
    ) {
        return actionKeys.CURSE;
    }

    // === General Logic ===

    // Enter Visionary
    if (isAvailable(actionKeys.CARVE) && !agent.states[effectKeys.VISIONARY]) {
        return actionKeys.CARVE;
    }

    // Survivability
    const getEffectiveHeal = (sim) => {
        const entity = sim.entities[agentKey];
        return (
            getEntityTotalHealth(entity) +
            entity.resources[effectKeys.CONJECTURE]
        );
    };

    if (getEntityTotalHealth(agent) < getEntityMaxHealth(agent) * 0.5) {
        const healEffect = getEffectiveHeal(simHeal);
        const curseHealEffect = getEffectiveHeal(simCurseHeal);

        if (
            curseHealEffect > healEffect &&
            curseHealEffect >= 5 &&
            isAvailable(actionKeys.CURSE) &&
            isAvailable(actionKeys.HEAL, { prev: simCurse }) &&
            survivesCurse
        ) {
            return actionKeys.CURSE;
        } else if (healEffect >= 5 && isAvailable(actionKeys.HEAL)) {
            return actionKeys.HEAL;
        } else if (isAvailable(actionKeys.GUARD)) {
            return actionKeys.GUARD;
        }
    }

    // Offensive Pressure
    const dealtGoodDmg = (sim) => {
        const enemyTrueHealth =
            getEntityTotalHealth(nonAgent) +
            consumeMitigationResources(nonAgent, Infinity)
                .mitigationResourcesConsumed
                .totalMitigationResourcesConsumption;
        const simEnemy = sim.entities[nonAgentKey];
        const enemyTrueHealthPostSim =
            getEntityTotalHealth(simEnemy) +
            consumeMitigationResources(simEnemy, Infinity)
                .mitigationResourcesConsumed
                .totalMitigationResourcesConsumption;

        const dmgDealt = enemyTrueHealth - enemyTrueHealthPostSim;

        return dmgDealt >= enemyTrueHealth * 0.5;
    };

    const getDmgDealt = (sim) => {
        const enemyTrueHealth =
            getEntityTotalHealth(nonAgent) +
            consumeMitigationResources(nonAgent, Infinity)
                .mitigationResourcesConsumed
                .totalMitigationResourcesConsumption;
        const simEnemy = sim.entities[nonAgentKey];
        const enemyTrueHealthPostSim =
            getEntityTotalHealth(simEnemy) +
            consumeMitigationResources(simEnemy, Infinity)
                .mitigationResourcesConsumed
                .totalMitigationResourcesConsumption;

        return enemyTrueHealth - enemyTrueHealthPostSim;
    };

    const willTriggerHeal = (sim) => {
        return (
            getEntityTotalHealth(sim.entities[agentKey]) <
            getEntityMaxHealth(sim.entities[agentKey]) * 0.5
        );
    };

    const spAtkDmgDealt = getDmgDealt(simSpAtk);
    const curseSpAtkDmgDealt = getDmgDealt(simCurseSpAtk);

    // Curse + Sp Atk
    if (
        dealtGoodDmg(simCurseSpAtk) &&
        survivesCurse &&
        isAvailable(actionKeys.CURSE) &&
        isAvailable(actionKeys.SPECIAL_ATTACK, { prev: simCurse }) &&
        curseSpAtkDmgDealt > spAtkDmgDealt &&
        !willTriggerHeal(simCurse)
    ) {
        return actionKeys.CURSE;
    }

    // Sp Atk
    if (dealtGoodDmg(simSpAtk) && isAvailable(actionKeys.SPECIAL_ATTACK)) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // Self Buff
    // Worth using if current DEF >= STR and RECOLLECTION isn't full
    if (
        agent[effectKeys.RECOLLECTION] < constants.MAX_RECOLLECTION &&
        getEntityDef(agent) >= getEntityStr(agent) &&
        isAvailable(actionKeys.GUARD)
    ) {
        return actionKeys.GUARD;
    }

    // Damage Pressure
    if (
        curseSpAtkDmgDealt > spAtkDmgDealt &&
        survivesCurse &&
        isAvailable(actionKeys.CURSE) &&
        isAvailable(actionKeys.SPECIAL_ATTACK, { prev: simCurse }) &&
        !willTriggerHeal(simCurse)
    ) {
        return actionKeys.CURSE;
    }

    if (isAvailable(actionKeys.SPECIAL_ATTACK)) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // Mana Economy
    const getEffectiveRestore = (sim) => {
        const entity = sim.entities[agentKey];
        const currMana =
            getEntityTotalMana(agent) +
            agent.resources[effectKeys.CONJECTURE] +
            agent.resources[effectKeys.PRECOGNITION];
        return (
            getEntityTotalMana(entity) +
            entity.resources[effectKeys.CONJECTURE] +
            entity.resources[effectKeys.PRECOGNITION] -
            currMana
        );
    };

    const guardRestore = getEffectiveRestore(simGuard);
    const healRestore = getEffectiveRestore(simHeal);
    const curseHealRestore = getEffectiveRestore(simCurseHeal);

    if (
        curseHealRestore > healRestore &&
        curseHealRestore > guardRestore &&
        survivesCurse &&
        isAvailable(actionKeys.CURSE) &&
        isAvailable(actionKeys.HEAL, { prev: simCurse })
    ) {
        return actionKeys.CURSE;
    } else if (healRestore > guardRestore && isAvailable(actionKeys.HEAL)) {
        return actionKeys.HEAL;
    } else if (isAvailable(actionKeys.GUARD)) {
        return actionKeys.GUARD;
    }

    // Fallback: Guard
    return actionKeys.GUARD;
}
