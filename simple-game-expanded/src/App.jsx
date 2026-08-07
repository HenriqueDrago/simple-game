import { useEffect } from "react";
import Header from "./components/Header.jsx";
import GamePanel from "./components/GamePanel.jsx";
import ActionPanel from "./components/ActionPanel.jsx";
import TooltipDisplay from "./components/TooltipDisplay.jsx";
import Glossary from "./components/Glossary.jsx";
import Modal from "./components/Modal.jsx";
import ContinueModal from "./components/ContinueModal.jsx";
import Timeline from "./components/Timeline.jsx";
import History from "./components/History.jsx";

import "./App.css";

import { turnStatus } from "./utils/enums.js";
import { useGame } from "./contexts/GameContext.js";
import { useUI } from "./contexts/UIContext.js";
import { INITIAL_GAME_STATE } from "./utils/constants.js";

// App Component
function App() {
    const { game, setGame, handleHardResetGame } = useGame();
    const { UIElements, setUIElements, tooltipStack, handleClearTooltip } =
        useUI();

    // Continue Modal
    useEffect(() => {
        if (game.status !== turnStatus.SETUP) {
            setUIElements((prev) => {
                return {
                    ...prev,
                    continueModal: true,
                };
            });
            setGame((prev) => {
                return {
                    ...prev,
                    paused: true,
                };
            });
        }
    }, []);

    // Early Return
    if (UIElements.continueModal) {
        return <ContinueModal />;
    }

    return (
        <div className="app-container">
            <History />

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
                    subText={"*This action will delete all game data. This action is irreversible."}
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

            <Header/>
            <GamePanel/>
            <ActionPanel/>
        </div>
    );
}

export default App;
