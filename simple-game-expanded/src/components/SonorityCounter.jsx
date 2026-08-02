import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { constants } from "../utils/constants";
import { effectKeys } from "../utils/enums";
import "./SonorityCounter.css";

function SonorityCounter({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game?.entities?.[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    if (!entity?.states?.[effectKeys.RESONANT]) {
        return null;
    }

    const realSonority = entity?.[effectKeys.SONORITY] ?? 0;
    const simSonority = simEntity
        ? (simEntity?.[effectKeys.SONORITY] ?? realSonority)
        : realSonority;

    const isNumberChanged = simEntity && simSonority !== realSonority;
    const displaySonority = simEntity ? simSonority : realSonority;

    const disNonFill = Math.max(
        0,
        (Math.min(displaySonority, 0) - constants.SONORITY_LOWER_LIMIT) * 2,
    );
    const disFill = 100 - disNonFill;

    const harFill = Math.max(
        0,
        Math.min(displaySonority, constants.SONORITY_HIGHER_LIMIT) * 2,
    );
    const harNonFill = 100 - harFill;

    return (
        <div
            className={`sonority-counter-container`}
            onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.SONORITY)}
        >
            <div className="sonority-counter-upper-labels">
                <span
                    className={`${
                        isNumberChanged ? "is-preview" : ""
                    }`}
                >
                    {`Sonority: ${displaySonority}%`}
                </span>
            </div>
            <div className="sonority-bar-container">
                <div
                    className="dissonance-non-fill"
                    style={{
                        width: `${disNonFill}%`,
                    }}
                ></div>
                <div
                    className="dissonance-fill"
                    style={{
                        width: `${disFill}%`,
                    }}
                ></div>
                <div
                    className="harmony-fill"
                    style={{
                        width: `${harFill}%`,
                    }}
                ></div>
                <div
                    className="harmony-non-fill"
                    style={{
                        width: `${harNonFill}%`,
                    }}
                ></div>
            </div>
            <div className="sonority-counter-lower-labels">
                <span>{constants.SONORITY_LOWER_LIMIT}%</span>
                <span>0</span>
                <span>{constants.SONORITY_HIGHER_LIMIT}%</span>
            </div>
        </div>
    );
}

export default SonorityCounter;
