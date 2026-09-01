import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { choirKeys, entryTypes } from "../utils/enums";
import "./ChoirTracker.css";

const choirMap = {
    [choirKeys.FIRST]: {
        name: "First",
        color: "#6e5210",
        glow: "rgba(110, 82, 16, 0.3)",
    },
    [choirKeys.SECOND]: {
        name: "Second",
        color: "#856314",
        glow: "rgba(133, 99, 20, 0.4)",
    },
    [choirKeys.THIRD]: {
        name: "Third",
        color: "#9c7418",
        glow: "rgba(156, 116, 24, 0.4)",
    },
    [choirKeys.FOURTH]: {
        name: "Fourth",
        color: "#b3851c",
        glow: "rgba(179, 133, 28, 0.5)",
    },
    [choirKeys.FIFTH]: {
        name: "Fifth",
        color: "#caa620",
        glow: "rgba(202, 166, 32, 0.5)",
    },
    [choirKeys.SIXTH]: {
        name: "Sixth",
        color: "#e1b724",
        glow: "rgba(225, 183, 36, 0.6)",
    },
    [choirKeys.SEVENTH]: {
        name: "Seventh",
        color: "#f8c828",
        glow: "rgba(248, 200, 40, 0.7)",
    },
    [choirKeys.EIGHTH]: {
        name: "Eighth",
        color: "#ffe159",
        glow: "rgba(255, 225, 89, 0.8)",
    },
    [choirKeys.NINTH]: {
        name: "Ninth",
        color: "#ffffff",
        glow: "rgba(255, 215, 0, 0.95)",
    },
};

export default function ChoirTracker({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game.entities[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    const currChoir = simEntity
        ? simEntity[entryTypes.HEAVENLY_CHOIR]
        : entity[entryTypes.HEAVENLY_CHOIR];
    const choirData = choirMap[currChoir];

    return (
        <div
            className="choir-tracker"
            onMouseDown={(e) => handleSpawnTooltip(e, currChoir)}
        >
            <div className="choir-header">
                <span className="choir-divider-line" />
                <span className="choir-label">HEAVENLY CHOIR</span>
                <span className="choir-divider-line" />
            </div>
            <div
                className="choir-name"
                style={{
                    color: choirData?.color ?? "#6e5210",
                    textShadow: choirData
                        ? `0 0 8px ${choirData.glow}, 0 0 16px ${choirData.glow}`
                        : "none",
                }}
            >
                The {choirData?.name ?? "Unknown"}
            </div>
        </div>
    );
}
