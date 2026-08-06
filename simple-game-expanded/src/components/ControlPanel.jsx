import "./ControlPanel.css";
import { presetAi } from "../utils/constants";
import {
    sdmKeys,
    entityKeys,
    progKeys,
    aiKeys,
    turnStatus,
    effectKeys,
} from "../utils/enums";
import { RotateCcw } from "lucide-react";
import { useGame } from "../contexts/GameContext";

function ControlPanel({ entityKey }) {
    const {
        game,
        handleDistributionModeChange,
        handleRandomizeStats,
        handleAiChange,
    } = useGame();

    if (game.status !== turnStatus.SETUP) {
        return null;
    }

    const entity = game.entities[entityKey];

    return (
        <div className="control-panel-container">
            {!(
                game[effectKeys.PROGRESSION_MODE] &&
                entityKey === entityKeys.PLAYER_TWO
            ) && (
                <div className="control-box">
                    <label
                        className="control-box-label"
                        htmlFor={`distribution-mode-${entityKey}`}
                    >
                        Attributes
                    </label>
                    <div className="control-box-input-group">
                        <select
                            id={`distribution-mode-${entityKey}`}
                            value={entity.statDistributionMode}
                            onChange={(e) =>
                                handleDistributionModeChange(
                                    e.target.value,
                                    entityKey,
                                )
                            }
                        >
                            <option value={sdmKeys.CUSTOM}>Custom</option>
                            <option
                                value={sdmKeys.BEST}
                                disabled={entity.controller === aiKeys.HUMAN}
                            >
                                "Best"
                            </option>
                            <option value={sdmKeys.FULL_DEF}>Full Def</option>
                            <option value={sdmKeys.FULL_STR}>Full Str</option>
                            <option value={sdmKeys.BALANCED}>Balanced</option>
                        </select>

                        <button
                            className="sharp-btn-icon"
                            onClick={() => handleRandomizeStats(entityKey)}
                            disabled={
                                entity.statDistributionMode !== sdmKeys.CUSTOM
                            }
                            title="Randomize Stats"
                        >
                            <RotateCcw size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {!(
                game[effectKeys.PROGRESSION_MODE] &&
                entityKey === entityKeys.PLAYER_ONE
            ) && (
                <div className="control-box">
                    <label
                        className="control-box-label"
                        htmlFor={`player-ai-${entityKey}`}
                    >
                        Controller
                    </label>
                    <div className="control-box-input-group">
                        <select
                            id={`player-ai-${entityKey}`}
                            value={entity.controller}
                            onChange={(e) =>
                                handleAiChange(e.target.value, entityKey)
                            }
                        >
                            {Object.entries(presetAi).map(([aiKey, aiData]) => (
                                <option
                                    key={aiKey}
                                    value={aiKey}
                                    disabled={
                                        game[effectKeys.PROGRESSION_MODE] &&
                                        game.progressStatus[aiKey] ===
                                            progKeys.LOCKED
                                    }
                                >
                                    {aiData.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ControlPanel;
