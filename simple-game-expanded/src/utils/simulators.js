import { constants } from "./constants.js";
import {
    consumeResources,
    createBaseEntity,
    restoreResources,
    gainMana,
    loseMana,
    gainHp,
    exitAllStates,
    getEntityDef,
    getEntityStr,
    loseHp,
    getEntityMaxHealth,
    getEntityTotalMana,
    addRune,
    translateElementIntoCrystals,
    newDealDmg,
    gainEnlit,
    resetAttr,
    raiseProvidence,
    deleteCondition,
    getTotalEnlit,
    loseEnlit,
    replaceEntity,
    extractEntity,
    getFortitude,
    advanceChoir,
    processExitAscendence,
    isEdictActive,
    getRevelation,
    getMaxMana,
    getMissingHealth,
    gainSin,
    getMissingMana,
    processExitWeaponsDeployed,
    consumeLimitedResources,
    getSpAtkCost,
    getEntityTotalHealth,
    processExitUmbral,
} from "./entities.js";
import {
    actionKeys,
    choirKeys,
    dmgTypes,
    edictKeys,
    effectKeys,
    elementalKeys,
    entryTypes,
    runeKeys,
    tarnishTypes,
} from "./enums.js";

export const simulators = {
    [actionKeys.ATTACK]: simulateAttack,
    [actionKeys.GUARD]: simulateGuard,
    [actionKeys.HEAL]: simulateHeal,
    [actionKeys.SPECIAL_ATTACK]: simulateSpecialAttack,

    [actionKeys.SACRIFICE]: simulateSacrifice,

    [actionKeys.SHADOW_PACT]: simulateShadowPact,
    [actionKeys.BLACK_MAYHEM]: simulateBlackMayhem,
    [actionKeys.SHADOW_MANTLE]: simulateShadowMantle,
    [actionKeys.RITUAL_OF_ASH]: simulateRitualOfAsh,
    [actionKeys.DARK_PROMISE]: simulateDarkPromise,

    [actionKeys.ATTUNE]: simulateAttune,
    [actionKeys.DA_CAPO]: simulateDaCapo,
    [actionKeys.SOUND_OF_SILENCE]: simulateSoundOfSilence,
    [actionKeys.BABEL]: simulateBabel,

    [actionKeys.DEPLOY]: simulateDeploy,
    [actionKeys.LASER]: simulateLaser,
    [actionKeys.MELTDOWN]: simulateMeltdown,

    [actionKeys.CHART]: simulateChart,

    // Paladin
    [actionKeys.AEGIS]: simulateAegis,

    // Lunatic
    [actionKeys.REFRACT]: simulateRefract,
    [actionKeys.MIRROR]: simulateMirror,
    [actionKeys.SHATTER]: simulateShatter,
    [actionKeys.CHALK]: simulateChalk,

    [actionKeys.LUNAR_STRIKE]: simulateLunarStrike,
    [actionKeys.LUNAR_SMITE]: simulateLunarSmite,
    [actionKeys.LUNAR_GROWTH]: simulateLunarGrowth,
    [actionKeys.LUNAR_SHROUD]: simulateLunarShroud,
    [actionKeys.LUNAR_TIDE]: simulateLunarTide,
    [actionKeys.LUNAR_SHED]: simulateLunarShed,

    // Array
    [actionKeys.CARVE]: simulateCarve,
    [actionKeys.CURSE]: simulateCurse,

    // Seraph
    [actionKeys.ASCEND]: simulateAscend,
    [actionKeys.RISE]: simulateRise,
    [actionKeys.CONDEMN]: simulateCondemn,
    [actionKeys.SUPPLICATE]: simulateSupplicate,
    [actionKeys.DISCERN]: simulateDiscern,
    [actionKeys.ATONE]: simulateAtone,
    [actionKeys.JUDGEMENT]: simulateJudgment,
};

