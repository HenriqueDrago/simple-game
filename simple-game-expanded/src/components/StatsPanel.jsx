import HpBar from "./HpBar.jsx";
import ManaBar from "./ManaBar.jsx";
import AttrLine from "./AttrLine.jsx";
import StackCounter from "./StackCounter.jsx";
import StateBadges from "./StateBadges.jsx";
import SonorityCounter from "./SonorityCounter.jsx";

import { constants, stackCounters } from "../utils/constants.js";
import {
    sdmKeys,
    eyeKeys,
    effectKeys,
    entityKeys,
    roundPhases,
    playerTurnPhases,
    elementalKeys,
} from "../utils/enums.js";
import { getSonorityColor } from "../utils/getters.js";

import "./StatsPanel.css";
import GradientBar from "./GradientBar.jsx";
import SelenianTracker from "./SelenianTracker.jsx";
import { isElementActive } from "../utils/entities.js";

// Roman numerals helper
const romanFormatter = new Intl.NumberFormat("en", {
  numberingSystem: "roman",
});

function toRoman(num) {
  return romanFormatter.format(num);
}

function StatsPanel({
    game,
    updateStatsPoints,
    entityKey,
    handleElementChange,
}) {
    const entity = game.entities[entityKey];
    const battleState = game.status;
    const distributionMode = entity.statDistributionMode;

    const states = entity.states;
    const resources = entity.resources;

    const isAngelView = states.ascendenceOfSpirit;

    const currPhase = game.roundQueue && game.roundQueue.length > 0 ? game.roundQueue[game.roundIndex] : null;

    const currPlayerPhase =
            game.playerQueue && game.playerQueue.length > 0
                ? game.playerQueue[0]
                : null;

    const isEntityTurn =
        (entityKey === entityKeys.PLAYER_ONE && currPhase === roundPhases.PLAYER_ONE_TURN && currPlayerPhase === playerTurnPhases.PLAN) ||
        (entityKey === entityKeys.PLAYER_TWO && currPhase === roundPhases.PLAYER_TWO_TURN && currPlayerPhase === playerTurnPhases.PLAN);

    const stateClassMap = {
        ascendenceOfSpirit: "state-ascendence",
        umbralCore: "state-umbral",
        resonant: "state-resonant",
        weaponsDeployed: "state-weapons-deployed",
        thermalOverload: "state-thermal-overload",
        venting: "state-venting",
        guarding: "state-guarding",
        sacrificial: "state-sacrificial",
        radiant: "state-radiant",
        deployment: "state-deployment",
        darkEmbrace: "state-dark-embrace",
        dimmingDarkness: "state-dimming",
        bleakDeception: "state-bleak-deception",

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
            {entity.states[effectKeys.SELENIAN] && (
                <SelenianTracker
                    entity={entity}
                    changeElement={(element) => {
                        handleElementChange(entityKey, element)
                    }
                    }
                    clickable={isEntityTurn && !isElementActive(entity, elementalKeys.SHATTERED)}
                />
            )}
            <StateBadges states={states} />

            {entity[effectKeys.TARNISHED_SIN] > 0 && (
                <GradientBar
                    label={"Tarnished Sin"}
                    currResource={entity[effectKeys.TARNISHED_SIN]}
                    maxResource={constants.MAX_TARNISHED_SIN}
                    trackStyle={{
                        backgroundImage: `linear-gradient(
                                        90deg,
                                        #2a0000 0%,
                                        #500000 15%,
                                        #8b0000 35%,
                                        #cc0000 50%,
                                        #8b0000 65%,
                                        #500000 85%,
                                        #2a0000 100%
                                    )`,
                    }}
                    showPercent={true}
                />
            )}

            {entity[effectKeys.DIVINE_SPARK] > 0 && (
                <GradientBar
                    label={"Divine Spark"}
                    currResource={entity[effectKeys.DIVINE_SPARK]}
                    maxResource={constants.MAX_DIVINE_SPARK}
                    trackStyle={{
                        backgroundImage: `linear-gradient(
                                        90deg,
                                        #fff9d4 0%,
                                        #ffd93b 25%,
                                        #ffe87c 50%,
                                        #ffd93b 75%,
                                        #fff9d4 100%
                                    )`,
                    }}
                    showPercent={true}
                />
            )}

            {entity[effectKeys.MAX_ENLIGHTENMENT] > 0 && (
                <GradientBar
                    label={"Enlightenment"}
                    currResource={entity[effectKeys.ENLIGHTENMENT]}
                    maxResource={entity[effectKeys.MAX_ENLIGHTENMENT]}
                    trackStyle={{
                        backgroundImage: `linear-gradient(
                                        90deg,
                                        #fff9d4 0%,
                                        #ffd93b 25%,
                                        #ffe87c 50%,
                                        #ffd93b 75%,
                                        #fff9d4 100%
                                        )`,
                    }}
                />
            )}

            {entity[effectKeys.MAX_INSIGHT] > 0 && (
                <GradientBar
                    label={"Insight"}
                    currResource={entity[effectKeys.INSIGHT]}
                    maxResource={entity[effectKeys.MAX_INSIGHT]}
                    trackStyle={{
                        backgroundImage: `linear-gradient(
                                        90deg, 
                                        #d4eafd 0%, 
                                        #3bc7ff 25%, 
                                        #87ceeb 50%, 
                                        #3bc7ff 75%, 
                                        #d4eafd 100%
                                        )`,
                    }}
                />
            )}

            {isAngelView ? (
                <>
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
                    {(entity.states[effectKeys.DEPLOYMENT] ||
                        entity.states.weaponsDeployed ||
                        entity.states.thermalOverload ||
                        entity.states.venting) && (
                        <>
                            <div className="energy-line-row">
                                <span className="energy-line-label">
                                    ENERGY LEVEL
                                </span>
                                <span className="energy-line-value">
                                    {entity.energyLevel}
                                </span>
                            </div>
                            <GradientBar
                                label={"Overheat"}
                                currResource={entity[effectKeys.OVERHEAT]}
                                maxResource={constants.MAX_OVERHEAT}
                                trackStyle={{
                                    backgroundImage: `linear-gradient(to right, white, yellow, orange, orangered, red)`,
                                }}
                                showAnimation={false}
                                showPercent={true}
                            />
                            <GradientBar
                                label={"Dynamo"}
                                currResource={entity[effectKeys.DYNAMO]}
                                maxResource={constants.MAX_DYNAMO}
                                trackStyle={{
                                    backgroundImage: `linear-gradient(to right, lime, yellow)`,
                                }}
                                showAnimation={false}
                                showPercent={true}
                            />
                        </>
                    )}
                </>
            )}

            {entity[effectKeys.BURDEN_OF_STIGMA] > 0 && <>
                    <div
                        className="burden-container"
                    >
                        <span>
                            BURDEN OF STIGMA: {toRoman(entity[effectKeys.BURDEN_OF_STIGMA])}
                        </span>
                    </div>
                </>}

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
        </div>
    );
}

export default StatsPanel;
