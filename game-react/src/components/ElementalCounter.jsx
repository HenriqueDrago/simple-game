import './ElementalCounter.css';

function ElementalCounter({ entity }) {
    const permafrostActive = entity.resources.permafrost > 0;
    const overgrowthActive = entity.resources.overgrowth > 0;
    const scoriaActive = entity.resources.scoria > 0;
    return (
        <div className='elemental-counter-container'>
            <div className='individual-elemental-counter-container'>
                <span>{entity.resources.overgrowth}</span>
                <div className={`diamond ${overgrowthActive ? "overgrowth-active" : ""}`}></div>
            </div>
            <div className='individual-elemental-counter-container'>
                <span>{entity.resources.permafrost}</span>
                <div className={`diamond ${permafrostActive ? "permafrost-active" : ""}`}></div>
            </div>
            <div className='individual-elemental-counter-container'>
                <span>{entity.resources.scoria}</span>
                <div className={`diamond ${scoriaActive ? "scoria-active" : ""}`}></div>
            </div>
        </div>
    )
}

export default ElementalCounter;
