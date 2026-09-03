import {
    coloredStars,
    constants,
    FREE_ACTIONS,
    playerMap,
    presetAi,
} from "./constants.js";
import {
    canUseAction,
    canUseCombatInteractions,
    consumeMitigationResources,
    consumeResources,
    countBlasphemies,
    createBaseEntity,
    expungeBlas,
    extractEntity,
    getBenediction,
    getDisgrace,
    getEntityDef,
    getEntityDefPen,
    getEntityMaxHealth,
    getEntityStr,
    getEntityTotalHealth,
    getEntityTotalMana,
    getEntityUsableStars,
    getFortitude,
    getGrace,
    getMalediction,
    getMaxEnlit,
    getProvForVirtues,
    getRevelation,
    getTotalEnlit,
    isEdictUnlocked,
    isElementActive,
    isEntityDead,
    newDealDmg,
    processDeathCheck,
    processHealth,
    replaceEntity,
    restoreResources,
    translateElementIntoCrystals,
} from "./entities.js";
import {
    actionKeys,
    aiKeys,
    blasphemyKeys,
    choirKeys,
    commandKeys,
    edictKeys,
    effectKeys,
    elementalKeys,
    entityKeys,
    entryTypes,
    moonKeys,
    tarnishTypes,
} from "./enums.js";
import { simulateFullStarfall } from "./starfall.js";
import {
    commitTurn,
    processActionUse,
    processExtraTurn,
    processMoonPhase,
    processPlan,
    processUpkeep,
} from "./turnManagement.js";

const EDICT_LIST = Object.values(edictKeys);
const EDICT_PERMUTATION_CACHE = {};

