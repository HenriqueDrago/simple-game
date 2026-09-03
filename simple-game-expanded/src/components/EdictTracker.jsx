import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import {
    canUseCombatInteractions,
    extractEntity,
    isEdictActive,
    isEdictUnlocked,
} from "../utils/entities";
import { edictKeys } from "../utils/enums";
import "./EdictTracker.css";

const edictArray = {
    [edictKeys.ANGELS]: "א",
    [edictKeys.ARCHANGELS]: "מ",
    [edictKeys.PRINCIPALITIES]: "צ",
    [edictKeys.POWERS]: "ש",
    [edictKeys.VIRTUES]: "ו",
    [edictKeys.DOMINIONS]: "ה",
    [edictKeys.THRONES]: "ג",
    [edictKeys.CHERUBIM]: "כ",
    [edictKeys.SERAPHIM]: "ע",
};

export default function EdictTracker({ entityKey }) {
    const { game, handleEdict } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = extractEntity(game, entityKey);

    const canInteract = canUseCombatInteractions(game, entityKey);

    return (
        <div className="edict-tracker-container">
            {Object.entries(edictArray).map(([key, letter]) => {
                const enabled = isEdictActive(entity, key);
                const unlocked = isEdictUnlocked(entity, key);
                return (
                    <div
                        className={`individual-edict-container ${enabled ? "edict-enabled" : ""} ${unlocked ? "edict-unlocked" : ""}`}
                        onClick={() => {
                            if (unlocked && canInteract) {
                                handleEdict(entityKey, key);
                            }
                        }}
                        onMouseDown={(e) => handleSpawnTooltip(e, key)}
                        disabled={!unlocked || !canInteract}
                        key={key}
                    >
                        {letter}
                    </div>
                );
            })}
        </div>
    );
}
