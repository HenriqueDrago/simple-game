import { constants } from "./constants.js";
import {
    consumeResources,
    createBaseEntity,
    restoreResources,
    dealDamage,
    takeDamage,
    gainMana,
    loseMana,
    gainInsight,
    gainHp,
    applyBenedictionMalediction,
    exitAllStates,
} from "./entities.js";
import {
    actionKeys,
    dmgTypes,
    effectKeys,
    eyeKeys,
    angelActKeys,
    moonKeys,
    elementalKeys,
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
    [actionKeys.ALIGN]: simulateAlign,
    [actionKeys.MIRROR]: simulateMirror,
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
        Math.ceil(
            (agent.attributes.def.value) *
                constants.HALO_GEN_MULT,
        );

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

function simulateSacrifice({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const oldHp = agent.currHp;
    const dmgTaken = Math.ceil(oldHp * constants.SAC_HP_CONSUMPTION);

    const newHp = oldHp - dmgTaken;
    const newBloodSacrifice = Math.max(
        agent.resources.bloodSacrifice,
        oldHp - newHp + agent.resources.bloodSacrifice,
    );

    const newMaxMana = agent.maxMana + Math.max(0, oldHp - newHp);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: { ...nonAgent },
            [agentKey]: {
                ...agent,
                maxMana: newMaxMana,
                currHp: newHp,
                resources: {
                    ...agent.resources,
                    bloodSacrifice: newBloodSacrifice,
                },
                states: {
                    ...agent.states,
                    sacrificial: true,
                },
            },
        },
    };
}

