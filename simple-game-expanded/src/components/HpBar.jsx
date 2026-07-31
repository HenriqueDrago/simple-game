import { getEntityMaxHealth, isElementActive } from "../utils/entities";
import { effectKeys, elementalKeys } from "../utils/enums";
import "./HpBar.css";
import MitigationTracker from "./MitigationTracker";

function HpBar({ entity, simEntity }) {
    const maxHealth = getEntityMaxHealth(entity);

    const baseHp = entity.currHp;
    const silverHp = entity.resources?.[effectKeys.SILVER_BLOOD] ?? 0;
    const hasSilver = silverHp > 0;

    const silverPercentage =
        maxHealth > 0 && hasSilver
            ? Math.min(100, (silverHp / maxHealth) * 100)
            : 0;
    const hpPercentage =
        maxHealth > 0 ? Math.min(100, (baseHp / maxHealth) * 100) : 0;

    const silverTimes = maxHealth > 0 ? Math.floor(silverHp / maxHealth) : 0;

    const simHp = simEntity ? simEntity.currHp : baseHp;
    const simSilver = simEntity
        ? simEntity.resources?.[effectKeys.SILVER_BLOOD] ?? 0
        : silverHp;

    const isSimulating =
        simEntity && (simHp !== baseHp || simSilver !== silverHp);
    const displayHp = isSimulating ? simHp : baseHp;
    const displaySilver = isSimulating ? simSilver : silverHp;
    const displayHasSilver = displaySilver > 0;

    const hpDelta = simHp - baseHp;
    const hpLossAmount = hpDelta < 0 ? Math.abs(hpDelta) : 0;
    const hpGainAmount = hpDelta > 0 ? hpDelta : 0;

    const hpLossLeft = maxHealth > 0 ? (simHp / maxHealth) * 100 : 0;
    const hpLossWidth =
        maxHealth > 0 ? Math.min(100, (hpLossAmount / maxHealth) * 100) : 0;

    const hpGainLeft = maxHealth > 0 ? (baseHp / maxHealth) * 100 : 0;
    const hpGainWidth =
        maxHealth > 0 ? Math.min(100, (hpGainAmount / maxHealth) * 100) : 0;

    const silverDelta = simSilver - silverHp;
    const silverLossAmount = silverDelta < 0 ? Math.abs(silverDelta) : 0;
    const silverGainAmount = silverDelta > 0 ? silverDelta : 0;

    const silverLossLeft = maxHealth > 0 ? (simSilver / maxHealth) * 100 : 0;
    const silverLossWidth =
        maxHealth > 0 ? Math.min(100, (silverLossAmount / maxHealth) * 100) : 0;

    const silverGainLeft = maxHealth > 0 ? (silverHp / maxHealth) * 100 : 0;
    const silverGainWidth =
        maxHealth > 0 ? Math.min(100, (silverGainAmount / maxHealth) * 100) : 0;

    return (
        <div className="hp-bar-container">
            <div className="hp-text-wrapper">
                <div className="hp-label-group">
                    <span className="hp-label">
                        {`Health${silverTimes > 0 ? ` x${silverTimes}` : ""}`}
                    </span>
                    <MitigationTracker
                        entity={entity}
                        simEntity={simEntity}
                    />
                </div>
                <div className="hp-values">
                    <span
                        className={`hp-value-display ${
                            isSimulating ? "is-preview" : ""
                        }`}
                    >
                        {displayHasSilver ? (
                            <span className="extra-silver-hp">
                                {displayHp + displaySilver}
                            </span>
                        ) : (
                            <span>{displayHp}</span>
                        )}
                    </span>
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

                {hpLossWidth > 0 && (
                    <div
                        className="preview-chunk hp-loss"
                        style={{
                            left: `${hpLossLeft}%`,
                            width: `${hpLossWidth}%`,
                        }}
                    />
                )}
                {hpGainWidth > 0 && (
                    <div
                        className="preview-chunk hp-gain"
                        style={{
                            left: `${hpGainLeft}%`,
                            width: `${hpGainWidth}%`,
                        }}
                    />
                )}

                {hasSilver && (
                    <div
                        className="overgrowth-hp-fill"
                        style={{
                            width: `${silverPercentage}%`,
                        }}
                    />
                )}

                {silverLossWidth > 0 && (
                    <div
                        className="preview-chunk silver-loss"
                        style={{
                            left: `${silverLossLeft}%`,
                            width: `${silverLossWidth}%`,
                        }}
                    />
                )}
                {silverGainWidth > 0 && (
                    <div
                        className="preview-chunk silver-gain"
                        style={{
                            left: `${silverGainLeft}%`,
                            width: `${silverGainWidth}%`,
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default HpBar;