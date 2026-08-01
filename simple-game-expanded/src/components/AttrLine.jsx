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

function AttrLine({ attr, entityKey }) {
    const { game, handleUpdateStatsPoints } = useGame();

    const entity = game.entities[entityKey];
    const battleState = game.status;

    const { handleSpawnTooltip } = useUI();
    if (entity.attributes[attr].value == null) {
        return null;
    }

    let specialClass = "";
    if (
        (entity[effectKeys.CONSTELLATION] > 0 &&
            gettersMap[attr](entity) > entity.attributes[attr].points) ||
        (attr === "str" &&
            entity[effectKeys.DIVINE_SPARK] >
                constants.DIVINE_SPARK_STR_CONVERSION)
    ) {
        specialClass = "constellation-value-increase";
    }
    if (
        attr === "str" &&
        (isElementActive(entity, elementalKeys.SCORCH) ||
            entity[effectKeys.CRIMSON_CONSTELLATION] > 0)
    ) {
        specialClass = "stat-value-str";
    }
    if (
        attr === "def" &&
        (isElementActive(entity, elementalKeys.FROST) ||
            entity[effectKeys.AZURE_CONSTELLATION] > 0)
    ) {
        specialClass = "stat-value-def";
    }
    if (
        attr === "str" &&
        (entity[effectKeys.PAST_MEMORIES] > 0 ||
            countRunes(entity[effectKeys.RUNIC_ARRAY], runeKeys.URD) > 0)
    ) {
        specialClass = "str-value-past-memories";
    }
    if (
        attr === "str" &&
        countRunes(entity[effectKeys.RUNIC_ARRAY], runeKeys.VERDANDI) > 0
    ) {
        specialClass = "str-value-verdandi";
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
                    {attr.toUpperCase() + ": " + gettersMap[attr](entity)}
                </p>
            ) : (
                <p
                    className="non-changeable-status"
                    onMouseDown={(e) => handleSpawnTooltip(e, attr)}
                >
                    {attr.toUpperCase() + ": "}
                    <span className={specialClass}>
                        {gettersMap[attr](entity)}
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

export default AttrLine;
