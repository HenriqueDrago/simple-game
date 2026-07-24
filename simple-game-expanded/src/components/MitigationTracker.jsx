import {
    Amphora,
    ChartNoAxesCombined,
    Flame,
    Globe,
    Hexagon,
    Moon,
    Music2,
    Pyramid,
    Sparkles,
    Sun,
} from "lucide-react";
import { effectKeys } from "../utils/enums";
import "./MitigationTracker.css";
import { spawnTooltip } from "../utils/dictionary";
import { MITIGATION_RESOURCES } from "../utils/constants";

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
    [effectKeys.DOME]: {
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
    [effectKeys.FIRMAMENT]: {
        icon: <Globe className="svg-icon" strokeWidth={2.5} />,
        color: "#2979ff",
        borderColor: "rgba(41, 121, 255, 0.25)",
    },
    [effectKeys.STARLIT_HEAVENS]: {
        icon: <Sparkles className="svg-icon" strokeWidth={2.5} />,
        color: "#536dfe",
        borderColor: "rgba(83, 109, 254, 0.25)",
    },
    [effectKeys.CONJECTURE]: {
        icon: <ChartNoAxesCombined className="svg-icon" strokeWidth={2.5} />,
        color: "#00e676",
        borderColor: "rgba(0, 230, 118, 0.25)",
    },
};

export default function MitigationTracker({ entity, handleSetTooltip }) {
    return (
        <div className="mitigation-tracker-container">
            {[...MITIGATION_RESOURCES].map((key) => {
                const mitigator = mitigators[key];
                if (!mitigator) return null;

                const amount = entity?.resources?.[key] ?? 0;

                return (
                    <div
                        key={key}
                        className={`mitigation-item ${amount <= 0 ? "zero-resource" : ""}`}
                        style={{
                            color: mitigator.color,
                            borderColor: mitigator.borderColor,
                        }}
                        onMouseDown={(e) =>
                            spawnTooltip(e, handleSetTooltip, key)
                        }
                    >
                        {mitigator.icon}
                        <span>{amount}</span>
                    </div>
                );
            })}
        </div>
    );
}