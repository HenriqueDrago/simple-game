import { useUI } from "../contexts/UIContext";
import { getEntityMaxHealth, isElementActive } from "../utils/entities";
import { effectKeys, elementalKeys } from "../utils/enums";
import "./HpBar.css";
import MitigationTracker from "./MitigationTracker";

function HpBar({ entity, simEntity }) {
    const { handleSpawnTooltip } = useUI();

    const maxHealth = getEntityMaxHealth(entity);

    const baseHp = entity.currHp;
    const silverHp = entity.resources?.[effectKeys.SILVER_BLOOD] ?? 0;

    const simHp = simEntity ? simEntity.currHp : baseHp;
    const simSilver = simEntity
        ? (simEntity.resources?.[effectKeys.SILVER_BLOOD] ?? 0)
        : silverHp;

    const isSimulating =
        simEntity && (simHp !== baseHp || simSilver !== silverHp);

    const displayHp = isSimulating ? simHp : baseHp;
    const displaySilver = isSimulating ? simSilver : silverHp;
    const displayHasSilver = displaySilver > 0;

    const silverTimes =
        maxHealth > 0 ? Math.floor(displaySilver / maxHealth) : 0;

    const solidHp = Math.min(baseHp, simHp);
    const hpLossAmount = Math.max(0, baseHp - simHp);
    const hpGainAmount = Math.max(0, simHp - baseHp);

    const hpPercentage =
        maxHealth > 0 ? Math.min(100, (solidHp / maxHealth) * 100) : 0;

    const hpLossLeft = maxHealth > 0 ? (solidHp / maxHealth) * 100 : 0;
    const hpLossWidth =
        maxHealth > 0 ? Math.min(100, (hpLossAmount / maxHealth) * 100) : 0;

    const hpGainLeft = maxHealth > 0 ? (baseHp / maxHealth) * 100 : 0;
    const hpGainWidth =
        maxHealth > 0 ? Math.min(100, (hpGainAmount / maxHealth) * 100) : 0;

    const solidSilver = Math.min(silverHp, simSilver);
    const silverLossAmount = Math.max(0, silverHp - simSilver);
    const silverGainAmount = Math.max(0, simSilver - silverHp);

    const silverPercentage =
        maxHealth > 0 ? Math.min(100, (solidSilver / maxHealth) * 100) : 0;

    const silverLossLeft =
        maxHealth > 0 ? (solidSilver / maxHealth) * 100 : 0;
    const silverLossWidth =
        maxHealth > 0
            ? Math.min(100, (silverLossAmount / maxHealth) * 100)
            : 0;

    const silverGainLeft = maxHealth > 0 ? (silverHp / maxHealth) * 100 : 0;
    const silverGainWidth =
        maxHealth > 0
            ? Math.min(100, (silverGainAmount / maxHealth) * 100)
            : 0;

    return (
        <div
            className="hp-bar-container"
            onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.HEALTH)}
        >
            <div className="hp-text-wrapper">
                <div className="hp-label-group">
                    <span className="hp-label">
                        {`Health${silverTimes > 0 ? ` x${silverTimes}` : ""}`}
                    </span>
                    <MitigationTracker entity={entity} simEntity={simEntity} />
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

                {silverPercentage > 0 && (
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