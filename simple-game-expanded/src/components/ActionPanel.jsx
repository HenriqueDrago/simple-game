import "./ActionPanel.css";

import {
    entityKeys,
    turnStatus,
    aiKeys,
    effectKeys,
    roundPhases,
} from "../utils/enums";
import { presetAi, actionMap, FREE_ACTIONS } from "../utils/constants";
import {
    getActions,
    canUseAction,
    canUseCombatInteractions,
} from "../utils/entities";
import { DESCRIPTIONS } from "../utils/descriptions";
import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";

function ActionPanel() {
    const {
        game,
        handleAction,
        handleClearSimulation,
        handleCreateSimulatedGame,
    } = useGame();
    const { handleClearTooltip, handleSetTooltip } = useUI();

    const p1Controller = game.entities[entityKeys.PLAYER_ONE].controller;
    const p2Controller = game.entities[entityKeys.PLAYER_TWO].controller;

    const battleState = game.status;

    const currPhase =
        game.roundQueue && game.roundQueue.length > 0
            ? game.roundQueue[game.roundIndex]
            : null;

    const isPlayerOneTurn =
        currPhase === roundPhases.PLAYER_ONE_TURN ||
        currPhase === roundPhases.P1_SINGULARITY;
    const isPlayerTwoTurn =
        currPhase === roundPhases.PLAYER_TWO_TURN ||
        currPhase === roundPhases.P2_SINGULARITY;

    const currEntityKey = isPlayerOneTurn
        ? entityKeys.PLAYER_ONE
        : entityKeys.PLAYER_TWO;
    const targetEntityKey = isPlayerOneTurn
        ? entityKeys.PLAYER_TWO
        : entityKeys.PLAYER_ONE;
    const currEntity = game.entities[currEntityKey];

    // Visibility Constraints
    const showButtons = canUseCombatInteractions(game);

    // Label Generation Helpers
    const getActorLabel = (controller, isPlayerOne) => {
        if (controller === aiKeys.HUMAN) {
            if (
                p1Controller === aiKeys.HUMAN &&
                p2Controller === aiKeys.HUMAN
            ) {
                return `${isPlayerOne ? "Player One Turn" : "Player Two Turn"}`;
            }
            return `Player Turn`;
        }
        if (p1Controller === p2Controller) {
            return `${presetAi[controller].name} ${isPlayerOne ? "One" : "Two"}`;
        }
        return `${presetAi[controller].name}`;
    };

    const playerLabel = getActorLabel(p1Controller, true);
    const enemyLabel = getActorLabel(p2Controller, false);
    const currActorLabel = isPlayerOneTurn ? playerLabel : enemyLabel;

    let waitLabel = null;
    if (battleState === turnStatus.STARFALL_TRANSITION) {
        waitLabel = "Starfall";
    } else if (battleState !== turnStatus.ONGOING) {
        waitLabel = null;
    } else if (isPlayerTwoTurn && p2Controller !== aiKeys.HUMAN) {
        waitLabel = enemyLabel;
    } else if (isPlayerOneTurn && p1Controller !== aiKeys.HUMAN) {
        waitLabel = playerLabel;
    } else if (
        currPhase === roundPhases.P1_STARS_TURN ||
        currPhase === roundPhases.P2_STARS_TURN
    ) {
        waitLabel = "Starfall";
    } else if (currPhase === roundPhases.MOON_TURN) {
        waitLabel = "Moon Phase";
    }

    // Process Action List & Classes dynamically via shared state logic
    let currentActions = [];
    let showHelperText = false;
    let containerClass = "button-grid";

    if (showButtons) {
        currentActions = getActions(game, currEntityKey).map((key) => {
            const mapInfo = actionMap[key] || { name: key, specialClass: "" };
            return {
                key: key,
                label: mapInfo.name,
                specialClass: mapInfo.specialClass,
                disabled: !canUseAction(game, currEntityKey, key),
            };
        });

        if (currEntity.states[effectKeys.THERMAL_OVERLOAD]) {
            containerClass = "single-button-container";
        } else if (currEntity.states[effectKeys.UMBRAL_CORE]) {
            containerClass = "shadow-button-grid";
        } else {
            showHelperText = true;
        }
    }

    return (
        <div className="action-panel-container">
            {showButtons && (
                <div className="action-panel-turn-announcer">
                    <span>{currActorLabel}</span>
                </div>
            )}

            {showButtons && (
                <div
                    className={`actions-buttons-text-container ${currEntity.states[effectKeys.VISIONARY] ? "is-visionary" : ""}`}
                >
                    {showHelperText && (
                        <span className="actions-mouse-wheel-explainer">
                            Tip: You can mouse-wheel click on most things to see
                            their tooltips...
                        </span>
                    )}
                    <div className={containerClass}>
                        {currentActions.map((action) => (
                            <button
                                key={action.key}
                                onClick={() => {
                                    handleClearTooltip();
                                    handleAction(
                                        action.key,
                                        currEntityKey,
                                        targetEntityKey,
                                    );
                                    if (FREE_ACTIONS.includes(action.key)) {
                                        handleCreateSimulatedGame(
                                            action.key,
                                            currEntityKey,
                                            targetEntityKey,
                                        );
                                    } else {
                                        handleClearSimulation();
                                    }
                                }}
                                onMouseDown={(e) => {
                                    if (e.button === 1) {
                                        e.preventDefault();
                                        const entry =
                                            DESCRIPTIONS?.[action.key];
                                        if (entry) {
                                            handleSetTooltip({
                                                keyword: entry.name,
                                                type: entry.type,
                                                description: entry.description,
                                                x: e.clientX,
                                                y: e.clientY - 30,
                                            });
                                        }
                                    }
                                }}
                                onMouseEnter={() => {
                                    handleCreateSimulatedGame(
                                        action.key,
                                        currEntityKey,
                                        targetEntityKey,
                                    );
                                }}
                                onMouseLeave={() => {
                                    handleCreateSimulatedGame(
                                        null,
                                        currEntityKey,
                                        targetEntityKey,
                                    );
                                }}
                                disabled={action.disabled}
                                className={action.specialClass || ""}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {waitLabel && <span className="enemy-wait">{waitLabel}</span>}
        </div>
    );
}

export default ActionPanel;
