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

function getStatClass(attr, entity) {
    if (!entity) {
        return "";
    }

    if (attr === "str") {
        if (countRunes(entity[effectKeys.RUNIC_ARRAY], runeKeys.VERDANDI) > 0) {
            return "str-value-verdandi";
        }
        if (
            entity[effectKeys.PAST_MEMORIES] > 0
        ) {
            return "str-value-past-memories";
        }
        if (
            isElementActive(entity, elementalKeys.SCORCH) ||
            entity[effectKeys.CRIMSON_CONSTELLATION] > 0
        ) {
            return "stat-value-str";
        }
        if (
            (entity[effectKeys.CONSTELLATION] > 0 &&
                getEntityStr(entity) > entity.attributes.str.points) ||
            entity[effectKeys.DIVINE_SPARK] >
                constants.DIVINE_SPARK_STR_CONVERSION
        ) {
            return "constellation-value-increase";
        }
    }

    if (attr === "def") {
        if (
            isElementActive(entity, elementalKeys.FROST) ||
            entity[effectKeys.AZURE_CONSTELLATION] > 0
        ) {
            return "stat-value-def";
        }
        if (
            entity[effectKeys.CONSTELLATION] > 0 &&
            getEntityDef(entity) > entity.attributes.def.points
        ) {
            return "constellation-value-increase";
        }
        if (
            countRunes(entity[effectKeys.RUNIC_ARRAY], runeKeys.URD) > 0
        ) {
            return "str-value-past-memories";
        }
    }

    return "";
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
    const specialClass = getStatClass(attr, activeEntity);

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
