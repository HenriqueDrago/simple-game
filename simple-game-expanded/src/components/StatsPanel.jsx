import HpBar from "./HpBar.jsx";
import ManaBar from "./ManaBar.jsx";
import AttrLine from "./AttrLine.jsx";
import StateBadges from "./StateBadges.jsx";
import SonorityCounter from "./SonorityCounter.jsx";

import { constants } from "../utils/constants.js";
import { sdmKeys, effectKeys } from "../utils/enums.js";

import "./StatsPanel.css";
import GradientBar from "./GradientBar.jsx";
import SelenianTracker from "./SelenianTracker.jsx";
import { canUseCombatInteractions, isEntityDead } from "../utils/entities.js";
import SpecialCounter from "./SpecialCounter.jsx";
import ModifiersTracker from "./ModifiersTracker.jsx";
import ConstellationTracker from "./ConstellationTracker.jsx";
import DivineBar from "./DivineBar.jsx";
import RunicArray from "./RunicArray.jsx";
import FreeResourcesTracker from "./FreeResourcesTracker.jsx";
import { useGame } from "../contexts/GameContext.js";
import { useUI } from "../contexts/UIContext.js";

function StatsPanel({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game.entities[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];
    const battleState = game.status;
    const distributionMode = entity.statDistributionMode;

    const states = entity.states;

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
                    entityKey={entityKey}
                />
            )}
            <StateBadges states={states} />

            <DivineBar

                entityKey={entityKey}
            />

            {entity[effectKeys.LUNACY] > 0 && (
                <div
                    onMouseDown={(e) =>
                        handleSpawnTooltip(e,  effectKeys.LUNACY)
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

            {entity[effectKeys.GRAVITATION] > 0 && (
                <div
                    onMouseDown={(e) =>
                        handleSpawnTooltip(
                            e,
                            
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

            {entity[effectKeys.STARBLIGHT] > 0 && (
                <div
                    onMouseDown={(e) =>
                        handleSpawnTooltip(e,  effectKeys.STARBLIGHT)
                    }
                >
                    <GradientBar
                        label={"Starblight"}
                        currResource={entity[effectKeys.STARBLIGHT]}
                        maxResource={constants.MAX_STARBLIGHT}
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

            {entity[effectKeys.PREMONITION] > 0 && (
                <div
                    onMouseDown={(e) =>
                        handleSpawnTooltip(
                            e,
                            
                            effectKeys.PREMONITION,
                        )
                    }
                >
                    <GradientBar
                        label={"Premonition"}
                        currResource={entity[effectKeys.PREMONITION]}
                        maxResource={constants.MAX_PREMONITION || 100}
                        trackStyle={{
                            backgroundImage: `linear-gradient(
                                                90deg,
                                                #4c0519 0%,
                                                #881337 25%,
                                                #e11d48 50%,
                                                #881337 75%,
                                                #4c0519 100%
                                            )`,
                        }}
                        showPercent={true}
                    />
                </div>
            )}

            {entity[effectKeys.RECOLLECTION] > 0 && (
                <div
                    onMouseDown={(e) =>
                        handleSpawnTooltip(
                            e,
                            
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
                        handleSpawnTooltip(e,  effectKeys.BAD_OMEN)
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

            <>
                <div
                    onMouseDown={(e) =>
                        handleSpawnTooltip(e,  effectKeys.HEALTH)
                    }
                >
                    <HpBar
                        entity={entity}
                        simEntity={simEntity}
                    />
                </div>

                <div
                    onMouseDown={(e) =>
                        handleSpawnTooltip(e,  effectKeys.MANA)
                    }
                >
                    <ManaBar entity={entity} simEntity={simEntity} />
                </div>

                {(entity.states[effectKeys.DEPLOYMENT] ||
                    entity.states[effectKeys.WEAPONS_DEPLOYED] ||
                    entity.states[effectKeys.THERMAL_OVERLOAD] ||
                    entity.states[effectKeys.VENTING]) && (
                    <>
                        <div
                            onMouseDown={(e) =>
                                handleSpawnTooltip(
                                    e,
                                    
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
                                handleSpawnTooltip(
                                    e,
                                    
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
                                handleSpawnTooltip(
                                    e,
                                    
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
                        handleSpawnTooltip(
                            e,
                            
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
                        handleSpawnTooltip(e,  effectKeys.MANA_BLEED)
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
                        handleSpawnTooltip(
                            e,
                            
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

            <FreeResourcesTracker
                entity={entity}
                simEntity={simEntity}
            />

            <ModifiersTracker
                entity={entity}
            />

            <ConstellationTracker
                entityKey={entityKey}
            />

            <div
                onMouseDown={(e) =>
                    handleSpawnTooltip(e,  effectKeys.RUNIC_ARRAY)
                }
            >
                <RunicArray
                    entity={entity}
                />
            </div>

            <div className="attributes-wrapper">
                {constants.ATTRIBUTE_NAMES.map((attr) => (
                    <AttrLine
                        key={attr}
                        battleState={battleState}
                        entity={entity}
                        entityKey={entityKey}
                        attr={attr}
                        modifiable={distributionMode === sdmKeys.CUSTOM}
                    />
                ))}
            </div>

            {states[effectKeys.RESONANT] && (
                <div
                    onMouseDown={(e) =>
                        handleSpawnTooltip(e,  effectKeys.SONORITY)
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
