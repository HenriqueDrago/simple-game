/* eslint-disable react-hooks/exhaustive-deps */
import Header from "./components/Header.jsx";
import GamePanel from "./components/GamePanel.jsx";
import ActionPanel from "./components/ActionPanel.jsx";
import TooltipDisplay from "./components/TooltipDisplay.jsx";
import Glossary from "./components/Glossary.jsx";
import Modal from "./components/Modal.jsx";
import ContinueModal from "./components/ContinueModal.jsx";
import History from "./components/History.jsx";

import "./App.css";

import { useGame } from "./contexts/GameContext.js";
import { useUI } from "./contexts/UIContext.js";
import {
    INITIAL_GAME_STATE,
    INITIAL_GLOSSARY_SPECS,
} from "./utils/constants.js";
import { speedKeys, turnStatus } from "./utils/enums.js";
import { useEffect } from "react";

// App Component
function App() {
    const { game, setGame, handleHardResetGame, handleSpeed, handleSpeedAbs } =
        useGame();
    const {
        UIElements,
        setUIElements,
        tooltipStack,
        handleClearTooltip,
        setGlossarySpecs,
    } = useUI();

    // Event Listeners
    useEffect(() => {
        function handleKeyDown(e) {
            // Pause/Unpause
            if (
                (e.code === "Space" || e.key === " ") &&
                game.status !== turnStatus.SETUP
            ) {
                e.preventDefault();
                setGame((prev) => {
                    return {
                        ...prev,
                        paused: !prev?.paused,
                    };
                });
            }

            // Speed Controls
            if (game.status !== turnStatus.SETUP) {
                if (e.code === "KeyF" || e.key === "f" || e.key === "F") {
                    handleSpeed(1);
                } else if (
                    e.key === "1" ||
                    e.code === "Digit1" ||
                    e.code === "Numpad1"
                ) {
                    e.preventDefault();
                    handleSpeedAbs(speedKeys.ONE);
                } else if (
                    e.key === "2" ||
                    e.code === "Digit2" ||
                    e.code === "Numpad2"
                ) {
                    e.preventDefault();
                    handleSpeedAbs(speedKeys.TWO);
                } else if (
                    e.key === "3" ||
                    e.code === "Digit3" ||
                    e.code === "Numpad3"
                ) {
                    e.preventDefault();
                    handleSpeedAbs(speedKeys.INF);
                }
            }

            // History
            if (game.status !== turnStatus.SETUP) {
                if (e.code === "KeyH" || e.key === "h" || e.key === "H") {
                    setUIElements((prev) => ({
                        ...prev,
                        history: !prev.history,
                    }));
                }
            }

            // Glossary
            if (e.code === "KeyG" || e.key === "g" || e.key === "G") {
                setGlossarySpecs(INITIAL_GLOSSARY_SPECS);
                setUIElements((prev) => ({
                    ...prev,
                    glossary: !prev.glossary,
                }));
            }

            if (e.key === "Shift") {
                if (e.repeat) {
                    return;
                }

                e.preventDefault();
                setGame((prev) => {
                    return {
                        ...prev,
                        simSpecs: {
                            ...prev.simSpecs,
                            commit: true,
                            starfall: true,
                        },
                    };
                });
            }
        }

        function handleKeyUp(e) {
            if (e.key === "Shift") {
                e.preventDefault();
                setGame((prev) => {
                    return {
                        ...prev,
                        simSpecs: {
                            ...prev.simSpecs,
                            commit: false,
                            starfall: false,
                        },
                    };
                });
            }
        }

        function handleBlur() {
            setGame((prev) => ({
                ...prev,
                paused: game.status !== turnStatus.SETUP ? true : prev.paused,
                simSpecs: {
                    ...prev.simSpecs,
                    commit: false,
                    starfall: false,
                },
            }));
        }

        // Add listeners
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
        };
    }, [game.status, game.speed, setGame, setUIElements]);

    // Early Return
    if (UIElements.continueModal) {
        return <ContinueModal />;
    }

    return (
        <div className="app-container">
            {tooltipStack.length > 0 && (
                <div
                    className="backdrop"
                    onClick={handleClearTooltip}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        handleClearTooltip();
                    }}
                />
            )}
            {UIElements.glossary && (
                <div
                    className="backdrop"
                    onClick={() => {
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                glossary: false,
                            };
                        });
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                glossary: false,
                            };
                        });
                    }}
                />
            )}
            {UIElements.resetModal && (
                <Modal
                    mainText={"Do you wish to reset your progress?"}
                    subText={"*This action is irreversible."}
                    isConfirmOnly={false}
                    rejectAction={() => {
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                resetModal: false,
                            };
                        });
                    }}
                    confirmAction={() => {
                        setGame((prev) => {
                            return {
                                ...prev,
                                progressStatus: {
                                    ...INITIAL_GAME_STATE.progressStatus,
                                },
                            };
                        });

                        setUIElements((prev) => {
                            return {
                                ...prev,
                                resetModal: false,
                            };
                        });
                    }}
                    confirmText="Continue"
                    rejectText={"Cancel"}
                />
            )}

            {UIElements.hardResetModal && (
                <Modal
                    mainText={"Are you sure you wish to proceed?"}
                    subText={
                        "*This action will delete all game data. This action is irreversible."
                    }
                    isConfirmOnly={false}
                    rejectAction={() => {
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                hardResetModal: false,
                            };
                        });
                    }}
                    confirmAction={() => {
                        handleHardResetGame();

                        setUIElements((prev) => {
                            return {
                                ...prev,
                                hardResetModal: false,
                            };
                        });
                    }}
                    confirmText="Continue"
                    rejectText={"Cancel"}
                />
            )}

            <Glossary />
            <TooltipDisplay />

            <Header />
            <div className="app-main-layout">
                <div className="game-panels-container">
                    <GamePanel />
                    <ActionPanel />
                </div>
                <History />
            </div>
        </div>
    );
}

export default App;
