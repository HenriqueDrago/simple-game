import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { constants } from "../utils/constants";
import { effectKeys } from "../utils/enums";
import "./TarnishedSinBar.css";

export default function TarnishedSinBar({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game?.entities?.[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    const realAmount =
        entity?.[effectKeys.TARNISHED_SIN] ??
        entity?.resources?.[effectKeys.TARNISHED_SIN] ??
        0;

    const simAmount = simEntity
        ? (simEntity?.[effectKeys.TARNISHED_SIN] ??
          simEntity?.resources?.[effectKeys.TARNISHED_SIN] ??
          realAmount)
        : realAmount;

    const isNewResource = realAmount <= 0 && simAmount > 0;
    const isNumberChanged = simEntity && simAmount !== realAmount;
    const displayAmount = simEntity ? simAmount : realAmount;
    const willDisappear = realAmount > 0 && simAmount <= 0;

    if (realAmount <= 0 && simAmount <= 0) {
        return null;
    }

    const fillPercentage = Math.max(0, Math.min(100, (displayAmount / constants.MAX_SIN) * 100));

    return (
        <div
            className={`tarnished-sin-bar-container ${
                isNewResource || willDisappear ? "is-new-preview" : ""
            }`}
            onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.TARNISHED_SIN)}
        >
            <div className="tarnished-sin-header">
                <span className="tarnished-sin-label">Tarnished Sin</span>
                <span
                    className={`tarnished-sin-value ${
                        isNumberChanged && !isNewResource && !willDisappear ? "is-preview" : ""
                    }`}
                >
                    {displayAmount}%
                </span>
            </div>
            <div className="tarnished-sin-track">
                <div
                    className="tarnished-sin-fill tarnished-sin-animated"
                    style={{ width: `${fillPercentage}%` }}
                />
            </div>
        </div>
    );
}