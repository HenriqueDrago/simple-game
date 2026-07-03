import "./AttrLine.css";

import { turnStatus } from "../utils/enums";

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

    const showControls = modifiable && battleState === turnStatus.SETUP;

    return (
        <div className="status-line-container">
            {showControls ? (
                <p className="changeable-status">
                    {attr.toUpperCase() + ": " + entity.attributes[attr].value}
                </p>
            ) : (
                <p className="non-changeable-status">
                    {attr.toUpperCase() + ": "}
                    <span>
                        {entity.attributes[attr].value}
                    </span>
                </p>
            )}

            {showControls && (
                <div className="point-assign-container">
                    <button
                        onClick={() => {
                            handleStatusChange(entityKey, attr, -1);
                        }}
                        disabled={entity.attributes[attr].value <= 0}
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
