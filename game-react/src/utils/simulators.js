import { constants } from "./constants.js";
import {
    consumeResources,
    createBaseEntity,
    restoreResources,
    dealDamage,
    takeDamage,
} from "./entities.js";
import {
    elementalKeys,
    actionKeys,
    dmgTypes,
    directionKeys,
    effectKeys,
} from "./enums.js";

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
    [actionKeys.ATTUNE]: simulateAttune,
    [actionKeys.DA_CAPO]: simulateDaCapo,
    [actionKeys.SOUND_OF_SILENCE]: simulateSoundOfSilence,
    [actionKeys.BABEL]: simulateBabel,
    [actionKeys.DEPLOY]: simulateDeploy,
    [actionKeys.LASER]: simulateLaser,
    [actionKeys.MELTDOWN]: simulateMeltdown,
    [actionKeys.ALIGN]: simulateAlign,
    [actionKeys.HALT]: simulateHalt,
    [actionKeys.SPARK_OF_DIVINITY]: simulateSpark,
    [actionKeys.THE_WORD_MADE_FLESH]: simulateWordMadeFlesh,
    [actionKeys.SERAPH_OF_RECLAMATION]: simulateSeraph,
    [actionKeys.HEAVENLY_SCALE]: simulateScale,
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
            (agent.attributes.def.value + agent.permafrost) *
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
        agent.attributes.str.value + agent.scoria,
        dmgTypes.PHYSICAL,
        prev.remainingArray > 0,
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...attacker,
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
        manaDiff + agent.attributes.str.value + agent.scoria,
        dmgTypes.PIERCING,
        prev.remainingArray > 0,
    );

    const defenderNewTotalMana = nonAgent.currMana + manaDiff;
    const defenderNewManaOverflow =
        nonAgent.resources.manaOverflow +
        Math.max(0, defenderNewTotalMana - nonAgent.maxMana);
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
                ...attacker,
                currMana: attackerNewMana,
                resources: {
                    ...attacker.resources,
                    manaOverflow: attackerNewManaOverflow,
                },
            },
            [nonAgentKey]: {
                ...defender,
                currMana: defenderNewMana,
                resources: {
                    ...defender.resources,
                    manaOverflow: defenderNewManaOverflow,
                },
            },
        },
    };
}

function simulateHeal({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const base_heal = Math.min(
        agent.maxHp + agent.overgrowth - agent.currHp,
        agent.currMana + agent.resources.manaOverflow,
    );
    const newHp = Math.min(
        agent.currHp + base_heal,
        agent.maxHp + agent.overgrowth,
    );

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
    if(agent.states.bleakDeception) {
        return prev;
    }
    
    const { draftEntity, resourcesConsumed } = consumeResources(
        { ...agent },
        constants.SHADOW_PACT_BURN,
        actionKeys.SHADOW_PACT,
    );

    const draftAgent = {
        ...draftEntity,
    };

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
        1,
        dmgTypes.PIERCING,
        prev.remainingArray > 0,
    );

    const newOverheat = attacker.currOverheat + 1 + attacker.lasersUsedThisTurn;
    const newlasersUsedThisTurn = attacker.lasersUsedThisTurn + 1;

    const thermalOverload = newOverheat >= constants.MAX_OVERHEAT;

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...attacker,
                currOverheat: newOverheat,
                lasersUsedThisTurn: newlasersUsedThisTurn,
                states: {
                    ...attacker.states,
                    weaponsDeployed: !thermalOverload,
                    thermalOverload: thermalOverload,
                },
            },
            [nonAgentKey]: {
                ...defender,
            },
        },
    };
}

function simulateMeltdown({ prev, agent, agentKey, nonAgent, nonAgentKey }) {
    const baseDmg = agent.currOverheat;

    const draftAgent = takeDamage(agent, baseDmg, dmgTypes.PHYSICAL);

    const draftNonAgent = takeDamage(nonAgent, baseDmg, dmgTypes.PHYSICAL);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                states: {
                    ...draftAgent.states,
                    thermalOverload: false,
                    venting: true,
                },
            },
            [nonAgentKey]: {
                ...draftNonAgent,
            },
        },
    };
}

