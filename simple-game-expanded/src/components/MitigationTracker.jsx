import { Flame, Hexagon, Moon, Pyramid, Sun } from "lucide-react";
import { effectKeys } from "../utils/enums";
import "./MitigationTracker.css";
import { spawnTooltip } from "../utils/dictionary";

export default function MitigationTracker({ entity, handleSetTooltip }) {
    const emberAmt = entity.resources[effectKeys.LINGERING_EMBER];
    const haloAmt = entity.resources[effectKeys.HALO];
    const divinityAmt = entity.resources[effectKeys.REFRACTED_DIVINITY];
    const domeAmt = entity.resources[effectKeys.DOME];
    const myceliumAmt = entity.resources[effectKeys.MYCELIUM];

    return (
        <div className="mitigation-tracker-container">
            <div
                className={`refracted-divinity-container ${divinityAmt <= 0 ? "zero-resource" : ""}`}
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.REFRACTED_DIVINITY)
                }
            >
                <Pyramid className="svg-icon" strokeWidth={2.5} />
                <span>{divinityAmt}</span>
            </div>

            <div
                className={`halo-container ${haloAmt <= 0 ? "zero-resource" : ""}`}
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.HALO)
                }
            >
                <Sun className="svg-icon" strokeWidth={2.5} />
                <span>{haloAmt}</span>
            </div>

            <div
                className={`ember-container ${emberAmt <= 0 ? "zero-resource" : ""}`}
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.LINGERING_EMBER)
                }
            >
                <Flame className="svg-icon" strokeWidth={2.5} />
                <span>{emberAmt}</span>
            </div>

            <div
                className={`dome-container ${domeAmt <= 0 ? "zero-resource" : ""}`}
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.DOME)
                }
            >
                <Hexagon className="svg-icon" strokeWidth={2.5} />
                <span>{domeAmt}</span>
            </div>

            <div
                className={`mycelium-container ${myceliumAmt <= 0 ? "zero-resource" : ""}`}
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.MYCELIUM)
                }
            >
                <Moon className="svg-icon" strokeWidth={2.5} />
                <span>{myceliumAmt}</span>
            </div>

        </div>
    );
}
