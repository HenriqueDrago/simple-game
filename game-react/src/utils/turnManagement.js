import { constants } from "./constants.js";
import { consumeResources, restoreResources } from "./entities.js";
import { turnStatus, entityKeys } from "./enums.js";

/*
Notes for self:
Effect activation order on turn start:
    1. Shackled Mana Distribution (if Array unactive)
    2. Shackled Mana Passive Increase (if Array active)
    2. Unrelenting Shadows resource restoration
    2. Shadowflame Resource Burn (if not in Dark Embrace and not in Dimming Darkness)
    3. Lingering Ember Passive Conversion
    2. Poison Damage (if not in Dimming Darkness)
    3. Mana Bleed (if not in Dimming Darkness)
Effect activation order on turn end:
    1. Shackle Mana conversion
    2. Mana Overflow Damage (if not in Dimming Darkness)
*/

export function processUpkeep(prev) {
    const targetKey =
        prev.status === turnStatus.UPKEEP_PLAYER_ONE
            ? entityKeys.PLAYER_ONE
            : entityKeys.PLAYER_TWO;
    const nonTargetKey =
        prev.status === turnStatus.UPKEEP_PLAYER_ONE
            ? entityKeys.PLAYER_TWO
            : entityKeys.PLAYER_ONE;

    const isArrayActive = prev.remainingArray > 0;

    let draftTarget = {
        ...prev.entities[targetKey],
    };

    let draftNonTarget = {
        ...prev.entities[nonTargetKey],
    };

    const hasShackledMana =
        draftTarget.shackledMana > 0 || draftNonTarget.shackledMana > 0;

    if (hasShackledMana) {
        if (isArrayActive) {
            const newTargetShackledMana =
                draftTarget.shackledMana + constants.MANA_SHACKLE_TURN_GAIN;
            draftTarget = {
                ...draftTarget,
                shackledMana: newTargetShackledMana,
            };
        } else {
            let targetNewMana = draftTarget.currMana;
            let nonTargetNewMana = draftNonTarget.currMana;

            const totalShackledMana =
                draftTarget.shackledMana + draftNonTarget.shackledMana;
            const manaShare = Math.floor(totalShackledMana / 2);

            // Target
            const targetExcess = Math.max(
                0,
                targetNewMana + manaShare - draftTarget.maxMana,
            );
            targetNewMana = Math.min(
                draftTarget.maxMana,
                targetNewMana + manaShare,
            );
            const targetManaOverflow = draftTarget.manaOverflow + targetExcess;

            // nonTarget
            const nonTargetExcess = Math.max(
                0,
                nonTargetNewMana + manaShare - draftNonTarget.maxMana,
            );
            nonTargetNewMana = Math.min(
                draftNonTarget.maxMana,
                nonTargetNewMana + manaShare,
            );
            const nonTargetManaOverflow =
                draftNonTarget.manaOverflow + nonTargetExcess;

            // Atribuindo os novos stats
            draftTarget = {
                ...draftTarget,
                currMana: targetNewMana,
                shackledMana: 0,
                manaOverflow: targetManaOverflow,
            };

            draftNonTarget = {
                ...draftNonTarget,
                currMana: nonTargetNewMana,
                shackledMana: 0,
                manaOverflow: nonTargetManaOverflow,
            };
        }
    }

    // Unrelenting Shadows
    if (draftTarget.unrelentingShadows > 0) {
        draftTarget = restoreResources(
            draftTarget,
            draftTarget.unrelentingShadows,
        );
    }

    // Shadowflame
    if (draftTarget.shadowflame > 0 && !draftTarget.states.darkEmbrace) {
        draftTarget = consumeResources(
            draftTarget,
            draftTarget.shadowflame,
            "shadowflame",
        );
    }

    // Lingering Embers
    if (draftTarget.lingeringEmber > 0) {
        const halvedLE = Math.ceil(draftTarget.lingeringEmber / 2);

        const newLE = draftTarget.lingeringEmber - halvedLE;
        const newCinders = draftTarget.cinders + halvedLE;
        const newSF = draftTarget.shadowflame + halvedLE;

        draftTarget = {
            ...draftTarget,
            lingeringEmber: newLE,
            cinders: newCinders,
            shadowflame: newSF,
        };
    }

    // Poison
    if (draftTarget.poison > 0 && !draftTarget.states.dimmingDarkness) {
        const newHp = Math.max(0, draftTarget.currHp - draftTarget.poison);
        draftTarget = {
            ...draftTarget,
            currHp: newHp,
        };
    }

    // Blood Sacrifice
    if (draftTarget.bloodSacrifice > 0) {
        const manaBleed = Math.min(
            draftTarget.currMana,
            Math.ceil(draftTarget.bloodSacrifice * constants.MANA_BLEED_MULT),
        );
        const targetNewCurrMana = Math.max(0, draftTarget.currMana - manaBleed); // Perde mana
        const newHp = Math.min(
            draftTarget.maxHp,
            draftTarget.currHp + manaBleed,
        ); // Recupera Hp

        draftTarget = {
            ...draftTarget,
            currMana: targetNewCurrMana,
            currHp: newHp,
        };
    }

    // Calcula o próximo turno e verifica as mortes
    const enemyDead =
        prev.entities[entityKeys.PLAYER_TWO].currHp <= 0 ||
        (draftTarget.currHp <= 0 && targetKey === entityKeys.PLAYER_TWO);
    const playerDead =
        prev.entities[entityKeys.PLAYER_ONE].currHp <= 0 ||
        (draftTarget.currHp <= 0 && targetKey === entityKeys.PLAYER_ONE);

    let nextStatus =
        targetKey === entityKeys.PLAYER_ONE
            ? turnStatus.PLAYER_ONE_TURN
            : turnStatus.PLAYER_TWO_TURN;

    if (playerDead) {
        if (enemyDead) {
            nextStatus = turnStatus.DRAW;
        } else {
            nextStatus = turnStatus.DEFEAT;
        }
    } else if (enemyDead) {
        nextStatus = turnStatus.VICTORY;
    }

    const draftTargetStates = {
        ...draftTarget.states,
        guarding: false,
        sacrificial: false,
        radiant: false,
        darkEmbrace: false,
        dimmingDarkness: false,
    };

    return {
        ...prev,
        status: nextStatus,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...draftTarget,
                unrelentingShadows: 0,
                states: draftTargetStates,
            },
            [nonTargetKey]: {
                ...draftNonTarget,
            },
        },
    };
}

