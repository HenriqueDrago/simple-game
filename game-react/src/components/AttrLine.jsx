import "./AttrLine.css";

function AttrLine({
    battleState,
    handleStatusChange,
    modifiable,
    attr,
    entity,
    entityKey,
}) {
    const showControls = modifiable && battleState === "setup";

    return (
        <div className="status-line-container">
            {showControls ? (
                <p className="changeable-status">
                    {attr.toUpperCase() +
                        ": " +
                        entity.attributes[attr].value +
                        " --> (" +
                        entity.attributes[attr].valuePreview +
                        ")"}
                </p>
            ) : (
                <p className="non-changeable-status">{attr.toUpperCase() + ": " + entity.attributes[attr].valuePreview}</p>
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
