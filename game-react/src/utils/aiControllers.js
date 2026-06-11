import { constants } from "./constants.js";
import { simulators } from "./simulators.js";

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
            handleAction("Heal", agentKey, nonAgentKey);
        } else {
            handleAction("Guard", agentKey, nonAgentKey);
        }
        return;
    }

    // 2. Dump the Nuke: If we hit 6 mana, fire it immediately
    if (hasManaForSpecial) {
        handleAction("SpecialAttack", agentKey, nonAgentKey);
        return;
    }

    // 3. Standard Punch
    handleAction("Attack", agentKey, nonAgentKey);
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
    if (isArrayActive && agent.attributes.str.value > 3) {
        handleAction("Guard", agentKey, nonAgentKey);
        return;
    }

    // 2. Dump the Hot Potato (Overflow) & Emergency Heal
    if (agent.manaOverflow > 0 || agent.currHp <= agent.maxHp * 0.5) {
        // Only use SpAtk if we MUST dump overflow, AND Heal wouldn't burn enough mana to save us
        if (
            agent.manaOverflow > 0 &&
            hasManaForSpecial &&
            missingHp < constants.SP_ATTACK_COST
        ) {
            handleAction("SpecialAttack", agentKey, nonAgentKey);
            return;
        } else if (totalMana >= 3) {
            handleAction("Heal", agentKey, nonAgentKey);
            return;
        }
    }

    // 3. The Sacrifice Engine
    if (
        agent.currHp > agent.maxHp * 0.65 &&
        agent.bloodSacrifice + agent.attributes.str.value < agent.maxHp * 1.4
    ) {
        handleAction("Sacrifice", agentKey, nonAgentKey);
        return;
    }

    // 4. Bleeding out without fuel? Guard to ensure Mana Bleed can heal you next turn.
    if (
        agent.bloodSacrifice > 0 &&
        agent.currMana < missingHp &&
        missingHp >= agent.maxHp * 0.3
    ) {
        handleAction("Guard", agentKey, nonAgentKey);
        return;
    }

    // 5. Default: Unleash the buffed Attack
    handleAction("Attack", agentKey, nonAgentKey);
}

