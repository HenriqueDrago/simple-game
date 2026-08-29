import { useGame } from "../contexts/GameContext";
import { effectKeys } from "../utils/enums";

import ControlPanel from "./ControlPanel";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import StarsPanel from "./StarsPanel";

import "./PlayerPanel.css";
import TarnishedSinBar from "./TarnishedSinBar";
import AngelPanel from "./AngelPanel";
import EdictTracker from "./EdictTracker";

export default function PlayerPanel({ entityKey, reversed = false }) {
    const { game } = useGame();

    const entity = game.entities[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];
    const states = entity.states;

    const isStargazer = states?.[effectKeys.STARGAZER];
    const isAscended = states?.[effectKeys.ASCENDENCE_OF_SPIRIT];

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
        [effectKeys.ZENITH_OF_MORTALITY]: "state-zenith-of-mortality",
        [effectKeys.ABANDONED_BY_GRACE]: "state-abandoned-by-grace",
        [effectKeys.ANOINTED_PROXY]: "state-anointed-proxy",
        [effectKeys.ASCENDENCE_OF_SPIRIT]: "state-ascendence-of-spirit",
    };

    const activeStates = Object.keys(stateClassMap)
        .filter((key) => states?.[key])
        .map((key) => stateClassMap[key]);

    const statesClass = activeStates.join(" ");

    const showAngel =
        entity.states[effectKeys.ASCENDENCE_OF_SPIRIT] ||
        (simEntity && simEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT]);

    return (
        <div className="player-panel-super-container">
            <div
                className={`player-panel-container ${statesClass} ${
                    reversed ? "horizontal-reversed" : ""
                }`}
            >
                <ControlPanel entityKey={entityKey} />

                <div className="player-panel-secondary-container">
                    <LeftPanel entityKey={entityKey} />

                    {isAscended && <EdictTracker entityKey={entityKey} />}

                    {isStargazer && (
                        <StarsPanel entityKey={entityKey} reversed={reversed} />
                    )}

                    {!showAngel ? (
                        <RightPanel entityKey={entityKey} />
                    ) : (
                        <AngelPanel entityKey={entityKey} />
                    )}
                </div>

                <TarnishedSinBar entityKey={entityKey} />
            </div>
        </div>
    );
}
