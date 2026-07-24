import { actionMap, constants, elementsMap } from "./constants.js";
import {
    canUseAction,
    consumeResources,
    gainHp,
    getEntityColoredStars,
    getEntityElement,
    getEntityTotalMana,
    isElementActive,
    loseMana,
    processActionTypeUsed,
    processDeathCheck,
    restoreResources,
    takeDamage,
} from "./entities.js";
import {
    turnStatus,
    entityKeys,
    actionKeys,
    effectKeys,
    dmgTypes,
    starfallPhases,
    moonKeys,
    elementalKeys,
    roundPhases,
    playerTurnPhases,
    eventKeys,
} from "./enums.js";
import { simulators } from "./simulators.js";
import { processROYGBIVStar } from "./starfall.js";

export function processUpkeep(prev, targetKey, nonTargetKey) {
    let draftTarget = {
        ...prev.entities[targetKey],
    };

    let draftNonTarget = {
        ...prev.entities[nonTargetKey],
    };

    // Starflare
    if (draftTarget[effectKeys.STARFLARE] >= constants.MAX_STARFLARE) {
        draftTarget = {
            ...draftTarget,
            [effectKeys.STARFLARE]: 0,
            states: {
                ...draftTarget.states,
                [effectKeys.NOVA]: true,
            },
        };
    }
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

    // Firmament
    if (draftTarget.resources[effectKeys.FIRMAMENT] > 0) {
        const newDome =
            draftTarget.resources[effectKeys.DOME] +
            draftTarget.resources[effectKeys.FIRMAMENT];

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                [effectKeys.DOME]: newDome,
                [effectKeys.FIRMAMENT]: 0,
            },
        };
    }

    // Starlit Heavens
    if (draftTarget.resources[effectKeys.STARLIT_HEAVENS] > 0) {
        const newFirmament =
            draftTarget.resources[effectKeys.FIRMAMENT] +
            draftTarget.resources[effectKeys.STARLIT_HEAVENS];

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                [effectKeys.STARLIT_HEAVENS]: 0,
                [effectKeys.FIRMAMENT]: newFirmament,
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

    // Moon Dew
    if (draftTarget.states[effectKeys.MOON_DEW]) {
        draftTarget = restoreResources(
            draftTarget,
            draftTarget[effectKeys.MOONLIGHT],
        );

        draftTarget = {
            ...draftTarget,
            states: {
                ...draftTarget.states,
                [effectKeys.MOON_DEW]: false,
            },
        };
    }

    // Harmony
    if (draftTarget.resources[effectKeys.HARMONY] > 0) {
        draftTarget = restoreResources(
            draftTarget,
            draftTarget.resources[effectKeys.HARMONY],
        );

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                [effectKeys.HARMONY]: 0,
            },
        };
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

    // Shattered
    if (isElementActive(draftTarget, elementalKeys.SHATTERED)) {
        draftTarget = takeDamage(
            draftTarget,
            draftTarget[effectKeys.MOONLIGHT],
            dmgTypes.LUNIC,
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
    if (draftTarget.states[effectKeys.VENTING]) {
        const overheatConsumed = Math.min(
            constants.VENTING_OVERHEAT_LOSS,
            draftTarget[effectKeys.OVERHEAT],
        );

        const newOverheat = draftTarget[effectKeys.OVERHEAT] - overheatConsumed;
        const newDynamo = Math.min(
            constants.MAX_DYNAMO,
            draftTarget[effectKeys.DYNAMO] + overheatConsumed,
        );

        draftTarget = {
            ...draftTarget,
            [effectKeys.OVERHEAT]: newOverheat,
            [effectKeys.DYNAMO]: newDynamo,
            states: {
                ...draftTarget.states,
                [effectKeys.VENTING]: newOverheat > 0,
                [effectKeys.WEAPONS_DEPLOYED]: newOverheat <= 0,
            },
        };
    }

    // Dynamo
    if (draftTarget[effectKeys.DYNAMO] >= constants.MAX_DYNAMO) {
        draftTarget = {
            ...draftTarget,
            [effectKeys.DYNAMO]: 0,
            [effectKeys.ENERGY_LEVEL]: draftTarget[effectKeys.ENERGY_LEVEL] + 1,
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

    // Lunacy
    if (draftTarget[effectKeys.LUNACY] >= constants.MAX_LUNACY) {
        draftTarget = {
            ...draftTarget,
            [effectKeys.ELEMENTAL_CRYSTALS]: [elementalKeys.SHATTERED],
        };
    }

    // Halo
    if (draftTarget.resources.halo > 0) {
        const newSpark = Math.min(
            draftTarget.resources.halo + draftTarget[effectKeys.DIVINE_SPARK],
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

    // Bad Omen
    if (draftTarget[effectKeys.PROPHECY_OF_DOOM] > 0) {
        draftTarget = {
            ...draftTarget,
            [effectKeys.PROPHECY_OF_DOOM]: Math.max(
                0,
                draftTarget[effectKeys.PROPHECY_OF_DOOM] -
                    constants.PROFECY_TURN_END_LOSS,
            ),
        };
    }

    // States cleared at turn start
    draftTarget = {
        ...draftTarget,
        states: {
            ...draftTarget.states,
            [effectKeys.GUARDING_STATE]: false,
            [effectKeys.SACRIFICIAL_STATE]: false,
            [effectKeys.RADIANT]: false,
            [effectKeys.DARK_EMBRACE]: false,
            [effectKeys.DIMMING_DARKNESS]: false,
            [effectKeys.PRISMATIC]: false,
        },
    };

    const newQueue = prev.playerQueue.slice(1);

    return processDeathCheck({
        ...prev,
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

    // Bad Omen
    if (draftCurrActor[effectKeys.BAD_OMEN] > 0) {
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.BAD_OMEN]: Math.max(
                0,
                draftCurrActor[effectKeys.BAD_OMEN] -
                    constants.BAD_OMEN_TURN_END_LOSS,
            ),
        };
    }

    // Mana Overflow
    if (
        draftCurrActor.resources[effectKeys.MANA_OVERFLOW] > 0 &&
        !draftCurrActor.states.dimmingDarkness
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

    // Dissonance
    if (draftCurrActor.resources[effectKeys.DISSONANCE] > 0) {
        draftCurrActor = takeDamage(
            draftCurrActor,
            draftCurrActor.resources[effectKeys.DISSONANCE],
            dmgTypes.TRUE,
        );

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.DISSONANCE]: 0,
            },
        };
    }

    // Radiance
    if (draftCurrActor.resources[effectKeys.RADIANCE] > 0) {
        draftCurrActor = takeDamage(
            draftCurrActor,
            draftCurrActor.resources[effectKeys.RADIANCE],
            dmgTypes.TRUE,
        );

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.RADIANCE]: 0,
            },
        };
    }

    // Nebula
    if (draftCurrActor[effectKeys.NEBULA] > 0) {
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.NEBULA]: 0,
        };
    }

    // Starblight
    if (draftCurrActor[effectKeys.STARBLIGHT] > 0) {
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.STARBLIGHT]: 0,
        };
    }

    // Laser used
    draftCurrActor = {
        ...draftCurrActor,
        lasersUsedThisTurn: 0,
    };

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

    // Round Start
    if (!newQueue.includes(roundPhases.ROUND_START)) {
        newQueue.push(roundPhases.ROUND_START);
    }

    // Player Logic Helper
    const playerLogic = (entityKey, turnKey, starfallKey, singularityKey) => {
        // Player Turn
        if (!newQueue.includes(turnKey)) {
            newQueue.push(turnKey);
        }

        // Starfall
        const player = prev.entities[entityKey];
        const hasStars = getEntityColoredStars(player) > 0;

        if (
            !newQueue.includes(starfallKey) &&
            player.states[effectKeys.STARGAZER] &&
            hasStars
        ) {
            newQueue.push(starfallKey);
        }

        // Singularity
        if (
            !newQueue.includes(singularityKey) &&
            player[effectKeys.GRAVITATION] >= constants.MAX_GRAVITATION
        ) {
            newQueue.push(singularityKey);
        }
    };

    // Player Logic Order
    if (prev.startingPlayer === entityKeys.PLAYER_ONE) {
        playerLogic(
            entityKeys.PLAYER_ONE,
            roundPhases.PLAYER_ONE_TURN,
            roundPhases.P1_STARS_TURN,
            roundPhases.P1_SINGULARITY,
        );

        playerLogic(
            entityKeys.PLAYER_TWO,
            roundPhases.PLAYER_TWO_TURN,
            roundPhases.P2_STARS_TURN,
            roundPhases.P2_SINGULARITY,
        );
    } else {
        playerLogic(
            entityKeys.PLAYER_TWO,
            roundPhases.PLAYER_TWO_TURN,
            roundPhases.P2_STARS_TURN,
            roundPhases.P2_SINGULARITY,
        );

        playerLogic(
            entityKeys.PLAYER_ONE,
            roundPhases.PLAYER_ONE_TURN,
            roundPhases.P1_STARS_TURN,
            roundPhases.P1_SINGULARITY,
        );
    }

    // Moon Phase
    if (
        (p1.states[effectKeys.SELENIAN] || p2.states[effectKeys.SELENIAN]) &&
        !newQueue.includes(roundPhases.MOON_TURN)
    ) {
        newQueue.push(roundPhases.MOON_TURN);
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

export function processStarfallTurn(prev, masterKey, nonMasterKey) {
    const master = { ...prev.entities[masterKey] };

    const currentPhase = prev.starQueue[0];
    const newQueue = prev.starQueue.slice(1);

    // Exit Condition: Is Starfall End
    if (currentPhase === starfallPhases.STARFALL_END) {
        return processDeathCheck({
            ...prev,
            starQueue: null, // clears the queue
            status: turnStatus.ROUND_TRANSITION, // advances to the next round phase
            entities: {
                ...prev.entities,
                [masterKey]: {
                    ...prev.entities[masterKey],
                    states: {
                        ...prev.entities[masterKey].states,
                        [effectKeys.NOVA]: false,
                    },
                },
            },
        });
    }

    let newGameState = {
        ...prev,
        starQueue: newQueue,
        status: turnStatus.STARFALL_TRANSITION,
    };

    switch (currentPhase) {
        case starfallPhases.RED_STAR: {
            if (master.stars[effectKeys.RED_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.RED_STAR,
                );
            }
            break;
        }

        case starfallPhases.ORANGE_STAR: {
            if (master.stars[effectKeys.ORANGE_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.ORANGE_STAR,
                );
            }
            break;
        }

        case starfallPhases.YELLOW_STAR: {
            if (master.stars[effectKeys.YELLOW_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.YELLOW_STAR,
                );
            }
            break;
        }

        case starfallPhases.GREEN_STAR: {
            if (master.stars[effectKeys.GREEN_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.GREEN_STAR,
                );
            }
            break;
        }

        case starfallPhases.BLUE_STAR: {
            if (master.stars[effectKeys.BLUE_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.BLUE_STAR,
                );
            }
            break;
        }

        case starfallPhases.INDIGO_STAR: {
            if (master.stars[effectKeys.INDIGO_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.INDIGO_STAR,
                );
            }
            break;
        }

        case starfallPhases.VIOLET_STAR: {
            if (master.stars[effectKeys.VIOLET_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.VIOLET_STAR,
                );
            }
            break;
        }

        default: {
            break;
        }
    }

    // Process Death Checks
    newGameState = processDeathCheck(newGameState);

    // Death Override
    if (newGameState.status !== turnStatus.STARFALL_TRANSITION) {
        newGameState = {
            ...newGameState,
            starQueue: prev.starQueue,
        };
    }

    return newGameState;
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

        if (
            moon === moonKeys.HIDDEN ||
            moon === moonKeys.WANING ||
            moon === moonKeys.CORONAL
        ) {
            newMoon = moonKeys.WAXING;
        } else if (moon === moonKeys.BLOODSTAINED || moon === moonKeys.WAXING) {
            newMoon = moonKeys.WANING;
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

        // Mycelium restore
        // Mycelium
        if (draftEntity.resources[effectKeys.MYCELIUM] > 0) {
            draftEntity = restoreResources(
                draftEntity,
                draftEntity.resources[effectKeys.MYCELIUM],
            );

            draftEntity = {
                ...draftEntity,
                resources: {
                    ...draftEntity.resources,
                    [effectKeys.MYCELIUM]: 0,
                },
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

export function processActionUse(prev, agentKey, nonAgentKey, action) {
    if (!canUseAction(prev, agentKey, action)) {
        return buildHistory(prev, eventKeys.FAILED_ACTION, {
            player: agentKey,
            action: action,
        });
    }

    // Run the action
    const agent = prev.entities[agentKey];
    const nonAgent = prev.entities[nonAgentKey];

    const context = {
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        prev,
    };

    const sim = simulators[action];
    const simulationResult = sim ? sim(context) : prev;

    // Process effects on Action Type
    let newGameState = processActionTypeUsed(
        simulationResult,
        agentKey,
        nonAgentKey,
        action,
    );

    return buildHistory(newGameState, eventKeys.USE_ACTION, {
        player: agentKey,
        action: action,
    });
}

export function processSingularity(prev, agentKey, action) {
    let newGameState = {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: {
                ...prev.entities[agentKey],
                [effectKeys.GRAVITATION]: 0,
            },
        },
    };

    // Death check
    newGameState = processDeathCheck(newGameState);

    // Determine if PLAN subphase ends or not
    const newStatus =
        (action === actionKeys.LASER || action === actionKeys.CURSE) && // free actions
        newGameState.status === turnStatus.ONGOING // plan subphase ends if something changes status (ex, a player died)
            ? prev.status
            : turnStatus.ROUND_TRANSITION;

    return buildRoundQueue({
        ...newGameState,
        status: newStatus,
    });
}

export function processPlan(prev, action) {
    let newGameState = {
        ...prev,
    };

    // Death check
    newGameState = processDeathCheck(newGameState);

    // Determine if PLAN subphase ends or not
    const newQueue =
        (action === actionKeys.LASER || action === actionKeys.CURSE) && // free actions
        newGameState.status === turnStatus.ONGOING // plan subphase ends if something changes status (ex, a player died)
            ? prev.playerQueue
            : prev.playerQueue.slice(1);

    const newStatus =
        newQueue[0] === playerTurnPhases.COMMIT // guarantee commit always runs after plan subphase ends
            ? turnStatus.ONGOING
            : newGameState.status;

    console.log("plan");
    console.log(newGameState);

    return buildRoundQueue({
        ...newGameState,
        status: newStatus,
        playerQueue: newQueue,
    });
}

export function buildHistory(prev, event, info = {}) {
    const history = [...prev.history];
    const { player, action } = info;

    const playerName = player
        ? player === entityKeys.PLAYER_ONE
            ? "Player One"
            : "Player Two"
        : "";

    let string;
    switch (event) {
        case eventKeys.BATTLE_START:
            string = "Battle Start";
            break;

        case eventKeys.ROUND_START:
            string = `Round ${prev.roundCount} Start`;
            break;

        case eventKeys.PLAYER_TURN_START:
            string = `${playerName}'s Turn Start`;
            break;

        case eventKeys.USE_ACTION: {
            const actionName = actionMap[action].name;
            string = `${playerName} used ${actionName}`;
            break;
        }

        case eventKeys.FAILED_ACTION: {
            const actionName = actionMap[action].name;
            string = `${playerName} failed to use ${actionName}!`;
            break;
        }

        case eventKeys.SET_ELEMENT: {
            const elementName =
                elementsMap[getEntityElement(prev.entities[player])];
            string = `${playerName} set element to ${elementName}`;
            break;
        }

        case eventKeys.STARFALL_START: {
            string = `${playerName}'s Starfall Start`;
            break;
        }

        case eventKeys.MOON_PHASE:
            string = "Moon Phase";
            break;

        default:
            string = "";
            break;
    }

    if (string) {
        history.push(string);
    }

    if (prev.status === turnStatus.DEFEAT) {
        history.push("Player Two Win");
    }
    if (prev.status === turnStatus.VICTORY) {
        history.push("Player One Win");
    }
    if (prev.status === turnStatus.DRAW) {
        history.push("Draw");
    }

    return {
        ...prev,
        history: history,
    };
}
