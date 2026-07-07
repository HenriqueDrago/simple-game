import "./GamePanel.css";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";
import StarsPanel from "./StarsPanel";

import { effectKeys, entityKeys, turnStatus } from "../utils/enums";
import EyeOfHeavens from "./EyeOfHeavens";

function GamePanel({
    game,
    updateStatsPoints,
    handleDistributionModeChange,
    handleAiChange,
    handleStarChange,
    handleRandomizeStats,
    handleElementChange,
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
                    <div className="upper-slot left-slot">
                        {/* Empty Slot to balance out the grid */}
                    </div>

                    <div className="upper-slot center-slot">
                        <EyeOfHeavens eyeState={game.eyeOfHeavens} />
                    </div>

                    <div className="upper-slot right-slot">
                        {/* Empty Slot to balance out the grid */}
                    </div>
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
                            />
                        )}
                    </div>

                    <div
                        className={`stats-panels-container ${game[effectKeys.RUNIC_ARRAY] > 0 ? "array-active" : ""}`}
                    >
                        <StatsPanel
                            game={game}
                            updateStatsPoints={updateStatsPoints}
                            entityKey={entityKeys.PLAYER_ONE}
                            handleElementChange={handleElementChange}
                        />
                        <StatsPanel
                            game={game}
                            updateStatsPoints={updateStatsPoints}
                            entityKey={entityKeys.PLAYER_TWO}
                            handleElementChange={handleElementChange}
                        />
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