export function paladinAI(context) {
    const {
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        isArrayActive,
        totalMana,
        hasManaForSpecial,
        handleAction,
    } = context;

    const simNormal = simulators.simulateAttack({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        isArrayActive,
    });
    const simSpecial = simulators.simulateSpecialAttack({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
    });

    if (
        hasManaForSpecial &&
        simSpecial[nonAgentKey].currHp <= 0 &&
        simSpecial[agentKey].currHp > 0
    ) {
        handleAction("SpecialAttack", agentKey, nonAgentKey);
        return;
    }

    if (simNormal[nonAgentKey].currHp <= 0 && simNormal[agentKey].currHp > 0) {
        handleAction("Attack", agentKey, nonAgentKey);
        return;
    }

    const effectiveHp = agent.currHp + agent.radiance;
    const lethalThreat = agent.poison + agent.manaOverflow;

    if (effectiveHp - lethalThreat <= agent.maxHp * 0.5 && totalMana >= 3) {
        handleAction("Heal", agentKey, nonAgentKey);
        return;
    }

    handleAction("Aegis", agentKey, nonAgentKey);
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
    } = context;

    const simSpecial = simulators.simulateSpecialAttack({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
    });
    const simCurse = isArrayActive
        ? simulators.simulateCurse({ agent, agentKey, nonAgent, nonAgentKey })
        : null;

    if (isArrayActive) {
        // 1. If Curse applies enough poison to kill the opponent next turn, detonate!
        if (simCurse[nonAgentKey].poison >= simCurse[nonAgentKey].currHp) {
            handleAction("Curse", agentKey, nonAgentKey);
            return;
        }

        // 2. Otherwise, Guard to generate mana which feeds the Thorned Shackles at turn end
        handleAction("Guard", agentKey, nonAgentKey);
        return;
    } else {
        // --- NOT IN ARRAY EXCEPTIONS ---

        // Exception 1: SpAtk is guaranteed lethal
        if (hasManaForSpecial && simSpecial[nonAgentKey].currHp <= 0) {
            handleAction("SpecialAttack", agentKey, nonAgentKey);
            return;
        }

        // Exception 2: Poison is going to kill us during Upkeep
        if (agent.poison >= agent.currHp) {
            handleAction("Heal", agentKey, nonAgentKey);
            return;
        }

        // if (agent.overheat < constants.MAX_OVERHEAT - 1 && agent.currMana > 0) {
        //     handleAction("Laser", agentKey, nonAgentKey);
        //     return;
        // }

        // Exception 3: Opponent has considerably less mana, nuke them to force mana onto their sheet
        const manaDiff = agent.currMana - nonAgent.currMana;
        if (hasManaForSpecial && manaDiff >= 4) {
            handleAction("SpecialAttack", agentKey, nonAgentKey);
            return;
        }

        // Default: Trap them in the Array
        handleAction("Array", agentKey, nonAgentKey);
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
    } = context;

    const simSpecial = simulators.simulateSpecialAttack({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
    });
    const simCurse = isArrayActive
        ? simulators.simulateCurse({ agent, agentKey, nonAgent, nonAgentKey })
        : null;

    // 1. Absolute Lethality (Always take the shot if it wins the game)
    if (hasManaForSpecial && simSpecial[nonAgentKey].currHp <= 0) {
        handleAction("SpecialAttack", agentKey, nonAgentKey);
        return;
    }

    // 2. Array Management (Fixing the Panic Curse)
    if (isArrayActive) {
        // Detonate ONLY if it guarantees the enemy dies to poison
        if (simCurse[nonAgentKey].poison >= simCurse[nonAgentKey].currHp) {
            handleAction("Curse", agentKey, nonAgentKey);
            return;
        }
        // Otherwise, stall the array to survive Thorns and incoming damage
        handleAction("Guard", agentKey, nonAgentKey);
        return;
    }

    // 3. Overflow Management & Survival (Dynamic 50% Threshold)
    const lethalThreat = agent.poison + agent.manaOverflow;

    if (
        agent.manaOverflow > 0 ||
        agent.currHp - lethalThreat <= agent.maxHp * 0.5
    ) {
        if (hasManaForSpecial) {
            // Priority 1: Dump the massive overflow onto the enemy as a weapon!
            handleAction("SpecialAttack", agentKey, nonAgentKey);
            return;
        } else if (totalMana >= 3 && agent.currHp < agent.maxHp) {
            // Priority 2: Cleanse poison / heal the damage buffer
            handleAction("Heal", agentKey, nonAgentKey);
            return;
        }
    }

    // 4. Default: The Warlock Engine
    if (hasManaForSpecial) {
        handleAction("SpecialAttack", agentKey, nonAgentKey);
    } else {
        handleAction("Guard", agentKey, nonAgentKey);
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
        consumeResources,
    } = context;

    // 1. The Array/Curse Exception (When outside Umbral Core)
    if (isArrayActive && !agent.umbralCore) {
        if (!nonAgent.dimmingDarkness) {
            const lethalPoison =
                nonAgent.currMana +
                nonAgent.manaOverflow +
                nonAgent.shackledMana +
                nonAgent.poison;
            if (lethalPoison >= nonAgent.currHp) {
                handleAction("Curse", agentKey, nonAgentKey);
                return;
            }
        }
    }

    // 2. The Entry Priority
    if (!agent.umbralCore) {
        handleAction("ShadowPact", agentKey, nonAgentKey);
        return;
    }

    // --- UMBRAL CORE LOGIC ---
    if (agent.manaOverflow > agent.currHp) {
        handleAction("DarkPromise", agentKey, nonAgentKey);
        return;
    }

    // 3. The Dark Promise Bomb (Lethality & Survival Check)
    const simPromise = simulators.simulateDarkPromise({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
    });
    const postPromiseEnemy = simPromise[nonAgentKey];
    const postPromiseSelf = simPromise[agentKey];

    if (postPromiseEnemy.manaOverflow >= postPromiseEnemy.currHp) {
        const missingHp = postPromiseEnemy.maxHp - postPromiseEnemy.currHp;
        const healBurn = Math.min(
            missingHp,
            postPromiseEnemy.currMana + postPromiseEnemy.manaOverflow,
        );
        const overflowAfterHeal = Math.max(
            0,
            postPromiseEnemy.manaOverflow - healBurn,
        );
        const hpAfterHeal = postPromiseEnemy.currHp + healBurn;

        const savedByHeal = overflowAfterHeal < hpAfterHeal;
        const savedBySpAtk =
            Math.max(
                0,
                postPromiseEnemy.manaOverflow - constants.SP_ATTACK_COST,
            ) < postPromiseEnemy.currHp;
        const savedByShadows = postPromiseEnemy.umbralCore;

        if (!savedByHeal && !savedBySpAtk && !savedByShadows) {
            // C. Survival Check: Will we survive their desperate final attack?
            const simAtk = simulators.simulateAttack({
                agent: postPromiseEnemy,
                agentKey: nonAgentKey,
                nonAgent: postPromiseSelf,
                nonAgentKey: agentKey,
                isArrayActive,
            });
            const simSpAtk = simulators.simulateSpecialAttack({
                agent: postPromiseEnemy,
                agentKey: nonAgentKey,
                nonAgent: postPromiseSelf,
                nonAgentKey: agentKey,
            });

            if (simAtk[agentKey].currHp > 0 && simSpAtk[agentKey].currHp > 0) {
                handleAction("DarkPromise", agentKey, nonAgentKey);
                return;
            }
        }
    }

    // 4. Burn Management (Ritual of Ash vs Shadow Mantle)
    const draftTarget = consumeResources
        ? consumeResources(agent, agent.shadowflame, "shadowflame")
        : agent;

    if (draftTarget.currHp < agent.currHp) {
        if (agent.currHp <= agent.maxHp * 0.5 && agent.shadowflame >= 10) {
            handleAction("ShadowMantle", agentKey, nonAgentKey);
        } else {
            handleAction("RitualOfAsh", agentKey, nonAgentKey);
        }
        return;
    }

    // 5. Default Engine
    handleAction("BlackMayhem", agentKey, nonAgentKey);
}

