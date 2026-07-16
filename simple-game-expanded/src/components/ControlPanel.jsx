import "./ControlPanel.css";
import { presetAi } from "../utils/constants";
import { sdmKeys, entityKeys, progKeys, aiKeys } from "../utils/enums";
import { RotateCcw } from "lucide-react";

function ControlPanel({
    handleAiChange,
    handleDistributionModeChange,
    entityKey,
    statDistributionMode,
    controller,
    game,
    handleRandomizeStats
}) {
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
                        value={statDistributionMode}
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
                            disabled={controller === aiKeys.HUMAN}
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
                        disabled={statDistributionMode !== sdmKeys.CUSTOM}
                        title="Randomize Stats"
                    >
                        <RotateCcw size={18} strokeWidth={2.5} />
                    </button >
                </div>
            )}

            {!(game.progressMode && entityKey === entityKeys.PLAYER_ONE) && (
                <div className="ai-selector">
                    <label htmlFor={`player-ai-${entityKey}`}>
                        {playerLabel} Controller:
                    </label>
                    <select
                        id={`player-ai-${entityKey}`}
                        value={controller}
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
