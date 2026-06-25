import "./Header.css";
import { turnStatus, whoStartsKeys } from "../utils/enums";

function Header({
    game,
    handleStart,
    handleReset,
    handleWhoStartsChange,
    handleGlossary,
}) {
    const battleState = game.status;
    const whoStarts = game.whoStarts;

    // Determine the single active announcement
    let announcement = null;
    if (battleState === turnStatus.VICTORY) announcement = "Player One Wins!";
    else if (battleState === turnStatus.DEFEAT)
        announcement = "Player Two Wins!";
    else if (battleState === turnStatus.DRAW) announcement = "Draw!";
    else if (battleState !== turnStatus.SETUP)
        announcement = `Round ${Math.ceil(game.turnCount / 2)}`;

    return (
        <div className="header-container">
            <div className="header-announcement-container">
                <h1 className="main-header-text">Simple RPG</h1>

                {announcement && (
                    <h2 className="sub-announcer-text">{announcement}</h2>
                )}
            </div>

            <div className="header-button-container">
                {battleState === turnStatus.SETUP && (
                    <button className="sharp-btn" onClick={handleStart}>
                        Start
                    </button>
                )}
                <button className="sharp-btn" onClick={handleReset}>
                    Reset
                </button>

                <button
                    className="sharp-btn"
                    onClick={() => {
                        handleGlossary(true);
                    }}
                >
                    Glossary
                </button>

                {battleState === turnStatus.SETUP && (
                    <div className="who-starts-select-container">
                        <label htmlFor="who-starts-select">
                            Who goes first:
                        </label>
                        <select
                            id="who-starts-select"
                            className="sharp-select"
                            value={whoStarts}
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
                )}
            </div>
        </div>
    );
}

export default Header;
