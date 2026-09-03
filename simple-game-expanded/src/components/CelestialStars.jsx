import { PiStarOfDavid } from "react-icons/pi";
import "./CelestialStars.css";
import { choirKeys, effectKeys } from "../utils/enums";
import {
    canUseCombatInteractions,
    extractEntity,
    getTotalEnlit,
    isChoirActive,
} from "../utils/entities";
import { useUI } from "../contexts/UIContext";
import { useGame } from "../contexts/GameContext";

export default function CelestialStars({ entityKey }) {
    const { game, handleCelestialStars } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = extractEntity(game, entityKey);
    const simEntity = extractEntity(game?.simGame, entityKey);

    if (!isChoirActive(entity, choirKeys.EIGHTH)) {
        return null;
    }

    const realApocStars = entity?.[effectKeys.STARS_OF_APOCALYPSE] ?? 0;
    const simApocStars =
        simEntity?.[effectKeys.STARS_OF_APOCALYPSE] ?? realApocStars;
    const displayApocStars = simEntity ? simApocStars : realApocStars;
    const isApocChanged = simEntity && realApocStars !== simApocStars;
    const isApocClickable =
        realApocStars > 0 &&
        getTotalEnlit(entity) > 1 &&
        canUseCombatInteractions(game, entityKey);

    const realGenStars = entity?.[effectKeys.STARS_OF_GENESIS] ?? 0;
    const simGenStars =
        simEntity?.[effectKeys.STARS_OF_GENESIS] ?? realGenStars;
    const displayGenStars = simEntity ? simGenStars : realGenStars;
    const isGenChanged = simEntity && realGenStars !== simGenStars;
    const isGenClickable =
        realGenStars > 0 && canUseCombatInteractions(game, entityKey);

    return (
        <div className="celestial-star-container">
            <div
                className="apoc-stars-container"
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.STARS_OF_APOCALYPSE)
                }
            >
                <div
                    className="star-icon-btn"
                    onClick={() => {
                        if (isApocClickable) {
                            handleCelestialStars(
                                entityKey,
                                1,
                                effectKeys.STARS_OF_APOCALYPSE,
                            );
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isApocClickable) {
                            handleCelestialStars(
                                entityKey,
                                10,
                                effectKeys.STARS_OF_APOCALYPSE,
                            );
                        }
                    }}
                    disabled={!isApocClickable}
                >
                    <PiStarOfDavid className="star-icon" />
                </div>
                <span
                    className={`apoc-stars-number ${isApocChanged ? "is-preview" : ""}`}
                >
                    {displayApocStars}
                </span>
            </div>

            <div
                className="gen-stars-container"
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.STARS_OF_GENESIS)
                }
            >
                <div
                    className="star-icon-btn"
                    onClick={() => {
                        if (isGenClickable) {
                            handleCelestialStars(
                                entityKey,
                                1,
                                effectKeys.STARS_OF_GENESIS,
                            );
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isGenClickable) {
                            handleCelestialStars(
                                entityKey,
                                10,
                                effectKeys.STARS_OF_GENESIS,
                            );
                        }
                    }}
                    disabled={!isGenClickable}
                >
                    <PiStarOfDavid className="star-icon" />
                </div>
                <span
                    className={`gen-stars-number ${isGenChanged ? "is-preview" : ""}`}
                >
                    {displayGenStars}
                </span>
            </div>
        </div>
    );
}
