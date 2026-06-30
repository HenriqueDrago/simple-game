import { constants, actionsClass, coloredStars } from "./constants.js";
import {
    consumeResources,
    exitAllStates,
    gainEnlit,
    gainHp,
    gainMana,
    isEntityDead,
    loseMana,
    processEntityCutoffWings,
    processEntityDeathStates,
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
    starfallPhases,
} from "./enums.js";
import { processIVStar, processROYGBStar, processTrail } from "./starfall.js";

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
    draftTarget = processEntityCutoffWings(draftTarget);
    draftNonTarget = processEntityCutoffWings(draftNonTarget);

    let newEye = prev.eyeOfHeavens;
    if (!prev[effectKeys.SEVERED_TIME]) {
        // Remnants
        if (draftTarget.states[effectKeys.REMNANTS_OF_DIVINITY]) {
            draftTarget = {
                ...draftTarget,
                states: {
                    ...draftTarget.states,
                    [effectKeys.REMNANTS_OF_DIVINITY]: false,
                    [effectKeys.BURDEN_OF_STIGMA]: true,
                },
            };
        }

        // Stardust
        if (draftTarget.resources[effectKeys.STARDUST] > 0) {
            const newStardust =
                draftTarget.resources[effectKeys.STARDUST] %
                constants.STARDUST_RATE_CONVERSION;
            const newWhites =
                draftTarget.stars[effectKeys.WHITE_STAR] +
                Math.floor(
                    draftTarget.resources[effectKeys.STARDUST] /
                        constants.STARDUST_RATE_CONVERSION,
                );

            draftTarget = {
                ...draftTarget,
                resources: {
                    ...draftTarget.resources,
                    [effectKeys.STARDUST]: newStardust,
                },
                stars: {
                    ...draftTarget.stars,
                    [effectKeys.WHITE_STAR]: newWhites,
                },
            };
        }

        // Dimmed Stars
        const hasDim = coloredStars.some(
            (curr) => draftTarget.stars[curr.dimmed] > 0,
        );
        if (hasDim) {
            for (let value of Object.values(coloredStars)) {
                draftTarget = {
                    ...draftTarget,
                    stars: {
                        ...draftTarget.stars,
                        [value.star]:
                            draftTarget.stars[value.star] +
                            draftTarget.stars[value.dimmed],
                        [value.dimmed]: 0,
                    },
                };
            }
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
            const halvedLE = Math.ceil(
                draftTarget.resources.lingeringEmber / 2,
            );

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
            draftTarget = takeDamage(
                draftTarget,
                draftTarget.resources.poison,
                dmgTypes.TRUE,
                prev.elementalWheel,
            );
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

            draftTarget = {
                ...gainHp(draftTarget, manaBleed),
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
                    weaponsDeployed: newOverheat <= 0,
                },
            };
        }

        // Dynamo
        if (draftTarget[effectKeys.DYNAMO] >= constants.MAX_DYNAMO) {
            draftTarget = {
                ...draftTarget,
                [effectKeys.DYNAMO]: 0,
                [effectKeys.ENERGY_LEVEL]: draftTarget[effectKeys.ENERGY_LEVEL] + 1,
            }
        }

        // Sacred Flames
        if (draftTarget.resources[effectKeys.SACRED_FLAMES] > 0) {
            const missingHp =
                draftTarget[effectKeys.MAX_HEALTH] -
                draftTarget[effectKeys.HEALTH];

            const hpRestored = Math.min(
                missingHp,
                draftTarget.resources[effectKeys.SACRED_FLAMES],
            );
            const newFlames =
                draftTarget.resources[effectKeys.SACRED_FLAMES] - hpRestored;

            draftTarget = gainHp(draftTarget, hpRestored);

            draftTarget = {
                ...draftTarget,
                resources: {
                    ...draftTarget.resources,
                    [effectKeys.SACRED_FLAMES]: newFlames,
                },
            };
        }

        // Inspiration
        if (draftTarget.resources[effectKeys.INSPIRATION] > 0) {
            const missingEnlit =
                draftTarget[effectKeys.MAX_ENLIGHTENMENT] -
                draftTarget[effectKeys.ENLIGHTENMENT];

            const enlitRestored = Math.min(
                missingEnlit,
                draftTarget.resources[effectKeys.INSPIRATION],
            );
            const newInspiration =
                draftTarget.resources[effectKeys.INSPIRATION] - enlitRestored;

            draftTarget = gainEnlit(draftTarget, enlitRestored);

            draftTarget = {
                ...draftTarget,
                resources: {
                    ...draftTarget.resources,
                    [effectKeys.INSPIRATION]: newInspiration,
                },
            };
        }

        // Halo
        if (draftTarget.resources.halo > 0) {
            const newSpark = Math.min(
                draftTarget.resources.halo +
                    draftTarget[effectKeys.DIVINE_SPARK],
                constants.MAX_DIVINE_SPARK,
            );

            draftTarget = {
                ...draftTarget,
                [effectKeys.DIVINE_SPARK]: newSpark,
                resources: {
                    ...draftTarget.resources,
                    halo: 0,
                },
            };
        }

        // Divine Spark
        if (
            draftTarget[effectKeys.DIVINE_SPARK] >=
            constants.MAX_DIVINE_SPARK
        ) {
            draftTarget = {
                ...draftTarget,
                states: {
                    ...draftTarget.states,
                    [effectKeys.ZENITH_OF_MORTALITY]: true,
                },
            };

            if (newEye === eyeKeys.DORMANT) {
                newEye = eyeKeys.CLOSED;
            }
        }
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
        eyeOfHeavens: newEye,
        turnCount: prev.turnCount + 1,
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

    if (action !== actionKeys.LASER && action !== actionKeys.ASCEND) {
        if (!newGame[effectKeys.SEVERED_TIME]) {
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

            // Gray Stars
            if (draftCurrActor.stars[effectKeys.GRAY_STAR] > 0) {
                const newWhite =
                    draftCurrActor.stars[effectKeys.GRAY_STAR] +
                    draftCurrActor.stars[effectKeys.WHITE_STAR];
                draftCurrActor = {
                    ...draftCurrActor,
                    stars: {
                        ...draftCurrActor.stars,
                        [effectKeys.WHITE_STAR]: newWhite,
                        [effectKeys.GRAY_STAR]: 0,
                    },
                };
            }

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

    // Overheat
    if (actionsClass.defensiveActions.includes(action)) {
        const overheatLost = Math.min(
                constants.NATURAL_OVERHEAT_LOSS,
                draftCurrActor[effectKeys.OVERHEAT],
            );

        const newOverheat = draftCurrActor[effectKeys.OVERHEAT] - overheatLost;
        const newDynamo = Math.min(draftCurrActor[effectKeys.DYNAMO] + overheatLost, constants.MAX_DYNAMO);
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.OVERHEAT]: newOverheat,
            [effectKeys.DYNAMO]: newDynamo,
        };
    }

    // Thermal Overload
    if (draftCurrActor[effectKeys.OVERHEAT] >= constants.MAX_OVERHEAT && !draftCurrActor.states[effectKeys.VENTING]) {
        draftCurrActor = {
            ...draftCurrActor,
            states: {
                ...draftCurrActor.states,
                [effectKeys.WEAPONS_DEPLOYED]: false,
                [effectKeys.THERMAL_OVERLOAD]: true,
            }
        }
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

    let nextStatus =
        nextActorKey === entityKeys.PLAYER_ONE
            ? turnStatus.UPKEEP_PLAYER_ONE
            : turnStatus.UPKEEP_PLAYER_TWO;

    let nextEye = newGame[effectKeys.EYE_OF_HEAVENS];
    if (
        (draftCurrActor.states[effectKeys.ABANDONED_BY_GRACE] ||
            draftNextActor.states[effectKeys.ABANDONED_BY_GRACE]) &&
        !(
            draftCurrActor.states[effectKeys.ANOINTED_PROXY] ||
            draftNextActor.states[effectKeys.ANOINTED_PROXY]
        )
    ) {
        // Immediatelly triggers emanation and opens the eye
        nextStatus = turnStatus.EMINENCE_TURN;
        nextEye = eyeKeys.OPEN;
    } else {
        if (draftCurrActor.states[effectKeys.STARGAZER]) {
            nextStatus = turnStatus.STARS_TURN;
        } else if (
            newGame.turnCount % 2 === 0 &&
            newGame.elementalWheel !== elementalKeys.INACTIVE
        ) {
            nextStatus = turnStatus.WHEEL_TURN;
        } else if (newGame.remainingArray > 0) {
            nextStatus = turnStatus.ARRAY_TURN;
        } else if (
            newGame.turnCount % 2 === 0 &&
            newGame.eyeOfHeavens !== eyeKeys.DORMANT
        ) {
            nextStatus = turnStatus.EMINENCE_TURN;
        }

        if (action === actionKeys.LASER || action === actionKeys.ASCEND) {
            nextStatus =
                currActorKey === entityKeys.PLAYER_ONE
                    ? turnStatus.PLAYER_ONE_TURN
                    : turnStatus.PLAYER_TWO_TURN;
        }
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
        [effectKeys.EYE_OF_HEAVENS]: nextEye,
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
    } else if (prev.eyeOfHeavens !== eyeKeys.DORMANT) {
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

    if(prev[effectKeys.SEVERED_TIME]) {
        newElement = prev.elementalWheel;
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

    if (prev.eyeOfHeavens !== eyeKeys.DORMANT) {
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

    const newArray = prev[effectKeys.SEVERED_TIME] ? prev.remainingArray - 1 : prev.remainingArray;

    // If Array dying, redistribute mana
    if (newArray <= 0) {
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

    let playerOne = prev.entities[entityKeys.PLAYER_ONE];
    let playerTwo = prev.entities[entityKeys.PLAYER_TWO];

    // Abandoned by Grace logic
    const p1Graceless = playerOne.states[effectKeys.ABANDONED_BY_GRACE];
    const p2Graceless = playerTwo.states[effectKeys.ABANDONED_BY_GRACE];
    if (p1Graceless || p2Graceless) {
        if (p1Graceless) {
            if (p2Graceless) {
                // Punishes both players
                playerOne = exitAllStates(playerOne);
                playerOne = consumeResources(
                    playerOne,
                    Infinity,
                    actionKeys.JUDGEMENT,
                ).draftEntity;

                playerTwo = exitAllStates(playerTwo);
                playerTwo = consumeResources(
                    playerTwo,
                    Infinity,
                    actionKeys.JUDGEMENT,
                ).draftEntity;
            } else {
                // Chooses a proxy
                playerTwo = {
                    ...playerTwo,
                    states: {
                        ...playerTwo.states,
                        [effectKeys.ANOINTED_PROXY]: true,
                    },
                };
            }
        } else {
            // Chooses a proxy
            playerOne = {
                ...playerOne,
                states: {
                    ...playerOne.states,
                    [effectKeys.ANOINTED_PROXY]: true,
                },
            };
        }

        playerOne = processEntityDeathStates(playerOne);
        playerTwo = processEntityDeathStates(playerTwo);

        nextStatus = evaluateMatchStatus(playerOne, playerTwo, nextStatus);

        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextStatus,
            eyeOfHeavens: eyeKeys.OPEN,
            [effectKeys.SEVERED_TIME]: false,
            entities: {
                ...prev.entities,
                [entityKeys.PLAYER_ONE]: { ...playerOne },
                [entityKeys.PLAYER_TWO]: { ...playerTwo },
            },
        };
    }

    // Early return if eye is sleeping
    if (prev.eyeOfHeavens === eyeKeys.DORMANT) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextStatus,
            [effectKeys.SEVERED_TIME]: false,
        };
    }

    // Disables itself if no ascended players
    if (
        !playerOne.states.ascendenceOfSpirit &&
        !playerTwo.states.ascendenceOfSpirit
    ) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextStatus,
            eyeOfHeavens: eyeKeys.DORMANT,
            [effectKeys.SEVERED_TIME]: false,
        };
    }

    // else, runs current state logic
    let severedTime = prev[effectKeys.SEVERED_TIME];
    if (prev[effectKeys.EYE_OF_HEAVENS] === eyeKeys.CLOSED) {
        // Grants revelation when opening
        const p1NewRev =
            playerOne.revelation +
            Math.floor(playerOne.currInsight / constants.INSIGHT_TO_REV_FACTOR);
        const p2NewRev =
            playerTwo.revelation +
            Math.floor(playerTwo.currInsight / constants.INSIGHT_TO_REV_FACTOR);

        playerOne = {
            ...playerOne,
            revelation: p1NewRev,
        };
        playerTwo = {
            ...playerTwo,
            revelation: p2NewRev,
        };
    } else {
        // Disables Severed Time if closing
        severedTime = true;
    }

    // Switchs state
    const nextEye =
        prev.eyeOfHeavens === eyeKeys.OPEN ? eyeKeys.CLOSED : eyeKeys.OPEN;

    // Checks deaths
    playerOne = processEntityDeathStates(playerOne);
    playerTwo = processEntityDeathStates(playerTwo);

    nextStatus = evaluateMatchStatus(playerOne, playerTwo, nextStatus);

    return {
        ...prev,
        eyeOfHeavens: nextEye,
        status: turnStatus.TRANSITION,
        nextStatus: nextStatus,
        [effectKeys.SEVERED_TIME]: severedTime,
        entities: {
            ...prev.entities,
            [entityKeys.PLAYER_ONE]: { ...playerOne },
            [entityKeys.PLAYER_TWO]: { ...playerTwo },
        },
    };
}

