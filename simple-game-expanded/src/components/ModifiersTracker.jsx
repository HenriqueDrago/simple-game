import {
    Sword,
    Shield,
    HeartCrack,
    ChevronsDown,
    Crosshair,
} from "lucide-react";
import "./ModifiersTracker.css";
import { effectKeys } from "../utils/enums";
import { useUI } from "../contexts/UIContext";
import { useGame } from "../contexts/GameContext";
import { getEntityDamageBonus, getEntityDefPen, getEntityDR, getEntityFragility, getEntityWeakness } from "../utils/entities";
import { customRound } from "../utils/general";

export default function ModifiersTracker({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const simGame = game?.simGame;

    const realDmg = customRound((getEntityDamageBonus(game, entityKey) - 1) * 100, 1);
    const simDmg = simGame
        ? customRound((getEntityDamageBonus(simGame, entityKey)  - 1) * 100, 1)
        : realDmg;
    const isDmgChanged = simGame && simDmg !== realDmg;
    const displayDmg = simGame ? simDmg : realDmg;

    const realWeak = customRound((1 - getEntityWeakness(game, entityKey) ) * 100, 1);
    const simWeak = simGame
        ? customRound((1 - getEntityWeakness(simGame, entityKey) ) * 100, 1)
        : realWeak;
    const isWeakChanged = simGame && simWeak !== realWeak;
    const displayWeak = simGame ? simWeak : realWeak;

    const realDR = customRound((1 - getEntityDR(game, entityKey) ) * 100, 1);
    const simDR = simGame
        ? customRound((1 - getEntityDR(simGame, entityKey) ) * 100, 1)
        : realDR;
    const isDRChanged = simGame && simDR !== realDR;
    const displayDR = simGame ? simDR : realDR;

    const realFrag = customRound((getEntityFragility(game, entityKey) - 1) * 100, 1);
    const simFrag = simGame
        ? customRound((getEntityFragility(simGame, entityKey)  - 1) * 100, 1)
        : realFrag;
    const isFragChanged = simGame && simFrag !== realFrag;
    const displayFrag = simGame ? simFrag : realFrag;

    const realDefPen = getEntityDefPen(game, entityKey);
    const simDefPen = simGame ? getEntityDefPen(simGame, entityKey) : realDefPen;
    const isDefPenChanged = simGame && simDefPen !== realDefPen;
    const displayDefPen = simGame ? simDefPen : realDefPen;

    return (
        <div className="modifiers-tracker-container">
            <span
                className={isDmgChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DAMAGE_BONUS)
                }
            >
                <Sword size={18} />
                {displayDmg}%
            </span>
            <span
                className={isWeakChanged ? "is-preview" : ""}
                onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.WEAKNESS)}
            >
                <ChevronsDown size={18} />
                {displayWeak}%
            </span>
            <span
                className={isDRChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DAMAGE_REDUCTION)
                }
            >
                <Shield size={18} />
                {displayDR}%
            </span>
            <span
                className={isFragChanged ? "is-preview" : ""}
                onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.FRAGILITY)}
            >
                <HeartCrack size={18} />
                {displayFrag}%
            </span>
            <span
                className={isDefPenChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.BREACH)
                }
            >
                <Crosshair size={18} />
                {displayDefPen}
            </span>
        </div>
    );
}
