/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import GamePanel from "./components/GamePanel.jsx";
import ActionPanel from "./components/ActionPanel.jsx";
import { centralAIManagement } from "./utils/aiControllers.js";
import {
    CHECKPOINT_STATES,
    constants,
    INITIAL_GAME_STATE,
    presetAi,
} from "./utils/constants.js";
import {
    processUpkeep,
    commitTurn,
    processStarfallTurn,
    processMoonPhase,
    buildRoundQueue,
    processManaSiphon,
    processRunicPulse,
    processAnnoitement,
    processEmanation,
} from "./utils/turnManagement.js";
import {
    distributePoints,
    createBaseEntity,
    resetPlayerEntity,
    processActionTypeUsed,
    processDeathCheck,
} from "./utils/entities.js";
import { simulators } from "./utils/simulators.js";
import {
    entityKeys,
    turnStatus,
    aiKeys,
    sdmKeys,
    whoStartsKeys,
    eyeKeys,
    starfallPhases,
    effectKeys,
    progKeys,
    elementalKeys,
    playerTurnPhases,
    actionKeys,
    roundPhases,
} from "./utils/enums.js";

import "./App.css";
import TooltipDisplay from "./components/TooltipDisplay.jsx";
import Glossary from "./components/Glossary.jsx";
import Modal from "./components/Modal.jsx";
import ContinueModal from "./components/ContinueModal.jsx";
import Timeline from "./components/Timeline.jsx";

// Auxiliary Functions
function resetGameState(prev) {
    const playerOne = resetPlayerEntity(prev, entityKeys.PLAYER_ONE);
    const playerTwo = resetPlayerEntity(prev, entityKeys.PLAYER_TWO);

    return {
        ...prev,
        // turn logic
        status: turnStatus.SETUP,
        nextStatus: null,
        lastPlayerTurn: null,
        roundCount: 0,
        starQueue: null,
        playerQueue: null,
        roundQueue: null,
        roundIndex: 0,

        // game logic
        [effectKeys.RUNIC_ARRAY]: 0,
        eyeOfHeavens: eyeKeys.DORMANT,
        [effectKeys.SEVERED_TIME]: false,

        entities: {
            [entityKeys.PLAYER_ONE]: playerOne,
            [entityKeys.PLAYER_TWO]: playerTwo,
        },
    };
}