function simulateGuard({ prev, agent, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    // Guard
    draftAgent = {
        ...draftAgent,
        states: {
            ...draftAgent.states,
            [effectKeys.GUARDING_STATE]: true,
        },
    };

    // Visionary
    if (draftAgent.states[effectKeys.VISIONARY]) {
        draftAgent = {
            ...draftAgent,
            resources: {
                ...draftAgent.resources,
                [effectKeys.PRECOGNITION]:
                    draftAgent.resources[effectKeys.PRECOGNITION] +
                    getMaxMana(agent) * constants.GUARD_MANA_REGEN,
            },
        };
    } else {
        // Replenish missing mana
        draftAgent = gainMana(
            draftAgent,
            Math.min(
                getMissingMana(draftAgent),
                getMaxMana(agent) * constants.GUARD_MANA_REGEN,
            ),
        );
    }

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateAegis({ prev, agent, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);
    const haloGain = Math.ceil(getEntityDef(agent) * constants.HALO_GEN_MULT);

    draftAgent = {
        ...draftAgent,
        resources: {
            ...draftAgent.resources,
            [effectKeys.HALO]: draftAgent.resources[effectKeys.HALO] + haloGain,
        },
        states: {
            ...draftAgent.states,
            [effectKeys.RADIANT]: true,
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateSacrifice({ prev, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    draftAgent = {
        ...draftAgent,
        states: {
            ...draftAgent.states,
            [effectKeys.CEREMONIAL]: true,
        },
    };

    const hpLoss = Math.ceil(
        draftAgent[effectKeys.HEALTH] * constants.SAC_HP_CONSUMPTION,
    );

    draftAgent = loseHp(draftAgent, hpLoss);

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateAttack({ prev, agent, agentKey, nonAgentKey }) {
    const radiance = agent.resources[effectKeys.RADIANCE];

    let post = {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...prev.entities[agentKey],
                resources: {
                    ...prev.entities[agentKey].resources,
                    [effectKeys.RADIANCE]: 0,
                },
            },
        },
    };

    post = newDealDmg(
        post,
        getEntityStr(agent),
        nonAgentKey,
        dmgTypes.PHYSICAL,
        agentKey,
        radiance,
    );

    return post;
}

function simulateSpecialAttack({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);
    const cost = getSpAtkCost(draftAgent);

    // Visionary
    if (draftAgent.states[effectKeys.VISIONARY]) {
        const precogConsumed = Math.min(
            cost,
            draftAgent.resources[effectKeys.PRECOGNITION],
        );

        draftAgent = {
            ...draftAgent,
            resources: {
                ...draftAgent.resources,
                [effectKeys.PRECOGNITION]:
                    draftAgent.resources[effectKeys.PRECOGNITION] -
                    precogConsumed,
            },
        };

        draftAgent = loseMana(draftAgent, cost - precogConsumed);
    } else {
        draftAgent = loseMana(draftAgent, cost);
    }

    post = replaceEntity(post, draftAgent, agentKey);

    const manaDiff =
        getEntityTotalMana(extractEntity(post, agentKey)) -
        getEntityTotalMana(extractEntity(post, nonAgentKey));

    post = newDealDmg(
        post,
        getEntityStr(extractEntity(post, agentKey)),
        [nonAgentKey],
        dmgTypes.PIERCING,
        agentKey,
        manaDiff,
    );

    if (manaDiff > 0) {
        post = replaceEntity(
            post,
            gainMana(extractEntity(post, nonAgentKey), manaDiff),
            nonAgentKey,
        );
    } else if (manaDiff < 0) {
        post = replaceEntity(
            post,
            gainMana(extractEntity(post, agentKey), -manaDiff),
            agentKey,
        );
    }

    return post;
}

function simulateHeal({ prev, agent, agentKey }) {
    let draftAgent = {
        ...agent,
    };

    // Blood Sacrifice
    if (draftAgent[effectKeys.BLOOD_SACRIFICE] > 0) {
        const bsLost = Math.floor(
            draftAgent[effectKeys.BLOOD_SACRIFICE] * constants.DEFENSE_BS,
        );

        draftAgent = {
            ...draftAgent,
            [effectKeys.BLOOD_SACRIFICE]:
                draftAgent[effectKeys.BLOOD_SACRIFICE] - bsLost,
        };

        draftAgent = gainHp(draftAgent, bsLost);
    }

    // Visionary
    if (draftAgent.states[effectKeys.VISIONARY]) {
        const base_heal = Math.min(
            getMissingHealth(draftAgent),
            getEntityTotalMana(draftAgent) +
                draftAgent.resources[effectKeys.PRECOGNITION],
        );

        const precogConsumed = Math.min(
            base_heal,
            draftAgent.resources[effectKeys.PRECOGNITION],
        );

        draftAgent = {
            ...draftAgent,
            resources: {
                ...draftAgent.resources,
                [effectKeys.PRECOGNITION]:
                    draftAgent.resources[effectKeys.PRECOGNITION] -
                    precogConsumed,
            },
        };

        draftAgent = loseMana(draftAgent, base_heal - precogConsumed);
        draftAgent = gainHp(draftAgent, base_heal);
    } else {
        const base_heal = Math.min(
            getMissingHealth(draftAgent),
            getEntityTotalMana(draftAgent),
        );

        draftAgent = loseMana(draftAgent, base_heal);
        draftAgent = gainHp(draftAgent, base_heal);
    }

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
            },
        },
    };
}

function simulateShadowPact({ prev, agentKey, nonAgentKey }) {
    let post = exitAllStates(prev, agentKey, nonAgentKey);

    let draftAgent = extractEntity(post, agentKey);

    draftAgent = {
        ...draftAgent,
        resources: {
            ...draftAgent.resources,
            [effectKeys.LINGERING_EMBER]:
                draftAgent.resources[effectKeys.LINGERING_EMBER] +
                Math.floor(getEntityDef(draftAgent) * constants.PACT_DEF_GAIN),
            [effectKeys.SHADOWFLAME]:
                draftAgent.resources[effectKeys.SHADOWFLAME] +
                Math.floor(getEntityStr(draftAgent) * constants.PACT_STR_GAIN),
        },
    };

    draftAgent = {
        ...draftAgent,
        [effectKeys.MAX_UNRELENTING_SHADOWS]: constants.MAX_SHADOWS_PACT,
        states: {
            ...draftAgent.states,
            [effectKeys.UMBRAL_CORE]: true,
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateShadowMantle({ prev, agent, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    draftAgent = restoreResources(
        draftAgent,
        Math.floor(
            agent.resources[effectKeys.SHADOWFLAME] * constants.EMBRACE_RESTORE,
        ),
    );

    draftAgent = {
        ...draftAgent,
        states: {
            ...draftAgent.states,
            [effectKeys.DARK_EMBRACE]: true,
        },
    };

    return replaceEntity(post, draftAgent, agentKey);
}

function simulateRitualOfAsh({ prev, agent, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    draftAgent = {
        ...draftAgent,
        resources: {
            ...agent.resources,
            [effectKeys.LINGERING_EMBER]:
                agent.resources[effectKeys.LINGERING_EMBER] +
                Math.floor(
                    agent.resources[effectKeys.SHADOWFLAME] *
                        constants.RITUAL_SHADOW_ASH,
                ),
            [effectKeys.SHADOWFLAME]: 0,
        },
    };

    return replaceEntity(post, draftAgent, agentKey);
}

function simulateDarkPromise({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);
    let draftNonAgent = extractEntity(post, nonAgentKey);

    const toBeRestored = Math.floor(
        draftAgent.resources[effectKeys.SHADOWFLAME] / 2,
    );

    draftAgent = {
        ...draftAgent,
        [effectKeys.UNRELENTING_SHADOWS]: 0,
        resources: {
            ...draftAgent.resources,
            [effectKeys.SHADOWFLAME]: 0,
            [effectKeys.LINGERING_EMBER]: 0,
            [effectKeys.CINDERS]: 0,
        },
        states: {
            ...draftAgent.states,
            [effectKeys.DIMMING_DARKNESS]: true,
        },
    };

    draftAgent = restoreResources(draftAgent, toBeRestored);
    draftNonAgent = restoreResources(draftNonAgent, toBeRestored);

    post = replaceEntity(post, draftAgent, agentKey);
    post = replaceEntity(post, draftNonAgent, nonAgentKey);

    post = processExitUmbral(post, agentKey);

    return post;
}

function simulateBlackMayhem({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);
    let draftNonAgent = extractEntity(post, nonAgentKey);

    const burn = draftAgent.resources[effectKeys.SHADOWFLAME];

    const resultAgent = consumeResources(
        draftAgent,
        burn,
        actionKeys.BLACK_MAYHEM,
    );
    draftAgent = resultAgent.draftEntity;

    const resultNonAgent = consumeResources(
        draftNonAgent,
        burn,
        actionKeys.BLACK_MAYHEM,
    );
    draftNonAgent = resultNonAgent.draftEntity;

    const cinderGain =
        resultAgent.resourcesConsumed.totalConsumption +
        resultNonAgent.resourcesConsumed.totalConsumption -
        (resultAgent.resourcesConsumed[effectKeys.CINDERS] ?? 0) -
        (resultNonAgent.resourcesConsumed[effectKeys.CINDERS] ?? 0);

    draftAgent = {
        ...draftAgent,
        resources: {
            ...draftAgent.resources,
            [effectKeys.CINDERS]:
                draftAgent.resources[effectKeys.CINDERS] + cinderGain,
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);
    post = replaceEntity(post, draftNonAgent, nonAgentKey);

    return post;
}

function simulateAttune({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                sonority: constants.STARTING_SONORITY,
                states: {
                    ...agent.states,
                    resonant: true,
                },
            },
            [nonAgentKey]: {
                ...nonAgent,
            },
        },
    };
}

function simulateDaCapo({ prev, agent, agentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...createBaseEntity(),
                attributes: {
                    ...agent.attributes,
                },
                controller: agent.controller,
                statDistributionMode: agent.statDistributionMode,
                unspentPoints: agent.unspentPoints,
            },
        },
    };
}

function simulateSoundOfSilence({ prev, agent, agentKey }) {
    const newSonority = -agent[effectKeys.SONORITY];

    const musicalShift = Math.abs(newSonority * 2);

    const draftAgent = {
        ...agent,
        [effectKeys.SONORITY]: newSonority,
        resources: {
            ...agent.resources,
            [effectKeys.HARMONY]: Math.floor(
                musicalShift * constants.SILENCE_RATE,
            ),
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
            },
        },
    };
}

function simulateBabel({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const newSonority = -agent[effectKeys.SONORITY];

    const musicalShift = Math.abs(newSonority * 2);

    const draftAgent = {
        ...agent,
        [effectKeys.SONORITY]: newSonority,
    };
    const draftNonAgent = {
        ...nonAgent,
        resources: {
            ...nonAgent.resources,
            [effectKeys.DISSONANCE]: Math.floor(
                musicalShift * constants.BABEL_RATE,
            ),
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
            },
            [nonAgentKey]: {
                ...draftNonAgent,
            },
        },
    };
}

function simulateDeploy({ prev, agent, agentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                states: {
                    ...agent.states,
                    deployment: true,
                },
            },
        },
    };
}

function simulateLaser({ prev, agent, agentKey, nonAgentKey }) {
    const post = newDealDmg(
        prev,
        agent[effectKeys.ENERGY_LEVEL],
        nonAgentKey,
        dmgTypes.PIERCING,
        agentKey,
    );

    let draftAgent = {
        ...post.entities[agentKey],
    };

    const newOverheat =
        draftAgent[effectKeys.OVERHEAT] +
        10 * (1 + draftAgent.lasersUsedThisTurn);
    const newDynamo = Math.min(
        constants.MAX_DYNAMO,
        draftAgent[effectKeys.DYNAMO] + 10,
    );
    const newlasersUsedThisTurn = draftAgent.lasersUsedThisTurn + 1;

    draftAgent = {
        ...draftAgent,
        [effectKeys.OVERHEAT]: newOverheat,
        [effectKeys.DYNAMO]: newDynamo,
        lasersUsedThisTurn: newlasersUsedThisTurn,
        states: {
            ...draftAgent.states,
            [effectKeys.THERMAL_OVERLOAD]:
                newOverheat >= constants.MAX_OVERHEAT,
        },
    };

    return {
        ...post,
        entities: {
            ...post.entities,
            [agentKey]: {
                ...draftAgent,
            },
        },
    };
}

function simulateMeltdown({ prev, agent, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    const baseDmg = Math.floor(
        (agent[effectKeys.ENERGY_LEVEL] +
            Math.floor(agent[effectKeys.DYNAMO] / 10)) *
            (agent[effectKeys.OVERHEAT] / constants.MAX_OVERHEAT),
    );

    draftAgent = {
        ...draftAgent,
        [effectKeys.DYNAMO]: 0,
        [effectKeys.OVERHEAT]: 0,
    };

    post = replaceEntity(post, draftAgent, agentKey);

    post = newDealDmg(
        post,
        baseDmg,
        [agentKey, nonAgentKey],
        dmgTypes.PHYSICAL,
        [agentKey],
    );

    draftAgent = extractEntity(post, agentKey);

    draftAgent = {
        ...draftAgent,
        states: {
            ...draftAgent.states,
            [effectKeys.THERMAL_OVERLOAD]: false,
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);

    post = processExitWeaponsDeployed(post, agentKey);

    return post;
}

function simulateChart({ prev, agent, agentKey }) {
    const newWhite =
        agent.stars[effectKeys.GRAY_STAR] +
        agent.stars[effectKeys.WHITE_STAR] +
        constants.CHART_STAR_GAIN;

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                stars: {
                    ...agent.stars,
                    [effectKeys.WHITE_STAR]: newWhite,
                    [effectKeys.GRAY_STAR]: 0,
                },
                states: {
                    ...agent.states,
                    [effectKeys.STARGAZER]: true,
                },
            },
        },
    };
}

