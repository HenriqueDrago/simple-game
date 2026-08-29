import {
    Sword,
    ChevronsDown,
    Shield,
    HeartCrack,
} from "lucide-react";
import "./OrdinancesTracker.css";
import { effectKeys } from "../utils/enums";
import { useUI } from "../contexts/UIContext";
import { useGame } from "../contexts/GameContext";
import {
    getMalediction,
    getBenediction,
    getGrace,
    getDisgrace,
} from "../utils/entities";
import { customRound } from "../utils/general";

export default function OrdinancesTracker({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const simGame = game?.simGame;

    const realMale = customRound((getMalediction(game, entityKey) - 1) * 100, 1);
    const simMale = simGame
        ? customRound((getMalediction(simGame, entityKey) - 1) * 100, 1)
        : realMale;
    const isMaleChanged = simGame && simMale !== realMale;
    const displayMale = simGame ? simMale : realMale;

    const realBene = customRound((1 - getBenediction(game, entityKey)) * 100, 1);
    const simBene = simGame
        ? customRound((1 - getBenediction(simGame, entityKey)) * 100, 1)
        : realBene;
    const isBeneChanged = simGame && simBene !== realBene;
    const displayBene = simGame ? simBene : realBene;

    const realGrace = customRound((1 - getGrace(game, entityKey)) * 100, 1);
    const simGrace = simGame
        ? customRound((1 - getGrace(simGame, entityKey)) * 100, 1)
        : realGrace;
    const isGraceChanged = simGame && simGrace !== realGrace;
    const displayGrace = simGame ? simGrace : realGrace;

    const realDisgrace = customRound((getDisgrace(game, entityKey) - 1) * 100, 1);
    const simDisgrace = simGame
        ? customRound((getDisgrace(simGame, entityKey) - 1) * 100, 1)
        : realDisgrace;
    const isDisgraceChanged = simGame && simDisgrace !== realDisgrace;
    const displayDisgrace = simGame ? simDisgrace : realDisgrace;

    return (
        <div className="ordinances-tracker-container">
            <span
                className={`ordinance-male ${isMaleChanged ? "is-preview" : ""}`}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.MALEDICTION)
                }
            >
                <Sword size={18} />
                {displayMale}%
            </span>
            <span
                className={`ordinance-bene ${isBeneChanged ? "is-preview" : ""}`}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.BENEDICTION)
                }
            >
                <ChevronsDown size={18} />
                {displayBene}%
            </span>
            <span
                className={`ordinance-grace ${isGraceChanged ? "is-preview" : ""}`}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.GRACE)
                }
            >
                <Shield size={18} />
                {displayGrace}%
            </span>
            <span
                className={`ordinance-disgrace ${isDisgraceChanged ? "is-preview" : ""}`}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DISGRACE)
                }
            >
                <HeartCrack size={18} />
                {displayDisgrace}%
            </span>
        </div>
    );
}