import "./GamePanel.css";
import PlayerPanel from "./PlayerPanel";
import StarsPanel from "./StarsPanel";

import { effectKeys, entityKeys } from "../utils/enums";
import { useGame } from "../contexts/GameContext";

function GamePanel() {
    const { game } = useGame();

    return (
        <div className="game-panel-container">
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

            <div className="stats-panels-container">
                <PlayerPanel entityKey={entityKeys.PLAYER_ONE} />
                <PlayerPanel
                    entityKey={entityKeys.PLAYER_TWO}
                    reversed={true}
                />
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
    );
}

export default GamePanel;
