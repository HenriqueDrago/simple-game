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

    const specialClass =
        attr === "str" && entity.scoria > 0
            ? "str-scoria"
            : attr === "def" && entity.permafrost > 0
              ? "def-permafrost"
              : null;

    const extraValue =
        attr === "str" ? entity.scoria : attr === "def" ? entity.permafrost : 0;

    return (
        <div className="status-line-container">
            {showControls ? (
                <p className="changeable-status">
                    {attr.toUpperCase() + ": " + entity.attributes[attr].value}
                </p>
            ) : (
                <p className="non-changeable-status">
                    {attr.toUpperCase() + ": "}
                    <span className={specialClass}>
                        {entity.attributes[attr].value + extraValue}
                    </span>
                </p>
            )}

            {showControls && (
                <div className="point-assign-container">
                    <button
                        onClick={() => {
                            handleStatusChange(entityKey, attr, -1);
                        }}
                    >
                        -
                    </button>

                    <p>{entity.attributes[attr].points}</p>

                    <button
                        onClick={() => {
                            handleStatusChange(entityKey, attr, 1);
                        }}
                    >
                        +
                    </button>
                </div>
            )}
        </div>
    );
}

export default AttrLine;
