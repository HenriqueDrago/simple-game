import { getEntityMaxHealth, isElementActive } from "../utils/entities";
import { effectKeys, elementalKeys } from "../utils/enums";
import "./HpBar.css";
import MitigationTracker from "./MitigationTracker";

function HpBar({ entity, handleSetTooltip }) {
    const maxHealth = getEntityMaxHealth(entity);

    const silverHp = entity.resources[effectKeys.SILVER_BLOOD];
    const baseHp = entity.currHp;

    const hasSilver = silverHp > 0;

    const silverPercentage =
        maxHealth > 0 && hasSilver
            ? Math.min(100, (silverHp / maxHealth) * 100)
            : 0;
    const hpPercentage =
        maxHealth > 0 ? Math.min(100, (baseHp / maxHealth) * 100) : 0;

    const silverTimes = maxHealth > 0 ? Math.floor(silverHp / maxHealth) : 0;

    return (
        <div className="hp-bar-container">
            <div className="hp-text-wrapper">
                <div className="hp-label-group">
                    <span className="hp-label">
                        {`Health${silverTimes > 0 ? ` x${silverTimes}` : ""}`}
                    </span>
                    <MitigationTracker
                        handleSetTooltip={handleSetTooltip}
                        entity={entity}
                    />
                </div>
                <div className="hp-values">
                    {hasSilver ? (
                        <span className="extra-silver-hp">
                            {baseHp + silverHp}
                        </span>
                    ) : (
                        <span>{baseHp}</span>
                    )}
                    <span> / </span>
                    <span
                        className={
                            isElementActive(entity, elementalKeys.NATURE)
                                ? "label-nature"
                                : ""
                        }
                    >
                        {maxHealth}
                    </span>
                </div>
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
                        width: `${silverPercentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default HpBar;
