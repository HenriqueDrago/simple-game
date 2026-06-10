import { constants } from "./constants";
import { simulators } from "./simulators";

export function simpleAI(context) {
    const {
        target,
        targetKey,
        nonTargetKey,
        totalMana,
        hasManaForSpecial,
        arrayActive,
        actions,
    } = context;

    // 1. Emergency Survival: Heal if we have at least 3 mana, otherwise Guard
    if (target.currHp <= target.maxHp * 0.5) {
        if (totalMana >= 3) {
            actions.handleHeal(targetKey, nonTargetKey);
        } else {
            actions.handleGuard(targetKey, nonTargetKey);
        }
        return;
    }

    // 2. Dump the Nuke: If we hit 6 mana, fire it immediately
    if (hasManaForSpecial) {
        actions.handleSpecialAttack(targetKey, nonTargetKey);
        return;
    }

    // 3. Basic Thorns Avoidance: Don't punch a spiked wall
    if (arrayActive) {
        actions.handleGuard(targetKey, nonTargetKey);
        return;
    }

    // 4. Default: Standard Punch
    actions.handleAttack(targetKey, nonTargetKey);
}

export function bloodknightAI(context) {
    const {
        target,
        targetKey,
        nonTargetKey,
        arrayActive,
        totalMana,
        hasManaForSpecial,
        actions,
    } = context;

    const missingHp = target.maxHp - target.currHp;

    // 1. The Array Pivot & Thorns Avoidance
    if (arrayActive) {
        if (target.currHp <= target.maxHp * 0.5 && totalMana >= 3) {
            actions.handleHeal(targetKey, nonTargetKey);
        } else {
            actions.handleGuard(targetKey, nonTargetKey);
        }
        return;
    }

    // 2. Dump the Hot Potato (Overflow) & Emergency Heal
    if (target.manaOverflow > 0 || target.currHp <= target.maxHp * 0.5) {
        // Only use SpAtk if we MUST dump overflow, AND Heal wouldn't burn enough mana to save us
        if (
            target.manaOverflow > 0 &&
            hasManaForSpecial &&
            missingHp < constants.SP_ATTACK_COST
        ) {
            actions.handleSpecialAttack(targetKey, nonTargetKey);
            return;
        } else if (totalMana >= 3) {
            actions.handleHeal(targetKey, nonTargetKey);
            return;
        }
    }

    // 3. The Sacrifice Engine
    if (
        target.currHp > target.maxHp * 0.65 &&
        target.bloodSacrifice + target.attributes.str.value < target.maxHp * 1.4
    ) {
        actions.handleSacrifice(targetKey, nonTargetKey);
        return;
    }

    // 4. Bleeding out without fuel? Guard to ensure Mana Bleed can heal you next turn.
    if (
        target.bloodSacrifice > 0 &&
        target.currMana < missingHp &&
        missingHp >= target.maxHp * 0.3
    ) {
        actions.handleGuard(targetKey, nonTargetKey);
        return;
    }

    // 5. Default: Unleash the buffed Attack
    actions.handleAttack(targetKey, nonTargetKey);
}

export function paladinAI(context) {
    const {
        target,
        nonTarget,
        targetKey,
        nonTargetKey,
        arrayActive,
        totalMana,
        hasManaForSpecial,
        actions,
        
    } = context;

    const simNormal = simulators.simulateAttack(
        target,
        targetKey,
        nonTarget,
        nonTargetKey,
        arrayActive,
    );
    const simSpecial = simulators.simulateSpecialAttack(
        target,
        targetKey,
        nonTarget,
        nonTargetKey,
    );

    if (
        hasManaForSpecial &&
        simSpecial[nonTargetKey].currHp <= 0 &&
        simSpecial[targetKey].currHp > 0
    ) {
        actions.handleSpecialAttack(targetKey, nonTargetKey);
        return;
    }

    if (
        simNormal[nonTargetKey].currHp <= 0 &&
        simNormal[targetKey].currHp > 0
    ) {
        actions.handleAttack(targetKey, nonTargetKey);
        return;
    }

    const effectiveHp = target.currHp + target.radiance;
    const lethalThreat = target.poison + target.manaOverflow;

    if (effectiveHp - lethalThreat <= target.maxHp * 0.5 && totalMana >= 3) {
        actions.handleHeal(targetKey, nonTargetKey);
        return;
    }

    actions.handleAegis(targetKey, nonTargetKey);
}

