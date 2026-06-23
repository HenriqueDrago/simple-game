import "./DamnationBar.css";

function DamnationBar({ entity }) {
    if (entity.currTarnishedSin <= 0) {
        return null;
    }

    const tarnishedSinPercentage = Math.max(
        0,
        Math.min(1, entity.currTarnishedSin / entity.maxTarnishedSin) * 100,
    );
    const nonFillPercentage = 100 - tarnishedSinPercentage;

    return (
        <div className="tarnished-sin-bar-container">
            <div className="tarnished-sin-text-wrapper">
                <span>Tarnished Sin</span>
                <span>
                    {entity.currTarnishedSin} / {entity.maxTarnishedSin}
                </span>
            </div>
            <div className="tarnished-sin-track">
                <div
                    className="tarnished-sin-fill"
                    style={{
                        width: `${tarnishedSinPercentage}%`,
                    }}
                />
                <div
                    className="tarnished-sin-non-fill"
                    style={{
                        width: `${nonFillPercentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default DamnationBar;
