import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { effectKeys } from "../utils/enums";
import { getRevelation, getFortitude } from "../utils/entities";
import "./AngelAttr.css";

export default function AngelAttr({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const simGame = game?.simGame;

    const realRev = getRevelation(game, entityKey);
    const simRev = simGame ? getRevelation(simGame, entityKey) : realRev;
    const isRevChanged = simGame && simRev !== realRev;
    const displayRev = simGame ? simRev : realRev;

    const realFort = getFortitude(game, entityKey);
    const simFort = simGame ? getFortitude(simGame, entityKey) : realFort;
    const isFortChanged = simGame && simFort !== realFort;
    const displayFort = simGame ? simFort : realFort;

    return (
        <div className="angel-attr-container">
            <div
                className="angel-attr-row"
                onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.REVELATION)}
            >
                <span className="angel-attr-label">REVELATION</span>
                <span
                    className={`angel-attr-value ${
                        isRevChanged ? "is-preview" : ""
                    }`}
                >
                    {displayRev}
                </span>
            </div>

            <div
                className="angel-attr-row"
                onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.FORTITUDE)}
            >
                <span className="angel-attr-label">FORTITUDE</span>
                <span
                    className={`angel-attr-value ${
                        isFortChanged ? "is-preview" : ""
                    }`}
                >
                    {displayFort}
                </span>
            </div>
        </div>
    );
}