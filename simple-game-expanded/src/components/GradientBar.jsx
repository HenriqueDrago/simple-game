import "./GradientBar.css";

function GradientBar({
    label,
    currResource,
    maxResource,
    trackStyle = null,
    showPercent = false,
    showAnimation = true,
}) {
    const gradientPercentage = Math.max(
        0,
        Math.min(1, currResource / maxResource) * 100,
    );
    const nonFillPercentage = 100 - gradientPercentage;

    return (
        <div className="gradient-bar-container">
            <div className="gradient-text-wrapper">
                <span>{label}</span>
                <span>
                    {showPercent
                        ? `${Math.round(gradientPercentage * 100) / 100}%`
                        : `${currResource} / ${maxResource}`}
                </span>
            </div>
            <div
                className="gradient-track"
                style={{
                    ...trackStyle,
                    animation: showAnimation
                        ? `flowLight 10s linear infinite`
                        : `none`,
                    backgroundSize: showAnimation
                        ? `200% 100%`
                        : `100%`,
                }}
            >
                <div
                    className="gradient-fill"
                    style={{
                        width: `${gradientPercentage}%`,
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
