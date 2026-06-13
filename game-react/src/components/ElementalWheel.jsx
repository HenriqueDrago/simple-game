import "./ElementalWheel.css";
import { elementalKeys } from "../utils/enums";

function ElementalWheel({ element }) {
    if(element === elementalKeys.INACTIVE) {
        return null;
    }

    return (
        <div className="elemental-wheel-container">
            <div className={`individual-element-container ${element === elementalKeys.NATURE ? "nature-active" : ""}`}>
                <span>Nature</span>
            </div>
            <div className={`individual-element-container ${element === elementalKeys.FROST ? "frost-active" : ""}`}>
                <span>Frost</span>
            </div>
            <div className={`individual-element-container ${element === elementalKeys.SCORCH ? "scorch-active" : ""}`}>
                <span>Scorch</span>
            </div>
        </div>
    );
}

export default ElementalWheel;
