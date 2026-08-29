import { useGame } from "../contexts/GameContext";
import { constants } from "../utils/constants";
import { extractEntity, getDefilement } from "../utils/entities";
import { effectKeys, entityKeys, eyeKeys } from "../utils/enums";
import { toRoman } from "../utils/general";
import EyeOfHeavens from "./EyeOfHeavens";
import "./FieldTracker.css";
import { useUI } from "../contexts/UIContext";

export default function FieldTracker() {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const simGame = game?.simGame;
    const btt = game.btt;
    const simBtt = simGame?.btt;

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

    const realProv = btt[effectKeys.PROVIDENCE];
    const simProv = simBtt ? simBtt[effectKeys.PROVIDENCE] : realProv;
    const isProvChanged = simBtt && simProv !== realProv;
    const displayProv = simBtt ? simProv : realProv;

    const realDefil = getDefilement(game);
    const simDefil = simGame ? getDefilement(simGame) : realDefil;
    const isDefilChanged = simGame && simDefil !== realDefil;
    const displayDefil = simGame ? simDefil : realDefil;

    const baseProvPct = Math.max(
        0,
        Math.min(100, (realProv / constants.MAX_PROVIDENCE) * 100),
    );

    const provLossRatio =
        realProv > 0 ? Math.max(0, (realProv - simProv) / realProv) : 0;

    const provGainLeft = baseProvPct;
    const provGainWidth = Math.max(
        0,
        Math.min(
            100 - baseProvPct,
            (Math.max(0, simProv - realProv) / constants.MAX_PROVIDENCE) * 100,
        ),
    );

    return (
        <div className="btt-tracker-container">
            <div
                className="btt-side btt-left"
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.PROVIDENCE)
                }
            >
                <span className="btt-label">Providence</span>
                <div className="btt-bar-track">
                    <div
                        className="btt-bar-fill providence-bar-animated"
                        style={{ width: `${baseProvPct}%` }}
                    >
                        {provLossRatio > 0 && (
                            <div
                                className="prov-preview-chunk prov-loss"
                                style={{
                                    width: `${provLossRatio * 100}%`,
                                }}
                            />
                        )}
                    </div>

                    {provGainWidth > 0 && (
                        <div
                            className="prov-preview-chunk prov-gain"
                            style={{
                                left: `${provGainLeft}%`,
                                width: `${provGainWidth}%`,
                            }}
                        />
                    )}
                </div>
                <span
                    className={`btt-numeric-value ${
                        isProvChanged ? "is-preview" : ""
                    }`}
                >
                    {displayProv} / {constants.MAX_PROVIDENCE}
                </span>
            </div>

            <div className="btt-center">
                <EyeOfHeavens />
            </div>

            <div
                className="btt-side btt-right"
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DEFILEMENT)
                }
            >
                <span className="btt-label">Defilement</span>
                <span
                    className={`btt-roman-value ${
                        isDefilChanged ? "is-preview" : ""
                    }`}
                >
                    {toRoman(displayDefil)}
                </span>
            </div>
        </div>
    );
}