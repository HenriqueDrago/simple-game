import "./InsightBar.css";

function InsightBar({ entity }) {
    const insightPercentage = Math.max(
        0,
        Math.min(1, entity.currInsight/ entity.maxInsight) * 100,
    );
    const nonFillPercentage = 100 - insightPercentage;

    return (
        <div className="insight-bar-container">
            <div className="insight-text-wrapper">
                <span>Insight</span>
                <span>
                    {entity.currInsight} / {entity.maxInsight}
                </span>
            </div>
            <div className="insight-track">
                <div
                    className="insight-fill"
                    style={{
                        width: `${insightPercentage}%`,
                    }}
                />
                <div
                    className="insight-non-fill"
                    style={{
                        width: `${nonFillPercentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default InsightBar;
