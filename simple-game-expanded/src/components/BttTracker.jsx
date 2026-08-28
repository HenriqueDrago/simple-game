import { useGame } from "../contexts/GameContext";
import { constants } from "../utils/constants";
import { extractEntity, getDefilement } from "../utils/entities";
import { effectKeys, entityKeys, eyeKeys } from "../utils/enums";
import { toRoman } from "../utils/general";
import EyeOfHeavens from "./EyeOfHeavens";
import "./BttTracker.css";

export default function BttTracker() {
    const { game } = useGame();

    const btt = game.btt;

    const p1 = extractEntity(game, entityKeys.PLAYER_ONE);
    const p2 = extractEntity(game, entityKeys.PLAYER_TWO);

    if (
        btt[effectKeys.EYE_OF_HEAVENS] === eyeKeys.DORMANT &&
        btt[effectKeys.PROVIDENCE] <= 0 &&
        !p1.states[effectKeys.ASCENDENCE_OF_SPIRIT] &&
        !p2.states[effectKeys.ASCENDENCE_OF_SPIRIT]
    ) {
        return null;
    }

    const prov = btt[effectKeys.PROVIDENCE];
    const defil = getDefilement(game);

    const provFill = Math.max(
        0,
        Math.min((prov / constants.MAX_PROVIDENCE) * 100, 100)
    );

    return (
        <div className="btt-tracker-container">
            {/* Left side: Providence Bar */}
            <div className="btt-side btt-left">
                <span className="btt-label">Providence</span>
                <div className="btt-bar-track">
                    <div
                        className="btt-bar-fill providence-bar-animated"
                        style={{ width: `${provFill}%` }}
                    />
                </div>
                <span className="btt-numeric-value">
                    {prov} / {constants.MAX_PROVIDENCE}
                </span>
            </div>

            <div className="btt-center">
                <EyeOfHeavens />
            </div>

            <div className="btt-side btt-right">
                <span className="btt-label">Defilement</span>
                <span className="btt-roman-value">{toRoman(defil)}</span>
            </div>
        </div>
    );
}