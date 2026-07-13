import { constants, coloredStars } from "./constants.js";
import {
    consumeResources,
    exitAllStates,
    gainHp,
    gainInsight,
    gainMana,
    getEntityMaxHealth,
    getEntityTotalMana,
    isElementActive,
    loseMana,
    processDeathCheck,
    restoreResources,
    takeDamage,
} from "./entities.js";
import {
    turnStatus,
    entityKeys,
    actionKeys,
    effectKeys,
    eyeKeys,
    dmgTypes,
    starfallPhases,
    moonKeys,
    elementalKeys,
    roundPhases,
} from "./enums.js";
import { processIVStar, processROYGBStar, processTrail } from "./starfall.js";

export function processUpkeep(prev, targetKey, nonTargetKey) {
    let draftTarget = {
        ...prev.entities[targetKey],
    };

    let draftNonTarget = {
        ...prev.entities[nonTargetKey],
    };

    let newEye = prev[effectKeys.EYE_OF_HEAVENS];
    if (!prev[effectKeys.SEVERED_TIME]) {
        // Dome
        if (draftTarget.resources[effectKeys.DOME] > 0) {
            const newStardust =
                draftTarget.resources[effectKeys.STARDUST] +
                draftTarget.resources[effectKeys.DOME];

            draftTarget = {
                ...draftTarget,
                resources: {
                    ...draftTarget.resources,
                    [effectKeys.DOME]: 0,
                    [effectKeys.STARDUST]: newStardust,
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

        // Shattered
        if (isElementActive(draftTarget, elementalKeys.SHATTERED)) {
            draftTarget = takeDamage(
                draftTarget,
                draftTarget[effectKeys.MOONLIGHT],
                dmgTypes.LUNIC,
            );
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
            );
        }

        // Mana Bleed
        if (draftTarget[effectKeys.MANA_BLEED] > 0) {
            const manaBleed = Math.min(
                getEntityTotalMana(draftTarget),
                draftTarget[effectKeys.MANA_BLEED],
            );

            draftTarget = loseMana(draftTarget, manaBleed);
            draftTarget = gainHp(draftTarget, manaBleed);
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
                [effectKeys.ENERGY_LEVEL]:
                    draftTarget[effectKeys.ENERGY_LEVEL] + 1,
            };
        }

        // Sacred Flames
        if (draftTarget.resources[effectKeys.SACRED_FLAMES] > 0) {
            let remainingFlames =
                draftTarget.resources[effectKeys.SACRED_FLAMES];

            const sparkConsumed = Math.min(
                remainingFlames,
                draftTarget[effectKeys.DIVINE_SPARK],
            );
            remainingFlames -= sparkConsumed;

            draftTarget = {
                ...draftTarget,
                [effectKeys.DIVINE_SPARK]:
                    draftTarget[effectKeys.DIVINE_SPARK] - sparkConsumed,
            };

            const enlitConsumed = Math.min(
                remainingFlames,
                draftTarget[effectKeys.ENLIGHTENMENT],
            );
            remainingFlames -= enlitConsumed;

            draftTarget = {
                ...draftTarget,
                [effectKeys.ENLIGHTENMENT]:
                    draftTarget[effectKeys.ENLIGHTENMENT] - enlitConsumed,
            };

            const missingHp =
                getEntityMaxHealth(draftTarget) -
                draftTarget[effectKeys.HEALTH];

            const hpRestored = Math.min(missingHp, remainingFlames);
            const newFlames = remainingFlames - hpRestored;

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
            const missingInsight =
                draftTarget[effectKeys.MAX_INSIGHT] -
                draftTarget[effectKeys.INSIGHT];

            const insightRestored = Math.min(
                missingInsight,
                draftTarget.resources[effectKeys.INSPIRATION],
            );
            const newInspiration =
                draftTarget.resources[effectKeys.INSPIRATION] - insightRestored;

            draftTarget = gainInsight(draftTarget, insightRestored);

            draftTarget = {
                ...draftTarget,
                resources: {
                    ...draftTarget.resources,
                    [effectKeys.INSPIRATION]: newInspiration,
                },
            };
        }

        // Refracted Divinity
        if (draftTarget.resources[effectKeys.REFRACTED_DIVINITY] > 0) {
            const newLunacy = Math.min(
                draftTarget.resources[effectKeys.REFRACTED_DIVINITY] +
                    draftTarget[effectKeys.LUNACY],
                constants.MAX_LUNACY,
            );

            draftTarget = {
                ...draftTarget,
                [effectKeys.LUNACY]: newLunacy,
                resources: {
                    ...draftTarget.resources,
                    [effectKeys.REFRACTED_DIVINITY]: 0,
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
            draftTarget[effectKeys.DIVINE_SPARK] >= constants.MAX_DIVINE_SPARK
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

        // Burden
        if (draftTarget[effectKeys.BURDEN_OF_STIGMA] > 0) {
            draftTarget = {
                ...draftTarget,
                [effectKeys.BURDEN_OF_STIGMA]:
                    draftTarget[effectKeys.BURDEN_OF_STIGMA] - 1,
            };
        }

        // States cleared at turn start
        draftTarget = {
            ...draftTarget,
            states: {
                ...draftTarget.states,
                guarding: false,
                sacrificial: false,
                radiant: false,
                darkEmbrace: false,
                dimmingDarkness: false,
                [effectKeys.PRISMATIC]: false,
                [effectKeys.GIBBOUS]: false,
                [effectKeys.MOON_DEW]: false,
            },
        };
    }

    const newQueue = prev.playerQueue.slice(1);

    return processDeathCheck({
        ...prev,
        [effectKeys.EYE_OF_HEAVENS]: newEye,
        playerQueue: newQueue,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...draftTarget,
            },
            [nonTargetKey]: {
                ...draftNonTarget,
            },
        },
    });
}

export function commitTurn(prev, currActorKey, nextActorKey) {
    let draftCurrActor = {
        ...prev.entities[currActorKey],
    };
    let draftNextActor = {
        ...prev.entities[nextActorKey],
    };

    if (!prev[effectKeys.SEVERED_TIME]) {
        // Mana Overflow
        if (
            draftCurrActor.resources.manaOverflow > 0 &&
            !draftCurrActor.states.dimmingDarkness &&
            prev[effectKeys.RUNIC_ARRAY] <= 0
        ) {
            draftCurrActor = takeDamage(
                draftCurrActor,
                draftCurrActor.resources.manaOverflow,
                dmgTypes.TRUE,
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
    }

    // Laser used
    draftCurrActor = {
        ...draftCurrActor,
        lasersUsedThisTurn: 0,
    };

    // add death check later

    const newQueue = prev.playerQueue.slice(1);

    return processDeathCheck({
        ...prev,
        playerQueue: newQueue,
        status: turnStatus.ROUND_TRANSITION, // advances to the next round phase
        entities: {
            ...prev.entities,
            [currActorKey]: {
                ...draftCurrActor,
            },
            [nextActorKey]: {
                ...draftNextActor,
            },
        },
    });
}

export function buildRoundQueue(prev) {
    const currIndex = prev.roundIndex;
    const newQueue = prev.roundQueue
        ? [...prev.roundQueue.slice(0, currIndex + 1)]
        : [];

    const p1 = prev.entities[entityKeys.PLAYER_ONE];
    const p2 = prev.entities[entityKeys.PLAYER_TWO];

    const currentActivePhase = newQueue[currIndex];

    // Round Start
    if (!newQueue.includes(roundPhases.ROUND_START)) {
        newQueue.push(roundPhases.ROUND_START);
    }

    // Immediate Emanation trigger on special conditions
    if (
        (p1.states[effectKeys.ABANDONED_BY_GRACE] ||
            p2.states[effectKeys.ABANDONED_BY_GRACE]) &&
        !p1.states[effectKeys.ANOINTED_PROXY] &&
        !p2.states[effectKeys.ANOINTED_PROXY]
    ) {
        newQueue.push(roundPhases.SPECIAL_EMINENCE_TURN);
    }

    // Proxy insertion
    if (
        p1.states[effectKeys.ANOINTED_PROXY] &&
        currentActivePhase !== roundPhases.PLAYER_ONE_TURN
    ) {
        newQueue.push(roundPhases.PLAYER_ONE_TURN);
    }
    if (
        p2.states[effectKeys.ANOINTED_PROXY] &&
        currentActivePhase !== roundPhases.PLAYER_TWO_TURN
    ) {
        newQueue.push(roundPhases.PLAYER_TWO_TURN);
    }

    // Immediate Mana Siphon trigger on special conditions
    if (
        p1[effectKeys.MANA] +
            p2[effectKeys.MANA] +
            p1.resources[effectKeys.MANA_OVERFLOW] +
            p2.resources[effectKeys.MANA_OVERFLOW] >
            0 &&
        prev[effectKeys.RUNIC_ARRAY] > 0
    ) {
        newQueue.push(roundPhases.MINI_ARRAY_TURN);
    }

    const players =
        prev.startingPlayer === entityKeys.PLAYER_ONE
            ? [
                  [roundPhases.PLAYER_ONE_TURN, roundPhases.P1_STARS_TURN, p1],
                  [roundPhases.PLAYER_TWO_TURN, roundPhases.P2_STARS_TURN, p2],
              ]
            : [
                  [roundPhases.PLAYER_TWO_TURN, roundPhases.P2_STARS_TURN, p2],
                  [roundPhases.PLAYER_ONE_TURN, roundPhases.P1_STARS_TURN, p1],
              ];

    let futurePulsesAvailable = prev[effectKeys.RUNIC_ARRAY];

    for (let i = 0; i < players.length; i++) {
        let value = players[i];

        const turnIndex = newQueue.indexOf(value[0]);
        const pulseAlreadyLockedIn =
            turnIndex !== -1 &&
            newQueue
                .slice(turnIndex + 1, currIndex + 1)
                .includes(roundPhases.ARRAY_TURN);
        const isPastTurn =
            turnIndex !== -1 && turnIndex < currIndex && pulseAlreadyLockedIn;

        if (!newQueue.includes(value[0])) {
            newQueue.push(value[0]);
        }

        const hasStars = coloredStars.some(
            (curr) => value[2].stars[curr.star] > 0,
        );
        const hasTrails = coloredStars.some(
            (curr) => value[2].stars[curr.trail] > 0,
        );

        if (
            !newQueue.includes(value[1]) &&
            value[2].states[effectKeys.STARGAZER] &&
            (hasStars || hasTrails)
        ) {
            newQueue.push(value[1]);
        }

        if (!isPastTurn && futurePulsesAvailable > 0) {
            newQueue.push(roundPhases.ARRAY_TURN);
            futurePulsesAvailable--;
        }
    }

    // Moon Phase
    if (
        (p1.states[effectKeys.SELENIAN] || p2.states[effectKeys.SELENIAN]) &&
        !newQueue.includes(roundPhases.MOON_TURN)
    ) {
        newQueue.push(roundPhases.MOON_TURN);
    }

    // Moon Phase
    if (
        (p1.states[effectKeys.SELENIAN] || p2.states[effectKeys.SELENIAN]) &&
        !newQueue.includes(roundPhases.MOON_TURN)
    ) {
        newQueue.push(roundPhases.MOON_TURN);
    }

    // Emanation
    if (
        (p1.states[effectKeys.ASCENDENCE_OF_SPIRIT] ||
            p2.states[effectKeys.ASCENDENCE_OF_SPIRIT]) &&
        !newQueue.includes(roundPhases.EMINENCE_TURN)
    ) {
        newQueue.push(roundPhases.EMINENCE_TURN);
    }

    // Round End
    if (!newQueue.includes(roundPhases.ROUND_END)) {
        newQueue.push(roundPhases.ROUND_END);
    }

    return processDeathCheck({
        ...prev,
        roundQueue: newQueue,
    });
}

export function processManaSiphon(prev) {
    let playerOne = prev.entities[entityKeys.PLAYER_ONE];
    let playerTwo = prev.entities[entityKeys.PLAYER_TWO];

    // Convert mana
    const p1NewManaShackle =
        playerOne[effectKeys.MANA] +
        playerOne.resources[effectKeys.SHACKLED_MANA] +
        playerOne.resources[effectKeys.MANA_OVERFLOW];
    const p2NewManaShackle =
        playerTwo[effectKeys.MANA] +
        playerTwo.resources[effectKeys.SHACKLED_MANA] +
        playerTwo.resources[effectKeys.MANA_OVERFLOW];

    playerOne = {
        ...playerOne,
        [effectKeys.MANA]: 0,
        resources: {
            ...playerOne.resources,
            [effectKeys.MANA_OVERFLOW]: 0,
            [effectKeys.SHACKLED_MANA]: p1NewManaShackle,
        },
    };

    playerTwo = {
        ...playerTwo,
        [effectKeys.MANA]: 0,
        resources: {
            ...playerTwo.resources,
            [effectKeys.MANA_OVERFLOW]: 0,
            [effectKeys.SHACKLED_MANA]: p2NewManaShackle,
        },
    };

    return processDeathCheck({
        ...prev,
        status: turnStatus.ROUND_TRANSITION,
        entities: {
            ...prev.entities,
            [entityKeys.PLAYER_ONE]: { ...playerOne },
            [entityKeys.PLAYER_TWO]: { ...playerTwo },
        },
    });
}

export function processAnnoitement(prev) {
    let playerOne = prev.entities[entityKeys.PLAYER_ONE];
    let playerTwo = prev.entities[entityKeys.PLAYER_TWO];

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

                playerOne = {
                    ...playerOne,
                    [effectKeys.TARNISHED_SIN]: 0,
                };

                playerTwo = exitAllStates(playerTwo);
                playerTwo = consumeResources(
                    playerTwo,
                    Infinity,
                    actionKeys.JUDGEMENT,
                ).draftEntity;

                playerTwo = {
                    ...playerTwo,
                    [effectKeys.TARNISHED_SIN]: 0,
                };
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

        // add death check later

        return processDeathCheck({
            ...prev,
            [effectKeys.EYE_OF_HEAVENS]: eyeKeys.OPEN,
            status: turnStatus.ROUND_TRANSITION,
            entities: {
                ...prev.entities,
                [entityKeys.PLAYER_ONE]: { ...playerOne },
                [entityKeys.PLAYER_TWO]: { ...playerTwo },
            },
        });
    }

    return processDeathCheck({
        ...prev,
        status: turnStatus.ROUND_TRANSITION,
    });
}

export function processEmanation(prev) {
    let playerOne = prev.entities[entityKeys.PLAYER_ONE];
    let playerTwo = prev.entities[entityKeys.PLAYER_TWO];

    // Disables itself if no ascended players
    if (
        !playerOne.states[effectKeys.ASCENDENCE_OF_SPIRIT] &&
        !playerTwo.states[effectKeys.ASCENDENCE_OF_SPIRIT]
    ) {
        return processDeathCheck({
            ...prev,
            eyeOfHeavens: eyeKeys.DORMANT,
            [effectKeys.SEVERED_TIME]: false,
            status: turnStatus.ROUND_TRANSITION,
        });
    }

    // else, runs current state logic
    let severedTime = prev[effectKeys.SEVERED_TIME];
    if (prev[effectKeys.EYE_OF_HEAVENS] === eyeKeys.CLOSED) {
        // When opening, grants Revelation and disables severed time
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

        severedTime = false;
    }

    // Switchs state
    const nextEye =
        prev.eyeOfHeavens === eyeKeys.OPEN ? eyeKeys.CLOSED : eyeKeys.OPEN;

    // Add death check later

    return processDeathCheck({
        ...prev,
        eyeOfHeavens: nextEye,
        [effectKeys.SEVERED_TIME]: severedTime,
        status: turnStatus.ROUND_TRANSITION,
        entities: {
            ...prev.entities,
            [entityKeys.PLAYER_ONE]: { ...playerOne },
            [entityKeys.PLAYER_TWO]: { ...playerTwo },
        },
    });
}

export function processRunicPulse(prev) {
    let playerOne = prev.entities[entityKeys.PLAYER_ONE];
    let playerTwo = prev.entities[entityKeys.PLAYER_TWO];

    // Decrease Array duration if not on severed time
    const newArray = !prev[effectKeys.SEVERED_TIME]
        ? prev[effectKeys.RUNIC_ARRAY] - 1
        : prev[effectKeys.RUNIC_ARRAY];

    // If Array dying, redistribute mana
    if (newArray <= 0) {
        const totalShackledMana =
            playerOne.resources[effectKeys.SHACKLED_MANA] +
            playerTwo.resources[effectKeys.SHACKLED_MANA];
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
        // else, grants shackled mana
        playerOne = {
            ...playerOne,
            resources: {
                ...playerOne.resources,
                [effectKeys.SHACKLED_MANA]:
                    playerOne.resources[effectKeys.SHACKLED_MANA] +
                    constants.MANA_SHACKLE_TURN_GAIN,
            },
        };

        playerTwo = {
            ...playerTwo,
            resources: {
                ...playerTwo.resources,
                [effectKeys.SHACKLED_MANA]:
                    playerTwo.resources[effectKeys.SHACKLED_MANA] +
                    constants.MANA_SHACKLE_TURN_GAIN,
            },
        };
    }

    return processDeathCheck({
        ...prev,
        [effectKeys.RUNIC_ARRAY]: newArray,
        status: turnStatus.ROUND_TRANSITION,
        entities: {
            ...prev.entities,
            [entityKeys.PLAYER_ONE]: { ...playerOne },
            [entityKeys.PLAYER_TWO]: { ...playerTwo },
        },
    });
}

export function processStarfallTurn(prev, masterKey, nonMasterKey) {
    let master = { ...prev.entities[masterKey] };
    let nonMaster = { ...prev.entities[nonMasterKey] };

    const currentPhase = prev.starQueue[0];
    const newQueue = prev.starQueue.slice(1);

    const context = {
        prev,
        masterKey,
        nonMasterKey,
        master,
        nonMaster,
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

    
    // exit condition: If there's no trails at violet starfall, skip trails
    const hasTrails = coloredStars.some(
        (curr) => master.stars[curr.trail] > 0,
    );

    if (!hasTrails && currentPhase === starfallPhases.VIOLET_STAR) {
        return processDeathCheck({
            ...prev,
            starQueue: null,
            status: turnStatus.ROUND_TRANSITION, // advances to the next round phase
            entities: {
                ...prev.entities,
                [masterKey]: master,
                [nonMasterKey]: nonMaster,
            },
        });
    }

    // else, continue to next starfall
    return processDeathCheck({
        ...prev,
        starQueue: newQueue,
        status: turnStatus.STARFALL_TRANSITION,
        entities: {
            ...prev.entities,
            [masterKey]: master,
            [nonMasterKey]: nonMaster,
        },
    });
}

export function processMoonPhase(prev) {
    const players = [entityKeys.PLAYER_ONE, entityKeys.PLAYER_TWO];

    let newGameState = { ...prev };

    for (let p of players) {
        let draftEntity = {
            ...newGameState.entities[p],
        };

        const moon = draftEntity[effectKeys.MIRRORED_MOON];
        let newMoon = moon;
        if (newGameState[effectKeys.SEVERED_TIME]) {
            if (moon === moonKeys.CORONAL) {
                newMoon = moonKeys.WANING;
            } else if (moon === moonKeys.BLOODSTAINED) {
                newMoon = moonKeys.WAXING;
            }
        } else {
            if (
                moon === moonKeys.HIDDEN ||
                moon === moonKeys.WANING ||
                moon === moonKeys.CORONAL
            ) {
                newMoon = moonKeys.WAXING;
            } else if (
                moon === moonKeys.BLOODSTAINED ||
                moon === moonKeys.WAXING
            ) {
                newMoon = moonKeys.WANING;
            }
        }

        let newMoonlight = draftEntity[effectKeys.MOONLIGHT];

        // Moonlight gain
        if (moon === moonKeys.BLOODSTAINED || moon === moonKeys.CORONAL) {
            newMoonlight += constants.BLOOD_CORONA_ML_GAIN;
        }
        if (moon === moonKeys.HIDDEN) {
            newMoonlight += constants.HIDDEN_MOON_ML_GAIN;
        }
        if (isElementActive(draftEntity, elementalKeys.ALBEDO)) {
            newMoonlight += constants.ALBEDO_ML_GAIN;
        }

        draftEntity = {
            ...draftEntity,
            [effectKeys.MOONLIGHT]: newMoonlight,
            [effectKeys.MIRRORED_MOON]: newMoon,
        };

        // Tears converison
        if (draftEntity[effectKeys.MOONLIT_TEARS] > 0) {
            draftEntity = {
                ...draftEntity,
                [effectKeys.MOONLIGHT]: draftEntity[effectKeys.MOONLIGHT] + 1,
                [effectKeys.MOONLIT_TEARS]:
                    draftEntity[effectKeys.MOONLIT_TEARS] - 1,
            };
        }

        newGameState = {
            ...newGameState,
            entities: {
                ...newGameState.entities,
                [p]: draftEntity,
            },
        };
    }

    return processDeathCheck({
        ...newGameState,
        status: turnStatus.ROUND_TRANSITION,
    });
}
