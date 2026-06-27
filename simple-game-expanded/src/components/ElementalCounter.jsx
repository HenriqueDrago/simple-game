import './ElementalCounter.css';

function ElementalCounter({ entity }) {
    const permafrostActive = entity.permafrost > 0;
    const overgrowthActive = entity.overgrowth > 0;
    const scoriaActive = entity.scoria > 0;
    return (
        <div className='elemental-counter-container'>
            <div className='individual-elemental-counter-container'>
                <span>{entity.overgrowth}</span>
                <div className={`diamond ${overgrowthActive ? "overgrowth-active" : ""}`}></div>
            </div>
            <div className='individual-elemental-counter-container'>
                <span>{entity.permafrost}</span>
                <div className={`diamond ${permafrostActive ? "permafrost-active" : ""}`}></div>
            </div>
            <div className='individual-elemental-counter-container'>
                <span>{entity.scoria}</span>
                <div className={`diamond ${scoriaActive ? "scoria-active" : ""}`}></div>
            </div>
        </div>
    )
}

export default ElementalCounter;
