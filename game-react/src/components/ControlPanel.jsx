import "./ControlPanel.css";

import { constants } from "../utils/constants";

function ControlPanel({
    handleStart,
    handleReset,
    battleState,
    game,
    setGame,
    handleDistributionModeChange
}) {
    const handleAiChange = (e, entityKey) => {
        setGame((prev) => ({
            ...prev,
            entities: {
                ...prev.entities,
                [entityKey]: {
                    ...prev.entities[entityKey],
                    controller: e.target.value,
                },
            },
        }));
    };

    return (
        <div className="control-panel-container">
            {battleState === "setup" && (
                <button onClick={handleStart}>Start</button>
            )}
            <button onClick={handleReset}>Reset</button>
            {battleState === "setup" && (
                <div className="ai-selector">
                    <label htmlFor="distribution-mode">Stat Distribution:</label>
                    <select
                        id="distribution-mode"
                        value={game.statDistributionMode}
                        onChange={(e) => handleDistributionModeChange(e.target.value)}
                    >
                        {constants.DISTRIBUTION_MODES.map((dType) => (
                            <option key={dType} value={dType}>
                                {dType.charAt(0).toUpperCase() + dType.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {battleState === "setup" && (
                <div className="ai-selector">
                    <label htmlFor="player-ai">Player AI:</label>
                    <select
                        id="player-ai"
                        value={game.entities.player.controller}
                        onChange={(e) => handleAiChange(e, "player")}
                    >
                        {constants.PRESET_AI.map((aiType) => (
                            <option key={aiType} value={aiType}>
                                {aiType.charAt(0).toUpperCase() +
                                    aiType.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {battleState === "setup" && (
                <div className="ai-selector">
                    <label htmlFor="enemy-ai">Enemy AI:</label>
                    <select
                        id="enemy-ai"
                        value={game.entities.enemy.controller}
                        onChange={(e) => handleAiChange(e, "enemy")}
                    >
                        {constants.PRESET_AI.map((aiType) => (
                            <option key={aiType} value={aiType}>
                                {aiType.charAt(0).toUpperCase() +
                                    aiType.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}

export default ControlPanel;
