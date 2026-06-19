import HpBar from "./HpBar.jsx";
import ManaBar from "./ManaBar.jsx";
import AttrLine from "./AttrLine.jsx";
import StackCounter from "./StackCounter.jsx";
import ElementalCounter from "./ElementalCounter.jsx";
import StateBadges from "./StateBadges.jsx";
import InsightBar from "./InsightBar.jsx";
import SonorityCounter from "./SonorityCounter.jsx";
import OverheatBar from "./OverheatBar.jsx";
import EnlightenmentBar from "./EnlightenmentBar.jsx";

import {
    constants,
    stackCounters,
    getSonorityColor,
} from "../utils/constants.js";
import { sdmKeys, elementalKeys } from "../utils/enums.js";

import "./StatsPanel.css";

function StatsPanel({ game, updateStatsPoints, entityKey }) {
    const entity = game.entities[entityKey];
    const battleState = game.status;
    const distributionMode = entity.statDistributionMode;

    const states = entity.states;
    const resources = entity.resources;

    const isAngelView = states.cutoffWings;

    const activeStates = [];

    // Core Stances
    if (states.umbralCore) activeStates.push("state-umbral");
    if (states.resonant) activeStates.push("state-resonant");
    if (states.weaponsDeployed) activeStates.push("state-weapons-deployed");
    if (states.thermalOverload) activeStates.push("state-thermal-overload");
    if (states.venting) activeStates.push("state-venting");
    if (states.aligned) activeStates.push("state-aligned");

    // 1-Turn Overrides
    if (states.guarding) activeStates.push("state-guarding");
    if (states.sacrificial) activeStates.push("state-sacrificial");
    if (states.radiant) activeStates.push("state-radiant");
    if (isAngelView) activeStates.push("state-cutoff-wings");
    if (states.deployment) activeStates.push("state-deployment");
    if (states.darkEmbrace) activeStates.push("state-dark-embrace");
    if (states.dimmingDarkness) activeStates.push("state-dimming");

    // Global Overlay
    if (states.thornedShackles) activeStates.push("state-thorned");

    const statesClass = activeStates.join(" ");

    const sonorityValue = entity.sonority;

    // Create a dynamic style object to pass the CSS variable
    const dynamicStyles = {};
    if (states.resonant) {
        dynamicStyles["--resonant-color"] = getSonorityColor(sonorityValue);
    }

    return (
        <div
            className={`stats-panel-container ${statesClass}`}
            style={dynamicStyles}
        >
            <StateBadges states={states} />

            <EnlightenmentBar entity={entity} />

            {isAngelView ? (
                <InsightBar entity={entity} />
            ) : (
                <>
                    <HpBar entity={entity} />
                    <ManaBar entity={entity} />
                    <OverheatBar entity={entity} />
                </>
            )}

            {stackCounters.map(([label, field, color, backgroundColor]) => (
                <StackCounter
                    key={field}
                    label={label}
                    value={resources[field]}
                    color={color}
                    backgroundColor={backgroundColor}
                />
            ))}

            {!isAngelView && (
                <>
                    <div className="attributes-wrapper">
                        {constants.ATTRIBUTE_NAMES.map((attr) => (
                            <AttrLine
                                key={attr}
                                battleState={battleState}
                                handleStatusChange={updateStatsPoints}
                                entity={entity}
                                entityKey={entityKey}
                                attr={attr}
                                modifiable={distributionMode === sdmKeys.CUSTOM}
                            />
                        ))}
                    </div>

                    {states.resonant && (
                        <SonorityCounter sonority={entity.sonority} />
                    )}
                </>
            )}

            {!isAngelView && (
                <>
                    {game.elementalWheel !== elementalKeys.INACTIVE && (
                        <ElementalCounter entity={entity} />
                    )}
                </>
            )}
        </div>
    );
}

export default StatsPanel;
