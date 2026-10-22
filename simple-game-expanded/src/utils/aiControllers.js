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
    getEntityDef,
    getEntityDefPen,
    getEntityDR,
    getEntityFragility,
    getEntityMaxHealth,
    getEntityStr,
    getEntityTotalHealth,
    getEntityTotalMana,
    getEntityUsableStars,
    getFortitude,
    getMalediction,
    getMaxEnlit,
    getMaxMana,
    getOtherEntity,
    getProvForVirtues,
    getRevelation,
    getSpAtkCost,
    getTotalEnlit,
    isEdictActive,
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
    eyeKeys,
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

            post = processActionUse(post, agentKey, nonAgentKey, action, true);

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
                let draftAgent = extractEntity(post, agentKey);

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

                draftAgent = {
                    ...draftAgent,
                    [effectKeys.STARS_OF_APOCALYPSE]:
                        draftAgent[effectKeys.STARS_OF_APOCALYPSE] - starsUsed,
                };

                post = replaceEntity(post, draftAgent, agentKey);

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

                draftAgent = {
                    ...draftAgent,
                    [effectKeys.STARS_OF_GENESIS]:
                        draftAgent[effectKeys.STARS_OF_GENESIS] - starsUsed,
                };

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
                isExtraTurn,
            };

            let caller = presetAi?.[agent?.controller]?.caller || simpleAI;

            switch (agent?.controller) {
                case aiKeys.AUGUR:
                case aiKeys.LUNATIC:
                case aiKeys.VOYAGER:
                case aiKeys.SERAPH: {
                    const aiResults = await caller(context);

                    newQueue = Array.isArray(aiResults)
                        ? aiResults
                        : [aiResults];

                    // console.log(aiResults);

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

function getEffectiveHealth(entity, log = false) {
    const mit = consumeMitigationResources(entity, Infinity)
        .mitigationResourcesConsumed.totalMitigationResourcesConsumption;

    if (log) {
        console.log(`enlit: ${getTotalEnlit(entity)}`);
        console.log(`hp: ${getEntityTotalHealth(entity)}`);
        console.log(`mit: ${mit}`);
    }

    return getTotalEnlit(entity) + getEntityTotalHealth(entity) > 1
        ? getTotalEnlit(entity) + getEntityTotalHealth(entity) + mit
        : 0;
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
    const { agent, agentKey, nonAgentKey } = context;

    const simulate = createSimulator(context);
    const isActionAvailable = createAvailabilityChecker(context);

    // Simulate Special Attack
    // If it kills, use it
    const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(
            simSpecial,
            nonAgentKey,
            agentKey,
        ) &&
        isActionAvailable(actionKeys.SPECIAL_ATTACK)
    ) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // Simulate Attack
    // If it kills, use it
    const simAttack = simulate(actionKeys.ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(
            simAttack,
            nonAgentKey,
            agentKey,
        ) &&
        isActionAvailable(actionKeys.ATTACK)
    ) {
        return actionKeys.ATTACK;
    }

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

    // Prioritize restoring Mana
    if (
        getEntityTotalMana(agent) <=
        getMaxMana(agent) - getMaxMana(agent) * constants.GUARD_MANA_REGEN
    ) {
        return actionKeys.GUARD;
    }

    // Use Sp Atk if available
    if (isActionAvailable(actionKeys.SPECIAL_ATTACK)) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // else, default to attack
    return actionKeys.ATTACK;
}

// Helper for changing elements
const changeElement = (entity, element) => {
    return processHealth({
        ...entity,
        [effectKeys.ELEMENTAL_CRYSTALS]: translateElementIntoCrystals(element),
    });
};

// Helper for getting Effective Health
function getTrueEffectiveHealth(sim, agentKey, log = false) {
    const agent = extractEntity(sim, agentKey);
    const nonAgent = extractEntity(sim, getOtherEntity(agentKey));

    if (log) {
        console.log(`effectHp: ${getEffectiveHealth(agent, true)}`);
        console.log(`frail: ${getEntityFragility(sim, agentKey)}`);
        console.log(`dr: ${getEntityDR(sim, agentKey)}`);
    }

    // Cyborg Override
    if (
        (nonAgent.states[effectKeys.ARMORED_DEPLOYMENT] ||
            nonAgent.states[effectKeys.WEAPONS_DEPLOYED]) &&
        getEffectiveHealth(agent) <= 5
    ) {
        return 0;
    }

    // Shadow Sorcerer Override
    if (nonAgent.states[effectKeys.UMBRAL_CORE]) {
        const consumed = consumeResources(
            agent,
            Infinity,
            effectKeys.BLACK_MAYHEM,
        ).resourcesConsumed.totalConsumption;

        return getEffectiveHealth(agent) > 0 ? consumed : 0;
    }

    // Ascendent Override
    if (
        (nonAgent.states[effectKeys.ASCENDENCE_OF_SPIRIT] ||
            nonAgent.states[effectKeys.ZENITH_OF_MORTALITY]) &&
        !agent.states[effectKeys.ASCENDENCE_OF_SPIRIT] &&
        !agent.states[effectKeys.ZENITH_OF_MORTALITY]
    ) {
        return getEffectiveHealth(agent) > 0 &&
            agent[effectKeys.TARNISHED_SIN] < constants.MAX_SIN
            ? Infinity
            : 0;
    }

    return (
        getEffectiveHealth(extractEntity(sim, agentKey)) /
        getEntityFragility(sim, agentKey) /
        getEntityDR(sim, agentKey)
    );
}

function commitDeathPrevention(prev, agentKey) {
    const isActionAvailable = createAvailabilityChecker({ prev, agentKey });
    const simulate = createSimulator({
        prev,
        agentKey,
        nonAgentKey: getOtherEntity(agentKey),
    });

    const simAtk = simulate(actionKeys.ATTACK);
    const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
    const simHeal = simulate(actionKeys.HEAL);

    if (!willEntityEffectivelyDieByNextCommit(simAtk, agentKey)) {
        return actionKeys.ATTACK;
    }

    if (!willEntityEffectivelyDieByNextCommit(simSpecial, agentKey)) {
        return actionKeys.SPECIAL_ATTACK;
    }

    if (!willEntityEffectivelyDieByNextCommit(simHeal, agentKey)) {
        return actionKeys.HEAL;
    }

    if (isActionAvailable(actionKeys.AEGIS)) {
        return actionKeys.AEGIS;
    }

    return actionKeys.ATTACK;
}

export function bloodknightAI(context) {
    const { prev, agentKey, nonAgent, nonAgentKey } = context;

    const simulate = createSimulator(context);
    const isActionAvailable = createAvailabilityChecker(context);

    // Sims
    const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
    const simAttack = simulate(actionKeys.ATTACK);
    const simSac = simulate(actionKeys.SACRIFICE);

    // Use Special Attack if it kills
    if (
        willEntityEffectivelyDieByNextUpkeep(
            simSpecial,
            nonAgentKey,
            agentKey,
        ) &&
        isActionAvailable(actionKeys.SPECIAL_ATTACK) &&
        !willEntityDieImmediately(extractEntity(simSpecial, agentKey))
    ) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // Use Attack if it kills
    if (
        willEntityEffectivelyDieByNextUpkeep(
            simAttack,
            nonAgentKey,
            agentKey,
        ) &&
        isActionAvailable(actionKeys.ATTACK) &&
        !willEntityDieImmediately(extractEntity(simAttack, agentKey))
    ) {
        return actionKeys.ATTACK;
    }

    // Turn end death prevention (Radiance, dissonance, overflow)
    if (willEntityEffectivelyDieByNextCommit(prev, agentKey)) {
        return commitDeathPrevention(prev, agentKey);
    }

    // Sacrifice logic (boost attr)
    if (
        getTrueEffectiveHealth(
            commitTurn(simSac, agentKey, nonAgentKey),
            agentKey,
        ) >= 15
    ) {
        return actionKeys.SACRIFICE;
    }

    if (canUseAction(prev, agentKey, actionKeys.AEGIS)) {
        return actionKeys.AEGIS;
    }

    // Use Attack or SpAtk (whichever is stronger) if it deals considerable dmg
    const spAtkDmgDealt =
        getEffectiveHealth(nonAgent) -
        getEffectiveHealth(extractEntity(simSpecial, nonAgentKey));
    const atkDmgDealt =
        getEffectiveHealth(nonAgent) -
        getEffectiveHealth(extractEntity(simAttack, nonAgentKey));

    const dmgThreshold = nonAgent.states[effectKeys.ASCENDENCE_OF_SPIRIT]
        ? getEffectiveHealth(nonAgent)
        : getEffectiveHealth(nonAgent) * 0.5;

    if (
        spAtkDmgDealt > atkDmgDealt &&
        spAtkDmgDealt > dmgThreshold &&
        isActionAvailable(actionKeys.SPECIAL_ATTACK)
    ) {
        return actionKeys.SPECIAL_ATTACK;
    }

    return actionKeys.ATTACK;
}

export function paladinAI(context) {
    const { prev, agent, agentKey, nonAgentKey } = context;

    const simulate = createSimulator(context);
    const isActionAvailable = createAvailabilityChecker(context);

    const simAtk = simulate(actionKeys.ATTACK);
    const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
    const simSac = simulate(actionKeys.SACRIFICE);

    // Use Attack if it kills
    if (willEntityEffectivelyDieByNextUpkeep(simAtk, nonAgentKey, agentKey)) {
        return actionKeys.ATTACK;
    }

    // Use Special Attack if it kills
    if (
        willEntityEffectivelyDieByNextUpkeep(
            simSpecial,
            nonAgentKey,
            agentKey,
        ) &&
        isActionAvailable(actionKeys.SPECIAL_ATTACK)
    ) {
        return actionKeys.SPECIAL_ATTACK;
    }

    // Turn end death prevention (Radiance, dissonance, overflow)
    if (willEntityEffectivelyDieByNextCommit(prev, agentKey)) {
        return commitDeathPrevention(prev, agentKey);
    }

    // Sacrifice logic (boost attr)
    if (
        agent[effectKeys.BLOOD_SACRIFICE] < 10 &&
        getTrueEffectiveHealth(
            commitTurn(simSac, agentKey, nonAgentKey),
            agentKey,
        ) >= 15
    ) {
        return actionKeys.SACRIFICE;
    }

    // Logic when divine spark is near full
    if (
        agent[effectKeys.DIVINE_SPARK] +
            getEntityDef(agent) * constants.HALO_GEN_MULT >=
        constants.MAX_DIVINE_SPARK
    ) {
        if (
            getTrueEffectiveHealth(
                commitTurn(simSac, agentKey, nonAgentKey),
                agentKey,
            ) >= 15 &&
            getEntityTotalHealth(agent) >= 8
        ) {
            return actionKeys.SACRIFICE;
        }

        if (
            agent.resources[effectKeys.MANA_OVERFLOW] <= 0 &&
            isActionAvailable(actionKeys.AEGIS)
        ) {
            return actionKeys.AEGIS;
        }

        if (isActionAvailable(actionKeys.SPECIAL_ATTACK)) {
            return actionKeys.SPECIAL_ATTACK;
        }
    }

    // Use Aegis if possible
    if (isActionAvailable(actionKeys.AEGIS)) {
        return actionKeys.AEGIS;
    }

    // default: Attack
    return actionKeys.ATTACK;
}

export function shadowSorcererAI(context) {
    const { prev, agent, agentKey, nonAgentKey, nonAgent } = context;

    const simulate = createSimulator(context);

    // === Inside Umbral ===
    if (agent.states[effectKeys.UMBRAL_CORE]) {
        const simMayhem = simulate(actionKeys.BLACK_MAYHEM);
        const simMantle = simulate(actionKeys.SHADOW_MANTLE);
        const simPromise = simulate(actionKeys.DARK_PROMISE);

        // === Lethal Checks (Black Mayhem) ===
        if (
            willEntityEffectivelyDieByNextUpkeep(
                simMayhem,
                nonAgentKey,
                agentKey,
            ) &&
            !willEntityEffectivelyDie(extractEntity(simMayhem, agentKey))
        ) {
            return actionKeys.BLACK_MAYHEM;
        }

        // === Turn End Death ===
        const simCommit = commitTurn(prev, agentKey, nonAgentKey);
        const simPostCommitMayhem = commitTurn(
            simMayhem,
            agentKey,
            nonAgentKey,
        );

        if (willEntityEffectivelyDie(extractEntity(simCommit, agentKey))) {
            // Prioritize Black Mayhem
            if (
                !willEntityEffectivelyDie(
                    extractEntity(simPostCommitMayhem, agentKey),
                )
            ) {
                return actionKeys.BLACK_MAYHEM;
            }

            // Else, Dark Promise
            return actionKeys.DARK_PROMISE;
        }

        // === Dark Promise ===
        const ENEMY_ACTIONS = [
            actionKeys.SPECIAL_ATTACK,
            actionKeys.HEAL,
            actionKeys.BLACK_MAYHEM,
            actionKeys.ASCEND,
        ]; // actions that consume mana

        // Ignore Selenians, they have an easy way out
        if (!nonAgent.states[effectKeys.SELENIAN]) {
            // baseline simulations
            const simPostCommitPromise = commitTurn(
                simPromise,
                agentKey,
                nonAgentKey,
            );
            const simPostUpkeepPromise = processUpkeep(
                simPostCommitPromise,
                nonAgentKey,
                agentKey,
            );

            // Helper for simulating enemy actions
            const reverseSimulate = createSimulator({
                agentKey: nonAgentKey,
                nonAgentKey: agentKey,
                prev: simPostUpkeepPromise,
            });

            let willWeDie = false;
            let willTheyDie = true;

            // Check for safety & kill
            for (let action of ENEMY_ACTIONS) {
                if (!canUseAction(simPostUpkeepPromise, nonAgentKey, action)) {
                    continue;
                }

                const simEnemyAction = reverseSimulate(action);
                const simPostEnemyCommit = commitTurn(
                    simEnemyAction,
                    nonAgentKey,
                    agentKey,
                );

                if (
                    !willEntityEffectivelyDie(
                        extractEntity(simPostEnemyCommit, nonAgentKey),
                    )
                ) {
                    willTheyDie = false;
                }

                if (
                    willEntityEffectivelyDie(
                        extractEntity(simPostEnemyCommit, agentKey),
                    )
                ) {
                    willWeDie = true;
                }
            }

            if (willTheyDie && !willWeDie) {
                return actionKeys.DARK_PROMISE;
            }
        }

        // === Burn Protection ===
        const simPostUpkeepMayhem = processUpkeep(
            commitTurn(simMayhem, agentKey, nonAgentKey),
            agentKey,
            nonAgentKey,
        );

        const isUmbralSafe = (sim) => {
            return getTrueEffectiveHealth(sim, agentKey) >= 15;
        };

        if (
            isUmbralSafe(simMayhem) &&
            !willEntityEffectivelyDie(
                extractEntity(simPostUpkeepMayhem, agentKey),
            )
        ) {
            return actionKeys.BLACK_MAYHEM;
        }

        // === Umbral Defense ===
        const simPostCommitMantle = commitTurn(
            simMantle,
            agentKey,
            nonAgentKey,
        );
        const postCommitMantleAgent = extractEntity(
            simPostCommitMantle,
            agentKey,
        );
        const mantleManaGain =
            postCommitMantleAgent[effectKeys.MANA] - agent[effectKeys.MANA];
        const mantleHPGain =
            postCommitMantleAgent[effectKeys.HEALTH] - agent[effectKeys.HEALTH];

        if (
            mantleHPGain + mantleManaGain >= 10 &&
            isUmbralSafe(simPostCommitMantle)
        ) {
            return actionKeys.SHADOW_MANTLE;
        }

        // default: ash
        return actionKeys.RITUAL_OF_ASH;
    }

    // === Outside Umbral ===

    // Bleak redirect
    if (agent.states[effectKeys.BLEAK_DECEPTION]) {
        return paladinAI(context);
    }

    // Simulate Special Attack
    // If it kills, use it
    if (canUseAction(prev, agentKey, actionKeys.SPECIAL_ATTACK)) {
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

    // Turn end death prevention (Radiance, dissonance, overflow)
    if (willEntityEffectivelyDieByNextCommit(prev, agentKey)) {
        return commitDeathPrevention(prev, agentKey);
    }

    // Sacrifice
    const simSac = simulate(actionKeys.SACRIFICE);
    if (
        getTrueEffectiveHealth(
            commitTurn(simSac, agentKey, nonAgentKey),
            agentKey,
        ) >= 15 &&
        getEntityTotalHealth(agent) >= 8 &&
        agent[effectKeys.BLOOD_SACRIFICE] <= 0
    ) {
        return actionKeys.SACRIFICE;
    }

    // Umbral Entry
    return actionKeys.SHADOW_PACT;
}

export function cyborgAI(context) {
    const { prev, agent, agentKey, nonAgentKey, nonAgent } = context;

    const simulate = createSimulator(context);

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
    if (canUseAction(prev, agentKey, actionKeys.SPECIAL_ATTACK)) {
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

    // Check for a kill sequence
    const relevantActions = [
        actionKeys.LASER,
        actionKeys.ATTACK,
        actionKeys.SPECIAL_ATTACK,
        actionKeys.MELTDOWN,
    ];

    const evalKill = (sim) => {
        for (let relAct of relevantActions) {
            if (canUseAction(sim, agentKey, relAct)) {
                const simAction = simulate(relAct, { prev: sim });

                if (
                    !willEntityDieImmediately(
                        extractEntity(simAction, agentKey),
                    ) &&
                    willEntityEffectivelyDieByNextUpkeep(
                        simAction,
                        nonAgentKey,
                        agentKey,
                    )
                ) {
                    return true;
                }

                if (FREE_ACTIONS.includes(relAct) && evalKill(simAction)) {
                    return true;
                }
            }
        }

        return false;
    };

    if (evalKill(prev)) {
        return actionKeys.LASER;
    }

    // Not on the Cyborg states -> Deploy
    if (!agent.states[effectKeys.WEAPONS_DEPLOYED]) {
        return actionKeys.DEPLOY;
    }

    // Turn end death prevention (Radiance, dissonance, overflow)
    if (willEntityEffectivelyDieByNextCommit(prev, agentKey)) {
        return commitDeathPrevention(prev, agentKey);
    }

    // Overheat management & Laser
    const selectDefenseCyborg = () => {
        const simGuard = simulate(actionKeys.GUARD);
        const simHeal = simulate(actionKeys.HEAL);
        const simAegis = simulate(actionKeys.AEGIS);
        const simAttack = simulate(actionKeys.ATTACK);

        const isActionUsable = createAvailabilityChecker(context);

        // Choose the most benefitial one
        const postCommitGuardAgent = extractEntity(
            commitTurn(simGuard, agentKey, nonAgentKey),
            agentKey,
        );
        const postCommitHealAgent = extractEntity(
            commitTurn(simHeal, agentKey, nonAgentKey),
            agentKey,
        );
        const postCommitAegisAgent = extractEntity(
            commitTurn(simAegis, agentKey, nonAgentKey),
            agentKey,
        );
        const postCommitGuardHp = getEntityTotalHealth(postCommitGuardAgent);
        const postCommitHealHp = getEntityTotalHealth(postCommitHealAgent);
        const postCommitAegisHp = getEntityTotalHealth(postCommitAegisAgent);

        if (
            nonAgent.states[effectKeys.SELENIAN] &&
            agent[effectKeys.BLOOD_SACRIFICE] > 0 &&
            isActionUsable(actionKeys.HEAL)
        ) {
            return actionKeys.HEAL;
        }

        if (
            postCommitAegisHp >= postCommitGuardHp &&
            postCommitAegisHp > 0 &&
            isActionUsable(actionKeys.AEGIS)
        ) {
            return actionKeys.AEGIS;
        }

        if (
            postCommitGuardHp >= postCommitAegisHp &&
            postCommitGuardHp > 0 &&
            isActionUsable(actionKeys.GUARD)
        ) {
            return actionKeys.GUARD;
        }

        if (
            postCommitHealHp >= postCommitGuardHp &&
            postCommitHealHp >= postCommitAegisHp &&
            postCommitHealHp > 0 &&
            isActionUsable(actionKeys.HEAL) &&
            (willEntityEffectivelyDieByNextCommit(
                simAttack,
                agentKey,
                nonAgentKey,
            ) ||
                agent[effectKeys.BLOOD_SACRIFICE] <= 0)
        ) {
            return actionKeys.HEAL;
        }

        return actionKeys.ATTACK;
    };

    const simLaser = simulate(actionKeys.LASER);
    const selectedDefense = selectDefenseCyborg();

    // Sacrifice logic (boost attr)
    const simSac = simulate(actionKeys.SACRIFICE, { prev: simLaser });
    if (
        agent[effectKeys.BLOOD_SACRIFICE] < 10 &&
        getTrueEffectiveHealth(
            commitTurn(simSac, agentKey, nonAgentKey),
            agentKey,
        ) < 15 &&
        getEntityTotalHealth(agent) >= 8 &&
        !nonAgent.states[effectKeys.SELENIAN]
    ) {
        return actionKeys.SACRIFICE;
    }

    // Check for Meltdown
    if (
        extractEntity(simLaser, agentKey)[effectKeys.OVERHEAT] >=
        constants.MAX_OVERHEAT
    ) {
        return selectedDefense;
    }

    // Check for safety
    if (isEntityDead(extractEntity(simLaser, agentKey))) {
        return selectedDefense;
    }

    const maxOverheat =
        constants.OVERHEAT_DEF_LOSS +
        constants.OVERHEAT_STR_LOSS * getEntityStr(agent);

    // Check Overheat Limit
    if (agent[effectKeys.OVERHEAT] >= maxOverheat) {
        return selectedDefense;
    }

    // use laser if can
    if (canUseAction(prev, agentKey, actionKeys.LASER)) {
        return actionKeys.LASER;
    }

    // defense fallback
    return selectedDefense;
}

export function maestroAI(context) {
    const { prev, agent, nonAgentKey, agentKey } = context;

    const simulate = createSimulator(context);
    const isActionAvailable = createAvailabilityChecker(context);

    // On thermal, use Meltdown
    if (
        agent.states[effectKeys.THERMAL_OVERLOAD] &&
        isActionAvailable(actionKeys.MELTDOWN)
    ) {
        return actionKeys.MELTDOWN;
    }

    // Simulate Special Attack
    // If it kills, use it
    if (isActionAvailable(actionKeys.SPECIAL_ATTACK)) {
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

    // If not on Resonant, use Attune
    if (
        !agent.states[effectKeys.RESONANT] &&
        isActionAvailable(actionKeys.ATTUNE)
    ) {
        return actionKeys.ATTUNE;
    }

    // === Sonority ===
    // Anti-dissonance enemies logic
    // if (dissImmune) {
    //     // Sacrifice
    //     const simSac = simulate(actionKeys.SACRIFICE);
    //     if (
    //         getTrueEffectiveHealth(
    //             commitTurn(simSac, agentKey, nonAgentKey),
    //             agentKey,
    //         ) >= 15 &&
    //         getEntityTotalHealth(agent) >= 8
    //     ) {
    //         return actionKeys.SACRIFICE;
    //     }

    //     // Sp Atk Use
    //     const simSpAtk = simulate(actionKeys.SPECIAL_ATTACK);
    //     if (
    //         agent[effectKeys.SONORITY] >= constants.SONORITY_HIGHER_LIMIT &&
    //         agent[effectKeys.DIVINE_SPARK] >= constants.MAX_DIVINE_SPARK &&
    //         canUseAction(prev, agentKey, actionKeys.SPECIAL_ATTACK) &&
    //         getTrueEffectiveHealth(
    //             commitTurn(simSpAtk, agentKey, nonAgentKey),
    //             agentKey,
    //         ) > 0
    //     ) {
    //         return actionKeys.SPECIAL_ATTACK;
    //     }

    //     // Turn end death prevention (Radiance, dissonance, overflow)
    //     if (willEntityEffectivelyDieByNextCommit(prev, agentKey)) {
    //         return commitDeathPrevention(prev, agentKey);
    //     }

    //     // Aegis
    //     const simAegis = simulate(actionKeys.AEGIS);
    //     if (
    //         getTrueEffectiveHealth(simAegis, agentKey) >= 15 &&
    //         canUseAction(prev, agentKey, actionKeys.AEGIS)
    //     ) {
    //         return actionKeys.AEGIS;
    //     }
    // }

    // Turn end death prevention (Radiance, dissonance, overflow)
    if (willEntityEffectivelyDieByNextCommit(prev, agentKey)) {
        const SURVIVAL_ACTIONS = [
            actionKeys.HEAL,
            actionKeys.SPECIAL_ATTACK,
            actionKeys.ATTACK,
            actionKeys.GUARD,
            actionKeys.DA_CAPO,
            actionKeys.BABEL,
            actionKeys.SOUND_OF_SILENCE,
        ];

        for (let action of SURVIVAL_ACTIONS) {
            if (!canUseAction(prev, agentKey, action)) {
                continue;
            }

            const simCommitAction = commitTurn(
                simulate(action),
                agentKey,
                nonAgentKey,
            );

            if (getTrueEffectiveHealth(simCommitAction, agentKey) > 0) {
                return action;
            }
        }
    }

    if (agent[effectKeys.SONORITY] > 0) {
        return actionKeys.BABEL;
    }

    if (
        agent[effectKeys.SONORITY] <= 0 &&
        agent[effectKeys.SONORITY] > constants.SONORITY_LOWER_LIMIT &&
        agent.states[effectKeys.WEAPONS_DEPLOYED]
    ) {
        return actionKeys.LASER;
    }

    if (
        !agent.states[effectKeys.WEAPONS_DEPLOYED] &&
        agent[effectKeys.SONORITY] > constants.SONORITY_LOWER_LIMIT
    ) {
        return actionKeys.DEPLOY;
    }

    if (agent[effectKeys.SONORITY] < 0) {
        return actionKeys.SOUND_OF_SILENCE;
    }

    console.error("maestro fallback");
    return actionKeys.GUARD;
}

export function augurAI(context) {
    const { agent, agentKey, nonAgentKey, nonAgent, prev } = context;

    const simulate = createSimulator(context);

    // Helper for building action
    const buildAction = (action, command = commandKeys.USE_ACTION) => {
        return {
            type: command,
            field: action,
        };
    };

    // Helper for build an array of actions
    const buildSucessiveActions = (array) => {
        let commands = [];
        for (let action of array) {
            commands = [...commands, buildAction(action)];
        }

        return commands;
    };

    // === Lethal Checks ===

    const relevantKillActions = [
        actionKeys.ATTACK,
        actionKeys.SPECIAL_ATTACK,
        actionKeys.CURSE,
    ];

    const evalKill = (sim, history, depth) => {
        if (depth > 3) {
            console.log(`max depth reached: ${depth}`);
            return null;
        }

        for (let relAct of relevantKillActions) {
            // Skip unavailable actions
            if (!canUseAction(sim, agentKey, relAct)) {
                continue;
            }

            const simAction = simulate(relAct);

            if (
                !willEntityDieImmediately(extractEntity(simAction, agentKey)) &&
                willEntityEffectivelyDieByNextUpkeep(
                    simAction,
                    nonAgentKey,
                    agentKey,
                )
            ) {
                return [...history, buildAction(relAct)];
            }

            if (FREE_ACTIONS.includes(relAct)) {
                const freeResult = evalKill(
                    simAction,
                    [buildAction(relAct)],
                    depth + 1,
                );

                if (freeResult) {
                    return freeResult;
                }
            }
        }

        return null;
    };

    const foundDeath = evalKill(prev, [], 0);
    if (foundDeath && foundDeath.length > 0) {
        return foundDeath;
    }

    // === Enter Visionary ===
    if (!agent.states[effectKeys.VISIONARY]) {
        return buildAction(actionKeys.CARVE);
    }

    // === Engine ===
    const evalSpAtk = () => {
        const simSpAtk = simulate(actionKeys.SPECIAL_ATTACK);
        const simCurse = simulate(actionKeys.CURSE);
        const simCurseSpAtk = simulate(actionKeys.SPECIAL_ATTACK, {
            prev: simCurse,
        });

        const spAtkDmg =
            getEffectiveHealth(nonAgent) -
            getEffectiveHealth(extractEntity(simSpAtk, nonAgentKey));
        const curseDmg =
            getEffectiveHealth(nonAgent) -
            getEffectiveHealth(extractEntity(simCurseSpAtk, nonAgentKey));

        if (
            spAtkDmg >= curseDmg &&
            getAugurMana(extractEntity(simSpAtk, agentKey)) >=
                getAugurMana(extractEntity(simCurseSpAtk, agentKey)) &&
            canUseAction(prev, agentKey, actionKeys.SPECIAL_ATTACK)
        ) {
            return [actionKeys.SPECIAL_ATTACK];
        }

        if (
            canUseAction(prev, agentKey, actionKeys.CURSE) &&
            canUseAction(simCurse, agentKey, actionKeys.SPECIAL_ATTACK)
        ) {
            return [actionKeys.CURSE, actionKeys.SPECIAL_ATTACK];
        }

        return null;
    };

    const getAugurMana = (entity) => {
        return (
            entity.resources[effectKeys.PRECOGNITION] +
            getEntityTotalMana(entity)
        );
    };

    const evalManaRegen = () => {
        const relevantRegenActions = [
            actionKeys.GUARD,
            actionKeys.HEAL,
            actionKeys.AEGIS,
            actionKeys.SPECIAL_ATTACK,
            actionKeys.CURSE,
        ];

        const evalRegen = (sim, history, depth, oldBest) => {
            let best = {
                ...oldBest,
            };

            if (depth > 3) {
                console.log(`max depth reached: ${depth}`);
                return null;
            }

            for (let relAct of relevantRegenActions) {
                // Skip unavailable actions
                if (!canUseAction(sim, agentKey, relAct)) {
                    continue;
                }

                const simAction = simulate(relAct);
                const realMana = getAugurMana(
                    extractEntity(simAction, agentKey),
                );

                if (FREE_ACTIONS.includes(relAct)) {
                    const freeResult = evalRegen(
                        simAction,
                        [...history, relAct],
                        depth + 1,
                        best,
                    );

                    if (freeResult.score >= best.score) {
                        best = freeResult;
                    }
                } else if (realMana >= best.score) {
                    best = {
                        history: [...history, relAct],
                        score: realMana,
                    };
                }
            }

            return best;
        };

        return (
            evalRegen(prev, [], 0, { history: [], score: -Infinity })
                ?.history ?? []
        );
    };

    const willSurvive = (sim) => {
        const simCommit = commitTurn(sim, agentKey, nonAgentKey);
        return getTrueEffectiveHealth(simCommit, agentKey) >= 15;
    };

    const selectBuff = () => {
        const simSac = simulate(actionKeys.SACRIFICE);
        if (
            willSurvive(simSac) &&
            getEntityTotalHealth(agent) >= 15 &&
            agent[effectKeys.RECOLLECTION] <= 0
        ) {
            return [actionKeys.SACRIFICE];
        }

        if (agent[effectKeys.RECOLLECTION] < constants.MAX_RECOLLECTION) {
            return [actionKeys.GUARD];
        }

        if (
            agent[effectKeys.DIVINE_SPARK] < constants.MAX_DIVINE_SPARK &&
            getEntityDef(agent) >= 8
        ) {
            return [actionKeys.AEGIS];
        }

        if (evalSpAtk()) {
            return evalSpAtk();
        }

        return evalManaRegen();
    };

    const buffsSelected = selectBuff();
    let simBuff = prev;
    for (let action of buffsSelected) {
        simBuff = simulate(action, { prev: simBuff });
    }

    if (willSurvive(simBuff)) {
        const buffCommands = buildSucessiveActions(buffsSelected);

        if (buffCommands && buffCommands.length > 0) {
            return buffCommands;
        }
    }

    // === Survival ===
    const selectDefense = () => {
        const relevantDefenseActions = [
            actionKeys.GUARD,
            actionKeys.HEAL,
            actionKeys.AEGIS,
            actionKeys.ATTACK,
            actionKeys.SPECIAL_ATTACK,
        ];

        const evalDefense = (sim, history, depth, oldBest) => {
            let best = {
                ...oldBest,
            };

            if (depth > 3) {
                console.log(`max depth reached: ${depth}`);
                return null;
            }

            for (let relAct of relevantDefenseActions) {
                // Skip unavailable actions
                if (!canUseAction(sim, agentKey, relAct)) {
                    continue;
                }

                const simAction = simulate(relAct);
                const simCommit = commitTurn(simAction, agentKey, nonAgentKey);
                const simUpkeep = processUpkeep(
                    simCommit,
                    agentKey,
                    nonAgentKey,
                );

                const scores = {
                    commitScore: getTrueEffectiveHealth(simCommit, agentKey),
                    upkeepScore:
                        getTrueEffectiveHealth(simCommit, agentKey) > 0
                            ? getTrueEffectiveHealth(simUpkeep, agentKey)
                            : 0,
                };

                // console.log(relAct);
                // console.log(scores)
                // console.log(best)

                if (FREE_ACTIONS.includes(relAct)) {
                    const freeResult = evalDefense(
                        simAction,
                        [...history, relAct],
                        depth + 1,
                        best,
                    );

                    if (freeResult.upkeepScore > best.upkeepScore) {
                        best = freeResult;
                    } else if (
                        freeResult.upkeepScore === best.upkeepScore &&
                        freeResult.commitScore > best.commitScore
                    ) {
                        best = freeResult;
                    }
                } else if (scores.upkeepScore > best.upkeepScore) {
                    best = {
                        history: [...history, relAct],
                        upkeepScore: scores.upkeepScore,
                        commitScore: scores.commitScore,
                    };
                } else if (
                    scores.upkeepScore === best.upkeepScore &&
                    scores.commitScore > best.commitScore
                ) {
                    best = {
                        history: [...history, relAct],
                        upkeepScore: scores.upkeepScore,
                        commitScore: scores.commitScore,
                    };
                }
            }

            return best;
        };

        return buildSucessiveActions(
            evalDefense(prev, [], 0, {
                action: null,
                commitScore: -Infinity,
                upkeepScore: -Infinity,
            })?.history ?? [],
        );
    };

    const selectedDefense = selectDefense();

    if (selectedDefense && selectedDefense.length > 0) {
        return selectedDefense;
    }

    // Fallback to guard
    console.error("augur fallback");
    return buildAction(actionKeys.GUARD);
}

// Voyager AI
export async function voyagerAI(context) {
    const { prev, agentKey, nonAgentKey, agent } = context;

    const MAX_STARS = 200;

    // Tracker and helper to prevent UI freezing during heavy calculations
    const nodeTracker = { count: 0 };
    const yieldToUI = async (interval = 40, delay = 10) => {
        nodeTracker.count++;
        if (nodeTracker.count % interval === 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    };

    // Helper for building action/star array
    const buildAction = (action, command = commandKeys.USE_ACTION) => {
        return {
            type: command,
            field: action,
        };
    };

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

    const relevantActions = [
        actionKeys.ATTACK,
        actionKeys.SPECIAL_ATTACK,
        actionKeys.SACRIFICE,
        actionKeys.AEGIS,
        actionKeys.GUARD,
        actionKeys.HEAL,
        actionKeys.CHART,
        actionKeys.ATTUNE,
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
        (actionSim) => {
            let maxStars = Math.min(MAX_STARS, remainingWhite);

            while (maxStars > 0) {
                let simStar = simulateStarsHelper(
                    actionSim,
                    agentKey,
                    nonAgentKey,
                    maxStars,
                    allocations[effectKeys.ORANGE_STAR],
                    allocations[effectKeys.YELLOW_STAR],
                    allocations[effectKeys.GREEN_STAR],
                    allocations[effectKeys.BLUE_STAR],
                    allocations[effectKeys.INDIGO_STAR],
                    allocations[effectKeys.VIOLET_STAR],
                );

                if (
                    !willEntityDieImmediately(extractEntity(simStar, agentKey))
                ) {
                    break;
                }

                maxStars -= 1;
            }

            maxStars = Math.max(0, maxStars);

            return {
                [effectKeys.RED_STAR]: maxStars,
            };
        },

        // 2. Augmented Red Star
        (actionSim) => {
            let maxStars = Math.min(MAX_STARS, remainingWhite);

            while (maxStars > 0) {
                let simStar = simulateStarsHelper(
                    actionSim,
                    agentKey,
                    nonAgentKey,
                    Math.ceil(maxStars / 2),
                    allocations[effectKeys.ORANGE_STAR],
                    allocations[effectKeys.YELLOW_STAR],
                    allocations[effectKeys.GREEN_STAR],
                    allocations[effectKeys.BLUE_STAR],
                    allocations[effectKeys.INDIGO_STAR],
                    Math.floor(maxStars / 2),
                );

                if (
                    !willEntityDieImmediately(extractEntity(simStar, agentKey))
                ) {
                    break;
                }

                maxStars -= 2;
            }

            maxStars = Math.max(0, maxStars);

            return {
                [effectKeys.RED_STAR]: Math.ceil(maxStars / 2),
                [effectKeys.VIOLET_STAR]: Math.floor(maxStars / 2),
            };
        },

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

            // Variant D: Singularity + Full Mana
            () => {
                const normalYellow = Math.min(starsForMaxGrav, remainingWhite);
                const greenStars = remainingWhite - normalYellow;
                return {
                    [effectKeys.YELLOW_STAR]: normalYellow,
                    [effectKeys.GREEN_STAR]: greenStars,
                };
            },

            // Variant A + Mana: Raw Green for SP ATK + Max Accretion then Constellation
            (actionSim) => {
                const agentEnt = actionSim.entities[agentKey];
                const missingHp = Math.max(
                    0,
                    getEntityMaxHealth(agentEnt) - agentEnt[effectKeys.HEALTH],
                );
                const spCost = getSpAtkCost(agentEnt);
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
                const spCost = getSpAtkCost(agentEnt);
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
                const spCost = getSpAtkCost(agentEnt);
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
            await yieldToUI();

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
                return [
                    buildAction(fullStars, commandKeys.ASSIGN_STARS),
                    buildAction(action),
                ];
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
                    await yieldToUI();

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
                        return [
                            buildAction(fullStars, commandKeys.ASSIGN_STARS),
                            buildAction(action),
                            buildAction(
                                effectKeys.CRIMSON_CONSTELLATION,
                                commandKeys.SET_CONSTELLATION,
                            ),
                            buildAction(singAction),
                        ];
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
        actionKeys.SHATTER,
        actionKeys.ATTUNE,
        actionKeys.BABEL,
    ];

    // Helper for evaluating threats (Async to yield during deep evaluation trees)
    const checkThreatSurvival = async (testAllocations, baseSim = prev) => {
        const simPostCommit = commitTurn(baseSim, agentKey, nonAgentKey);
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
            isSelenian && baseSim.startingPlayer !== agentKey
                ? processMoonPhase(simPostUpkeep)
                : simPostUpkeep;

        const evaluateAction = async (simulation, depth) => {
            if (depth > 10) {
                return true;
            }

            // Maestro override
            if (
                getEntityTotalHealth(extractEntity(simStar, agentKey)) <=
                extractEntity(simUsed, nonAgentKey)[effectKeys.SONORITY] *
                    2 *
                    constants.BABEL_RATE
            ) {
                return false;
            }

            for (const threatAction of incomingThreatActions) {
                await yieldToUI();

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
                        if (
                            !(await evaluateAction(enemyActionSim, depth + 1))
                        ) {
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
                await yieldToUI();

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

                if (!(await evaluateAction(simElement, 0))) {
                    return false;
                }
            }

            return true;
        }

        return await evaluateAction(simUsed, 0);
    };

    // Survivability Helper (Async)
    const distributeSurvival = async (alloc, remStars, baseSim = prev) => {
        if (await checkThreatSurvival(alloc, baseSim)) {
            return { testAlloc: alloc, unnasignedStars: remStars };
        }

        // Try Augmented Blue
        if (remStars >= 2) {
            const maxAugBlue = Math.min(
                Math.floor(Math.min(MAX_STARS, remStars) / 2),
                constants.MAX_IRRADIATION / constants.IRRADIATION_GAIN_RATE +
                    getEntityTotalHealth(postCommitAgent),
            );

            for (let b = 1; b <= maxAugBlue; b++) {
                await yieldToUI();

                const testAlloc = {
                    ...alloc,
                    [effectKeys.BLUE_STAR]: b,
                    [effectKeys.VIOLET_STAR]: alloc[effectKeys.VIOLET_STAR] + b,
                };
                if (await checkThreatSurvival(testAlloc, baseSim)) {
                    const unnasignedStars = remStars - b * 2;
                    return { testAlloc, unnasignedStars };
                }
            }
        }

        // Try Normal Blue
        if (remStars > 0) {
            const maxBlue = Math.min(
                Math.min(MAX_STARS, remStars),
                getEntityTotalHealth(postCommitAgent),
            );

            for (let b = 1; b <= maxBlue; b++) {
                await yieldToUI();

                const testAlloc = {
                    ...alloc,
                    [effectKeys.BLUE_STAR]: b,
                };
                if (await checkThreatSurvival(testAlloc, baseSim)) {
                    const unnasignedStars = remStars - b;
                    return { testAlloc, unnasignedStars };
                }
            }
        }

        return null;
    };

    const defensiveRelevantActions = [
        actionKeys.CHART,
        actionKeys.AEGIS,
        actionKeys.GUARD,
        actionKeys.ATTACK,
        actionKeys.HEAL,
        actionKeys.ATTUNE,
        actionKeys.SOUND_OF_SILENCE,
        actionKeys.BABEL,
        actionKeys.DA_CAPO,
    ];

    const simulate = createSimulator(context);
    let chosenAction = actionKeys.CHART;
    let foundSurvival = false;

    for (let defAct of defensiveRelevantActions) {
        if (!canUseAction(prev, agentKey, defAct)) {
            continue;
        }

        const simAction = simulate(defAct);

        // Direct survival without allocating new stars
        if (await checkThreatSurvival(allocations, simAction)) {
            chosenAction = defAct;
            foundSurvival = true;
            break;
        }

        // Try Augmented Green + Blue combinations
        if (remainingWhite > 0 && missingHp > 0) {
            const maxAugGreen = Math.min(
                missingHp,
                Math.floor(Math.min(MAX_STARS, remainingWhite) / 2),
            );

            for (let g = 1; g <= maxAugGreen; g++) {
                await yieldToUI();

                const testAlloc = {
                    ...allocations,
                    [effectKeys.GREEN_STAR]: g,
                    [effectKeys.VIOLET_STAR]:
                        allocations[effectKeys.VIOLET_STAR] + g,
                };
                const remStars = remainingWhite - g * 2;

                const distResult = await distributeSurvival(
                    testAlloc,
                    remStars,
                    simAction,
                );
                if (distResult) {
                    allocations = distResult.testAlloc;
                    remainingWhite = distResult.unnasignedStars;
                    chosenAction = defAct;
                    foundSurvival = true;
                    break;
                }
            }
        }

        if (foundSurvival) {
            break;
        }

        // Try Normal Green + Blue combinations
        if (remainingWhite > 0 && missingHp > 0) {
            const maxGreen = Math.min(
                missingHp,
                Math.min(MAX_STARS, remainingWhite),
            );

            for (let g = 1; g <= maxGreen; g++) {
                await yieldToUI();

                const testAlloc = {
                    ...allocations,
                    [effectKeys.GREEN_STAR]: g,
                };
                const remStars = remainingWhite - g;

                const distResult = await distributeSurvival(
                    testAlloc,
                    remStars,
                    simAction,
                );
                if (distResult) {
                    allocations = distResult.testAlloc;
                    remainingWhite = distResult.unnasignedStars;
                    chosenAction = defAct;
                    foundSurvival = true;
                    break;
                }
            }
        }

        if (foundSurvival) {
            break;
        }

        // Try Pure Blue
        if (remainingWhite > 0) {
            const distResult = await distributeSurvival(
                allocations,
                remainingWhite,
                simAction,
            );
            if (distResult) {
                allocations = distResult.testAlloc;
                remainingWhite = distResult.unnasignedStars;
                chosenAction = defAct;
                foundSurvival = true;
                break;
            }
        }
    }

    // Fallback if no defensive action ensures survival
    if (!foundSurvival && remainingWhite > 0) {
        allocations = {
            ...allocations,
            [effectKeys.BLUE_STAR]:
                allocations[effectKeys.BLUE_STAR] + remainingWhite,
        };
        remainingWhite = 0;
        chosenAction = actionKeys.CHART;
    }

    // === Engine ===

    // Orange
    if (remainingWhite > 0) {
        const simAction = simulate(chosenAction);

        const maxConsume = Math.max(
            0,
            consumeResources(postCommitAgent, Infinity, effectKeys.ORANGE_STAR)
                .resourcesConsumed.totalConsumption - 1,
        );

        const maxOrangePairs = Math.min(
            maxConsume,
            Math.floor(Math.min(MAX_STARS, remainingWhite) / 2),
        );

        let safeOrangePairs = 0;
        for (let o = maxOrangePairs; o >= 1; o--) {
            await yieldToUI();

            const testAlloc = {
                ...allocations,
                [effectKeys.ORANGE_STAR]: o,
                [effectKeys.VIOLET_STAR]:
                    allocations[effectKeys.VIOLET_STAR] + o,
            };

            if (await checkThreatSurvival(testAlloc, simAction)) {
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
            ? Math.floor(remainingWhite / 2)
            : remainingWhite;
        const violetAssign = balanced ? Math.ceil(remainingWhite / 2) : 0;

        allocations = {
            ...allocations,
            [effectKeys.INDIGO_STAR]: indigoAssign,
            [effectKeys.VIOLET_STAR]:
                allocations[effectKeys.VIOLET_STAR] + violetAssign,
        };
    }

    return [
        buildAction(allocations, commandKeys.ASSIGN_STARS),
        buildAction(chosenAction),
    ];
}

export function lunaticAI(context) {
    const { prev, agent, agentKey, nonAgentKey, nonAgent } = context;

    // Helper for building action
    const buildAction = (action, command = commandKeys.USE_ACTION) => {
        return {
            type: command,
            field: action,
        };
    };

    // Helper for building element
    const buildElement = (element, command = commandKeys.SET_ELEMENT) => {
        return {
            type: command,
            field: element,
        };
    };

    // Helper for build element + action array
    const buildElementAction = (element, action) => {
        return [buildElement(element), buildAction(action)];
    };

    // Helper for checking if an action/element combination is available
    const isActionElementAvailable = (sim, action, element) => {
        if (!isElementValid(extractEntity(sim, agentKey), element)) {
            return false;
        }

        return canUseAction(
            replaceEntity(
                sim,
                changeElement(extractEntity(sim, agentKey), element),
                agentKey,
            ),
            agentKey,
            action,
        );
    };

    // Helper function for using the simulations with the correct element
    const simWithElement = (element, actionKey, overrides = {}) => {
        const temporaryState = replaceEntity(
            overrides?.prev ?? prev,
            changeElement(overrides?.agent ?? agent, element),
            agentKey,
        );

        return createSimulator({
            agentKey,
            nonAgentKey,
            prev: temporaryState,
        })(actionKey);
    };

    // Helper for checking if an element is valid
    const isElementValid = (entity, element) => {
        if (!entity.states[effectKeys.SELENIAN]) {
            if (element === elementalKeys.DULLED) {
                return true;
            }

            return false;
        }

        if (isElementActive(entity, elementalKeys.SHATTERED)) {
            if (element === elementalKeys.SHATTERED) {
                return true;
            }

            return false;
        }

        return true;
    };

    // === Lethal Checks ===

    const relevantKillActions = [
        actionKeys.ATTACK,
        actionKeys.SPECIAL_ATTACK,
        actionKeys.LUNAR_STRIKE,
        // actionKeys.LUNAR_SMITE,
        actionKeys.CHALK,
        actionKeys.SHATTER,
    ];

    const relevantElements = Object.values(elementalKeys);

    const evalKill = (sim, history, depth) => {
        if (depth > 3) {
            console.log(`max depth reached: ${depth}`);
            return null;
        }

        for (let relAct of relevantKillActions) {
            for (let element of relevantElements) {
                // Skip invalid elements
                if (!isElementValid(agent, element)) {
                    continue;
                }

                // Skip unavailable actions
                if (!isActionElementAvailable(sim, relAct, element)) {
                    continue;
                }

                const simAction = simWithElement(element, relAct);

                if (
                    !willEntityDieImmediately(
                        extractEntity(simAction, agentKey),
                    ) &&
                    willEntityEffectivelyDieByNextUpkeep(
                        simAction,
                        nonAgentKey,
                        agentKey,
                    )
                ) {
                    return [...history, ...buildElementAction(element, relAct)];
                }

                if (FREE_ACTIONS.includes(relAct)) {
                    const freeResult = evalKill(
                        simAction,
                        [...history, ...buildElementAction(element, relAct)],
                        depth + 1,
                    );

                    if (freeResult) {
                        return freeResult;
                    }
                }
            }
        }

        return [];
    };

    const foundDeath = evalKill(prev, [], 0);
    if (foundDeath && foundDeath.length > 0) {
        return foundDeath;
    }

    // === General Logic ===

    // If not on selenian, enter
    if (!agent.states[effectKeys.SELENIAN]) {
        return buildAction(actionKeys.REFRACT);
    }

    // === Survival ===
    const simCommit = commitTurn(prev, agentKey, nonAgentKey);

    const evalSurvival = (sim, history, actionList, depth) => {
        if (depth > 3) {
            console.log(`max depth reached: ${depth}`);
            return null;
        }

        for (let action of actionList) {
            for (let element of relevantElements) {
                // Skip invalid elements
                if (!isElementValid(agent, element)) {
                    continue;
                }

                // Skip unavailable actions
                if (!isActionElementAvailable(sim, action, element)) {
                    continue;
                }

                const simAction = simWithElement(element, action);
                const simCommit = commitTurn(simAction, agentKey, nonAgentKey);

                if (
                    !willEntityDieImmediately(
                        extractEntity(simCommit, agentKey),
                    )
                ) {
                    return [...history, ...buildElementAction(element, action)];
                }

                if (FREE_ACTIONS.includes(action)) {
                    const freeResult = evalKill(
                        simAction,
                        [...history, ...buildElementAction(element, action)],
                        actionList,
                        depth + 1,
                    );

                    if (freeResult) {
                        return freeResult;
                    }
                }
            }
        }

        return [];
    };

    // If we'll die, check survival, pick first
    if (willEntityEffectivelyDie(extractEntity(simCommit, agentKey))) {
        const SURVIVAL_ACTION_LIST = [
            actionKeys.LUNAR_TIDE,
            actionKeys.ATTACK,
            actionKeys.LUNAR_STRIKE,
            actionKeys.LUNAR_GROWTH,
            actionKeys.LUNAR_SHED,
            actionKeys.LUNAR_SHROUD,
            // actionKeys.LUNAR_SMITE,
            actionKeys.AEGIS,
            actionKeys.GUARD,

            actionKeys.HEAL,

            actionKeys.SHATTER,
        ];

        const result = evalSurvival(prev, [], SURVIVAL_ACTION_LIST, 0);
        if (result && result.length > 0) {
            return result;
        }
    }

    // === Chalk ===

    if (
        !nonAgent.states[effectKeys.SELENIAN] &&
        !isElementActive(agent, elementalKeys.SHATTERED)
    ) {
        const simShatter = simWithElement(
            elementalKeys.ALBEDO,
            actionKeys.SHATTER,
        );
        const simChalk = simWithElement(
            elementalKeys.SHATTERED,
            actionKeys.CHALK,
            { prev: simShatter },
        );
        const simChalkCommit = commitTurn(simChalk, agentKey, nonAgentKey);
        const simNextTurn = processUpkeep(
            processMoonPhase(simChalkCommit),
            agentKey,
            nonAgentKey,
        );
        const simChalk2 = simWithElement(
            elementalKeys.SHATTERED,
            actionKeys.CHALK,
            { prev: simNextTurn },
        );

        const CHALK_SIMS = [
            simShatter,
            simChalk,
            simChalkCommit,
            simNextTurn,
            simChalk2,
        ];

        const evalChalk = () => {
            for (let sim of CHALK_SIMS) {
                if (willEntityDieImmediately(extractEntity(sim, agentKey))) {
                    return false;
                }

                if (
                    willEntityDieImmediately(extractEntity(sim, nonAgentKey)) &&
                    getEntityMaxHealth(extractEntity(sim, nonAgentKey)) <= 0
                ) {
                    return true;
                }
            }

            return false;
        };

        // If Chalk kills and we survive
        if (evalChalk()) {
            // If we're low, try growth
            if (getTrueEffectiveHealth(simChalkCommit, agentKey) <= 20) {
                const simGrowth = simWithElement(
                    elementalKeys.NATURE,
                    actionKeys.LUNAR_GROWTH,
                );

                if (
                    !willEntityDieImmediately(
                        extractEntity(
                            commitTurn(simGrowth, agentKey, nonAgentKey),
                            agentKey,
                        ),
                    )
                ) {
                    return buildElementAction(
                        elementalKeys.NATURE,
                        actionKeys.LUNAR_GROWTH,
                    );
                }
                // else, try tide
                else {
                    const simTide = simWithElement(
                        elementalKeys.OCEAN,
                        actionKeys.LUNAR_TIDE,
                    );
                    if (
                        !willEntityDieImmediately(
                            extractEntity(
                                commitTurn(simTide, agentKey, nonAgentKey),
                                agentKey,
                            ),
                        )
                    ) {
                        return buildElementAction(
                            elementalKeys.OCEAN,
                            actionKeys.LUNAR_TIDE,
                        );
                    }
                }
            }
            // if we're not low, go for the chalk kill
            else {
                return [
                    buildElement(elementalKeys.ALBEDO),
                    buildAction(actionKeys.SHATTER),
                    buildAction(actionKeys.CHALK),
                ];
            }
        }
    }

    // === Engine ===

    // Helper for engine evaluation
    const evalEngine = (sim, actionList, limiar) => {
        for (let action of actionList) {
            for (let element of relevantElements) {
                // Skip invalid elements
                if (!isElementValid(agent, element)) {
                    continue;
                }

                // Skip unavailable actions
                if (!isActionElementAvailable(sim, action, element)) {
                    continue;
                }

                const simAction = simWithElement(element, action);
                const simCommit = commitTurn(simAction, agentKey, nonAgentKey);

                if (getTrueEffectiveHealth(simCommit, agentKey) >= limiar) {
                    return buildElementAction(element, action);
                }
            }
        }

        return [];
    };

    // Waxing
    if (agent[effectKeys.MIRRORED_MOON] === moonKeys.WAXING) {
        // Sacrifice
        const simSac = simWithElement(
            elementalKeys.ALBEDO,
            actionKeys.SACRIFICE,
        );
        if (
            getTrueEffectiveHealth(
                commitTurn(simSac, agentKey, nonAgentKey),
                agentKey,
            ) >= 15 &&
            agent[effectKeys.BLOOD_SACRIFICE] < 7 &&
            isActionElementAvailable(
                prev,
                actionKeys.SACRIFICE,
                elementalKeys.ALBEDO,
            ) &&
            getEntityStr(changeElement(agent, elementalKeys.DULLED)) >= 8
        ) {
            return buildElementAction(
                elementalKeys.ALBEDO,
                actionKeys.SACRIFICE,
            );
        }

        // Lunar Strike
        const simStrike = simWithElement(
            elementalKeys.SCORCH,
            actionKeys.LUNAR_STRIKE,
        );
        if (
            getTrueEffectiveHealth(
                commitTurn(simStrike, agentKey, nonAgentKey),
                agentKey,
            ) >= 15 &&
            isActionElementAvailable(
                prev,
                actionKeys.SCORCH,
                elementalKeys.LUNAR_STRIKE,
            ) &&
            getEffectiveHealth(extractEntity(simStrike, nonAgentKey)) <=
                getEffectiveHealth(nonAgent) * 0.5
        ) {
            return buildElementAction(
                elementalKeys.SCORCH,
                actionKeys.LUNAR_STRIKE,
            );
        }

        // Mirror
        const simMirror = simWithElement(
            elementalKeys.WITHER,
            actionKeys.MIRROR,
        );
        if (
            getTrueEffectiveHealth(simMirror, agentKey) >= 15 &&
            agent[effectKeys.MOONLIGHT] <= 5 &&
            isActionElementAvailable(
                prev,
                actionKeys.MIRROR,
                elementalKeys.WITHER,
            )
        ) {
            return buildElementAction(elementalKeys.WITHER, actionKeys.MIRROR);
        }

        const WAXING_LIST = [
            actionKeys.LUNAR_SHED,
            actionKeys.LUNAR_STRIKE,
            
            actionKeys.LUNAR_GROWTH,
            actionKeys.LUNAR_TIDE,
            actionKeys.LUNAR_SHROUD,
            actionKeys.LUNAR_SMITE,

            actionKeys.AEGIS,
            actionKeys.GUARD,

            actionKeys.HEAL,
        ];

        const result15 = evalEngine(prev, WAXING_LIST, 15);
        if (result15 && result15.length > 0) {
            return result15;
        }

        const result1 = evalEngine(prev, WAXING_LIST, 1);
        if (result1 && result1.length > 0) {
            return result1;
        }
    }

    // Waning
    if (agent[effectKeys.MIRRORED_MOON] === moonKeys.WANING) {
        // Mirror
        const simMirror = simWithElement(
            elementalKeys.WITHER,
            actionKeys.MIRROR,
        );
        if (
            getTrueEffectiveHealth(simMirror, agentKey) >= 15 &&
            agent[effectKeys.MOONLIGHT] <= 5 &&
            isActionElementAvailable(
                prev,
                actionKeys.MIRROR,
                elementalKeys.WITHER,
            )
        ) {
            return buildElementAction(elementalKeys.WITHER, actionKeys.MIRROR);
        }

        const WANING_LIST = [
            actionKeys.LUNAR_SHROUD,
            actionKeys.AEGIS,
            actionKeys.LUNAR_GROWTH,
            actionKeys.LUNAR_TIDE,
            actionKeys.GUARD,

            actionKeys.LUNAR_SHED,
            actionKeys.LUNAR_STRIKE,
            actionKeys.LUNAR_SMITE,

            actionKeys.HEAL,
        ];

        const result15 = evalEngine(prev, WANING_LIST, 15);
        if (result15 && result15.length > 0) {
            return result15;
        }

        const result1 = evalEngine(prev, WANING_LIST, 1);
        if (result1 && result1.length > 0) {
            return result1;
        }
    }

    console.error("lunatic fallback");
    return buildAction(actionKeys.GUARD);
}

export async function seraphAI(context) {
    const { prev, agent, agentKey, nonAgentKey } = context;

    const simulate = createSimulator(context);
    const actionAvailable = createAvailabilityChecker(context);

    // Helper for building action array
    const buildAction = (action, command = commandKeys.USE_ACTION) => {
        return {
            type: command,
            field: action,
        };
    };

    if (actionAvailable(actionKeys.JUDGEMENT)) {
        return buildAction(actionKeys.JUDGEMENT);
    }

    // Simulate Special Attack
    // If it kills, use it
    const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(
            simSpecial,
            nonAgentKey,
            agentKey,
        ) &&
        actionAvailable(actionKeys.SPECIAL_ATTACK)
    ) {
        return buildAction(actionKeys.SPECIAL_ATTACK);
    }

    // Simulate Attack
    // If it kills, use it
    const simAttack = simulate(actionKeys.ATTACK);
    if (
        willEntityEffectivelyDieByNextUpkeep(
            simAttack,
            nonAgentKey,
            agentKey,
        ) &&
        actionAvailable(actionKeys.ATTACK)
    ) {
        return buildAction(actionKeys.ATTACK);
    }

    // On Cutoff Wings, play shadow sorcerer
    if (agent.states[effectKeys.CUTOFF_WINGS]) {
        return buildAction(shadowSorcererAI(context));
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
            getEntityDef(agent) * (13 - prev.roundCount),
            constants.MAX_DIVINE_SPARK,
        );
        if (
            agent[effectKeys.DIVINE_SPARK] >= threshold &&
            actionAvailable(actionKeys.ASCEND)
        ) {
            return buildAction(actionKeys.ASCEND);
        }

        // Turn end death prevention (Radiance, dissonance, overflow)
        if (willEntityEffectivelyDieByNextCommit(prev, agentKey)) {
            // Use Ascend if available
            if (actionAvailable(actionKeys.ASCEND)) {
                return buildAction(actionKeys.ASCEND);
            }

            return commitDeathPrevention(prev, agentKey);
        }

        // Sacrifice logic (boost attr)
        const simSac = simulate(actionKeys.SACRIFICE);
        if (
            getEntityDef(agent) <= 5 &&
            getTrueEffectiveHealth(
                commitTurn(simSac, agentKey, nonAgentKey),
                agentKey,
            ) >= 15
        ) {
            return buildAction(actionKeys.SACRIFICE);
        }

        // default: Aegis
        return buildAction(actionKeys.AEGIS);
    }

    // === Ascendence ===

    // Helper for calculating score
    const rateSim = (sim) => {
        let simPostCommit = commitTurn(sim, agentKey, nonAgentKey);
        let postSim = processUpkeep(simPostCommit, agentKey, nonAgentKey);

        // Calculates eye state during opponents turn
        let trueEye =
            simPostCommit?.btt?.[effectKeys.EYE_OF_HEAVENS] ?? eyeKeys.DORMANT;
        if (
            trueEye !== eyeKeys.DORMANT &&
            simPostCommit?.startingPlayer !== agentKey
        ) {
            trueEye = trueEye === eyeKeys.OPEN ? eyeKeys.CLOSED : eyeKeys.OPEN;
        }

        const commitAgent = extractEntity(simPostCommit, agentKey);
        const upkeepAgent = extractEntity(postSim, agentKey);

        const commitNonAgent = extractEntity(simPostCommit, nonAgentKey);

        // Lowest score on lose
        if (
            willEntityEffectivelyDie(commitAgent) ||
            willEntityEffectivelyDie(upkeepAgent) ||
            willEntityEffectivelyDie(extractEntity(sim, agentKey))
        ) {
            return -Infinity;
        }

        // Highest score on win
        if (willEntityEffectivelyDie(commitNonAgent)) {
            return Infinity;
        }

        let score = 0;

        score += -upkeepAgent[effectKeys.TARNISHED_SIN]; // Lose score by sin on self at turn start
        score += commitNonAgent[effectKeys.TARNISHED_SIN] * 2; // Gain score for sin on the opponent at turn end
        score += postSim.btt[effectKeys.PROVIDENCE]; // Gain score for prov in the battlefield at turn start

        const missingEnlitPercent =
            getMaxEnlit(commitAgent) > 0
                ? Math.max(
                      0,
                      getMaxEnlit(commitAgent) - getTotalEnlit(commitAgent),
                  ) / getMaxEnlit(commitAgent)
                : 0;
        score -= missingEnlitPercent * 100; // lose score for missing enlit on self at turn end

        score -=
            commitAgent[effectKeys.STARS_OF_APOCALYPSE] *
            constants.APOC_DISGRACE; // lose score for having stars of apoc on self at turn end
        score -=
            Math.max(0, commitAgent.resources[effectKeys.SACRED_FLAMES] - 10) *
            2.5; // lose points for having high flames on self at turn end

        // lose/gain score based on hallowed echoes at turn end (negative = disgrace = lose score, positive = grace = gain score)
        score += commitAgent[effectKeys.HALLOWED_ECHOES];

        const halvedTEProv =
            postSim.btt[effectKeys.PROVIDENCE] * constants.SERAPHIM_MULT;
        const halvedTEMissProv =
            (constants.MAX_PROVIDENCE - postSim.btt[effectKeys.PROVIDENCE]) *
            constants.SERAPHIM_MULT;

        if (isEdictActive(commitAgent, edictKeys.SERAPHIM)) {
            if (trueEye === eyeKeys.OPEN) {
                score += halvedTEProv;
                score -= halvedTEMissProv;
            }
            if (trueEye === eyeKeys.CLOSED) {
                score -= halvedTEProv;
                score += halvedTEMissProv;
            }
        }

        return score;
    };

    const getTrueSin = (sim) => {
        let simPostCommit = commitTurn(sim, agentKey, nonAgentKey);
        let postSim = processUpkeep(simPostCommit, agentKey, nonAgentKey);

        const commitAgent = extractEntity(simPostCommit, agentKey);
        const upkeepAgent = extractEntity(postSim, agentKey);

        return Math.max(
            commitAgent[effectKeys.TARNISHED_SIN],
            upkeepAgent[effectKeys.TARNISHED_SIN],
        );
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

        // Always on with Condemn if Virtues is unlocked, unless at low health
        if (
            !edicts[edictKeys.ANGELS] &&
            isEdictUnlocked(draftAgent, edictKeys.ANGELS) &&
            isEdictUnlocked(draftAgent, edictKeys.VIRTUES) &&
            command.field === actionKeys.CONDEMN &&
            getTotalEnlit(draftAgent) > 1
        ) {
            return false;
        }

        // Always off if not Condemn
        if (edicts[edictKeys.ANGELS] && command.field !== actionKeys.CONDEMN) {
            return false;
        }

        // Always off at low health
        if (edicts[edictKeys.ANGELS] && getTotalEnlit(draftAgent) <= 1) {
            return false;
        }

        // === Archangels ===

        // Always on, unless high true sin
        if (
            !edicts[edictKeys.ARCHANGELS] &&
            isEdictUnlocked(draftAgent, edictKeys.ARCHANGELS) &&
            getTrueSin(sim) < 70
        ) {
            return false;
        }

        // On high true sin, always off
        if (
            edicts[edictKeys.ARCHANGELS] &&
            isEdictUnlocked(draftAgent, edictKeys.ARCHANGELS) &&
            getTrueSin(sim) >= 70
        ) {
            return false;
        }

        // === Principalities ===

        // Always off, unless we're using Supplicate
        if (
            edicts[edictKeys.PRINCIPALITIES] &&
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

        let currentAgent = extractEntity(sim, agentKey);

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
            currentAgent = extractEntity(sim, agentKey);

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
                    // Use if Enlightenment after use <= 60%
                    if (
                        getTotalEnlit(currentAgent) -
                            getMaxEnlit(currentAgent) *
                                constants.BLAS_TARNISH <=
                        getMaxEnlit(currentAgent) * 0.6
                    ) {
                        const index = currentAgent?.[
                            effectKeys.CODEX_OF_BLASPHEMY
                        ].indexOf(blasphemyKeys.YESTERDAY);

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

                // Today
                if (
                    countBlasphemies(
                        currentAgent?.[effectKeys.CODEX_OF_BLASPHEMY],
                        blasphemyKeys.TODAY,
                    ) > 0
                ) {
                    // Use if Providence >= 40%
                    if (sim.btt[effectKeys.PROVIDENCE] >= 40) {
                        const index = currentAgent?.[
                            effectKeys.CODEX_OF_BLASPHEMY
                        ].indexOf(blasphemyKeys.TODAY);

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
                    // Use if Sin >= 40%
                    if (currentAgent?.[effectKeys.TARNISHED_SIN] >= 40) {
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
