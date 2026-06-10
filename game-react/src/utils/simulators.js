import { constants } from "./constants";
import { consumeResources } from "./entity";

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
}

function simulateGuard(target, targetKey, nonTarget, nonTargetKey) {
    const newMana = Math.min(
        target.maxMana,
        Math.floor(
            target.currMana + target.maxMana * constants.GUARD_MANA_REGEN,
        ),
    );

    const newOverheat = Math.max(
        0,
        target.overheat - constants.OVERHEAT_ACTION_COOLING,
    );

    const draftEntities = {
        [nonTargetKey]: {
            ...nonTarget,
        },
        [targetKey]: {
            ...target,
            currMana: newMana,
            overheat: newOverheat,
        },
    };

    return draftEntities;
}

function simulateAegis(target, targetKey, nonTarget, nonTargetKey) {
    const newRadiance =
        target.radiance + Math.ceil(target.attributes.def.value / 2);

    const draftEntities = {
        [nonTargetKey]: {
            ...nonTarget,
        },
        [targetKey]: {
            ...target,
            radiance: newRadiance,
        },
    };

    return draftEntities;
}

function simulateSacrifice(target, targetKey, nonTarget, nonTargetKey) {
    const oldHp = target.currHp;
    const dmgTaken = Math.ceil(oldHp / 2);

    const radianceConsumed = Math.min(dmgTaken, target.radiance);
    const newRadiance = target.radiance - radianceConsumed;

    const newHp = oldHp - dmgTaken + radianceConsumed;
    const newBloodSacrifice = Math.max(
        target.bloodSacrifice,
        oldHp - newHp + target.bloodSacrifice,
    );

    const newMaxMana = target.maxMana + Math.max(0, oldHp - newHp);

    const draftEntities = {
        [nonTargetKey]: {
            ...nonTarget,
        },
        [targetKey]: {
            ...target,
            maxMana: newMaxMana,
            currHp: newHp,
            bloodSacrifice: newBloodSacrifice,
            radiance: newRadiance,
        },
    };

    return draftEntities;
}

function simulateAttack(
    attacker,
    attackerKey,
    defender,
    defenderKey,
    arrayActive,
) {
    const base_damage =
        attacker.attributes.str.value +
        attacker.bloodSacrifice * constants.BLOOD_SACRIFICE_MULT;
    const dmgAfterDef =
        Math.max(
            0,
            base_damage -
                Math.floor(defender.attributes.def.value * defender.defEffect),
        ) + attacker.radiance;
    const final_damage = Math.max(
        1,
        Math.ceil(dmgAfterDef * (1 - defender.dmgReduction)),
    );

    const radianceConsumed = Math.min(final_damage, defender.radiance);
    const emberConsumed = Math.min(
        final_damage - radianceConsumed,
        defender.lingeringEmber,
    );
    const newHp = Math.max(
        0,
        defender.currHp - (final_damage - radianceConsumed - emberConsumed),
    );

    const newRadiance = defender.radiance - radianceConsumed;
    const newEmber = defender.lingeringEmber - emberConsumed;

    const thornsDmg = arrayActive ? attacker.attributes.str.value : 0;
    const attackerNewHP = Math.max(0, attacker.currHp - thornsDmg);

    const draftEntities = {
        [attackerKey]: {
            ...attacker,
            currHp: attackerNewHP,
            radiance: 0,
        },
        [defenderKey]: {
            ...defender,
            currHp: newHp,
            radiance: newRadiance,
            lingeringEmber: newEmber,
        },
    };

    return draftEntities;
}