export function processStarfallTurn(prev) {
    // Calculate what the turn after starfall should be
    let nextTurnStatus =
        prev.lastPlayerTurn === entityKeys.PLAYER_ONE
            ? turnStatus.UPKEEP_PLAYER_TWO
            : turnStatus.UPKEEP_PLAYER_ONE;

    if (
        prev.turnCount % 2 === 0 &&
        prev.elementalWheel !== elementalKeys.INACTIVE
    ) {
        nextTurnStatus = turnStatus.WHEEL_TURN;
    } else if (prev.remainingArray > 0) {
        nextTurnStatus = turnStatus.ARRAY_TURN;
    } else if (
        prev.turnCount % 2 === 0 &&
        prev.eyeOfHeavens !== eyeKeys.DORMANT
    ) {
        nextTurnStatus = turnStatus.EMINENCE_TURN;
    }

    // Then, calculate master/nonMaster
    const masterKey =
        prev.lastPlayerTurn === entityKeys.PLAYER_ONE
            ? entityKeys.PLAYER_ONE
            : entityKeys.PLAYER_TWO;

    const nonMasterKey =
        prev.lastPlayerTurn === entityKeys.PLAYER_ONE
            ? entityKeys.PLAYER_TWO
            : entityKeys.PLAYER_ONE;

    let master = { ...prev.entities[masterKey] };
    let nonMaster = { ...prev.entities[nonMasterKey] };

    const currentPhase = prev.starQueue[0];

    // If the queue is empty or there's no stars remaining, exits starfall phase
    const hasStars = coloredStars.some((curr) => master.stars[curr.star] > 0);
    const hasTrails = coloredStars.some((curr) => master.stars[curr.trail] > 0);

    if (
        !prev.starQueue ||
        prev.starQueue.length === 0 ||
        (!hasStars &&
            !hasTrails &&
            currentPhase === starfallPhases.STARFALL_INIT)
    ) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextTurnStatus,
            starQueue: null,
        };
    }

    // else, process current queue item
    const newQueue = prev.starQueue.slice(1);

    const context = {
        prev,
        masterKey,
        nonMasterKey,
        master,
        nonMaster,
        wheel: prev.elementalWheel,
    };

    switch (currentPhase) {
        // ROYGB
        case starfallPhases.RED_STAR: {
            if (master.stars[effectKeys.RED_STAR] > 0) {
                const newEntities = processROYGBStar(
                    context,
                    effectKeys.RED_STAR,
                    effectKeys.DIMMED_RED_STAR,
                    effectKeys.RED_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.ORANGE_STAR: {
            if (master.stars[effectKeys.ORANGE_STAR] > 0) {
                const newEntities = processROYGBStar(
                    context,
                    effectKeys.ORANGE_STAR,
                    effectKeys.DIMMED_ORANGE_STAR,
                    effectKeys.ORANGE_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.YELLOW_STAR: {
            if (master.stars[effectKeys.YELLOW_STAR] > 0) {
                const newEntities = processROYGBStar(
                    context,
                    effectKeys.YELLOW_STAR,
                    effectKeys.DIMMED_YELLOW_STAR,
                    effectKeys.YELLOW_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.GREEN_STAR: {
            if (master.stars[effectKeys.GREEN_STAR] > 0) {
                const newEntities = processROYGBStar(
                    context,
                    effectKeys.GREEN_STAR,
                    effectKeys.DIMMED_GREEN_STAR,
                    effectKeys.GREEN_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.BLUE_STAR: {
            if (master.stars[effectKeys.BLUE_STAR] > 0) {
                const newEntities = processROYGBStar(
                    context,
                    effectKeys.BLUE_STAR,
                    effectKeys.DIMMED_BLUE_STAR,
                    effectKeys.BLUE_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        // IV
        case starfallPhases.INDIGO_STAR: {
            if (master.stars[effectKeys.INDIGO_STAR] > 0) {
                const newEntities = processIVStar(
                    context,
                    effectKeys.INDIGO_STAR,
                    effectKeys.DIMMED_INDIGO_STAR,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.nonMaster;
            }
            break;
        }

        case starfallPhases.VIOLET_STAR: {
            if (master.stars[effectKeys.VIOLET_STAR] > 0) {
                const newEntities = processIVStar(
                    context,
                    effectKeys.VIOLET_STAR,
                    effectKeys.DIMMED_VIOLET_STAR,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.nonMaster;
            }
            break;
        }

        // trails
        case starfallPhases.RED_TRAIL: {
            if (master.stars[effectKeys.RED_TRAIL] > 0) {
                const newEntities = processTrail(context, effectKeys.RED_TRAIL);
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.ORANGE_TRAIL: {
            if (master.stars[effectKeys.ORANGE_TRAIL] > 0) {
                const newEntities = processTrail(
                    context,
                    effectKeys.ORANGE_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.YELLOW_TRAIL: {
            if (master.stars[effectKeys.YELLOW_TRAIL] > 0) {
                const newEntities = processTrail(
                    context,
                    effectKeys.YELLOW_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.GREEN_TRAIL: {
            if (master.stars[effectKeys.GREEN_TRAIL] > 0) {
                const newEntities = processTrail(
                    context,
                    effectKeys.GREEN_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.BLUE_TRAIL: {
            if (master.stars[effectKeys.BLUE_TRAIL] > 0) {
                const newEntities = processTrail(
                    context,
                    effectKeys.BLUE_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.INDIGO_TRAIL: {
            if (master.stars[effectKeys.INDIGO_TRAIL] > 0) {
                const newEntities = processTrail(
                    context,
                    effectKeys.INDIGO_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        case starfallPhases.VIOLET_TRAIL: {
            if (master.stars[effectKeys.VIOLET_TRAIL] > 0) {
                const newEntities = processTrail(
                    context,
                    effectKeys.VIOLET_TRAIL,
                );
                master = newEntities.draftMaster;
                nonMaster = newEntities.draftNonMaster;
            }
            break;
        }

        default: {
            break;
        }
    }

    master = processEntityDeathStates(master);
    nonMaster = processEntityDeathStates(nonMaster);

    const playerOneEntity =
        masterKey === entityKeys.PLAYER_ONE ? master : nonMaster;
    const playerTwoEntity =
        masterKey === entityKeys.PLAYER_TWO ? master : nonMaster;

    // Pass null as the default next status. If someone died, it returns the game over state.
    const deathStatus = evaluateMatchStatus(
        playerOneEntity,
        playerTwoEntity,
        null,
    );

    if (deathStatus) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: deathStatus,
            starQueue: null,
            entities: {
                ...prev.entities,
                [entityKeys.PLAYER_ONE]: playerOneEntity,
                [entityKeys.PLAYER_TWO]: playerTwoEntity,
            },
        };
    }

    // If there's no trails, skip trails
    if (!hasTrails && currentPhase === starfallPhases.VIOLET_STAR) {
        return {
            ...prev,
            status: turnStatus.TRANSITION,
            nextStatus: nextTurnStatus,
            starQueue: null,
            entities: {
                ...prev.entities,
                [masterKey]: master,
                [nonMasterKey]: nonMaster,
            },
        };
    }

    // Else, apply the action changes and trigger the delay for the next starfall phase
    return {
        ...prev,
        status: turnStatus.STARS_TURN,
        starQueue: newQueue,
        entities: {
            ...prev.entities,
            [masterKey]: master,
            [nonMasterKey]: nonMaster,
        },
    };
}
