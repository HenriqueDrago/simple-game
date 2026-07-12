import "./StarsPanel.css";
import {
    effectKeys,
    entityKeys,
    playerTurnPhases,
    roundPhases,
} from "../utils/enums";
import StarIcon from "./StarIcon";
import StarRow from "./StarRow";
import { coloredStars } from "../utils/constants";
import DimTrailRow from "./DimTrailRow";
import { spawnTooltip } from "../utils/dictionary";

function StarsPanel({
    game,
    entityKey,
    handleStarChange,
    reversed,
    handleSetTooltip,
}) {
    const entity = game.entities[entityKey];
    const currPhase = game.starQueue ? game.starQueue[0] : null;

    const currRoundPhase =
        game.roundQueue && game.roundQueue.length > 0
            ? game.roundQueue[game.roundIndex]
            : null;
    const currPlayerPhase =
        game.playerQueue && game.playerQueue.length > 0
            ? game.playerQueue[0]
            : null;

    const showButton =
        entityKey === entityKeys.PLAYER_ONE
            ? currRoundPhase === roundPhases.PLAYER_ONE_TURN &&
              currPlayerPhase === playerTurnPhases.PLAN
            : currRoundPhase === roundPhases.PLAYER_TWO_TURN &&
              currPlayerPhase === playerTurnPhases.PLAN;

    return (
        <div
            className="star-panel-container"
            style={{
                flexDirection: reversed ? "row-reverse" : "row",
            }}
        >
            <div className="star-panel-main-container">
                <div className="white-and-gray-container">
                    <div
                        className="special-star"
                        onMouseDown={(e) =>
                            spawnTooltip(
                                e,
                                handleSetTooltip,
                                effectKeys.GRAY_STAR,
                            )
                        }
                    >
                        <span>{entity.stars[effectKeys.GRAY_STAR]}</span>
                        <StarIcon
                            size={24}
                            fill="gray"
                            stroke="none"
                            strokeWidth={0}
                            glowing={false}
                        />
                    </div>

                    <div
                        className="special-star"
                        onMouseDown={(e) =>
                            spawnTooltip(
                                e,
                                handleSetTooltip,
                                effectKeys.WHITE_STAR,
                            )
                        }
                    >
                        <span>{entity.stars[effectKeys.WHITE_STAR]}</span>
                        <StarIcon
                            size={24}
                            fill="white"
                            stroke="none"
                            strokeWidth={0}
                            glowing={false}
                        />
                    </div>
                </div>

                <div className="colored-star-container">
                    {coloredStars.map((star) => (
                        <StarRow
                            key={star.name}
                            entityKey={entityKey}
                            entity={entity}
                            color={star.color}
                            starKey={star.star}
                            handleStarChange={handleStarChange}
                            showButton={showButton}
                            starPhase={star.starPhase}
                            currentPhase={currPhase}
                            reversed={reversed}
                            handleSetTooltip={handleSetTooltip}
                        />
                    ))}
                </div>
            </div>

            <div className="star-panel-side-container">
                <div className="trail-dim-container">
                    {coloredStars.map((star) => (
                        <DimTrailRow
                            key={star.name}
                            entity={entity}
                            color={star.color}
                            dimmedKey={star.dimmed}
                            trailKey={star.trail}
                            trailPhase={star.trailPhase}
                            currentPhase={currPhase}
                            reversed={reversed}
                            handleSetTooltip={handleSetTooltip}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StarsPanel;