function simulateSpecialAttack(attacker, attackerKey, defender, defenderKey) {
    const base_damage = attacker.attributes.str.value + attacker.radiance;
    const manaDiff = Math.max(0, attacker.currMana - defender.currMana);

    const canUseSpAtk =
        attacker.currMana + attacker.manaOverflow >= constants.SP_ATTACK_COST;

    const final_damage = canUseSpAtk
        ? 1 +
          Math.floor(
              Math.max(0, base_damage + manaDiff) * (1 - defender.dmgReduction), // Ignores def
          )
        : 0;

    const radianceConsumed = Math.min(final_damage, defender.radiance);
    const emberConsumed = Math.min(
        final_damage - radianceConsumed,
        defender.lingeringEmber,
    );
    const newHp = Math.max(
        0,
        defender.currHp - (final_damage - radianceConsumed - emberConsumed),
    );

    const newRadiance = defender.radiance - radianceConsumed;
    const newEmber = defender.lingeringEmber - emberConsumed;

    const defenderNewMana = Math.min(
        defender.maxMana,
        defender.currMana + manaDiff,
    );
    const defenderNewManaOverflow =
        defender.manaOverflow +
        Math.max(0, defender.currMana + manaDiff - defender.maxMana);

    const overflowConsumed = Math.min(
        constants.SP_ATTACK_COST,
        attacker.manaOverflow,
    );
    const manaConsumed = constants.SP_ATTACK_COST - overflowConsumed;

    const attackerNewManaOverflow = canUseSpAtk
        ? attacker.manaOverflow - overflowConsumed
        : attacker.manaOverflow;

    const attackerNewMana = canUseSpAtk
        ? attacker.currMana - manaConsumed
        : attacker.currMana;

    const draftEntities = {
        [attackerKey]: {
            ...attacker,
            currMana: attackerNewMana,
            manaOverflow: attackerNewManaOverflow,
            radiance: 0,
        },
        [defenderKey]: {
            ...defender,
            currHp: newHp,
            currMana: defenderNewMana,
            manaOverflow: defenderNewManaOverflow,
            radiance: newRadiance,
            lingeringEmber: newEmber,
        },
    };

    return draftEntities;
}

function simulateHeal(target, targetKey, nonTarget, nonTargetKey) {
    const base_heal = Math.min(
        target.maxHp - target.currHp,
        target.currMana + target.manaOverflow,
    );

    const newHp = Math.min(target.currHp + base_heal, target.maxHp);

    const overflowConsumed = Math.min(base_heal, target.manaOverflow);
    const manaConsumed = base_heal - overflowConsumed;

    const newManaOverflow = target.manaOverflow - overflowConsumed;
    const newMana = target.currMana - manaConsumed;

    let draftEntities = {
        [nonTargetKey]: {
            ...nonTarget,
        },
        [targetKey]: {
            ...target,
            currHp: newHp,
            currMana: newMana,
            manaOverflow: newManaOverflow,
            poison: 0,
        },
    };

    return draftEntities;
}

function simulateCurse(target, targetKey, nonTarget, nonTargetKey) {
    const targetNewPoison = target.shackledMana + target.poison;
    const nonTargetNewPoison = nonTarget.shackledMana + nonTarget.poison;

    let draftEntities = {
        [nonTargetKey]: {
            ...nonTarget,
            poison: nonTargetNewPoison,
            shackledMana: 0,
        },
        [targetKey]: {
            ...target,
            poison: targetNewPoison,
            shackledMana: 0,
        },
    };

    return draftEntities;
}

function simulateArray(target, targetKey, nonTarget, nonTargetKey) {
    const targetShackledMana =
        target.shackledMana + target.currMana + target.manaOverflow;
    const nonTargetShackledMana =
        nonTarget.shackledMana + nonTarget.currMana + nonTarget.manaOverflow;

    let draftEntities = {
        [nonTargetKey]: {
            ...nonTarget,
            currMana: 0,
            manaOverflow: 0,
            shackledMana: nonTargetShackledMana,
        },
        [targetKey]: {
            ...target,
            currMana: 0,
            manaOverflow: 0,
            shackledMana: targetShackledMana,
        },
    };

    return draftEntities;
}

