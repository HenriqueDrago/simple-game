import "./History.css";

export default function History({ game, handleHistoryButton, visibleHistory }) {
    const history = game.history;

    if (!history || history.length <= 0 || !visibleHistory) {
        return (
            <div className="history-button-container" disabled={!history || history.length <= 0}>
                <button
                    onClick={() => {
                        handleHistoryButton();
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
                        handleHistoryButton();
                    }}
                >
                    &times;
                </button>
            </div>
            <div className="history-list-items">
                    {history.map((entry) => {
                        return (
                            <span>{entry}</span>
                        )
                    })}
            </div>
        </div>
    );
}
