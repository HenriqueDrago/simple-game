import "./ActionPanel.css";

import { turnStatus, aiKeys, effectKeys, roundPhases } from "../utils/enums";
import { actionMap, FREE_ACTIONS } from "../utils/constants";
import {
    getActions,
    canUseAction,
    canUseCombatInteractions,
    getEntityLabel,
    getCurrActivePlayer,
    getOtherEntity,
} from "../utils/entities";
import { DESCRIPTIONS } from "../utils/descriptions";
import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";

function ActionPanel() {
    const { game, handleAction, setGame } = useGame();
    const { handleClearTooltip, handleSetTooltip } = useUI();

    const battleState = game.status;

    const currPhase =
        game.roundQueue && game.roundQueue.length > 0
            ? game.roundQueue[game.roundIndex]
            : null;

    const currPlayerKey = getCurrActivePlayer(game);
    const currEntity = game?.entities?.[currPlayerKey];

    // Visibility Constraints
    const showButtons =
        currPlayerKey && canUseCombatInteractions(game, currPlayerKey, true, true);
    const currActorLabel = getEntityLabel(game, currPlayerKey);

    let waitLabel = null;
    if (battleState === turnStatus.STARFALL_TRANSITION) {
        waitLabel = "Starfall";
    } else if (battleState !== turnStatus.ONGOING) {
        waitLabel = null;
    } else if (
        currEntity &&
        canUseCombatInteractions(game, currPlayerKey, true, false) &&
        currEntity.controller !== aiKeys.HUMAN
    ) {
        waitLabel = `${currActorLabel}`;
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
        currentActions = getActions(game, currPlayerKey).map((key) => {
            const mapInfo = actionMap[key] || { name: key, specialClass: "" };
            return {
                key: key,
                label: mapInfo.name,
                specialClass: mapInfo.specialClass,
                disabled: !canUseAction(game, currPlayerKey, key),
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
                                        currPlayerKey,
                                        getOtherEntity(currPlayerKey),
                                    );
                                    if (FREE_ACTIONS.includes(action.key)) {
                                        setGame((prev) => {
                                            return {
                                                ...prev,
                                                simSpecs: {
                                                    ...prev.simSpecs,
                                                    action: action.key,
                                                },
                                            };
                                        });
                                    } else {
                                        setGame((prev) => {
                                            return {
                                                ...prev,
                                                simSpecs: {
                                                    ...prev.simSpecs,
                                                    action: null,
                                                },
                                            };
                                        });
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
                                    setGame((prev) => {
                                        return {
                                            ...prev,
                                            simSpecs: {
                                                ...prev.simSpecs,
                                                action: action.key,
                                            },
                                        };
                                    });
                                }}
                                onMouseLeave={() => {
                                    setGame((prev) => {
                                        return {
                                            ...prev,
                                            simSpecs: {
                                                ...prev.simSpecs,
                                                action: null,
                                            },
                                        };
                                    });
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
