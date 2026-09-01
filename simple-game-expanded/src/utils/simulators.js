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
    getEntityTotalHealth,
    loseHp,
    getEntityMaxHealth,
    getEntityTotalMana,
    addRune,
    translateElementIntoCrystals,
    newDealDmg,
    consumeLimitedResources,
    gainEnlit,
    resetAttr,
    raiseProvidence,
    raiseStats,
    deleteCondition,
    getTotalEnlit,
    loseEnlit,
    replaceEntity,
    extractEntity,
    getFortitude,
    advanceChoir,
    processExitAscendence,
    isEdictActive,
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
    const newMana = Math.min(
        agent[effectKeys.MAX_MANA],
        Math.floor(
            agent[effectKeys.MANA] +
                agent[effectKeys.MAX_MANA] * constants.GUARD_MANA_REGEN,
        ),
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                [effectKeys.MANA]: newMana,
                states: {
                    ...agent.states,
                    [effectKeys.GUARDING_STATE]: true,
                },
            },
        },
    };
}

function simulateAegis({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const newHalo =
        agent.resources.halo +
        Math.ceil(getEntityDef(agent) * constants.HALO_GEN_MULT);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: { ...nonAgent },
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    halo: newHalo,
                },
                states: {
                    ...agent.states,
                    radiant: true,
                },
            },
        },
    };
}

function simulateSacrifice({ prev, agent, agentKey }) {
    let draftAgent = {
        ...agent,
    };

    const realHealth = getEntityTotalHealth(draftAgent);
    const dmgTaken = Math.ceil(realHealth * constants.SAC_HP_CONSUMPTION);

    const hpConsumed = Math.min(realHealth, dmgTaken);
    const newManaBleed =
        draftAgent[effectKeys.MANA_BLEED] +
        Math.ceil(hpConsumed * constants.MANA_BLEED_MULT);

    draftAgent = loseHp(draftAgent, hpConsumed);

    draftAgent = {
        ...draftAgent,
        [effectKeys.MAX_MANA]: draftAgent[effectKeys.MAX_MANA] + hpConsumed,
        [effectKeys.MANA_BLEED]: newManaBleed,
        resources: {
            ...draftAgent.resources,
            [effectKeys.BLOOD_SACRIFICE]:
                draftAgent.resources[effectKeys.BLOOD_SACRIFICE] + hpConsumed,
        },
        states: {
            ...draftAgent.states,
            [effectKeys.SACRIFICIAL_STATE]: true,
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
        getEntityStr(agent) +
            radiance +
            agent.resources[effectKeys.BLOOD_SACRIFICE],
        nonAgentKey,
        dmgTypes.PHYSICAL,
        agentKey,
    );

    return post;
}

function simulateSpecialAttack({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);
    draftAgent = loseMana(
        draftAgent,
        draftAgent[effectKeys.MAX_MANA] * constants.SP_ATTACK_COST,
    );

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

    const base_heal = Math.min(
        getEntityMaxHealth(agent) - agent[effectKeys.HEALTH],
        getEntityTotalMana(agent),
    );

    draftAgent = gainHp(draftAgent, base_heal);
    draftAgent = loseMana(draftAgent, base_heal);

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

    const str = getEntityStr(draftAgent);
    const def = getEntityDef(draftAgent);

    if (str > 0) {
        const result = consumeResources(
            draftAgent,
            str,
            actionKeys.SHADOW_PACT,
        );

        draftAgent = {
            ...result.draftEntity,
            resources: {
                ...result.draftEntity.resources,
                [effectKeys.SHADOWFLAME]:
                    result.draftEntity.resources[effectKeys.SHADOWFLAME] +
                    result.resourcesConsumed.totalConsumption,
            },
        };
    }

    if (def > 0) {
        draftAgent = {
            ...draftAgent,
            resources: {
                ...draftAgent.resources,
                [effectKeys.LINGERING_EMBER]:
                    draftAgent.resources[effectKeys.LINGERING_EMBER] + def,
            },
        };
    }

    draftAgent = {
        ...draftAgent,
        states: {
            ...draftAgent.states,
            [effectKeys.UMBRAL_CORE]: true,
        },
    };

    post = replaceEntity(post, draftAgent, agentKey);

    return post;
}

function simulateShadowMantle({
    prev,
    agent,
    agentKey,
    nonAgent,
    nonAgentKey,
}) {
    const unrelentingShadows = agent.resources.shadowflame;
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: { ...nonAgent },
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    unrelentingShadows: unrelentingShadows,
                },
                states: {
                    ...agent.states,
                    darkEmbrace: true,
                },
            },
        },
    };
}

