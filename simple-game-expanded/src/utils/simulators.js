import { constants } from "./constants.js";
import {
    consumeResources,
    createBaseEntity,
    restoreResources,
    dealDamage,
    takeDamage,
    gainMana,
    loseMana,
    gainHp,
    exitAllStates,
    processExitAscendence,
    processExitSelenian,
    getEntityDef,
    getEntityStr,
    isElementActive,
    getEntityTotalHealth,
    loseHp,
    getEntityTotalMana,
} from "./entities.js";
import {
    actionKeys,
    dmgTypes,
    effectKeys,
    elementalKeys,
    eyeKeys,
} from "./enums.js";

export const simulators = {
    [actionKeys.ATTACK]: simulateAttack,
    [actionKeys.GUARD]: simulateGuard,
    [actionKeys.HEAL]: simulateHeal,
    [actionKeys.SPECIAL_ATTACK]: simulateSpecialAttack,

    [actionKeys.SACRIFICE]: simulateSacrifice,

    [actionKeys.ARRAY]: simulateArray,
    [actionKeys.CURSE]: simulateCurse,

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
    [actionKeys.ASCEND]: simulateAscend,

    [actionKeys.BAPTISM_OF_THE_FLAMES]: simulateBaptismOfTheFlames,
    [actionKeys.CELESTIAL_SCALE]: simulateScale,
    [actionKeys.HYMNS_OF_SANCTIFICATION]: simulateHymns,
    [actionKeys.GIFT_OF_APOTHEOSIS]: simulateGiftOfApotheosis,

    [actionKeys.SERAPH_OF_CONDEMNATION]: simulateSeraphOfCondemnation,
    [actionKeys.GLIMPSE_OF_PANDEMONIUM]: simulateGlimpse,
    [actionKeys.EDICT_OF_SEVERANCE]: simulateEdict,
    [actionKeys.THE_WORD_MADE_FLESH]: simulateWordMadeFlesh,

    [actionKeys.JUDGEMENT]: simulateJudgement,

    // Lunatic
    [actionKeys.REFRACT]: simulateRefract,
    [actionKeys.MIRROR]: simulateMirror,
    [actionKeys.SHATTER]: simulateShatter,
    [actionKeys.CHALK]: simulateChalk,

    [actionKeys.LUNAR_STRIKE]: simulateLunarStrike,
    [actionKeys.LUNAR_SMITE]: simulateLunarSmite,
    [actionKeys.LUNAR_GROWTH]: simulateLunarGrowth,
    [actionKeys.LUNAR_SHROUD]: simulateLunarShroud,
    [actionKeys.LUNAR_VEIL]: simulateLunarVeil,
    [actionKeys.LUNAR_TIDE]: simulateLunarTide,
};

function simulateGuard({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const newMana = Math.min(
        agent.maxMana,
        Math.floor(agent.currMana + agent.maxMana * constants.GUARD_MANA_REGEN),
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: { ...nonAgent },
            [agentKey]: {
                ...agent,
                currMana: newMana,
                states: {
                    ...agent.states,
                    guarding: true,
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
        ...agent
    }

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

function simulateAttack({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const { attacker, defender } = dealDamage(
        agent,
        nonAgent,
        getEntityStr(agent) + agent.resources.radiance,
        dmgTypes.PHYSICAL,
        prev[effectKeys.RUNIC_ARRAY] > 0,
    );

    const draftAttacker = {
        ...attacker,
        resources: {
            ...attacker.resources,
            radiance: 0,
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAttacker,
            },
            [nonAgentKey]: {
                ...defender,
            },
        },
    };
}

function simulateSpecialAttack({
    prev,
    agent,
    agentKey,
    nonAgent,
    nonAgentKey,
}) {
    if (
        agent.currMana + agent.resources.manaOverflow <
        constants.SP_ATTACK_COST
    ) {
        return prev;
    }

    const manaDiff = agent[effectKeys.MANA] - nonAgent[effectKeys.MANA];

    const { attacker, defender } = dealDamage(
        agent,
        nonAgent,
        getEntityStr(agent) + manaDiff,
        dmgTypes.PIERCING,
        prev[effectKeys.RUNIC_ARRAY] > 0,
    );

    let draftDefender = {
        ...defender,
    };
    let draftAttacker = {
        ...attacker,
    };

    draftAttacker = loseMana(draftAttacker, constants.SP_ATTACK_COST);

    if (manaDiff > 0) {
        draftDefender = gainMana(defender, manaDiff);
    } else if (manaDiff < 0) {
        draftAttacker = gainMana(attacker, -manaDiff);
    }

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAttacker,
            },
            [nonAgentKey]: {
                ...draftDefender,
            },
        },
    };
}

function simulateHeal({ prev, agent, agentKey }) {
    let draftAgent = {
        ...agent,
    };

    const totalMana =
        agent[effectKeys.MANA] + agent.resources[effectKeys.MANA_OVERFLOW];

    const base_heal = isElementActive(agent, elementalKeys.OCEAN)
        ? totalMana
        : Math.min(
              agent[effectKeys.MAX_HEALTH] - agent[effectKeys.HEALTH],
              totalMana,
          );

    draftAgent = gainHp(draftAgent, base_heal);
    draftAgent = loseMana(draftAgent, base_heal);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                resources: {
                    ...draftAgent.resources,
                    [effectKeys.POISON]: 0,
                },
            },
        },
    };
}

