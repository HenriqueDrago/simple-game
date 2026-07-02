import "./HpBar.css";

function HpBar({ entity }) {
    const totalCapacity = entity.maxHp;

    const currentBaseHp = Math.min(entity.currHp, entity.maxHp);
    const currentOvergrowthHp = Math.max(0, entity.currHp - entity.maxHp);

    const hpPercentage = (currentBaseHp / totalCapacity) * 100;
    const overgrowthHpPercentage = (currentOvergrowthHp / totalCapacity) * 100;

    return (
        <div className="hp-bar-container">
            <div className="hp-text-wrapper">
                <span>Health</span>
                <span>
                    {entity.currHp} /{" "}
                    <span
                        // className={
                        //     entity.overgrowth > 0 ? "extra-overgrowth-hp" : ""
                        // }
                    >
                        {totalCapacity}
                    </span>
                </span>
            </div>
            <div className="hp-track">
                <div
                    className="hp-fill"
                    style={{
                        width: `${hpPercentage}%`,
                    }}
                />
                <div
                    className="overgrowth-hp-fill"
                    style={{
                        width: `${overgrowthHpPercentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default HpBar;