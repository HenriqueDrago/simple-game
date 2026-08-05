import "./StarsPanel.css";
import { effectKeys, entityKeys, roundPhases } from "../utils/enums";
import StarIcon from "./StarIcon";
import StarRow from "./StarRow";
import { coloredStars } from "../utils/constants";
import { canUseCombatInteractions } from "../utils/entities";
import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";

function StarsPanel({ entityKey, reversed }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game.entities[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    const baseGray = entity.stars[effectKeys.GRAY_STAR];
    const simGray = simEntity
        ? simEntity.stars[effectKeys.GRAY_STAR]
        : baseGray;
    const isGraySimulating = simEntity && simGray !== baseGray;
    const displayGray = isGraySimulating ? simGray : baseGray;

    const baseWhite = entity.stars[effectKeys.WHITE_STAR];
    const simWhite = simEntity
        ? simEntity.stars[effectKeys.WHITE_STAR]
        : baseWhite;
    const isWhiteSimulating = simEntity && simWhite !== baseWhite;
    const displayWhite = isWhiteSimulating ? simWhite : baseWhite;

    const currPhase = game.starQueue ? game.starQueue[0] : null;

    const currRoundPhase =
        game.roundQueue && game.roundQueue.length > 0
            ? game.roundQueue[game.roundIndex]
            : null;

    const isSingularity =
        currRoundPhase === roundPhases.P1_SINGULARITY ||
        currRoundPhase === roundPhases.P2_SINGULARITY;

    const showButton =
        canUseCombatInteractions(game, entityKey) && !isSingularity;

    const isPlayerStarfall =
        entityKey === entityKeys.PLAYER_ONE
            ? currRoundPhase === roundPhases.P1_STARS_TURN
            : currRoundPhase === roundPhases.P2_STARS_TURN;

    return (
        <div className="star-panel-container">
            <div className="star-panel-main-container">
                <div className="white-and-gray-container">
                    <div
                        className="special-star"
                        onMouseDown={(e) =>
                            handleSpawnTooltip(e, effectKeys.GRAY_STAR)
                        }
                    >
                        <span className={isGraySimulating ? "is-preview" : ""}>
                            {displayGray}
                        </span>
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
                            handleSpawnTooltip(e, effectKeys.WHITE_STAR)
                        }
                    >
                        <span className={isWhiteSimulating ? "is-preview" : ""}>
                            {displayWhite}
                        </span>
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
                            showButton={showButton}
                            starPhase={star.starPhase}
                            currentPhase={currPhase}
                            reversed={reversed}
                            isPlayerStarfall={isPlayerStarfall}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StarsPanel;