function simulateCurse({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const agentNewPoison =
        agent.resources.shackledMana + agent.resources.poison;
    const nonAgentNewPoison =
        nonAgent.resources.shackledMana + nonAgent.resources.poison;

    return {
        ...prev,
        [effectKeys.RUNIC_ARRAY]: 0,
        entities: {
            ...prev.entities,
            [nonAgentKey]: {
                ...nonAgent,
                resources: {
                    ...nonAgent.resources,
                    poison: nonAgentNewPoison,
                    shackledMana: 0,
                },
            },
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    poison: agentNewPoison,
                    shackledMana: 0,
                },
            },
        },
    };
}

function simulateArray({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const agentShackledMana =
        agent.resources.shackledMana +
        agent.currMana +
        agent.resources.manaOverflow;
    const nonAgentShackledMana =
        nonAgent.resources.shackledMana +
        nonAgent.currMana +
        nonAgent.resources.manaOverflow;

    return {
        ...prev,
        [effectKeys.RUNIC_ARRAY]: constants.ARRAY_DURATION,
        entities: {
            ...prev.entities,
            [nonAgentKey]: {
                ...nonAgent,
                currMana: 0,
                resources: {
                    ...nonAgent.resources,
                    manaOverflow: 0,
                    shackledMana: nonAgentShackledMana,
                },
            },
            [agentKey]: {
                ...agent,
                currMana: 0,
                resources: {
                    ...agent.resources,
                    manaOverflow: 0,
                    shackledMana: agentShackledMana,
                },
            },
        },
    };
}

function simulateShadowPact({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    if (agent.states.bleakDeception) {
        return prev;
    }

    const { draftEntity, resourcesConsumed } = consumeResources(
        { ...agent },
        constants.SHADOW_PACT_BURN,
        actionKeys.SHADOW_PACT,
    );

    const draftAgent = exitAllStates({
        ...draftEntity,
    });

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: { ...nonAgent },
            [agentKey]: {
                ...draftAgent,
                states: {
                    ...createBaseEntity().states,
                    umbralCore: true,
                },
                resources: {
                    ...draftAgent.resources,
                    shadowflame:
                        draftAgent.resources.shadowflame +
                        resourcesConsumed.totalConsumption,
                },
            },
        },
    };
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

function simulateDarkPromise({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const toBeRestored =
        agent.resources.shadowflame +
        Math.floor(agent.resources.lingeringEmber / 2);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: {
                ...nonAgent,
                resources: {
                    ...nonAgent.resources,
                    unrelentingShadows:
                        nonAgent.resources.unrelentingShadows + toBeRestored,
                },
            },
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    shadowflame: 0,
                    lingeringEmber: 0,
                    cinders: 0,
                    unrelentingShadows:
                        agent.resources.unrelentingShadows + toBeRestored,
                },
                states: {
                    ...agent.states,
                    umbralCore: false,
                    dimmingDarkness: true,
                },
            },
        },
    };
}