function simulateShadowPact(target, targetKey, nonTarget, nonTargetKey) {
    let draftTarget = {
        ...target,
    };

    draftTarget = consumeResources(draftTarget, 5, "shadowPact");

    let draftEntities = {
        [nonTargetKey]: {
            ...nonTarget,
        },
        [targetKey]: {
            ...draftTarget,
            umbralCore: true,
        },
    };

    return draftEntities;
}

function simulateShadowMantle(target, targetKey, nonTarget, nonTargetKey) {
    const unrelentingShadows = target.shadowflame;
    let draftEntities = {
        [nonTargetKey]: {
            ...nonTarget,
        },
        [targetKey]: {
            ...target,
            darkEmbrace: true,
            unrelentingShadows: unrelentingShadows,
        },
    };

    return draftEntities;
}

function simulateRitualOfAsh(target, targetKey, nonTarget, nonTargetKey) {
    const newLE = target.shadowflame + target.lingeringEmber;
    let draftEntities = {
        [nonTargetKey]: {
            ...nonTarget,
        },
        [targetKey]: {
            ...target,
            shadowflame: 0,
            lingeringEmber: newLE,
        },
    };

    return draftEntities;
}

function simulateDarkPromise(target, targetKey, nonTarget, nonTargetKey) {
    let draftTarget = {
        ...target,
    };

    let draftNonTarget = {
        ...nonTarget,
    };

    const toBeRestored =
        target.shadowflame + Math.floor(target.lingeringEmber / 2);

    let draftEntities = {
        [nonTargetKey]: {
            ...draftNonTarget,
            unrelentingShadows: toBeRestored,
        },
        [targetKey]: {
            ...draftTarget,
            umbralCore: false,
            dimmingDarkness: true,
            shadowflame: 0,
            lingeringEmber: 0,
            cinders: 0,
            unrelentingShadows: toBeRestored,
        },
    };

    return draftEntities;
}

function simulateBlackMayhem(target, targetKey, nonTarget, nonTargetKey) {
    let draftTarget = {
        ...target,
    };

    let draftNonTarget = {
        ...nonTarget,
    };

    const cindersPreBurn = draftNonTarget.cinders;

    const result = consumeResources(
        draftNonTarget,
        target.shadowflame,
        "blackMayhem",
    );

    draftNonTarget = result.draftEntity;
    const burntResources = result.consumed;

    const burntCinders = cindersPreBurn - draftNonTarget.cinders;
    const burntNonCinders = burntResources - burntCinders;

    const newNonTargetCinders = draftNonTarget.cinders + burntNonCinders;
    const newTargetLE = draftTarget.lingeringEmber + burntCinders;

    let draftEntities = {
        [nonTargetKey]: {
            ...draftNonTarget,
            cinders: newNonTargetCinders,
        },
        [targetKey]: {
            ...draftTarget,
            lingeringEmber: newTargetLE,
        },
    };

    return draftEntities;
}

function simulateLaser(target, targetKey, nonTarget, nonTargetKey) {
    let draftTarget = {
        ...target,
    };

    let draftNonTarget = {
        ...nonTarget,
    };

    const hasEnoughMana = draftTarget.currMana > 0;

    const dmg = hasEnoughMana ? 1 : 0;
    const newOverheat = hasEnoughMana
        ? draftTarget.overheat + dmg
        : draftTarget.overheat;

    const opponentHp = hasEnoughMana
        ? Math.max(0, draftNonTarget.currHp - dmg)
        : draftNonTarget.currHp;
    const newMana =
        hasEnoughMana && target.manaOverflow <= 0
            ? draftTarget.currMana - 1
            : draftTarget.currMana;
    const newManaOverflow = Math.max(0, target.manaOverflow - 1);

    let draftEntities = {
        [nonTargetKey]: {
            ...draftNonTarget,
            currHp: opponentHp,
        },
        [targetKey]: {
            ...draftTarget,
            overheat: newOverheat,
            currMana: newMana,
            manaOverflow: newManaOverflow,
        },
    };

    return draftEntities;
}
