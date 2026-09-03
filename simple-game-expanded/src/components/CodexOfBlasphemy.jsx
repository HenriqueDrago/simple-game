import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import {
    canUseCombatInteractions,
    extractEntity,
    getOtherEntity,
    isChoirActive,
} from "../utils/entities";
import { blasphemyKeys, choirKeys, effectKeys } from "../utils/enums";
import "./CodexOfBlasphemy.css";

const blasphemyMap = {
    [blasphemyKeys.NONE]: "",
    [blasphemyKeys.YESTERDAY]: "ל",
    [blasphemyKeys.TODAY]: "ת",
    [blasphemyKeys.TOMORROW]: "ק",
};

const blasphemyClassMap = {
    [blasphemyKeys.YESTERDAY]: "blas-yesterday",
    [blasphemyKeys.TODAY]: "blas-today",
    [blasphemyKeys.TOMORROW]: "blas-tomorrow",
};

export default function CodexOfBlasphemy({ entityKey }) {
    const { game, handleBlasphemy, setGame } = useGame();
    const { handleSpawnTooltip } = useUI();

    const otherEntity = getOtherEntity(entityKey);

    const entity = extractEntity(game, entityKey);
    const simEntity = extractEntity(game?.simGame, entityKey);

    if (!isChoirActive(entity, choirKeys.SEVENTH)) {
        return null;
    }

    const realCodex = entity?.[effectKeys.CODEX_OF_BLASPHEMY] || [];
    const simCodex = simEntity
        ? simEntity?.[effectKeys.CODEX_OF_BLASPHEMY] || realCodex
        : realCodex;

    const realSlots = [
        realCodex[0] || blasphemyKeys.NONE,
        realCodex[1] || blasphemyKeys.NONE,
        realCodex[2] || blasphemyKeys.NONE,
    ].reverse();

    const simSlots = [
        simCodex[0] || blasphemyKeys.NONE,
        simCodex[1] || blasphemyKeys.NONE,
        simCodex[2] || blasphemyKeys.NONE,
    ].reverse();

    return (
        <div
            className="codex-blasphemy-container"
            onMouseDown={(e) =>
                handleSpawnTooltip(e, effectKeys.CODEX_OF_BLASPHEMY)
            }
        >
            {realSlots.map((realBlasphemy, index) => {
                const simBlas = simSlots[index];
                const isNewBlas =
                    realBlasphemy === blasphemyKeys.NONE &&
                    simBlas !== blasphemyKeys.NONE;
                const isBlasChanged = simEntity && realBlasphemy !== simBlas;
                const displayBlasphemy = simEntity ? simBlas : realBlasphemy;

                const ogIndex = realSlots.length - index - 1;

                return (
                    <div
                        key={index}
                        className={`blasphemy-slot ${
                            displayBlasphemy === blasphemyKeys.NONE
                                ? "empty"
                                : "active"
                        } ${blasphemyClassMap[displayBlasphemy] || ""} ${
                            isNewBlas
                                ? "is-new-preview"
                                : isBlasChanged
                                  ? "is-preview"
                                  : ""
                        }`}
                        onMouseDown={(e) =>
                            handleSpawnTooltip(
                                e,
                                displayBlasphemy !== blasphemyKeys.NONE
                                    ? displayBlasphemy
                                    : effectKeys.CODEX_OF_BLASPHEMY,
                            )
                        }
                        onClick={() => {
                            if (!canUseCombatInteractions(game, entityKey)) {
                                return;
                            }

                            handleBlasphemy(entityKey, otherEntity, ogIndex);
                        }}
                        onMouseEnter={() => {
                            if (!canUseCombatInteractions(game, entityKey)) {
                                return;
                            }

                            if (
                                !isBlasChanged &&
                                displayBlasphemy !== blasphemyKeys.NONE
                            ) {
                                setGame((prev) => {
                                    return {
                                        ...prev,
                                        simSpecs: {
                                            ...prev.simSpecs,
                                            blasphemy: displayBlasphemy,
                                        },
                                    };
                                });
                            }
                        }}
                        onMouseLeave={() => {
                            if (!canUseCombatInteractions(game, entityKey)) {
                                return;
                            }

                            if (
                                !isBlasChanged &&
                                displayBlasphemy !== blasphemyKeys.NONE
                            ) {
                                setGame((prev) => {
                                    return {
                                        ...prev,
                                        simSpecs: {
                                            ...prev.simSpecs,
                                            blasphemy: null,
                                        },
                                    };
                                });
                            }
                        }}
                        disabled={!canUseCombatInteractions(game, entityKey)}
                    >
                        {blasphemyMap[displayBlasphemy]}
                    </div>
                );
            })}
        </div>
    );
}
