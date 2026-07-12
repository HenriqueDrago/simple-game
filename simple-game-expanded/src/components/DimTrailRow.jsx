import StarIcon from "./StarIcon";
import StarTrail from "./StarTrail";
import "./DimTrailRow.css";
import { spawnTooltip } from "../utils/dictionary";

function DimTrailRow({
    entity,
    color,
    dimmedKey,
    trailKey,
    trailPhase,
    currentPhase,
    reversed,
    handleSetTooltip,
}) {
    const isTrailGlowing = currentPhase === trailPhase;

    return (
        <div
            className="dim-trail-row"
            style={{
                flexDirection: reversed ? "row-reverse" : "row",
            }}
        >
            <div
                className="dim-trail-group"
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, dimmedKey)
                }
            >
                <span>{entity.stars[dimmedKey]}</span>
                <StarIcon
                    size={24}
                    fill={color}
                    stroke="none"
                    strokeWidth={0}
                    opacity={0.5}
                    glowing={false}
                />
            </div>

            <div
                className="dim-trail-group"
                onMouseDown={(e) => spawnTooltip(e, handleSetTooltip, trailKey)}
            >
                <span>{entity.stars[trailKey]}</span>
                <StarTrail
                    size={24}
                    color={color}
                    strokeWidth={0.5}
                    glowing={isTrailGlowing}
                />
            </div>
        </div>
    );
}

export default DimTrailRow;
