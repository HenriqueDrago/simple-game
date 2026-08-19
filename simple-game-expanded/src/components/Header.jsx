import "./Header.css";
import Switch from "./Switch";
import { Pause, Play, RotateCcw } from "lucide-react";
import { effectKeys, turnStatus, whoStartsKeys } from "../utils/enums";
import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { DESCRIPTIONS } from "../utils/descriptions";
import { gameSpeeds, INITIAL_GLOSSARY_SPECS } from "../utils/constants";

function Header() {
    const {
        game,
        handleStart,
        handleResetGame,
        handlePause,
        handleWhoStartsChange,
        handleProgressToggle,
        handleSpeed,
    } = useGame();
    const { setUIElements, handleSpawnTooltip, setGlossarySpecs } = useUI();

    const battleState = game.status;
    const isSetup = battleState === turnStatus.SETUP;

    let announcement = null;
    if (battleState === turnStatus.VICTORY) {
        announcement = "P1 WINS!";
    } else if (battleState === turnStatus.DEFEAT) {
        announcement = "P2 WINS!";
    } else if (battleState === turnStatus.DRAW) {
        announcement = "DRAW!";
    } else if (!isSetup) {
        announcement = `ROUND ${game.roundCount}`;
    }

    return (
        <header className="header-scoreboard-bar">
            {/* Left Section: Subdued Title */}
            <div className="header-left">
                <span className="main-title">Simple Game</span>
            </div>

            {/* Center Section: Config Options during Setup, Scoreboard Badge during Battle */}
            <div className="header-center">
                {isSetup ? (
                    <div className="header-settings-container">
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
                                <option value={whoStartsKeys.RANDOM}>
                                    Random
                                </option>
                            </select>
                        </div>

                        <div
                            className="sharp-setting-box"
                            onMouseDown={(e) => {
                                handleSpawnTooltip(
                                    e,
                                    effectKeys.PROGRESSION_MODE,
                                );
                            }}
                        >
                            <label>Progression Mode:</label>
                            <div className="switch-help-container">
                                <Switch
                                    checked={game.progressMode}
                                    handleToggle={handleProgressToggle}
                                    disabled={game.status !== turnStatus.SETUP}
                                />
                                <span
                                    className="hover-help"
                                    title={
                                        DESCRIPTIONS[
                                            effectKeys.PROGRESSION_MODE
                                        ].description
                                    }
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
                                <RotateCcw size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                ) : (
                    announcement && (
                        <div className="scoreboard-badge">
                            <span>{announcement}</span>
                        </div>
                    )
                )}
            </div>

            {/* Right Section: Utility Controls */}
            <div className="header-right">
                {!isSetup && (
                    <button
                        className="sharp-btn-header icon-btn"
                        onClick={handlePause}
                    >
                        {game?.paused ? (
                            <Play size={18} />
                        ) : (
                            <Pause size={18} />
                        )}
                    </button>
                )}

                {!isSetup && (
                    <button
                        className="sharp-btn-header icon-btn"
                        onClick={() => {
                            handleSpeed(1);
                        }}
                    >
                        {gameSpeeds?.[game?.speed]?.label ?? "Spd"}
                    </button>
                )}

                {isSetup ? (
                    <button className="sharp-btn-header" onClick={handleStart}>
                        Start
                    </button>
                ) : (
                    <button
                        className="sharp-btn-header"
                        onClick={() => {
                            setUIElements((prev) => ({
                                ...prev,
                                history: false,
                                continueModal: false,
                            }));
                            handleResetGame();
                        }}
                    >
                        Reset
                    </button>
                )}

                <button
                    className="sharp-btn-header"
                    onClick={() => {
                        setGlossarySpecs(INITIAL_GLOSSARY_SPECS);
                        setUIElements((prev) => ({
                            ...prev,
                            glossary: true,
                        }));
                    }}
                >
                    Glossary
                </button>

                {!isSetup && (
                    <button
                        className="sharp-btn-header"
                        onClick={() => {
                            setUIElements((prev) => ({
                                ...prev,
                                history: !prev.history,
                            }));
                        }}
                    >
                        History
                    </button>
                )}

                <button
                    className="sharp-btn-header"
                    onClick={() => {
                        setUIElements((prev) => ({
                            ...prev,
                            hardResetModal: true,
                        }));
                    }}
                >
                    Hard Reset
                </button>
            </div>
        </header>
    );
}

export default Header;
