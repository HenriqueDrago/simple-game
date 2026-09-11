import { useState } from "react";
import { DESCRIPTIONS } from "../utils/descriptions";
import { UIContext } from "./UIContext";
import { turnStatus } from "../utils/enums";
import { INITIAL_GAME_STATE, INITIAL_GLOSSARY_SPECS } from "../utils/constants";

function hasOngoingSavedGame() {
    try {
        const savedData = localStorage.getItem("gameCheckpoint");
        if (!savedData) {
            return false;
        }

        const parsed = JSON.parse(savedData);
        const finishedStatuses = [
            turnStatus.VICTORY,
            turnStatus.DRAW,
            turnStatus.DEFEAT,
            turnStatus.SETUP,
        ];
        return !finishedStatuses.includes(parsed.status) && parsed?.ivn === INITIAL_GAME_STATE?.ivn;
    } catch {
        return false;
    }
}

function isNewcomer() {
    try {
        const savedData = localStorage.getItem("gameCheckpoint");
        if (!savedData) {
            return true;
        }

        const parsed = JSON.parse(savedData);
        return parsed?.newcomer ?? true;
    } catch {
        return true;
    }
}

export default function UIProvider({ children }) {
    // === States ===
    const [UIElements, setUIElements] = useState({
        continueModal: hasOngoingSavedGame(),
        resetModal: false,
        hardResetModal: false,
        newcomerModal: isNewcomer(),
        insertCode: false,

        glossary: false,
        history: false,
    });
    const [tooltipStack, setTooltipStack] = useState([]);
    const [glossarySpecs, setGlossarySpecs] = useState(INITIAL_GLOSSARY_SPECS);

    // === Handles ===
    function handleSetTooltip(tooltipData, depth = 0) {
        setTooltipStack((prev) => {
            const newStack = depth === 0 ? [] : [...prev];

            // Prevent appending the exact same keyword back-to-back
            if (
                depth > 0 &&
                prev.length > 0 &&
                prev[prev.length - 1].keyword === tooltipData.keyword
            ) {
                return prev;
            }

            // Only calculate position for the initial box (Depth 0)
            if (depth === 0) {
                const TOOLTIP_WIDTH = 320;
                const MAX_TOOLTIP_HEIGHT = 400;
                const MARGIN = 15;

                const clampedX = Math.max(
                    MARGIN,
                    Math.min(
                        tooltipData.x,
                        window.innerWidth - TOOLTIP_WIDTH - MARGIN,
                    ),
                );
                const clampedY = Math.max(
                    MARGIN,
                    Math.min(
                        tooltipData.y,
                        window.innerHeight - MAX_TOOLTIP_HEIGHT - MARGIN,
                    ),
                );

                newStack.push({ ...tooltipData, x: clampedX, y: clampedY });
            } else {
                // Child tooltips only appends, no need for coordinates
                newStack.push(tooltipData);
            }

            return newStack;
        });
    }

    function handleClearTooltip() {
        setTooltipStack([]);
    }

    function handleSpawnTooltip(e, itemKey) {
        // Mouse wheel opens tooltip
        if (e.button === 1) {
            e.preventDefault(); // Prevents the browser's auto-scroll icon from popping up
            e.stopPropagation(); // Prevents the event from trigerring other effects

            const entry = DESCRIPTIONS[itemKey];
            console.log(itemKey);
            console.log(entry);
            if (itemKey && entry) {
                handleSetTooltip({
                    keyword: entry.name,
                    type: entry.type,
                    description: entry.description,
                    x: e.clientX,
                    y: e.clientY - 30,
                });
            } else {
                console.error(`Entry [${itemKey}] not found.`);
            }
        }
    }

    // Auxiliary Functions
    function isAnyOverlayOpen(exceptions = null) {
        if (tooltipStack?.length > 0) {
            return true;
        }

        for (let k of Object.keys(UIElements)) {
            if (UIElements[k] && !exceptions?.includes(k)) {
                return true;
            }
        }

        return false;
    }

    return (
        <UIContext.Provider
            value={{
                UIElements,
                setUIElements,
                tooltipStack,
                setTooltipStack,

                handleClearTooltip,
                handleSetTooltip,
                handleSpawnTooltip,

                glossarySpecs,
                setGlossarySpecs,

                isAnyOverlayOpen,
            }}
        >
            {children}
        </UIContext.Provider>
    );
}
