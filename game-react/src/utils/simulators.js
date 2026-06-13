import { constants } from "./constants.js";
import {
    consumeResources,
    processEntityDR,
    processEntityDefEffect,
} from "./entities.js";
import { elementalKeys } from "./enums.js";

export const simulators = {
    simulateAegis,
    simulateArray,
    simulateAttack,
    simulateBlackMayhem,
    simulateCurse,
    simulateDarkPromise,
    simulateGuard,
    simulateHeal,
    simulateRitualOfAsh,
    simulateSacrifice,
    simulateShadowMantle,
    simulateShadowPact,
    simulateSpecialAttack,
    simulateWheel,
};

function simulateGuard({ agent, agentKey, nonAgent, nonAgentKey }) {
    const newMana = Math.min(
        agent.maxMana,
        Math.floor(agent.currMana + agent.maxMana * constants.GUARD_MANA_REGEN),
    );

    return {
        [nonAgentKey]: { ...nonAgent },
        [agentKey]: {
            ...agent,
            currMana: newMana,
            states: {
                ...agent.states,
                guarding: true,
            },
        },
    };
}

function simulateAegis({ agent, agentKey, nonAgent, nonAgentKey }) {
    const newRadiance =
        agent.resources.radiance +
        Math.ceil(agent.attributes.def.value * constants.RADIANCE_GEN_MULT);

    return {
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
    };
}

function simulateSacrifice({ agent, agentKey, nonAgent, nonAgentKey }) {
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
    };
}

function simulateAttack({ agent, agentKey, nonAgent, nonAgentKey }) {
    const base_damage =
        agent.attributes.str.value +
        agent.resources.bloodSacrifice * constants.BLOOD_SACRIFICE_MULT +
        agent.resources.scoria +
        agent.resources.radiance;

    const effectiveDef = Math.floor(
        nonAgent.attributes.def.value * processEntityDefEffect(nonAgent),
    );
    const drMult = processEntityDR(nonAgent);

    const final_damage = Math.max(
        1,
        Math.floor((base_damage - effectiveDef) * drMult) -
            nonAgent.resources.permafrost,
    );

    const radianceConsumed = Math.min(
        final_damage,
        nonAgent.resources.radiance,
    );
    const emberConsumed = Math.min(
        final_damage - radianceConsumed,
        nonAgent.resources.lingeringEmber,
    );

    const newMana = nonAgent.states.radiant
        ? Math.max(
              0,
              nonAgent.currMana -
                  (final_damage - radianceConsumed - emberConsumed),
          )
        : nonAgent.currMana;

    const newHp = Math.max(
        0,
        nonAgent.currHp -
            (final_damage -
                radianceConsumed -
                emberConsumed -
                (nonAgent.currMana - newMana)),
    );

    const newRadiance = nonAgent.resources.radiance - radianceConsumed;
    const newEmber = nonAgent.resources.lingeringEmber - emberConsumed;
    const newFadingLight = nonAgent.states.radiant
        ? nonAgent.resources.fadingLight + radianceConsumed
        : nonAgent.resources.fadingLight;

    const thornsDmg = nonAgent.states.thornedShackles
        ? agent.attributes.str.value
        : 0;
    const attackerNewHP = Math.max(0, agent.currHp - thornsDmg);

    return {
        [agentKey]: {
            ...agent,
            currHp: attackerNewHP,
            resources: {
                ...agent.resources,
                radiance: 0,
                fadingLight: newFadingLight,
            },
        },
        [nonAgentKey]: {
            ...nonAgent,
            currHp: newHp,
            currMana: newMana,
            resources: {
                ...nonAgent.resources,
                radiance: newRadiance,
                fadingLight: newFadingLight,
                lingeringEmber: newEmber,
            },
        },
    };
}

