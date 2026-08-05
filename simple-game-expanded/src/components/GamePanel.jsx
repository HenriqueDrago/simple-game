import "./GamePanel.css";
import PlayerPanel from "./PlayerPanel";
import Timeline from "./Timeline";

import { entityKeys } from "../utils/enums";

function GamePanel() {
    return (
        <div className="game-panel-container">
            <Timeline />

            <div className="stats-panels-container">
                <div className="player-panel-wrapper p1-wrapper">
                    <PlayerPanel entityKey={entityKeys.PLAYER_ONE} />
                </div>
                <div className="player-panel-wrapper p2-wrapper">
                    <PlayerPanel
                        entityKey={entityKeys.PLAYER_TWO}
                        reversed={true}
                    />
                </div>
            </div>
        </div>
    );
}

export default GamePanel;