function simulateAlign({ prev, agent, agentKey }) {
    const newElement =
        prev.elementalWheel === elementalKeys.INACTIVE
            ? elementalKeys.NATURE
            : prev.elementalWheel;

    const newDirection =
        prev.elementalWheel === elementalKeys.INACTIVE
            ? directionKeys.CLOCKWISE
            : prev.wheelDirection;

    return {
        ...prev,
        elementalWheel: newElement,
        wheelDirection: newDirection,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                scoria: constants.INITIAL_ELEMENTAL_ESSENCE_GAINED,
                permafrost: constants.INITIAL_ELEMENTAL_ESSENCE_GAINED,
                overgrowth: constants.INITIAL_ELEMENTAL_ESSENCE_GAINED,
                states: {
                    ...agent.states,
                    aligned: true,
                },
            },
        },
    };
}

function simulateHalt({ prev, agent, agentKey }) {
    if (
        prev.elementalWheel === elementalKeys.INACTIVE ||
        !agent.states.aligned
    ) {
        return prev;
    }

    const newDirection =
        prev.wheelDirection === directionKeys.CLOCKWISE
            ? directionKeys.COUNTERCLOCKWISE
            : directionKeys.CLOCKWISE;

    let essenceKey;
    switch (prev.elementalWheel) {
        case elementalKeys.NATURE:
            essenceKey = effectKeys.OVERGROWTH;
            break;

        case elementalKeys.FROST:
            essenceKey = effectKeys.PERMAFROST;
            break;

        case elementalKeys.SCORCH:
            essenceKey = effectKeys.SCORIA;
            break;

        default:
            essenceKey = null;
    }

    return {
        ...prev,
        wheelDirection: newDirection,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                [essenceKey]:
                    agent[essenceKey] + constants.ELEMENTAL_RESOURCE_GAIN,
                states: {
                    ...agent.states,
                    aligned: true,
                },
            },
        },
    };
}


function simulateSeraph({prev, agent, agentKey, nonAgent, nonAgentKey}) {

    const totalFlames = agent.resources.sacredFlames + nonAgent.resources.sacredFlames;

    const draftAgent = restoreResources(agent, totalFlames);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                resources: {
                    ...draftAgent.resources,
                    sacredFlames: 0,
                }
            },
            [nonAgentKey]: {
                ...nonAgent,
                resources: {
                    ...nonAgent.resources,
                    sacredFlames: 0,
                }
            },
        },
    };
}

function simulateSpark({prev, agent, agentKey, nonAgent, nonAgentKey}) {

    const newDefenderFlames = nonAgent.resources.sacredFlames + agent.revelation;
    const newAttackerFlames = agent.resources.sacredFlames + agent.revelation;

    const toBeRestored = agent.resources.inspiration;

    let draftAgent = {
        ...agent,
        resources: {
            ...agent.resources,
            inspiration: 0,
        }
    }

    const draftNonAgent = restoreResources(nonAgent, toBeRestored);
    draftAgent = restoreResources(draftAgent, toBeRestored);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                resources: {
                    ...draftAgent.resources,
                    sacredFlames: newAttackerFlames,
                }
            },
            [nonAgentKey]: {
                ...draftNonAgent,
                resources: {
                    ...draftNonAgent.resources,
                    sacredFlames: newDefenderFlames,
                }
            },
        },
    };
}

function simulateScale({prev, agent, agentKey}) {

    const totalKnowledge = agent.currEnlit + agent.currInsight + agent.resources.inspiration;

    const halfKnow = Math.floor(totalKnowledge/2) 

    const newEnlit = Math.min(agent.maxEnlit, halfKnow);
    const newInsight = Math.min(agent.maxInsight, halfKnow);

    const newInspiration = Math.max(0, totalKnowledge - agent.maxEnlit - agent.maxInsight);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                currEnlit: newEnlit,
                currInsight: newInsight,   
                resources: {
                    ...agent.resources,
                    inspiration: newInspiration,
                }
            },
        },
    };
}

function simulateWordMadeFlesh({ prev, agent, agentKey, nonAgent }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...nonAgent,
                attributes: {
                    ...nonAgent.attributes,
                },
                controller: agent.controller,
                statDistributionMode: agent.statDistributionMode,
            },
        },
    };
}
