import "./ControlPanel.css";
import { presetAi } from "../utils/constants";
import { sdmKeys, entityKeys } from "../utils/enums";

function ControlPanel({
    handleAiChange,
    handleDistributionModeChange,
    entityKey,
    statDistributionMode,
    controller
}) {
    const playerLabel = entityKey === entityKeys.PLAYER_ONE ? "Player One" : "Player Two";

    return (
        <div className="control-panel-container">
            <div className="ai-selector">
                <label htmlFor={`distribution-mode-${entityKey}`}>{playerLabel} Stats:</label>
                <select
                    id={`distribution-mode-${entityKey}`}
                    value={statDistributionMode}
                    onChange={(e) =>
                        handleDistributionModeChange(e.target.value, entityKey)
                    }
                >
                    <option value={sdmKeys.RANDOM}>Random</option>
                    <option value={sdmKeys.CUSTOM}>Custom</option>
                    <option value={sdmKeys.BEST}>"Best"</option>
                    <option value={sdmKeys.FULL_DEF}>Full Def</option>
                    <option value={sdmKeys.FULL_STR}>Full Str</option>
                </select>
            </div>

            <div className="ai-selector">
                <label htmlFor={`player-ai-${entityKey}`}>{playerLabel} Controller:</label>
                <select
                    id={`player-ai-${entityKey}`}
                    value={controller}
                    onChange={(e) => handleAiChange(e.target.value, entityKey)}
                >
                    {Object.entries(presetAi).map(([aiKey, aiData]) => (
                        <option key={aiKey} value={aiKey}>
                            {aiData.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default ControlPanel;