export function hexerAI(context) {
    const {
        target,
        nonTarget,
        targetKey,
        nonTargetKey,
        arrayActive,
        hasManaForSpecial,
        actions,
        
    } = context;

    const simSpecial = simulators.simulateSpecialAttack(
        target,
        targetKey,
        nonTarget,
        nonTargetKey,
    );
    const simCurse = arrayActive
        ? simulators.simulateCurse(target, targetKey, nonTarget, nonTargetKey)
        : null;

    if (arrayActive) {
        // 1. If Curse applies enough poison to kill the opponent next turn, detonate!
        if (simCurse[nonTargetKey].poison >= simCurse[nonTargetKey].currHp) {
            actions.handleCurse(targetKey, nonTargetKey);
            return;
        }

        // 2. Otherwise, Guard to generate mana which feeds the Thorned Shackles at turn end
        actions.handleGuard(targetKey, nonTargetKey);
        return;
    } else {
        // --- NOT IN ARRAY EXCEPTIONS ---

        // Exception 1: SpAtk is guaranteed lethal
        if (hasManaForSpecial && simSpecial[nonTargetKey].currHp <= 0) {
            actions.handleSpecialAttack(targetKey, nonTargetKey);
            return;
        }

        // Exception 2: Poison is going to kill us during Upkeep
        if (target.poison >= target.currHp) {
            actions.handleHeal(targetKey, nonTargetKey);
            return;
        }

        if(target.overheat < constants.MAX_OVERHEAT - 1 && target.currMana > 0) {
            actions.handleLaser(targetKey, nonTargetKey);
            return;
        }

        // Exception 3: Opponent has considerably less mana, nuke them to force mana onto their sheet
        const manaDiff = target.currMana - nonTarget.currMana;
        if (hasManaForSpecial && manaDiff >= 4) {
            actions.handleSpecialAttack(targetKey, nonTargetKey);
            return;
        }

        // Default: Trap them in the Array
        actions.handleArray(targetKey, nonTargetKey);
    }
}

export function warlockAI(context) {
    const {
        target,
        nonTarget,
        targetKey,
        nonTargetKey,
        arrayActive,
        totalMana,
        hasManaForSpecial,
        actions,
        
    } = context;

    const simSpecial = simulators.simulateSpecialAttack(
        target,
        targetKey,
        nonTarget,
        nonTargetKey,
    );
    const simCurse = arrayActive
        ? simulators.simulateCurse(target, targetKey, nonTarget, nonTargetKey)
        : null;

    // 1. Absolute Lethality (Always take the shot if it wins the game)
    if (hasManaForSpecial && simSpecial[nonTargetKey].currHp <= 0) {
        actions.handleSpecialAttack(targetKey, nonTargetKey);
        return;
    }

    // 2. Array Management (Fixing the Panic Curse)
    if (arrayActive) {
        // Detonate ONLY if it guarantees the enemy dies to poison
        if (simCurse[nonTargetKey].poison >= simCurse[nonTargetKey].currHp) {
            actions.handleCurse(targetKey, nonTargetKey);
            return;
        }
        // Otherwise, stall the array to survive Thorns and incoming damage
        actions.handleGuard(targetKey, nonTargetKey);
        return;
    }

    // 3. Overflow Management & Survival (Dynamic 50% Threshold)
    const lethalThreat = target.poison + target.manaOverflow;

    if (
        target.manaOverflow > 0 ||
        target.currHp - lethalThreat <= target.maxHp * 0.5
    ) {
        if (hasManaForSpecial) {
            // Priority 1: Dump the massive overflow onto the enemy as a weapon!
            actions.handleSpecialAttack(targetKey, nonTargetKey);
            return;
        } else if (totalMana >= 3 && target.currHp < target.maxHp) {
            // Priority 2: Cleanse poison / heal the damage buffer
            actions.handleHeal(targetKey, nonTargetKey);
            return;
        }
    }

    // 4. Default: The Warlock Engine
    if (hasManaForSpecial) {
        actions.handleSpecialAttack(targetKey, nonTargetKey);
    } else {
        actions.handleGuard(targetKey, nonTargetKey);
    }
}

