import { useEffect, useRef } from "react";
import Parser from "./Parser";
import "./TooltipDisplay.css";

function TooltipDisplay({ tooltipStack, handleSetTooltip }) {
    const scrollRef = useRef(null);

    // Auto-scroll to the bottom when a new definition is added
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [tooltipStack.length]);

    // Return early if stack empty
    if (!tooltipStack || tooltipStack.length === 0) {
        return null;
    }

    // Dictates panel'sposition based on the first item
    const rootPosition = tooltipStack[0];
    const dynamicPositionStyle = {
        left: `${rootPosition.x + 15}px`,
        top: `${rootPosition.y - 15}px`,
        zIndex: 9999,
    };

    return (
        <div
            className="tooltip-display-container single-panel-scroll"
            style={dynamicPositionStyle}
            ref={scrollRef}
            onMouseDown={(e) => {
                e.stopPropagation(); // Prevents clicks from hitting the backdrop
            }}
        >
            {tooltipStack.map((activeTooltip, depth) => (
                <div key={depth} className="tooltip-stack-item">
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
            ))}
        </div>
    );
}

export default TooltipDisplay;