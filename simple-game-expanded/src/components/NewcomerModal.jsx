import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import "./NewcomerModal.css";

export default function NewcomerModal() {
    const { handleSetupProgression, setGame } = useGame();
    const { setUIElements } = useUI();

    return (
        <div className="newcomer-modal-overlay">
            <div className="newcomer-modal-container">
                <div className="newcomer-header">
                    <span className="newcomer-subtitle">Welcome to</span>
                    <h1 className="newcomer-title">Simple Game</h1>
                </div>

                <div className="newcomer-divider" />

                <p className="newcomer-introduction">
                    A turn-based combat game. Distribute attributes, execute
                    tactical choices, and defeat autonomous AI opponents in
                    battle.
                </p>

                <div className="newcomer-divider" />

                <div className="newcomer-modes-container">
                    <div className="newcomer-mode-card newcomer-recommended">
                        <span className="newcomer-mode-badge">Recommended</span>
                        <h2 className="newcomer-mode-title">Progression</h2>
                        <p className="newcomer-mode-description">
                            Battle autonomous AIs and unlock new abilities after
                            every victory. Recommended for first-time players.
                        </p>
                        <button
                            className="newcomer-sharp-btn newcomer-primary-btn"
                            onClick={() => {
                                setUIElements((prev) => ({
                                    ...prev,
                                    newcomerModal: false,
                                }));
                                handleSetupProgression();
                            }}
                        >
                            Play Progression
                        </button>
                    </div>

                    <div className="newcomer-mode-card">
                        <h2 className="newcomer-mode-title">Custom</h2>
                        <p className="newcomer-mode-description">
                            Jump straight into sandbox matches with full freedom
                            to configure attributes and match conditions.
                        </p>
                        <button
                            className="newcomer-sharp-btn"
                            onClick={() => {
                                setUIElements((prev) => ({
                                    ...prev,
                                    newcomerModal: false,
                                }));
                                setGame((prev) => ({
                                    ...prev,
                                    newcomer: false,
                                    progressMode: false,
                                }));
                            }}
                        >
                            Play Custom
                        </button>
                    </div>
                </div>

                <div className="newcomer-footer">
                    <span className="newcomer-fun">Good Luck & Have Fun</span>
                </div>
            </div>
        </div>
    );
}