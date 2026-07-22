import "./AttrLine.css";

import { effectKeys, elementalKeys, turnStatus } from "../utils/enums";
import { getEntityDef, getEntityStr, isElementActive } from "../utils/entities";
import { spawnTooltip } from "../utils/dictionary";
import { constants } from "../utils/constants";

const gettersMap = {
    str: getEntityStr,
    def: getEntityDef,
};

function AttrLine({
    battleState,
    handleStatusChange,
    modifiable,
    attr,
    entity,
    entityKey,
    handleSetTooltip,
}) {
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

    const showControls = modifiable && battleState === turnStatus.SETUP;

    return (
        <div className="status-line-container">
            {showControls ? (
                <p
                    className="changeable-status"
                    onMouseDown={(e) => spawnTooltip(e, handleSetTooltip, attr)}
                >
                    {attr.toUpperCase() + ": " + gettersMap[attr](entity)}
                </p>
            ) : (
                <p
                    className="non-changeable-status"
                    onMouseDown={(e) => spawnTooltip(e, handleSetTooltip, attr)}
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
                            handleStatusChange(entityKey, attr, -1);
                        }}
                        disabled={entity.attributes[attr].points <= 0}
                    >
                        -
                    </button>

                    <p>{entity.attributes[attr].points}</p>

                    <button
                        onClick={() => {
                            handleStatusChange(entityKey, attr, 1);
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
