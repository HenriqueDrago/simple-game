import { constants } from "./constants.js";
import { simulators } from "./simulators.js";
import { consumeResources } from "./entities.js";
import { actionKeys, effectKeys } from "./enums.js";

export function simpleAI(context) {
    const {
        agent,
        agentKey,
        nonAgentKey,
        totalMana,
        hasManaForSpecial,
        handleAction,
    } = context;

    // In low hp: heal if enough mana, otherwise gaurd
    if (agent.currHp <= agent.maxHp * 0.5) {
        if (totalMana >= 3) {
            handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
        } else {
            handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        }
        return;
    }

    // atandard attack
    handleAction(actionKeys.ATTACK, agentKey, nonAgentKey);
}

export function bloodknightAI(context) {
    const { agent, agentKey, nonAgentKey, isArrayActive, handleAction } =
        context;

    const missingHp = agent.maxHp - agent.currHp;

    // Avoid throns
    if (
        isArrayActive &&
        agent.attributes.str.value + agent.scoria > agent.currHp
    ) {
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        return;
    }

    // Use Sacrifice if not enouhg accumulated dmg
    if (
        agent.currHp >= agent.maxHp * 0.6 &&
        agent.resources.bloodSacrifice +
            agent.attributes.str.value +
            agent.scoria <
            agent.maxHp
    ) {
        handleAction(actionKeys.SACRIFICE, agentKey, nonAgentKey);
        return;
    }

    // Guard if dying to recover mana (and thus, hp)
    if (
        agent.resources.bloodSacrifice > 0 &&
        agent.currMana < missingHp &&
        missingHp >= agent.maxHp * 0.3
    ) {
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        return;
    }

    // Standard Attack
    handleAction(actionKeys.ATTACK, agentKey, nonAgentKey);
}

export function paladinAI(context) {
    const {
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        totalMana,
        hasManaForSpecial,
        handleAction,
        prev,
    } = context;

    if (agent.resources.radiance >= 5) {
        if (hasManaForSpecial) {
            handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
        } else {
            handleAction(actionKeys.ATTACK, agentKey, nonAgentKey);
        }
        return;
    }

    handleAction(actionKeys.AEGIS, agentKey, nonAgentKey);
}

export function hexerAI(context) {
    const {
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        isArrayActive,
        hasManaForSpecial,
        handleAction,
        prev,
    } = context;

    const simCurse = isArrayActive
        ? simulators[actionKeys.CURSE]({
              agent,
              agentKey,
              nonAgent,
              nonAgentKey,
              prev,
          })
        : null;

    if (isArrayActive) {
        if (
            simCurse.entities[nonAgentKey].resources.poison >=
                simCurse.entities[nonAgentKey].currHp ||
            simCurse.entities[agentKey].resources.poison <
                simCurse.entities[agentKey].currHp
        ) {
            handleAction(actionKeys.CURSE, agentKey, nonAgentKey);
            return;
        }
        return;
    } else {
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
}

export function warlockAI(context) {
    const {
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        isArrayActive,
        totalMana,
        hasManaForSpecial,
        handleAction,
        prev,
    } = context;

    const simSpecial = simulators[actionKeys.SPECIAL_ATTACK]({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        prev,
    });
    const simCurse = isArrayActive
        ? simulators[actionKeys.CURSE]({
              agent,
              agentKey,
              nonAgent,
              nonAgentKey,
              prev,
          })
        : null;

    // Attacks if simulation returns a kill
    if (hasManaForSpecial && simSpecial.entities[nonAgentKey].currHp <= 0) {
        handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
        return;
    }

    // Use curse if it kills the opponent
    if (isArrayActive) {
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
        prev,
    } = context;

    const simCurse = isArrayActive
        ? simulators[actionKeys.CURSE]({
              agent,
              agentKey,
              nonAgent,
              nonAgentKey,
              prev,
          })
        : null;

    // === Outside Umbral ===

    // if in an array, kills the opponent with poison if possible
    if (isArrayActive && !agent.states.umbralCore) {
        if (!nonAgent.states.dimmingDarkness) {
            if (
                simCurse.entities[nonAgentKey].resources.poison >=
                simCurse.entities[nonAgentKey].currHp
            ) {
                handleAction(actionKeys.CURSE, agentKey, nonAgentKey);
                return;
            }
        }
    }

    // Umbral Entry
    if (!agent.states.umbralCore) {
        handleAction(actionKeys.SHADOW_PACT, agentKey, nonAgentKey);
        return;
    }

    // === Umbral ===

    // Uses DP to escape overflow death
    if (agent.resources.manaOverflow >= agent.currHp) {
        handleAction(actionKeys.DARK_PROMISE, agentKey, nonAgentKey);
        return;
    }

    // Check if should do Dark Promise
    const simPromise = simulators[actionKeys.DARK_PROMISE]({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        prev,
    });
    const postPromiseEnemy = simPromise.entities[nonAgentKey];
    const postPromiseSelf = simPromise.entities[agentKey];

    if (postPromiseEnemy.resources.manaOverflow >= postPromiseEnemy.currHp) {
        const missingHp = postPromiseEnemy.maxHp - postPromiseEnemy.currHp;
        const healBurn = Math.min(
            missingHp,
            postPromiseEnemy.currMana + postPromiseEnemy.resources.manaOverflow,
        );
        const overflowAfterHeal = Math.max(
            0,
            postPromiseEnemy.resources.manaOverflow - healBurn,
        );
        const hpAfterHeal = postPromiseEnemy.currHp + healBurn;

        const savedByHeal = overflowAfterHeal < hpAfterHeal;
        const savedBySpAtk =
            Math.max(
                0,
                postPromiseEnemy.resources.manaOverflow -
                    constants.SP_ATTACK_COST,
            ) < postPromiseEnemy.currHp;
        const savedByShadows = postPromiseEnemy.states.umbralCore;

        if (!savedByHeal && !savedBySpAtk && !savedByShadows) {
            // C. Survival Check: Will we survive their desperate final attack?
            const simAtk = simulators[actionKeys.ATTACK]({
                agent: postPromiseEnemy,
                agentKey: nonAgentKey,
                nonAgent: postPromiseSelf,
                nonAgentKey: agentKey,
                prev,
            });
            const simSpAtk = simulators[actionKeys.SPECIAL_ATTACK]({
                agent: postPromiseEnemy,
                agentKey: nonAgentKey,
                nonAgent: postPromiseSelf,
                nonAgentKey: agentKey,
                prev,
            });

            if (
                simAtk.entities[agentKey].currHp > 0 &&
                simSpAtk.entities[agentKey].currHp > 0
            ) {
                handleAction(actionKeys.DARK_PROMISE, agentKey, nonAgentKey);
                return;
            }
        }
    }

    // Burn Management
    const { draftEntity: draftTarget } = consumeResources(
        agent,
        agent.resources.shadowflame,
        effectKeys.SHADOWFLAME,
    );

    if (draftTarget.currHp <= 0) {
        if (
            agent.currHp < agent.maxHp * 0.5 &&
            agent.resources.shadowflame <
                agent.currHp + (agent.maxMana - agent.currMana)
        ) {
            handleAction(actionKeys.SHADOW_MANTLE, agentKey, nonAgentKey);
        } else {
            handleAction(actionKeys.RITUAL_OF_ASH, agentKey, nonAgentKey);
        }
        return;
    }

    // Default Attack (Black Mayhem)
    handleAction(actionKeys.BLACK_MAYHEM, agentKey, nonAgentKey);
}
