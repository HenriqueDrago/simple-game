import { useEffect, useState } from "react";
import {
    createBaseEntity,
    distributePoints,
    getEntityElement,
    isElementActive,
    processSilverBlood,
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
    progKeys,
    roundPhases,
    sdmKeys,
    starfallPhases,
    turnStatus,
    whoStartsKeys,
} from "../utils/enums";
import {
    CHECKPOINT_STATES,
    coloredStars,
    constants,
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
import { centralAIManagement } from "../utils/aiControllers";
import { GameContext } from "./GameContext";

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
                }
                // Enables modal if the saved game was ongoing
                else return savedGame;
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

            return buildHistory(newGameState, eventKeys.USE_ACTION, {
                player: agentKey,
                action: action,
            });
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

            if (prev.progressMode) {
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

            draftEntity = processSilverBlood({
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
                                value:
                                    constants.BASE_STATS[statusKey] +
                                    newAttributePoints *
                                        constants.STAT_MULTIPLIERS[statusKey],
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

    function handleCreateSimulatedGame(action, agentKey, nonAgentKey) {
        setGame((prev) => {
            return {
                ...prev,
                simGame: processActionUse(prev, agentKey, nonAgentKey, action),
            };
        });
    }

    function handleClearSimulation() {
        setGame((prev) => {
            return {
                ...prev,
                simGame: null,
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
                                currEntity.resources[effectKeys.MOONDUST] > 0 ||
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
    }, [game.status, game.roundIndex, game.playerQueue, game.starQueue, ]);

    // AI turn
    useEffect(() => {
        if (game.paused || game.status !== turnStatus.ONGOING) {
            return;
        }

        const currPhase =
            game.roundQueue && game.roundQueue.length > 0
                ? game.roundQueue[game.roundIndex]
                : null;
        if (
            currPhase !== roundPhases.PLAYER_ONE_TURN &&
            currPhase !== roundPhases.PLAYER_TWO_TURN
        ) {
            return;
        }

        const targetKey =
            currPhase === roundPhases.PLAYER_ONE_TURN
                ? entityKeys.PLAYER_ONE
                : entityKeys.PLAYER_TWO;
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
            currentSubPhase === playerTurnPhases.PLAN &&
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

                    const { assignedStars, selectedElement, action } =
                        centralAIManagement(prev, targetKey, nonTargetKey);

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

                        const wasNature = isElementActive(
                            draftTarget,
                            elementalKeys.NATURE,
                        );

                        draftTarget = {
                            ...draftTarget,
                            [effectKeys.ELEMENTAL_CRYSTALS]: crystals,
                        };

                        const isNature = isElementActive(
                            draftTarget,
                            elementalKeys.NATURE,
                        );

                        // Run processSilverBlood on exit or entry of Nature
                        if (wasNature || isNature) {
                            draftTarget = processSilverBlood(draftTarget);
                        }

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

                    newGame = buildHistory(newGame, eventKeys.USE_ACTION, {
                        player: targetKey,
                        action: action,
                    });

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

    // Progression Tracker
    useEffect(() => {
        if (
            game.paused ||
            game.status !== turnStatus.VICTORY ||
            !game.progressMode
        )
            return;

        setGame((prev) => {
            const currController =
                prev.entities[entityKeys.PLAYER_TWO].controller;

            const keys = Object.keys(presetAi);
            const currIndex = keys.indexOf(currController);

            // If index is not found or human
            if (currIndex === -1 || currIndex === 0) {
                return prev;
            }

            const nextKey = keys[currIndex + 1];

            // If next enemy is already defeated or is always open
            if (
                prev.progressStatus[nextKey] === progKeys.DEFEATED ||
                prev.progressStatus[nextKey] === progKeys.ALWAYS_OPEN
            ) {
                return prev;
            }

            return {
                ...prev,
                progressStatus: {
                    ...prev.progressStatus,
                    [currController]: progKeys.DEFEATED,
                    [nextKey]: progKeys.OPEN_UNDEFEATED,
                },
            };
        });
    }, [game.status, game.progressMode, game.paused]);

    // Save game
    useEffect(() => {
        if (game.paused) {
            return;
        }

        // Saves only if it's a "checkpoint" state
        if (CHECKPOINT_STATES.includes(game.status)) {
            try {
                localStorage.setItem("gameCheckpoint", JSON.stringify(game));
            } catch (error) {
                console.error("Failed to save game checkpoint:", error);
            }
        }
    }, [game]);

    return (
        <GameContext.Provider
            value={{
                game,
                setGame,
                handleAction,
                handleAiChange,
                handleClearSimulation,
                handleConstellation,
                handleCreateSimulatedGame,
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
            }}
        >
            {children}
        </GameContext.Provider>
    );
}
