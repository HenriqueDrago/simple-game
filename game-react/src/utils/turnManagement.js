import { constants } from "./constants.js";
import { consumeResources, restoreResources } from "./entities.js";
import { turnStatus, entityKeys, elementalKeys } from "./enums.js";

/*
Notes for self:
Effect activation order on turn start:
    1. Shackled Mana Distribution (if Array unactive)
    2. Shackled Mana Passive Increase (if Array active)
    3. Unrelenting Shadows resource restoration
    4. Shadowflame Resource Burn (if not in Dark Embrace and not in Dimming Darkness)
    5. Lingering Ember Passive Conversion
    6. Poison Damage (if not in Dimming Darkness)
    7. Mana Bleed (if not in Dimming Darkness)
    8. Fading Light
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

    const currElement = prev.elementalWheel;

    let draftTarget = {
        ...prev.entities[targetKey],
    };

    let draftNonTarget = {
        ...prev.entities[nonTargetKey],
    };

    const hasShackledMana =
        draftTarget.resources.shackledMana > 0 ||
        draftNonTarget.resources.shackledMana > 0;

    if (hasShackledMana) {
        if (isArrayActive) {
            const newTargetShackledMana =
                draftTarget.resources.shackledMana +
                constants.MANA_SHACKLE_TURN_GAIN;
            draftTarget = {
                ...draftTarget,
                resources: {
                    ...draftTarget.resources,
                    shackledMana: newTargetShackledMana,
                },
            };
        } else {
            let targetNewMana = draftTarget.currMana;
            let nonTargetNewMana = draftNonTarget.currMana;

            const totalShackledMana =
                draftTarget.resources.shackledMana +
                draftNonTarget.resources.shackledMana;
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
            const targetManaOverflow =
                draftTarget.resources.manaOverflow + targetExcess;

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
                draftNonTarget.resources.manaOverflow + nonTargetExcess;

            // Atribuindo os novos stats
            draftTarget = {
                ...draftTarget,
                currMana: targetNewMana,
                resources: {
                    ...draftTarget.resources,
                    shackledMana: 0,
                    manaOverflow: targetManaOverflow,
                },
            };

            draftNonTarget = {
                ...draftNonTarget,
                currMana: nonTargetNewMana,
                resources: {
                    ...draftNonTarget.resources,
                    shackledMana: 0,
                    manaOverflow: nonTargetManaOverflow,
                },
            };
        }
    }

    // Unrelenting Shadows
    if (draftTarget.resources.unrelentingShadows > 0) {
        draftTarget = restoreResources(
            draftTarget,
            draftTarget.resources.unrelentingShadows,
        );

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                unrelentingShadows: 0,
            }
        }
    }

    // Shadowflame
    if (
        draftTarget.resources.shadowflame > 0 &&
        !draftTarget.states.darkEmbrace
    ) {
        const { draftEntity, resourcesConsumed } = consumeResources(
            draftTarget,
            draftTarget.resources.shadowflame,
            "shadowflame",
        );

        draftTarget = {
            ...draftEntity,
        };

        const newUnrelShadows =
            (resourcesConsumed.radiance || 0) +
            draftTarget.resources.unrelentingShadows;

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                unrelentingShadows: newUnrelShadows,
            },
        };
    }

    // Lingering Embers
    if (draftTarget.resources.lingeringEmber > 0) {
        const halvedLE = Math.ceil(draftTarget.resources.lingeringEmber / 2);

        const newLE = draftTarget.resources.lingeringEmber - halvedLE;
        const newCinders = draftTarget.resources.cinders + halvedLE;
        const newSF = draftTarget.resources.shadowflame + halvedLE;

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                lingeringEmber: newLE,
                cinders: newCinders,
                shadowflame: newSF,
            },
        };
    }

    // Poison
    if (
        draftTarget.resources.poison > 0 &&
        !draftTarget.states.dimmingDarkness &&
        currElement !== elementalKeys.FROST
    ) {
        const newHp = Math.max(
            0,
            draftTarget.currHp - draftTarget.resources.poison,
        );
        draftTarget = {
            ...draftTarget,
            currHp: newHp,
        };
    }

    // Blood Sacrifice
    if (
        draftTarget.resources.bloodSacrifice > 0 &&
        currElement !== elementalKeys.FROST
    ) {
        const manaBleed = Math.min(
            draftTarget.currMana,
            Math.ceil(
                draftTarget.resources.bloodSacrifice *
                    constants.MANA_BLEED_MULT,
            ),
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

    // Fading Light
    if (
        draftTarget.resources.fadingLight > 0 &&
        currElement !== elementalKeys.FROST
    ) {
        const newFadingLight = Math.floor(
            draftTarget.resources.fadingLight / 2,
        );
        const newHp = Math.min(
            draftTarget.maxHp,
            draftTarget.currHp +
                (draftTarget.resources.fadingLight - newFadingLight),
        );

        draftTarget = {
            ...draftTarget,
            currHp: newHp,
            resources: {
                ...draftTarget.resources,
                fadingLight: newFadingLight,
            },
        };
    }

    // Nature
    if (prev.elementalWheel === elementalKeys.NATURE) {
        const dntHp = Math.min(draftNonTarget.maxHp, draftNonTarget.currHp + constants.NATURE_HP_REGEN);
        const dntMissingMana = draftNonTarget.maxMana - draftNonTarget.currMana;

        const dntNewMana = Math.min(
            draftNonTarget.maxMana,
            draftNonTarget.currMana + constants.NATURE_MANA_REGEN,
        );
        const dntNewManaOverflow = Math.max(
            draftNonTarget.resources.manaOverflow,
            draftNonTarget.resources.manaOverflow +
                (constants.NATURE_MANA_REGEN - dntMissingMana),
        );

        draftNonTarget = {
            ...draftNonTarget,
            currHp: dntHp,
            currMana: dntNewMana,
            resources: {
                ...draftNonTarget.resources,
                manaOverflow: dntNewManaOverflow,
            },
        };

        const dtHp = Math.min(draftTarget.maxHp, draftTarget.currHp + constants.NATURE_HP_REGEN);
        const dtMissingMana = draftTarget.maxMana - draftTarget.currMana;

        const dtNewMana = Math.min(
            draftTarget.maxMana,
            draftTarget.currMana + constants.NATURE_MANA_REGEN,
        );
        const dtNewManaOverflow = Math.max(
            draftTarget.resources.manaOverflow,
            draftTarget.resources.manaOverflow +
                (constants.NATURE_MANA_REGEN - dtMissingMana),
        );

        draftTarget = {
            ...draftTarget,
            currHp: dtHp,
            currMana: dtNewMana,
            resources: {
                ...draftTarget.resources,
                manaOverflow: dtNewManaOverflow,
            },
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
                resources: {
                    ...draftTarget.resources,
                },
                states: draftTargetStates,
            },
            [nonTargetKey]: {
                ...draftNonTarget,
            },
        },
    };
}

export function commitTurn(prev, context, nextActorKey, currActorKey, action) {
    console.log(context);

    const draftEntities = action === "Wheel" ? context.draftEntities : context;
    const newElement =
        action === "Wheel" ? context.newElement : prev.elementalWheel;

    const currActor = draftEntities[currActorKey];
    const nextActor = draftEntities[nextActorKey];

    // Mana Shackle
    const shackledMana = currActor.states.thornedShackles
        ? currActor.resources.shackledMana +
          currActor.currMana +
          currActor.resources.manaOverflow
        : 0;

    const currMana = currActor.states.thornedShackles ? 0 : currActor.currMana;
    let currManaOverflow = currActor.states.thornedShackles
        ? 0
        : currActor.resources.manaOverflow;

    // Mana Overflow
    let newHp =
        currActor.states.dimmingDarkness || newElement === elementalKeys.FROST
            ? currActor.currHp
            : Math.max(0, currActor.currHp - currManaOverflow);

    currManaOverflow =
        currActor.states.dimmingDarkness || newElement === elementalKeys.FROST
            ? currActor.resources.manaOverflow
            : 0;

    // Scorch
    newHp =
        newElement === elementalKeys.SCORCH
            ? Math.max(0, newHp - constants.SCORCH_DMG)
            : newHp;

    let nextActorHp =
        newElement === elementalKeys.SCORCH
            ? Math.max(0, nextActor.currHp - constants.SCORCH_DMG)
            : nextActor.currHp;

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
        (newHp <= 0 && currActorKey === entityKeys.PLAYER_TWO) ||
        (nextActorHp <= 0 && nextActorKey === entityKeys.PLAYER_TWO);
    const playerDead =
        draftEntities[entityKeys.PLAYER_ONE].currHp <= 0 ||
        (newHp <= 0 && currActorKey === entityKeys.PLAYER_ONE) ||
        (nextActorHp <= 0 && nextActorKey === entityKeys.PLAYER_ONE);

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
        elementalWheel: newElement,
        entities: {
            ...draftEntities,
            [currActorKey]: {
                ...draftEntities[currActorKey],
                currHp: newHp,
                currMana: currMana,
                resources: {
                    ...draftEntities[currActorKey].resources,
                    shackledMana: shackledMana,
                    manaOverflow: currManaOverflow,
                },
                states: {
                    ...draftEntities[currActorKey].states,
                    thornedShackles: thornedShackles,
                },
            },
            [nextActorKey]: {
                ...draftEntities[nextActorKey],
                currHp: nextActorHp,
                states: {
                    ...draftEntities[nextActorKey].states,
                    thornedShackles: thornedShackles,
                },
            },
        },
    };
}
