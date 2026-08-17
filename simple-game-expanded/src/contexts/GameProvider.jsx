/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import {
    createBaseEntity,
    distributePoints,
    getCurrActivePlayer,
    getEntityElement,
    isElementActive,
    processDeathCheck,
    processHealth,
    resetPlayerEntity,
    translateElementIntoCrystals,
} from "../utils/entities";
import {
    aiKeys,
    effectKeys,
    elementalKeys,
    entityKeys,
    eventKeys,
    playerTurnPhases,
    roundPhases,
    sdmKeys,
    starfallPhases,
    turnStatus,
    whoStartsKeys,
} from "../utils/enums";
import {
    CHECKPOINT_STATES,
    coloredStars,
    INITIAL_GAME_STATE,
    presetAi,
} from "../utils/constants";
import {
    buildHistory,
    buildRoundQueue,
    commitTurn,
    processActionUse,
    processMoonPhase,
    processPlan,
    processSingularity,
    processStarfallTurn,
    processUpkeep,
} from "../utils/turnManagement";
import { centralAIManagement, setConstellation } from "../utils/aiControllers";
import { GameContext } from "./GameContext";
import { simulateFullStarfall } from "../utils/starfall";

// Auxiliary Functions
function resetGameState(prev) {
    const playerOne = resetPlayerEntity(prev, entityKeys.PLAYER_ONE);
    const playerTwo = resetPlayerEntity(prev, entityKeys.PLAYER_TWO);

    return {
        ...prev,
        status: turnStatus.SETUP,
        nextStatus: null,
        lastPlayerTurn: null,
        roundCount: 0,
        starQueue: null,
        playerQueue: null,
        roundQueue: null,
        roundIndex: 0,
        history: [],
        simGame: null,
        paused: false,

        entities: {
            [entityKeys.PLAYER_ONE]: playerOne,
            [entityKeys.PLAYER_TWO]: playerTwo,
        },
    };
}

