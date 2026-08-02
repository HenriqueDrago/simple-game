import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { constants } from "../utils/constants";
import { effectKeys } from "../utils/enums";
import "./CyborgTracker.css";
import GradientBar from "./GradientBar";

export default function CyborgTracker({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game?.entities?.[entityKey];

    const isCyborgActive =
        entity?.states?.[effectKeys.DEPLOYMENT] ||
        entity?.states?.[effectKeys.WEAPONS_DEPLOYED] ||
        entity?.states?.[effectKeys.THERMAL_OVERLOAD] ||
        entity?.states?.[effectKeys.VENTING];

    if (!entity || !isCyborgActive) {
        return null;
    }

    return (
        <div className="cyborg-tracker-container">
            <div onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.ENERGY_LEVEL)}>
                <div className="energy-line-row">
                    <span className="energy-line-label">ENERGY LEVEL</span>
                    <span className="energy-line-value">{entity.energyLevel}</span>
                </div>
            </div>

            <div className="cyborg-gauges-grid">
                <div className="gauge-card overheat-card">
                    <GradientBar
                        label={"Overheat"}
                        resourceKey={effectKeys.OVERHEAT}
                        maxResource={constants.MAX_OVERHEAT}
                        entityKey={entityKey}
                        trackStyle={{
                            backgroundImage: `linear-gradient(to right, white, yellow, orange, orangered, red)`,
                        }}
                        showAnimation={false}
                        showPercent={true}
                        tooltip={effectKeys.OVERHEAT}
                        isAlwaysActive={true}
                    />
                </div>

                <div className="gauge-card dynamo-card">
                    <GradientBar
                        label={"Dynamo"}
                        resourceKey={effectKeys.DYNAMO}
                        maxResource={constants.MAX_DYNAMO}
                        entityKey={entityKey}
                        trackStyle={{
                            backgroundImage: `linear-gradient(to right, cyan, lime, yellow)`,
                        }}
                        showAnimation={false}
                        showPercent={true}
                        tooltip={effectKeys.DYNAMO}
                        isAlwaysActive={true}
                    />
                </div>
            </div>
        </div>
    );
}