import { effectKeys } from "../utils/enums";
import "./ManaBar.css";

function ManaBar({ entity, simEntity }) {
    const maxMana = entity.maxMana;

    const baseMana = entity.currMana;
    const overflowMana = entity.resources?.manaOverflow ?? 0;
    const hasOverflow = overflowMana > 0;

    const overflowPercentage =
        maxMana > 0 && hasOverflow
            ? Math.min(100, (overflowMana / maxMana) * 100)
            : 0;
    const manaPercentage =
        maxMana > 0 ? Math.min(100, (baseMana / maxMana) * 100) : 0;

    const overTimes = maxMana > 0 ? Math.floor(overflowMana / maxMana) : 0;

    const simMana = simEntity ? simEntity.currMana : baseMana;
    const simOverflow = simEntity
        ? simEntity.resources?.manaOverflow ?? 0
        : overflowMana;

    const isSimulating =
        simEntity && (simMana !== baseMana || simOverflow !== overflowMana);
    const displayMana = isSimulating ? simMana : baseMana;
    const displayOverflow = isSimulating ? simOverflow : overflowMana;
    const displayHasOverflow = displayOverflow > 0;
    const displayTotal = displayMana + displayOverflow;

    const manaDelta = simMana - baseMana;
    const manaLossAmount = manaDelta < 0 ? Math.abs(manaDelta) : 0;
    const manaGainAmount = manaDelta > 0 ? manaDelta : 0;

    const manaLossLeft = maxMana > 0 ? (simMana / maxMana) * 100 : 0;
    const manaLossWidth =
        maxMana > 0 ? Math.min(100, (manaLossAmount / maxMana) * 100) : 0;

    const manaGainLeft = maxMana > 0 ? (baseMana / maxMana) * 100 : 0;
    const manaGainWidth =
        maxMana > 0 ? Math.min(100, (manaGainAmount / maxMana) * 100) : 0;

    const overflowDelta = simOverflow - overflowMana;
    const overflowLossAmount = overflowDelta < 0 ? Math.abs(overflowDelta) : 0;
    const overflowGainAmount = overflowDelta > 0 ? overflowDelta : 0;

    const overflowLossLeft = maxMana > 0 ? (simOverflow / maxMana) * 100 : 0;
    const overflowLossWidth =
        maxMana > 0 ? Math.min(100, (overflowLossAmount / maxMana) * 100) : 0;

    const overflowGainLeft = maxMana > 0 ? (overflowMana / maxMana) * 100 : 0;
    const overflowGainWidth =
        maxMana > 0 ? Math.min(100, (overflowGainAmount / maxMana) * 100) : 0;

    const backgroundColor =
        entity[effectKeys.MANA_BLEED] > 0 ? "purple" : "blue";
    const textColor = displayHasOverflow ? "cyan" : "inherit";

    return (
        <div className="mana-bar-container">
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

                {hasOverflow && (
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