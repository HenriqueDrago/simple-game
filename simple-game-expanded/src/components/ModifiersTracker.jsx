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

export default function ModifiersTracker({ entity }) {
    const { handleSpawnTooltip } = useUI();
    return (
        <div className="modifiers-tracker-container">
            <span
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DAMAGE_BONUS)
                }
            >
                <Sword size={18} />
                {Math.round((processEntityDamageBonus(entity) - 1) * 100)}%
            </span>
            <span
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.WEAKNESS)
                }
            >
                <ChevronsDown size={18} />
                {Math.round((1 - processEntityWeakness(entity)) * 100)}%
            </span>
            <span
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DAMAGE_REDUCTION)
                }
            >
                <Shield size={18} />
                {Math.round((1 - processEntityDR(entity)) * 100)}%
            </span>
            <span
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.FRAGILITY)
                }
            >
                <HeartCrack size={18} />
                {Math.round((processEntityFragility(entity) - 1) * 100)}%
            </span>
            <span
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DEF_EFFECTIVENESS)
                }
            >
                <ShieldCogCorner size={18} />
                {Math.round(processEntityDefEffect(entity) * 100)}%
            </span>
        </div>
    );
}
