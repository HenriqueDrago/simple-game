import "./FreeResourcesTracker.css";
import { FREE_RESOURCES } from "../utils/constants";
import { effectKeys } from "../utils/enums";
import { useUI } from "../contexts/UIContext";

const stackCounters = {
    [effectKeys.BLOOD_SACRIFICE]: {
        label: "Blood Sacrifice",
        style: {
            color: "#ff3333",
            borderColor: "#ff3333",
            backgroundColor: "rgba(255, 51, 51, 0.2)",
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

    [effectKeys.MOONDUST]: {
        label: "Moondust",
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
            color: "#b388ff",
            borderColor: "#b388ff",
            backgroundColor: "rgba(179, 136, 255, 0.2)",
        },
    },
};

export default function FreeResourcesTracker({
    entity,
    simEntity,
}) {
    const { handleSpawnTooltip } = useUI();

    const activeResources = [...FREE_RESOURCES].filter((key) => {
        if (!stackCounters[key]) {
            return false;
        }

        const currentAmount = entity?.resources?.[key] ?? 0;
        // const simAmount = simEntity
        //     ? (simEntity?.resources?.[key] ?? 0)
        //     : currentAmount;
        return currentAmount > 0 /*|| simAmount > 0*/;
    });

    if (activeResources.length === 0) {
        return null;
    }

    const hasOverflow = activeResources.length > 3;

    return (
        <div
            className={`counter-tracker-container ${
                hasOverflow ? "has-overflow" : ""
            }`}
        >
            {activeResources.map((key) => {
                const counter = stackCounters[key];
                const currentAmount = entity?.resources?.[key] ?? 0;
                const simAmount = simEntity
                    ? (simEntity?.resources?.[key] ?? 0)
                    : currentAmount;

                const isNewResource = currentAmount <= 0 && simAmount > 0;
                const isNumberChanged =
                    simEntity && simAmount !== currentAmount;

                const displayAmount = simEntity ? simAmount : currentAmount;

                return (
                    <div
                        key={key}
                        className={`counter-item ${
                            isNewResource ? "is-new-preview" : ""
                        }`}
                        style={counter.style}
                        onMouseDown={(e) =>
                            handleSpawnTooltip(e, key)
                        }
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
    );
}
