import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import {
    constants,
    FIXED_RESOURCES,
    FREE_RESOURCES,
    RANKED_RESOURCES,
} from "../utils/constants";
import { effectKeys, turnStatus } from "../utils/enums";

import GradientBar from "./GradientBar";
import RankedCounter from "./RankedCounter";
import "./LeftPanel.css";

const FIXED_BARS_CONFIG = {
    [effectKeys.LUNACY]: {
        label: "Lunacy",
        maxResource: constants.MAX_LUNACY,
        trackStyle: {
            backgroundImage: `linear-gradient(90deg, #9aa4b0 0%, #c2c9d2 35%, #e6eaf0 50%, #c2c9d2 65%, #9aa4b0 100%)`,
        },
    },
    [effectKeys.GRAVITATION]: {
        label: "Gravitation",
        maxResource: constants.MAX_GRAVITATION,
        trackStyle: {
            backgroundImage: `linear-gradient(90deg, #311b92 0%, #512da8 25%, #673ab7 50%, #512da8 75%, #311b92 100%)`,
        },
    },
    [effectKeys.ACCRETION]: {
        label: "Accretion",
        maxResource: constants.MAX_ACCRETION,
        trackStyle: {
            backgroundImage: `linear-gradient(90deg, #3e2723 0%, #d84315 35%, #ffb300 50%, #d84315 65%, #3e2723 100%)`,
        },
    },
    [effectKeys.RECOLLECTION]: {
        label: "Recollection",
        maxResource: constants.MAX_RECOLLECTION,
        trackStyle: {
            backgroundImage: `linear-gradient(90deg, #00838f 0%, #00f0ff 35%, #80deea 50%, #00f0ff 65%, #00838f 100%)`,
        },
    },
    [effectKeys.BAD_OMEN]: {
        label: "Bad Omen",
        maxResource: constants.MAX_BAD_OMEN,
        trackStyle: {
            backgroundImage: `linear-gradient(90deg, #291508 0%, #78350f 35%, #b45309 50%, #78350f 65%, #291508 100%)`,
        },
    },
    [effectKeys.IRRADIATION]: {
        label: "Irradiation",
        maxResource: constants.MAX_IRRADIATION,
        trackStyle: {
            backgroundImage: `linear-gradient(90deg, #002171 0%, #0d47a1 35%, #29b6f6 50%, #0d47a1 65%, #002171 100%)`,
        },
    },
};

const RANKED_COUNTERS_CONFIG = {
    [effectKeys.MOONLIT_TEARS]: {
        label: "MOONLIT TEARS",
        style: {
            color: "#6ec6ff",
            borderColor: "#80d8ff",
            backgroundColor: "rgba(110, 198, 255, 0.2)",
            boxShadow: "inset 0 0 8px rgba(128, 216, 255, 0.3)",
        },
    },
    [effectKeys.MANA_BLEED]: {
        label: "MANA BLEED",
        style: {
            color: "#e6195e",
            borderColor: "#ff3333",
            backgroundColor: "rgba(220, 20, 60, 0.15)",
            boxShadow: "inset 0 0 8px rgba(41, 121, 255, 0.25)",
        },
    },
    [effectKeys.STARBLIGHT]: {
        label: "STARBLIGHT",
        style: {
            color: "#ea80fc",
            borderColor: "#e040fb",
            backgroundColor: "rgba(224, 64, 251, 0.15)",
            boxShadow: "inset 0 0 8px rgba(234, 128, 252, 0.3)",
        },
    },
    [effectKeys.BURDEN_OF_STIGMA]: {
        label: "BURDEN OF STIGMA",
        style: {
            color: "#e0a96d",
            borderColor: "#b87333",
            backgroundColor: "rgba(184, 115, 51, 0.2)",
            boxShadow: "inset 0 0 8px rgba(184, 115, 51, 0.35)",
        },
    },
};

