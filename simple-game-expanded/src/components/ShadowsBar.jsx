import { useUI } from "../contexts/UIContext";
import { getMaxShadows } from "../utils/entities";
import { effectKeys } from "../utils/enums";
import "./ShadowsBar.css";

function ShadowsBar({ entity, simEntity }) {
    const { handleSpawnTooltip } = useUI();

    if (
        entity[effectKeys.UNRELENTING_SHADOWS] <= 0 &&
        !entity.states[effectKeys.UMBRAL_CORE]
    ) {
        return null;
    }

    const baseMaxShadows = getMaxShadows(entity);
    const simMaxShadows = simEntity ? getMaxShadows(simEntity) : baseMaxShadows;
    const isMaxShadowsSimulating =
        simEntity && simMaxShadows !== baseMaxShadows;

    const displayMaxShadows = isMaxShadowsSimulating
        ? simMaxShadows
        : baseMaxShadows;
    const maxShadows = displayMaxShadows;

    const baseShadows = entity[effectKeys.UNRELENTING_SHADOWS];
    const simShadows = simEntity
        ? simEntity[effectKeys.UNRELENTING_SHADOWS]
        : baseShadows;

    const isShadowsSimulating = simEntity && simShadows !== baseShadows;

    const displayShadows = isShadowsSimulating ? simShadows : baseShadows;
    const displayTotal = displayShadows;

    const shadowsPercentage =
        maxShadows > 0 ? Math.min(100, (baseShadows / maxShadows) * 100) : 0;
    const shadowsLossRatio =
        baseShadows > 0
            ? Math.max(0, (baseShadows - simShadows) / baseShadows)
            : 0;
    const shadowsGainLeft = shadowsPercentage;
    const shadowsGainWidth =
        maxShadows > 0
            ? Math.min(
                  100,
                  (Math.max(0, simShadows - baseShadows) / maxShadows) * 100,
              )
            : 0;

    return (
        <div
            className="shadows-bar-container"
            onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.MANA)}
        >
            <div className="shadows-text-wrapper">
                <span>{`Unrelenting Shadows`}</span>
                <div className="shadows-values">
                    <span
                        className={`shadows-value-display ${
                            isShadowsSimulating ? "is-preview" : ""
                        }`}
                    >
                        <span>{displayTotal}</span>
                    </span>
                    <span> / </span>
                    <span
                        className={isMaxShadowsSimulating ? "is-preview" : ""}
                    >
                        {displayMaxShadows}
                    </span>
                </div>
            </div>
            <div className="shadows-track">
                <div
                    className="shadows-fill"
                    style={{
                        width: `${shadowsPercentage}%`,
                    }}
                >
                    {shadowsLossRatio > 0 && (
                        <div
                            className="preview-chunk shadows-loss"
                            style={{
                                width: `${shadowsLossRatio * 100}%`,
                            }}
                        />
                    )}
                </div>

                {shadowsGainWidth > 0 && (
                    <div
                        className="preview-chunk shadows-gain"
                        style={{
                            left: `${shadowsGainLeft}%`,
                            width: `${shadowsGainWidth}%`,
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default ShadowsBar;
