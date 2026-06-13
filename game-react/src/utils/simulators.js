import { constants } from "./constants.js";
import {
    consumeResources,
    processEntityDR,
    processEntityDefEffect,
} from "./entities.js";
import { elementalKeys, actionKeys } from "./enums.js";

export const simulators = {
    [actionKeys.AEGIS]: simulateAegis,
    [actionKeys.ARRAY]: simulateArray,
    [actionKeys.ATTACK]: simulateAttack,
    [actionKeys.BLACK_MAYHEM]: simulateBlackMayhem,
    [actionKeys.CURSE]: simulateCurse,
    [actionKeys.DARK_PROMISE]: simulateDarkPromise,
    [actionKeys.GUARD]: simulateGuard,
    [actionKeys.HEAL]: simulateHeal,
    [actionKeys.RITUAL_OF_ASH]: simulateRitualOfAsh,
    [actionKeys.SACRIFICE]: simulateSacrifice,
    [actionKeys.SHADOW_MANTLE]: simulateShadowMantle,
    [actionKeys.SHADOW_PACT]: simulateShadowPact,
    [actionKeys.SPECIAL_ATTACK]: simulateSpecialAttack,
    [actionKeys.WHEEL]: simulateWheel,
    [actionKeys.ATTUNE]: simulateAttune,
    [actionKeys.DA_CAPO]: simulateDaCapo,
    [actionKeys.SOUND_OF_SILENCE]: simulateSoundOfSilence,
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
    const newRadiance =
        agent.resources.radiance +
        Math.ceil(agent.attributes.def.value * constants.RADIANCE_GEN_MULT);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: { ...nonAgent },
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    radiance: newRadiance,
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

    const radianceConsumed = Math.min(dmgTaken, agent.resources.radiance);
    const newRadiance = agent.resources.radiance - radianceConsumed;
    const newFadingLight = agent.states.radiant
        ? agent.resources.fadingLight + radianceConsumed
        : agent.resources.fadingLight;

    const newHp = oldHp - dmgTaken + radianceConsumed;
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
                    radiance: newRadiance,
                    fadingLight: newFadingLight,
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
    const sonority = prev.sonority;
    const sonorityModifier = agent.states.harmonious
        ? sonority
        : agent.states.dissonant
          ? -sonority
          : 0;

    console.log(sonority);
    console.log(sonorityModifier)

    const base_damage =
        agent.attributes.str.value +
        agent.resources.bloodSacrifice * constants.BLOOD_SACRIFICE_MULT +
        agent.resources.scoria +
        agent.resources.radiance +
        sonorityModifier;

    const effectiveDef = Math.floor(
        nonAgent.attributes.def.value * processEntityDefEffect(nonAgent),
    );
    const drMult = processEntityDR(nonAgent);

    const final_damage = Math.max(
        1,
        Math.floor((base_damage - effectiveDef) * drMult) -
            nonAgent.resources.permafrost,
    );

    /* Consumption order:
        - Embers
        - Fading Light
        - Radiance
    */

    const emberConsumed = Math.min(
        final_damage,
        nonAgent.resources.lingeringEmber,
    );
    const radianceConsumed = Math.min(
        final_damage - emberConsumed,
        nonAgent.resources.radiance,
    );
    const fadingLightConsumed = Math.min(
        final_damage - emberConsumed - radianceConsumed,
        nonAgent.resources.fadingLight,
    );

    const damagePostMitigation =
        final_damage - emberConsumed - radianceConsumed - fadingLightConsumed;

    const newMana = nonAgent.states.radiant
        ? Math.max(0, nonAgent.currMana - damagePostMitigation)
        : nonAgent.currMana;

    const newHp = Math.max(
        0,
        nonAgent.currHp -
            (damagePostMitigation - (nonAgent.currMana - newMana)),
    );

    const newRadiance = nonAgent.resources.radiance - radianceConsumed;
    const newEmber = nonAgent.resources.lingeringEmber - emberConsumed;
    const newNonAgentFadingLight = nonAgent.resources.fadingLight - fadingLightConsumed;

    const newAgentFadingLight = nonAgent.states.radiant
        ? agent.resources.fadingLight + radianceConsumed
        : agent.resources.fadingLight;

    const thornsDmg = nonAgent.states.thornedShackles
        ? agent.attributes.str.value
        : 0;
    const attackerNewHP = Math.max(0, agent.currHp - thornsDmg);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                currHp: attackerNewHP,
                resources: {
                    ...agent.resources,
                    radiance: 0,
                    fadingLight: newAgentFadingLight,
                },
            },
            [nonAgentKey]: {
                ...nonAgent,
                currHp: newHp,
                currMana: newMana,
                resources: {
                    ...nonAgent.resources,
                    radiance: newRadiance,
                    fadingLight: newNonAgentFadingLight,
                    lingeringEmber: newEmber,
                },
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

    const sonority = prev.sonority;

    const sonorityModifier = agent.states.harmonious
        ? sonority
        : agent.states.dissonant
          ? -sonority
          : 0;

    const base_damage =
        agent.attributes.str.value +
        agent.resources.radiance +
        agent.resources.scoria +
        sonorityModifier;
    const manaDiff = Math.max(0, agent.currMana - nonAgent.currMana);

    const drMult = processEntityDR(nonAgent);

    const final_damage = Math.max(
        1,
        Math.floor((base_damage + manaDiff) * drMult) -
            nonAgent.resources.permafrost,
    );

    const emberConsumed = Math.min(
        final_damage,
        nonAgent.resources.lingeringEmber,
    );
    const radianceConsumed = Math.min(
        final_damage - emberConsumed,
        nonAgent.resources.radiance,
    );
    const fadingLightConsumed = Math.min(
        final_damage - emberConsumed - radianceConsumed,
        nonAgent.resources.fadingLight,
    );

    const damagePostMitigation =
        final_damage - emberConsumed - radianceConsumed - fadingLightConsumed;

    let defenderManaConsumed = nonAgent.states.radiant
        ? Math.min(nonAgent.currMana, damagePostMitigation)
        : 0;

    const newHp = Math.max(
        0,
        nonAgent.currHp -
            (damagePostMitigation - defenderManaConsumed),
    );

    const newRadiance = nonAgent.resources.radiance - radianceConsumed;
    const newEmber = nonAgent.resources.lingeringEmber - emberConsumed;
    const newNonAgentFadingLight = nonAgent.resources.fadingLight - fadingLightConsumed;

    const newAgentFadingLight = nonAgent.states.radiant
        ? agent.resources.fadingLight + radianceConsumed
        : agent.resources.fadingLight;

    const defenderNewTotalMana = nonAgent.currMana + manaDiff - defenderManaConsumed;
    const defenderNewManaOverflow = nonAgent.resources.manaOverflow + Math.max(0, defenderNewTotalMana - nonAgent.maxMana);
    const defenderNewMana = Math.min(nonAgent.maxMana, defenderNewTotalMana);

    const overflowConsumed = Math.min(
        constants.SP_ATTACK_COST,
        agent.resources.manaOverflow,
    );
    const manaConsumed = constants.SP_ATTACK_COST - overflowConsumed;

    const attackerNewManaOverflow =
        agent.resources.manaOverflow - overflowConsumed;

    const attackerNewMana = agent.currMana - manaConsumed;

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                currMana: attackerNewMana,
                resources: {
                    ...agent.resources,
                    manaOverflow: attackerNewManaOverflow,
                    radiance: 0,
                    fadingLight: newAgentFadingLight,
                },
            },
            [nonAgentKey]: {
                ...nonAgent,
                currHp: newHp,
                currMana: defenderNewMana,
                resources: {
                    ...nonAgent.resources,
                    manaOverflow: defenderNewManaOverflow,
                    fadingLight: newNonAgentFadingLight,
                    radiance: newRadiance,
                    lingeringEmber: newEmber,
                },
            },
        },
    };
}

