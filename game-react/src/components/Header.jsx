import "./Header.css";
import { turnStatus, whoStartsKeys } from "../utils/enums";

function Header({ game, handleStart, handleReset, handleWhoStartsChange }) {
    const battleState = game.status;
    const whoStarts = game.whoStarts;
    return (
        <div className="header-container">
            <div className="header-announcement-container">
                <h1 className="main-header-text">Basic RPG (React)</h1>
                {battleState === turnStatus.VICTORY && (
                    <h2 className="sub-announcer-text">Player One Wins!</h2>
                )}
                {battleState === turnStatus.DEFEAT && (
                    <h2 className="sub-announcer-text">Player Two Wins!</h2>
                )}
                {battleState === turnStatus.DRAW && (
                    <h2 className="sub-announcer-text">Draw!</h2>
                )}
                {battleState !== turnStatus.SETUP && (
                    <h3 className="sub-announcer-text">Turn {game.turnCount}</h3>
                )}
            </div>

            <div className="header-button-container">
                {battleState === turnStatus.SETUP && (
                    <button onClick={handleStart}>Start</button>
                )}
                <button onClick={handleReset}>Reset</button>
                {battleState === turnStatus.SETUP && (
                    <div className="who-starts-select-container">
                        <label htmlFor="who-starts-select">Who goes first:</label>
                        <select
                            id="who-starts-select"
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
