import { effectKeys, moonKeys, elementalKeys } from "../utils/enums";
import "./SelenianTracker.css";

function SelenianTracker({ entity, changeElement, clickable }) {
    // Mirrored Moon
    const phase = entity[effectKeys.MIRRORED_MOON];
    const moonlight = entity[effectKeys.MOONLIGHT];
    
    let moonLabel = "Hidden";
    let moonClass = "clouded";

    if (phase === moonKeys.WANING) {
        moonLabel = "Waning";
        moonClass = "waning";
    } else if (phase === moonKeys.WAXING) {
        moonLabel = "Waxing";
        moonClass = "waxing";
    }

    // Crystals
    const activeElement = entity[effectKeys.ELEMENTAL_CRYSTALS];
    
    let crystalLabel = "Dulled";
    let labelClass = "label-default";

    if (activeElement === elementalKeys.NATURE) {
        crystalLabel = "Nature";
        labelClass = "label-green";
    } else if (activeElement === elementalKeys.FROST) {
        crystalLabel = "Frost";
        labelClass = "label-cyan";
    } else if (activeElement === elementalKeys.SCORCH) {
        crystalLabel = "Scorch";
        labelClass = "label-red";
    }

    // Helper for the class (was growing too complex)
    const crystalClass = (elementKey) => {
        const isActive = activeElement === elementKey ? "active" : "";
        const isLocked = !clickable ? "interaction-disabled" : "";
        return `${isActive} ${isLocked}`;
    };

    return (
        <div className="selenian-grid-container">
            
            <div className="graphic-column-cell">
                <div className={`moon-sphere ${moonClass}`} />
            </div>
            <span className="panel-text-label label-default">{moonLabel}</span>
            <span className="moonlight-panel-value">{moonlight}</span>

            <div className="graphic-column-cell">
                <div className="canvas-container">
                    <button
                        className={`box box-green ${crystalClass(elementalKeys.NATURE)}`}
                        onClick={() => clickable && changeElement(elementalKeys.NATURE)}
                    />
                    <button
                        className={`box box-cyan ${crystalClass(elementalKeys.FROST)}`}
                        onClick={() => clickable && changeElement(elementalKeys.FROST)}
                    />
                    <button
                        className={`box box-red ${crystalClass(elementalKeys.SCORCH)}`}
                        onClick={() => clickable && changeElement(elementalKeys.SCORCH)}
                    />
                </div>
            </div>
            <span className={`panel-text-label ${labelClass}`}>{crystalLabel}</span>
            <div className="grid-spacer-cell" />
            
        </div>
    );
}

export default SelenianTracker;