function simulateBlackMayhem({ prev, agent, nonAgent, nonAgentKey }) {
    const { draftEntity, resourcesConsumed } = consumeResources(
        { ...nonAgent },
        agent.resources.shadowflame,
        actionKeys.BLACK_MAYHEM,
    );

    const draftNonAgent = {
        ...draftEntity,
    };

    const burntNonCindersNonRad =
        resourcesConsumed.totalConsumption - (resourcesConsumed.cinders || 0);

    const newNonAgentCinders =
        draftNonAgent.resources.cinders +
        burntNonCindersNonRad * constants.RESOURCES_CINDERS_MULT;

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: {
                ...draftNonAgent,
                resources: {
                    ...draftNonAgent.resources,
                    cinders: newNonAgentCinders,
                },
            },
        },
    };
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
    const newSonority = -agent.sonority;

    const musicalShift = Math.abs(newSonority * 2);

    const draftAgent = restoreResources(agent, musicalShift);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                sonority: newSonority,
            },
        },
    };
}

function simulateBabel({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const newSonority = -agent.sonority;

    const musicalShift = Math.abs(newSonority * 2);

    const { attacker, defender } = dealDamage(
        agent,
        nonAgent,
        musicalShift,
        dmgTypes.TRUE,
        prev[effectKeys.RUNIC_ARRAY] > 0,
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...attacker,
                sonority: newSonority,
            },
            [nonAgentKey]: {
                ...defender,
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

function simulateLaser({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const { attacker, defender } = dealDamage(
        agent,
        nonAgent,
        agent[effectKeys.ENERGY_LEVEL],
        dmgTypes.PIERCING,
        prev[effectKeys.RUNIC_ARRAY] > 0,
    );

    const newOverheat =
        attacker[effectKeys.OVERHEAT] + 10 * (1 + attacker.lasersUsedThisTurn);
    const newDynamo = Math.min(
        constants.MAX_DYNAMO,
        attacker[effectKeys.DYNAMO] + 10,
    );
    const newlasersUsedThisTurn = attacker.lasersUsedThisTurn + 1;

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...attacker,
                [effectKeys.OVERHEAT]: newOverheat,
                [effectKeys.DYNAMO]: newDynamo,
                lasersUsedThisTurn: newlasersUsedThisTurn,
                states: {
                    ...attacker.states,
                    [effectKeys.THERMAL_OVERLOAD]:
                        newOverheat >= constants.MAX_OVERHEAT,
                },
            },
            [nonAgentKey]: {
                ...defender,
            },
        },
    };
}

function simulateMeltdown({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const baseDmg = Math.floor(
        (agent[effectKeys.ENERGY_LEVEL] +
            Math.floor(agent[effectKeys.DYNAMO] / 10)) *
            (agent[effectKeys.OVERHEAT] / 100),
    );

    const draftAgent = takeDamage(agent, baseDmg, dmgTypes.PHYSICAL);

    const draftNonAgent = takeDamage(nonAgent, baseDmg, dmgTypes.PHYSICAL);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                [effectKeys.DYNAMO]: 0,
                states: {
                    ...draftAgent.states,
                    [effectKeys.THERMAL_OVERLOAD]: false,
                    [effectKeys.VENTING]: true,
                },
            },
            [nonAgentKey]: {
                ...draftNonAgent,
            },
        },
    };
}

function simulateChart({ prev, agent, agentKey }) {
    const newWhite = agent.stars.white + constants.CHART_STAR_GAIN;

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                stars: {
                    ...agent.stars,
                    white: newWhite,
                },
                states: {
                    ...agent.states,
                    stargazer: true,
                },
            },
        },
    };
}

function simulateAscend({ prev, agent, agentKey }) {
    const newRev =
        agent[effectKeys.REVELATION] +
        agent.attributes.str.value +
        agent.attributes.def.value;

    let attributes = {};
    for (let attr of constants.ATTRIBUTE_NAMES) {
        attributes[attr] = {
            ...agent.attributes[attr],
            value: 0,
        };
    }

    const { draftEntity, resourcesConsumed } = consumeResources(
        { ...agent },
        Infinity,
        actionKeys.ASCEND,
    );

    let draftAgent = {
        ...draftEntity,
        attributes: { ...attributes },
    };

    draftAgent = exitAllStates(draftAgent);

    return {
        ...prev,
        eyeOfHeavens: eyeKeys.OPEN,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                [effectKeys.ENLIGHTENMENT]: 100,
                [effectKeys.MAX_ENLIGHTENMENT]: 100,
                [effectKeys.MAX_INSIGHT]: 100,
                [effectKeys.REVELATION]: newRev,
                [effectKeys.DIVINE_SPARK]: 0,
                states: {
                    ...draftAgent.states,
                    [effectKeys.ZENITH_OF_MORTALITY]: false,
                    [effectKeys.ASCENDENCE_OF_SPIRIT]: true,
                },
                resources: {
                    ...draftAgent.resources,
                    [effectKeys.INSPIRATION]:
                        resourcesConsumed.totalConsumption,
                },
            },
        },
    };
}

