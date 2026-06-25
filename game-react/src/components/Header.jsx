import "./Header.css";
import { turnStatus, whoStartsKeys } from "../utils/enums";
import Switch from "./Switch";

function Header({
    game,
    handleStart,
    handleReset,
    handleWhoStartsChange,
    handleGlossary,
    handleProgressToggle,
}) {
    const battleState = game.status;
    const whoStarts = game.whoStarts;

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
            </div>

            <div className="header-settings-container">
                {battleState === turnStatus.SETUP && (
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

                {battleState === turnStatus.SETUP && (
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
                                title={`Progression Mode: Disables most customisation features, enemies and actions. In this mode, the enemy always starts the battle and always has the "best" stats. Furthermore, to access new enemies you must first defeat the preceding one. Some actions are locked until you defeat the corresponding enemy.`}
                            >
                                [?]
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
