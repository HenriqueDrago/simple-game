import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import "./CompletionModal.css";

export default function CompletionModal() {
    const { setGame, handleResetProgression } = useGame();
    const { setUIElements } = useUI();

    return (
        <div className="completion-modal-overlay">
            <div className="completion-modal-container">
                <div className="completion-header">
                    <span className="completion-subtitle">
                        Campaign Complete
                    </span>
                    <h1 className="completion-title">Congratulations!</h1>
                </div>

                <div className="completion-divider" />

                <p className="completion-description">
                    You have conquered every opponent and mastered all paths.
                </p>

                <div className="completion-divider" />

                <div className="completion-actions">
                    <button
                        className="completion-sharp-btn completion-primary-btn"
                        onClick={() => {
                            setUIElements((prev) => ({
                                ...prev,
                                completionModal: false,
                            }));

                            setGame((prev) => ({
                                ...prev,
                                progressMode: false,
                            }));
                        }}
                    >
                        Play Custom
                    </button>
                    <button
                        className="completion-sharp-btn"
                        onClick={() => {
                            setUIElements((prev) => ({
                                ...prev,
                                completionModal: false,
                            }));

                            handleResetProgression();
                        }}
                    >
                        Reset Progress
                    </button>
                </div>
            </div>
        </div>
    );
}
