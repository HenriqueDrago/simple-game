import "./ActionPanel.css";

import {
    entityKeys,
    turnStatus,
    aiKeys,
    effectKeys,
    roundPhases,
} from "../utils/enums";
import { presetAi, actionMap } from "../utils/constants";
import {
    getActions,
    canUseAction,
    canUseCombatInteractions,
} from "../utils/entities";
import { DESCRIPTIONS } from "../utils/descriptions";

function ActionPanel({
    handleAction,
    game,
    playerController,
    enemyController,
    handleSetTooltip,
    handleClearTooltip,
}) {
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
                playerController === aiKeys.HUMAN &&
                enemyController === aiKeys.HUMAN
            ) {
                return `${isPlayerOne ? "Player One Turn" : "Player Two Turn"}`;
            }
            return `Player Turn`;
        }
        if (playerController === enemyController) {
            return `${presetAi[controller].name} ${isPlayerOne ? "One" : "Two"}`;
        }
        return `${presetAi[controller].name}`;
    };

    const playerLabel = getActorLabel(playerController, true);
    const enemyLabel = getActorLabel(enemyController, false);
    const currActorLabel = isPlayerOneTurn ? playerLabel : enemyLabel;

    let waitLabel = null;
    if (battleState === turnStatus.STARFALL_TRANSITION) {
        waitLabel = "Starfall";
    } else if (battleState !== turnStatus.ONGOING) {
        waitLabel = null;
    } else if (isPlayerTwoTurn && enemyController !== aiKeys.HUMAN) {
        waitLabel = enemyLabel;
    } else if (isPlayerOneTurn && playerController !== aiKeys.HUMAN) {
        waitLabel = playerLabel;
    } else if (
        currPhase === roundPhases.POST_P1_RUNIC_PULSE ||
        currPhase === roundPhases.POST_P2_RUNIC_PULSE
    ) {
        waitLabel = "Runic Pulse";
    } else if (
        currPhase === roundPhases.P1_STARS_TURN ||
        currPhase === roundPhases.P2_STARS_TURN
    ) {
        waitLabel = "Starfall";
    } else if (currPhase === roundPhases.MOON_TURN) {
        waitLabel = "Moon Phase";
    } else if (currPhase === roundPhases.MANA_SIPHON) {
        waitLabel = "Mana Siphon";
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
                <div className="actions-buttons-text-container">
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
                                }}
                                onMouseDown={(e) => {
                                    if (e.button === 1) {
                                        e.preventDefault();
                                        const entry = DESCRIPTIONS[action.key];
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