function simulateHeal({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const base_heal = Math.min(
        agent.maxHp - agent.currHp,
        agent.currMana + agent.resources.manaOverflow,
    );
    const newHp = Math.min(agent.currHp + base_heal, agent.maxHp);

    const overflowConsumed = Math.min(base_heal, agent.resources.manaOverflow);
    const manaConsumed = base_heal - overflowConsumed;

    const newManaOverflow = agent.resources.manaOverflow - overflowConsumed;
    const newMana = agent.currMana - manaConsumed;

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: { ...nonAgent },
            [agentKey]: {
                ...agent,
                currHp: newHp,
                currMana: newMana,
                resources: {
                    ...agent.resources,
                    manaOverflow: newManaOverflow,
                    poison: 0,
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
    const { draftEntity, resourcesConsumed } = consumeResources(
        { ...agent },
        constants.SHADOW_PACT_BURN,
        actionKeys.SHADOW_PACT,
    );

    const draftAgent = {
        ...draftEntity,
    };

    const newUnrelShadows =
        draftAgent.resources.unrelentingShadows +
        (resourcesConsumed.radiance || 0);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: { ...nonAgent },
            [agentKey]: {
                ...draftAgent,
                states: {
                    ...draftAgent.states,
                    umbralCore: true,
                },
                resources: {
                    ...draftAgent.resources,
                    unrelentingShadows: newUnrelShadows,
                    shadowflame: resourcesConsumed.totalConsumption,
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
                    unrelentingShadows: toBeRestored,
                },
            },
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    shadowflame: 0,
                    lingeringEmber: 0,
                    cinders: 0,
                    unrelentingShadows: toBeRestored,
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
        resourcesConsumed.totalConsumption -
        (resourcesConsumed.cinders || 0) -
        (resourcesConsumed.radiance || 0);

    const newUnrelShadows =
        agent.resources.unrelentingShadows + (resourcesConsumed.radiance || 0);

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
                    unrelentingShadows: newUnrelShadows,
                },
            },
        },
    };
}

