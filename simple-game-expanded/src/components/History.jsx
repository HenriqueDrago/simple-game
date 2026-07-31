import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import "./History.css";

export default function History() {
    const { game } = useGame();
    const { UIElements, setUIElements } = useUI();

    const history = game.history;

    if (!history || history.length <= 0 || !UIElements.history) {
        return (
            <div
                className="history-button-container"
                disabled={!history || history.length <= 0}
            >
                <button
                    onClick={() => {
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                history: true,
                            };
                        });
                    }}
                >
                    History
                </button>
            </div>
        );
    }

    return (
        <div className="history-list-container">
            <div className="history-header">
                <span>History</span>
                <button
                    onClick={() => {
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                history: false,
                            };
                        });
                    }}
                >
                    &times;
                </button>
            </div>
            <div className="history-list-items">
                {history.map((entry) => {
                    return <span>{entry}</span>;
                })}
            </div>
        </div>
    );
}
