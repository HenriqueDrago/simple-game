import { spawnTooltip } from "../utils/dictionary";
import {
    aiKeys,
    effectKeys,
    entityKeys,
    playerTurnPhases,
    roundPhases,
    turnStatus,
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

    const currRoundPhase =
        game.roundQueue && game.roundQueue.length > 0
            ? game.roundQueue[game.roundIndex]
            : null;
    const currPlayerPhase =
        game.playerQueue && game.playerQueue.length > 0
            ? game.playerQueue[0]
            : null;

    const buttonActive =
        entityKey === entityKeys.PLAYER_ONE
            ? currRoundPhase === roundPhases.PLAYER_ONE_TURN &&
              currPlayerPhase === playerTurnPhases.PLAN &&
              entity.controller === aiKeys.HUMAN &&
              game.status === turnStatus.ONGOING
            : currRoundPhase === roundPhases.PLAYER_TWO_TURN &&
              currPlayerPhase === playerTurnPhases.PLAN &&
              entity.controller === aiKeys.HUMAN &&
              game.status === turnStatus.ONGOING;

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
