import HpBar from "./HpBar.jsx";
import ManaBar from "./ManaBar.jsx";
import AttrLine from "./AttrLine.jsx";
import StackCounter from "./StackCounter.jsx";
import ElementalCounter from "./ElementalCounter.jsx";
import StateBadges from "./StateBadges.jsx";

import { constants } from "../utils/constants.js";
import { sdmKeys, elementalKeys, effectKeys } from "../utils/enums.js";

import "./StatsPanel.css";
import SonorityCounter from "./SonorityCounter.jsx";
import OverheatBar from "./OverheatBar.jsx";

const stackCounters = [
    [
        "Blood Sacrifice",
        effectKeys.BLOOD_SACRIFICE,
        "#ff4d4d",
        "rgba(255, 77, 77, 0.1)",
    ],
    ["Radiance", effectKeys.RADIANCE, "#ffc107", "rgba(255, 193, 7, 0.15)"],
    ["Poison", effectKeys.POISON, "#32cd32", "rgba(50, 205, 50, 0.1)"],
    [
        "Shackled Mana",
        effectKeys.SHACKLED_MANA,
        "#3f51b5",
        "rgba(63, 81, 181, 0.15)",
    ],
    [
        "Shadowflame",
        effectKeys.SHADOWFLAME,
        "#ff1493",
        "rgba(255, 20, 147, 0.15)",
    ],
    [
        "Lingering Ember",
        effectKeys.LINGERING_EMBER,
        "#e998fd",
        "rgba(245, 208, 254, 0.12)",
    ],
    ["Cinders", effectKeys.CINDERS, "#a9a9a9", "rgba(169, 169, 169, 0.15)"],
    [
        "Unrelenting Shadows",
        effectKeys.UNRELENTING_SHADOWS,
        "#9370db",
        "rgba(147, 112, 219, 0.1)",
    ],
    ["Halo", effectKeys.HALO, "#ffe8a1", "rgba(245, 170, 0, 0.15)"],
    ["Divinity", effectKeys.DIVINITY, "#acd6ff", "rgba(176, 196, 222, 0.15)"],
];

const getSonorityColor = (sonority) => {
    const colors = {
        "-5": "#ff4500",
        "-4": "#ff6a33",
        "-3": "#ff8f66",
        "-2": "#ffb499",
        "-1": "#ffdacc",
        0: "#ffffff",
        1: "#ccf2ff",
        2: "#99e5ff",
        3: "#66d9ff",
        4: "#33ccff",
        5: "#00bfff",
    };
    return colors[sonority] || "#ffffff";
};

function StatsPanel({ game, updateStatsPoints, entityKey }) {
    const battleState = game.status;
    const distributionMode = game.entities[entityKey].statDistributionMode;

    const states = game.entities[entityKey].states;
    const resources = game.entities[entityKey].resources;

    const activeStates = [];

    // Core Stances
    if (states.umbralCore) activeStates.push("state-umbral");
    if (states.resonant) activeStates.push("state-resonant");
    if (states.weaponsDeployed) activeStates.push("state-weapons-deployed");
    if (states.thermalOverload) activeStates.push("state-thermal-overload");
    if (states.venting) activeStates.push("state-venting");

    // 1-Turn Overrides
    if (states.guarding) activeStates.push("state-guarding");
    if (states.sacrificial) activeStates.push("state-sacrificial");
    if (states.radiant) activeStates.push("state-radiant");
    if (states.deployment) activeStates.push("state-deployment");
    if (states.darkEmbrace) activeStates.push("state-dark-embrace");
    if (states.dimmingDarkness) activeStates.push("state-dimming");

    // Global Overlay
    if (states.thornedShackles) activeStates.push("state-thorned");

    const statesClass = activeStates.join(" ");

    const sonorityValue = game.entities[entityKey].sonority;

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

            <HpBar entity={game.entities[entityKey]} />
            <ManaBar entity={game.entities[entityKey]} />
            <OverheatBar entity={game.entities[entityKey]} />

            {stackCounters.map(([label, field, color, backgroundColor]) => (
                <StackCounter
                    key={field}
                    label={label}
                    value={resources[field]}
                    color={color}
                    backgroundColor={backgroundColor}
                />
            ))}

            <div className="attributes-wrapper">
                {constants.ATTRIBUTE_NAMES.map((attr) => (
                    <AttrLine
                        key={attr}
                        battleState={battleState}
                        handleStatusChange={updateStatsPoints}
                        entity={game.entities[entityKey]}
                        entityKey={entityKey}
                        attr={attr}
                        modifiable={distributionMode === sdmKeys.CUSTOM}
                    />
                ))}
            </div>

            {states.resonant && (
                <SonorityCounter
                    sonority={game.entities[entityKey].sonority}
                ></SonorityCounter>
            )}

            {game.elementalWheel !== elementalKeys.INACTIVE && (
                <ElementalCounter
                    entity={game.entities[entityKey]}
                ></ElementalCounter>
            )}
        </div>
    );
}

export default StatsPanel;
