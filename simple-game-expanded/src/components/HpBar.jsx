import { useUI } from "../contexts/UIContext";
import { getEntityMaxHealth, isElementActive } from "../utils/entities";
import { effectKeys, elementalKeys } from "../utils/enums";
import "./HpBar.css";
import MitigationTracker from "./MitigationTracker";

function HpBar({ entity, simEntity }) {
    const { handleSpawnTooltip } = useUI();

    const baseMaxHp = getEntityMaxHealth(entity);
    const simMaxHp = simEntity ? getEntityMaxHealth(simEntity) : baseMaxHp;
    const isMaxHpSimulating = simEntity && simMaxHp !== baseMaxHp;

    const displayMaxHp = isMaxHpSimulating ? simMaxHp : baseMaxHp;
    const maxHealth = displayMaxHp;

    const baseHp = entity.currHp;
    const silverHp = entity.resources?.[effectKeys.SILVER_BLOOD] ?? 0;

    const simHp = simEntity ? simEntity.currHp : baseHp;
    const simSilver = simEntity
        ? (simEntity.resources?.[effectKeys.SILVER_BLOOD] ?? 0)
        : silverHp;

    const isHpSimulating =
        simEntity && (simHp !== baseHp || simSilver !== silverHp);

    const displayHp = isHpSimulating ? simHp : baseHp;
    const displaySilver = isHpSimulating ? simSilver : silverHp;
    const displayHasSilver = displaySilver > 0;

    const silverTimes =
        maxHealth > 0 ? Math.floor(displaySilver / maxHealth) : 0;

    const hpPercentage =
        maxHealth > 0 ? Math.min(100, (baseHp / maxHealth) * 100) : 0;
    const hpLossRatio = baseHp > 0 ? Math.max(0, (baseHp - simHp) / baseHp) : 0;
    const hpGainLeft = hpPercentage;
    const hpGainWidth =
        maxHealth > 0
            ? Math.min(100, (Math.max(0, simHp - baseHp) / maxHealth) * 100)
            : 0;

    const silverPercentage =
        maxHealth > 0 ? Math.min(100, (silverHp / maxHealth) * 100) : 0;
    const silverLossRatio =
        silverHp > 0 ? Math.max(0, (silverHp - simSilver) / silverHp) : 0;
    const silverGainLeft = silverPercentage;
    const silverGainWidth =
        maxHealth > 0
            ? Math.min(
                  100,
                  (Math.max(0, simSilver - silverHp) / maxHealth) * 100,
              )
            : 0;

    const activeEntity = isMaxHpSimulating ? simEntity : entity;
    const isNatureActive = isElementActive(activeEntity, elementalKeys.NATURE);

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
                            isHpSimulating ? "is-preview" : ""
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
                        className={`${
                            isNatureActive ? "label-nature" : ""
                        } ${isMaxHpSimulating ? "is-preview" : ""}`.trim()}
                    >
                        {displayMaxHp}
                    </span>
                </div>
            </div>
            <div className="hp-track">
                <div
                    className="hp-fill"
                    style={{
                        width: `${hpPercentage}%`,
                    }}
                >
                    {hpLossRatio > 0 && (
                        <div
                            className="preview-chunk hp-loss"
                            style={{
                                width: `${hpLossRatio * 100}%`,
                            }}
                        />
                    )}
                </div>

                {hpGainWidth > 0 && (
                    <div
                        className="preview-chunk hp-gain"
                        style={{
                            left: `${hpGainLeft}%`,
                            width: `${hpGainWidth}%`,
                        }}
                    />
                )}

                <div
                    className="overgrowth-hp-fill"
                    style={{
                        width: `${silverPercentage}%`,
                    }}
                >
                    {silverLossRatio > 0 && (
                        <div
                            className="preview-chunk silver-loss"
                            style={{
                                width: `${silverLossRatio * 100}%`,
                            }}
                        />
                    )}
                </div>

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
