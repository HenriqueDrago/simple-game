import "./ControlPanel.css";
import { presetAi } from "../utils/constants";
import { sdmKeys, entityKeys, progKeys, aiKeys } from "../utils/enums";
import { RotateCcw } from "lucide-react";
import { useGame } from "../contexts/GameContext";

function ControlPanel({ entityKey }) {
    const {
        game,
        handleDistributionModeChange,
        handleRandomizeStats,
        handleAiChange,
    } = useGame();

    const entity = game.entities[entityKey];

    const playerLabel =
        entityKey === entityKeys.PLAYER_ONE ? "Player One" : "Player Two";

    return (
        <div className="control-panel-container">
            {!(game.progressMode && entityKey === entityKeys.PLAYER_TWO) && (
                <div className="ai-selector">
                    <label htmlFor={`distribution-mode-${entityKey}`}>
                        {playerLabel} Stats:
                    </label>
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
                        onClick={() => {
                            handleRandomizeStats(entityKey);
                        }}
                        disabled={
                            entity.statDistributionMode !== sdmKeys.CUSTOM
                        }
                        title="Randomize Stats"
                    >
                        <RotateCcw size={18} strokeWidth={2.5} />
                    </button>
                </div>
            )}

            {!(game.progressMode && entityKey === entityKeys.PLAYER_ONE) && (
                <div className="ai-selector">
                    <label htmlFor={`player-ai-${entityKey}`}>
                        {playerLabel} Controller:
                    </label>
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
                                    game.progressMode &&
                                    game.progressStatus[aiKey] ===
                                        progKeys.LOCKED
                                }
                            >
                                {aiData.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}

export default ControlPanel;
