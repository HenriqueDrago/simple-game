import StarIcon from "./StarIcon";
import "./StarRow.css";
import { effectKeys, entityKeys } from "../utils/enums";
import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";

function StarRow({
    entityKey,
    entity,
    color,
    starKey,
    showButton,
    starPhase,
    currentPhase,
    reversed,
    isPlayerStarfall,
}) {
    const { handleStarChange, handleCreateSimulatedGame } = useGame();
    const { handleSpawnTooltip } = useUI();

    const isStarGlowing = currentPhase === starPhase && isPlayerStarfall;

    const hasCurrentStars = entity.stars[starKey] > 0;
    const hasWhiteStars = entity.stars[effectKeys.WHITE_STAR] > 0;

    const isMinusDisabled = !showButton || !hasCurrentStars;
    const isPlusDisabled = !showButton || !hasWhiteStars;

    const otherEntityKey =
        entityKey === entityKeys.PLAYER_ONE
            ? entityKeys.PLAYER_TWO
            : entityKeys.PLAYER_ONE;

    return (
        <div
            className="colored-star-row"
            style={{
                flexDirection: reversed ? "row-reverse" : "row",
            }}
        >
            <div className="star-row-buttons">
                <button
                    onClick={() => {
                        handleStarChange(entityKey, starKey, -1);
                        handleCreateSimulatedGame(
                            null,
                            entityKey,
                            otherEntityKey,
                        );
                    }}
                    disabled={isMinusDisabled}
                >
                    -
                </button>

                <span>{entity.stars[starKey]}</span>

                <button
                    onClick={() => {
                        handleStarChange(entityKey, starKey, 1);
                        handleCreateSimulatedGame(
                            null,
                            entityKey,
                            otherEntityKey,
                        );
                    }}
                    disabled={isPlusDisabled}
                >
                    +
                </button>
            </div>

            <div onMouseDown={(e) => handleSpawnTooltip(e, starKey)}>
                <StarIcon
                    size={24}
                    fill={color}
                    stroke="none"
                    strokeWidth={0}
                    opacity={1.0}
                    glowing={isStarGlowing}
                />
            </div>
        </div>
    );
}

export default StarRow;
