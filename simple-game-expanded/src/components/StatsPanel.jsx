import HpBar from "./HpBar.jsx";
import ManaBar from "./ManaBar.jsx";
import AttrLine from "./AttrLine.jsx";
import StackCounter from "./StackCounter.jsx";
import StateBadges from "./StateBadges.jsx";
import SonorityCounter from "./SonorityCounter.jsx";

import {
    constants,
    FREE_RESOURCES,
    stackCounters,
} from "../utils/constants.js";
import { sdmKeys, effectKeys, elementalKeys } from "../utils/enums.js";

import "./StatsPanel.css";
import GradientBar from "./GradientBar.jsx";
import SelenianTracker from "./SelenianTracker.jsx";
import {
    canUseCombatInteractions,
    isElementActive,
    isEntityDead,
} from "../utils/entities.js";
import SpecialCounter from "./SpecialCounter.jsx";
import { spawnTooltip } from "../utils/dictionary.js";
import ModifiersTracker from "./ModifiersTracker.jsx";
import NebulaStarblightBar from "./NebulaStarblightBar.jsx";
import ConstellationTracker from "./ConstellationTracker.jsx";
import DivineBar from "./DivineBar.jsx";
import RunicArray from "./RunicArray.jsx";

function StatsPanel({
    game,
    updateStatsPoints,
    entityKey,
    handleElementChange,
    handleSetTooltip,
    handleConstellation,
    handleClearTooltip,
    handleAction,
}) {
    const entity = game.entities[entityKey];
    const battleState = game.status;
    const distributionMode = entity.statDistributionMode;

    const states = entity.states;
    const resources = entity.resources;

    const showWarning = canUseCombatInteractions(game) && isEntityDead(entity);

    const stateClassMap = {
        [effectKeys.UMBRAL_CORE]: "state-umbral",
        [effectKeys.RESONANT]: "state-resonant",
        [effectKeys.WEAPONS_DEPLOYED]: "state-weapons-deployed",
        [effectKeys.THERMAL_OVERLOAD]: "state-thermal-overload",
        [effectKeys.VENTING]: "state-venting",
        [effectKeys.GUARDING_STATE]: "state-guarding",
        [effectKeys.SACRIFICIAL_STATE]: "state-sacrificial",
        [effectKeys.RADIANT]: "state-radiant",
        [effectKeys.DEPLOYMENT]: "state-deployment",
        [effectKeys.DARK_EMBRACE]: "state-dark-embrace",
        [effectKeys.DIMMING_DARKNESS]: "state-dimming",
        [effectKeys.BLEAK_DECEPTION]: "state-bleak-deception",
        [effectKeys.STARGAZER]: "state-stargazer",
        [effectKeys.SELENIAN]: "state-selenian",
        [effectKeys.PRISMATIC]: "state-prismatic",
        [effectKeys.MOON_DEW]: "state-moon-dew",
        [effectKeys.NOVA]: "state-nova",
        [effectKeys.VISIONARY]: "state-visionary",
    };

    const activeStates = Object.keys(stateClassMap)
        .filter((key) => states[key])
        .map((key) => stateClassMap[key]);

    const statesClass = [...activeStates].join(" ");

    return (
        <div className={`stats-panel-container ${statesClass}`}>
            {entity.states[effectKeys.SELENIAN] && (
                <SelenianTracker
                    entity={entity}
                    changeElement={(element) => {
                        handleElementChange(entityKey, element);
                    }}
                    clickable={
                        canUseCombatInteractions(game) &&
                        !isElementActive(entity, elementalKeys.SHATTERED)
                    }
                    handleSetTooltip={handleSetTooltip}
                />
            )}
            <StateBadges states={states} handleSetTooltip={handleSetTooltip} />

            <DivineBar
                handleSetTooltip={handleSetTooltip}
                handleClearTooltip={handleClearTooltip}
                handleAction={handleAction}
                game={game}
                entityKey={entityKey}
            />

            {entity[effectKeys.LUNACY] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.LUNACY)
                    }
                >
                    <GradientBar
                        label={"Lunacy"}
                        currResource={entity[effectKeys.LUNACY]}
                        maxResource={constants.MAX_LUNACY}
                        trackStyle={{
                            backgroundImage: `linear-gradient(
                                                90deg,
                                                #9aa4b0 0%,
                                                #c2c9d2 35%,
                                                #e6eaf0 50%,
                                                #c2c9d2 65%,
                                                #9aa4b0 100%
                                            )`,
                        }}
                        showPercent={true}
                    />
                </div>
            )}

            {entity[effectKeys.STARFLARE] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.STARFLARE)
                    }
                >
                    <GradientBar
                        label={"Starflare"}
                        currResource={entity[effectKeys.STARFLARE]}
                        maxResource={constants.MAX_STARFLARE}
                        trackStyle={{
                            backgroundImage: `linear-gradient(
                    90deg,
                    #7b1fa2 0%,
                    #9c27b0 35%,
                    #ab47bc 50%,
                    #9c27b0 65%,
                    #7b1fa2 100%
                )`,
                        }}
                        showPercent={true}
                    />
                </div>
            )}

            {entity[effectKeys.GRAVITATION] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.GRAVITATION,
                        )
                    }
                >
                    <GradientBar
                        label={"Gravitation"}
                        currResource={entity[effectKeys.GRAVITATION]}
                        maxResource={constants.MAX_GRAVITATION}
                        trackStyle={{
                            backgroundImage: `linear-gradient(
                    90deg,
                    #311b92 0%,
                    #512da8 25%,
                    #673ab7 50%,
                    #512da8 75%,
                    #311b92 100%
                )`,
                        }}
                        showPercent={true}
                    />
                </div>
            )}

            {entity[effectKeys.RECOLLECTION] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.RECOLLECTION,
                        )
                    }
                >
                    <GradientBar
                        label={"Recollection"}
                        currResource={entity[effectKeys.RECOLLECTION]}
                        maxResource={constants.MAX_RECOLLECTION || 100}
                        trackStyle={{
                            backgroundImage: `linear-gradient(
                                90deg,
                                #00838f 0%,
                                #00f0ff 35%,
                                #80deea 50%,
                                #00f0ff 65%,
                                #00838f 100%
                            )`,
                        }}
                        showPercent={true}
                    />
                </div>
            )}

            {entity[effectKeys.BAD_OMEN] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.BAD_OMEN)
                    }
                >
                    <GradientBar
                        label={"Bad Omen"}
                        currResource={entity[effectKeys.BAD_OMEN]}
                        maxResource={constants.MAX_BAD_OMEN || 100}
                        trackStyle={{
                            backgroundImage: `linear-gradient(
                    90deg,
                    #3e2723 0%,
                    #6d4c41 35%,
                    #a1887f 50%,
                    #6d4c41 65%,
                    #3e2723 100%
                )`,
                        }}
                        showPercent={true}
                    />
                </div>
            )}

            <NebulaStarblightBar
                entity={entity}
                handleSetTooltip={handleSetTooltip}
            />

            <>
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.HEALTH)
                    }
                >
                    <HpBar entity={entity} />
                </div>

                <div
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.MANA)
                    }
                >
                    <ManaBar entity={entity} />
                </div>

                {(entity.states[effectKeys.DEPLOYMENT] ||
                    entity.states[effectKeys.WEAPONS_DEPLOYED] ||
                    entity.states[effectKeys.THERMAL_OVERLOAD] ||
                    entity.states[effectKeys.VENTING]) && (
                    <>
                        <div
                            onMouseDown={(e) =>
                                spawnTooltip(
                                    e,
                                    handleSetTooltip,
                                    effectKeys.ENERGY_LEVEL,
                                )
                            }
                        >
                            <div className="energy-line-row">
                                <span className="energy-line-label">
                                    ENERGY LEVEL
                                </span>
                                <span className="energy-line-value">
                                    {entity.energyLevel}
                                </span>
                            </div>
                        </div>

                        <div
                            onMouseDown={(e) =>
                                spawnTooltip(
                                    e,
                                    handleSetTooltip,
                                    effectKeys.OVERHEAT,
                                )
                            }
                        >
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
                        </div>

                        <div
                            onMouseDown={(e) =>
                                spawnTooltip(
                                    e,
                                    handleSetTooltip,
                                    effectKeys.DYNAMO,
                                )
                            }
                        >
                            <GradientBar
                                label={"Dynamo"}
                                currResource={entity[effectKeys.DYNAMO]}
                                maxResource={constants.MAX_DYNAMO}
                                trackStyle={{
                                    backgroundImage: `linear-gradient(to right, cyan, lime, yellow)`,
                                }}
                                showAnimation={false}
                                showPercent={true}
                            />
                        </div>
                    </>
                )}
            </>

            {entity[effectKeys.MOONLIT_TEARS] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.MOONLIT_TEARS,
                        )
                    }
                >
                    <SpecialCounter
                        roman={true}
                        label={"MOONLIT TEARS"}
                        value={entity[effectKeys.MOONLIT_TEARS]}
                        style={{
                            color: "#6ec6ff",
                            borderColor: "#80d8ff",
                            backgroundColor: "rgba(110, 198, 255, 0.2)",
                            boxShadow: "inset 0 0 8px rgba(128, 216, 255, 0.3)",
                        }}
                    />
                </div>
            )}

            {entity[effectKeys.MANA_BLEED] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.MANA_BLEED)
                    }
                >
                    <SpecialCounter
                        roman={true}
                        label={"MANA BLEED"}
                        value={entity[effectKeys.MANA_BLEED]}
                        style={{
                            color: "#e6195e",
                            borderColor: "#ff3333",
                            backgroundColor: "rgba(220, 20, 60, 0.15)",
                            boxShadow: "inset 0 0 8px rgba(41, 121, 255, 0.25)",
                        }}
                    />
                </div>
            )}

            {entity[effectKeys.PAST_MEMORIES] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.PAST_MEMORIES,
                        )
                    }
                >
                    <SpecialCounter
                        roman={true}
                        label={"PAST MEMORIES"}
                        value={entity[effectKeys.PAST_MEMORIES]}
                        style={{
                            color: "#00f0ff",
                            borderColor: "#80deea",
                            backgroundColor: "rgba(0, 240, 255, 0.15)",
                            boxShadow: "inset 0 0 8px rgba(0, 240, 255, 0.3)",
                        }}
                    />
                </div>
            )}

            <div className="stacks-wrapper">
                {[...FREE_RESOURCES].reverse().map((key) => {
                    const counter = stackCounters[key];

                    if (!counter) {
                        return null;
                    }

                    return (
                        <div
                            key={key}
                            onMouseDown={(e) =>
                                spawnTooltip(e, handleSetTooltip, key)
                            }
                        >
                            <StackCounter
                                label={counter.label}
                                value={resources[key]}
                                style={counter.style}
                            />
                        </div>
                    );
                })}
            </div>

            <ModifiersTracker
                entity={entity}
                handleSetTooltip={handleSetTooltip}
            />

            <ConstellationTracker
                entityKey={entityKey}
                entity={entity}
                handleConstellation={handleConstellation}
                handleSetTooltip={handleSetTooltip}
                game={game}
            />

            <div
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.RUNIC_ARRAY)
                }
            >
                <RunicArray entity={entity} handleSetTooltip={handleSetTooltip}/>
            </div>

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
                        handleSetTooltip={handleSetTooltip}
                    />
                ))}
            </div>

            {states[effectKeys.RESONANT] && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.SONORITY)
                    }
                >
                    <SonorityCounter sonority={entity.sonority} />
                </div>
            )}

            {showWarning && (
                <div className="stats-panel-warning">
                    Warning: You will die upon selecting an action!
                </div>
            )}
        </div>
    );
}

export default StatsPanel;
