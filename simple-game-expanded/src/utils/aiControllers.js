import { constants } from "./constants.js";
import { simulators } from "./simulators.js";
import { consumeResources, restoreResources } from "./entities.js";
import { actionKeys, effectKeys } from "./enums.js";

function createSimulator({ agent, agentKey, nonAgent, nonAgentKey, prev }) {
    return (actionKey, overrides = {}) =>
        simulators[actionKey]({
            agent,
            agentKey,
            nonAgent,
            nonAgentKey,
            prev,
            ...overrides,
        });
}

export function simpleAI(context) {
    const { agent, agentKey, nonAgentKey, totalMana, handleAction } = context;

    // In low hp: heal if enough mana, otherwise gaurd
    if (agent.currHp <= agent.maxHp * 0.5) {
        if (totalMana >= 4) {
            handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
        } else {
            handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        }
        return;
    }

    // standard attack
    handleAction(actionKeys.ATTACK, agentKey, nonAgentKey);
}

export function bloodknightAI(context) {
    const { agent, agentKey, nonAgentKey, isArrayActive, handleAction } =
        context;

    const missingHp = agent.maxHp - agent.currHp;
    const missingMana = agent.maxMana - agent.currMana;
    const nextTurnHeal = Math.min(
        agent.currMana,
        Math.floor(agent.resources.bloodSacrifice / 2),
    );

    // Guard to recover mana
    if (
        !isArrayActive &&
        nextTurnHeal < missingHp &&
        agent.resources.bloodSacrifice > 0 &&
        missingMana >= agent.maxMana * constants.GUARD_MANA_REGEN
    ) {
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        return;
    }

    // Use Sacrifice if not enough accumulated dmg
    if (
        agent.currHp >= agent.maxHp * 0.6 &&
        agent.resources.bloodSacrifice + agent.attributes.str.value <
            agent.maxHp
    ) {
        handleAction(actionKeys.SACRIFICE, agentKey, nonAgentKey);
        return;
    }

    // Standard Attack
    handleAction(actionKeys.ATTACK, agentKey, nonAgentKey);
}

export function paladinAI(context) {
    const { agentKey, nonAgentKey, handleAction } = context;

    const simulate = createSimulator(context);
    const simAtk = simulate(actionKeys.ATTACK);

    if (simAtk.entities[nonAgentKey].currHp <= 0) {
        handleAction(actionKeys.ATTACK, agentKey, nonAgentKey);
        return;
    }

    handleAction(actionKeys.AEGIS, agentKey, nonAgentKey);
}

export function hexerAI(context) {
    const {
        agent,
        agentKey,
        nonAgentKey,
        isArrayActive,
        hasManaForSpecial,
        handleAction,
    } = context;

    if (isArrayActive) {
        const simulate = createSimulator(context);
        const simCurse = simulate(actionKeys.CURSE);

        const killsOpponent =
            simCurse.entities[nonAgentKey].resources.poison >=
            simCurse.entities[nonAgentKey].currHp;
        const staysSafe =
            simCurse.entities[agentKey].resources.poison <
            simCurse.entities[agentKey].currHp;

        if (killsOpponent || staysSafe) {
            handleAction(actionKeys.CURSE, agentKey, nonAgentKey);
            return;
        }

        // Not yet lethal/safe to curse
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        return;
    }

    if (hasManaForSpecial) {
        handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
        return;
    }

    if (agent.resources.poison >= agent.currHp) {
        handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
        return;
    }

    // Array
    handleAction(actionKeys.ARRAY, agentKey, nonAgentKey);
}

export function warlockAI(context) {
    const {
        agent,
        agentKey,
        nonAgentKey,
        isArrayActive,
        totalMana,
        hasManaForSpecial,
        handleAction,
    } = context;

    const simulate = createSimulator(context);

    // Attacks if simulation returns a kill
    if (hasManaForSpecial) {
        const simSpecial = simulate(actionKeys.SPECIAL_ATTACK);
        if (simSpecial.entities[nonAgentKey].currHp <= 0) {
            handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
            return;
        }
    }

    // Use curse if it kills the opponent
    if (isArrayActive) {
        const simCurse = simulate(actionKeys.CURSE);
        if (
            simCurse.entities[nonAgentKey].resources.poison >=
            simCurse.entities[nonAgentKey].currHp
        ) {
            handleAction(actionKeys.CURSE, agentKey, nonAgentKey);
            return;
        }
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        return;
    }

    // Clears Poison/Overflow
    const lethalThreat = agent.resources.poison + agent.resources.manaOverflow;

    if (
        agent.resources.manaOverflow > 0 ||
        agent.currHp - lethalThreat <= agent.maxHp * 0.5
    ) {
        if (hasManaForSpecial) {
            handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
            return;
        } else if (totalMana >= 3 && agent.currHp < agent.maxHp) {
            handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
            return;
        }
    }

    // Attack/Guard
    if (hasManaForSpecial) {
        handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
    } else {
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
    }
}