// Central router
export async function centralAIManagement(
    prev,
    agentKey,
    nonAgentKey,
    commandOverride = null,
) {
    let post = {
        ...prev,
    };

    let command = commandOverride ? commandOverride : post?.aiQueue?.[0];
    let newQueue = [];

    if (command?.field === null || command?.field === undefined) {
        command = null;
    } else {
        newQueue = post.aiQueue.slice(1);
    }

    // Overrides
    if (extractEntity(prev, agentKey).states[effectKeys.ANOINTED_PROXY]) {
        command = {
            type: commandKeys.USE_ACTION,
            field: actionKeys.JUDGEMENT,
        };
    }

    switch (command?.type) {
        case commandKeys.USE_ACTION: {
            // Use Action
            const currPhase =
                post.roundQueue && post.roundQueue[post.roundIndex];
            const isExtraTurn = playerMap[agentKey].extra.includes(currPhase);

            const action = command.field;

            post = processActionUse(post, agentKey, nonAgentKey, action);

            post = isExtraTurn
                ? processExtraTurn(post, agentKey, action)
                : processPlan(post, agentKey, action);
            break;
        }
        case commandKeys.EXPUNGE_BLAS: {
            let draftEntity = extractEntity(post, agentKey);

            const oldCodex = draftEntity?.[effectKeys.CODEX_OF_BLASPHEMY] || [];
            const blas = oldCodex?.[command?.field];

            if (!blas || blas === blasphemyKeys.NONE) {
                break;
            }

            const remaining = oldCodex.filter(
                (item, i) =>
                    i !== command?.field && item !== blasphemyKeys.NONE,
            );

            const newCodex = [
                remaining[2] || blasphemyKeys.NONE,
                remaining[1] || blasphemyKeys.NONE,
                remaining[0] || blasphemyKeys.NONE,
            ];

            draftEntity = {
                ...draftEntity,
                [effectKeys.CODEX_OF_BLASPHEMY]: newCodex,
            };

            post = replaceEntity(post, draftEntity, agentKey);
            post = expungeBlas(post, agentKey, nonAgentKey, blas);

            break;
        }
        case commandKeys.SET_CONSTELLATION: {
            let draftAgent = setConstellation(
                extractEntity(post, agentKey),
                command.field,
            );
            post = replaceEntity(post, draftAgent, agentKey);

            break;
        }
        case commandKeys.USE_CELESTIAL_STARS: {
            if (command.field === effectKeys.STARS_OF_APOCALYPSE) {
                const draftAgent = extractEntity(post, agentKey);

                const starsUsed = Math.max(
                    0,
                    Math.min(
                        draftAgent[effectKeys.STARS_OF_APOCALYPSE],
                        getTotalEnlit(draftAgent) - 1,
                    ),
                );

                if (starsUsed <= 0) {
                    break;
                }

                post = newDealDmg(
                    post,
                    starsUsed,
                    [entityKeys.PLAYER_ONE, entityKeys.PLAYER_TWO],
                    tarnishTypes.TRUE,
                );
            }

            if (command.field === effectKeys.STARS_OF_GENESIS) {
                let draftAgent = extractEntity(post, agentKey);
                let draftNonAgent = extractEntity(post, nonAgentKey);

                const starsUsed = draftAgent[effectKeys.STARS_OF_GENESIS];

                if (starsUsed <= 0) {
                    break;
                }

                draftAgent = restoreResources(draftAgent, starsUsed);
                draftNonAgent = restoreResources(draftNonAgent, starsUsed);

                post = replaceEntity(post, draftAgent, agentKey);
                post = replaceEntity(post, draftNonAgent, nonAgentKey);
            }

            break;
        }
        case commandKeys.SET_ELEMENT: {
            let draftAgent = extractEntity(post, agentKey);
            if (
                !isElementActive(draftAgent, elementalKeys.SHATTERED) &&
                draftAgent.states[effectKeys.SELENIAN]
            ) {
                // Translate combined elements into their base crystal components
                const crystals = translateElementIntoCrystals(command.field);

                draftAgent = {
                    ...draftAgent,
                    [effectKeys.ELEMENTAL_CRYSTALS]: crystals,
                };

                // Run processHealth
                draftAgent = processHealth(draftAgent);

                post = replaceEntity(post, draftAgent, agentKey);
            }
            break;
        }
        case commandKeys.SET_EDICTS: {
            let draftAgent = extractEntity(post, agentKey);

            if (draftAgent.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
                for (let edict of Object.entries(command.field)) {
                    if (isEdictUnlocked(draftAgent, edict[0])) {
                        draftAgent = {
                            ...draftAgent,
                            edicts: {
                                ...draftAgent.edicts,
                                [edict[0]]: edict[1],
                            },
                        };
                    }
                }
            }

            post = replaceEntity(post, draftAgent, agentKey);

            break;
        }
        case commandKeys.ASSIGN_STARS: {
            let draftAgent = extractEntity(post, agentKey);

            // Process Stars
            const colors = Object.values(coloredStars).map((starType) => {
                return starType.star;
            });

            const currentStars = draftAgent?.stars ?? createBaseEntity().stars;

            // Convert all active colored stars back to the white star pool
            let returnedToWhite = 0;
            colors.forEach((color) => {
                returnedToWhite += currentStars[color];
            });

            let newWhite =
                currentStars[effectKeys.WHITE_STAR] + returnedToWhite;

            // Create reset stars state
            let newStars = {
                ...currentStars,
                [effectKeys.WHITE_STAR]: newWhite,
            };

            colors.forEach((color) => {
                newStars = {
                    ...newStars,
                    [color]: 0,
                };
            });

            colors.forEach((color) => {
                const amount = command.field[color];

                const actualAllocated = Math.min(
                    newStars[effectKeys.WHITE_STAR],
                    amount,
                );

                newStars = {
                    ...newStars,
                    [effectKeys.WHITE_STAR]:
                        newStars[effectKeys.WHITE_STAR] - actualAllocated,
                    [color]: newStars[color] + actualAllocated,
                };
            });

            draftAgent = {
                ...draftAgent,
                stars: newStars,
            };

            post = replaceEntity(post, draftAgent, agentKey);
            break;
        }
        default: {
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

            let caller = presetAi?.[agent?.controller]?.caller || simpleAI;
            let newAgent = extractEntity(post, agentKey);

            switch (agent?.controller) {
                case aiKeys.VOYAGER: {
                    // Process Stars
                    const assignedStars = assignStarsAI(context);
                    // Process Constellation
                    const selectedConstellation =
                        selectConstellationAI(context);

                    if (assignedStars) {
                        newQueue = [
                            ...newQueue,
                            {
                                type: commandKeys.ASSIGN_STARS,
                                field: assignedStars,
                            },
                        ];

                        newAgent = {
                            ...newAgent,
                            stars: {
                                ...agent.stars,
                                ...assignedStars,
                            },
                        };
                    }

                    if (selectedConstellation) {
                        newQueue = [
                            ...newQueue,
                            {
                                type: commandKeys.SET_CONSTELLATION,
                                field: selectedConstellation,
                            },
                        ];

                        newAgent = setConstellation(
                            newAgent,
                            selectedConstellation,
                        );
                    }

                    context = {
                        ...context,
                        assignedStars:
                            assignedStars ?? createBaseEntity().stars,
                        selectedConstellation:
                            selectedConstellation ?? effectKeys.CONSTELLATION,
                        agent: newAgent,
                        prev: replaceEntity(post, newAgent, agentKey),
                    };

                    // Calculate action
                    let action = caller(context);

                    if (action) {
                        newQueue = [
                            ...newQueue,
                            {
                                type: commandKeys.USE_ACTION,
                                field: action,
                            },
                        ];
                    }

                    break;
                }
                case aiKeys.LUNATIC: {
                    // Process Element
                    const selectedElement = selectElementAI(context);

                    if (selectedElement) {
                        newQueue = [
                            ...newQueue,
                            {
                                type: commandKeys.SET_ELEMENT,
                                field: selectedElement,
                            },
                        ];
                    }

                    if (selectedElement) {
                        newAgent = {
                            ...newAgent,
                            [effectKeys.ELEMENTAL_CRYSTALS]:
                                translateElementIntoCrystals(selectedElement),
                        };
                    }

                    context = {
                        ...context,
                        selectedElement:
                            selectedElement ?? elementalKeys.DULLED,
                        agent: newAgent,
                        prev: replaceEntity(post, newAgent, agentKey),
                    };

                    // Calculate action
                    let action = caller(context);

                    if (action) {
                        newQueue = [
                            ...newQueue,
                            {
                                type: commandKeys.USE_ACTION,
                                field: action,
                            },
                        ];
                    }

                    break;
                }
                case aiKeys.SERAPH: {
                    const aiResults = await seraphAI(context);

                    if (!aiResults || agent.states[effectKeys.UMBRAL_CORE]) {
                        let action = shadowSorcererAI(context);

                        if (action) {
                            newQueue = [
                                ...newQueue,
                                {
                                    type: commandKeys.USE_ACTION,
                                    field: action,
                                },
                            ];
                        }

                        break;
                    }

                    newQueue = Array.isArray(aiResults)
                        ? aiResults
                        : [aiResults];

                    break;
                }
                default: {
                    // Calculate action
                    let action = caller(context);

                    if (action) {
                        newQueue = [
                            ...newQueue,
                            {
                                type: commandKeys.USE_ACTION,
                                field: action,
                            },
                        ];
                    }
                }
            }
        }
    }

    post = {
        ...post,
        aiQueue: newQueue,
    };

    return processDeathCheck(post);
}

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

