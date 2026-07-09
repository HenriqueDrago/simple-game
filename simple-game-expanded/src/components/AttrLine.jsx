import "./AttrLine.css";

import { elementalKeys, turnStatus } from "../utils/enums";
import { getEntityDef, getEntityStr, isElementActive } from "../utils/entities";

const gettersMap = {
    str: getEntityStr,
    def: getEntityDef,
}

function AttrLine({
    battleState,
    handleStatusChange,
    modifiable,
    attr,
    entity,
    entityKey,
}) {
    if(entity.attributes[attr].value == null) {
        return null;
    }

    let specialClass = "";
    if(attr === "str") {
        specialClass = isElementActive(entity, elementalKeys.SCORCH) ? "stat-value-str" : "";
    }
    if(attr === "def") {
        specialClass = isElementActive(entity, elementalKeys.FROST) ? "stat-value-def" : "";
    }

    const showControls = modifiable && battleState === turnStatus.SETUP;

    return (
        <div className="status-line-container">
            {showControls ? (
                <p className="changeable-status">
                    {attr.toUpperCase() + ": " + gettersMap[attr](entity)}
                </p>
            ) : (
                <p className="non-changeable-status">
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
