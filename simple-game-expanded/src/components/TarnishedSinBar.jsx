import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { constants } from "../utils/constants";
import { extractEntity } from "../utils/entities";
import { effectKeys, entityKeys } from "../utils/enums";
import { roundNumber } from "../utils/general";
import "./TarnishedSinBar.css";

export default function TarnishedSinBar({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const p1 = extractEntity(game, entityKeys.PLAYER_ONE);
    const p2 = extractEntity(game, entityKeys.PLAYER_TWO);

    const isP1Enabling =
        p1?.states?.[effectKeys.ASCENDENCE_OF_SPIRIT] ||
        p1?.[effectKeys.TARNISHED_SIN] > 0;
    const isP2Enabling =
        p2?.states?.[effectKeys.ASCENDENCE_OF_SPIRIT] ||
        p2?.[effectKeys.TARNISHED_SIN] > 0;

    if (!isP1Enabling && !isP2Enabling) {
        return null;
    }

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

    const isNumberChanged = simEntity && simAmount !== realAmount;
    const displayAmount = simEntity ? simAmount : realAmount;

    const fillPercentage = Math.max(
        0,
        Math.min(100, (displayAmount / constants.MAX_SIN) * 100),
    );

    return (
        <div
            className={`tarnished-sin-bar-container `}
            onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.TARNISHED_SIN)}
        >
            <div className="tarnished-sin-header">
                <span className="tarnished-sin-label">Tarnished Sin</span>
                <span
                    className={`tarnished-sin-value ${
                        isNumberChanged
                            ? "is-preview"
                            : ""
                    }`}
                >
                    {roundNumber(displayAmount, 2)}%
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
