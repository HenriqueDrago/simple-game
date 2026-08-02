import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import "./GradientBar.css";

function GradientBar({
    resourceKey,
    entityKey,
    label,
    maxResource,
    trackStyle = null,
    showPercent = false,
    showAnimation = true,
    tooltip = null,
    isAlwaysActive = false,
}) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game?.entities?.[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    const realAmount =
        entity?.[resourceKey] ?? entity?.resources?.[resourceKey] ?? 0;

    const simAmount = simEntity
        ? (simEntity?.[resourceKey] ??
          simEntity?.resources?.[resourceKey] ??
          realAmount)
        : realAmount;

    const isNewResource = realAmount <= 0 && simAmount > 0;
    const isNumberChanged = simEntity && simAmount !== realAmount;
    const displayResource = simEntity ? simAmount : realAmount;

    const willDissapear = !isAlwaysActive && realAmount > 0 && simAmount <= 0

    const gradientPercentage = Math.max(
        0,
        (displayResource / maxResource) * 100,
    );
    const nonFillPercentage = Math.max(0, 100 - gradientPercentage);
    const targetTooltip = tooltip || resourceKey;

    return (
        <div
            className={`gradient-bar-container ${
                (isNewResource && !isAlwaysActive) || willDissapear ? "is-new-preview" : ""
            }`}
            onMouseDown={(e) => {
                if (targetTooltip) {
                    handleSpawnTooltip(e, targetTooltip);
                }
            }}
        >
            <div className="gradient-text-wrapper">
                <span>{label}</span>
                <span
                    className={`${
                        isNumberChanged && (!isNewResource || isAlwaysActive) && !willDissapear ? "is-preview" : ""
                    }`}
                >
                    {showPercent
                        ? `${Math.round(gradientPercentage * 100) / 100}%`
                        : `${displayResource} / ${maxResource}`}
                </span>
            </div>
            <div
                className="gradient-track"
                style={{
                    ...trackStyle,
                    animation: showAnimation
                        ? `flowLight 10s linear infinite`
                        : `none`,
                    backgroundSize: showAnimation ? `200% 100%` : `100%`,
                }}
            >
                <div
                    className="gradient-fill"
                    style={{
                        width: `${Math.min(1, gradientPercentage / 100) * 100}%`,
                    }}
                />
                <div
                    className="gradient-non-fill"
                    style={{
                        width: `${nonFillPercentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

export default GradientBar;