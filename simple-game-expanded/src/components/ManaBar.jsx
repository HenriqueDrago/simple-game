import { useUI } from "../contexts/UIContext";
import { effectKeys } from "../utils/enums";
import "./ManaBar.css";

function ManaBar({ entity, simEntity }) {
    const { handleSpawnTooltip } = useUI();

    const baseMaxMana = entity.maxMana;
    const simMaxMana = simEntity ? simEntity.maxMana : baseMaxMana;
    const isMaxManaSimulating = simEntity && simMaxMana !== baseMaxMana;

    const displayMaxMana = isMaxManaSimulating ? simMaxMana : baseMaxMana;
    const maxMana = displayMaxMana;

    const baseMana = entity.currMana;
    const overflowMana = entity.resources?.manaOverflow ?? 0;

    const simMana = simEntity ? simEntity.currMana : baseMana;
    const simOverflow = simEntity
        ? (simEntity.resources?.manaOverflow ?? 0)
        : overflowMana;

    const isManaSimulating =
        simEntity && (simMana !== baseMana || simOverflow !== overflowMana);

    const displayMana = isManaSimulating ? simMana : baseMana;
    const displayOverflow = isManaSimulating ? simOverflow : overflowMana;
    const displayHasOverflow = displayOverflow > 0;
    const displayTotal = displayMana + displayOverflow;

    const overTimes = maxMana > 0 ? Math.floor(displayOverflow / maxMana) : 0;

    const manaPercentage =
        maxMana > 0 ? Math.min(100, (baseMana / maxMana) * 100) : 0;
    const manaLossRatio =
        baseMana > 0 ? Math.max(0, (baseMana - simMana) / baseMana) : 0;
    const manaGainLeft = manaPercentage;
    const manaGainWidth =
        maxMana > 0
            ? Math.min(100, (Math.max(0, simMana - baseMana) / maxMana) * 100)
            : 0;

    const overflowPercentage =
        maxMana > 0 ? Math.min(100, (overflowMana / maxMana) * 100) : 0;
    const overflowLossRatio =
        overflowMana > 0
            ? Math.max(0, (overflowMana - simOverflow) / overflowMana)
            : 0;
    const overflowGainLeft = overflowPercentage;
    const overflowGainWidth =
        maxMana > 0
            ? Math.min(
                  100,
                  (Math.max(0, simOverflow - overflowMana) / maxMana) * 100,
              )
            : 0;

    const activeEntity =
        isManaSimulating || isMaxManaSimulating ? simEntity : entity;
    const backgroundColor =
        activeEntity[effectKeys.MANA_BLEED] > 0 ? "purple" : "blue";
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
                            isManaSimulating ? "is-preview" : ""
                        }`}
                    >
                        <span style={{ color: textColor }}>{displayTotal}</span>
                    </span>
                    <span> / </span>
                    <span className={isMaxManaSimulating ? "is-preview" : ""}>
                        {displayMaxMana}
                    </span>
                </div>
            </div>
            <div className="mana-track">
                <div
                    className="mana-fill"
                    style={{
                        width: `${manaPercentage}%`,
                        backgroundColor: `${backgroundColor}`,
                    }}
                >
                    {manaLossRatio > 0 && (
                        <div
                            className="preview-chunk mana-loss"
                            style={{
                                width: `${manaLossRatio * 100}%`,
                            }}
                        />
                    )}
                </div>

                {manaGainWidth > 0 && (
                    <div
                        className="preview-chunk mana-gain"
                        style={{
                            left: `${manaGainLeft}%`,
                            width: `${manaGainWidth}%`,
                        }}
                    />
                )}

                <div
                    className="mana-overflow-fill"
                    style={{ width: `${overflowPercentage}%` }}
                >
                    {overflowLossRatio > 0 && (
                        <div
                            className="preview-chunk overflow-loss"
                            style={{
                                width: `${overflowLossRatio * 100}%`,
                            }}
                        />
                    )}
                </div>

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