export default function GameProvider({ children }) {
    // Declare Game State
    const [game, setGame] = useState(() => {
        // try getting saved data
        try {
            const savedData = localStorage.getItem("gameCheckpoint");
            if (savedData) {
                let savedGame = {
                    ...INITIAL_GAME_STATE,
                    ...JSON.parse(savedData),
                };

                const toBeResetStatus = [
                    turnStatus.VICTORY,
                    turnStatus.DRAW,
                    turnStatus.DEFEAT,
                ];

                // Reset game if it's finished
                if (toBeResetStatus.includes(savedGame.status)) {
                    savedGame = resetGameState(savedGame);
                } else {
                    savedGame = {
                        ...savedGame,
                        paused: true,
                    };
                }

                return savedGame;
            }
        } catch (error) {
            console.error("Failed to load saved game data:", error);
        }

        // Fallback if load fails
        return INITIAL_GAME_STATE;
    });

    // === Handles ===
    function handleAction(action, agentKey, nonAgentKey) {
        console.log(`${agentKey} Used: ${action}`);
        setGame((prev) => {
            const currPhase =
                prev.roundQueue && prev.roundQueue[prev.roundIndex];
            const isSingularity =
                currPhase === roundPhases.P1_SINGULARITY ||
                currPhase === roundPhases.P2_SINGULARITY;

            const processedAction = {
                ...processActionUse(prev, agentKey, nonAgentKey, action),
                simGame: null,
            };

            const newGameState = isSingularity
                ? processSingularity(processedAction, agentKey, action)
                : processPlan(processedAction, action);

            return {
                ...newGameState,
                paused: false,
            };
        });
    }

    function handleDistributionModeChange(newMode, entityKey) {
        setGame((prev) => ({
            ...prev,
            entities: {
                ...prev.entities,
                [entityKey]: {
                    ...distributePoints(
                        { ...prev.entities[entityKey] },
                        newMode,
                        presetAi[prev.entities[entityKey].controller].best,
                    ),
                    controller: prev.entities[entityKey].controller,
                    statDistributionMode: newMode,
                },
            },
        }));
    }

    const handleAiChange = (controllerKey, entityKey) => {
        setGame((prev) => {
            const currentMode = prev.entities[entityKey].statDistributionMode;

            let updatedEntity = {
                ...prev.entities[entityKey],
                controller: controllerKey,
            };

            if (currentMode === sdmKeys.BEST) {
                if (controllerKey === aiKeys.HUMAN) {
                    updatedEntity = {
                        ...updatedEntity,
                        ...distributePoints(
                            updatedEntity,
                            sdmKeys.CUSTOM,
                            presetAi[controllerKey].best,
                        ),
                        statDistributionMode: sdmKeys.CUSTOM,
                    };
                } else {
                    updatedEntity = {
                        ...updatedEntity,
                        ...distributePoints(
                            updatedEntity,
                            currentMode,
                            presetAi[controllerKey].best,
                        ),
                    };
                }
            }

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [entityKey]: updatedEntity,
                },
            };
        });
    };

    function handleResetGame() {
        setGame((prev) => {
            return resetGameState(prev);
        });
    }

    function handleHardResetGame() {
        setGame({ ...INITIAL_GAME_STATE });
    }

    function handleStart() {
        setGame((prev) => {
            const startingPlayer =
                prev.whoStarts === whoStartsKeys.PLAYER_ONE ||
                (Math.random() < 0.5 && prev.whoStarts === whoStartsKeys.RANDOM)
                    ? entityKeys.PLAYER_ONE
                    : entityKeys.PLAYER_TWO;

            return buildHistory(
                {
                    ...prev,
                    status: turnStatus.ONGOING,
                    startingPlayer: startingPlayer,
                },
                eventKeys.BATTLE_START,
            );
        });
    }

    function handleWhoStartsChange(value) {
        setGame((prev) => ({
            ...prev,
            whoStarts: value,
        }));
    }

    function handleStarChange(targetKey, starKey, value) {
        setGame((prev) => {
            const currWhite =
                prev.entities[targetKey].stars[effectKeys.WHITE_STAR];
            const currColor = prev.entities[targetKey].stars[starKey];

            const spent = Math.min(currWhite, Math.max(-currColor, value));

            const newWhite = currWhite - spent;
            const newColor = currColor + spent;

            const newGame = {
                ...prev,
                entities: {
                    ...prev.entities,
                    [targetKey]: {
                        ...prev.entities[targetKey],
                        stars: {
                            ...prev.entities[targetKey].stars,
                            [effectKeys.WHITE_STAR]: newWhite,
                            [starKey]: newColor,
                        },
                    },
                },
            };

            return buildRoundQueue(newGame);
        });
    }

    function handleProgressToggle() {
        setGame((prev) => {
            if (prev.status !== turnStatus.SETUP) {
                return prev;
            }

            if (prev[effectKeys.PROGRESSION_MODE]) {
                return {
                    ...prev,
                    progressMode: false,
                };
            } else {
                return {
                    ...prev,
                    progressMode: true,
                    whoStarts: whoStartsKeys.PLAYER_TWO,
                    entities: {
                        ...prev.entities,
                        [entityKeys.PLAYER_ONE]: {
                            ...prev.entities[entityKeys.PLAYER_ONE],
                            controller: aiKeys.HUMAN,
                            statDistributionMode:
                                prev.entities[entityKeys.PLAYER_ONE]
                                    .statDistributionMode === sdmKeys.BEST
                                    ? sdmKeys.CUSTOM
                                    : prev.entities[entityKeys.PLAYER_ONE]
                                          .statDistributionMode,
                        },
                        [entityKeys.PLAYER_TWO]: {
                            ...distributePoints(
                                createBaseEntity(),
                                sdmKeys.BEST,
                                presetAi[aiKeys.SIMPLE].best,
                            ),
                            controller: aiKeys.SIMPLE,
                            statDistributionMode: sdmKeys.BEST,
                        },
                    },
                };
            }
        });
    }

    function handleRandomizeStats(entityKey) {
        setGame((prev) => {
            let draftEntity = prev.entities[entityKey];

            draftEntity = distributePoints(
                draftEntity,
                draftEntity.statDistributionMode,
                presetAi[draftEntity.controller].best,
                true,
            );

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [entityKey]: {
                        ...draftEntity,
                    },
                },
            };
        });
    }

    function handleElementChange(entityKey, element) {
        setGame((prev) => {
            const currElements =
                prev.entities[entityKey][effectKeys.ELEMENTAL_CRYSTALS];

            let newElements = [...currElements];
            let draftEntity = {
                ...prev.entities[entityKey],
            };

            // Early return on shattered
            if (isElementActive(draftEntity, elementalKeys.SHATTERED)) {
                return prev;
            }

            // Process element change
            if (!newElements.includes(element)) {
                newElements.push(element);
            } else {
                newElements = newElements.filter((item) => {
                    return item !== element;
                });
            }

            // Process Health after possible Max Health alterations
            draftEntity = processHealth({
                ...draftEntity,
                [effectKeys.ELEMENTAL_CRYSTALS]: newElements,
            });

            return buildHistory(
                {
                    ...prev,
                    entities: {
                        ...prev.entities,
                        [entityKey]: {
                            ...draftEntity,
                        },
                    },
                },
                eventKeys.SET_ELEMENT,
                { player: entityKey },
            );
        });
    }

    function handleUpdateStatsPoints(targetKey, statusKey, value) {
        setGame((prev) => {
            const currUnspent = prev.entities[targetKey].unspentPoints;
            const currAttPoints =
                prev.entities[targetKey].attributes[statusKey].points;

            const spentPoints = Math.min(
                currUnspent,
                Math.max(-currAttPoints, value),
            );
            const newPoints = currUnspent - spentPoints;
            const newAttributePoints = currAttPoints + spentPoints;

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [targetKey]: {
                        ...prev.entities[targetKey],
                        unspentPoints: newPoints,
                        attributes: {
                            ...prev.entities[targetKey].attributes,
                            [statusKey]: {
                                ...prev.entities[targetKey].attributes[
                                    statusKey
                                ],
                                value: newAttributePoints,
                                points: newAttributePoints,
                            },
                        },
                    },
                },
            };
        });
    }

    function handleConstellation(entityKey, constellation) {
        setGame((prev) => {
            let draftEntity = {
                ...prev.entities[entityKey],
            };

            switch (constellation) {
                case effectKeys.AZURE_CONSTELLATION: {
                    // If already Azure, convert all into normal
                    if (draftEntity[effectKeys.AZURE_CONSTELLATION] > 0) {
                        draftEntity = {
                            ...draftEntity,
                            [effectKeys.CONSTELLATION]:
                                draftEntity[effectKeys.CONSTELLATION] +
                                draftEntity[effectKeys.AZURE_CONSTELLATION] +
                                draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                            [effectKeys.AZURE_CONSTELLATION]: 0,
                            [effectKeys.CRIMSON_CONSTELLATION]: 0,
                        };
                    }
                    // if not, convert all into azure
                    else {
                        draftEntity = {
                            ...draftEntity,
                            [effectKeys.CONSTELLATION]: 0,
                            [effectKeys.AZURE_CONSTELLATION]:
                                draftEntity[effectKeys.CONSTELLATION] +
                                draftEntity[effectKeys.AZURE_CONSTELLATION] +
                                draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                            [effectKeys.CRIMSON_CONSTELLATION]: 0,
                        };
                    }
                    break;
                }

                case effectKeys.CRIMSON_CONSTELLATION: {
                    // If already Crimson, convert all into normal
                    if (draftEntity[effectKeys.CRIMSON_CONSTELLATION] > 0) {
                        draftEntity = {
                            ...draftEntity,
                            [effectKeys.CONSTELLATION]:
                                draftEntity[effectKeys.CONSTELLATION] +
                                draftEntity[effectKeys.AZURE_CONSTELLATION] +
                                draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                            [effectKeys.AZURE_CONSTELLATION]: 0,
                            [effectKeys.CRIMSON_CONSTELLATION]: 0,
                        };
                    }
                    // if not, convert all into crimson
                    else {
                        draftEntity = {
                            ...draftEntity,
                            [effectKeys.CONSTELLATION]: 0,
                            [effectKeys.AZURE_CONSTELLATION]: 0,
                            [effectKeys.CRIMSON_CONSTELLATION]:
                                draftEntity[effectKeys.CONSTELLATION] +
                                draftEntity[effectKeys.AZURE_CONSTELLATION] +
                                draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                        };
                    }
                    break;
                }
                // by default, convert all into normal
                default: {
                    draftEntity = {
                        ...draftEntity,
                        [effectKeys.CONSTELLATION]:
                            draftEntity[effectKeys.CONSTELLATION] +
                            draftEntity[effectKeys.AZURE_CONSTELLATION] +
                            draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                        [effectKeys.AZURE_CONSTELLATION]: 0,
                        [effectKeys.CRIMSON_CONSTELLATION]: 0,
                    };
                }
            }

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [entityKey]: {
                        ...draftEntity,
                    },
                },
            };
        });
    }

    function handlePause() {
        setGame((prev) => {
            return {
                ...prev,
                paused: !prev?.paused,
            };
        });
    }

    // === Efeitos ===
    // Turn Management
    useEffect(() => {
        if (game.paused) {
            return;
        }

        if (game.status === turnStatus.ONGOING) {
            // Rebuilds the queue
            let gameState = {
                ...game,
                roundIndex: game.roundIndex ? game.roundIndex : 0,
            };
            gameState = buildRoundQueue(gameState);

            // Grab current phase
            const currPhase = gameState.roundQueue[gameState.roundIndex];
            let targetKey = null;
            let nonTargetKey = null;
            let nextState = null;
            let delayAmount = 0;
            let historyKey = null;

            switch (currPhase) {
                case roundPhases.ROUND_START: {
                    nextState = {
                        ...gameState,
                        roundCount: gameState.roundCount + 1,
                        roundIndex: gameState.roundIndex + 1,
                    };
                    delayAmount = gameState.roundCount > 0 ? 600 : 0;
                    historyKey = eventKeys.ROUND_START;
                    break;
                }

                case roundPhases.MOON_TURN: {
                    nextState = processMoonPhase(gameState);
                    delayAmount = 1200;
                    historyKey = eventKeys.MOON_PHASE;
                    break;
                }

                case roundPhases.P1_STARS_TURN: {
                    targetKey = entityKeys.PLAYER_ONE;
                    nonTargetKey = entityKeys.PLAYER_TWO;
                    historyKey = null;
                    break;
                }

                case roundPhases.P2_STARS_TURN: {
                    targetKey = entityKeys.PLAYER_TWO;
                    nonTargetKey = entityKeys.PLAYER_ONE;
                    historyKey = null;
                    break;
                }

                case roundPhases.PLAYER_ONE_TURN: {
                    targetKey = entityKeys.PLAYER_ONE;
                    nonTargetKey = entityKeys.PLAYER_TWO;
                    historyKey = null;
                    break;
                }

                case roundPhases.PLAYER_TWO_TURN: {
                    targetKey = entityKeys.PLAYER_TWO;
                    nonTargetKey = entityKeys.PLAYER_ONE;
                    historyKey = null;
                    break;
                }

                case roundPhases.ROUND_END: {
                    nextState = {
                        ...gameState,
                        roundIndex: 0,
                    };
                    delayAmount = 600;
                    historyKey = null;
                    break;
                }
            }

            // starfall
            if (
                !nextState &&
                (currPhase === roundPhases.P1_STARS_TURN ||
                    currPhase === roundPhases.P2_STARS_TURN)
            ) {
                if (!gameState.starQueue) {
                    const newQueue = Object.values(starfallPhases);
                    nextState = {
                        ...gameState,
                        starQueue: newQueue,
                    };
                    historyKey = eventKeys.STARFALL_START;
                } else {
                    nextState = processStarfallTurn(
                        gameState,
                        targetKey,
                        nonTargetKey,
                    );
                }
            }

            // player turn
            if (
                !nextState &&
                (currPhase === roundPhases.PLAYER_ONE_TURN ||
                    currPhase === roundPhases.PLAYER_TWO_TURN)
            ) {
                if (
                    !gameState.playerQueue ||
                    gameState.playerQueue.length === 0
                ) {
                    nextState = {
                        ...gameState,
                        playerQueue: Object.values(playerTurnPhases),
                    };
                    historyKey = eventKeys.PLAYER_TURN_START;
                } else {
                    const currPlayerPhase = gameState.playerQueue[0];

                    if (currPlayerPhase === playerTurnPhases.UPKEEP) {
                        nextState = processUpkeep(
                            gameState,
                            targetKey,
                            nonTargetKey,
                        );
                        delayAmount = 0;
                    }

                    if (currPlayerPhase === playerTurnPhases.COMMIT) {
                        const currEntity = game?.entities?.[targetKey];
                        const willTriggerRevelevantTurnEndEffects =
                            currEntity &&
                            (currEntity.resources[effectKeys.RADIANCE] > 0 ||
                                currEntity.resources[effectKeys.MOONSHINE] >
                                    0 ||
                                currEntity.resources[effectKeys.MANA_OVERFLOW] >
                                    0);

                        nextState = commitTurn(
                            gameState,
                            targetKey,
                            nonTargetKey,
                        );
                        delayAmount = willTriggerRevelevantTurnEndEffects
                            ? 800
                            : 0;
                    }
                }
            }

            // Fallback
            if (!nextState) {
                nextState = game;
            }

            // History
            nextState = buildHistory(buildRoundQueue(nextState), historyKey, {
                player: targetKey,
            });

            // Clear Sim
            nextState = {
                ...nextState,
                simGame: null,
            };

            const timer = setTimeout(() => {
                setGame(nextState);
            }, delayAmount);

            return () => {
                if (timer) {
                    clearTimeout(timer);
                }
            };
        }
    }, [
        game.status,
        game.roundIndex,
        game.playerQueue,
        game.starQueue,
        game.paused,
    ]);

    // AI turn
    useEffect(() => {
        if (game.paused || game.status !== turnStatus.ONGOING) {
            return;
        }

        const currPhase =
            game.roundQueue && game.roundQueue.length > 0
                ? game.roundQueue[game.roundIndex]
                : null;

        const isSingularity =
            currPhase === roundPhases.P1_SINGULARITY ||
            currPhase === roundPhases.P2_SINGULARITY;
        if (
            currPhase !== roundPhases.PLAYER_ONE_TURN &&
            currPhase !== roundPhases.PLAYER_TWO_TURN &&
            !isSingularity
        ) {
            return;
        }

        const targetKey = getCurrActivePlayer(game);
        const nonTargetKey =
            targetKey === entityKeys.PLAYER_ONE
                ? entityKeys.PLAYER_TWO
                : entityKeys.PLAYER_ONE;

        const activePlayer = game.entities[targetKey];
        const currentSubPhase =
            game.playerQueue && game.playerQueue.length > 0
                ? game.playerQueue[0]
                : null;

        if (
            (currentSubPhase === playerTurnPhases.PLAN || isSingularity) &&
            activePlayer.controller !== aiKeys.HUMAN
        ) {
            const aiTimer = setTimeout(() => {
                setGame((prev) => {
                    let newGame = {
                        ...prev,
                    };

                    let draftTarget = {
                        ...prev.entities[targetKey],
                    };

                    const {
                        assignedStars,
                        selectedElement,
                        action,
                        selectedConstellation,
                    } = centralAIManagement(prev, targetKey, nonTargetKey);

                    console.log(`${targetKey} has used ${action}`);

                    // Process Element
                    if (
                        !isElementActive(
                            draftTarget,
                            elementalKeys.SHATTERED,
                        ) &&
                        draftTarget.states[effectKeys.SELENIAN]
                    ) {
                        // Translate combined elements into their base crystal components
                        const crystals =
                            translateElementIntoCrystals(selectedElement);

                        draftTarget = {
                            ...draftTarget,
                            [effectKeys.ELEMENTAL_CRYSTALS]: crystals,
                        };

                        // Run processHealth
                        draftTarget = processHealth(draftTarget);

                        newGame = {
                            ...newGame,
                            entities: {
                                ...prev.entities,
                                [targetKey]: draftTarget,
                            },
                        };
                    }

                    // Process Stars
                    const colors = Object.values(coloredStars).map(
                        (starType) => {
                            return starType.star;
                        },
                    );

                    const currentStars = draftTarget.stars;

                    // Convert all active colored stars back to the white star pool
                    let returnedToWhite = 0;
                    colors.forEach((color) => {
                        returnedToWhite += currentStars[color];
                    });

                    let newWhite =
                        currentStars[effectKeys.WHITE_STAR] + returnedToWhite;

                    // Create reset stars state
                    let newStars = {
                        ...currentStars,
                        [effectKeys.WHITE_STAR]: newWhite,
                    };

                    colors.forEach((color) => {
                        newStars = {
                            ...newStars,
                            [color]: 0,
                        };
                    });

                    colors.forEach((color) => {
                        const amount = assignedStars[color];

                        const actualAllocated = Math.min(
                            newStars[effectKeys.WHITE_STAR],
                            amount,
                        );

                        newStars = {
                            ...newStars,
                            [effectKeys.WHITE_STAR]:
                                newStars[effectKeys.WHITE_STAR] -
                                actualAllocated,
                            [color]: newStars[color] + actualAllocated,
                        };
                    });

                    newGame = {
                        ...newGame,
                        entities: {
                            ...prev.entities,
                            [targetKey]: {
                                ...draftTarget,
                                stars: newStars,
                            },
                        },
                    };

                    // Process Constellation
                    newGame = setConstellation(
                        newGame,
                        targetKey,
                        selectedConstellation,
                    );

                    // History
                    if (getEntityElement(activePlayer) !== selectedElement) {
                        newGame = buildHistory(newGame, eventKeys.SET_ELEMENT, {
                            player: targetKey,
                        }); // Element Change
                    }

                    // Use Action
                    const currPhase =
                        prev.roundQueue && prev.roundQueue[prev.roundIndex];
                    const isSingularity =
                        currPhase === roundPhases.P1_SINGULARITY ||
                        currPhase === roundPhases.P2_SINGULARITY;

                    newGame = processActionUse(
                        newGame,
                        targetKey,
                        nonTargetKey,
                        action,
                    );

                    newGame = isSingularity
                        ? processSingularity(newGame, targetKey, action)
                        : processPlan(newGame, action);

                    return newGame;
                });
            }, 1200);

            return () => clearTimeout(aiTimer);
        }
    }, [
        game.status,
        game.roundIndex,
        game.playerQueue,
        game.entities,
        game.paused,
        game.roundQueue,
    ]);

    // Round Transition
    useEffect(() => {
        if (game.paused) {
            return;
        }

        if (game.status === turnStatus.ROUND_TRANSITION) {
            const timer = setTimeout(() => {
                setGame((prev) => ({
                    ...prev,
                    status: turnStatus.ONGOING,
                    roundIndex: prev.roundIndex + 1,
                }));
            }, 900);

            return () => clearTimeout(timer);
        }
    }, [game.status, game.paused]);

    // Starfall Transition
    useEffect(() => {
        if (game.paused) {
            return;
        }

        if (game.status === turnStatus.STARFALL_TRANSITION) {
            const timer = setTimeout(() => {
                setGame((prev) => ({
                    ...prev,
                    status: turnStatus.ONGOING,
                }));
            }, 700);

            return () => clearTimeout(timer);
        }
    }, [game.status, game.paused]);

    // Save game
    useEffect(() => {
        if (game.paused) {
            return;
        }

        // Saves only if it's a "checkpoint" state
        if (CHECKPOINT_STATES.includes(game.status)) {
            try {
                localStorage.setItem("gameCheckpoint", JSON.stringify(game));
                console.log("Game Saved!");
            } catch (error) {
                console.error("Failed to save game checkpoint:", error);
            }
        }
    }, [game]);

    // Event Listeners
    useEffect(() => {
        function handleKeyDown(e) {
            if (
                (e.code === "Space" || e.key === " ") &&
                game.status !== turnStatus.SETUP
            ) {
                e.preventDefault();
                setGame((prev) => {
                    return {
                        ...prev,
                        paused: !prev?.paused,
                    };
                });
            }

            if (e.key === "Shift") {
                if (e.repeat) {
                    return;
                }

                e.preventDefault();
                setGame((prev) => {
                    return {
                        ...prev,
                        simSpecs: {
                            ...prev.simSpecs,
                            commit: true,
                            starfall: true,
                        },
                    };
                });
            }
        }

        function handleKeyUp(e) {
            if (e.key === "Shift") {
                e.preventDefault();
                setGame((prev) => {
                    return {
                        ...prev,
                        simSpecs: {
                            ...prev.simSpecs,
                            commit: false,
                            starfall: false,
                        },
                    };
                });
            }
        }

        function handleBlur() {
            setGame((prev) => ({
                ...prev,
                paused: game.status !== turnStatus.SETUP ? true : prev.paused,
                simSpecs: {
                    ...prev.simSpecs,
                    commit: false,
                    starfall: false,
                },
            }));
        }

        // Add listeners
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
        };
    }, [game.status]);

    // Update simulation
    const simGame = useMemo(() => {
        let sim = null;

        const agentKey = getCurrActivePlayer(game);
        const nonAgentKey = !agentKey
            ? null
            : agentKey === entityKeys.PLAYER_ONE
              ? entityKeys.PLAYER_TWO
              : entityKeys.PLAYER_ONE;

        if (
            !agentKey ||
            !nonAgentKey ||
            !(
                game?.entities?.[agentKey]?.[effectKeys.CONTROLLER] ===
                aiKeys.HUMAN
            ) ||
            !(game?.playerQueue?.[0] === playerTurnPhases.PLAN)
        ) {
            return game;
        }

        if (game?.simSpecs?.action) {
            sim = processDeathCheck(
                buildRoundQueue(
                    processActionUse(
                        sim ? sim : game,
                        agentKey,
                        nonAgentKey,
                        game.simSpecs.action,
                    ),
                ),
            );
        }

        if (game?.simSpecs?.commit) {
            sim = buildRoundQueue(
                commitTurn(sim ? sim : game, agentKey, nonAgentKey),
            );
        }

        if (game?.simSpecs?.starfall) {
            sim = buildRoundQueue(
                simulateFullStarfall(sim ? sim : game, agentKey, nonAgentKey),
            );
        }

        return sim;
    }, [game]);

    // Create Context
    const contextValue = useMemo(
        () => ({
            game: {
                ...game,
                simGame,
            },
            setGame,
            handleAction,
            handleAiChange,
            handleConstellation,
            handleDistributionModeChange,
            handleElementChange,
            handleHardResetGame,
            handleProgressToggle,
            handleRandomizeStats,
            handleResetGame,
            handleStarChange,
            handleStart,
            handleUpdateStatsPoints,
            handleWhoStartsChange,
            handlePause,
        }),
        [game, simGame],
    );

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
}