function simulateWheel({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    let newElement;

    let newPermafrost = agent.resources.permafrost;
    let newOvergrowth = agent.resources.overgrowth;
    let newScoria = agent.resources.scoria;

    let newHp = agent.currHp;
    let newMaxHp = agent.maxHp;
    const currElement = prev.elementalWheel;

    switch (currElement) {
        case elementalKeys.NATURE:
            newElement = elementalKeys.FROST;
            newPermafrost += constants.ELEMENTAL_RESOURCE_GAIN;
            break;

        case elementalKeys.FROST:
            newElement = elementalKeys.SCORCH;
            newScoria += constants.ELEMENTAL_RESOURCE_GAIN;
            break;

        // Scorch and Inactive fall here
        default:
            newElement = elementalKeys.NATURE;
            newOvergrowth += constants.ELEMENTAL_RESOURCE_GAIN;

            newHp += constants.ELEMENTAL_RESOURCE_GAIN;
            newMaxHp += constants.ELEMENTAL_RESOURCE_GAIN;
            break;
    }

    return {
        ...prev,
        elementalWheel: newElement,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                currHp: newHp,
                maxHp: newMaxHp,
                resources: {
                    ...agent.resources,
                    permafrost: newPermafrost,
                    overgrowth: newOvergrowth,
                    scoria: newScoria,
                },
            },
            [nonAgentKey]: {
                ...nonAgent,
            },
        },
    };
}

function simulateAttune({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    return {
        ...prev,
        sonority: constants.STARTING_SONORORITY,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                states: {
                    ...agent.states,
                    harmonious: true,
                },
            },
            [nonAgentKey]: {
                ...nonAgent,
                states: {
                    ...nonAgent.states,
                    dissonant: true,
                },
            },
        },
    };
}

function simulateDaCapo({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const newDissonance = -Math.min(0, prev.sonority);

    return {
        ...prev,
        sonority: null,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    dissonance: newDissonance,
                },
                states: {
                    ...agent.states,
                    harmonious: false,
                    dissonant: false,
                },
            },
            [nonAgentKey]: {
                ...nonAgent,
                resources: {
                    ...nonAgent.resources,
                    dissonance: newDissonance,
                },
                states: {
                    ...nonAgent.states,
                    dissonant: false,
                    harmonious: false,
                },
            },
        },
    };
}

function simulateSoundOfSilence({
    prev,
    agent,
    agentKey,
    nonAgent,
    nonAgentKey,
}) {
    const newHarmony = Math.max(0, prev.sonority);

    return {
        ...prev,
        sonority: null,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    harmony: newHarmony,
                },
                states: {
                    ...agent.states,
                    harmonious: false,
                    dissonant: false,
                },
            },
            [nonAgentKey]: {
                ...nonAgent,
                resources: {
                    ...nonAgent.resources,
                    harmony: newHarmony,
                },
                states: {
                    ...nonAgent.states,
                    dissonant: false,
                    harmonious: false,
                },
            },
        },
    };
}
