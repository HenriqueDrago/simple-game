import {
    Sword,
    Shield,
    HeartCrack,
    ShieldCogCorner,
    ChevronsDown,
} from "lucide-react";
import {
    processEntityDamageBonus,
    processEntityDefEffect,
    processEntityDR,
    processEntityFragility,
    processEntityWeakness,
} from "../utils/entities";
import "./ModifiersTracker.css";
import { effectKeys } from "../utils/enums";
import { useUI } from "../contexts/UIContext";

export default function ModifiersTracker({ entity, simEntity }) {
    const { handleSpawnTooltip } = useUI();

    const realDmg = Math.round((processEntityDamageBonus(entity) - 1) * 100);
    const simDmg = simEntity
        ? Math.round((processEntityDamageBonus(simEntity) - 1) * 100)
        : realDmg;
    const isDmgChanged = simEntity && simDmg !== realDmg;
    const displayDmg = simEntity ? simDmg : realDmg;

    const realWeak = Math.round((1 - processEntityWeakness(entity)) * 100);
    const simWeak = simEntity
        ? Math.round((1 - processEntityWeakness(simEntity)) * 100)
        : realWeak;
    const isWeakChanged = simEntity && simWeak !== realWeak;
    const displayWeak = simEntity ? simWeak : realWeak;

    const realDR = Math.round((1 - processEntityDR(entity)) * 100);
    const simDR = simEntity
        ? Math.round((1 - processEntityDR(simEntity)) * 100)
        : realDR;
    const isDRChanged = simEntity && simDR !== realDR;
    const displayDR = simEntity ? simDR : realDR;

    const realFrag = Math.round((processEntityFragility(entity) - 1) * 100);
    const simFrag = simEntity
        ? Math.round((processEntityFragility(simEntity) - 1) * 100)
        : realFrag;
    const isFragChanged = simEntity && simFrag !== realFrag;
    const displayFrag = simEntity ? simFrag : realFrag;

    const realDef = Math.round(processEntityDefEffect(entity) * 100);
    const simDef = simEntity
        ? Math.round(processEntityDefEffect(simEntity) * 100)
        : realDef;
    const isDefChanged = simEntity && simDef !== realDef;
    const displayDef = simEntity ? simDef : realDef;

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
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.WEAKNESS)
                }
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
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.FRAGILITY)
                }
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
        </div>
    );
}