function simulateSeraphOfCondemnation({
    prev,
    agent,
    agentKey,
    nonAgent,
    nonAgentKey,
}) {
    let draftAgent = {
        ...agent,
    };

    const newSin = Math.min(
        constants.MAX_TARNISHED_SIN,
        nonAgent[effectKeys.TARNISHED_SIN] + agent[effectKeys.REVELATION],
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
            },
            [nonAgentKey]: {
                ...nonAgent,
                [effectKeys.TARNISHED_SIN]: newSin,
            },
        },
    };
}

function simulateScale({ prev, agent, agentKey }) {
    let draftAgent = {
        ...agent,
    };

    const totalKnowledge =
        agent[effectKeys.ENLIGHTENMENT] + agent[effectKeys.INSIGHT];

    const halfKnow = Math.floor(totalKnowledge / 2);

    const newEnlit = Math.min(agent[effectKeys.MAX_ENLIGHTENMENT], halfKnow);
    const newInsight = Math.min(agent[effectKeys.MAX_INSIGHT], halfKnow);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                [effectKeys.ENLIGHTENMENT]: newEnlit,
                [effectKeys.INSIGHT]: newInsight,
            },
        },
    };
}

function simulateBaptismOfTheFlames({
    prev,
    agent,
    agentKey,
    nonAgent,
    nonAgentKey,
}) {
    let draftAgent = {
        ...agent,
    };

    const newFlames =
        nonAgent.resources[effectKeys.SACRED_FLAMES] +
        agent[effectKeys.REVELATION];

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
            },
            [nonAgentKey]: {
                ...nonAgent,
                resources: {
                    ...nonAgent.resources,
                    [effectKeys.SACRED_FLAMES]: newFlames,
                },
            },
        },
    };
}

function simulateHymns({ prev, agent, agentKey }) {
    let draftAgent = {
        ...agent,
    };

    const { draftEntity, resourcesConsumed } = consumeResources(
        draftAgent,
        Infinity,
        actionKeys.HYMNS_OF_SANCTIFICATION,
    );

    draftAgent = restoreResources(
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

function simulateGlimpse({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    let draftAgent = {
        ...agent,
    };

    let draftNonAgent = {
        ...nonAgent,
    };

    if (draftAgent.resources[effectKeys.SACRED_FLAMES] > 0) {
        const { draftEntity, resourcesConsumed } = consumeResources(
            draftAgent,
            draftAgent.resources[effectKeys.SACRED_FLAMES],
            effectKeys.SACRED_FLAMES,
        );

        draftAgent = {
            ...draftEntity,
            resources: {
                ...draftEntity.resources,
                [effectKeys.SACRED_FLAMES]: 0,
            },
        };

        draftAgent = restoreResources(
            draftAgent,
            resourcesConsumed.totalConsumption,
        );
    }

    if (draftNonAgent.resources[effectKeys.SACRED_FLAMES] > 0) {
        const { draftEntity, resourcesConsumed } = consumeResources(
            draftNonAgent,
            draftNonAgent.resources[effectKeys.SACRED_FLAMES],
            effectKeys.SACRED_FLAMES,
        );
        draftNonAgent = {
            ...draftEntity,
            resources: {
                ...draftEntity.resources,
                [effectKeys.SACRED_FLAMES]: 0,
            },
        };

        draftNonAgent = restoreResources(
            draftNonAgent,
            resourcesConsumed.totalConsumption,
        );
    }

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

function simulateEdict({ prev, agent, agentKey }) {
    let draftAgent = {
        ...agent,
    };

    return {
        ...prev,
        [effectKeys.SEVERED_TIME]: true,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
            },
        },
    };
}

function simulateGiftOfApotheosis({
    prev,
    agent,
    agentKey,
    nonAgent,
    nonAgentKey,
}) {
    if (
        nonAgent.states[effectKeys.ASCENDENCE_OF_SPIRIT] ||
        nonAgent.states[effectKeys.ZENITH_OF_MORTALITY] ||
        nonAgent.states[effectKeys.CUTOFF_WINGS]
    ) {
        return prev;
    }

    const newTarnishedSin = Math.min(
        constants.MAX_TARNISHED_SIN,
        nonAgent[effectKeys.TARNISHED_SIN] + agent[effectKeys.TARNISHED_SIN],
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                [effectKeys.TARNISHED_SIN]: newTarnishedSin,
            },
            [nonAgentKey]: {
                ...nonAgent,
                [effectKeys.DIVINE_SPARK]: 100,
                [effectKeys.TARNISHED_SIN]: 0,
            },
        },
    };
}

