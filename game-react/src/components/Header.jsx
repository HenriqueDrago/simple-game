import "./Header.css";
import { turnStatus } from "../utils/enums";

function Header({ battleState, handleStart, handleReset }) {
    return (
        <div className="header-container">
            <div className="header-announcement-container">
                <h1 className="main-header-text">Basic RPG (React)</h1>
                {battleState === turnStatus.VICTORY && (
                    <h2 className="win-text">Player One Wins!</h2>
                )}
                {battleState === turnStatus.DEFEAT && (
                    <h2 className="lose-text">Player Two Wins!</h2>
                )}
                {battleState === turnStatus.DRAW && (
                    <h2 className="lose-text">Draw!</h2>
                )}
            </div>

            <div className="header-button-container">
                {battleState === turnStatus.SETUP && (
                    <button onClick={handleStart}>Start</button>
                )}
                <button onClick={handleReset}>Reset</button>
            </div>
        </div>
    );
}

export default Header;
