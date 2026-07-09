import { getEntityMaxHealth } from "../utils/entities";
import { effectKeys } from "../utils/enums";
import "./HpBar.css";

function HpBar({ entity }) {
    const maxHealth = getEntityMaxHealth(entity);

    const silverHp = entity.resources[effectKeys.SILVER_BLOOD];
    const baseHp = entity.currHp;

    const visualMax = Math.max(maxHealth, baseHp + silverHp);

    const hpPercentage = visualMax > 0 ? (baseHp / visualMax) * 100 : 0;
    const silverHpPercentage = visualMax > 0 ? (silverHp / visualMax) * 100 : 0;

    return (
        <div className="hp-bar-container">
            <div className="hp-text-wrapper">
                <span>Health</span>
                <span>
                    {silverHp > 0 ? (
                        <span className="extra-silver-hp">{baseHp+silverHp}</span>
                    ) : <span>{baseHp}</span>}
                    {" / "}
                    <span>
                        {maxHealth}
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
                        width: `${silverHpPercentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default HpBar;