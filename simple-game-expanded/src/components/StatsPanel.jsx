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
import { sdmKeys, eyeKeys, effectKeys, elementalKeys } from "../utils/enums.js";

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

function StatsPanel({
    game,
    updateStatsPoints,
    entityKey,
    handleElementChange,
    handleSetTooltip,
    handleConstellation,
}) {
    const entity = game.entities[entityKey];
    const battleState = game.status;
    const distributionMode = entity.statDistributionMode;

    const states = entity.states;
    const resources = entity.resources;

    const isAngelView = states[effectKeys.ASCENDENCE_OF_SPIRIT];

    const showWarning = canUseCombatInteractions(game) && isEntityDead(entity);

    const stateClassMap = {
        [effectKeys.ASCENDENCE_OF_SPIRIT]: "state-ascendence",
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
        [effectKeys.CUTOFF_WINGS]: "state-cutoff-wings",
        [effectKeys.STARGAZER]: "state-stargazer",
        [effectKeys.ZENITH_OF_MORTALITY]: "state-zenith",
        [effectKeys.ABANDONED_BY_GRACE]: "state-abandoned",
        [effectKeys.ANOINTED_PROXY]: "state-anointed-proxy",
        [effectKeys.SELENIAN]: "state-selenian",
        [effectKeys.PRISMATIC]: "state-prismatic",
        [effectKeys.MOON_DEW]: "state-moon-dew",
        [effectKeys.NOVA]: "state-nova",
    };

    const activeStates = Object.keys(stateClassMap)
        .filter((key) => states[key])
        .map((key) => stateClassMap[key]);

    const eyeClass =
        game[effectKeys.EYE_OF_HEAVENS] === eyeKeys.CLOSED
            ? "eye-closed"
            : "eye-open";
    const statesClass = [...activeStates, eyeClass].join(" ");

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

            {entity[effectKeys.TARNISHED_SIN] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.TARNISHED_SIN,
                        )
                    }
                >
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
                </div>
            )}

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

            {entity[effectKeys.DIVINE_SPARK] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.DIVINE_SPARK,
                        )
                    }
                >
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

            {entity[effectKeys.MAX_ENLIGHTENMENT] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.ENLIGHTENMENT,
                        )
                    }
                >
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
                </div>
            )}

            {entity[effectKeys.MAX_INSIGHT] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.INSIGHT)
                    }
                >
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
                </div>
            )}

            <NebulaStarblightBar
                entity={entity}
                handleSetTooltip={handleSetTooltip}
            />

            {isAngelView ? (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(e, handleSetTooltip, effectKeys.REVELATION)
                    }
                >
                    <SpecialCounter
                        roman={false}
                        label={"REVELATION"}
                        value={entity[effectKeys.REVELATION]}
                        style={{
                            borderColor: "var(--ascendence-color)",
                            color: "var(--ascendence-color)",
                        }}
                    />
                </div>
            ) : (
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
            )}

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

            {entity[effectKeys.BURDEN_OF_STIGMA] > 0 && (
                <div
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            effectKeys.BURDEN_OF_STIGMA,
                        )
                    }
                >
                    <SpecialCounter
                        roman={true}
                        label={"BURDEN OF STIGMA"}
                        value={entity[effectKeys.BURDEN_OF_STIGMA]}
                        style={{
                            color: "#DAA520",
                            borderColor: "#3b3528",
                            backgroundColor: "rgba(59, 53, 40, 0.5)",
                            boxShadow: "inset 0 0 8px rgba(0, 0, 0, 0.7)",
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
                            handleSetTooltip={handleSetTooltip}
                        />
                    ))}
                </div>
            )}

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
