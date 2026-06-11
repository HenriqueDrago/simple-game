import { constants } from "./constants.js";
import { consumeResources, processEntityDR, processEntityDefEffect } from "./entities.js";

export const simulators = {
    simulateAegis,
    simulateArray,
    simulateAttack,
    simulateBlackMayhem,
    simulateCurse,
    simulateDarkPromise,
    simulateGuard,
    simulateHeal,
    simulateLaser,
    simulateRitualOfAsh,
    simulateSacrifice,
    simulateShadowMantle,
    simulateShadowPact,
    simulateSpecialAttack,
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
        agent.radiance + Math.ceil(agent.attributes.def.value * constants.RADIANCE_GEN_MULT);

    return {
        [nonAgentKey]: { ...nonAgent },
        [agentKey]: {
            ...agent,
            radiance: newRadiance,
            states: {
                ...agent.states,
                radiant: true,
            },
        },
    };
}

function simulateSacrifice({ agent, agentKey, nonAgent, nonAgentKey }) {
    const oldHp = agent.currHp;
    const dmgTaken = Math.ceil(oldHp / 2);

    const radianceConsumed = Math.min(dmgTaken, agent.radiance);
    const newRadiance = agent.radiance - radianceConsumed;

    const newHp = oldHp - dmgTaken + radianceConsumed;
    const newBloodSacrifice = Math.max(
        agent.bloodSacrifice,
        oldHp - newHp + agent.bloodSacrifice,
    );

    const newMaxMana = agent.maxMana + Math.max(0, oldHp - newHp);

    return {
        [nonAgentKey]: { ...nonAgent },
        [agentKey]: {
            ...agent,
            maxMana: newMaxMana,
            currHp: newHp,
            bloodSacrifice: newBloodSacrifice,
            radiance: newRadiance,
            states: {
                ...agent.states,
                sacrificial: true,
            },
        },
    };
}

function simulateAttack({
    agent,
    agentKey,
    nonAgent,
    nonAgentKey
}) {
    console.log("Attack entities")
    console.log(agent)
    console.log(nonAgent)

    const base_damage =
        agent.attributes.str.value +
        agent.bloodSacrifice * constants.BLOOD_SACRIFICE_MULT;
    
    const effectiveDef = Math.floor(nonAgent.attributes.def.value * processEntityDefEffect(nonAgent));
    const drMult = processEntityDR(nonAgent);

    const final_damage = Math.max(
        1,
        Math.ceil((base_damage - effectiveDef) * drMult)
    );

    const radianceConsumed = Math.min(final_damage, nonAgent.radiance);
    const emberConsumed = Math.min(
        final_damage - radianceConsumed,
        nonAgent.lingeringEmber,
    );
    const newHp = Math.max(
        0,
        nonAgent.currHp - (final_damage - radianceConsumed - emberConsumed),
    );

    console.log(`effdef: ${effectiveDef}, drMult: ${drMult}, base_damage: ${base_damage}, final_damage: ${final_damage}`)

    const newRadiance = nonAgent.radiance - radianceConsumed;
    const newEmber = nonAgent.lingeringEmber - emberConsumed;

    const thornsDmg = nonAgent.states.thornedShackles ? agent.attributes.str.value : 0;
    const attackerNewHP = Math.max(0, agent.currHp - thornsDmg);

    return {
        [agentKey]: { ...agent, currHp: attackerNewHP, radiance: 0 },
        [nonAgentKey]: {
            ...nonAgent,
            currHp: newHp,
            radiance: newRadiance,
            lingeringEmber: newEmber,
        },
    };
}

function simulateSpecialAttack({ agent, agentKey, nonAgent, nonAgentKey }) {
    const base_damage = agent.attributes.str.value + agent.radiance;
    const manaDiff = Math.max(0, agent.currMana - nonAgent.currMana);

    const drMult = processEntityDR(nonAgent);

    const canUseSpAtk =
        agent.currMana + agent.manaOverflow >= constants.SP_ATTACK_COST;

    const final_damage = canUseSpAtk
        ? Math.max(1, Math.floor(base_damage + manaDiff) * drMult)
        : 0;

    const radianceConsumed = Math.min(final_damage, nonAgent.radiance);
    const emberConsumed = Math.min(
        final_damage - radianceConsumed,
        nonAgent.lingeringEmber,
    );
    const newHp = Math.max(
        0,
        nonAgent.currHp - (final_damage - radianceConsumed - emberConsumed),
    );

    const newRadiance = nonAgent.radiance - radianceConsumed;
    const newEmber = nonAgent.lingeringEmber - emberConsumed;

    const defenderNewMana = Math.min(
        nonAgent.maxMana,
        nonAgent.currMana + manaDiff,
    );
    const defenderNewManaOverflow =
        nonAgent.manaOverflow +
        Math.max(0, nonAgent.currMana + manaDiff - nonAgent.maxMana);

    const overflowConsumed = Math.min(
        constants.SP_ATTACK_COST,
        agent.manaOverflow,
    );
    const manaConsumed = constants.SP_ATTACK_COST - overflowConsumed;

    const attackerNewManaOverflow = canUseSpAtk
        ? agent.manaOverflow - overflowConsumed
        : agent.manaOverflow;
    const attackerNewMana = canUseSpAtk
        ? agent.currMana - manaConsumed
        : agent.currMana;

    return {
        [agentKey]: {
            ...agent,
            currMana: attackerNewMana,
            manaOverflow: attackerNewManaOverflow,
            radiance: 0,
        },
        [nonAgentKey]: {
            ...nonAgent,
            currHp: newHp,
            currMana: defenderNewMana,
            manaOverflow: defenderNewManaOverflow,
            radiance: newRadiance,
            lingeringEmber: newEmber,
        },
    };
}