function simulateAttack({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const { attacker, defender } = dealDamage(
        agent,
        nonAgent,
        agent.attributes.str.value + agent.resources.radiance,
        dmgTypes.PHYSICAL,
        prev.remainingArray > 0,
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

    const manaDiff = Math.max(0, agent.currMana - nonAgent.currMana);

    const { attacker, defender } = dealDamage(
        agent,
        nonAgent,
        manaDiff + agent.attributes.str.value,
        dmgTypes.PIERCING,
        prev.remainingArray > 0,
    );

    const draftDefender = gainMana(defender, manaDiff);
    const draftAttacker = loseMana(attacker, constants.SP_ATTACK_COST);

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

    const base_heal = Math.min(
        agent.maxHp - agent.currHp,
        agent.currMana + agent.resources.manaOverflow,
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

function simulateCurse({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const agentNewPoison =
        agent.resources.shackledMana + agent.resources.poison;
    const nonAgentNewPoison =
        nonAgent.resources.shackledMana + nonAgent.resources.poison;

    return {
        ...prev,
        remainingArray: 0,
        entities: {
            ...prev.entities,
            [nonAgentKey]: {
                ...nonAgent,
                resources: {
                    ...nonAgent.resources,
                    poison: nonAgentNewPoison,
                    shackledMana: 0,
                },
                states: {
                    ...nonAgent.states,
                    thornedShackles: false,
                },
            },
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    poison: agentNewPoison,
                    shackledMana: 0,
                },
                states: {
                    ...agent.states,
                    thornedShackles: false,
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
        remainingArray: constants.ARRAY_DURATION,
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
                states: {
                    ...nonAgent.states,
                    thornedShackles: true,
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
                states: {
                    ...agent.states,
                    thornedShackles: true,
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
    const newLE = agent.resources.shadowflame + agent.resources.lingeringEmber;
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

function simulateBlackMayhem({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
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
        draftNonAgent.resources.cinders + burntNonCindersNonRad;
    const newAgentLE =
        agent.resources.lingeringEmber + (resourcesConsumed.cinders || 0);

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
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    lingeringEmber: newAgentLE,
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
                sonority: constants.STARTING_SONORORITY,
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
        prev.remainingArray > 0,
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
        prev.remainingArray > 0,
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

    draftAgent = applyBenedictionMalediction(
        draftAgent,
        prev[effectKeys.EYE_OF_HEAVENS],
        angelActKeys.MALEDICTION,
    );

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

    draftAgent = applyBenedictionMalediction(
        draftAgent,
        prev[effectKeys.EYE_OF_HEAVENS],
        angelActKeys.BENEDICTION,
    );

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

    draftAgent = applyBenedictionMalediction(
        draftAgent,
        prev[effectKeys.EYE_OF_HEAVENS],
        angelActKeys.BENEDICTION,
    );

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

    draftAgent = applyBenedictionMalediction(
        draftAgent,
        prev[effectKeys.EYE_OF_HEAVENS],
        angelActKeys.BENEDICTION,
    );

    const { draftEntity, resourcesConsumed } = consumeResources(
        draftAgent,
        Infinity,
        actionKeys.HYMNS_OF_SANCTIFICATION,
    );

    draftAgent = gainInsight(draftEntity, resourcesConsumed.totalConsumption);

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

    draftAgent = applyBenedictionMalediction(
        draftAgent,
        prev[effectKeys.EYE_OF_HEAVENS],
        angelActKeys.MALEDICTION,
    );

    let draftNonAgent = {
        ...nonAgent,
    };

    if (draftAgent.resources[effectKeys.SACRED_FLAMES] > 0) {
        const { draftEntity } = consumeResources(
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
    }

    if (draftNonAgent.resources[effectKeys.SACRED_FLAMES] > 0) {
        const { draftEntity } = consumeResources(
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

    draftAgent = applyBenedictionMalediction(
        draftAgent,
        prev[effectKeys.EYE_OF_HEAVENS],
        angelActKeys.MALEDICTION,
    );

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
    if (nonAgent.states.ascendenceOfSpirit) {
        return prev;
    }

    let draftNonAgent = {
        ...nonAgent,
    };

    draftNonAgent = applyBenedictionMalediction(
        draftNonAgent,
        prev[effectKeys.EYE_OF_HEAVENS],
        angelActKeys.BENEDICTION,
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftNonAgent,
                states: {
                    ...draftNonAgent.states,
                    [effectKeys.BURDEN_OF_STIGMA]: true,
                },
                controller: agent.controller,
                statDistributionMode: agent.statDistributionMode,
                unspentPoints: agent.unspentPoints,
            },
            [nonAgentKey]: {
                ...agent,
                controller: nonAgent.controller,
                statDistributionMode: nonAgent.statDistributionMode,
                unspentPoints: nonAgent.unspentPoints,
            },
        },
    };
}

function simulateWordMadeFlesh({
    prev,
    agent,
    agentKey,
    nonAgent,
    nonAgentKey,
}) {
    let draftAgent = {
        ...agent,
    };

    draftAgent = applyBenedictionMalediction(
        draftAgent,
        prev[effectKeys.EYE_OF_HEAVENS],
        angelActKeys.MALEDICTION,
    );

    const { draftEntity, resourcesConsumed } = consumeResources(
        draftAgent,
        Infinity,
        actionKeys.THE_WORD_MADE_FLESH,
    );

    draftAgent = {
        ...draftEntity,
        currHp: 1,
        maxHp: 1,
        states: {
            ...draftEntity.states,
            [effectKeys.ASCENDENCE_OF_SPIRIT]: false,
            [effectKeys.CUTOFF_WINGS]: true,
        },
    };

    draftAgent = restoreResources(
        draftAgent,
        resourcesConsumed.totalConsumption,
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
                states: {
                    ...nonAgent.states,
                    [effectKeys.BURDEN_OF_STIGMA]: true,
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
            },
        },
    };
}

function simulateAlign({ prev, agent, agentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                [effectKeys.MIRRORED_MOON]: moonKeys.HIDDEN,
                [effectKeys.ELEMENTAL_CRYSTALS]: elementalKeys.DULLED,
                states: {
                    ...agent.states,
                    [effectKeys.SELENIAN]: true,
                }
            }
        }
    }
}

function simulateMirror({ prev, agent, agentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                states: {
                    ...agent.states,
                    [effectKeys.REFLECTED_FIRMAMENT]: true,
                }
            }
        }
    }
}