// App Component
function App() {
    // Declare states
    const [continueModal, setContinueModal] = useState(false);

    const [game, setGame] = useState(() => {
        try {
            const savedData = localStorage.getItem("gameCheckpoint");
            if (savedData) {
                let savedGame = {
                    ...INITIAL_GAME_STATE,
                    ...JSON.parse(savedData),
                };

                const toBeRestStatus = [
                    turnStatus.VICTORY,
                    turnStatus.DRAW,
                    turnStatus.DEFEAT,
                ];

                if (toBeRestStatus.includes(savedGame.status)) {
                    savedGame = resetGameState(savedGame);
                } else if (savedGame.status !== turnStatus.SETUP) {
                    setContinueModal(true);
                }

                return savedGame;
            }
        } catch (error) {
            console.error("Failed to load saved game data:", error);
        }

        // Fallback if load fails
        return INITIAL_GAME_STATE;
    });

    const [tooltipStack, setTooltipStack] = useState([]);
    const [glossaryActive, setGlossaryActive] = useState(false);
    const [resetModal, setResetModal] = useState(false);

    // Handles
    function handleAction(action, agentKey, nonAgentKey) {
        console.log(`${agentKey} Used: ${action}`);
        setGame((prev) => {
            // Safeguard
            const currPhase =
                prev.roundQueue && prev.roundQueue[prev.roundIndex];
            const currSubPhase = prev.playerQueue && prev.playerQueue[0];

            if (
                (currPhase !== roundPhases.PLAYER_ONE_TURN &&
                    currPhase !== roundPhases.PLAYER_TWO_TURN) ||
                currSubPhase !== playerTurnPhases.PLAN
            ) {
                return prev;
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

            const simulationResult = sim(context);

            // process effects that depend on action type (offensive, defensive, etc)
            let newGameState = processActionTypeUsed(
                simulationResult,
                agentKey,
                nonAgentKey,
                action,
            );

            // Death check
            newGameState = processDeathCheck(newGameState);

            // Determine if PLAN subphase ends or not
            const newQueue =
                (action === actionKeys.ASCEND || action === actionKeys.LASER) && // free actions
                newGameState.status === turnStatus.ONGOING // plan subphase ends if something changes status (ex, a player died)
                    ? prev.playerQueue
                    : prev.playerQueue.slice(1);

            return {
                ...newGameState,
                status:
                    newQueue[0] === playerTurnPhases.COMMIT // guarantee commit always runs after plan subphase ends
                        ? turnStatus.ONGOING
                        : newGameState.status,
                playerQueue: newQueue,
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

    function handleReset() {
        setGame((prev) => {
            setContinueModal(false);
            return resetGameState(prev);
        });
    }

    function handleHardReset() {
        setContinueModal(false);
        setGame({ ...INITIAL_GAME_STATE });
    }

    function handleStart() {
        setGame((prev) => {
            const startingPlayer =
                prev.whoStarts === whoStartsKeys.PLAYER_ONE ||
                (Math.random() < 0.5 && prev.whoStarts === whoStartsKeys.RANDOM)
                    ? entityKeys.PLAYER_ONE
                    : entityKeys.PLAYER_TWO;

            return {
                ...prev,
                status: turnStatus.ONGOING,
                startingPlayer: startingPlayer,
            };
        });
    }

    function handleWhoStartsChange(value) {
        setGame((prev) => ({
            ...prev,
            whoStarts: value,
        }));
    }

    // Handles array tracking for nested tooltips
    const handleSetTooltip = (tooltipData, depth = 0) => {
        setTooltipStack((prev) => {
            const newStack = depth === 0 ? [] : [...prev];

            // Prevent appending the exact same keyword back-to-back
            if (
                depth > 0 &&
                prev.length > 0 &&
                prev[prev.length - 1].keyword === tooltipData.keyword
            ) {
                return prev;
            }

            // Only calculate position for the initial box (Depth 0)
            if (depth === 0) {
                const TOOLTIP_WIDTH = 320;
                const MAX_TOOLTIP_HEIGHT = 400;
                const MARGIN = 15;

                const clampedX = Math.max(
                    MARGIN,
                    Math.min(
                        tooltipData.x,
                        window.innerWidth - TOOLTIP_WIDTH - MARGIN,
                    ),
                );
                const clampedY = Math.max(
                    MARGIN,
                    Math.min(
                        tooltipData.y,
                        window.innerHeight - MAX_TOOLTIP_HEIGHT - MARGIN,
                    ),
                );

                newStack.push({ ...tooltipData, x: clampedX, y: clampedY });
            } else {
                // Child tooltips only appends, no need for coordinates
                newStack.push(tooltipData);
            }

            return newStack;
        });
    };

    const handleClearTooltip = () => {
        setTooltipStack([]);
    };

    function handleGlossary(value) {
        setGlossaryActive(value);
    }

    function handleStarChange(targetKey, starKey, value) {
        setGame((prev) => {
            const currWhite =
                prev.entities[targetKey].stars[effectKeys.WHITE_STAR];
            const currColor = prev.entities[targetKey].stars[starKey];

            const spent = Math.min(currWhite, Math.max(-currColor, value));

            const newWhite = currWhite - spent;
            const newColor = currColor + spent;

            return {
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

    function handleProgressReset() {
        setGame((prev) => {
            return {
                ...prev,
                progressStatus: {
                    ...INITIAL_GAME_STATE.progressStatus,
                },
            };
        });

        setResetModal(false);
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
            let newElement =
                prev.entities[entityKey][effectKeys.ELEMENTAL_CRYSTALS];

            if (newElement !== element) {
                newElement = element;
            } else {
                newElement = elementalKeys.DULLED;
            }

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [entityKey]: {
                        ...prev.entities[entityKey],
                        [effectKeys.ELEMENTAL_CRYSTALS]: newElement,
                    },
                },
            };
        });
    }

    // Auxiliary Functions
    function updateStatsPoints(targetKey, statusKey, value) {
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

    // Efeitos

    // Turn Management
    useEffect(() => {
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

            switch (currPhase) {
                case roundPhases.ROUND_START: {
                    nextState = {
                        ...gameState,
                        roundCount: gameState.roundCount + 1,
                        roundIndex: gameState.roundIndex + 1,
                    };
                    delayAmount = gameState.roundCount > 0 ? 1200 : 0;
                    break;
                }

                case roundPhases.MINI_ARRAY_TURN: {
                    nextState = processManaSiphon(gameState);
                    delayAmount = 1200;
                    break;
                }

                case roundPhases.ARRAY_TURN: {
                    nextState = processRunicPulse(gameState);
                    delayAmount = 1200;
                    break;
                }

                case roundPhases.SPECIAL_EMINENCE_TURN: {
                    nextState = processAnnoitement(gameState);
                    delayAmount = 1200;
                    break;
                }

                case roundPhases.EMINENCE_TURN: {
                    nextState = processEmanation(gameState);
                    delayAmount = 1200;
                    break;
                }

                case roundPhases.MOON_TURN: {
                    nextState = processMoonPhase(gameState);
                    delayAmount = 1200;
                    break;
                }

                case roundPhases.P1_STARS_TURN: {
                    targetKey = entityKeys.PLAYER_ONE;
                    nonTargetKey = entityKeys.PLAYER_TWO;
                    break;
                }

                case roundPhases.P2_STARS_TURN: {
                    targetKey = entityKeys.PLAYER_TWO;
                    nonTargetKey = entityKeys.PLAYER_ONE;
                    break;
                }

                case roundPhases.PLAYER_ONE_TURN: {
                    targetKey = entityKeys.PLAYER_ONE;
                    nonTargetKey = entityKeys.PLAYER_TWO;
                    break;
                }

                case roundPhases.PLAYER_TWO_TURN: {
                    targetKey = entityKeys.PLAYER_TWO;
                    nonTargetKey = entityKeys.PLAYER_ONE;
                    break;
                }

                case roundPhases.ROUND_END: {
                    nextState = {
                        ...gameState,
                        roundIndex: 0,
                    };
                    delayAmount = 1200;
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
                console.log(gameState.playerQueue);

                if (
                    !gameState.playerQueue ||
                    gameState.playerQueue.length === 0
                ) {
                    nextState = {
                        ...gameState,
                        playerQueue: Object.values(playerTurnPhases),
                    };
                } else {
                    const currPlayerPhase = gameState.playerQueue[0];

                    if (currPlayerPhase === playerTurnPhases.UPKEEP) {
                        nextState = processUpkeep(
                            gameState,
                            targetKey,
                            nonTargetKey,
                        );
                    }

                    if (currPlayerPhase === playerTurnPhases.COMMIT) {
                        nextState = commitTurn(
                            gameState,
                            targetKey,
                            nonTargetKey,
                        );
                    }
                }
            }

            // Fallback
            if (!nextState) {
                nextState = game;
            }

            let timer = null;

            if (delayAmount > 0) {
                timer = setTimeout(() => {
                    setGame(buildRoundQueue(nextState));
                }, delayAmount);
            } else {
                setGame(buildRoundQueue(nextState));
            }

            return () => {
                if (timer) {
                    clearTimeout(timer);
                }
            };
        }
    }, [game.status, game.roundIndex, game.playerQueue, game.starQueue]);

    // AI turn
    useEffect(() => {
        if (game.status !== turnStatus.ONGOING) {
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
                centralAIManagement(
                    game,
                    targetKey,
                    nonTargetKey,
                    handleAction,
                );
            }, 1200);

            return () => clearTimeout(aiTimer);
        }
    }, [game.status, game.roundIndex, game.playerQueue, handleAction]);

    // Round Transition
    useEffect(() => {
        if (game.status === turnStatus.ROUND_TRANSITION) {
            const timer = setTimeout(() => {
                setGame((prev) => ({
                    ...prev,
                    status: turnStatus.ONGOING,
                    roundIndex: prev.roundIndex + 1,
                }));
            }, 1200);

            return () => clearTimeout(timer);
        }
    }, [game.status]);

    // Starfall Transition
    useEffect(() => {
        if (game.status === turnStatus.STARFALL_TRANSITION) {
            const timer = setTimeout(() => {
                setGame((prev) => ({
                    ...prev,
                    status: turnStatus.ONGOING,
                }));
            }, 700);

            return () => clearTimeout(timer);
        }
    }, [game.status]);

    // Progression Tracker
    useEffect(() => {
        if (game.status !== turnStatus.VICTORY || !game.progressMode) return;

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
    }, [game.status, game.progressMode]);

    // Save game
    useEffect(() => {
        // Saves only if it's a "checkpoint" state
        if (CHECKPOINT_STATES.includes(game.status)) {
            try {
                localStorage.setItem("gameCheckpoint", JSON.stringify(game));
            } catch (error) {
                console.error("Failed to save game checkpoint:", error);
            }
        }
    }, [game]);

    if (continueModal) {
        return (
            <ContinueModal
                handleReset={handleReset}
                setContinueModal={setContinueModal}
                handleHardReset={handleHardReset}
            />
        );
    }

    return (
        <div className="app-container">
            <Timeline
                phases={game.roundQueue}
                currIndex={game.roundIndex}
                status={game.status}
            />

            {tooltipStack.length > 0 && (
                <div
                    className="backdrop"
                    onClick={handleClearTooltip}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        handleClearTooltip();
                    }}
                />
            )}
            {glossaryActive && (
                <div
                    className="backdrop"
                    onClick={() => {
                        handleGlossary(false);
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        handleGlossary(false);
                    }}
                />
            )}
            {resetModal && (
                <Modal
                    mainText={"Do you wish to reset your progress?"}
                    subText={"*This action is irreversible."}
                    isConfirmOnly={false}
                    rejectAction={() => {
                        setResetModal(false);
                    }}
                    confirmAction={() => {
                        handleProgressReset();
                    }}
                    confirmText="Continue"
                    rejectText={"Cancel"}
                />
            )}
            {glossaryActive && (
                <Glossary handleGlossary={handleGlossary} game={game} />
            )}
            <TooltipDisplay
                tooltipStack={tooltipStack}
                handleSetTooltip={handleSetTooltip}
                handleClearTooltip={handleClearTooltip}
            />

            <Header
                game={game}
                handleStart={handleStart}
                handleReset={handleReset}
                handleWhoStartsChange={handleWhoStartsChange}
                handleGlossary={handleGlossary}
                handleProgressToggle={handleProgressToggle}
                handleResetModal={setResetModal}
            />

            <GamePanel
                game={game}
                updateStatsPoints={updateStatsPoints}
                handleDistributionModeChange={handleDistributionModeChange}
                handleAiChange={handleAiChange}
                handleStarChange={handleStarChange}
                handleRandomizeStats={handleRandomizeStats}
                handleElementChange={handleElementChange}
            />
            <ActionPanel
                handleAction={handleAction}
                playerController={
                    game.entities[entityKeys.PLAYER_ONE].controller
                }
                enemyController={
                    game.entities[entityKeys.PLAYER_TWO].controller
                }
                game={game}
                handleSetTooltip={handleSetTooltip}
                handleClearTooltip={handleClearTooltip}
            />
        </div>
    );
}

export default App;