function simulateSpecialAttack({ agent, agentKey, nonAgent, nonAgentKey }) {
    if (
        agent.currMana + agent.resources.manaOverflow <
        constants.SP_ATTACK_COST
    ) {
        return {
            [agentKey]: {
                ...agent,
            },
            [nonAgentKey]: {
                ...nonAgent,
            },
        };
    }

    const base_damage =
        agent.attributes.str.value +
        agent.resources.radiance +
        agent.resources.scoria;
    const manaDiff = Math.max(0, agent.currMana - nonAgent.currMana);

    const drMult = processEntityDR(nonAgent);

    const final_damage = Math.max(
        1,
        Math.floor((base_damage + manaDiff) * drMult) -
            nonAgent.resources.permafrost,
    );

    const radianceConsumed = Math.min(
        final_damage,
        nonAgent.resources.radiance,
    );
    const emberConsumed = Math.min(
        final_damage - radianceConsumed,
        nonAgent.resources.lingeringEmber,
    );

    let defenderNewMana = nonAgent.states.radiant
        ? Math.max(
              0,
              nonAgent.currMana -
                  (final_damage - radianceConsumed - emberConsumed),
          )
        : nonAgent.currMana;

    const newHp = Math.max(
        0,
        nonAgent.currHp -
            (final_damage -
                radianceConsumed -
                emberConsumed -
                (nonAgent.currMana - defenderNewMana)),
    );

    const newRadiance = nonAgent.resources.radiance - radianceConsumed;
    const newEmber = nonAgent.resources.lingeringEmber - emberConsumed;
    const newAgentFadingLight = nonAgent.states.radiant
        ? agent.resources.fadingLight + radianceConsumed
        : agent.resources.fadingLight;
    const newNonAgentFadingLight = nonAgent.states.radiant
        ? nonAgent.resources.fadingLight + radianceConsumed
        : nonAgent.resources.fadingLight;

    defenderNewMana = Math.min(nonAgent.maxMana, defenderNewMana + manaDiff);
    const defenderNewManaOverflow =
        nonAgent.resources.manaOverflow +
        Math.max(0, nonAgent.currMana + manaDiff - nonAgent.maxMana);

    const overflowConsumed = Math.min(
        constants.SP_ATTACK_COST,
        agent.resources.manaOverflow,
    );
    const manaConsumed = constants.SP_ATTACK_COST - overflowConsumed;

    const attackerNewManaOverflow =
        agent.resources.manaOverflow - overflowConsumed;

    const attackerNewMana = agent.currMana - manaConsumed;

    return {
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
    };
}

function simulateHeal({ agent, agentKey, nonAgent, nonAgentKey }) {
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
    };
}

function simulateCurse({ agent, agentKey, nonAgent, nonAgentKey }) {
    const agentNewPoison =
        agent.resources.shackledMana + agent.resources.poison;
    const nonAgentNewPoison =
        nonAgent.resources.shackledMana + nonAgent.resources.poison;

    return {
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
    };
}

function simulateArray({ agent, agentKey, nonAgent, nonAgentKey }) {
    const agentShackledMana =
        agent.resources.shackledMana +
        agent.currMana +
        agent.resources.manaOverflow;
    const nonAgentShackledMana =
        nonAgent.resources.shackledMana +
        nonAgent.currMana +
        nonAgent.resources.manaOverflow;

    return {
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
    };
}

function simulateShadowPact({ agent, agentKey, nonAgent, nonAgentKey }) {
    const { draftEntity, resourcesConsumed } = consumeResources(
        { ...agent },
        constants.SHADOW_PACT_BURN,
        "shadowPact",
    );

    const draftAgent = {
        ...draftEntity,
    }

    const newUnrelShadows =
        draftAgent.resources.unrelentingShadows + (resourcesConsumed.radiance || 0);

    return {
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
            },
        },
    };
}

function simulateShadowMantle({ agent, agentKey, nonAgent, nonAgentKey }) {
    const unrelentingShadows = agent.resources.shadowflame;
    return {
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
    };
}

function simulateRitualOfAsh({ agent, agentKey, nonAgent, nonAgentKey }) {
    const newLE = agent.resources.shadowflame + agent.resources.lingeringEmber;
    return {
        [nonAgentKey]: { ...nonAgent },
        [agentKey]: {
            ...agent,
            resources: {
                ...agent.resources,
                shadowflame: 0,
                lingeringEmber: newLE,
            },
        },
    };
}

function simulateDarkPromise({ agent, agentKey, nonAgent, nonAgentKey }) {
    const toBeRestored =
        agent.resources.shadowflame +
        Math.floor(agent.resources.lingeringEmber / 2);

    return {
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
    };
}

function simulateBlackMayhem({ agent, agentKey, nonAgent, nonAgentKey }) {
    const { draftEntity, resourcesConsumed } = consumeResources(
        { ...nonAgent },
        agent.resources.shadowflame,
        "blackMayhem",
    );

    const draftNonAgent = {
        ...draftEntity,
    }

    const burntNonCindersNonRad =
        resourcesConsumed.totalConsumption -
        (resourcesConsumed.cinders || 0) -
        (resourcesConsumed.radiance || 0);

    const newUnrelShadows =
        agent.resources.unrelentingShadows + (resourcesConsumed.radiance || 0);


    const newNonAgentCinders =
        draftNonAgent.resources.cinders + burntNonCindersNonRad;
    const newAgentLE = agent.resources.lingeringEmber + (resourcesConsumed.cinders || 0);

    return {
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
    };
}

function simulateWheel({
    agent,
    agentKey,
    nonAgent,
    nonAgentKey,
    currElement,
}) {
    let newElement;

    let newPermafrost = agent.resources.permafrost;
    let newOvergrowth = agent.resources.overgrowth;
    let newScoria = agent.resources.scoria;

    let newHp = agent.currHp;
    let newMaxHp = agent.maxHp;

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
        draftEntities: {
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
        newElement: newElement,
    };
}
