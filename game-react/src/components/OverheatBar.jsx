import "./OverheatBar.css";

function OverheatBar({ entity }) {
    if (
        !(
            entity.states.weaponsDeployed ||
            entity.states.thermalOverload ||
            entity.states.venting
        )
    ) {
        return null;
    }

    const overheatPercentage = Math.max(
        0,
        Math.min(1, entity.currOverheat / entity.maxOverheat) * 100,
    );
    const nonFillPercentage = 100 - overheatPercentage;

    return (
        <div className="overheat-bar-container">
            <div className="overheat-text-wrapper">
                <span>Overheat</span>
                <span>
                    {entity.currOverheat} / {entity.maxOverheat}
                </span>
            </div>
            <div className="overheat-track">
                <div
                    className="overheat-fill"
                    style={{
                        width: `${overheatPercentage}%`,
                    }}
                />
                <div
                    className="overheat-non-fill"
                    style={{
                        width: `${nonFillPercentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default OverheatBar;
