import "./GamePanel.css";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";
import ElementalWheel from "./ElementalWheel";

import { elementalKeys, entityKeys, turnStatus } from "../utils/enums";
import EyeOfHeavens from "./EyeOfHeavens";

function GamePanel({
    game,
    updateStatsPoints,
    handleDistributionModeChange,
    handleAiChange,
}) {
    const onlyEye = game.elementalWheel === elementalKeys.INACTIVE;
    
    const isSetupPhase = game.status === turnStatus.SETUP;

    return (
        <div className="game-panel-container">
            {isSetupPhase && (
                <ControlPanel
                    handleDistributionModeChange={handleDistributionModeChange}
                    handleAiChange={handleAiChange}
                    entityKey={entityKeys.PLAYER_ONE}
                    statDistributionMode={
                        game.entities[entityKeys.PLAYER_ONE].statDistributionMode
                    }
                    controller={game.entities[entityKeys.PLAYER_ONE].controller}
                />
            )}
            
            <div className="central-game-panel">
                <div className={`game-panel-upper-elements-container ${onlyEye ? "only-eye" : ""}`}>
                    <ElementalWheel element={game.elementalWheel} />
                    <EyeOfHeavens eyeState={game.eyeOfHeavens} />
                </div>

                <div
                    className={`stats-panels-container ${game.remainingArray > 0 ? "array-active" : ""}`}
                >
                    <StatsPanel
                        game={game}
                        updateStatsPoints={updateStatsPoints}
                        entityKey={entityKeys.PLAYER_ONE}
                    />
                    <StatsPanel
                        game={game}
                        updateStatsPoints={updateStatsPoints}
                        entityKey={entityKeys.PLAYER_TWO}
                    />
                </div>
            </div>
            
            {isSetupPhase && (
                <ControlPanel
                    handleDistributionModeChange={handleDistributionModeChange}
                    handleAiChange={handleAiChange}
                    entityKey={entityKeys.PLAYER_TWO}
                    statDistributionMode={
                        game.entities[entityKeys.PLAYER_TWO].statDistributionMode
                    }
                    controller={game.entities[entityKeys.PLAYER_TWO].controller}
                />
            )}
        </div>
    );
}

export default GamePanel;