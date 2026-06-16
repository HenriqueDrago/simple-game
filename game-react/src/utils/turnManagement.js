import { constants, actionsClass } from "./constants.js";
import {
    consumeResources,
    gainMana,
    loseMana,
    restoreResources,
    takeDamage,
} from "./entities.js";
import {
    turnStatus,
    entityKeys,
    elementalKeys,
    actionKeys,
    effectKeys,
    directionKeys,
    dmgTypes,
} from "./enums.js";

function processEntityDeathStates(entity) {
    let draft = { ...entity };

    // Radiant death check
    if (draft.currHp <= 0 && draft.states.radiant) {
        draft = {
            ...draft,
            resources: {
                ...draft.resources,
                divinity: 0,
                fadingLight: draft.resources.divinity,
            },
            states: {
                ...draft.states,
                radiant: false,
                cutoffWings: true,
            },
        };
    }

    return draft;
}

function isEntityDead(entity) {
    return entity.currHp <= 0 && !entity.states.cutoffWings;
}

function evaluateMatchStatus(playerOne, playerTwo, defaultNextStatus) {
    const p1Dead = isEntityDead(playerOne);
    const p2Dead = isEntityDead(playerTwo);

    if (p1Dead) {
        return p2Dead ? turnStatus.DRAW : turnStatus.DEFEAT;
    } else if (p2Dead) {
        return turnStatus.VICTORY;
    }
    return defaultNextStatus;
}