function simulateRefract({ prev, agent, agentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                states: {
                    ...agent.states,
                    [effectKeys.SELENIAN]: true,
                },
            },
        },
    };
}

function simulateMirror({ prev, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    draftAgent = {
        ...draftAgent,
        [effectKeys.MOONLIGHT]:
            draftAgent[effectKeys.MOONLIGHT] + constants.MIRROR_ML_GAIN,
        [effectKeys.LUNACY]: Math.min(
            constants.MAX_LUNACY,
            draftAgent[effectKeys.LUNACY] +
                draftAgent.resources[effectKeys.MOONSHINE] *
                    constants.MOONSHINE_LUNACY_GAIN,
        ),
        resources: {
            ...draftAgent.resources,
            [effectKeys.MOONSHINE]: 0,
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateShatter({ prev, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    draftAgent = {
        ...draftAgent,
        [effectKeys.ELEMENTAL_CRYSTALS]: translateElementIntoCrystals(
            elementalKeys.SHATTERED,
        ),
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateChalk({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    const dmgDealt = Math.floor(
        draftAgent[effectKeys.LUNACY] / constants.LUNACY_CHALK,
    );

    draftAgent = {
        ...draftAgent,
        [effectKeys.LUNACY]: 0,
    };

    post = replaceEntity(post, draftAgent, agentKey);

    post = newDealDmg(post, dmgDealt, [nonAgentKey], dmgTypes.LUNIC, agentKey);

    return post;
}

function simulateLunarTide({ prev, agent, agentKey }) {
    const { draftEntity, resourcesConsumed } = consumeResources(
        agent,
        agent[effectKeys.MOONLIGHT] * constants.LUNAR_TIDE_MULT,
        actionKeys.LUNAR_TIDE,
    );

    const draftAgent = restoreResources(
        draftEntity,
        resourcesConsumed.totalConsumption,
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
            },
        },
    };
}

function simulateLunarGrowth({ prev, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    draftAgent = restoreResources(
        draftAgent,
        draftAgent[effectKeys.MOONLIGHT] +
            draftAgent.resources[effectKeys.MOONSHINE],
    );

    draftAgent = {
        ...draftAgent,
        states: {
            ...draftAgent.states,
            [effectKeys.MOON_DEW]: true,
        },
        resources: {
            ...draftAgent.resources,
            [effectKeys.MOONSHINE]: 0,
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateLunarStrike({ prev, agent, agentKey, nonAgentKey }) {
    const post = newDealDmg(
        prev,
        Math.floor(getEntityStr(agent) / 2) +
            agent.resources[effectKeys.MOONSHINE],
        nonAgentKey,
        dmgTypes.TRUE,
        agentKey,
    );

    return {
        ...post,
        entities: {
            ...post.entities,
            [agentKey]: {
                ...post.entities[agentKey],
                resources: {
                    ...post.entities[agentKey].resources,
                    [effectKeys.MOONSHINE]: 0,
                },
            },
        },
    };
}

function simulateLunarSmite({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    const toBeConsumed = Math.floor(
        consumeLimitedResources(draftAgent, Infinity, elementalKeys.ASH)
            .limitedResourcesConsumed.totalLimitedResourcesConsumption *
            constants.ASH_CONSUME,
    );

    const result = consumeLimitedResources(
        draftAgent,
        toBeConsumed,
        elementalKeys.ASH,
    );

    draftAgent = result.draftEntity;

    post = replaceEntity(post, draftAgent, agentKey);

    post = newDealDmg(
        post,
        result.limitedResourcesConsumed.totalLimitedResourcesConsumption,
        nonAgentKey,
        dmgTypes.PIERCING,
        agentKey,
    );

    return {
        ...post,
    };
}

function simulateLunarShroud({ prev, agent, agentKey }) {
    const draftAgent = {
        ...agent,
        states: {
            ...agent.states,
            [effectKeys.PRISMATIC]: true,
        },
        resources: {
            ...agent.resources,
            [effectKeys.REFRACTED_DIVINITY]: getEntityDef(agent),
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
            },
        },
    };
}

function simulateLunarShed({ prev, agentKey }) {
    let post = {
        ...prev,
    };
    let draftAgent = extractEntity(post, agentKey);

    const hpLost = Math.ceil(
        getEntityTotalHealth(draftAgent) * constants.SHED_LOSS,
    );

    draftAgent = loseHp(draftAgent, hpLost);

    draftAgent = {
        ...draftAgent,
        resources: {
            ...draftAgent.resources,
            [effectKeys.MYCELIUM]:
                draftAgent.resources[effectKeys.MYCELIUM] + hpLost,
        },
        states: {
            ...draftAgent.states,
            [effectKeys.GIBBOUS]: true,
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateCarve({ prev, agent, agentKey }) {
    let draftAgent = {
        ...agent,
    };

    draftAgent = {
        ...draftAgent,
        states: {
            ...draftAgent.states,
            [effectKeys.VISIONARY]: true,
        },
        // resources: {
        //     ...draftAgent.resources,
        //     [effectKeys.CONJECTURE]:
        //         draftAgent.resources[effectKeys.CONJECTURE] +
        //         getEntityStr(draftAgent),
        // },
    };

    return replaceEntity(prev, draftAgent, agentKey);
}

function simulateCurse({ prev, agent, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    const arrayLength = agent?.[effectKeys.RUNIC_ARRAY]?.length || 0;

    for (let i = 0; i < arrayLength; i++) {
        const currRune = post.entities[agentKey][effectKeys.RUNIC_ARRAY][0];

        if (currRune === runeKeys.EMPTY) {
            post = newDealDmg(
                post,
                constants.CURSE_EMPTY_RUNE_DMG *
                    getEntityMaxHealth(post.entities[agentKey]),
                agentKey,
                dmgTypes.TRUE,
                null,
            );
        }

        post = addRune(post, agentKey, nonAgentKey, runeKeys.EMPTY);
    }

    return post;
}

function simulateRise({ prev, agentKey, nonAgentKey }) {
    let post = exitAllStates(prev, agentKey, nonAgentKey);
    let draftAgent = extractEntity(post, agentKey);

    draftAgent = {
        ...draftAgent,
        attributes: {
            ...draftAgent.attributes,
            def: {
                ...draftAgent.attributes.def,
                value:
                    draftAgent.attributes.def.value +
                    getEntityStr(draftAgent) * constants.RISE_DEF_RATE,
            },
        },
        states: {
            ...draftAgent.states,
            [effectKeys.ZENITH_OF_MORTALITY]: true,
        },
        resources: {
            ...draftAgent.resources,
            [effectKeys.WISDOM]:
                draftAgent.resources[effectKeys.WISDOM] +
                getEntityStr(draftAgent) * constants.WISDOM_STR_RATE,
        },
    };

    return replaceEntity(post, draftAgent, agentKey);
}

function simulateAscend({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    post = exitAllStates(post, agentKey, nonAgentKey);

    let draftAgent = {
        ...post.entities[agentKey],
    };

    const result = consumeResources(draftAgent, Infinity, actionKeys.ASCEND);

    draftAgent = result.draftEntity;

    draftAgent = {
        ...draftAgent,
        [effectKeys.MAX_ENLIGHTENMENT]:
            getEntityMaxHealth(draftAgent) + getMaxMana(draftAgent),
        [effectKeys.MAX_HEALTH]: 0,
        [effectKeys.MAX_MANA]: 0,
    };

    draftAgent = gainEnlit(
        draftAgent,
        result.resourcesConsumed.totalLimitedResourcesConsumption,
    );

    draftAgent = gainSin(
        draftAgent,
        (result.resourcesConsumed.totalConsumption -
            result.resourcesConsumed.totalLimitedResourcesConsumption -
            (result.resourcesConsumed?.[effectKeys.WISDOM] ?? 0) -
            (result.resourcesConsumed?.[effectKeys.RADIANCE] ?? 0)) *
            constants.BASE_SIN_GAIN,
    );

    draftAgent = {
        ...draftAgent,
        [effectKeys.REVELATION]: getEntityStr(draftAgent),
        [effectKeys.FORTITUDE]: getEntityDef(draftAgent),
    };

    draftAgent = resetAttr(draftAgent);

    const choirsSkipped = Math.floor(
        draftAgent[effectKeys.DIVINE_SPARK] / constants.ASCEND_SKIP_RATE,
    );
    const provGain =
        (result.resourcesConsumed?.[effectKeys.WISDOM] ?? 0) *
            constants.WISDOM_PROV +
        (result.resourcesConsumed?.[effectKeys.RADIANCE] ?? 0) *
            constants.WISDOM_PROV +
        draftAgent[effectKeys.DIVINE_SPARK];

    post = {
        ...post,
        entities: {
            ...post.entities,
            [agentKey]: {
                ...draftAgent,
                [effectKeys.DIVINE_SPARK]: 0,
            },
        },
    };

    post = {
        ...post,
        entities: {
            ...post.entities,
            [agentKey]: {
                ...post.entities[agentKey],
                states: {
                    ...post.entities[agentKey].states,
                    [effectKeys.ASCENDENCE_OF_SPIRIT]: true,
                },
                [entryTypes.HEAVENLY_CHOIR]: choirKeys.FIRST,
            },
        },
    };

    for (let i = 0; i < choirsSkipped; i++) {
        post = advanceChoir(post, agentKey);
    }

    post = raiseProvidence(post, provGain);

    return post;
}

function simulateCondemn({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);
    let extraFinalDmg = 0;
    let extraBaseDmg = 0;

    // Edict of Angels
    if (isEdictActive(draftAgent, edictKeys.ANGELS)) {
        const enlitConsumed = Math.floor(
            getTotalEnlit(draftAgent) * constants.ANGEL_LOSE,
        );
        draftAgent = loseEnlit(draftAgent, enlitConsumed);

        extraFinalDmg += enlitConsumed;
    }

    // Sacrilege
    if (draftAgent.resources[effectKeys.SACRILEGE] > 0) {
        extraBaseDmg += draftAgent.resources[effectKeys.SACRILEGE];

        draftAgent = {
            ...draftAgent,
            resources: {
                ...draftAgent.resources,
                [effectKeys.SACRILEGE]: 0,
            },
        };
    }

    post = replaceEntity(post, draftAgent, agentKey);

    post = newDealDmg(
        post,
        getRevelation(post, agentKey) + extraBaseDmg,
        [nonAgentKey],
        tarnishTypes.PHYSICAL,
        agentKey,
        extraFinalDmg,
    );

    draftAgent = extractEntity(post, agentKey);

    draftAgent = {
        ...draftAgent,
        resources: {
            ...draftAgent.resources,
            [effectKeys.PENITENCE]:
                draftAgent.resources[effectKeys.PENITENCE] +
                Math.floor(
                    getRevelation(post, agentKey) * constants.PIOUS_MULT,
                ),
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateSupplicate({ prev, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    // Supplicate
    if (isEdictActive(draftAgent, edictKeys.PRINCIPALITIES)) {
        draftAgent = {
            ...draftAgent,
            resources: {
                ...draftAgent.resources,
                [effectKeys.SANCTUARY]:
                    draftAgent.resources[effectKeys.SANCTUARY] +
                    getFortitude(post, agentKey),
            },
        };
    } else {
        draftAgent = restoreResources(draftAgent, getFortitude(post, agentKey));
    }

    // Enters Immaculate
    draftAgent = {
        ...draftAgent,
        states: {
            ...draftAgent.states,
            [effectKeys.IMMACULATE]: true,
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateDiscern({ prev, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = {
        ...post.entities[agentKey],
    };

    draftAgent = {
        ...draftAgent,
        resources: {
            ...draftAgent.resources,
            [effectKeys.INSPIRATION]:
                draftAgent.resources[effectKeys.INSPIRATION] +
                Math.floor(
                    post.btt[effectKeys.PROVIDENCE] * constants.DISCERN_RATE,
                ),
        },
    };

    // Powers
    if (isEdictActive(draftAgent, edictKeys.POWERS)) {
        draftAgent = {
            ...draftAgent,
            resources: {
                ...draftAgent.resources,
                [effectKeys.SACRED_FLAMES]:
                    draftAgent.resources[effectKeys.SACRED_FLAMES] +
                    Math.floor(
                        post.btt[effectKeys.PROVIDENCE] * constants.POWERS_RATE,
                    ),
            },
        };
    }

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateAtone({ prev, agentKey }) {
    let post = {
        ...prev,
    };

    post = processExitAscendence(post, agentKey);

    let draftAgent = extractEntity(post, agentKey);

    draftAgent = {
        ...draftAgent,
        [effectKeys.BURDEN_OF_STIGMA]: Math.floor(
            draftAgent[effectKeys.TARNISHED_SIN] * constants.STIGMA_RATE,
        ),
        [effectKeys.TARNISHED_SIN]: 0,
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateJudgment({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    post = {
        ...post,
        entities: {
            ...post.entities,
            [nonAgentKey]: deleteCondition(post.entities[nonAgentKey]),
            [agentKey]: {
                ...post.entities[agentKey],
                states: {
                    ...post.entities[agentKey].states,
                    [effectKeys.ANOINTED_PROXY]: false,
                },
            },
        },
    };

    return post;
}