function getEffectiveHealth(entity) {
    const mit = consumeMitigationResources(entity, Infinity)
        .mitigationResourcesConsumed.totalMitigationResourcesConsumption;
    return getTotalEnlit(entity) + getEntityTotalHealth(entity) + mit;
}

function getEffectiveMaxHealth(entity) {
    return getMaxEnlit(entity) + getEntityMaxHealth(entity);
}

function getEdictPermutations(edictNum) {
    if (EDICT_PERMUTATION_CACHE[edictNum]) {
        return EDICT_PERMUTATION_CACHE[edictNum];
    }

    const count = 1 << edictNum;
    const permutations = new Array(count);

    for (let i = 0; i < count; i++) {
        const edictObj = createBaseEntity().edicts;
        for (let bit = 0; bit < edictNum; bit++) {
            if (i & (1 << bit)) {
                edictObj[EDICT_LIST[bit]] = true;
            }
        }
        permutations[i] = { mask: i, edicts: edictObj };
    }

    EDICT_PERMUTATION_CACHE[edictNum] = permutations;
    return permutations;
}

function getAgentEdictMask(agent, edictNum) {
    let mask = 0;
    const edicts = agent?.edicts ?? {};
    for (let bit = 0; bit < edictNum; bit++) {
        if (edicts[EDICT_LIST[bit]]) {
            mask |= 1 << bit;
        }
    }
    return mask;
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
    if (entity[effectKeys.TARNISHED_SIN] >= constants.MAX_SIN) {
        return true;
    }

    return isEntityDead(entity);
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

export function setConstellation(entity, constellation) {
    const totalConst =
        entity[effectKeys.CONSTELLATION] +
        entity[effectKeys.AZURE_CONSTELLATION] +
        entity[effectKeys.CRIMSON_CONSTELLATION];

    return {
        ...entity,
        [effectKeys.CONSTELLATION]:
            constellation === effectKeys.CONSTELLATION ? totalConst : 0,
        [effectKeys.AZURE_CONSTELLATION]:
            constellation === effectKeys.AZURE_CONSTELLATION ? totalConst : 0,
        [effectKeys.CRIMSON_CONSTELLATION]:
            constellation === effectKeys.CRIMSON_CONSTELLATION ? totalConst : 0,
    };
}

// Select Constellation
export function selectConstellationAI(context) {
    const { agent } = context;

    if (
        agent[effectKeys.CONSTELLATION] <= 0 &&
        agent[effectKeys.AZURE_CONSTELLATION] <= 0 &&
        agent[effectKeys.CRIMSON_CONSTELLATION] <= 0
    ) {
        return null;
    }

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

    // Early return if no stars or during singularity or not in Stargazer
    if (
        remainingWhite <= 0 ||
        isExtraTurn ||
        !agent.states[effectKeys.STARGAZER]
    ) {
        return null;
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
                getEntityDef(sim.entities[nonAgentKey]),
                -getEntityDefPen(sim, agentKey),
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
                simStar = replaceEntity(
                    simStar,
                    setConstellation(
                        extractEntity(simStar, agentKey),
                        effectKeys.CRIMSON_CONSTELLATION,
                    ),
                    agentKey,
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

    // If not on Selenian, cancel
    if (!agent.states[effectKeys.SELENIAN]) {
        return null;
    }

    // If shattered, return shattered
    if (isElementActive(agent, elementalKeys.SHATTERED)) {
        return elementalKeys.SHATTERED;
    }

    const maxHealthNature = getEntityMaxHealth({
        ...agent,
        [effectKeys.ELEMENTAL_CRYSTALS]: translateElementIntoCrystals(
            elementalKeys.NATURE,
        ),
    });

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
        getEffectiveMaxHealth(nonAgent) -
        getEffectiveMaxHealth(chalkSim.entities[nonAgentKey]);

    if (chalkDamage >= getEffectiveMaxHealth(nonAgent) * 0.5) {
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
        getEffectiveHealth(nonAgent) -
        getEffectiveHealth(simAttack.entities[nonAgentKey]);

    if (
        enemyHealthLost > getEffectiveMaxHealth(nonAgent) * 0.5 ||
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
    const { prev, agent, agentKey, nonAgentKey, nonAgent, hasManaForSpecial } =
        context;

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
            ) &&
            !willEntityEffectivelyDie(extractEntity(simMayhem, agentKey))
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
            !willEntityDieImmediately(simSpAtkPromise.entities[agentKey]) &&
            !willEntityDieImmediately(simPromise.entities[agentKey]) &&
            !nonAgent.states[effectKeys.ASCENDENCE_OF_SPIRIT]
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
            } else {
                return actionKeys.RITUAL_OF_ASH;
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
    const {
        prev,
        nonAgentKey,
        agentKey,
        assignedStars,
        isExtraTurn,
        selectedConstellation,
    } = context;

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
            const settedSim = replaceEntity(
                sim,
                setConstellation(
                    extractEntity(sim, agentKey),
                    selectedConstellation,
                ),
                agentKey,
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

            const enemyHpStrike = getEffectiveHealth(
                simStrike.entities[nonAgentKey],
            );
            const enemyHpAttack = getEffectiveHealth(
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
        const enemyTrueHealth = getEffectiveHealth(nonAgent);
        const simEnemy = sim.entities[nonAgentKey];
        const enemyTrueHealthPostSim = getEffectiveHealth(simEnemy);

        const dmgDealt = enemyTrueHealth - enemyTrueHealthPostSim;

        return dmgDealt >= enemyTrueHealth * 0.5;
    };

    const getDmgDealt = (sim) => {
        const enemyTrueHealth = getEffectiveHealth(nonAgent);
        const simEnemy = sim.entities[nonAgentKey];
        const enemyTrueHealthPostSim = getEffectiveHealth(simEnemy);

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

export async function seraphAI(context) {
    const { prev, agent, agentKey, nonAgentKey } = context;

    const actionAvailable = createAvailabilityChecker(context);

    // Helper for building action array
    const buildAction = (action, command = commandKeys.USE_ACTION) => {
        return {
            type: command,
            field: action,
        };
    };

    // On Cutoff Wings, skip
    if (agent?.states[effectKeys.CUTOFF_WINGS]) {
        return null;
    }

    // On Zenith, use Ascend
    if (
        agent?.states[effectKeys.ZENITH_OF_MORTALITY] &&
        actionAvailable(actionKeys.ASCEND)
    ) {
        return buildAction(actionKeys.ASCEND);
    }

    // If not on Ascendence, build for Ascend
    if (!agent.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        // Use Rise if available
        if (actionAvailable(actionKeys.RISE)) {
            return buildAction(actionKeys.RISE);
        }

        // Use Ascend if high enough on Spark
        const threshold = Math.min(
            getEntityDef(agent) *
                (13 - prev.roundCount - agent.attributes.str.points),
            constants.MAX_DIVINE_SPARK,
        );

        if (
            agent[effectKeys.DIVINE_SPARK] >= threshold &&
            actionAvailable(actionKeys.ASCEND)
        ) {
            return buildAction(actionKeys.ASCEND);
        }

        // default: Aegis
        return buildAction(actionKeys.AEGIS);
    }

    // === Ascendence ===

    // Helper for calculating score
    const rateSim = (sim) => {
        let simPostCommit = commitTurn(sim, agentKey, nonAgentKey);
        let postSim = processUpkeep(simPostCommit, agentKey, nonAgentKey);

        const tempAgent = extractEntity(postSim, agentKey);
        const tempNonAgent = extractEntity(postSim, nonAgentKey);

        // Lowest score on lose
        if (
            willEntityEffectivelyDie(tempAgent) ||
            willEntityEffectivelyDie(extractEntity(simPostCommit, agentKey)) ||
            willEntityEffectivelyDie(extractEntity(sim, agentKey))
        ) {
            return -Infinity;
        }

        // Highest score on win
        if (willEntityEffectivelyDie(tempNonAgent)) {
            return Infinity;
        }

        let score = 0;

        score += -tempAgent[effectKeys.TARNISHED_SIN]; // Lose score by sin on self
        score += tempNonAgent[effectKeys.TARNISHED_SIN]; // Gain score for sin on the opponent
        score += postSim.btt[effectKeys.PROVIDENCE]; // Gain score for prov in the battlefield

        const missingEnlitPercent =
            Math.max(0, getMaxEnlit(tempAgent) - getTotalEnlit(tempAgent)) /
            getMaxEnlit(tempAgent);
        score -= missingEnlitPercent * 100; // lose score for missing enlit on self

        score -= tempAgent[effectKeys.STARS_OF_APOCALYPSE] * 5; // lose score for having stars of apoc on self (disgrace debuff)

        score += getGrace(simPostCommit, agentKey) * 0.5; // gain score for having grace on turn end
        score -= getDisgrace(simPostCommit, agentKey) * 0.5; // lose score for having disgrace on turn end

        score -=
            Math.max(0, tempAgent.resources[effectKeys.SACRED_FLAMES] - 10) *
            2.5; // lose points for having high flames

        return score;
    };

    // Helper for checking edict/command combination relevancy
    const isRelevantCombination = (sim, edicts, command) => {
        if (!command) {
            return false;
        }

        const prov = sim?.btt?.[effectKeys.PROVIDENCE] ?? 0;
        let draftAgent = extractEntity(sim, agentKey);

        // === Condemn ===

        // Skip at low Revelation
        if (
            edicts[edictKeys.VIRTUES] &&
            command.field === actionKeys.CONDEMN &&
            getRevelation(sim, agentKey) <= 5
        ) {
            return false;
        }

        // === Supplicate ===

        // Skip at high health (if Pricipalities is available and not being used)
        if (
            edicts[edictKeys.VIRTUES] &&
            command.field === actionKeys.SUPPLICATE &&
            !edicts[edictKeys.PRINCIPALITIES] &&
            isEdictUnlocked(draftAgent, edictKeys.PRINCIPALITIES) &&
            getMaxEnlit(draftAgent) <= getTotalEnlit(draftAgent)
        ) {
            return false;
        }

        // Skip at low Fortitude
        if (
            edicts[edictKeys.VIRTUES] &&
            command.field === actionKeys.SUPPLICATE &&
            getFortitude(sim, agentKey) < 10
        ) {
            return false;
        }

        // Skip Sanctuary if we have used Discern
        if (
            edicts[edictKeys.VIRTUES] &&
            edicts[edictKeys.PRINCIPALITIES] &&
            command.field === actionKeys.SUPPLICATE &&
            draftAgent.resources[effectKeys.INSPIRATION] > 0
        ) {
            return false;
        }

        // === Discern ===

        // Skip at low Providence (if not using Dominions)
        if (
            edicts[edictKeys.VIRTUES] &&
            command.field === actionKeys.DISCERN &&
            !edicts[edictKeys.DOMINIONS] &&
            prov < 50
        ) {
            return false;
        }

        // === Angels ===

        // Always on with Condemn, unless at low health
        if (
            !edicts[edictKeys.ANGELS] &&
            isEdictUnlocked(draftAgent, edictKeys.ANGELS) &&
            command.field === actionKeys.CONDEMN &&
            getTotalEnlit(draftAgent) >=
                Math.ceil(getMaxEnlit(draftAgent) * 0.3)
        ) {
            return false;
        }

        // Always off if not Condemn
        if (edicts[edictKeys.ANGELS] && command.field !== actionKeys.CONDEMN) {
            return false;
        }

        // === Archangels ===

        // Always on
        if (
            !edicts[edictKeys.ARCHANGELS] &&
            isEdictUnlocked(draftAgent, edictKeys.ARCHANGELS)
        ) {
            return false;
        }

        // === Principalities ===

        // Always on, unless we're using Supplicate
        if (
            !edicts[edictKeys.PRINCIPALITIES] &&
            isEdictUnlocked(draftAgent, edictKeys.PRINCIPALITIES) &&
            command.field !== actionKeys.SUPPLICATE
        ) {
            return false;
        }

        // === Powers ===

        // Must be disabled if not using Discern
        if (edicts[edictKeys.POWERS] && command.field !== actionKeys.DISCERN) {
            return false;
        }

        // Must be disabled at low Providence
        if (edicts[edictKeys.POWERS] && prov < constants.POWERS_RATE) {
            return false;
        }

        // Must be disabled at high flames
        if (
            edicts[edictKeys.POWERS] &&
            draftAgent.resources[effectKeys.SACRED_FLAMES] >=
                getMaxEnlit(draftAgent) * 0.5
        ) {
            return false;
        }

        // === Virtues ===

        // Must be disabled if at less than enough providence
        if (
            edicts[edictKeys.VIRTUES] &&
            getProvForVirtues(sim, agentKey) > prov
        ) {
            return false;
        }

        // === Dominions ===

        // If Echoes different from 0, Dominions must be enabled (if Dominions is unlocked)
        const echoes = draftAgent[effectKeys.HALLOWED_ECHOES];
        if (
            !edicts[edictKeys.DOMINIONS] &&
            isEdictUnlocked(draftAgent, edictKeys.DOMINIONS) &&
            echoes !== 0
        ) {
            return false;
        }

        // If Dominions is enabled...
        if (edicts[edictKeys.DOMINIONS]) {
            // Does not use Condemn on positive echoes
            if (command?.field === actionKeys.CONDEMN && echoes > 0) {
                return false;
            }

            // Does not use Supplicate on negative echoes
            if (command?.field === actionKeys.SUPPLICATE && echoes < 0) {
                return false;
            }

            // Does not use Discern on zero echoes
            if (command?.field === actionKeys.DISCERN && echoes === 0) {
                return false;
            }

            // Does not use Discern on negative echoes if not our final action
            if (
                !edicts[edictKeys.VIRTUES] &&
                command?.field === actionKeys.DISCERN &&
                echoes < 0
            ) {
                return false;
            }
        }

        // Thrones

        // // If it's unlocked and we have missing runes, it must be enabled
        if (
            !edicts[edictKeys.THRONES] &&
            isEdictUnlocked(draftAgent, edictKeys.THRONES) &&
            countBlasphemies(
                draftAgent?.[effectKeys.CODEX_OF_BLASPHEMY],
                blasphemyKeys.NONE,
            ) > 0
        ) {
            return false;
        }

        // If we're full, it must be disabled
        if (
            edicts[edictKeys.THRONES] &&
            countBlasphemies(
                draftAgent?.[effectKeys.CODEX_OF_BLASPHEMY],
                blasphemyKeys.NONE,
            ) <= 0
        ) {
            return false;
        }

        // === Cherubim ===

        // Always on
        if (
            !edicts[edictKeys.CHERUBIM] &&
            isEdictUnlocked(draftAgent, edictKeys.CHERUBIM)
        ) {
            return false;
        }

        // === Seraphim ===

        // Must disable Seraphim if not using condemn and not the last action
        if (
            edicts[edictKeys.VIRTUES] &&
            edicts[edictKeys.SERAPHIM] &&
            command.field !== actionKeys.CONDEMN
        ) {
            return false;
        }

        // If Seraphim is unlocked, check which one deals more dmg and blocks the other
        if (
            isEdictUnlocked(draftAgent, edictKeys.SERAPHIM) &&
            command.field === actionKeys.CONDEMN
        ) {
            draftAgent = {
                ...draftAgent,
                edicts: {
                    ...edicts,
                    [edictKeys.SERAPHIM]: true,
                },
            };

            let tempSim = replaceEntity(sim, draftAgent, agentKey);

            const d1 =
                100 *
                getMalediction(tempSim, agentKey) *
                getBenediction(tempSim, agentKey);

            draftAgent = {
                ...draftAgent,
                edicts: {
                    ...edicts,
                    [edictKeys.SERAPHIM]: false,
                },
            };

            tempSim = replaceEntity(sim, draftAgent, agentKey);

            const d2 =
                100 *
                getMalediction(tempSim, agentKey) *
                getBenediction(tempSim, agentKey);

            if (d1 >= d2 && !edicts[edictKeys.SERAPHIM]) {
                return false;
            }

            if (d2 > d1 && edicts[edictKeys.SERAPHIM]) {
                return false;
            }
        }

        return true;
    };

    const edictNumMap = {
        [choirKeys.NONE]: 0,
        [choirKeys.FIRST]: 1,
        [choirKeys.SECOND]: 2,
        [choirKeys.THIRD]: 3,
        [choirKeys.FOURTH]: 4,
        [choirKeys.FIFTH]: 5,
        [choirKeys.SIXTH]: 6,
        [choirKeys.SEVENTH]: 7,
        [choirKeys.EIGHTH]: 8,
        [choirKeys.NINTH]: 9,
    };

    const edictNum = edictNumMap?.[agent?.[entryTypes.HEAVENLY_CHOIR]] ?? 0;

    const actionCommands = [
        {
            type: commandKeys.USE_ACTION,
            field: actionKeys.SUPPLICATE,
        },
        {
            type: commandKeys.USE_ACTION,
            field: actionKeys.DISCERN,
        },
        {
            type: commandKeys.USE_ACTION,
            field: actionKeys.CONDEMN,
        },
    ];

    const evaluatePath = async (
        sim,
        commandArray,
        depth = 0,
        nodeTracker = { count: 0 },
        oldBestScore = null,
    ) => {
        let best = {
            score: oldBestScore ? oldBestScore : rateSim(sim),
            commandArray,
        };

        if (depth > 10) {
            console.error("Max Depth reached in Seraph AI");
            return best;
        }

        if (!canUseCombatInteractions(sim, agentKey, true, false)) {
            return best;
        }

        const currentAgent = extractEntity(sim, agentKey);

        const simActionAvailable = createAvailabilityChecker({
            agentKey,
            prev: sim,
        });

        // Judgment Override
        if (simActionAvailable(actionKeys.JUDGEMENT)) {
            const commandSim = await centralAIManagement(
                sim,
                agentKey,
                nonAgentKey,
                buildAction(actionKeys.JUDGEMENT),
            );

            const newScore = rateSim(commandSim);

            if (newScore !== -Infinity) {
                return {
                    score: Infinity,
                    commandArray: [
                        ...commandArray,
                        buildAction(actionKeys.JUDGEMENT),
                    ],
                };
            }
        }

        let loop = 0;
        while (loop < 7) {
            // Genesis Stars
            if (currentAgent?.[effectKeys.STARS_OF_GENESIS] > 0) {
                sim = await centralAIManagement(sim, agentKey, nonAgentKey, {
                    type: commandKeys.USE_CELESTIAL_STARS,
                    field: effectKeys.STARS_OF_GENESIS,
                });

                commandArray = [
                    ...commandArray,
                    {
                        type: commandKeys.USE_CELESTIAL_STARS,
                        field: effectKeys.STARS_OF_GENESIS,
                    },
                ];

                loop += 1;
                continue;
            }

            // Blasphemies
            if (
                getTotalEnlit(currentAgent) >
                getMaxEnlit(currentAgent) * constants.BLAS_TARNISH
            ) {
                // Yesterday
                if (
                    countBlasphemies(
                        currentAgent?.[effectKeys.CODEX_OF_BLASPHEMY],
                        blasphemyKeys.YESTERDAY,
                    ) > 0
                ) {

                    // Use if Enlightenment after use <= 50%
                    if (
                        getTotalEnlit(currentAgent) -
                            getMaxEnlit(currentAgent) *
                                constants.BLAS_TARNISH <=
                        getMaxEnlit(currentAgent) * 0.5
                    ) {
                        const index = currentAgent?.[
                            effectKeys.CODEX_OF_BLASPHEMY
                        ].indexOf(blasphemyKeys.YESTERDAY);

                        if (index !== -1) {
                            console.log("test")
                            sim = await centralAIManagement(
                                sim,
                                agentKey,
                                nonAgentKey,
                                {
                                    type: commandKeys.EXPUNGE_BLAS,
                                    field: index,
                                },
                            );

                            commandArray = [
                                ...commandArray,
                                {
                                    type: commandKeys.EXPUNGE_BLAS,
                                    field: index,
                                },
                            ];

                            loop += 1;
                            continue;
                        }
                    }
                }

                // Today
                if (
                    countBlasphemies(
                        currentAgent?.[effectKeys.CODEX_OF_BLASPHEMY],
                        blasphemyKeys.TODAY,
                    ) > 0
                ) {
                    // Use if Providence >= 50%
                    if (sim.btt[effectKeys.PROVIDENCE] >= 50) {
                        const index = currentAgent?.[
                            effectKeys.CODEX_OF_BLASPHEMY
                        ].indexOf(blasphemyKeys.TOMORROW);

                        if (index !== -1) {
                            sim = await centralAIManagement(
                                sim,
                                agentKey,
                                nonAgentKey,
                                {
                                    type: commandKeys.EXPUNGE_BLAS,
                                    field: index,
                                },
                            );

                            commandArray = [
                                ...commandArray,
                                {
                                    type: commandKeys.EXPUNGE_BLAS,
                                    field: index,
                                },
                            ];

                            loop += 1;
                            continue;
                        }
                    }
                }

                // Tomorrow
                if (
                    countBlasphemies(
                        currentAgent?.[effectKeys.CODEX_OF_BLASPHEMY],
                        blasphemyKeys.TOMORROW,
                    ) > 0
                ) {
                    // Use if Sin >= 50%
                    if (currentAgent?.[effectKeys.TARNISHED_SIN] >= 50) {
                        const index = currentAgent?.[
                            effectKeys.CODEX_OF_BLASPHEMY
                        ].indexOf(blasphemyKeys.TOMORROW);

                        if (index !== -1) {
                            sim = await centralAIManagement(
                                sim,
                                agentKey,
                                nonAgentKey,
                                {
                                    type: commandKeys.EXPUNGE_BLAS,
                                    field: index,
                                },
                            );

                            commandArray = [
                                ...commandArray,
                                {
                                    type: commandKeys.EXPUNGE_BLAS,
                                    field: index,
                                },
                            ];

                            loop += 1;
                            continue;
                        }
                    }
                }
            }

            // Apocalypse Stars
            if (
                currentAgent?.[effectKeys.STARS_OF_APOCALYPSE] > 0 &&
                getTotalEnlit(currentAgent) > 1
            ) {
                sim = await centralAIManagement(sim, agentKey, nonAgentKey, {
                    type: commandKeys.USE_CELESTIAL_STARS,
                    field: effectKeys.STARS_OF_APOCALYPSE,
                });

                commandArray = [
                    ...commandArray,
                    {
                        type: commandKeys.USE_CELESTIAL_STARS,
                        field: effectKeys.STARS_OF_APOCALYPSE,
                    },
                ];

                loop += 1;
                continue;
            }

            break;
        }

        const permutations = getEdictPermutations(edictNum);
        const currentMask = getAgentEdictMask(currentAgent, edictNum);

        // Allow UI to load
        if (
            nodeTracker.count === 0 &&
            isEdictUnlocked(currentAgent, edictKeys.VIRTUES)
        ) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        for (const command of actionCommands) {
            // Verfy if an action is available
            if (
                command.type === commandKeys.USE_ACTION &&
                !simActionAvailable(command.field)
            ) {
                continue;
            }

            for (let i = 0; i < permutations.length; i++) {
                const { mask, edicts } = permutations[i];

                if (!isRelevantCombination(sim, edicts, command)) {
                    continue;
                }

                nodeTracker.count++;
                if (nodeTracker.count % 40 === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }

                // console.log("path");

                // Bypass state creation if target edicts match current state
                const edictSim =
                    mask === currentMask
                        ? sim
                        : await centralAIManagement(
                              sim,
                              agentKey,
                              nonAgentKey,
                              {
                                  type: commandKeys.SET_EDICTS,
                                  field: edicts,
                              },
                          );

                const commandSim = await centralAIManagement(
                    edictSim,
                    agentKey,
                    nonAgentKey,
                    command,
                );

                const newScore = rateSim(commandSim);

                // Immediately reject losing states
                if (newScore === -Infinity) {
                    continue;
                }

                const nextCommands = [...commandArray];
                if (mask !== currentMask) {
                    nextCommands.push({
                        type: commandKeys.SET_EDICTS,
                        field: edicts,
                    });
                }
                nextCommands.push(command);

                // Immediately accepts winning states
                if (newScore === Infinity) {
                    return {
                        score: Infinity,
                        commandArray: nextCommands,
                    };
                }

                const pathFound = await evaluatePath(
                    commandSim,
                    nextCommands,
                    depth + 1,
                    nodeTracker,
                );

                if (pathFound.score >= best.score) {
                    best = pathFound;
                }
            }
        }

        return best;
    };

    const aiPath = await evaluatePath(prev, [], 0, { count: 0 }, -Infinity);

    if (aiPath.commandArray.length === 0 || aiPath?.score === -Infinity) {
        return buildAction(actionKeys.ATONE);
    }

    return aiPath.commandArray;
}
