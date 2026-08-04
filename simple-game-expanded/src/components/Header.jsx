import "./Header.css";
import { turnStatus } from "../utils/enums";

import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";

function Header() {
    const { game, handleStart, handleResetGame, handlePause } = useGame();
    const { setUIElements } = useUI();

    const battleState = game.status;

    let announcement = null;
    if (battleState === turnStatus.VICTORY) {
        announcement = "Player One Wins!";
    } else if (battleState === turnStatus.DEFEAT) {
        announcement = "Player Two Wins!";
    } else if (battleState === turnStatus.DRAW) {
        announcement = "Draw!";
    } else if (battleState !== turnStatus.SETUP) {
        announcement = `Round ${game.roundCount}`;
    }

    return (
        <div className="header-container">
            <div className="header-announcement-container">
                <h1 className="main-header-text">Simple Game</h1>
                {announcement && (
                    <h2 className="sub-announcer-text">{announcement}</h2>
                )}
            </div>

            <div className="header-button-container">
                {battleState === turnStatus.SETUP ? (
                    <button className="sharp-btn" onClick={handleStart}>
                        Start
                    </button>
                ) : (
                    <button
                        className="sharp-btn"
                        onClick={() => {
                            setUIElements((prev) => {
                                return {
                                    ...prev,
                                    history: false,
                                    continueModal: false,
                                };
                            });

                            handleResetGame();
                        }}
                    >
                        Reset
                    </button>
                )}

                {battleState !== turnStatus.SETUP && (
                    <button
                        className="sharp-btn"
                        onClick={() => {
                            handlePause()
                        }}
                    >
                        {game?.paused ? "Unpause" : "Pause"}
                    </button>
                )}

                <button
                    className="sharp-btn"
                    onClick={() => {
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                glossary: true,
                            };
                        });
                    }}
                >
                    Glossary
                </button>
                {/* <button
                    className={`sharp-btn ${battleState === turnStatus.SETUP ? "disabled" : ""}`}
                    onClick={() => {
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                timeline: !prev.timeline,
                            };
                        });
                    }}
                >
                    Timeline
                </button> */}
            </div>
        </div>
    );
}

export default Header;
