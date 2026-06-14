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

    // 1. Emergency Survival: Heal if we have at least 3 mana, otherwise Guard
    if (agent.currHp <= agent.maxHp * 0.5) {
        if (totalMana >= 3) {
            handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
        } else {
            handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        }
        return;
    }

    // 2. Dump the Nuke: If we hit 6 mana, fire it immediately
    if (hasManaForSpecial) {
        handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
        return;
    }

    // 3. Standard Punch
    handleAction(actionKeys.ATTACK, agentKey, nonAgentKey);
}

export function bloodknightAI(context) {
    const {
        agent,
        agentKey,
        nonAgentKey,
        isArrayActive,
        totalMana,
        hasManaForSpecial,
        handleAction,
    } = context;

    const missingHp = agent.maxHp - agent.currHp;

    // 1. The Array Pivot & Thorns Avoidance
    if (isArrayActive && agent.attributes.str.value < agent.currHp) {
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        return;
    }

    // 2. Dump the Hot Potato (Overflow) & Emergency Heal
    if (agent.resources.manaOverflow > 0 || agent.currHp <= agent.maxHp * 0.5) {
        // Only use SpAtk if we MUST dump overflow, AND Heal wouldn't burn enough mana to save us
        if (
            agent.resources.manaOverflow > 0 &&
            hasManaForSpecial &&
            missingHp < constants.SP_ATTACK_COST
        ) {
            handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
            return;
        } else if (totalMana >= 3) {
            handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
            return;
        }
    }

    // 3. The Sacrifice Engine
    if (
        agent.currHp > agent.maxHp * 0.65 &&
        agent.resources.bloodSacrifice + agent.attributes.str.value < agent.maxHp * 1.4
    ) {
        handleAction(actionKeys.SACRIFICE, agentKey, nonAgentKey);
        return;
    }

    // 4. Bleeding out without fuel? Guard to ensure Mana Bleed can heal you next turn.
    if (
        agent.resources.bloodSacrifice > 0 &&
        agent.currMana < missingHp &&
        missingHp >= agent.maxHp * 0.3
    ) {
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        return;
    }

    // 5. Default: Unleash the buffed Attack
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

    const simNormal = simulators[actionKeys.ATTACK]({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        prev,
    });
    const simSpecial = simulators[actionKeys.SPECIAL_ATTACK]({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        prev,
    });

    if (
        hasManaForSpecial &&
        simSpecial.entities[nonAgentKey].currHp <= 0 &&
        simSpecial.entities[agentKey].currHp > 0
    ) {
        handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
        return;
    }

    if (simNormal.entities[nonAgentKey].currHp <= 0 && simNormal.entities[agentKey].currHp > 0) {
        handleAction(actionKeys.ATTACK, agentKey, nonAgentKey);
        return;
    }

    const effectiveHp = agent.currHp + agent.resources.radiance;
    const lethalThreat = agent.resources.poison + agent.resources.manaOverflow;

    if (effectiveHp - lethalThreat <= agent.maxHp * 0.5 && totalMana >= 3) {
        handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
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
        prev
    } = context;

    const simSpecial = simulators[actionKeys.SPECIAL_ATTACK]({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        prev
    });
    const simCurse = isArrayActive
        ? simulators[actionKeys.CURSE]({ agent, agentKey, nonAgent, nonAgentKey, prev })
        : null;

    if (isArrayActive) {
        // 1. If Curse applies enough poison to kill the opponent next turn, detonate!
        if (simCurse.entities[nonAgentKey].resources.poison >= simCurse.entities[nonAgentKey].currHp) {
            handleAction(actionKeys.CURSE, agentKey, nonAgentKey);
            return;
        }

        // 2. Otherwise, Guard to generate mana which feeds the Thorned Shackles at turn end
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        return;
    } else {
        // --- NOT IN ARRAY EXCEPTIONS ---

        // Exception 1: SpAtk is guaranteed lethal
        if (hasManaForSpecial && simSpecial.entities[nonAgentKey].currHp <= 0) {
            handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
            return;
        }

        // Exception 2: Poison is going to kill us during Upkeep
        if (agent.resources.poison >= agent.currHp) {
            handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
            return;
        }

        // Exception 3: Opponent has considerably less mana, nuke them to force mana onto their sheet
        const manaDiff = agent.currMana - nonAgent.currMana;
        if (hasManaForSpecial && manaDiff >= 4) {
            handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
            return;
        }

        // Default: Trap them in the Array
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
        ? simulators[actionKeys.CURSE]({ agent, agentKey, nonAgent, nonAgentKey, prev })
        : null;

    // 1. Absolute Lethality (Always take the shot if it wins the game)
    if (hasManaForSpecial && simSpecial.entities[nonAgentKey].currHp <= 0) {
        handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
        return;
    }

    // 2. Array Management (Fixing the Panic Curse)
    if (isArrayActive) {
        // Detonate ONLY if it guarantees the enemy dies to poison
        if (simCurse.entities[nonAgentKey].resources.poison >= simCurse.entities[nonAgentKey].currHp) {
            handleAction(actionKeys.CURSE, agentKey, nonAgentKey);
            return;
        }
        // Otherwise, stall the array to survive Thorns and incoming damage
        handleAction(actionKeys.GUARD, agentKey, nonAgentKey);
        return;
    }

    // 3. Overflow Management & Survival (Dynamic 50% Threshold)
    const lethalThreat = agent.resources.poison + agent.resources.manaOverflow;

    if (
        agent.resources.manaOverflow > 0 ||
        agent.currHp - lethalThreat <= agent.maxHp * 0.5
    ) {
        if (hasManaForSpecial) {
            // Priority 1: Dump the massive overflow onto the enemy as a weapon!
            handleAction(actionKeys.SPECIAL_ATTACK, agentKey, nonAgentKey);
            return;
        } else if (totalMana >= 3 && agent.currHp < agent.maxHp) {
            // Priority 2: Cleanse poison / heal the damage buffer
            handleAction(actionKeys.HEAL, agentKey, nonAgentKey);
            return;
        }
    }

    // 4. Default: The Warlock Engine
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

    // 1. The Array/Curse Exception (When outside Umbral Core)
    if (isArrayActive && !agent.states.umbralCore) {
        if (!nonAgent.states.dimmingDarkness) {
            const lethalPoison =
                nonAgent.currMana +
                nonAgent.resources.manaOverflow +
                nonAgent.resources.shackledMana +
                nonAgent.resources.poison;
            if (lethalPoison >= nonAgent.currHp) {
                handleAction(actionKeys.CURSE, agentKey, nonAgentKey);
                return;
            }
        }
    }

    // 2. The Entry Priority
    if (!agent.states.umbralCore) {
        handleAction(actionKeys.SHADOW_PACT, agentKey, nonAgentKey);
        return;
    }

    // --- UMBRAL CORE LOGIC ---

    // Overflow escape
    if (agent.resources.manaOverflow > agent.currHp) {
        handleAction(actionKeys.DARK_PROMISE, agentKey, nonAgentKey);
        return;
    }

    // 3. The Dark Promise Bomb (Lethality & Survival Check)
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
                postPromiseEnemy.resources.manaOverflow - constants.SP_ATTACK_COST,
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

            if (simAtk.entities[agentKey].currHp > 0 && simSpAtk.entities[agentKey].currHp > 0) {
                handleAction(actionKeys.DARK_PROMISE, agentKey, nonAgentKey);
                return;
            }
        }
    }

    // 4. Burn Management (Ritual of Ash vs Shadow Mantle)
    const { draftEntity: draftTarget } = consumeResources(agent, agent.resources.shadowflame, effectKeys.SHADOWFLAME)

    console.log("test", agent, draftTarget)

    if (draftTarget.currHp < agent.currHp) {
        if (agent.currHp <= agent.maxHp * 0.5 && agent.resources.shadowflame >= 10) {
            handleAction(actionKeys.SHADOW_MANTLE, agentKey, nonAgentKey);
        } else {
            handleAction(actionKeys.RITUAL_OF_ASH, agentKey, nonAgentKey);
        }
        return;
    }

    // 5. Default Engine
    handleAction(actionKeys.BLACK_MAYHEM, agentKey, nonAgentKey);
}