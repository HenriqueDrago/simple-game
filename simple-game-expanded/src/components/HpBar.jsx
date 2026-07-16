import { getEntityMaxHealth, isElementActive } from "../utils/entities";
import { effectKeys, elementalKeys } from "../utils/enums";
import "./HpBar.css";

function HpBar({ entity }) {
    const maxHealth = getEntityMaxHealth(entity);

    const silverHp = entity.resources[effectKeys.SILVER_BLOOD];
    const baseHp = entity.currHp;

    const hasSilver = silverHp > 0;

    const silverPercentage = maxHealth > 0 ? Math.min(100, (silverHp / maxHealth) * 100) : 0;
    const remainingSpace = 100 - silverPercentage;
    const hpPercentage = maxHealth > 0 ? Math.min(remainingSpace, (baseHp / maxHealth) * 100) : 0;

    const silverTimes = maxHealth > 0 ? Math.floor(silverHp / maxHealth) : 0;

    return (
        <div className="hp-bar-container">
            <div className="hp-text-wrapper">
                <span>{`Health${silverTimes > 0 ? ` x${silverTimes}` : ""}`}</span>
                <span>
                    {hasSilver ? (
                        <span className="extra-silver-hp">{baseHp + silverHp}</span>
                    ) : (
                        <span>{baseHp}</span>
                    )}
                    {" / "}
                    <span className={`${isElementActive(entity, elementalKeys.NATURE) ? "label-nature" : ""}`}>
                        {maxHealth}
                    </span>
                </span>
            </div>
            <div className="hp-track">
                {hasSilver && (
                    <div
                        className="overgrowth-hp-fill"
                        style={{
                            width: `${silverPercentage}%`,
                        }}
                    />
                )}
                <div
                    className="hp-fill"
                    style={{
                        width: `${hpPercentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default HpBar;