export function shadowSorcererAI(context) {
    const {
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        isArrayActive,
        handleAction,
    } = context;

    const simulate = createSimulator(context);

    // === Outside Umbral ===

    // If in an array, kill the opponent with poison if possible
    if (
        isArrayActive &&
        !agent.states.umbralCore &&
        !nonAgent.states.dimmingDarkness
    ) {
        const simCurse = simulate(actionKeys.CURSE);
        if (
            simCurse.entities[nonAgentKey].resources.poison >=
            simCurse.entities[nonAgentKey].currHp
        ) {
            handleAction(actionKeys.CURSE, agentKey, nonAgentKey);
            return;
        }
    }

    // Umbral Entry
    // Skip if bleakDeception makes Shadow Pact unusable
    if (!agent.states.umbralCore) {
        if (agent.states.bleakDeception) {
            handleAction(actionKeys.ATTACK, agentKey, nonAgentKey);
        } else {
            handleAction(actionKeys.SHADOW_PACT, agentKey, nonAgentKey);
        }
        return;
    }

    // === Inside Umbral ===

    // Kill check
    // Always do Black Mayhem if lethal
    const simMayhem = simulate(actionKeys.BLACK_MAYHEM);
    if (simMayhem.entities[nonAgentKey].currHp <= 0) {
        handleAction(actionKeys.BLACK_MAYHEM, agentKey, nonAgentKey);
        return;
    }

    // Uses Dark Promise to escape overflow death
    if (agent.resources.manaOverflow >= agent.currHp) {
        handleAction(actionKeys.DARK_PROMISE, agentKey, nonAgentKey);
        return;
    }

    // Check if Dark Promise will trap the opponent in lethal overflow
    const simPromise = simulate(actionKeys.DARK_PROMISE);
    const postPromiseEnemy = simPromise.entities[nonAgentKey];
    const postPromiseSelf = simPromise.entities[agentKey];

    const toBeRestored = postPromiseEnemy.resources.unrelentingShadows;
    const enemyAfterRestore = restoreResources(postPromiseEnemy, toBeRestored);

    const dieToOverflow =
        enemyAfterRestore.resources.manaOverflow >= enemyAfterRestore.currHp;

    if (dieToOverflow) {
        const simAtk = simulate(actionKeys.ATTACK, {
            agent: nonAgent,
            agentKey: nonAgentKey,
            nonAgent: postPromiseSelf,
            nonAgentKey: agentKey,
        });
        const simSpAtk = simulate(actionKeys.SPECIAL_ATTACK, {
            agent: nonAgent,
            agentKey: nonAgentKey,
            nonAgent: postPromiseSelf,
            nonAgentKey: agentKey,
        });

        if (
            simAtk.entities[agentKey].currHp > 0 &&
            simSpAtk.entities[agentKey].currHp > 0
        ) {
            handleAction(actionKeys.DARK_PROMISE, agentKey, nonAgentKey);
            return;
        }
    }

    // Burn Management
    const { draftEntity: draftTarget } = consumeResources(
        agent,
        agent.resources.shadowflame,
        effectKeys.SHADOWFLAME,
    );

    // If low hp, use SM if beneficial
    if (agent.currHp <= agent.maxHp * 0.5) {
        const simMantle = simulate(actionKeys.SHADOW_MANTLE);
        const postMantle = simMantle.entities[agentKey];

        const toBeRestored = postMantle.resources.unrelentingShadows;
        const agentAfterRestore = restoreResources(postMantle, toBeRestored);

        const netHpGain =
            agentAfterRestore.currHp -
            agentAfterRestore.resources.manaOverflow -
            agent.currHp;

        if (netHpGain > 0) {
            handleAction(actionKeys.SHADOW_MANTLE, agentKey, nonAgentKey);
            return;
        }
    }

    // Avoid lethal burn
    if (draftTarget.currHp <= 0) {
        handleAction(actionKeys.RITUAL_OF_ASH, agentKey, nonAgentKey);
        return;
    }

    // Default: drain the opponent
    handleAction(actionKeys.BLACK_MAYHEM, agentKey, nonAgentKey);
}

