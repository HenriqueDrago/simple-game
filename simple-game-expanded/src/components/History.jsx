import { useEffect, useRef } from "react";
import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import "./History.css";

export default function History() {
    const { game } = useGame();
    const { UIElements, setUIElements } = useUI();

    const history = game.history;
    const listRef = useRef(null);
    const wasAtBottomRef = useRef(true);

    const handleScroll = () => {
        if (!listRef.current) {
            return;
        }
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        wasAtBottomRef.current = scrollHeight - scrollTop - clientHeight <= 30;
    };

    useEffect(() => {
        if (listRef.current && wasAtBottomRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [history]);

    if (!history || history.length <= 0 || !UIElements.history) {
        return null;
    }

    return (
        <div className="history-list-container">
            <div className="history-header">
                <span>History</span>
                <button
                    onClick={() => {
                        setUIElements((prev) => ({
                            ...prev,
                            history: false,
                        }));
                    }}
                >
                    &times;
                </button>
            </div>
            <div
                ref={listRef}
                onScroll={handleScroll}
                className="history-list-items"
            >
                {history.map((entry, index) => (
                    <span key={index}>{entry}</span>
                ))}
            </div>
        </div>
    );
}