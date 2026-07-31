import { effectKeys } from "../utils/enums";
import "./ManaBar.css";

function ManaBar({ entity }) {
    const hasOverflow = entity.resources.manaOverflow > 0;
    const totalMana = entity.currMana + entity.resources.manaOverflow;

    // Calculate percentages independently
    const overflowPercentage =
        entity.maxMana > 0 && hasOverflow
            ? Math.min(
                  100,
                  (entity.resources.manaOverflow / entity.maxMana) * 100,
              )
            : 0;
    const manaPercentage =
        entity.maxMana > 0 
            ? Math.min(100, (entity.currMana / entity.maxMana) * 100)
            : 0;

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
                <div
                    className="mana-fill"
                    style={{
                        width: `${manaPercentage}%`,
                        backgroundColor: `${backgroundColor}`,
                    }}
                />
                <div
                    className="mana-overflow-fill"
                    style={{ width: `${overflowPercentage}%` }}
                />
            </div>
        </div>
    );
}

export default ManaBar;
