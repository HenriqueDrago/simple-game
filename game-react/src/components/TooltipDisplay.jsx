import Parser from "./Parser";
import "./TooltipDisplay.css";

function TooltipDisplay({ tooltipStack, handleSetTooltip }) {
    if (!tooltipStack || tooltipStack.length === 0) {
        return null;
    }

    return (
        <>
            {tooltipStack.map((activeTooltip, depth) => {
                const dynamicPositionStyle = {
                    left: `${activeTooltip.x + 15}px`,
                    top: `${activeTooltip.y - 15}px`,
                    zIndex: 9999 + depth, // Ensures child boxes always render on top of parent boxes
                };

                return (
                    <div
                        key={depth}
                        className="tooltip-display-container"
                        style={dynamicPositionStyle}
                    >
                        <div className="tooltip-header">
                            <span className="tooltip-title">
                                {activeTooltip.keyword}
                            </span>
                            <span className="tooltip-type">
                                {activeTooltip.type}
                            </span>
                        </div>

                        <div className="tooltip-body">
                            <Parser
                                rawText={activeTooltip.description}
                                handleSetTooltip={handleSetTooltip}
                                depth={depth}
                            />
                        </div>
                    </div>
                );
            })}
        </>
    );
}

export default TooltipDisplay;
