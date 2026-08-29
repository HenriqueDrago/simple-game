import "./AttrLine.css";

import {
    effectKeys,
    elementalKeys,
    runeKeys,
    sdmKeys,
    turnStatus,
} from "../utils/enums";
import {
    countRunes,
    getEntityDef,
    getEntityStr,
    isElementActive,
} from "../utils/entities";

import { constants } from "../utils/constants";
import { useUI } from "../contexts/UIContext";
import { useGame } from "../contexts/GameContext";

const gettersMap = {
    str: getEntityStr,
    def: getEntityDef,
};

const EFFECT_COLORS = {
    URD: "var(--color-rune-urd)",
    VERDANDI: "var(--color-rune-verdandi)",
    SKULD: "var(--color-rune-skuld)",
    SCORCH: "var(--scorch-color)",
    FROST: "var(--frost-color)",
    CRIMSON_CONSTELLATION: "#dc143c",
    AZURE_CONSTELLATION: "#00bfff",
    CONSTELLATION: "#DAA520",
    DIVINE_SPARK: "#ffd93b",
};

function getStatColors(attr, entity) {
    if (!entity) {
        return [];
    }

    const colors = [];

    if (attr === "str") {
        if (countRunes(entity[effectKeys.RUNIC_ARRAY], runeKeys.URD) > 0) {
            colors.push(EFFECT_COLORS.URD);
        }
        if (
            entity[effectKeys.RECOLLECTION] > 0 &&
            Math.floor(
                (getEntityDef(entity) * entity[effectKeys.RECOLLECTION]) / 100,
            ) > 0
        ) {
            if (!colors.includes(EFFECT_COLORS.URD)) {
                colors.push(EFFECT_COLORS.URD);
            }
        }
        if (
            isElementActive(entity, elementalKeys.SCORCH) &&
            entity[effectKeys.MOONLIGHT] > 0
        ) {
            colors.push(EFFECT_COLORS.SCORCH);
        }
        if (entity[effectKeys.CRIMSON_CONSTELLATION] > 0) {
            colors.push(EFFECT_COLORS.CRIMSON_CONSTELLATION);
        }
        if (entity[effectKeys.CONSTELLATION] > 0) {
            colors.push(EFFECT_COLORS.CONSTELLATION);
        }
        if (
            entity[effectKeys.DIVINE_SPARK] >=
            constants.DIVINE_SPARK_STR_CONVERSION
        ) {
            colors.push(EFFECT_COLORS.DIVINE_SPARK);
        }
    }

    if (attr === "def") {
        if (countRunes(entity[effectKeys.RUNIC_ARRAY], runeKeys.VERDANDI) > 0) {
            colors.push(EFFECT_COLORS.VERDANDI);
        }
        if (
            isElementActive(entity, elementalKeys.FROST) &&
            entity[effectKeys.MOONLIGHT] > 0
        ) {
            colors.push(EFFECT_COLORS.FROST);
        }
        if (entity[effectKeys.AZURE_CONSTELLATION] > 0) {
            colors.push(EFFECT_COLORS.AZURE_CONSTELLATION);
        }
        if (entity[effectKeys.CONSTELLATION] > 1) {
            colors.push(EFFECT_COLORS.CONSTELLATION);
        }
        if (entity.states[effectKeys.RADIANT]) {
            colors.push(EFFECT_COLORS.DIVINE_SPARK);
        }
    }

    return colors;
}

export default function AttrLine({ attr, entityKey }) {
    const { game, handleUpdateStatsPoints } = useGame();
    const { handleSpawnTooltip } = useUI();

    const entity = game.entities[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];
    const battleState = game.status;

    const realVal = gettersMap[attr](entity);
    const simVal = simEntity ? gettersMap[attr](simEntity) : realVal;
    const isValChanged = simEntity && simVal !== realVal;
    const displayVal = simEntity ? simVal : realVal;

    const activeEntity = simEntity || entity;
    const activeColors = getStatColors(attr, activeEntity);

    let specialClass = "";
    let customStyle = undefined;

    if (activeColors.length === 1) {
        customStyle = { color: activeColors[0] };
    } else if (activeColors.length > 1) {
        specialClass = "attr-multi-gradient";
        customStyle = {
            backgroundImage: `linear-gradient(90deg, ${activeColors.join(", ")})`,
        };
    }

    const showControls =
        entity.statDistributionMode === sdmKeys.CUSTOM &&
        battleState === turnStatus.SETUP;

    return (
        <div className="status-line-container">
            {showControls ? (
                <p
                    className="changeable-status"
                    onMouseDown={(e) => handleSpawnTooltip(e, attr)}
                >
                    {`${attr.toUpperCase()}: ${displayVal}`}
                </p>
            ) : (
                <p
                    className="non-changeable-status"
                    onMouseDown={(e) => handleSpawnTooltip(e, attr)}
                >
                    {`${attr.toUpperCase()}: `}
                    <span
                        className={`${specialClass} ${
                            isValChanged ? "is-preview" : ""
                        }`}
                        style={customStyle}
                    >
                        {displayVal}
                    </span>
                </p>
            )}

            {showControls && (
                <div className="point-assign-container">
                    <button
                        onClick={() => {
                            handleUpdateStatsPoints(entityKey, attr, -1);
                        }}
                        disabled={entity.attributes[attr].points <= 0}
                    >
                        -
                    </button>

                    <p>{entity.attributes[attr].points}</p>

                    <button
                        onClick={() => {
                            handleUpdateStatsPoints(entityKey, attr, 1);
                        }}
                        disabled={entity.unspentPoints <= 0}
                    >
                        +
                    </button>
                </div>
            )}
        </div>
    );
}
