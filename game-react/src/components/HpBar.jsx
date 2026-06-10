import './HpBar.css';

function HpBar({ entity }) {
    const hpPercentage = Math.max(0, (entity.currHp / entity.maxHp) * 100)
    return (
        <div className="hp-bar-container">
            <div className="hp-text-wrapper">
                <span>Health</span>
                <span>
                    {entity.currHp} / {entity.maxHp}
                </span>
            </div>
            <div className="hp-track">
                <div 
                    className="hp-fill" 
                    style={{ 
                        width: `${hpPercentage}%`,
                        "backgroundColor": `${entity.dmgReduction > 0 || entity.defEffect > 1.0 ? "gray" : "red"}`
                    }}
                />
            </div>
        </div>
    );
}

export default HpBar;
