import { constants, actionsClass } from "./constants.js";
import {
    consumeResources,
    createBaseEntity,
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
    eyeKeys,
    dmgTypes,
} from "./enums.js";

function processEntityDeathStates(entity) {
    let draft = { ...entity };

    return draft;
}

function isEntityDead(entity) {
    return entity.currHp <= 0 && !entity.states.ascendenceOfSpirit;
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

    // Cutoff Wings
    if (draftTarget.states.cutoffWings) {
        draftTarget = {
            ...draftTarget,
            currHp: Math.max(0, Math.min(draftTarget.currHp, 1)),
            maxHp: 1,
        };
    }

    // Halo
    if (draftTarget.resources.halo > 0) {
        const newEnlit = draftTarget.resources.halo + draftTarget.currEnlit;

        draftTarget = {
            ...draftTarget,
            currEnlit: newEnlit,
            resources: {
                ...draftTarget.resources,
                halo: 0,
            },
        };
    }

    // Enlightenment (Ascendence Trigger)
    if (
        draftTarget.currEnlit >= 100 &&
        !draftTarget.states.ascendenceOfSpirit
    ) {
        const { draftEntity, resourcesConsumed } = consumeResources(
            draftTarget,
            Infinity,
            effectKeys.ENLIGHTENMENT,
        );

        draftTarget = {
            ...draftEntity,
            states: {
                ...createBaseEntity().states,
                ascendenceOfSpirit: true,
            },
        };

        draftTarget = restoreResources(
            draftTarget,
            resourcesConsumed.totalConsumption,
            prev.elementalWheel,
        );
    }

    // Sacred Flames
    if (draftTarget.resources.sacredFlames > 0) {
        const newEnlit = Math.max(
            0,
            draftTarget.currEnlit - draftTarget.resources.sacredFlames,
        );

        draftTarget = {
            ...draftTarget,
            currEnlit: newEnlit,
        };
    }

    // Ascendence Consumption
    if (draftTarget.states.ascendenceOfSpirit) {
        const { draftEntity, resourcesConsumed } = consumeResources(
            draftTarget,
            Infinity,
            effectKeys.ASCENDENCE_OF_SPIRIT,
        );

        const newFlames =
            draftEntity.resources.sacredFlames +
            resourcesConsumed.totalConsumption;

        draftTarget = {
            ...draftEntity,
            resources: {
                ...draftEntity.resources,
                sacredFlames: newFlames,
            },
        };
    }

    // Unrelenting Shadows
    if (draftTarget.resources.unrelentingShadows > 0) {
        draftTarget = restoreResources(
            draftTarget,
            draftTarget.resources.unrelentingShadows,
            prev.elementalWheel,
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
                bleakDeception: true,
            },
        };
    }

    // Poison
    if (
        draftTarget.resources.poison > 0 &&
        !draftTarget.states.dimmingDarkness
    ) {
        draftTarget = takeDamage(draftTarget, draftTarget.resources.poison, dmgTypes.TRUE, prev.elementalWheel);
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

    let newEye = prev.eyeOfHeavens;
    let eyeTurnAwakened = prev.eyeTurnAwakened;

    if (
        prev.eyeOfHeavens === eyeKeys.DORMANT &&
        (draftTarget.states.ascendenceOfSpirit ||
            draftNonTarget.states.ascendenceOfSpirit)
    ) {
        newEye = eyeKeys.OPEN;
        eyeTurnAwakened = prev.turnCount;
    }

    return {
        ...prev,
        status: nextStatus,
        lastPlayerTurn: targetKey,
        eyeOfHeavens: newEye,
        eyeTurnAwakened: eyeTurnAwakened,
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

    let newTurnCount = newGame.turnCount;

    if (action !== actionKeys.LASER) {
        // Mana Overflow
        if (
            draftCurrActor.resources.manaOverflow > 0 &&
            !draftCurrActor.states.dimmingDarkness
        ) {
            draftCurrActor = takeDamage(
                draftCurrActor,
                draftCurrActor.resources.manaOverflow,
                dmgTypes.TRUE,
                newGame.elementalWheel,
            );

            draftCurrActor = {
                ...draftCurrActor,
                resources: {
                    ...draftCurrActor.resources,
                    manaOverflow: 0,
                },
            };
        }

        // Cutoff Wings
        if (draftCurrActor.states.cutoffWings) {
            draftCurrActor = {
                ...draftCurrActor,
                currHp: Math.max(0, Math.min(draftCurrActor.currHp, 1)),
                maxHp: 1,
            };
        }

        // Laser used
        draftCurrActor = {
            ...draftCurrActor,
            lasersUsedThisTurn: 0,
        };

        newTurnCount += 1;
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

    // Burden
    if (draftCurrActor.states.burdenOfStigma) {
        draftCurrActor = {
            ...draftCurrActor,
            states: {
                ...draftCurrActor.states,
                burdenOfStigma: false,
            },
        };
    }

    // Death Logic
    draftCurrActor = processEntityDeathStates(draftCurrActor);
    draftNextActor = processEntityDeathStates(draftNextActor);

    let nextStatus =
        nextActorKey === entityKeys.PLAYER_ONE
            ? turnStatus.UPKEEP_PLAYER_ONE
            : turnStatus.UPKEEP_PLAYER_TWO;

    if (
        newGame.elementalWheel !== elementalKeys.INACTIVE &&
        newGame.whoStarts !== currActorKey
    ) {
        nextStatus = turnStatus.WHEEL_TURN;
    } else if (newGame.remainingArray > 0) {
        nextStatus = turnStatus.ARRAY_TURN;
    } else if (
        newGame.eyeTurnAwakened !== null &&
        newGame.eyeTurnAwakened % 2 === newGame.turnCount % 2
    ) {
        nextStatus = turnStatus.EMINENCE_TURN;
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
        turnCount: newTurnCount,
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
    } else if (
        prev.eyeTurnAwakened !== null &&
        prev.eyeTurnAwakened % 2 === prev.turnCount % 2
    ) {
        nextStatus = turnStatus.EMINENCE_TURN;
    }

    if (prev.elementalWheel === elementalKeys.INACTIVE) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextStatus,
        };
    }

    let newElement =
        prev.elementalWheel === elementalKeys.NATURE
            ? elementalKeys.FROST
            : prev.elementalWheel === elementalKeys.FROST
              ? elementalKeys.SCORCH
              : elementalKeys.NATURE;

    let playerOne = prev.entities[entityKeys.PLAYER_ONE];
    let playerTwo = prev.entities[entityKeys.PLAYER_TWO];

    if (!playerOne.states.aligned && !playerTwo.states.aligned) {
        newElement = elementalKeys.INACTIVE;
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

    if (
        prev.eyeTurnAwakened !== null &&
        prev.eyeTurnAwakened % 2 === prev.turnCount % 2
    ) {
        nextStatus = turnStatus.EMINENCE_TURN;
    }

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
            ...prev.entities,
            [entityKeys.PLAYER_ONE]: { ...playerOne },
            [entityKeys.PLAYER_TWO]: { ...playerTwo },
        },
    };
}

