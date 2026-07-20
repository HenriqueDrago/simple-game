import { constants } from "../utils/constants.js";
import { spawnTooltip } from "../utils/dictionary.js";
import { effectKeys } from "../utils/enums.js";
import "./NebulaStarblightBar.css";

export default function NebulaStarblightBar({ entity, handleSetTooltip }) {
    if (entity[effectKeys.NEBULA] <= 0 && entity[effectKeys.STARBLIGHT] <= 0) {
        return null;
    }

    const nebulaFill = Math.max(
        0,
        Math.min((entity[effectKeys.NEBULA] / constants.MAX_NEBULA) * 100, 100),
    );
    const nebulaNonFill = 100 - nebulaFill;

    const starblightFill = Math.max(
        0,
        Math.min(
            (entity[effectKeys.STARBLIGHT] / constants.MAX_STARBLIGHT) * 100,
            100,
        ),
    );
    const starblightNonFill = 100 - starblightFill;

    return (
        <div className="nebula-starblight-tracker-container">
            <div className="nebula-starblight-label-row">
                <span
                    className="nebula-label-interactive"
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.NEBULA)
                    }
                >
                    Nebula: {entity[effectKeys.NEBULA]}%
                </span>
                <span
                    className="starblight-label-interactive"
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.STARBLIGHT)
                    }
                >
                    Starblight: {entity[effectKeys.STARBLIGHT]}%
                </span>
            </div>

            <div className="nebula-starblight-bar-track">
                {/* First Half: Nebula Masking Segments */}
                <div
                    className="nebula-fill-segment"
                    style={{ width: `${nebulaFill}%` }}
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.NEBULA)
                    }
                />
                <div
                    className="nebula-non-fill-segment"
                    style={{ width: `${nebulaNonFill}%` }}
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.NEBULA)
                    }
                />

                {/* Second Half: Starblight Masking Segments */}
                <div
                    className="starblight-fill-segment"
                    style={{ width: `${starblightFill}%` }}
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.STARBLIGHT)
                    }
                />
                <div
                    className="starblight-non-fill-segment"
                    style={{ width: `${starblightNonFill}%` }}
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.STARBLIGHT)
                    }
                />
            </div>
        </div>
    );
}