function simulateRitualOfAsh({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const newLE =
        agent.resources[effectKeys.SHADOWFLAME] +
        agent.resources[effectKeys.LINGERING_EMBER];
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: { ...nonAgent },
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    shadowflame: 0,
                    lingeringEmber: newLE,
                },
            },
        },
    };
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
        resources: {
            ...draftAgent.resources,
            [effectKeys.SHADOWFLAME]: 0,
            [effectKeys.LINGERING_EMBER]: 0,
            [effectKeys.CINDERS]: 0,
        },
        states: {
            ...draftAgent.states,
            [effectKeys.UMBRAL_CORE]: false,
            [effectKeys.DIMMING_DARKNESS]: true,
        },
    };

    draftAgent = restoreResources(draftAgent, toBeRestored);
    draftNonAgent = restoreResources(draftNonAgent, toBeRestored);

    post = replaceEntity(post, draftAgent, agentKey);
    post = replaceEntity(post, draftNonAgent, nonAgentKey);

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
    if (agent.states.venting) {
        return prev;
    }

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
            [effectKeys.WEAPONS_DEPLOYED]: newOverheat < constants.MAX_OVERHEAT,
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
    const baseDmg = Math.floor(
        (agent[effectKeys.ENERGY_LEVEL] +
            Math.floor(agent[effectKeys.DYNAMO] / 10)) *
            (agent[effectKeys.OVERHEAT] / 100),
    );

    const post = newDealDmg(
        prev,
        baseDmg,
        [agentKey, nonAgentKey],
        dmgTypes.PHYSICAL,
        null,
    );

    let draftAgent = {
        ...post.entities[agentKey],
    };

    draftAgent = {
        ...draftAgent,
        [effectKeys.DYNAMO]: 0,
        states: {
            ...draftAgent.states,
            [effectKeys.THERMAL_OVERLOAD]: false,
            [effectKeys.VENTING]: true,
        },
    };

    return {
        ...post,
        entities: {
            ...post.entities,
            [agentKey]: draftAgent,
        },
    };
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

function simulateMirror({ prev, agent, agentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                [effectKeys.MOONLIGHT]:
                    agent[effectKeys.MOONLIGHT] + constants.MIRROR_ML_GAIN,
            },
        },
    };
}

function simulateShatter({ prev, agent, agentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                [effectKeys.ELEMENTAL_CRYSTALS]: translateElementIntoCrystals(
                    elementalKeys.SHATTERED,
                ),
            },
        },
    };
}

function simulateChalk({ prev, agent, agentKey, nonAgentKey }) {
    const extraDmg = Math.floor(
        agent[effectKeys.LUNACY] / constants.CHALK_EXTRA_DMG,
    );

    const post = newDealDmg(
        prev,
        agent[effectKeys.MOONLIGHT] + extraDmg,
        nonAgentKey,
        dmgTypes.LUNIC,
        agentKey,
    );

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

function simulateLunarGrowth({ prev, agent, agentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                states: {
                    ...agent.states,
                    [effectKeys.MOON_DEW]: true,
                },
            },
        },
    };
}

