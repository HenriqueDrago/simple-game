/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import GamePanel from "./components/GamePanel.jsx";
import ActionPanel from "./components/ActionPanel.jsx";
import { simpleAI } from "./utils/aiControllers.js";
import { constants, presetAi } from "./utils/constants.js";
import {
    processUpkeep,
    commitTurn,
    processWheelTurn,
    processArrayTurn,
    processEminenceTurn,
} from "./utils/turnManagement.js";
import { distributePoints, createBaseEntity } from "./utils/entities.js";
import { simulators } from "./utils/simulators.js";
import {
    entityKeys,
    turnStatus,
    aiKeys,
    sdmKeys,
    elementalKeys,
    whoStartsKeys,
    eyeKeys,
    actionKeys,
} from "./utils/enums.js";

import "./App.css";
import TooltipDisplay from "./components/TooltipDisplay.jsx";

function App() {
    // Declare states
    const [game, setGame] = useState({
        status: turnStatus.SETUP,
        nextStatus: null,
        lastPlayerTurn: null,
        remainingArray: 0,
        elementalWheel: elementalKeys.INACTIVE,
        whoStarts: whoStartsKeys.PLAYER_ONE,
        turnCount: 0,
        eyeOfHeavens: eyeKeys.DORMANT,
        entities: {
            [entityKeys.PLAYER_ONE]: {
                ...distributePoints(createBaseEntity(), sdmKeys.RANDOM),
                controller: aiKeys.HUMAN,
                statDistributionMode: sdmKeys.RANDOM,
            },
            [entityKeys.PLAYER_TWO]: {
                ...distributePoints(createBaseEntity(), sdmKeys.RANDOM),
                controller: aiKeys.SIMPLE,
                statDistributionMode: sdmKeys.RANDOM,
            },
        },
    });

    const [tooltipStack, setTooltipStack] = useState([]);

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
            if (agent.states.burdenOfStigma || action === actionKeys.WAIT) {
                return commitTurn(prev, agentKey, nonAgentKey, actionKeys.WAIT);
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

            return commitTurn(simulationResult, agentKey, nonAgentKey, action);
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
                updatedEntity = {
                    ...updatedEntity,
                    ...distributePoints(
                        updatedEntity,
                        currentMode,
                        presetAi[controllerKey].best,
                    ),
                };
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
            const playerOne =
                prev.entities[entityKeys.PLAYER_ONE].statDistributionMode ===
                sdmKeys.CUSTOM
                    ? {
                          ...createBaseEntity(),
                          attributes: {
                              ...prev.entities[entityKeys.PLAYER_ONE]
                                  .attributes,
                          },
                          controller:
                              prev.entities[entityKeys.PLAYER_ONE].controller,
                          statDistributionMode:
                              prev.entities[entityKeys.PLAYER_ONE]
                                  .statDistributionMode,
                          unspentPoints:
                              prev.entities[entityKeys.PLAYER_ONE]
                                  .unspentPoints,
                      }
                    : {
                          ...distributePoints(
                              createBaseEntity(),
                              prev.entities[entityKeys.PLAYER_ONE]
                                  .statDistributionMode,
                              presetAi[
                                  prev.entities[entityKeys.PLAYER_ONE]
                                      .controller
                              ].best,
                          ),
                          controller:
                              prev.entities[entityKeys.PLAYER_ONE].controller,
                          statDistributionMode:
                              prev.entities[entityKeys.PLAYER_ONE]
                                  .statDistributionMode,
                      };

            const playerTwo =
                prev.entities[entityKeys.PLAYER_TWO].statDistributionMode ===
                sdmKeys.CUSTOM
                    ? {
                          ...createBaseEntity(),
                          attributes: {
                              ...prev.entities[entityKeys.PLAYER_TWO]
                                  .attributes,
                          },
                          controller:
                              prev.entities[entityKeys.PLAYER_TWO].controller,
                          statDistributionMode:
                              prev.entities[entityKeys.PLAYER_TWO]
                                  .statDistributionMode,
                          unspentPoints:
                              prev.entities[entityKeys.PLAYER_TWO]
                                  .unspentPoints,
                      }
                    : {
                          ...distributePoints(
                              createBaseEntity(),
                              prev.entities[entityKeys.PLAYER_TWO]
                                  .statDistributionMode,
                              presetAi[
                                  prev.entities[entityKeys.PLAYER_TWO]
                                      .controller
                              ].best,
                          ),
                          controller:
                              prev.entities[entityKeys.PLAYER_TWO].controller,
                          statDistributionMode:
                              prev.entities[entityKeys.PLAYER_TWO]
                                  .statDistributionMode,
                      };

            return {
                ...prev,
                status: turnStatus.SETUP,
                nextStatus: null,
                lastPlayerTurn: null,
                remainingArray: 0,
                elementalWheel: elementalKeys.INACTIVE,
                turnCount: 0,
                eyeOfHeavens: eyeKeys.DORMANT,
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
                    ? turnStatus.PLAYER_ONE_TURN
                    : turnStatus.PLAYER_TWO_TURN;

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

    // Handles array tracking for nested tooltips. Defaults to depth 0 for standard buttons.
    const handleSetTooltip = (tooltipData, depth = 0) => {
        console.log(tooltipData)
        console.log(depth)
        setTooltipStack((prev) => {
            const newStack = prev.slice(0, depth);
            newStack.push(tooltipData);
            return newStack;
        });
    };

    // Clears the entire stack instantly
    const handleClearTooltip = () => {
        setTooltipStack([]);
    };

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
                    wheelElement: game.elementalWheel,
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
        if (game.status === turnStatus.WHEEL_TURN) {
            const timer = setTimeout(() => {
                setGame(processWheelTurn);
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

    // Turn Start effects
    useEffect(() => {
        if (
            game.status === turnStatus.UPKEEP_PLAYER_ONE ||
            game.status === turnStatus.UPKEEP_PLAYER_TWO
        ) {
            setGame(processUpkeep);
        }
    }, [game.status]);

    return (
        <div className="app-container">
            {/* Invisible backdrop intercepts clicks outside of the tooltips */}
            {tooltipStack.length > 0 && (
                <div
                    className="tooltip-backdrop"
                    onClick={handleClearTooltip}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        handleClearTooltip();
                    }}
                />
            )}

            {/* Passing the stack down instead of activeTooltip */}
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
            />
            <GamePanel
                game={game}
                updateStatsPoints={updateStatsPoints}
                handleDistributionModeChange={handleDistributionModeChange}
                handleAiChange={handleAiChange}
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
