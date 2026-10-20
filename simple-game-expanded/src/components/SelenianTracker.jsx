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

    const entity = game?.entities?.[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    if (!entity || !entity.states[effectKeys.SELENIAN]) {
        return null;
    }

    // Mirrored Moon Phase
    const realPhase = entity[effectKeys.MIRRORED_MOON];
    const simPhase = simEntity
        ? (simEntity?.[effectKeys.MIRRORED_MOON] ?? realPhase)
        : realPhase;

    const isPhaseChanged = simEntity && simPhase !== realPhase;
    const displayPhase = simEntity ? simPhase : realPhase;

    const moonLabel = moonMap[displayPhase];
    const moonClass = moonClassMap[displayPhase];

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

    // Moonlight
    const realAmount = entity?.[effectKeys.MOONLIGHT] ?? 0;

    const simAmount = simEntity
        ? (simEntity?.[effectKeys.MOONLIGHT] ?? realAmount)
        : realAmount;

    const isNumberChanged = simEntity && simAmount !== realAmount;
    const displayAmount = simEntity ? simAmount : realAmount;

    return (
        <div className="selenian-grid-container">
            <div
                className="graphic-column-cell"
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.MIRRORED_MOON)
                }
            >
                <div
                    className={`moon-sphere ${moonClass} ${
                        isPhaseChanged ? "is-preview" : ""
                    }`}
                />
            </div>
            <span
                className={`panel-text-label label-default ${
                    isPhaseChanged ? "is-preview" : ""
                }`}
                onMouseDown={(e) => handleSpawnTooltip(e, displayPhase)}
            >
                {moonLabel}
            </span>
            <span
                className={`moonlight-panel-value ${
                    isNumberChanged ? "is-preview" : ""
                }`}
                onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.MOONLIGHT)}
            >
                {displayAmount}
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
