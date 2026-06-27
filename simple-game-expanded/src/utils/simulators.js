import { constants } from "./constants.js";
import {
    consumeResources,
    createBaseEntity,
    restoreResources,
    dealDamage,
    takeDamage,
    gainMana,
    loseMana,
} from "./entities.js";
import { elementalKeys, actionKeys, dmgTypes } from "./enums.js";

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
    [actionKeys.THE_WORD_MADE_FLESH]: simulateWordMadeFlesh,
    [actionKeys.SERAPH_OF_CONDEMNATION]: simulateSeraphOfCondemnation,
    [actionKeys.CELESTIAL_SCALE]: simulateScale,
    [actionKeys.BAPTISM_OF_THE_FLAMES]: simulateBaptismOfTheFlames,
    [actionKeys.GRACE_OF_HEAVENS]: simulateGraceOfHeavens,
    [actionKeys.GIFT_OF_APOTHEOSIS]: simulateGiftOfApotheosis,
    [actionKeys.SACRAMENT]: simulateSacrament,
    [actionKeys.CHART]: simulateChart,
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
        agent.attributes.str.value + agent.scoria + agent.resources.radiance,
        dmgTypes.PHYSICAL,
        prev.remainingArray > 0,
        prev.elementalWheel,
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
        manaDiff + agent.attributes.str.value + agent.scoria,
        dmgTypes.PIERCING,
        prev.remainingArray > 0,
        prev.elementalWheel,
    );

    const draftDefender = gainMana(defender, manaDiff);
    const draftAttacker = loseMana(attacker, constants.SP_ATTACK_COST);

    console.log(draftAttacker);

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
    if (agent.states.bleakDeception) {
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

    const draftAgent = restoreResources(
        agent,
        musicalShift,
        prev.elementalWheel,
    );

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
        prev.elementalWheel,
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
        prev.elementalWheel,
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

    const draftAgent = takeDamage(
        agent,
        baseDmg,
        dmgTypes.PHYSICAL,
        prev.elementalWheel,
    );

    const draftNonAgent = takeDamage(
        nonAgent,
        baseDmg,
        dmgTypes.PHYSICAL,
        prev.elementalWheel,
    );

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
    let draftAgent = {
        ...agent,
    };

    const newElement =
        prev.elementalWheel === elementalKeys.INACTIVE
            ? elementalKeys.NATURE
            : prev.elementalWheel;

    let newScoria = draftAgent.scoria;
    let newOvergrowth = draftAgent.overgrowth;
    let newPermafrost = draftAgent.permafrost;

    switch (prev.elementalWheel) {
        case elementalKeys.NATURE: {
            newOvergrowth += constants.ELEMENTAL_RESOURCE_GAIN;
            draftAgent = restoreResources(
                draftAgent,
                newOvergrowth,
                prev.elementalWheel,
            );
            break;
        }
        case elementalKeys.SCORCH: {
            newScoria += constants.ELEMENTAL_RESOURCE_GAIN;
            draftAgent = takeDamage(
                draftAgent,
                newScoria,
                dmgTypes.TRUE,
                prev.elementalWheel,
            );
            break;
        }
        case elementalKeys.FROST: {
            newPermafrost += constants.ELEMENTAL_RESOURCE_GAIN;
            const newCryo = draftAgent.resources.cryogenesis + newPermafrost;
            draftAgent = {
                ...draftAgent,
                resources: {
                    ...draftAgent.resources,
                    cryogenesis: newCryo,
                },
            };
            break;
        }

        case elementalKeys.INACTIVE: {
            newOvergrowth += constants.INITIAL_ELEMENTAL_ESSENCE_GAINED;
            newScoria += constants.INITIAL_ELEMENTAL_ESSENCE_GAINED;
            newPermafrost += constants.INITIAL_ELEMENTAL_ESSENCE_GAINED;
            break;
        }

        default: {
            break;
        }
    }

    return {
        ...prev,
        elementalWheel: newElement,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                scoria: newScoria,
                permafrost: newPermafrost,
                overgrowth: newOvergrowth,
                states: {
                    ...draftAgent.states,
                    aligned: true,
                },
            },
        },
    };
}

function simulateSeraphOfCondemnation({ prev, agent, nonAgent, nonAgentKey }) {
    const newDamn = Math.min(
        nonAgent.maxTarnishedSin,
        nonAgent.currTarnishedSin + agent.revelation,
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [nonAgentKey]: {
                ...nonAgent,
                currTarnishedSin: newDamn,
            },
        },
    };
}

function simulateScale({ prev, agent, agentKey }) {
    const totalKnowledge = agent.currEnlit + agent.currInsight;

    const halfKnow = Math.floor(totalKnowledge / 2);

    const newEnlit = Math.min(agent.maxEnlit, halfKnow);
    const newInsight = Math.min(agent.maxInsight, halfKnow);

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                currEnlit: newEnlit,
                currInsight: newInsight,
            },
        },
    };
}

function simulateGraceOfHeavens({
    prev,
    agent,
    agentKey,
    nonAgent,
    nonAgentKey,
}) {
    const draftNonAgent = restoreResources(
        nonAgent,
        agent.revelation,
        prev.elementalWheel,
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                },
            },
            [nonAgentKey]: {
                ...draftNonAgent,
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
    const totalFlames =
        agent.resources.sacredFlames + nonAgent.resources.sacredFlames;

    const draftAgent = restoreResources(
        agent,
        totalFlames * constants.FLAMES_ABSORPTION_MULTIPLIER,
        prev.elementalWheel,
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...draftAgent,
                resources: {
                    ...draftAgent.resources,
                    sacredFlames: 0,
                },
            },
            [nonAgentKey]: {
                ...nonAgent,
                resources: {
                    ...nonAgent.resources,
                    sacredFlames: 0,
                },
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

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...nonAgent,
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
    const { draftEntity } = consumeResources(
        agent,
        Infinity,
        actionKeys.THE_WORD_MADE_FLESH,
    );

    const draftAgent = {
        ...draftEntity,
        currHp: 1,
        maxHp: 1,
        states: {
            ...draftEntity.states,
            ascendenceOfSpirit: false,
            cutoffWings: true,
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
                ...nonAgent,
                states: {
                    ...nonAgent.states,
                    burdenOfStigma: true,
                },
            },
        },
    };
}

function simulateSacrament({ prev, agent, agentKey }) {
    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...agent,
                resources: {
                    ...agent.resources,
                    benediction:
                        agent.resources.benediction +
                        agent.revelation * constants.BENEDICTION_GEN,
                },
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
                }
            },
        },
    };
}
