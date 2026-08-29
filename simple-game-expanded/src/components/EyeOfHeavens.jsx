import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { effectKeys, eyeKeys } from "../utils/enums";
import "./EyeOfHeavens.css";

export default function EyeOfHeavens() {
    const { handleSpawnTooltip } = useUI();
    const { game } = useGame();

    const eye = game.btt[effectKeys.EYE_OF_HEAVENS];

    const isOpen = eye === eyeKeys.OPEN;

    return (
        <div
            className="eye-wrapper"
            onMouseDown={(e) =>
                handleSpawnTooltip(e, effectKeys.EYE_OF_HEAVENS)
            }
        >
            <div
                className={`eye-frame ${isOpen ? "frame-open" : "frame-closed"}`}
            ></div>

            <div
                className={`eye-slit ${isOpen ? "slit-open" : "slit-closed"}`}
            ></div>
        </div>
    );
}