export function processEminenceTurn(prev) {
    let nextStatus =
        prev.lastPlayerTurn === entityKeys.PLAYER_ONE
            ? turnStatus.UPKEEP_PLAYER_TWO
            : turnStatus.UPKEEP_PLAYER_ONE;

    if (prev.eyeOfHeavens === eyeKeys.DORMANT) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextStatus,
        };
    }

    let playerOne = prev.entities[entityKeys.PLAYER_ONE];
    let playerTwo = prev.entities[entityKeys.PLAYER_TWO];

    if (
        !playerOne.states.ascendenceOfSpirit &&
        !playerTwo.states.ascendenceOfSpirit
    ) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextStatus,
            eyeOfHeavens: eyeKeys.DORMANT,
            eyeTurnAwakened: null,
        };
    } else {
        if (prev.eyeOfHeavens === eyeKeys.OPEN) {
            const p1NewRev =
                playerOne.revelation + Math.floor(playerOne.currInsight / 10);
            const p2NewRev =
                playerTwo.revelation + Math.floor(playerTwo.currInsight / 10);

            playerOne = {
                ...playerOne,
                revelation: p1NewRev,
            };
            playerTwo = {
                ...playerTwo,
                revelation: p2NewRev,
            };
        } else {
            if (
                playerOne.states.ascendenceOfSpirit &&
                playerOne.currEnlit <= 0
            ) {
                const { draftEntity } = consumeResources(
                    playerOne,
                    Infinity,
                    effectKeys.EYE_OF_HEAVENS,
                );

                playerOne = {
                    ...draftEntity,
                    currHp: 1,
                    maxHp: 1,
                    states: {
                        ...draftEntity.states,
                        ascendenceOfSpirit: false,
                        cutoffWings: true,
                    },
                };
            }

            if (
                playerTwo.states.ascendenceOfSpirit &&
                playerTwo.currEnlit <= 0
            ) {
                const { draftEntity } = consumeResources(
                    playerTwo,
                    Infinity,
                    effectKeys.EYE_OF_HEAVENS,
                );

                playerTwo = {
                    ...draftEntity,
                    currHp: 1,
                    maxHp: 1,
                    states: {
                        ...draftEntity.states,
                        ascendenceOfSpirit: false,
                        cutoffWings: true,
                    },
                };
            }
        }
    }

    const nextEye =
        prev.eyeOfHeavens === eyeKeys.OPEN ? eyeKeys.CLOSED : eyeKeys.OPEN;

    return {
        ...prev,
        eyeOfHeavens: nextEye,
        status: turnStatus.TRANSITION,
        nextStatus: nextStatus,
        entities: {
            ...prev.entities,
            [entityKeys.PLAYER_ONE]: { ...playerOne },
            [entityKeys.PLAYER_TWO]: { ...playerTwo },
        },
    };
}