function simulateWordMadeFlesh({ prev, agent, agentKey }) {
    let draftAgent = {
        ...agent,
    };

    const burden = Math.floor(draftAgent[effectKeys.REVELATION] / 10);

    draftAgent = processExitAscendence(draftAgent);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                [effectKeys.BURDEN_OF_STIGMA]: burden,
                resources: {
                    ...draftAgent.resources,
                },
            },
        },
    };
}

function simulateJudgement({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    let draftNonAgent = {
        ...nonAgent,
    };

    draftNonAgent = exitAllStates(draftNonAgent);
    draftNonAgent = consumeResources(
        draftNonAgent,
        Infinity,
        actionKeys.JUDGEMENT,
    ).draftEntity;

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                states: {
                    ...agent.states,
                    [effectKeys.ANOINTED_PROXY]: false,
                },
            },
            [nonAgentKey]: {
                ...draftNonAgent,
                [effectKeys.TARNISHED_SIN]: 0,
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
                [effectKeys.ELEMENTAL_CRYSTALS]: [elementalKeys.SHATTERED],
            },
        },
    };
}

function simulateChalk({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const { attacker, defender } = dealDamage(
        agent,
        nonAgent,
        agent[effectKeys.MOONLIGHT],
        dmgTypes.TRUE,
        prev[effectKeys.RUNIC_ARRAY] > 0,
    );

    const draftAttacker = processExitSelenian(attacker);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAttacker,
            },
            [nonAgentKey]: {
                ...defender,
            },
        },
    };
}

function simulateLunarTide({ prev, agent, agentKey }) {
    const { draftEntity, resourcesConsumed } = consumeResources(
        agent,
        agent[effectKeys.MOONLIGHT],
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
    const draftAgent = restoreResources(
        agent,
        agent[effectKeys.MOONLIGHT] * constants.LUNAR_GROWTH_MULT,
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

function simulateLunarStrike({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const { attacker, defender } = dealDamage(
        agent,
        nonAgent,
        getEntityStr(agent) + agent.resources[effectKeys.MOONDUST],
        dmgTypes.PHYSICAL,
        prev[effectKeys.RUNIC_ARRAY] > 0,
    );

    const draftAgent = {
        ...attacker,
        resources: {
            ...attacker.resources,
            [effectKeys.MOONDUST]: 0,
        }
    }

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
            },
            [nonAgentKey]: {
                ...defender,
            },
        },
    };
}

function simulateLunarSmite({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const manaConsumed = getEntityTotalMana(agent);

    const { attacker, defender } = dealDamage(
        agent,
        nonAgent,
        agent[effectKeys.MOONLIGHT] + manaConsumed,
        dmgTypes.PIERCING,
        prev[effectKeys.RUNIC_ARRAY] > 0,
    );

    const draftAgent = loseMana(attacker, manaConsumed);
    const draftNonAgent = {
        ...defender,
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

function simulateLunarVeil({ prev, agent, agentKey }) {
    const draftAgent = {
        ...agent,
        [effectKeys.MOONLIT_TEARS]:
            agent[effectKeys.MOONLIT_TEARS] + constants.LUNAR_VEIL_TEARS_GAIN,
        states: {
            ...agent.states,
            [effectKeys.GIBBOUS]: true,
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
