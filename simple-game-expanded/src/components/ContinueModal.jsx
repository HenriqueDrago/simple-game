import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import "./ContinueModal.css";

export default function ContinueModal() {
    const { handleResetGame, handleHardResetGame, setGame } = useGame();
    const { UIElements, setUIElements } = useUI();

    if (!UIElements.continueModal) {
        return null;
    }

    return (
        <div className="continue-modal-container">
            <div className="continue-modal-section">
                <span className="continue-modal-main-text">
                    An ongoing game state was found. Do you wish to continue the
                    match?
                </span>
                <div className="continue-modal-buttons">
                    <button
                        className="sharp-btn"
                        onClick={() => {
                            setUIElements((prev) => {
                                return {
                                    ...prev,
                                    continueModal: false,
                                };
                            });

                            setGame((prev) => {
                                return {
                                    ...prev,
                                    paused: false,
                                }
                            })
                        }}
                    >
                        Continue
                    </button>
                    <button
                        className="sharp-btn"
                        onClick={() => {
                            setUIElements((prev) => {
                                return {
                                    ...prev,
                                    continueModal: false,
                                };
                            });

                            handleResetGame();
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="continue-modal-divider"></div>

            <div className="continue-modal-section danger-section">
                <span className="continue-modal-secondary-text">
                    If your game is currently broken, you may also try a Hard
                    Reset.
                </span>
                <span className="continue-modal-sub-text">
                    Warning: This will clear all your progress and settings.
                </span>
                <button
                    className="sharp-btn danger"
                    onClick={() => {
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                history: false,
                                continueModal: false,
                            };
                        });

                        handleHardResetGame();
                    }}
                >
                    Hard Reset
                </button>
            </div>
        </div>
    );
}
