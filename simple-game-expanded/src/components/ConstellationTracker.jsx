import { spawnTooltip } from "../utils/dictionary";
import { canUseCombatInteractions } from "../utils/entities";
import {
    effectKeys,
} from "../utils/enums";
import { toRoman } from "../utils/general";
import "./ConstellationTracker.css";

export default function ConstellationTracker({
    game,
    entityKey,
    entity,
    handleConstellation,
    handleSetTooltip,
}) {
    const totalConstellation =
        entity[effectKeys.CONSTELLATION] +
        entity[effectKeys.AZURE_CONSTELLATION] +
        entity[effectKeys.CRIMSON_CONSTELLATION];

    if (totalConstellation <= 0) {
        return null;
    }

    let activeClass = "yellow-constellation";
    if (entity[effectKeys.AZURE_CONSTELLATION] > 0) {
        activeClass = "azure-constellation";
    } else if (entity[effectKeys.CRIMSON_CONSTELLATION] > 0) {
        activeClass = "crimson-constellation";
    }

    const buttonActive = canUseCombatInteractions(game);

    return (
        <div className={`constellation-tracker-container ${activeClass}`}>
            <span
                className="constellation-display"
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.CONSTELLATION)
                }
            >
                Constellation: {toRoman(totalConstellation)}
            </span>
            <div>
                <button
                    className="constellation-crimson-button"
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.CRIMSON_CONSTELLATION,
                        )
                    }
                    onClick={() =>
                        handleConstellation(
                            entityKey,
                            effectKeys.CRIMSON_CONSTELLATION,
                        )
                    }
                    disabled={!buttonActive}
                >
                    Crimson
                </button>
                <button
                    className="constellation-azure-button"
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.AZURE_CONSTELLATION,
                        )
                    }
                    onClick={() =>
                        handleConstellation(
                            entityKey,
                            effectKeys.AZURE_CONSTELLATION,
                        )
                    }
                    disabled={!buttonActive}
                >
                    Azure
                </button>
            </div>
        </div>
    );
}
