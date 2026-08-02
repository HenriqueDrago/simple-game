import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { toRoman } from "../utils/general";
import "./RankedCounter.css";

export default function RankedCounter({
    resourceKey,
    entityKey,
    label,
    roman = false,
    style,
    tooltip = null,
}) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game?.entities?.[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    const realAmount =
        entity?.[resourceKey] ?? entity?.resources?.[resourceKey] ?? 0;

    const simAmount = simEntity
        ? (simEntity?.[resourceKey] ??
          simEntity?.resources?.[resourceKey] ??
          realAmount)
        : realAmount;

    const isNewResource = realAmount <= 0 && simAmount > 0;
    const isNumberChanged = simEntity && simAmount !== realAmount;
    const displayAmount = simEntity ? simAmount : realAmount;

    const targetTooltip = tooltip || resourceKey;

    return (
        <div
            className={`ranked-counter-container ${
                isNewResource ? "is-new-preview" : ""
            }`}
            style={style}
            onMouseDown={(e) => {
                if (targetTooltip) {
                    handleSpawnTooltip(e, targetTooltip);
                }
            }}
        >
            <span>
                {`${label}: `}
                <span
                    className={`counter-amount ${
                        isNumberChanged && !isNewResource ? "is-preview" : ""
                    }`}
                >
                    {roman ? toRoman(displayAmount) : displayAmount}
                </span>
            </span>
        </div>
    );
}