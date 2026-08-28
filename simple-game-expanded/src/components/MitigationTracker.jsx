import {
    Amphora,
    ChartNoAxesCombined,
    Church,
    Flame,
    Hexagon,
    Moon,
    Music2,
    Pyramid,
    Sparkles,
    Sun,
} from "lucide-react";
import { effectKeys } from "../utils/enums";
import "./MitigationTracker.css";
import { MITIGATION_RESOURCES } from "../utils/constants";
import { useUI } from "../contexts/UIContext";

const mitigators = {
    [effectKeys.HALO]: {
        icon: <Sun className="svg-icon" strokeWidth={2.5} />,
        color: "#fff59d",
        borderColor: "rgba(255, 245, 157, 0.25)",
    },
    [effectKeys.REFRACTED_DIVINITY]: {
        icon: <Pyramid className="svg-icon" strokeWidth={2.5} />,
        color: "#00f0ff",
        borderColor: "rgba(0, 240, 255, 0.25)",
    },
    [effectKeys.LINGERING_EMBER]: {
        icon: <Flame className="svg-icon" strokeWidth={2.5} />,
        color: "#f50057",
        borderColor: "rgba(245, 0, 87, 0.25)",
    },
    [effectKeys.FRACTURED_DOME]: {
        icon: <Hexagon className="svg-icon" strokeWidth={2.5} />,
        color: "#3d5afe",
        borderColor: "rgba(61, 90, 254, 0.25)",
    },
    [effectKeys.MYCELIUM]: {
        icon: <Moon className="svg-icon" strokeWidth={2.5} />,
        color: "#2e7d32",
        borderColor: "rgba(46, 125, 50, 0.25)",
    },
    [effectKeys.HARMONY]: {
        icon: <Music2 className="svg-icon" strokeWidth={2.5} />,
        color: "#b388ff",
        borderColor: "rgba(179, 136, 255, 0.25)",
    },
    [effectKeys.FUNERARY_URN]: {
        icon: <Amphora className="svg-icon" strokeWidth={2.5} />,
        color: "#b0bec5",
        borderColor: "rgba(176, 190, 197, 0.25)",
    },
    [effectKeys.FAULTY_FIRMAMENT]: {
        icon: <Sparkles className="svg-icon" strokeWidth={2.5} />,
        color: "#536dfe",
        borderColor: "rgba(83, 109, 254, 0.25)",
    },
    [effectKeys.CONJECTURE]: {
        icon: <ChartNoAxesCombined className="svg-icon" strokeWidth={2.5} />,
        color: "#00e676",
        borderColor: "rgba(0, 230, 118, 0.25)",
    },
    [effectKeys.SANCTUARY]: {
        icon: <Church className="svg-icon" strokeWidth={2.5} />,
        color: "#ffd54f",
        borderColor: "rgba(255, 213, 79, 0.25)",
    },
};

export default function MitigationTracker({ entity, simEntity }) {
    const { handleSpawnTooltip } = useUI();
    const activeResources = [...MITIGATION_RESOURCES].filter((key) => {
        if (!mitigators[key]) {
            return false;
        }

        const currentAmount = entity?.resources?.[key] ?? 0;
        const simAmount = simEntity
            ? (simEntity?.resources?.[key] ?? 0)
            : currentAmount;
        return currentAmount > 0 || simAmount > 0;
    });

    if (activeResources.length === 0) {
        return null;
    }

    const hasOverflow = activeResources.length > 3;

    return (
        <div
            className={`mitigation-tracker-container ${
                hasOverflow ? "has-overflow" : ""
            }`}
        >
            {activeResources.map((key) => {
                const mitigator = mitigators[key];
                const currentAmount = entity?.resources?.[key] ?? 0;
                const simAmount = simEntity
                    ? (simEntity?.resources?.[key] ?? 0)
                    : currentAmount;

                const isNewResource = currentAmount <= 0 && simAmount > 0;
                const isNumberChanged =
                    simEntity && simAmount !== currentAmount;

                const displayAmount = simEntity ? simAmount : currentAmount;

                return (
                    <div
                        key={key}
                        className={`mitigation-item ${
                            isNewResource ? "is-new-preview" : ""
                        }`}
                        style={{
                            color: mitigator.color,
                            borderColor: mitigator.borderColor,
                        }}
                        onMouseDown={(e) => handleSpawnTooltip(e, key)}
                    >
                        {mitigator.icon}
                        <span
                            className={`mitigation-amount ${
                                isNumberChanged && !isNewResource
                                    ? "is-preview"
                                    : ""
                            }`}
                        >
                            {displayAmount}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
