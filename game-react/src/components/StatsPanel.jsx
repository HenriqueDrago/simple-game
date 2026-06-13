import HpBar from "./HpBar.jsx";
import ManaBar from "./ManaBar.jsx";
import AttrLine from "./AttrLine.jsx";
import StackCounter from "./StackCounter.jsx";
import ElementalCounter from "./ElementalCounter.jsx";

import { constants } from "../utils/constants.js";
import { sdmKeys, elementalKeys } from "../utils/enums.js";

import "./StatsPanel.css";

const stackCounters = [
    ["Blood Sacrifice", "bloodSacrifice", "#ff4d4d", "rgba(255, 77, 77, 0.1)"],
    ["Radiance", "radiance", "#ffc107", "rgba(255, 193, 7, 0.15)"],
    ["Poison", "poison", "#32cd32", "rgba(50, 205, 50, 0.1)"],
    ["Shackled Mana", "shackledMana", "#3f51b5", "rgba(63, 81, 181, 0.15)"],
    ["Shadowflame", "shadowflame", "#ff1493", "rgba(255, 20, 147, 0.15)"],
    [
        "Lingering Ember",
        "lingeringEmber",
        "#e998fd",
        "rgba(245, 208, 254, 0.12)",
    ],
    ["Cinders", "cinders", "#a9a9a9", "rgba(169, 169, 169, 0.15)"],
    [
        "Unrelenting Shadows",
        "unrelentingShadows",
        "#9370db",
        "rgba(147, 112, 219, 0.1)",
    ],
    ["Fading Light", "fadingLight", "#ffe8a1", "rgba(245, 170, 0, 0.15)"],
];

function StatsPanel({ game, updateStatsPoints, entityKey }) {
    const battleState = game.status;
    const distributionMode = game.entities[entityKey].statDistributionMode;

    const states = game.entities[entityKey].states;
    const resources = game.entities[entityKey].resources;

    const activeStates = [];
    if (states.guarding) activeStates.push("state-guarding");
    if (states.sacrificial) activeStates.push("state-sacrificial");
    if (states.thornedShackles) activeStates.push("state-thorned");
    if (states.darkEmbrace) activeStates.push("state-dark-embrace");
    if (states.radiant) activeStates.push("state-radiant");
    if (states.dimmingDarkness) activeStates.push("state-dimming");
    if (states.umbralCore) activeStates.push("state-umbral");

    const statesClass = activeStates.join(" ");

    return (
        <div className={`stats-panel-container ${statesClass}`}>
            <HpBar entity={game.entities[entityKey]} label="Player One" />
            <ManaBar entity={game.entities[entityKey]} label="Player One" />

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

            {game.elementalWheel !== elementalKeys.INACTIVE && <ElementalCounter entity={game.entities[entityKey]}></ElementalCounter>}
        </div>
    );
}

export default StatsPanel;
