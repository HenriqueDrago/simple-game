import "./ElementalWheel.css";
import { directionKeys, elementalKeys } from "../utils/enums";

function ElementalWheel({ element, direction }) {
    if (element === elementalKeys.INACTIVE) {
        return null;
    }

    const directionClass =
        direction === directionKeys.CLOCKWISE
            ? "clockwise"
            : "counter-clockwise";

    return (
        <div className="elemental-wheel-container">
            <div
                className={`individual-element-container ${element === elementalKeys.NATURE ? "nature-active" : ""} ${directionClass}`}
            >
                <span>Nature</span>
            </div>
            <div
                className={`individual-element-container ${element === elementalKeys.FROST ? "frost-active" : ""} ${directionClass}`}
            >
                <span>Frost</span>
            </div>
            <div
                className={`individual-element-container ${element === elementalKeys.SCORCH ? "scorch-active" : ""} ${directionClass}`}
            >
                <span>Scorch</span>
            </div>
        </div>
    );
}

export default ElementalWheel;