function simulateLunarStrike({ prev, agent, agentKey, nonAgentKey }) {
    const post = newDealDmg(
        prev,
        Math.floor(getEntityStr(agent) / 2) +
            agent.resources[effectKeys.MOONSHINE],
        nonAgentKey,
        dmgTypes.PIERCING,
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

function simulateLunarSmite({ prev, agent, agentKey, nonAgentKey }) {
    const extraDmg =
        agent[effectKeys.MAX_HEALTH] -
        agent[effectKeys.HEALTH] +
        (agent[effectKeys.MAX_MANA] - agent[effectKeys.MANA]);

    const baseDmg = Math.floor(
        agent[effectKeys.MOONLIGHT] *
            (1 + (extraDmg * constants.SMITE_MULT) / 100),
    );

    const post = newDealDmg(
        prev,
        baseDmg,
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

function simulateLunarShed({ prev, agent, agentKey }) {
    const ml = agent[effectKeys.MOONLIGHT];

    const post = newDealDmg(prev, ml, agentKey, dmgTypes.TRUE, null);

    let draftAgent = {
        ...post.entities[agentKey],
    };

    draftAgent = {
        ...draftAgent,
        [effectKeys.MOONLIT_TEARS]:
            draftAgent[effectKeys.MOONLIT_TEARS] + constants.GIBBOUS_TEARS_GAIN,
        resources: {
            ...draftAgent.resources,
            [effectKeys.MYCELIUM]: ml,
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
                    draftAgent.attributes.def.value + getEntityStr(draftAgent),
            },
        },
        states: {
            ...draftAgent.states,
            [effectKeys.ZENITH_OF_MORTALITY]: true,
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

    const result = consumeLimitedResources(draftAgent, Infinity);

    draftAgent = result.draftEntity;

    draftAgent = {
        ...draftAgent,
        [effectKeys.MAX_ENLIGHTENMENT]:
            draftAgent[effectKeys.MAX_HEALTH] + draftAgent[effectKeys.MAX_MANA],
        [effectKeys.MAX_HEALTH]: 0,
        [effectKeys.MAX_MANA]: 0,
    };

    draftAgent = gainEnlit(
        draftAgent,
        result.limitedResourcesConsumed.totalLimitedResourcesConsumption,
    );

    draftAgent = {
        ...draftAgent,
        [effectKeys.REVELATION]: getEntityStr(draftAgent),
        [effectKeys.FORTITUDE]: getEntityDef(draftAgent),
    };

    draftAgent = resetAttr(draftAgent);

    const newProv = draftAgent[effectKeys.DIVINE_SPARK];
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

    post = raiseProvidence(post, newProv);

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

    for (
        let remainingProv = newProv;
        remainingProv >= constants.ASCEND_SKIP_RATE;
        remainingProv -= constants.ASCEND_SKIP_RATE
    ) {
        post = advanceChoir(post, agentKey);
    }

    return post;
}

function simulateCondemn({ prev, agentKey, nonAgentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    // Covenant
    const cov = draftAgent.resources[effectKeys.COVENANT];
    if (cov > 0) {
        draftAgent = {
            ...draftAgent,
            resources: {
                ...draftAgent.resources,
                [effectKeys.COVENANT]: 0,
            },
        };

        post = replaceEntity(post, draftAgent, agentKey);
        post = newDealDmg(
            post,
            cov,
            [nonAgentKey],
            tarnishTypes.LUNIC,
            agentKey,
        );
        draftAgent = extractEntity(post, agentKey);
    }

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
        post.entities[agentKey][effectKeys.REVELATION] + extraBaseDmg,
        [nonAgentKey],
        tarnishTypes.PHYSICAL,
        agentKey,
        extraFinalDmg,
    );

    return post;
}

function simulateSupplicate({ prev, agentKey }) {
    let post = {
        ...prev,
    };

    let draftAgent = extractEntity(post, agentKey);

    // Covenant
    const cov = draftAgent.resources[effectKeys.COVENANT];
    if (cov > 0) {
        draftAgent = {
            ...draftAgent,
            [effectKeys.MAX_ENLIGHTENMENT]:
                draftAgent[effectKeys.MAX_ENLIGHTENMENT] + cov,
            resources: {
                ...draftAgent.resources,
                [effectKeys.COVENANT]: 0,
            },
        };
    }

    post = replaceEntity(post, draftAgent, agentKey);

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

    let draftAgent = {
        ...post.entities[agentKey],
    };

    draftAgent = raiseStats(draftAgent, draftAgent[effectKeys.REVELATION]);

    draftAgent = {
        ...draftAgent,
        [effectKeys.REVELATION]: 0,
        [effectKeys.FORTITUDE]: 0,
        [effectKeys.BURDEN_OF_STIGMA]: Math.floor(
            post.btt[effectKeys.PROVIDENCE] * constants.STIGMA_RATE,
        ),
    };

    post = {
        ...post,
        entities: {
            ...post.entities,
            [agentKey]: draftAgent,
        },
        btt: {
            ...post.btt,
            [effectKeys.PROVIDENCE]: 0,
        },
    };

    post = processExitAscendence(post, agentKey);

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
