import { effectKeys } from "../utils/enums";
import "./ManaBar.css";

function ManaBar({ entity }) {
    const hasOverflow = entity.resources.manaOverflow > 0;
    const totalMana = entity.currMana + entity.resources.manaOverflow;

    // Calculate percentages
    const overflowPercentage = Math.min(
        100,
        (entity.resources.manaOverflow / entity.maxMana) * 100,
    );
    const remainingSpace = 100 - overflowPercentage;
    const manaPercentage = Math.min(
        remainingSpace,
        (entity.currMana / entity.maxMana) * 100,
    );

    const backgroundColor =
        entity[effectKeys.MANA_BLEED] > 0 ? "purple" : "blue";
    const textColor = hasOverflow ? "cyan" : "inherit";

    const overTimes = Math.floor(
        entity.resources[effectKeys.MANA_OVERFLOW] /
            entity[effectKeys.MAX_MANA],
    );

    return (
        <div className="mana-bar-container">
            <div className="mana-text-wrapper">
                <span>{`Mana${overTimes > 0 ? ` x${overTimes}` : ""}`}</span>
                <span>
                    <span style={{ color: textColor }}>{totalMana}</span> /{" "}
                    {entity.maxMana}
                </span>
            </div>
            <div className="mana-track">
                {hasOverflow && (
                    <div
                        className="mana-overflow-fill"
                        style={{ width: `${overflowPercentage}%` }}
                    />
                )}
                <div
                    className="mana-fill"
                    style={{
                        width: `${manaPercentage}%`,
                        backgroundColor: `${backgroundColor}`,
                    }}
                />
            </div>
        </div>
    );
}

export default ManaBar;