export function cyborgAI(context) {
    const { agent, agentKey, nonAgentKey, handleAction } = context;
    const simulate = createSimulator(context);

    // Extract stats and states using strict enum key references
    const dynamo = agent[effectKeys.DYNAMO] || 0;
    const overheat = agent[effectKeys.OVERHEAT] || 0;

    // Pre-calculated HEAL evaluation
    const healWorth =
        agent[effectKeys.MANA] >= 5 &&
        agent[effectKeys.HEALTH] <= agent[effectKeys.MAX_HEALTH] * 0.5;

    // 1. Thermal Overload -> Meltdown
    if (agent.states[effectKeys.THERMAL_OVERLOAD]) {
        handleAction(actionKeys.MELTDOWN, agentKey, nonAgentKey);
        return;
    }

    // 2. !venting/weaponsdeployed/thermaloverload/deployment -> Deploy
    const inAnyStance =
        agent.states[effectKeys.VENTING] ||
        agent.states[effectKeys.WEAPONS_DEPLOYED] ||
        agent.states[effectKeys.THERMAL_OVERLOAD] ||
        agent.states[effectKeys.DEPLOYMENT];

    if (!inAnyStance) {
        handleAction(actionKeys.DEPLOY, agentKey, nonAgentKey);
        return;
    }

    // 3. if venting then healWorth -> heal else guard
    if (agent.states[effectKeys.VENTING]) {
        if (healWorth) {
            handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
        } else {
            handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        }
        return;
    }

    // Generate baseline simulation for steps 4 & 5
    const simLaser = simulate(actionKeys.LASER);

    // 4. check if laser kills -> laser
    if (simLaser.entities[nonAgentKey][effectKeys.HEALTH] <= 0) {
        handleAction(actionKeys.LASER, agentKey, nonAgentKey);
        return;
    }

    // 5. check if laser sets us to >= 100 overheat (100% or above threshold)
    if (simLaser.entities[agentKey][effectKeys.OVERHEAT] >= 100) {
        // 5.1 check if meltdown kills the opponent -> laser
        // Passes post-laser simulation states into the meltdown simulator
        const simMeltdown = simulate(actionKeys.MELTDOWN, {
            agent: simLaser.entities[agentKey],
            nonAgent: simLaser.entities[nonAgentKey],
        });

        if (simMeltdown.entities[nonAgentKey][effectKeys.HEALTH] <= 0) {
            handleAction(actionKeys.LASER, agentKey, nonAgentKey);
            return;
        } else {
            // 5.2 else: healWorth -> heal else guard
            if (healWorth) {
                handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
            } else {
                handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
            }
            return;
        }
    }

    // 6. overheat > 30 and dynamo >= 70 and dynamo < 100 then
    if (overheat > 30 && dynamo >= 70 && dynamo < 100) {
        // 6.1 healWorth -> heal / 6.2 else guard
        if (healWorth) {
            handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
        } else {
            handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        }
        return;
    }

    // 7. laser fallback
    handleAction(actionKeys.LASER, agentKey, nonAgentKey);
}

export function maestroAI(context) {
    const { agent, agentKey, nonAgentKey, handleAction } = context;

    let action;
    if (agent.states.thermalOverload) {
        action = actionKeys.MELTDOWN;
    } else if (!agent.states.resonant) {
        action = actionKeys.ATTUNE;
    } else if (agent.sonority === constants.SONORITY_LOWER_LIMIT) {
        action = actionKeys.SOUND_OF_SILENCE;
    } else if (agent.sonority === constants.SONORITY_HIGHER_LIMIT) {
        action = actionKeys.BABEL;
    } else if (
        agent.states.weaponsDeployed &&
        agent[effectKeys.SONORITY] <= 0
    ) {
        action = actionKeys.LASER;
    } else if (
        !agent.states.weaponsDeployed &&
        !agent.states.deployment &&
        !agent.states.weaponsDeployed &&
        !agent.states.venting
    ) {
        action = actionKeys.DEPLOY;
    } else if (agent[effectKeys.SONORITY] < 0) {
        action = actionKeys.SOUND_OF_SILENCE;
    } else if (agent[effectKeys.SONORITY] > 0) {
        action = actionKeys.BABEL;
    } else {
        action = actionKeys.GUARD;
    }

    handleAction(action, agentKey, nonAgentKey);
}
