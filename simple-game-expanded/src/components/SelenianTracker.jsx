import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { elementsMap, moonMap } from "../utils/constants";
import { canUseCombatInteractions, getEntityElement } from "../utils/entities";
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

function SelenianTracker({ entityKey }) {
    const { game, handleElementChange } = useGame();
    const { handleSpawnTooltip } = useUI();

    // Mirrored Moon mapping
    const entity = game.entities[entityKey];
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

    const clickable = canUseCombatInteractions(game, entityKey);

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
            <div
                className="graphic-column-cell"
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.MIRRORED_MOON)
                }
            >
                <div className={`moon-sphere ${moonClass}`} />
            </div>
            <span
                className="panel-text-label label-default"
                onMouseDown={(e) => handleSpawnTooltip(e, phase)}
            >
                {moonLabel}
            </span>
            <span
                className="moonlight-panel-value"
                onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.MOONLIGHT)}
            >
                {moonlight}
            </span>

            <div
                className="graphic-column-cell"
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.ELEMENTAL_CRYSTALS)
                }
            >
                <div className="canvas-container">
                    <button
                        className={`box box-green ${crystalClass(elementalKeys.NATURE)}`}
                        onClick={() => {
                            clickable &&
                                handleElementChange(
                                    entityKey,
                                    elementalKeys.NATURE,
                                );
                        }}
                    />
                    <button
                        className={`box box-cyan ${crystalClass(elementalKeys.FROST)}`}
                        onClick={() =>
                            clickable &&
                            handleElementChange(entityKey, elementalKeys.FROST)
                        }
                    />
                    <button
                        className={`box box-red ${crystalClass(elementalKeys.SCORCH)}`}
                        onClick={() =>
                            clickable &&
                            handleElementChange(entityKey, elementalKeys.SCORCH)
                        }
                    />
                </div>
            </div>
            <span
                className={`panel-text-label ${labelClass}`}
                onMouseDown={(e) => handleSpawnTooltip(e, currElement)}
            >
                {crystalLabel}
            </span>
            <div className="grid-spacer-cell" />
        </div>
    );
}

export default SelenianTracker;
