import { useUI } from "../contexts/UIContext";
import { getMaxEnlit } from "../utils/entities";
import { effectKeys } from "../utils/enums";
import "./EnlightenmentBar.css";
import MitigationTracker from "./MitigationTracker";

function EnlightenmentBar({ entity, simEntity }) {
    const { handleSpawnTooltip } = useUI();

    const baseMaxEnlit = getMaxEnlit(entity);
    const simMaxEnlit = simEntity ? getMaxEnlit(simEntity) : baseMaxEnlit;
    const isMaxEnlitSimulating = simEntity && simMaxEnlit !== baseMaxEnlit;

    const displayMaxEnlit = isMaxEnlitSimulating ? simMaxEnlit : baseMaxEnlit;
    const maxEnlightenment = displayMaxEnlit;

    const baseEnlit =
        entity?.resources?.[effectKeys.ENLIGHTENMENT] ??
        entity?.[effectKeys.ENLIGHTENMENT] ??
        0;
    const insight =
        entity?.resources?.[effectKeys.INSIGHT] ??
        entity?.[effectKeys.INSIGHT] ??
        0;

    const simEnlit = simEntity
        ? (simEntity.resources?.[effectKeys.ENLIGHTENMENT] ??
          simEntity?.[effectKeys.ENLIGHTENMENT] ??
          baseEnlit)
        : baseEnlit;
    const simInsight = simEntity
        ? (simEntity.resources?.[effectKeys.INSIGHT] ??
          simEntity?.[effectKeys.INSIGHT] ??
          insight)
        : insight;

    const isEnlitSimulating =
        simEntity && (simEnlit !== baseEnlit || simInsight !== insight);

    const displayEnlit = isEnlitSimulating ? simEnlit : baseEnlit;
    const displayInsight = isEnlitSimulating ? simInsight : insight;
    const displayHasInsight = displayInsight > 0;

    const insightTimes =
        maxEnlightenment > 0 ? Math.floor(displayInsight / maxEnlightenment) : 0;

    const enlitPercentage =
        maxEnlightenment > 0 ? Math.min(100, (baseEnlit / maxEnlightenment) * 100) : 0;
    const enlitLossRatio = baseEnlit > 0 ? Math.max(0, (baseEnlit - simEnlit) / baseEnlit) : 0;
    const enlitGainLeft = enlitPercentage;
    const enlitGainWidth =
        maxEnlightenment > 0
            ? Math.min(
                  100,
                  (Math.max(0, simEnlit - baseEnlit) / maxEnlightenment) * 100
              )
            : 0;

    const insightPercentage =
        maxEnlightenment > 0 ? Math.min(100, (insight / maxEnlightenment) * 100) : 0;
    const insightLossRatio =
        insight > 0 ? Math.max(0, (insight - simInsight) / insight) : 0;
    const insightGainLeft = insightPercentage;
    const insightGainWidth =
        maxEnlightenment > 0
            ? Math.min(
                  100,
                  (Math.max(0, simInsight - insight) / maxEnlightenment) * 100
              )
            : 0;

    return (
        <div
            className="enlightenment-bar-container"
            onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.ENLIGHTENMENT)}
        >
            <div className="enlightenment-text-wrapper">
                <div className="enlightenment-label-group">
                    <span className="enlightenment-label">
                        {`Enlightenment${insightTimes > 0 ? ` x${insightTimes}` : ""}`}
                    </span>
                    <MitigationTracker entity={entity} simEntity={simEntity} />
                </div>
                <div className="enlightenment-values">
                    <span
                        className={`enlightenment-value-display ${
                            isEnlitSimulating ? "is-preview" : ""
                        }`}
                    >
                        {displayHasInsight ? (
                            <span className="extra-insight-val">
                                {displayEnlit + displayInsight}
                            </span>
                        ) : (
                            <span>{displayEnlit}</span>
                        )}
                    </span>
                    <span> / </span>
                    <span className={isMaxEnlitSimulating ? "is-preview" : ""}>
                        {displayMaxEnlit}
                    </span>
                </div>
            </div>
            <div className="enlightenment-track">
                <div
                    className="enlightenment-fill"
                    style={{
                        width: `${enlitPercentage}%`,
                    }}
                >
                    {enlitLossRatio > 0 && (
                        <div
                            className="preview-chunk enlit-loss"
                            style={{
                                width: `${enlitLossRatio * 100}%`,
                            }}
                        />
                    )}
                </div>

                {enlitGainWidth > 0 && (
                    <div
                        className="preview-chunk enlit-gain"
                        style={{
                            left: `${enlitGainLeft}%`,
                            width: `${enlitGainWidth}%`,
                        }}
                    />
                )}

                <div
                    className="insight-fill"
                    style={{
                        width: `${insightPercentage}%`,
                    }}
                >
                    {insightLossRatio > 0 && (
                        <div
                            className="preview-chunk insight-loss"
                            style={{
                                width: `${insightLossRatio * 100}%`,
                            }}
                        />
                    )}
                </div>

                {insightGainWidth > 0 && (
                    <div
                        className="preview-chunk insight-gain"
                        style={{
                            left: `${insightGainLeft}%`,
                            width: `${insightGainWidth}%`,
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default EnlightenmentBar;