import "./ControlPanel.css";

import { constants, presetAi } from "../utils/constants";

import { turnStatus, entityKeys } from "../utils/enums";

function ControlPanel({
    battleState,
    game,
    setGame,
    handleDistributionModeChange,
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
            
            {battleState === turnStatus.SETUP && (
                <div className="ai-selector">
                    <label htmlFor="distribution-mode">
                        Stat Distribution:
                    </label>
                    <select
                        id="distribution-mode"
                        value={game.statDistributionMode}
                        onChange={(e) =>
                            handleDistributionModeChange(e.target.value)
                        }
                    >
                        {constants.DISTRIBUTION_MODES.map((dType) => (
                            <option key={dType} value={dType}>
                                {dType.charAt(0).toUpperCase() + dType.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {battleState === turnStatus.SETUP && (
                <div className="ai-selector">
                    <label htmlFor="player-ai">Player AI:</label>
                    <select
                        id="player-ai"
                        value={game.entities[entityKeys.PLAYER_ONE].controller}
                        onChange={(e) =>
                            handleAiChange(e, entityKeys.PLAYER_ONE)
                        }
                    >
                        {Object.entries(presetAi).map(([aiKey, aiData]) => (
                            <option key={aiKey} value={aiKey}>
                                {aiData.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {battleState === turnStatus.SETUP && (
                <div className="ai-selector">
                    <label htmlFor="enemy-ai">Enemy AI:</label>
                    <select
                        id="enemy-ai"
                        value={game.entities[entityKeys.PLAYER_TWO].controller}
                        onChange={(e) =>
                            handleAiChange(e, entityKeys.PLAYER_TWO)
                        }
                    >
                        {Object.entries(presetAi).map(([aiKey, aiData]) => (
                            <option key={aiKey} value={aiKey}>
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
