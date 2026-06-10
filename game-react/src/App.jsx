/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import ControlPanel from "./components/ControlPanel.jsx";
import StatsPanel from "./components/StatsPanel.jsx";
import ActionPanel from "./components/ActionPanel.jsx";
import { simpleAI } from "./utils/aiControllers.js";
import { constants, presetAi } from "./utils/constants.js";
import { processUpkeep, commitTurn } from "./utils/turnManagement.js";
import {
    applyStats,
    distribute_points,
    createBaseEntity,
    generateEntitiesForMode,
} from "./utils/entities.js";
import { simulators } from "./utils/simulators.js";
import { entityKeys, turnStatus, aiKeys } from "./utils/enums.js";

import "./App.css";

function App() {
    // Declare states
    const [game, setGame] = useState({
        status: turnStatus.SETUP,
        nextStatus: null,
        shacklingCurse: 0,
        statDistributionMode: "Random",
        entities: {
            [entityKeys.PLAYER_ONE]: {
                ...distribute_points(createBaseEntity()),
                controller: aiKeys.HUMAN,
            },
            [entityKeys.PLAYER_TWO]: {
                ...distribute_points(createBaseEntity()),
                controller: aiKeys.SIMPLE,
            },
        },
    });

    // Handles
    function handleAction(action, agentKey, nonAgentKey) {
        console.log(`Used: ${action}`);
        setGame((prev) => {
            const agent = game.entities[agentKey];
            const nonAgent = game.entities[nonAgentKey];

            const isArrayActive = game.remainingArray > 0;

            const context = {
                agent,
                agentKey,
                nonAgent,
                nonAgentKey,
                isArrayActive,
            };

            const sim = simulators[`simulate${action}`];

            const draftEntities = sim(context);

            return commitTurn(
                prev,
                draftEntities,
                nonAgentKey,
                agentKey,
                "atk",
            );
        });
    }

    function handleDistributionModeChange(newMode) {
        setGame((prev) => ({
            ...prev,
            statDistributionMode: newMode,
            entities: generateEntitiesForMode(
                newMode,
                prev.entities[entityKeys.PLAYER_ONE].controller,
                prev.entities[entityKeys.PLAYER_TWO].controller,
            ),
        }));
    }

    function handleReset() {
        setGame((prev) => ({
            ...prev,
            status: turnStatus.SETUP,
            remainingArray: 0,
            nextStatus: null,
            entities: generateEntitiesForMode(
                prev.statDistributionMode,
                prev.entities[entityKeys.PLAYER_ONE].controller,
                prev.entities[entityKeys.PLAYER_TWO].controller,
            ),
        }));
    }

    function handleStart() {
        const playerStats = applyStats(
            game.entities[entityKeys.PLAYER_ONE].attributes,
        );
        const enemyStats = applyStats(
            game.entities[entityKeys.PLAYER_TWO].attributes,
        );

        setGame((prev) => ({
            ...prev,
            status: turnStatus.PLAYER_ONE_TURN,
            remainingArray: 0,
            entities: {
                [entityKeys.PLAYER_ONE]: {
                    ...prev.entities[entityKeys.PLAYER_ONE],
                    attributes: playerStats,
                },
                [entityKeys.PLAYER_TWO]: {
                    ...prev.entities[entityKeys.PLAYER_TWO],
                    attributes: enemyStats,
                },
            },
        }));
    }

    // Auxiliary Functions
    function updateStatsPoints(targetKey, StatusKey, value) {
        setGame((prev) => {
            const currSpent = prev.entities[targetKey].unspentPoints;
            const currAttPoints =
                prev.entities[targetKey].attributes[StatusKey].points;

            const trueSpentPoints = Math.min(
                currSpent,
                Math.max(-currAttPoints, value),
            );
            const newPoints = currSpent - trueSpentPoints;
            const newAttributePoints = currAttPoints + trueSpentPoints;

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [targetKey]: {
                        ...prev.entities[targetKey],
                        unspentPoints: newPoints,
                        attributes: {
                            ...prev.entities[targetKey].attributes,
                            [StatusKey]: {
                                ...prev.entities[targetKey].attributes[
                                    StatusKey
                                ],
                                valuePreview:
                                    constants.BASE_STATS[StatusKey] +
                                    newAttributePoints *
                                        constants.STAT_MULTIPLIERS[StatusKey],
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

        if (agent.controller !== aiKeys.HUMAN) {
            const triggerAI = () => {
                const nonAgent = game.entities[nonAgentKey];
                const isArrayActive = game.remainingArray > 0;

                const totalMana = agent.currMana + agent.manaOverflow;
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
                };

                const executeAI = presetAi[agent.controller].caller || simpleAI;
                executeAI(context);
            };

            const timer = setTimeout(triggerAI, 1000);

            return () => clearTimeout(timer);
        }
    }, [game.status, game.entities, game.remainingArray]);

    useEffect(() => {
        if (game.status === turnStatus.TRANSITION) {
            const timer = setTimeout(() => {
                setGame((prev) => ({ ...prev, status: prev.nextStatus }));
            }, 800);

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
            <Header
                battleState={game.status}
                handleStart={handleStart}
                handleReset={handleReset}
            />
            <GamePanel
                updateStatsPoints={updateStatsPoints}
                game={game}
                handleDistributionModeChange={handleDistributionModeChange}
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
            />
        </div>
    );
}

export default App;
