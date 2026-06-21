import { eyeKeys } from "../utils/enums";
import "./EyeOfHeavens.css";

const EyeOfHeavens = ({ eyeState }) => {
    if (eyeState === eyeKeys.DORMANT) {
        return null;
    }

    const isOpen = eyeState === eyeKeys.OPEN;

    return (
        <div className="eye-wrapper">
            <div
                className={`eye-frame ${isOpen ? "frame-open" : "frame-closed"}`}
            ></div>

            <div
                className={`eye-slit ${isOpen ? "slit-open" : "slit-closed"}`}
            ></div>
        </div>
    );
};

export default EyeOfHeavens;
