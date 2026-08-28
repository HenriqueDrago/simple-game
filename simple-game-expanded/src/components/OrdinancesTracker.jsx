import {
    Sword,
    ChevronsDown,
    Shield,
    HeartCrack,
    ShieldCogCorner,
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
    getIntegrity,
} from "../utils/entities";

export default function OrdinancesTracker({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const simGame = game?.simGame;

    const realMale = Math.round((getMalediction(game, entityKey) - 1) * 100);
    const simMale = simGame
        ? Math.round((getMalediction(simGame, entityKey) - 1) * 100)
        : realMale;
    const isMaleChanged = simGame && simMale !== realMale;
    const displayMale = simGame ? simMale : realMale;

    const realBene = Math.round((1 - getBenediction(game, entityKey)) * 100);
    const simBene = simGame
        ? Math.round((1 - getBenediction(simGame, entityKey)) * 100)
        : realBene;
    const isBeneChanged = simGame && simBene !== realBene;
    const displayBene = simGame ? simBene : realBene;

    const realGrace = Math.round((1 - getGrace(game, entityKey)) * 100);
    const simGrace = simGame
        ? Math.round((1 - getGrace(simGame, entityKey)) * 100)
        : realGrace;
    const isGraceChanged = simGame && simGrace !== realGrace;
    const displayGrace = simGame ? simGrace : realGrace;

    const realDisgrace = Math.round((getDisgrace(game, entityKey) - 1) * 100);
    const simDisgrace = simGame
        ? Math.round((getDisgrace(simGame, entityKey) - 1) * 100)
        : realDisgrace;
    const isDisgraceChanged = simGame && simDisgrace !== realDisgrace;
    const displayDisgrace = simGame ? simDisgrace : realDisgrace;

    const realIntegrity = Math.round(getIntegrity(game, entityKey) * 100);
    const simIntegrity = simGame
        ? Math.round(getIntegrity(simGame, entityKey) * 100)
        : realIntegrity;
    const isIntegrityChanged = simGame && simIntegrity !== realIntegrity;
    const displayIntegrity = simGame ? simIntegrity : realIntegrity;

    return (
        <div className="ordinances-tracker-container">
            <span
                className={isMaleChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.MALEDICTION)
                }
            >
                <Sword size={18} />
                {displayMale}%
            </span>
            <span
                className={isBeneChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.BENEDICTION)
                }
            >
                <ChevronsDown size={18} />
                {displayBene}%
            </span>
            <span
                className={isGraceChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.GRACE)
                }
            >
                <Shield size={18} />
                {displayGrace}%
            </span>
            <span
                className={isDisgraceChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DISGRACE)
                }
            >
                <HeartCrack size={18} />
                {displayDisgrace}%
            </span>
            <span
                className={isIntegrityChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.INTEGRITY)
                }
            >
                <ShieldCogCorner size={18} />
                {displayIntegrity}%
            </span>
        </div>
    );
}