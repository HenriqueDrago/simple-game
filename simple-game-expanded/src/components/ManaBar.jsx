import { useUI } from "../contexts/UIContext";
import { effectKeys } from "../utils/enums";
import "./ManaBar.css";

function ManaBar({ entity, simEntity }) {
    const { handleSpawnTooltip } = useUI();

    const maxMana = entity.maxMana;

    const baseMana = entity.currMana;
    const overflowMana = entity.resources?.manaOverflow ?? 0;

    const simMana = simEntity ? simEntity.currMana : baseMana;
    const simOverflow = simEntity
        ? (simEntity.resources?.manaOverflow ?? 0)
        : overflowMana;

    const isSimulating =
        simEntity && (simMana !== baseMana || simOverflow !== overflowMana);

    const displayMana = isSimulating ? simMana : baseMana;
    const displayOverflow = isSimulating ? simOverflow : overflowMana;
    const displayHasOverflow = displayOverflow > 0;
    const displayTotal = displayMana + displayOverflow;

    const overTimes = maxMana > 0 ? Math.floor(displayOverflow / maxMana) : 0;

    const solidMana = Math.min(baseMana, simMana);
    const manaLossAmount = Math.max(0, baseMana - simMana);
    const manaGainAmount = Math.max(0, simMana - baseMana);

    const manaPercentage =
        maxMana > 0 ? Math.min(100, (solidMana / maxMana) * 100) : 0;

    const manaLossLeft = maxMana > 0 ? (solidMana / maxMana) * 100 : 0;
    const manaLossWidth =
        maxMana > 0 ? Math.min(100, (manaLossAmount / maxMana) * 100) : 0;

    const manaGainLeft = maxMana > 0 ? (baseMana / maxMana) * 100 : 0;
    const manaGainWidth =
        maxMana > 0 ? Math.min(100, (manaGainAmount / maxMana) * 100) : 0;

    const solidOverflow = Math.min(overflowMana, simOverflow);
    const overflowLossAmount = Math.max(0, overflowMana - simOverflow);
    const overflowGainAmount = Math.max(0, simOverflow - overflowMana);

    const overflowPercentage =
        maxMana > 0 ? Math.min(100, (solidOverflow / maxMana) * 100) : 0;

    const overflowLossLeft = maxMana > 0 ? (solidOverflow / maxMana) * 100 : 0;
    const overflowLossWidth =
        maxMana > 0 ? Math.min(100, (overflowLossAmount / maxMana) * 100) : 0;

    const overflowGainLeft = maxMana > 0 ? (overflowMana / maxMana) * 100 : 0;
    const overflowGainWidth =
        maxMana > 0 ? Math.min(100, (overflowGainAmount / maxMana) * 100) : 0;

    const backgroundColor =
        entity[effectKeys.MANA_BLEED] > 0 ? "purple" : "blue";
    const textColor = displayHasOverflow ? "cyan" : "inherit";

    return (
        <div
            className="mana-bar-container"
            onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.MANA)}
        >
            <div className="mana-text-wrapper">
                <span>{`Mana${overTimes > 0 ? ` x${overTimes}` : ""}`}</span>
                <div className="mana-values">
                    <span
                        className={`mana-value-display ${
                            isSimulating ? "is-preview" : ""
                        }`}
                    >
                        <span style={{ color: textColor }}>{displayTotal}</span>
                    </span>
                    <span> / </span>
                    <span>{maxMana}</span>
                </div>
            </div>
            <div className="mana-track">
                <div
                    className="mana-fill"
                    style={{
                        width: `${manaPercentage}%`,
                        backgroundColor: `${backgroundColor}`,
                    }}
                />

                {manaLossWidth > 0 && (
                    <div
                        className="preview-chunk mana-loss"
                        style={{
                            left: `${manaLossLeft}%`,
                            width: `${manaLossWidth}%`,
                        }}
                    />
                )}
                {manaGainWidth > 0 && (
                    <div
                        className="preview-chunk mana-gain"
                        style={{
                            left: `${manaGainLeft}%`,
                            width: `${manaGainWidth}%`,
                        }}
                    />
                )}

                {overflowPercentage > 0 && (
                    <div
                        className="mana-overflow-fill"
                        style={{ width: `${overflowPercentage}%` }}
                    />
                )}

                {overflowLossWidth > 0 && (
                    <div
                        className="preview-chunk overflow-loss"
                        style={{
                            left: `${overflowLossLeft}%`,
                            width: `${overflowLossWidth}%`,
                        }}
                    />
                )}
                {overflowGainWidth > 0 && (
                    <div
                        className="preview-chunk overflow-gain"
                        style={{
                            left: `${overflowGainLeft}%`,
                            width: `${overflowGainWidth}%`,
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default ManaBar;