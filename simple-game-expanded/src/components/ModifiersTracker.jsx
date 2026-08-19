import {
    Sword,
    Shield,
    HeartCrack,
    ShieldCogCorner,
    ChevronsDown,
    Crosshair,
} from "lucide-react";
import "./ModifiersTracker.css";
import { effectKeys } from "../utils/enums";
import { useUI } from "../contexts/UIContext";
import { useGame } from "../contexts/GameContext";
import { getEntityDamageBonus, getEntityDefEffect, getEntityDefPen, getEntityDR, getEntityFragility, getEntityWeakness } from "../utils/entities";

export default function ModifiersTracker({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const simGame = game?.simGame;

    const realDmg = Math.round((getEntityDamageBonus(game, entityKey) - 1) * 100);
    const simDmg = simGame
        ? Math.round((getEntityDamageBonus(simGame, entityKey)  - 1) * 100)
        : realDmg;
    const isDmgChanged = simGame && simDmg !== realDmg;
    const displayDmg = simGame ? simDmg : realDmg;

    const realWeak = Math.round((1 - getEntityWeakness(game, entityKey) ) * 100);
    const simWeak = simGame
        ? Math.round((1 - getEntityWeakness(simGame, entityKey) ) * 100)
        : realWeak;
    const isWeakChanged = simGame && simWeak !== realWeak;
    const displayWeak = simGame ? simWeak : realWeak;

    const realDR = Math.round((1 - getEntityDR(game, entityKey) ) * 100);
    const simDR = simGame
        ? Math.round((1 - getEntityDR(simGame, entityKey) ) * 100)
        : realDR;
    const isDRChanged = simGame && simDR !== realDR;
    const displayDR = simGame ? simDR : realDR;

    const realFrag = Math.round((getEntityFragility(game, entityKey) - 1) * 100);
    const simFrag = simGame
        ? Math.round((getEntityFragility(simGame, entityKey)  - 1) * 100)
        : realFrag;
    const isFragChanged = simGame && simFrag !== realFrag;
    const displayFrag = simGame ? simFrag : realFrag;

    const realDef = Math.round(getEntityDefEffect(game, entityKey)  * 100);
    const simDef = simGame
        ? Math.round(getEntityDefEffect(simGame, entityKey)  * 100)
        : realDef;
    const isDefChanged = simGame && simDef !== realDef;
    const displayDef = simGame ? simDef : realDef;

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
                className={isDefChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DEF_EFFECTIVENESS)
                }
            >
                <ShieldCogCorner size={18} />
                {displayDef}%
            </span>
            <span
                className={isDefPenChanged ? "is-preview" : ""}
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DEF_PEN)
                }
            >
                <Crosshair size={18} />
                {displayDefPen}
            </span>
        </div>
    );
}
