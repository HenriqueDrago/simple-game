/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import GamePanel from "./components/GamePanel.jsx";
import ActionPanel from "./components/ActionPanel.jsx";
import { simpleAI } from "./utils/aiControllers.js";
import {
    CHECKPOINT_STATES,
    constants,
    INITIAL_GAME_STATE,
    presetAi,
} from "./utils/constants.js";
import {
    processUpkeep,
    commitTurn,
    processArrayTurn,
    processEminenceTurn,
    processStarfallTurn,
    processMoonPhase,
} from "./utils/turnManagement.js";
import {
    distributePoints,
    createBaseEntity,
    resetPlayerEntity,
    processActionTypeUsed,
} from "./utils/entities.js";
import { simulators } from "./utils/simulators.js";
import {
    entityKeys,
    turnStatus,
    aiKeys,
    sdmKeys,
    whoStartsKeys,
    eyeKeys,
    actionKeys,
    starfallPhases,
    effectKeys,
    progKeys,
    elementalKeys,
} from "./utils/enums.js";

import "./App.css";
import TooltipDisplay from "./components/TooltipDisplay.jsx";
import Glossary from "./components/Glossary.jsx";
import Modal from "./components/Modal.jsx";

function App() {
    // Declare states
    const [game, setGame] = useState(() => {
        try {
            const savedData = localStorage.getItem("gameCheckpoint");
            if (savedData) {
                return {
                    ...INITIAL_GAME_STATE,
                    ...JSON.parse(savedData),
                };
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
            // Skipping ghost clicks
            if (
                prev.status !== turnStatus.PLAYER_ONE_TURN &&
                prev.status !== turnStatus.PLAYER_TWO_TURN
            ) {
                return prev;
            }

            const agent = prev.entities[agentKey];
            const nonAgent = prev.entities[nonAgentKey];

            // Skipping if sealed
            if (agent.states.burdenOfStigma) {
                return commitTurn(prev, agentKey, nonAgentKey, null);
            }

            const context = {
                agent,
                agentKey,
                nonAgent,
                nonAgentKey,
                prev,
            };

            const sim = simulators[action];

            const simulationResult = sim(context);

            const newGameState = processActionTypeUsed(
                simulationResult,
                agentKey,
                nonAgentKey,
                action,
            );

            return commitTurn(newGameState, agentKey, nonAgentKey, action);
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
            const playerOne = resetPlayerEntity(prev, entityKeys.PLAYER_ONE);
            const playerTwo = resetPlayerEntity(prev, entityKeys.PLAYER_TWO);

            return {
                ...prev,
                status: turnStatus.SETUP,
                nextStatus: null,
                lastPlayerTurn: null,
                remainingArray: 0,
                turnCount: 0,
                eyeOfHeavens: eyeKeys.DORMANT,
                starQueue: null,
                [effectKeys.SEVERED_TIME]: false,
                entities: {
                    [entityKeys.PLAYER_ONE]: playerOne,
                    [entityKeys.PLAYER_TWO]: playerTwo,
                },
            };
        });
    }

    function handleStart() {
        setGame((prev) => {
            const initialStatus =
                prev.whoStarts === whoStartsKeys.PLAYER_ONE ||
                (Math.random() < 0.5 && prev.whoStarts === whoStartsKeys.RANDOM)
                    ? turnStatus.UPKEEP_PLAYER_ONE
                    : turnStatus.UPKEEP_PLAYER_TWO;

            return {
                ...prev,
                status: initialStatus,
                lastPlayerTurn: entityKeys.PLAYER_ONE,
                turnCount: 1,
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
            console.log(prev);
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
    useEffect(() => {
        const activeKey =
            game.status === turnStatus.PLAYER_ONE_TURN
                ? entityKeys.PLAYER_ONE
                : game.status === turnStatus.PLAYER_TWO_TURN
                  ? entityKeys.PLAYER_TWO
                  : null;

        if (!activeKey) return;

        const agentKey = activeKey;
        const nonAgentKey =
            activeKey === entityKeys.PLAYER_ONE
                ? entityKeys.PLAYER_TWO
                : entityKeys.PLAYER_ONE;
        const agent = game.entities[agentKey];

        if (agent.states.burdenOfStigma) {
            const timer = setTimeout(
                () => handleAction(actionKeys.WAIT, agentKey, nonAgentKey),
                1000,
            );

            return () => clearTimeout(timer);
        }

        if (agent.controller !== aiKeys.HUMAN) {
            const triggerAI = () => {
                const nonAgent = game.entities[nonAgentKey];
                const isArrayActive = game.remainingArray > 0;

                const totalMana = agent.currMana + agent.resources.manaOverflow;
                const hasManaForSpecial = totalMana >= constants.SP_ATTACK_COST;

                const context = {
                    agent,
                    agentKey,
                    nonAgent,
                    nonAgentKey,
                    isArrayActive,
                    totalMana,
                    hasManaForSpecial,
                    handleAction,
                    prev: game,
                };

                const executeAI = presetAi[agent.controller].caller || simpleAI;
                executeAI(context);
            };

            const timer = setTimeout(triggerAI, 1000);

            return () => clearTimeout(timer);
        }
    }, [game.status]);

    useEffect(() => {
        if (game.status === turnStatus.TRANSITION) {
            const timer = setTimeout(() => {
                setGame((prev) => ({ ...prev, status: prev.nextStatus }));
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [game.status]);

    useEffect(() => {
        if (game.status === turnStatus.SHORT_TRANSITION) {
            const timer = setTimeout(() => {
                setGame((prev) => ({ ...prev, status: prev.nextStatus }));
            }, 400);

            return () => clearTimeout(timer);
        }
    }, [game.status]);

    useEffect(() => {
        if (game.status === turnStatus.MOON_TURN) {
            const timer = setTimeout(() => {
                setGame(processMoonPhase);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [game.status]);

    useEffect(() => {
        if (game.status === turnStatus.ARRAY_TURN) {
            const timer = setTimeout(() => {
                setGame(processArrayTurn);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [game.status]);

    useEffect(() => {
        if (game.status === turnStatus.EMINENCE_TURN) {
            const timer = setTimeout(() => {
                setGame(processEminenceTurn);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [game.status]);

    useEffect(() => {
        if (game.status === turnStatus.STARS_TURN) {
            if (!game.starQueue) {
                const newQueue = Object.values(starfallPhases);

                setGame((prev) => {
                    return {
                        ...prev,
                        starQueue: newQueue,
                    };
                });
            } else {
                const timer = setTimeout(() => {
                    setGame(processStarfallTurn);
                }, 800);
                return () => clearTimeout(timer);
            }
        }
    }, [game.status, game.starQueue]);

    // Turn Start effects
    useEffect(() => {
        if (
            game.status === turnStatus.UPKEEP_PLAYER_ONE ||
            game.status === turnStatus.UPKEEP_PLAYER_TWO
        ) {
            setGame(processUpkeep);
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

    return (
        <div className="app-container">
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
