import StarIcon from "./StarIcon";
import "./StarRow.css";
import { effectKeys } from "../utils/enums";
import { spawnTooltip } from "../utils/dictionary";

function StarRow({
    entityKey,
    entity,
    color,
    starKey,
    showButton,
    handleStarChange,
    starPhase,
    currentPhase,
    reversed,
    handleSetTooltip,
    isPlayerStarfall,
}) {
    const isStarGlowing = currentPhase === starPhase && isPlayerStarfall;

    const hasCurrentStars = entity.stars[starKey] > 0;
    const hasWhiteStars = entity.stars[effectKeys.WHITE_STAR] > 0;

    const isMinusDisabled = !showButton || !hasCurrentStars;
    const isPlusDisabled = !showButton || !hasWhiteStars;

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
                    }}
                    disabled={isMinusDisabled}
                >
                    -
                </button>

                <span>{entity.stars[starKey]}</span>

                <button
                    onClick={() => {
                        handleStarChange(entityKey, starKey, 1);
                    }}
                    disabled={isPlusDisabled}
                >
                    +
                </button>
            </div>

            <div
                onMouseDown={(e) => spawnTooltip(e, handleSetTooltip, starKey)}
            >
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
