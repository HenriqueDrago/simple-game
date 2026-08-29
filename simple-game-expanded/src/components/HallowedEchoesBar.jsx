import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { constants } from "../utils/constants";
import { isChoirActive } from "../utils/entities";
import { choirKeys, effectKeys } from "../utils/enums";
import "./HallowedEchoesBar.css";

export default function HallowedEchoesBar({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game?.entities?.[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    if (!isChoirActive(entity, choirKeys.SIXTH)) {
        return null;
    }

    const realEchoes = entity?.[effectKeys.HALLOWED_ECHOES] ?? 0;
    const simEchoes = simEntity
        ? (simEntity?.[effectKeys.HALLOWED_ECHOES] ?? realEchoes)
        : realEchoes;

    const isChanged = simEntity && simEchoes !== realEchoes;
    const displayEchoes = simEntity ? simEchoes : realEchoes;

    const negNonFill = Math.max(
        0,
        ((Math.min(displayEchoes, 0) - constants.MIN_HALLOW) * 100) / -constants.MIN_HALLOW,
    );
    const negFill = 100 - negNonFill;

    const posFill = Math.max(
        0,
        (Math.min(displayEchoes, constants.MAX_HALLOW) * 100) / constants.MAX_HALLOW,
    );
    const posNonFill = 100 - posFill;

    return (
        <div
            className="hallowed-echoes-container"
            onMouseDown={(e) =>
                handleSpawnTooltip(e, effectKeys.HALLOWED_ECHOES)
            }
        >
            <div className="hallowed-echoes-upper-labels">
                <span className="hallowed-echoes-title">HALLOWED ECHOES</span>
                <span
                    className={`hallowed-echoes-value ${
                        isChanged ? "is-preview" : ""
                    }`}
                >
                    {displayEchoes > 0
                        ? `+${displayEchoes}%`
                        : `${displayEchoes}%`}
                </span>
            </div>

            <div className="hallowed-echoes-bar-track">
                <div
                    className="hallowed-neg-non-fill"
                    style={{ width: `${negNonFill}%` }}
                />
                <div
                    className="hallowed-neg-fill"
                    style={{ width: `${negFill}%` }}
                />
                <div
                    className="hallowed-pos-fill"
                    style={{ width: `${posFill}%` }}
                />
                <div
                    className="hallowed-pos-non-fill"
                    style={{ width: `${posNonFill}%` }}
                />
            </div>

            <div className="hallowed-echoes-lower-labels">
                <span>{constants.MIN_HALLOW}%</span>
                <span>0%</span>
                <span>+{constants.MAX_HALLOW}%</span>
            </div>
        </div>
    );
}
