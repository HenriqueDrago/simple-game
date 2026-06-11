import "./GamePanel.css";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";

import { entityKeys, turnStatus } from "../utils/enums";

function GamePanel({
    game,
    updateStatsPoints,
    handleDistributionModeChange,
    handleAiChange,
}) {
    return (
        <div className="game-panel-container">
            {game.status === turnStatus.SETUP && (
                <ControlPanel
                    handleDistributionModeChange={handleDistributionModeChange}
                    handleAiChange={handleAiChange}
                    entityKey={entityKeys.PLAYER_ONE}
                    statDistributionMode={
                        game.entities[entityKeys.PLAYER_ONE]
                            .statDistributionMode
                    }
                    controller={game.entities[entityKeys.PLAYER_ONE].controller}
                ></ControlPanel>
            )}
            <div className={`stats-panels-container ${game.remainingArray > 0 ? 'array-active' : ''}`}>
                <StatsPanel
                    game={game}
                    updateStatsPoints={updateStatsPoints}
                    entityKey={entityKeys.PLAYER_ONE}
                ></StatsPanel>
                <StatsPanel
                    game={game}
                    updateStatsPoints={updateStatsPoints}
                    entityKey={entityKeys.PLAYER_TWO}
                ></StatsPanel>
            </div>
            {game.status === turnStatus.SETUP && (
                <ControlPanel
                    handleDistributionModeChange={handleDistributionModeChange}
                    handleAiChange={handleAiChange}
                    entityKey={entityKeys.PLAYER_TWO}
                    statDistributionMode={
                        game.entities[entityKeys.PLAYER_TWO]
                            .statDistributionMode
                    }
                    controller={game.entities[entityKeys.PLAYER_TWO].controller}
                ></ControlPanel>
            )}
        </div>
    );
}

export default GamePanel;
