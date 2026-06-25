import "./StarsPanel.css";
import { effectKeys, entityKeys, turnStatus } from "../utils/enums";
import StarIcon from "./StarIcon";
import StarRow from "./StarRow";
import { coloredStars } from "../utils/constants";
import DimTrailRow from "./DimTrailRow";

function StarsPanel({ game, entityKey, handleStarChange, reversed }) {
    const entity = game.entities[entityKey];
    const currPhase = game.starQueue ? game.starQueue[0] : null;

    const showButton =
        entityKey === entityKeys.PLAYER_ONE
            ? game.status === turnStatus.PLAYER_ONE_TURN
            : game.status === turnStatus.PLAYER_TWO_TURN;

    return (
        <div className="star-panel-container" style={{
            flexDirection: reversed ? "row-reverse" : "row"
        }}>
            <div className="star-panel-main-container">
                <div className="white-and-gray-container">
                    <div className="special-star">
                        <span>{entity.stars[effectKeys.GRAY_STAR]}</span>
                        <StarIcon
                            size={24}
                            fill="gray"
                            stroke="none"
                            strokeWidth={0}
                            glowing={false}
                        />
                    </div>

                    <div className="special-star">
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
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StarsPanel;