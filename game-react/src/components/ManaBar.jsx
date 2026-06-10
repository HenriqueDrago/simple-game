import './ManaBar.css';

function ManaBar({ entity }) {
    const hasOverflow = entity.manaOverflow > 0;
    const totalMana = entity.currMana + entity.manaOverflow;

    // Calculate percentages
    const overflowPercentage = Math.min(100, (entity.manaOverflow / entity.maxMana) * 100);
    const remainingSpace = 100 - overflowPercentage;
    const manaPercentage = Math.min(remainingSpace, (entity.currMana / entity.maxMana) * 100);

    const backgroundColor = entity.bloodSacrifice > 0 ? "purple" : "blue";
    const textColor = hasOverflow ? "cyan" : "inherit";

    return (
        <div className="mana-bar-container">
            <div 
                className="mana-text-wrapper" 
                style={{ color: textColor }}
            >
                <span>Mana</span>
                <span>
                    {totalMana} / {entity.maxMana}
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
                        backgroundColor: `${backgroundColor}`
                    }}
                />
            </div>
        </div>
    );
}

export default ManaBar;