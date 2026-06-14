import { constants, actionsClass } from "./constants.js";
import { consumeResources, restoreResources } from "./entities.js";
import {
    turnStatus,
    entityKeys,
    elementalKeys,
    actionKeys,
    effectKeys,
} from "./enums.js";

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

    if (
        draftTarget.states.thornedShackles ||
        draftNonTarget.states.thornedShackles
    ) {
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
            },
        };
    }

    // Shadowflame
    if (
        draftTarget.resources.shadowflame > 0 &&
        !draftTarget.states.darkEmbrace
    ) {
        console.log(draftTarget.resources.shadowflame);
        const { draftEntity, resourcesConsumed } = consumeResources(
            draftTarget,
            draftTarget.resources.shadowflame,
            effectKeys.SHADOWFLAME,
        );

        draftTarget = {
            ...draftEntity,
        };

        const newShadowflame =
            draftTarget.resources.shadowflame +
            resourcesConsumed.totalConsumption;

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                shadowflame: newShadowflame,
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

    // Nature
    if (prev.elementalWheel === elementalKeys.NATURE) {
        const dtHp = Math.min(
            draftTarget.maxHp,
            draftTarget.currHp + constants.NATURE_HP_REGEN,
        );
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

    // Halo
    if (draftTarget.resources.halo > 0) {
        const newDivinity =
            draftTarget.resources.halo + draftTarget.resources.divinity;

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                halo: 0,
                divinity: newDivinity,
            },
        };
    }

    // Deployment
    if (draftTarget.states.deployment) {
        draftTarget = {
            ...draftTarget,
            states: {
                ...draftTarget.states,
                deployment: false,
                weaponsDeployed: true,
            },
        };
    }

    // Venting
    if (draftTarget.states.venting) {
        const newOverheat = Math.max(
            0,
            draftTarget.currOverheat - constants.VENTING_OVERHEAT_LOSS,
        );
        draftTarget = {
            ...draftTarget,
            currOverheat: newOverheat,
            states: {
                ...draftTarget.states,
                venting: newOverheat > 0,
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

export function commitTurn(newGame, currActorKey, nextActorKey, action) {
    let draftCurrActor = newGame.entities[currActorKey];
    let draftNextActor = newGame.entities[nextActorKey];

    if (action !== actionKeys.LASER) {
        // Shackled Mana
        if (draftCurrActor.states.thornedShackles) {
            const shackledMana =
                draftCurrActor.resources.shackledMana +
                draftCurrActor.currMana +
                draftCurrActor.resources.manaOverflow;

            draftCurrActor = {
                ...draftCurrActor,
                currMana: 0,
                resources: {
                    ...draftCurrActor.resources,
                    shackledMana: shackledMana,
                    manaOverflow: 0,
                },
            };
        }

        // Mana Overflow
        if (
            draftCurrActor.resources.manaOverflow > 0 &&
            !draftCurrActor.states.dimmingDarkness &&
            newGame.elementalWheel !== elementalKeys.FROST
        ) {
            const newHp = Math.max(
                0,
                draftCurrActor.currHp - draftCurrActor.resources.manaOverflow,
            );

            draftCurrActor = {
                ...draftCurrActor,
                currHp: newHp,
                resources: {
                    ...draftCurrActor.resources,
                    manaOverflow: 0,
                },
            };
        }

        // Scorch
        if (newGame.elementalWheel === elementalKeys.SCORCH) {
            const newHp = Math.max(
                0,
                draftCurrActor.currHp - constants.SCORCH_DMG,
            );

            draftCurrActor = {
                ...draftCurrActor,
                currHp: newHp,
            };
        }

        // Laser used
        draftCurrActor = {
            ...draftCurrActor,
            lasersUsedThisTurn: 0,
        };
    }

    // Sonority
    if (draftCurrActor.states.resonant) {
        const newSonority = actionsClass.offensiveActions.includes(action)
            ? Math.max(
                  constants.SONORITY_LOWER_LIMIT,
                  draftCurrActor.sonority - 1,
              )
            : actionsClass.defensiveActions.includes(action)
              ? Math.min(
                    constants.SONORITY_HIGHER_LIMIT,
                    draftCurrActor.sonority + 1,
                )
              : draftCurrActor.sonority;

        draftCurrActor = {
            ...draftCurrActor,
            sonority: newSonority,
        };
    }

    // Array
    const currArray =
        action === actionKeys.ARRAY
            ? constants.ARRAY_DURATION
            : action === actionKeys.CURSE
              ? 0
              : Math.max(0, newGame.remainingArray - 1);

    // Thorned Shackles
    draftCurrActor = {
        ...draftCurrActor,
        states: {
            ...draftCurrActor.states,
            thornedShackles: currArray > 0,
        },
    };

    // Check for deaths after end of turn effects have been applied
    const finalPlayerOneHp =
        currActorKey === entityKeys.PLAYER_ONE
            ? draftCurrActor.currHp
            : draftNextActor.currHp;
    const finalPlayerTwoHp =
        currActorKey === entityKeys.PLAYER_TWO
            ? draftCurrActor.currHp
            : draftNextActor.currHp;

    const playerDead = finalPlayerOneHp <= 0;
    const enemyDead = finalPlayerTwoHp <= 0;

    let nextStatus =
        nextActorKey === entityKeys.PLAYER_ONE
            ? turnStatus.UPKEEP_PLAYER_ONE
            : turnStatus.UPKEEP_PLAYER_TWO;

    if (action === actionKeys.LASER) {
        nextStatus =
            currActorKey === entityKeys.PLAYER_ONE
                ? turnStatus.PLAYER_ONE_TURN
                : turnStatus.PLAYER_TWO_TURN;
    }

    if (playerDead) {
        if (enemyDead) {
            nextStatus = turnStatus.DRAW;
        } else {
            nextStatus = turnStatus.DEFEAT;
        }
    } else if (enemyDead) {
        nextStatus = turnStatus.VICTORY;
    }

    const newStatus =
        action === actionKeys.LASER
            ? turnStatus.SHORT_TRANSITION
            : turnStatus.TRANSITION;

    return {
        ...newGame,
        status: newStatus,
        nextStatus: nextStatus,
        remainingArray: currArray,
        entities: {
            ...newGame.entities,
            [currActorKey]: {
                ...draftCurrActor,
            },
            [nextActorKey]: {
                ...draftNextActor,
            },
        },
    };
}
