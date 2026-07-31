import "./GamePanel.css";
import ControlPanel from "./ControlPanel";
import StatsPanel from "./StatsPanel";
import StarsPanel from "./StarsPanel";

import { effectKeys, entityKeys, turnStatus } from "../utils/enums";
import { useGame } from "../contexts/GameContext";

function GamePanel() {
    const { game } = useGame();
    const isSetupPhase = game.status === turnStatus.SETUP;

    return (
        <div className="game-panel-container">
            {isSetupPhase && <ControlPanel entityKey={entityKeys.PLAYER_ONE} />}

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
                                entityKey={entityKeys.PLAYER_ONE}
                                reversed={true}
                            />
                        )}
                    </div>

                    <div className={`stats-panels-container`}>
                        <div className="player-panel-wrapper">
                            <StatsPanel entityKey={entityKeys.PLAYER_ONE} />
                        </div>

                        <div className="player-panel-wrapper panel-reversed">
                            <StatsPanel entityKey={entityKeys.PLAYER_TWO} />
                        </div>
                    </div>

                    <div className="stars-wrapper right-stars">
                        {game.entities[entityKeys.PLAYER_TWO].states[
                            effectKeys.STARGAZER
                        ] && (
                            <StarsPanel
                                entityKey={entityKeys.PLAYER_TWO}
                                reversed={false}
                            />
                        )}
                    </div>
                </div>
            </div>

            {isSetupPhase && <ControlPanel entityKey={entityKeys.PLAYER_TWO} />}
        </div>
    );
}

export default GamePanel;
