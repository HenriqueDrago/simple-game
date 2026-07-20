import "./ActionPanel.css";

import {
    entityKeys,
    turnStatus,
    aiKeys,
    effectKeys,
    roundPhases,
    playerTurnPhases,
} from "../utils/enums";
import { presetAi, actionMap } from "../utils/constants";
import { getActions, canUse } from "../utils/entities";
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

    const currPlayerPhase =
        game.playerQueue && game.playerQueue.length > 0
            ? game.playerQueue[0]
            : null;

    const isPlayerOneTurn = currPhase === roundPhases.PLAYER_ONE_TURN;
    const isPlayerTwoTurn = currPhase === roundPhases.PLAYER_TWO_TURN;

    const currEntityKey = isPlayerOneTurn ? entityKeys.PLAYER_ONE : entityKeys.PLAYER_TWO;
    const targetEntityKey = isPlayerOneTurn ? entityKeys.PLAYER_TWO : entityKeys.PLAYER_ONE;
    const currEntity = game.entities[currEntityKey];

    // Visibility Constraints
    const isHumanTurn =
        (isPlayerOneTurn && playerController === aiKeys.HUMAN) ||
        (isPlayerTwoTurn && enemyController === aiKeys.HUMAN);

    const showButtons =
        isHumanTurn &&
        battleState === turnStatus.ONGOING &&
        currPlayerPhase === playerTurnPhases.PLAN;

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
    } else if (currPhase === roundPhases.ARRAY_TURN) {
        waitLabel = "Runic Pulse";
    } else if (currPhase === roundPhases.EMINENCE_TURN) {
        waitLabel = "Emanation";
    } else if (
        currPhase === roundPhases.P1_STARS_TURN ||
        currPhase === roundPhases.P2_STARS_TURN
    ) {
        waitLabel = "Starfall";
    } else if (currPhase === roundPhases.MOON_TURN) {
        waitLabel = "Moon Phase";
    } else if (currPhase === roundPhases.MINI_ARRAY_TURN) {
        waitLabel = "Mana Siphon";
    } else if (currPhase === roundPhases.SPECIAL_EMINENCE_TURN) {
        waitLabel = "Anointment";
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
                disabled: !canUse(game, currEntityKey, key),
            };
        });

        if (
            currEntity.states[effectKeys.ANOINTED_PROXY] ||
            currEntity.states[effectKeys.THERMAL_OVERLOAD] ||
            currEntity.states[effectKeys.ZENITH_OF_MORTALITY] ||
            currEntity.states[effectKeys.NOVA]
        ) {
            containerClass = "single-button-container";
        } else if (currEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
            containerClass = "angel-button-grid";
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
                                    handleAction(action.key, currEntityKey, targetEntityKey);
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