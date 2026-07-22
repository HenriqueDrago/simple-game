import "./GamePanel.css";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";
import StarsPanel from "./StarsPanel";
import MitigationTracker from "./MitigationTracker"; // Imported tracker component

import { effectKeys, entityKeys, turnStatus } from "../utils/enums";

function GamePanel({
    game,
    updateStatsPoints,
    handleDistributionModeChange,
    handleAiChange,
    handleStarChange,
    handleRandomizeStats,
    handleElementChange,
    handleSetTooltip,
    handleConstellation,
    handleClearTooltip,
    handleAction,
}) {
    const isSetupPhase = game.status === turnStatus.SETUP;

    return (
        <div className="game-panel-container">
            {isSetupPhase && (
                <ControlPanel
                    handleDistributionModeChange={handleDistributionModeChange}
                    handleAiChange={handleAiChange}
                    entityKey={entityKeys.PLAYER_ONE}
                    statDistributionMode={
                        game.entities[entityKeys.PLAYER_ONE]
                            .statDistributionMode
                    }
                    controller={game.entities[entityKeys.PLAYER_ONE].controller}
                    game={game}
                    handleRandomizeStats={handleRandomizeStats}
                />
            )}

            <div className="central-game-panel">
                <div className="game-panel-upper-elements-container">
                    {/* Empty */}
                </div>

                <div className="stars-and-game-panel-container">
                    <div className="stars-wrapper left-stars">
                        {game.entities[entityKeys.PLAYER_ONE].states[
                            effectKeys.STARGAZER
                        ] && (
                            <StarsPanel
                                game={game}
                                entityKey={entityKeys.PLAYER_ONE}
                                handleStarChange={handleStarChange}
                                reversed={true}
                                handleSetTooltip={handleSetTooltip}
                            />
                        )}
                    </div>

                    <div
                        className={`stats-panels-container ${game[effectKeys.RUNIC_ARRAY] > 0 ? "array-active" : ""}`}
                    >
                        <div className="player-panel-wrapper">
                            <MitigationTracker
                                entity={game.entities[entityKeys.PLAYER_ONE]}
                                handleSetTooltip={handleSetTooltip}
                            />
                            <StatsPanel
                                game={game}
                                updateStatsPoints={updateStatsPoints}
                                entityKey={entityKeys.PLAYER_ONE}
                                handleElementChange={handleElementChange}
                                handleSetTooltip={handleSetTooltip}
                                handleConstellation={handleConstellation}
                                handleClearTooltip={handleClearTooltip}
                                handleAction={handleAction}
                            />
                        </div>

                        <div className="player-panel-wrapper panel-reversed">
                            <MitigationTracker
                                entity={game.entities[entityKeys.PLAYER_TWO]}
                                handleSetTooltip={handleSetTooltip}
                            />
                            <StatsPanel
                                game={game}
                                updateStatsPoints={updateStatsPoints}
                                entityKey={entityKeys.PLAYER_TWO}
                                handleElementChange={handleElementChange}
                                handleSetTooltip={handleSetTooltip}
                                handleConstellation={handleConstellation}
                                handleClearTooltip={handleClearTooltip}
                                handleAction={handleAction}
                            />
                        </div>
                    </div>

                    <div className="stars-wrapper right-stars">
                        {game.entities[entityKeys.PLAYER_TWO].states[
                            effectKeys.STARGAZER
                        ] && (
                            <StarsPanel
                                game={game}
                                entityKey={entityKeys.PLAYER_TWO}
                                handleStarChange={handleStarChange}
                                reversed={false}
                                handleSetTooltip={handleSetTooltip}
                            />
                        )}
                    </div>
                </div>
            </div>

            {isSetupPhase && (
                <ControlPanel
                    handleDistributionModeChange={handleDistributionModeChange}
                    handleAiChange={handleAiChange}
                    entityKey={entityKeys.PLAYER_TWO}
                    statDistributionMode={
                        game.entities[entityKeys.PLAYER_TWO]
                            .statDistributionMode
                    }
                    controller={game.entities[entityKeys.PLAYER_TWO].controller}
                    game={game}
                    handleRandomizeStats={handleRandomizeStats}
                />
            )}
        </div>
    );
}

export default GamePanel;