const FREE_STACKS_CONFIG = {
    [effectKeys.MARTHYR]: {
        label: "Marthyr",
        style: {
            color: "#f48fb1",
            borderColor: "#ad1457",
            backgroundColor: "rgba(173, 20, 87, 0.22)",
        },
    },
    [effectKeys.SACRILEGE]: {
        label: "Sacrilege",
        style: {
            color: "#ff1744",
            borderColor: "#d50000",
            backgroundColor: "rgba(213, 0, 0, 0.2)",
        },
    },
    [effectKeys.COVENANT]: {
        label: "Covenant",
        style: {
            color: "#ffb74d",
            borderColor: "#f57c00",
            backgroundColor: "rgba(245, 124, 0, 0.2)",
        },
    },
    [effectKeys.SACRED_FLAMES]: {
        label: "Sacred Flames",
        style: {
            color: "#ffd700",
            borderColor: "#ffab00",
            backgroundColor: "rgba(255, 171, 0, 0.2)",
        },
    },
    [effectKeys.BLOOD_SACRIFICE]: {
        label: "Blood Sacrifice",
        style: {
            color: "#ff3333",
            borderColor: "#ff3333",
            backgroundColor: "rgba(255, 51, 51, 0.2)",
        },
    },
    [effectKeys.PROPHECY_OF_DOOM]: {
        label: "Prophecy of Doom",
        style: {
            color: "#fb923c",
            borderColor: "#c2410c",
            backgroundColor: "rgba(251, 146, 60, 0.18)",
        },
    },
    [effectKeys.SHADOWFLAME]: {
        label: "Shadowflame",
        style: {
            color: "#d500f9",
            borderColor: "#d500f9",
            backgroundColor: "rgba(213, 0, 249, 0.2)",
        },
    },
    [effectKeys.UNRELENTING_SHADOWS]: {
        label: "Unrelenting Shadows",
        style: {
            color: "#651fff",
            borderColor: "#651fff",
            backgroundColor: "rgba(101, 31, 255, 0.2)",
        },
    },
    [effectKeys.LINGERING_EMBER]: {
        label: "Lingering Ember",
        style: {
            color: "#f50057",
            borderColor: "#f50057",
            backgroundColor: "rgba(245, 0, 87, 0.2)",
        },
    },
    [effectKeys.CINDERS]: {
        label: "Cinders",
        style: {
            color: "#e0e0e0",
            borderColor: "#9e9e9e",
            backgroundColor: "rgba(158, 158, 158, 0.2)",
        },
    },
    [effectKeys.RADIANCE]: {
        label: "Radiance",
        style: {
            color: "#ffea00",
            borderColor: "#ffea00",
            backgroundColor: "rgba(255, 234, 0, 0.2)",
        },
    },
    [effectKeys.HALO]: {
        label: "Halo",
        style: {
            color: "#fff59d",
            borderColor: "#fff59d",
            backgroundColor: "rgba(255, 245, 157, 0.2)",
        },
    },
    [effectKeys.STARDUST]: {
        label: "Stardust",
        style: {
            color: "#ff8a65",
            borderColor: "#ff8a65",
            backgroundColor: "rgba(255, 138, 101, 0.2)",
        },
    },
    [effectKeys.MOONSHINE]: {
        label: "Moonshine",
        style: {
            color: "#e1f5fe",
            borderColor: "#e1f5fe",
            backgroundColor: "rgba(225, 245, 254, 0.2)",
        },
    },
    [effectKeys.DISSONANCE]: {
        label: "Dissonance",
        style: {
            color: "#ff3333",
            borderColor: "#ff3333",
            backgroundColor: "rgba(255, 51, 51, 0.2)",
        },
    },
    [effectKeys.PRECOGNITION]: {
        label: "Precognition",
        style: {
            color: "#00e5ff",
            borderColor: "#00b4d8",
            backgroundColor: "rgba(0, 229, 255, 0.18)",
        },
    },
};

export default function LeftPanel({ entityKey }) {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game.entities[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    const activeBars = FIXED_RESOURCES.filter((key) => {
        if (!FIXED_BARS_CONFIG[key]) return false;
        const curr = entity?.[key] ?? 0;
        const sim = simEntity ? (simEntity?.[key] ?? 0) : curr;
        return curr > 0 || sim > 0;
    });

    const activeCounters = RANKED_RESOURCES.filter((key) => {
        if (!RANKED_COUNTERS_CONFIG[key]) return false;
        const curr = entity?.[key] ?? 0;
        const sim = simEntity ? (simEntity?.[key] ?? 0) : curr;
        return curr > 0 || sim > 0;
    });

    const activeStacks = FREE_RESOURCES.filter((key) => {
        if (!FREE_STACKS_CONFIG[key]) return false;
        const curr = entity?.resources?.[key] ?? 0;
        const sim = simEntity ? (simEntity?.resources?.[key] ?? 0) : curr;
        return curr > 0 || sim > 0;
    });

    const showLeftPanel =
        game.status !== turnStatus.SETUP &&
        activeBars.length + activeCounters.length + activeStacks.length > 0;

    if (!showLeftPanel) return null;

    return (
        <div className="player-panel-left-wrapper">
            <div className="player-panel-left">
                <div
                    className={`resource-category-section ${
                        activeBars.length === 0 ? "is-empty" : ""
                    }`}
                >
                    <span className="resource-section-label">
                        Fixed Resources
                    </span>
                    {activeBars.map((key) => {
                        const config = FIXED_BARS_CONFIG[key];
                        return (
                            <GradientBar
                                key={key}
                                resourceKey={key}
                                entityKey={entityKey}
                                label={config.label}
                                maxResource={config.maxResource}
                                trackStyle={config.trackStyle}
                                showPercent={true}
                                tooltip={key}
                            />
                        );
                    })}
                </div>

                <div
                    className={`resource-category-section ${
                        activeCounters.length === 0 ? "is-empty" : ""
                    }`}
                >
                    <span className="resource-section-label">
                        Ranked Resources
                    </span>
                    {activeCounters.map((key) => {
                        const config = RANKED_COUNTERS_CONFIG[key];
                        return (
                            <RankedCounter
                                key={key}
                                resourceKey={key}
                                entityKey={entityKey}
                                label={config.label}
                                roman={true}
                                style={config.style}
                                tooltip={key}
                            />
                        );
                    })}
                </div>

                <div
                    className={`resource-category-section ${
                        activeStacks.length === 0 ? "is-empty" : ""
                    }`}
                >
                    <span className="resource-section-label">
                        Free Resources
                    </span>
                    {activeStacks.map((key) => {
                        const counter = FREE_STACKS_CONFIG[key];
                        const curr = entity?.resources?.[key] ?? 0;
                        const sim = simEntity
                            ? (simEntity?.resources?.[key] ?? 0)
                            : curr;

                        const isNewResource = curr <= 0 && sim > 0;
                        const isNumberChanged = simEntity && sim !== curr;
                        const displayAmount = simEntity ? sim : curr;

                        return (
                            <div
                                key={key}
                                className={`counter-item ${
                                    isNewResource ? "is-new-preview" : ""
                                }`}
                                style={counter.style}
                                onMouseDown={(e) => handleSpawnTooltip(e, key)}
                            >
                                {counter.label}
                                <span
                                    className={`counter-amount ${
                                        isNumberChanged && !isNewResource
                                            ? "is-preview"
                                            : ""
                                    }`}
                                >
                                    {displayAmount}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
