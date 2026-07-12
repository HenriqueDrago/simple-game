import { useEffect, useRef } from "react";
import Parser from "./Parser";
import "./TooltipDisplay.css";
import { DESCRIPTIONS } from "../utils/descriptions";

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

    // Dictates panel's position based on the first item
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
            {tooltipStack.map((activeTooltip, depth) => {
                // Click handler for looking up the type field's definition
                const handleTypeMouseDown = (e) => {
                    if (e.button === 1 || e.button === 0) {
                        e.preventDefault(); // Stops auto-scroll icons
                        e.stopPropagation(); // Prevents closing the tooltip chain

                        const entry = DESCRIPTIONS[activeTooltip.type];
                        if (entry) {
                            handleSetTooltip(
                                {
                                    keyword: activeTooltip.type,
                                    type: entry.type,
                                    description: entry.description,
                                    x: e.clientX,
                                    y: e.clientY,
                                },
                                depth + 1,
                            ); // Increments depth to chain it forward
                        }
                    }
                };

                return (
                    <div key={depth} className="tooltip-stack-item">
                        <div className="tooltip-header">
                            <span className="tooltip-title">
                                {activeTooltip.keyword}
                            </span>
                            <span
                                className="tooltip-type"
                                onMouseDown={handleTypeMouseDown}
                            >
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
        </div>
    );
}

export default TooltipDisplay;
