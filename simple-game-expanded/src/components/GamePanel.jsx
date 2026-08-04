import "./GamePanel.css";
import PlayerPanel from "./PlayerPanel";
import StarsPanel from "./StarsPanel";
import Switch from "./Switch";
import { RotateCcw } from "lucide-react";

import {
    effectKeys,
    entityKeys,
    turnStatus,
    whoStartsKeys,
} from "../utils/enums";
import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";

function GamePanel() {
    const { game, handleWhoStartsChange, handleProgressToggle } = useGame();
    const { setUIElements } = useUI();

    const isSetup = game.status === turnStatus.SETUP;

    return (
        <div className="game-panel-container">
            {isSetup && (
                <div className="game-panel-settings-container">
                    <div
                        className={`sharp-setting-box ${
                            game.progressMode ? "disabled" : ""
                        }`}
                    >
                        <label htmlFor="who-starts-select">
                            Who goes first:
                        </label>
                        <select
                            id="who-starts-select"
                            className="sharp-select"
                            value={game.whoStarts}
                            onChange={(e) =>
                                handleWhoStartsChange(e.target.value)
                            }
                        >
                            <option value={whoStartsKeys.PLAYER_ONE}>
                                Player One
                            </option>
                            <option value={whoStartsKeys.PLAYER_TWO}>
                                Player Two
                            </option>
                            <option value={whoStartsKeys.RANDOM}>Random</option>
                        </select>
                    </div>

                    <div className="sharp-setting-box">
                        <label>Progression Mode:</label>
                        <div className="switch-help-container">
                            <Switch
                                checked={game.progressMode}
                                handleToggle={handleProgressToggle}
                                disabled={game.status !== turnStatus.SETUP}
                            />
                            <span
                                className="hover-help"
                                title={`Progression Mode: Disables most customisation features, enemies and actions. In this mode, the enemy always starts the battle and always has the "best" stats. Furthermore, to access new enemies and see their glossary entries you must first defeat the preceding one. Some actions are locked until you defeat the corresponding enemy.`}
                            >
                                [?]
                            </span>
                        </div>
                        <button
                            className="sharp-btn-icon"
                            onClick={() => {
                                setUIElements((prev) => {
                                    return {
                                        ...prev,
                                        resetModal: true,
                                    };
                                });
                            }}
                            title={"Reset Progression Data"}
                        >
                            <RotateCcw size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            <div className="game-panel-entities-container">
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
        </div>
    );
}

export default GamePanel;