export function adaptativeAI(context) {
    const {
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        isArrayActive,
        totalMana,
        hasManaForSpecial,
        handleAction,
    } = context;

    const simNormal = simulators.simulateAttack({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        isArrayActive,
    });
    const simSpecial = simulators.simulateSpecialAttack({
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
    });
    const simCurse = isArrayActive
        ? simulators.simulateCurse({ agent, agentKey, nonAgent, nonAgentKey })
        : null;

    if (
        hasManaForSpecial &&
        simSpecial[nonAgentKey].currHp <= 0 &&
        simSpecial[agentKey].currHp > 0
    ) {
        handleAction("SpecialAttack", agentKey, nonAgentKey);
        return;
    }

    if (simNormal[nonAgentKey].currHp <= 0 && simNormal[agentKey].currHp > 0) {
        handleAction("Attack", agentKey, nonAgentKey);
        return;
    }

    if (
        isArrayActive &&
        simCurse[nonAgentKey].poison >= simCurse[nonAgentKey].currHp &&
        simCurse[agentKey].poison < simCurse[agentKey].currHp
    ) {
        handleAction("Curse", agentKey, nonAgentKey);
        return;
    }

    if (
        !isArrayActive &&
        nonAgent.currMana + nonAgent.manaOverflow >= constants.SP_ATTACK_COST
    ) {
        const simEnemySpecial = simulators.simulateSpecialAttack({
            agent: nonAgent,
            agentKey: nonAgentKey,
            nonAgent: agent,
            nonAgentKey: agentKey,
        });
        if (simEnemySpecial[agentKey].currHp <= 0) {
            handleAction("Array", agentKey, nonAgentKey);
            return;
        }
    }

    if (
        agent.manaOverflow > 0 &&
        agent.currHp - agent.manaOverflow <= agent.maxHp * 0.3
    ) {
        if (hasManaForSpecial)
            handleAction("SpecialAttack", agentKey, nonAgentKey);
        else handleAction("Heal", agentKey, nonAgentKey);
        return;
    }

    if (agent.currHp <= agent.maxHp * 0.3 && totalMana >= 3) {
        handleAction("Heal", agentKey, nonAgentKey);
        return;
    }

    if (isArrayActive) {
        handleAction("Aegis", agentKey, nonAgentKey);
        return;
    }

    const normalDmg = nonAgent.currHp - simNormal[nonAgentKey].currHp;
    const specialDmg = nonAgent.currHp - simSpecial[nonAgentKey].currHp;

    if (hasManaForSpecial && specialDmg > normalDmg) {
        handleAction("SpecialAttack", agentKey, nonAgentKey);
    } else if (!hasManaForSpecial && agent.radiance < agent.maxHp * 0.3) {
        handleAction("Aegis", agentKey, nonAgentKey);
    } else {
        if (simNormal[agentKey].currHp <= 0) {
            handleAction("Guard", agentKey, nonAgentKey);
        } else {
            handleAction("Attack", agentKey, nonAgentKey);
        }
    }
}