function simulateHeal({ agent, agentKey, nonAgent, nonAgentKey }) {
    const base_heal = Math.min(
        agent.maxHp - agent.currHp,
        agent.currMana + agent.manaOverflow,
    );
    const newHp = Math.min(agent.currHp + base_heal, agent.maxHp);

    const overflowConsumed = Math.min(base_heal, agent.manaOverflow);
    const manaConsumed = base_heal - overflowConsumed;

    const newManaOverflow = agent.manaOverflow - overflowConsumed;
    const newMana = agent.currMana - manaConsumed;

    return {
        [nonAgentKey]: { ...nonAgent },
        [agentKey]: {
            ...agent,
            currHp: newHp,
            currMana: newMana,
            manaOverflow: newManaOverflow,
            poison: 0,
        },
    };
}

function simulateCurse({ agent, agentKey, nonAgent, nonAgentKey }) {
    const agentNewPoison = agent.shackledMana + agent.poison;
    const nonAgentNewPoison = nonAgent.shackledMana + nonAgent.poison;

    return {
        [nonAgentKey]: {
            ...nonAgent,
            poison: nonAgentNewPoison,
            shackledMana: 0,
            states: {
                ...nonAgent.states,
                thornedShackles: false,
            },
        },
        [agentKey]: {
            ...agent,
            poison: agentNewPoison,
            shackledMana: 0,
            states: {
                ...agent.states,
                thornedShackles: false,
            },
        },
    };
}

function simulateArray({ agent, agentKey, nonAgent, nonAgentKey }) {
    const agentShackledMana =
        agent.shackledMana + agent.currMana + agent.manaOverflow;
    const nonAgentShackledMana =
        nonAgent.shackledMana + nonAgent.currMana + nonAgent.manaOverflow;

    return {
        [nonAgentKey]: {
            ...nonAgent,
            currMana: 0,
            manaOverflow: 0,
            shackledMana: nonAgentShackledMana,
            states: {
                ...nonAgent.states,
                thornedShackles: true,
            },
        },
        [agentKey]: {
            ...agent,
            currMana: 0,
            manaOverflow: 0,
            shackledMana: agentShackledMana,
            states: {
                ...agent.states,
                thornedShackles: true,
            },
        },
    };
}

function simulateShadowPact({ agent, agentKey, nonAgent, nonAgentKey }) {
    let draftAgent = { ...agent };
    draftAgent = consumeResources(draftAgent, 5, "shadowPact");

    return {
        [nonAgentKey]: { ...nonAgent },
        [agentKey]: {
            ...draftAgent,
            states: {
                ...agent.states,
                umbralCore: true,
            },
        },
    };
}

function simulateShadowMantle({ agent, agentKey, nonAgent, nonAgentKey }) {
    const unrelentingShadows = agent.shadowflame;
    return {
        [nonAgentKey]: { ...nonAgent },
        [agentKey]: {
            ...agent,
            unrelentingShadows: unrelentingShadows,
            states: {
                ...agent.states,
                darkEmbrace: true,
            },
        },
    };
}

function simulateRitualOfAsh({ agent, agentKey, nonAgent, nonAgentKey }) {
    const newLE = agent.shadowflame + agent.lingeringEmber;
    return {
        [nonAgentKey]: { ...nonAgent },
        [agentKey]: { ...agent, shadowflame: 0, lingeringEmber: newLE },
    };
}

function simulateDarkPromise({ agent, agentKey, nonAgent, nonAgentKey }) {
    const toBeRestored =
        agent.shadowflame + Math.floor(agent.lingeringEmber / 2);

    return {
        [nonAgentKey]: { ...nonAgent, unrelentingShadows: toBeRestored },
        [agentKey]: {
            ...agent,
            shadowflame: 0,
            lingeringEmber: 0,
            cinders: 0,
            unrelentingShadows: toBeRestored,
            states: {
                ...agent.states,
                umbralCore: false,
                dimmingDarkness: true,
            },
        },
    };
}

function simulateBlackMayhem({ agent, agentKey, nonAgent, nonAgentKey }) {
    let draftNonAgent = { ...nonAgent };
    const cindersPreBurn = draftNonAgent.cinders;

    const result = consumeResources(
        draftNonAgent,
        agent.shadowflame,
        "blackMayhem",
    );
    draftNonAgent = result.draftEntity;

    const burntResources = result.consumed;
    const burntCinders = cindersPreBurn - draftNonAgent.cinders;
    const burntNonCinders = burntResources - burntCinders;

    const newNonTargetCinders = draftNonAgent.cinders + burntNonCinders;
    const newTargetLE = agent.lingeringEmber + burntCinders;

    return {
        [nonAgentKey]: { ...draftNonAgent, cinders: newNonTargetCinders },
        [agentKey]: { ...agent, lingeringEmber: newTargetLE },
    };
}

function simulateLaser({ agent, agentKey, nonAgent, nonAgentKey }) {
    const hasEnoughMana = agent.currMana > 0;
    const dmg = hasEnoughMana ? 1 : 0;

    const newOverheat = hasEnoughMana ? agent.overheat + dmg : agent.overheat;
    const opponentHp = hasEnoughMana
        ? Math.max(0, nonAgent.currHp - dmg)
        : nonAgent.currHp;

    const newMana =
        hasEnoughMana && agent.manaOverflow <= 0
            ? agent.currMana - 1
            : agent.currMana;
    const newManaOverflow = Math.max(0, agent.manaOverflow - 1);

    return {
        [nonAgentKey]: { ...nonAgent, currHp: opponentHp },
        [agentKey]: {
            ...agent,
            overheat: newOverheat,
            currMana: newMana,
            manaOverflow: newManaOverflow,
        },
    };
}