export function commitTurn(
    prev,
    draftEntities,
    nextActorKey,
    currActorKey,
    action,
) {
    console.log(draftEntities)
    // End of turn math
    const currActor = draftEntities[currActorKey];
    // const nextActor = draftEntities[nextActorKey];

    // Mana Shackle
    const shackledMana = currActor.states.thornedShackles
        ? currActor.shackledMana + currActor.currMana + currActor.manaOverflow
        : 0;

    const currMana = currActor.states.thornedShackles ? 0 : currActor.currMana;
    let currManaOverflow = currActor.states.thornedShackles
        ? 0
        : currActor.manaOverflow;

    // Mana Overflow
    const newHp = currActor.states.dimmingDarkness
        ? currActor.currHp
        : Math.max(0, currActor.currHp - currManaOverflow);
    currManaOverflow = currActor.dimmingDarkness ? currActor.manaOverflow : 0;

    // Array
    const currArray =
        action === "Array"
            ? constants.ARRAY_DURATION - 1
            : action === "Curse"
              ? 0
              : Math.max(0, prev.remainingArray - 1);

    // Thorned Shackles
    const thornedShackles = currArray > 0;

    // Check for deaths after end of turn effects have been applied
    const enemyDead =
        draftEntities[entityKeys.PLAYER_TWO].currHp <= 0 ||
        (newHp === 0 && currActorKey === entityKeys.PLAYER_TWO);
    const playerDead =
        draftEntities[entityKeys.PLAYER_ONE].currHp <= 0 ||
        (newHp === 0 && currActorKey === entityKeys.PLAYER_ONE);

    let nextStatus =
        nextActorKey === entityKeys.PLAYER_ONE
            ? turnStatus.UPKEEP_PLAYER_ONE
            : turnStatus.UPKEEP_PLAYER_TWO;

    if (playerDead) {
        if (enemyDead) {
            nextStatus = turnStatus.DRAW;
        } else {
            nextStatus = turnStatus.DEFEAT;
        }
    } else if (enemyDead) {
        nextStatus = turnStatus.VICTORY;
    }

    return {
        ...prev,
        status: turnStatus.TRANSITION,
        nextStatus: nextStatus,
        remainingArray: currArray,
        entities: {
            ...draftEntities,
            [currActorKey]: {
                ...draftEntities[currActorKey],
                currHp: newHp,
                shackledMana: shackledMana,
                currMana: currMana,
                manaOverflow: currManaOverflow,
                states: {
                    ...draftEntities[currActorKey].states,
                    thornedShackles: thornedShackles,
                },
            },
            [nextActorKey]: {
                ...draftEntities[nextActorKey],
                states: {
                    ...draftEntities[nextActorKey].states,
                    thornedShackles: thornedShackles,
                },
            },
        },
    };
}
