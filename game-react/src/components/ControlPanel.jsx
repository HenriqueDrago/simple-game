import "./ControlPanel.css";

import {  presetAi } from "../utils/constants";

import { sdmKeys } from "../utils/enums";

function ControlPanel({
    handleAiChange,
    handleDistributionModeChange,
    entityKey,
    statDistributionMode,
    controller
}) {
    return (
        <div className="control-panel-container">
            <div className="ai-selector">
                <label htmlFor="distribution-mode">Stat Distribution:</label>
                <select
                    id="distribution-mode"
                    value={statDistributionMode}
                    onChange={(e) =>
                        handleDistributionModeChange(e.target.value, entityKey)
                    }
                >
                    <option value={sdmKeys.RANDOM}>Random</option>
                    <option value={sdmKeys.CUSTOM}>Custom</option>
                    <option value={sdmKeys.BEST}>"Best"</option>
                </select>
            </div>

            <div className="ai-selector">
                <label htmlFor="player-ai">Player One AI:</label>
                <select
                    id="player-ai"
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