export function processUpkeep(prev) {
    const targetKey =
        prev.status === turnStatus.UPKEEP_PLAYER_ONE
            ? entityKeys.PLAYER_ONE
            : entityKeys.PLAYER_TWO;
    const nonTargetKey =
        prev.status === turnStatus.UPKEEP_PLAYER_ONE
            ? entityKeys.PLAYER_TWO
            : entityKeys.PLAYER_ONE;

    let draftTarget = {
        ...prev.entities[targetKey],
    };

    let draftNonTarget = {
        ...prev.entities[nonTargetKey],
    };

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

    // Umbral Core
    if (
        draftTarget.states.umbralCore &&
        draftTarget.resources.lingeringEmber <= 0 &&
        draftTarget.resources.shadowflame <= 0
    ) {
        draftTarget = {
            ...draftTarget,
            states: {
                ...draftTarget.states,
                umbralCore: false,
            },
        };
    }

    // Poison
    if (
        draftTarget.resources.poison > 0 &&
        !draftTarget.states.dimmingDarkness
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
    if (draftTarget.resources.bloodSacrifice > 0) {
        const manaBleed = Math.min(
            draftTarget.currMana + draftTarget.resources.manaOverflow,
            Math.ceil(
                draftTarget.resources.bloodSacrifice *
                    constants.MANA_BLEED_MULT,
            ),
        );

        draftTarget = {
            ...loseMana(draftTarget, manaBleed),
        };

        const newHp = Math.min(
            draftTarget.maxHp + draftTarget.overgrowth,
            draftTarget.currHp + manaBleed,
        ); // Recupera Hp

        draftTarget = {
            ...draftTarget,
            currHp: newHp,
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

    // Death logic
    draftTarget = processEntityDeathStates(draftTarget);
    draftNonTarget = processEntityDeathStates(draftNonTarget);

    const playerOneEntity =
        targetKey === entityKeys.PLAYER_ONE ? draftTarget : draftNonTarget;
    const playerTwoEntity =
        targetKey === entityKeys.PLAYER_TWO ? draftTarget : draftNonTarget;

    let nextStatus =
        targetKey === entityKeys.PLAYER_ONE
            ? turnStatus.PLAYER_ONE_TURN
            : turnStatus.PLAYER_TWO_TURN;

    nextStatus = evaluateMatchStatus(
        playerOneEntity,
        playerTwoEntity,
        nextStatus,
    );

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
        lastPlayerTurn: targetKey,
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
        // Mana Overflow
        if (
            draftCurrActor.resources.manaOverflow > 0 &&
            !draftCurrActor.states.dimmingDarkness
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

    // Cryogenesis
    const newCryogenesis = actionsClass.offensiveActions.includes(action)
        ? 0
        : draftCurrActor.resources.cryogenesis;

    draftCurrActor = {
        ...draftCurrActor,
        resources: {
            ...draftCurrActor.resources,
            cryogenesis: newCryogenesis,
        },
    };

    // Death Logic
    draftCurrActor = processEntityDeathStates(draftCurrActor);
    draftNextActor = processEntityDeathStates(draftNextActor);

    // Wings removal
    if (draftCurrActor.states.cutoffWings && draftCurrActor.resources.fadingLight <= 0) {
        draftCurrActor = {
            ...draftCurrActor,
            states: {
                ...draftCurrActor.states,
                cutoffWings: false,
            },
        };
    }

    if (draftNextActor.states.cutoffWings && draftNextActor.resources.fadingLight <= 0) {
        draftNextActor = {
            ...draftNextActor,
            states: {
                ...draftNextActor.states,
                cutoffWings: false,
            },
        };
    }

    let nextStatus =
        nextActorKey === entityKeys.PLAYER_ONE
            ? turnStatus.UPKEEP_PLAYER_ONE
            : turnStatus.UPKEEP_PLAYER_TWO;

    if (newGame.elementalWheel !== elementalKeys.INACTIVE) {
        nextStatus = turnStatus.WHEEL_TURN;
    } else if (newGame.remainingArray > 0) {
        nextStatus = turnStatus.ARRAY_TURN;
    }

    if (action === actionKeys.LASER) {
        nextStatus =
            currActorKey === entityKeys.PLAYER_ONE
                ? turnStatus.PLAYER_ONE_TURN
                : turnStatus.PLAYER_TWO_TURN;
    }

    const playerOneEntity =
        currActorKey === entityKeys.PLAYER_ONE
            ? draftCurrActor
            : draftNextActor;
    const playerTwoEntity =
        currActorKey === entityKeys.PLAYER_TWO
            ? draftCurrActor
            : draftNextActor;

    nextStatus = evaluateMatchStatus(
        playerOneEntity,
        playerTwoEntity,
        nextStatus,
    );

    const newStatus =
        action === actionKeys.LASER
            ? turnStatus.SHORT_TRANSITION
            : turnStatus.TRANSITION;

    return {
        ...newGame,
        status: newStatus,
        nextStatus: nextStatus,
        wheelHalted: action === actionKeys.HALT,
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

export function processWheelTurn(prev) {
    let nextStatus =
        prev.lastPlayerTurn === entityKeys.PLAYER_ONE
            ? turnStatus.UPKEEP_PLAYER_TWO
            : turnStatus.UPKEEP_PLAYER_ONE;

    if (prev.remainingArray > 0) {
        nextStatus = turnStatus.ARRAY_TURN;
    }

    if (prev.elementalWheel === elementalKeys.INACTIVE) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextStatus,
        };
    }

    let newElement = prev.elementalWheel;

    if (!prev.wheelHalted) {
        if (prev.wheelDirection === directionKeys.CLOCKWISE) {
            newElement =
                prev.elementalWheel === elementalKeys.NATURE
                    ? elementalKeys.FROST
                    : prev.elementalWheel === elementalKeys.FROST
                      ? elementalKeys.SCORCH
                      : elementalKeys.NATURE;
        } else {
            newElement =
                prev.elementalWheel === elementalKeys.NATURE
                    ? elementalKeys.SCORCH
                    : prev.elementalWheel === elementalKeys.SCORCH
                      ? elementalKeys.FROST
                      : elementalKeys.NATURE;
        }
    }

    let elementalResourceKey;
    switch (prev.elementalWheel) {
        case elementalKeys.NATURE:
            elementalResourceKey = effectKeys.OVERGROWTH;
            break;
        case elementalKeys.FROST:
            elementalResourceKey = effectKeys.PERMAFROST;
            break;
        case elementalKeys.SCORCH:
            elementalResourceKey = effectKeys.SCORIA;
            break;
        default:
            elementalResourceKey = null;
    }

    let playerOne = prev.entities[entityKeys.PLAYER_ONE];
    let playerTwo = prev.entities[entityKeys.PLAYER_TWO];

    if (elementalResourceKey !== null && !prev.wheelHalted) {
        playerOne = playerOne.states.aligned
            ? {
                  ...playerOne,
                  [elementalResourceKey]:
                      playerOne[elementalResourceKey] +
                      constants.ELEMENTAL_RESOURCE_GAIN,
              }
            : playerOne;
        playerTwo = playerTwo.states.aligned
            ? {
                  ...playerTwo,
                  [elementalResourceKey]:
                      playerTwo[elementalResourceKey] +
                      constants.ELEMENTAL_RESOURCE_GAIN,
              }
            : playerTwo;
    }

    if (!prev.wheelHalted) {
        switch (newElement) {
            case elementalKeys.NATURE: {
                const overgrowthUsedP1 =
                    prev.wheelDirection === directionKeys.CLOCKWISE
                        ? playerOne.overgrowth
                        : playerTwo.overgrowth;
                const overgrowthUsedP2 =
                    prev.wheelDirection === directionKeys.CLOCKWISE
                        ? playerTwo.overgrowth
                        : playerOne.overgrowth;

                playerOne = restoreResources(playerOne, overgrowthUsedP1);
                playerTwo = restoreResources(playerTwo, overgrowthUsedP2);
                break;
            }
            case elementalKeys.FROST: {
                const permafrostUsedP1 =
                    prev.wheelDirection === directionKeys.CLOCKWISE
                        ? playerOne.permafrost
                        : playerTwo.permafrost;
                const permafrostUsedP2 =
                    prev.wheelDirection === directionKeys.CLOCKWISE
                        ? playerTwo.permafrost
                        : playerOne.permafrost;

                playerOne = {
                    ...playerOne,
                    resources: {
                        ...playerOne.resources,
                        cryogenesis:
                            playerOne.resources.cryogenesis + permafrostUsedP1,
                    },
                };
                playerTwo = {
                    ...playerTwo,
                    resources: {
                        ...playerTwo.resources,
                        cryogenesis:
                            playerTwo.resources.cryogenesis + permafrostUsedP2,
                    },
                };
                break;
            }
            case elementalKeys.SCORCH: {
                const scoriaUsedP1 =
                    prev.wheelDirection === directionKeys.CLOCKWISE
                        ? playerOne.scoria
                        : playerTwo.scoria;
                const scoriaUsedP2 =
                    prev.wheelDirection === directionKeys.CLOCKWISE
                        ? playerTwo.scoria
                        : playerOne.scoria;

                playerOne = takeDamage(
                    playerOne,
                    scoriaUsedP1,
                    dmgTypes.PIERCING,
                );
                playerTwo = takeDamage(
                    playerTwo,
                    scoriaUsedP2,
                    dmgTypes.PIERCING,
                );
                break;
            }
        }
    }

    // Death Logic
    playerOne = processEntityDeathStates(playerOne);
    playerTwo = processEntityDeathStates(playerTwo);

    nextStatus = evaluateMatchStatus(playerOne, playerTwo, nextStatus);

    return {
        ...prev,
        status: turnStatus.TRANSITION,
        nextStatus: nextStatus,
        elementalWheel: newElement,
        entities: {
            ...prev.entities,
            [entityKeys.PLAYER_ONE]: { ...playerOne },
            [entityKeys.PLAYER_TWO]: { ...playerTwo },
        },
    };
}

export function processArrayTurn(prev) {
    let nextStatus =
        prev.lastPlayerTurn === entityKeys.PLAYER_ONE
            ? turnStatus.UPKEEP_PLAYER_TWO
            : turnStatus.UPKEEP_PLAYER_ONE;

    if (prev.remainingArray <= 0) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextStatus,
        };
    }

    let playerOne = prev.entities[entityKeys.PLAYER_ONE];
    let playerTwo = prev.entities[entityKeys.PLAYER_TWO];

    const newArray = prev.remainingArray - 1;

    if (newArray <= 0) {
        // If Array dead, redistribute mana
        const totalShackledMana =
            playerOne.resources.shackledMana + playerTwo.resources.shackledMana;
        const manaShare = Math.floor(totalShackledMana / 2);

        playerOne = gainMana(playerOne, manaShare);
        playerOne = {
            ...playerOne,
            resources: {
                ...playerOne.resources,
                shackledMana: 0,
            },
        };

        playerTwo = gainMana(playerTwo, manaShare);
        playerTwo = {
            ...playerTwo,
            resources: {
                ...playerTwo.resources,
                shackledMana: 0,
            },
        };
    } else {
        // If Array alive and kicking, convert mana and add to it
        const p1NewManaShackle =
            playerOne.currMana +
            playerOne.resources.shackledMana +
            playerOne.resources.manaOverflow +
            constants.MANA_SHACKLE_TURN_GAIN;
        const p2NewManaShackle =
            playerTwo.currMana +
            playerTwo.resources.shackledMana +
            playerTwo.resources.manaOverflow +
            constants.MANA_SHACKLE_TURN_GAIN;

        playerOne = {
            ...playerOne,
            currMana: 0,
            resources: {
                ...playerOne.resources,
                manaOverflow: 0,
                shackledMana: p1NewManaShackle,
            },
        };

        playerTwo = {
            ...playerTwo,
            currMana: 0,
            resources: {
                ...playerTwo.resources,
                manaOverflow: 0,
                shackledMana: p2NewManaShackle,
            },
        };
    }

    // Thorned Shackles
    playerOne = {
        ...playerOne,
        states: {
            ...playerOne.states,
            thornedShackles: newArray > 0,
        },
    };

    playerTwo = {
        ...playerTwo,
        states: {
            ...playerTwo.states,
            thornedShackles: newArray > 0,
        },
    };

    // Death logic (tecnically they can't die here, but... why not?)
    playerOne = processEntityDeathStates(playerOne);
    playerTwo = processEntityDeathStates(playerTwo);

    nextStatus = evaluateMatchStatus(playerOne, playerTwo, nextStatus);

    return {
        ...prev,
        status: turnStatus.TRANSITION,
        nextStatus: nextStatus,
        remainingArray: newArray,
        entities: {
            [entityKeys.PLAYER_ONE]: { ...playerOne },
            [entityKeys.PLAYER_TWO]: { ...playerTwo },
        },
    };
}
