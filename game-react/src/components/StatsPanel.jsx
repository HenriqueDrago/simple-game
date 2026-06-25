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

import { constants, stackCounters } from "../utils/constants.js";
import { sdmKeys, elementalKeys, eyeKeys } from "../utils/enums.js";
import { getSonorityColor } from "../utils/getters.js";

import "./StatsPanel.css";
import TarnishedBar from "./TarnishedBar.jsx";

function StatsPanel({ game, updateStatsPoints, entityKey }) {
    const entity = game.entities[entityKey];
    const battleState = game.status;
    const distributionMode = entity.statDistributionMode;

    const states = entity.states;
    const resources = entity.resources;

    const isAngelView = states.ascendenceOfSpirit;

    const stateClassMap = {
        ascendenceOfSpirit: "state-ascendence",
        umbralCore: "state-umbral",
        resonant: "state-resonant",
        weaponsDeployed: "state-weapons-deployed",
        thermalOverload: "state-thermal-overload",
        venting: "state-venting",
        aligned: "state-aligned",
        guarding: "state-guarding",
        sacrificial: "state-sacrificial",
        radiant: "state-radiant",
        deployment: "state-deployment",
        darkEmbrace: "state-dark-embrace",
        dimmingDarkness: "state-dimming",
        bleakDeception: "state-bleak-deception",
        burdenOfStigma: "state-burden-of-stigma",
        thornedShackles: "state-thorned",
        cutoffWings: "state-cutoff-wings",
    };

    const activeStates = Object.keys(stateClassMap)
        .filter((key) => states[key])
        .map((key) => stateClassMap[key]);

    const statesClass = activeStates.join(" ");

    // Dynamic Style Generation
    const dynamicStyles = {};

    if (states.resonant) {
        dynamicStyles["--resonant-color"] = getSonorityColor(entity.sonority);
    }

    if (states.aligned) {
        let alignColor = "#98fb98"; // Default
        if (game.elementalWheel === elementalKeys.NATURE)
            alignColor = "#32cd32";
        else if (game.elementalWheel === elementalKeys.FROST)
            alignColor = "#00ffff"; // Cyan
        else if (game.elementalWheel === elementalKeys.SCORCH)
            alignColor = "#ff4500"; // OrangeRed

        dynamicStyles["--aligned-color"] = alignColor;
        // Hex to rgba equivalent trick for CSS var usage in shadows
        dynamicStyles["--aligned-shadow"] = `${alignColor}66`; // 40% opacity
        dynamicStyles["--aligned-inset"] = `${alignColor}33`; // 20% opacity
    }

    if (states.ascendenceOfSpirit) {
        let ascColor = "#FFD700"; // Good angel - Radiant gold
        let ascShadow = "rgba(255, 215, 0, 0.4)";
        let ascInset = "rgba(255, 255, 255, 0.3)";
        let ascBg = "rgba(255, 215, 0, 0.1)";

        if (game.eyeOfHeavens === eyeKeys.CLOSED) {
            ascColor = "#DAA520"; // Bad angel - Harsh, tarnished gold (Goldenrod)
            ascShadow = "rgba(218, 165, 32, 0.6)";
            ascInset = "rgba(0, 0, 0, 0.4)"; // Darker inset to feel oppressive, but border remains gold
            ascBg = "rgba(218, 165, 32, 0.15)";
        }

        dynamicStyles["--ascendence-color"] = ascColor;
        dynamicStyles["--ascendence-shadow"] = ascShadow;
        dynamicStyles["--ascendence-inset"] = ascInset;
        dynamicStyles["--ascendence-bg"] = ascBg;
    }

    return (
        <div
            className={`stats-panel-container ${statesClass}`}
            style={dynamicStyles}
        >
            <StateBadges states={states} />

            <TarnishedBar entity={entity} />
            <EnlightenmentBar entity={entity} />

            {isAngelView ? (
                <>
                    <InsightBar entity={entity} />
                    <div
                        className="revelation-container"
                        style={{
                            borderColor: dynamicStyles["--ascendence-color"],
                            color: dynamicStyles["--ascendence-color"],
                        }}
                    >
                        <span style={{ color: "inherit" }}>
                            REVELATION: {entity.revelation}
                        </span>
                    </div>
                </>
            ) : (
                <>
                    <HpBar entity={entity} />
                    <ManaBar entity={entity} />
                    <OverheatBar entity={entity} />
                </>
            )}

            <div className="stacks-wrapper">
                {[...constants.freeResources].reverse().map((key) => {
                    const counter = stackCounters[key];

                    if (!counter) return null;

                    return (
                        <StackCounter
                            key={key}
                            label={counter.label}
                            value={resources[key]}
                            style={counter.style}
                        />
                    );
                })}
            </div>

            {!isAngelView && (
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
            )}

            {states.resonant && <SonorityCounter sonority={entity.sonority} />}

            {!isAngelView && game.elementalWheel !== elementalKeys.INACTIVE && (
                <ElementalCounter entity={entity} />
            )}
        </div>
    );
}

export default StatsPanel;
