import { elementsMap, moonMap } from "../utils/constants";
import { getEntityElement } from "../utils/entities";
import { effectKeys, moonKeys, elementalKeys } from "../utils/enums";
import "./SelenianTracker.css";

const moonClassMap = {
    [moonKeys.HIDDEN]: "moon-hidden",
    [moonKeys.WAXING]: "moon-waxing",
    [moonKeys.WANING]: "moon-waning",
    [moonKeys.BLOODSTAINED]: "moon-bloodstained",
    [moonKeys.CORONAL]: "moon-coronal",
};

const labelClassMap = {
    [elementalKeys.DULLED]: "label-default",
    [elementalKeys.NATURE]: "label-nature",
    [elementalKeys.FROST]: "label-frost",
    [elementalKeys.SCORCH]: "label-scorch",
    [elementalKeys.OCEAN]: "label-ocean",
    [elementalKeys.WITHER]: "label-wither",
    [elementalKeys.ASH]: "label-ash",
    [elementalKeys.ALBEDO]: "label-albedo",
    [elementalKeys.SHATTERED]: "label-shattered",
};

function SelenianTracker({ entity, changeElement, clickable }) {
    // Mirrored Moon mapping
    const phase = entity[effectKeys.MIRRORED_MOON];
    const moonlight = entity[effectKeys.MOONLIGHT];
    const moonLabel = moonMap[phase];

    const moonClass = moonClassMap[phase];

    // Elemental Crystals Mapping
    const currElement = getEntityElement(entity);
    const crystalLabel = elementsMap[currElement];

    const labelClass = labelClassMap[currElement];
    
    // Determine if the crystals are in a shattered state
    const isShattered = currElement === elementalKeys.SHATTERED;

    // Class name constructor helper
    const crystalClass = (elementKey) => {
        const isActive = entity[effectKeys.ELEMENTAL_CRYSTALS].includes(
            elementKey,
        )
            ? "active"
            : "";
        const isLocked = !clickable ? "interaction-disabled" : "";
        const shatteredState = isShattered ? "shattered-crystal" : "";
        
        return `${isActive} ${isLocked} ${shatteredState}`.trim();
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
                        onClick={() => {
                            clickable && changeElement(elementalKeys.NATURE);
                        }}
                    />
                    <button
                        className={`box box-cyan ${crystalClass(elementalKeys.FROST)}`}
                        onClick={() =>
                            clickable && changeElement(elementalKeys.FROST)
                        }
                    />
                    <button
                        className={`box box-red ${crystalClass(elementalKeys.SCORCH)}`}
                        onClick={() =>
                            clickable && changeElement(elementalKeys.SCORCH)
                        }
                    />
                </div>
            </div>
            <span className={`panel-text-label ${labelClass}`}>
                {crystalLabel}
            </span>
            <div className="grid-spacer-cell" />
        </div>
    );
}

export default SelenianTracker;