export function shadowSorcererAI(context) {
    const {
        target,
        nonTarget,
        targetKey,
        nonTargetKey,
        arrayActive,
        actions,
        
        consumeResources,
    } = context;

    // 1. The Array/Curse Exception (When outside Umbral Core)
    // If trapped in an Array, check if detonating it guarantees a kill against an unprotected enemy
    if (arrayActive && !target.umbralCore) {
        if (!nonTarget.dimmingDarkness) {
            const lethalPoison =
                nonTarget.currMana +
                nonTarget.manaOverflow +
                nonTarget.shackledMana +
                nonTarget.poison;
            if (lethalPoison >= nonTarget.currHp) {
                actions.handleCurse(targetKey, nonTargetKey);
                return;
            }
        }
    }

    // 2. The Entry Priority
    if (!target.umbralCore) {
        actions.handleShadowPact(targetKey, nonTargetKey);
        return;
    }

    // --- UMBRAL CORE LOGIC ---

    if (target.manaOverflow > target.currHp) {
        actions.handleDarkPromise(targetKey, nonTargetKey);
        return;
    }

    // 3. The Dark Promise Bomb (Lethality & Survival Check)
    const simPromise = simulators.simulateDarkPromise(
        target,
        targetKey,
        nonTarget,
        nonTargetKey,
    );
    const postPromiseEnemy = simPromise[nonTargetKey];
    const postPromiseSelf = simPromise[targetKey];

    if (postPromiseEnemy.manaOverflow >= postPromiseEnemy.currHp) {
        // A. Check if the enemy can escape death by Healing
        // Heal converts overflow/mana into HP up to the missing amount
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

        // B. Check if the enemy can escape death by dumping mana into a Special Attack
        const overflowAfterSpAtk = Math.max(
            0,
            postPromiseEnemy.manaOverflow - constants.SP_ATTACK_COST,
        );
        const savedBySpAtk = overflowAfterSpAtk < postPromiseEnemy.currHp;

        // C. Check if the enemy is in umbral core
        const savedByShadows = postPromiseEnemy.umbralCore;

        if (!savedByHeal && !savedBySpAtk && !savedByShadows) {
            // C. Survival Check: Will we survive their desperate final attack?
            const simAtk = simulators.simulateAttack(
                postPromiseEnemy,
                nonTargetKey,
                postPromiseSelf,
                targetKey,
                arrayActive,
            );
            const simSpAtk = simulators.simulateSpecialAttack(
                postPromiseEnemy,
                nonTargetKey,
                postPromiseSelf,
                targetKey,
            );

            if (
                simAtk[targetKey].currHp > 0 &&
                simSpAtk[targetKey].currHp > 0
            ) {
                actions.handleDarkPromise(targetKey, nonTargetKey);
                return;
            }
        }
    }

    // 4. Burn Management (Ritual of Ash vs Shadow Mantle)
    const draftTarget = consumeResources(
        target,
        target.shadowflame,
        "shadowflame",
    );

    // If the simulated HP is lower, it means the resources ran out and the flame is eating health
    if (draftTarget.currHp < target.currHp) {
        // Defining "low HP" as 50% or less, and "considerable flame" as 10+
        if (target.currHp <= target.maxHp * 0.5 && target.shadowflame >= 10) {
            actions.handleShadowMantle(targetKey, nonTargetKey); // Pause burn, prep massive heal
        } else {
            actions.handleRitualOfAsh(targetKey, nonTargetKey); // Cash out into a shield
        }
        return;
    }

    // 5. Default Engine
    actions.handleBlackMayhem(targetKey, nonTargetKey);
}

export function adaptativeAI(context) {
    const {
        target,
        nonTarget,
        targetKey,
        nonTargetKey,
        arrayActive,
        totalMana,
        hasManaForSpecial,
        actions,
        
    } = context;

    const simNormal = simulators.simulateAttack(
        target,
        targetKey,
        nonTarget,
        nonTargetKey,
        arrayActive,
    );
    const simSpecial = simulators.simulateSpecialAttack(
        target,
        targetKey,
        nonTarget,
        nonTargetKey,
    );
    const simCurse = arrayActive
        ? simulators.simulateCurse(target, targetKey, nonTarget, nonTargetKey)
        : null;

    if (
        hasManaForSpecial &&
        simSpecial[nonTargetKey].currHp <= 0 &&
        simSpecial[targetKey].currHp > 0
    ) {
        actions.handleSpecialAttack(targetKey, nonTargetKey);
        return;
    }
    if (
        simNormal[nonTargetKey].currHp <= 0 &&
        simNormal[targetKey].currHp > 0
    ) {
        actions.handleAttack(targetKey, nonTargetKey);
        return;
    }
    if (
        arrayActive &&
        simCurse[nonTargetKey].poison >= simCurse[nonTargetKey].currHp &&
        simCurse[targetKey].poison < simCurse[targetKey].currHp
    ) {
        actions.handleCurse(targetKey, nonTargetKey);
        return;
    }

    if (
        !arrayActive &&
        nonTarget.currMana + nonTarget.manaOverflow >= constants.SP_ATTACK_COST
    ) {
        const simEnemySpecial = simulators.simulateSpecialAttack(
            nonTarget,
            nonTargetKey,
            target,
            targetKey,
        );
        if (simEnemySpecial[targetKey].currHp <= 0) {
            actions.handleArray(targetKey, nonTargetKey);
            return;
        }
    }

    if (
        target.manaOverflow > 0 &&
        target.currHp - target.manaOverflow <= target.maxHp * 0.3
    ) {
        if (hasManaForSpecial)
            actions.handleSpecialAttack(targetKey, nonTargetKey);
        else actions.handleHeal(targetKey, nonTargetKey);
        return;
    }

    if (target.currHp <= target.maxHp * 0.3 && totalMana >= 3) {
        actions.handleHeal(targetKey, nonTargetKey);
        return;
    }

    if (arrayActive) {
        actions.handleAegis(targetKey, nonTargetKey);
        return;
    }

    const normalDmg = nonTarget.currHp - simNormal[nonTargetKey].currHp;
    const specialDmg = nonTarget.currHp - simSpecial[nonTargetKey].currHp;

    if (hasManaForSpecial && specialDmg > normalDmg) {
        actions.handleSpecialAttack(targetKey, nonTargetKey);
    } else if (!hasManaForSpecial && target.radiance < target.maxHp * 0.3) {
        actions.handleAegis(targetKey, nonTargetKey);
    } else {
        if (simNormal[targetKey].currHp <= 0) {
            actions.handleGuard(targetKey, nonTargetKey);
        } else {
            actions.handleAttack(targetKey, nonTargetKey);
        }
    }
}
