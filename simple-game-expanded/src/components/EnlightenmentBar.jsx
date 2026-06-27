import "./EnlightenmentBar.css";

function EnlightenmentBar({ entity }) {
    if (entity.currEnlit <= 0 && !entity.states.ascendenceOfSpirit) {
        return null;
    }

    const enlitPercentage = Math.max(
        0,
        Math.min(1, entity.currEnlit/ entity.maxEnlit) * 100,
    );
    const nonFillPercentage = 100 - enlitPercentage;

    return (
        <div className="enlit-bar-container">
            <div className="enlit-text-wrapper">
                <span>Enlightenment</span>
                <span>
                    {entity.currEnlit} / {entity.maxEnlit}
                </span>
            </div>
            <div className="enlit-track">
                <div
                    className="enlit-fill"
                    style={{
                        width: `${enlitPercentage}%`,
                    }}
                />
                <div
                    className="enlit-non-fill"
                    style={{
                        width: `${nonFillPercentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default EnlightenmentBar;
