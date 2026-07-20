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
import { spawnTooltip } from "../utils/dictionary";
import { effectKeys } from "../utils/enums";

export default function ModifiersTracker({ entity, handleSetTooltip }) {
    return (
        <div className="modifiers-tracker-container">
            <span
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.DAMAGE_BONUS)
                }
            >
                <Sword size={18} />
                {Math.round((processEntityDamageBonus(entity) - 1) * 100)}%
            </span>
            <span
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.WEAKNESS)
                }
            >
                <ChevronsDown size={18} />
                {Math.round((1 - processEntityWeakness(entity)) * 100)}%
            </span>
            <span
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.DAMAGE_REDUCTION)
                }
            >
                <Shield size={18} />
                {Math.round((1 - processEntityDR(entity)) * 100)}%
            </span>
            <span
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.FRAGILITY)
                }
            >
                <HeartCrack size={18} />
                {Math.round((processEntityFragility(entity) - 1) * 100)}%
            </span>
            <span
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.DEF_EFFECTIVENESS)
                }
            >
                <ShieldCogCorner size={18} />
                {Math.round(processEntityDefEffect(entity) * 100)}%
            </span>
        </div>
    );
}
