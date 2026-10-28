import { useEffect, useRef, useState } from "react";
import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import "./History.css";
import {
    blasphemyKeys,
    dmgTypes,
    edictKeys,
    effectKeys,
    elementalKeys,
    entityKeys,
    eventKeys,
    runeKeys,
    tarnishTypes,
    turnStatus,
} from "../utils/enums";
import { actionMap, actionsClass, coloredStars } from "../utils/constants";

// Maps
const dmgMap = {
    [dmgTypes.PHYSICAL]: "Physical Damage",
    [dmgTypes.PIERCING]: "Piercing Damage",
    [dmgTypes.TRUE]: "True Damage",
    [dmgTypes.LUNIC]: "Lunic Damage",
    [tarnishTypes.PHYSICAL]: "Physical Tarnishment",
    [tarnishTypes.PIERCING]: "Piercing Tarnishment",
    [tarnishTypes.TRUE]: "True Tarnishment",
    [tarnishTypes.LUNIC]: "Lunic Tarnishment",
};

const starMap = {
    [effectKeys.RED_STAR]: "Red Star",
    [effectKeys.ORANGE_STAR]: "Orange Star",
    [effectKeys.YELLOW_STAR]: "Yellow Star",
    [effectKeys.GREEN_STAR]: "Green Star",
    [effectKeys.BLUE_STAR]: "Blue Star",
    [effectKeys.INDIGO_STAR]: "Indigo Star",
    [effectKeys.VIOLET_STAR]: "Violet Star",
};

const elementMap = {
    [elementalKeys.DULLED]: {
        name: "Dulled",
        className: "history-element-dulled",
    },
    [elementalKeys.NATURE]: {
        name: "Nature",
        className: "history-element-nature",
    },
    [elementalKeys.FROST]: {
        name: "Frost",
        className: "history-element-frost",
    },
    [elementalKeys.SCORCH]: {
        name: "Scorch",
        className: "history-element-scorch",
    },
    [elementalKeys.OCEAN]: {
        name: "Ocean",
        className: "history-element-ocean",
    },
    [elementalKeys.ASH]: {
        name: "Ash",
        className: "history-element-ash",
    },
    [elementalKeys.WITHER]: {
        name: "Wither",
        className: "history-element-wither",
    },
    [elementalKeys.ALBEDO]: {
        name: "Albedo",
        className: "history-element-albedo",
    },
    [elementalKeys.SHATTERED]: {
        name: "Shattered",
        className: "history-element-shattered",
    },
};

const runeMap = {
    [runeKeys.URD]: {
        name: "Urd",
        className: "history-rune-urd",
    },
    [runeKeys.VERDANDI]: {
        name: "Verdandi",
        className: "history-rune-verdandi",
    },
    [runeKeys.SKULD]: {
        name: "Skuld",
        className: "history-rune-skuld",
    },
};

const celestialStarMap = {
    [effectKeys.STARS_OF_APOCALYPSE]: {
        name: "Stars of Apocalypse",
        className: "history-celestial-apocalypse",
    },
    [effectKeys.STARS_OF_GENESIS]: {
        name: "Stars of Genesis",
        className: "history-celestial-genesis",
    },
};

const edictMap = {
    [edictKeys.ANGELS]: "Edict of Angels",
    [edictKeys.ARCHANGELS]: "Edict of Archangels",
    [edictKeys.PRINCIPALITIES]: "Edict of Principalities",
    [edictKeys.POWERS]: "Edict of Powers",
    [edictKeys.VIRTUES]: "Edict of Virtues",
    [edictKeys.DOMINIONS]: "Edict of Dominions",
    [edictKeys.THRONES]: "Edict of Thrones",
    [edictKeys.CHERUBIM]: "Edict of Cherubim",
    [edictKeys.SERAPHIM]: "Edict of Seraphim",
};

const blasphemyMap = {
    [blasphemyKeys.YESTERDAY]: {
        name: "Blasphemy of Yesterday",
        className: "history-blasphemy-yesterday",
    },
    [blasphemyKeys.TODAY]: {
        name: "Blasphemy of Today",
        className: "history-blasphemy-today",
    },
    [blasphemyKeys.TOMORROW]: {
        name: "Blasphemy of Tomorrow",
        className: "history-blasphemy-tomorrow",
    },
};

const constellationMap = {
    [effectKeys.CONSTELLATION]: {
        name: "Constellation",
        className: "history-constellation",
    },
    [effectKeys.AZURE_CONSTELLATION]: {
        name: "Azure Constellation",
        className: "history-constellation-azure",
    },
    [effectKeys.CRIMSON_CONSTELLATION]: {
        name: "Crimson Constellation",
        className: "history-constellation-crimson",
    },
};

// Renders a mapped name inside a span carrying its color class
function renderName(map, key, fallback) {
    const entry = map?.[key];
    return <span className={entry?.className}>{entry?.name ?? fallback}</span>;
}

function getActionClass(action) {
    if (actionsClass.offensiveActions.includes(action)) {
        return "history-action-offensive";
    }
    if (actionsClass.defensiveActions.includes(action)) {
        return "history-action-defensive";
    }
    if (actionsClass.transformativeActions.includes(action)) {
        return "history-action-transformative";
    }
    return "";
}

function buildHistory(event) {
    const eventKey = event?.event;

    const fallback = "UNDEFINED";

    const playerName = event?.player ? (
        event?.player === entityKeys.PLAYER_ONE ? (
            <span className="history-player-one">Player One</span>
        ) : (
            <span className="history-player-two">Player Two</span>
        )
    ) : null;

    const actionName = (
        <span className={getActionClass(event?.action)}>
            {actionMap?.[event?.action]?.name ?? fallback}
        </span>
    );

    switch (eventKey) {
        case eventKeys.BATTLE_START:
            return <span>Battle Start</span>;

        case eventKeys.ROUND_START:
            return (
                <span>{`Round ${event?.roundCount ?? fallback} Start`}</span>
            );

        case eventKeys.PLAYER_TURN_START:
            return <span>{playerName ?? fallback}'s Turn Start</span>;

        case eventKeys.USE_ACTION:
            return (
                <span>
                    {playerName ?? fallback} used {actionName}
                </span>
            );

        case eventKeys.FAILED_ACTION:
            return (
                <span>
                    {playerName ?? fallback} failed to use {actionName}!
                </span>
            );

        case eventKeys.SET_ELEMENT: {
            return (
                <span>
                    {playerName ?? fallback} set element to{" "}
                    {renderName(elementMap, event?.element, fallback)}
                </span>
            );
        }

        case eventKeys.TOOK_DMG: {
            return (
                <span>
                    {playerName ?? fallback} took {event?.damage ?? fallback}{" "}
                    {dmgMap?.[event?.dmgType] ?? fallback}!
                </span>
            );
        }

        case eventKeys.STARFALL_SUBPHASE: {
            const starColor = coloredStars.find(
                (entry) => entry.star === event?.starKey,
            )?.color;
            return (
                <span>
                    {playerName ?? fallback}'s {event?.normalStars ?? fallback}{" "}
                    Normal and {event?.augmentedStars ?? fallback} Augmented{" "}
                    <span
                        className="history-star"
                        style={{ "--history-star-color": starColor }}
                    >
                        {starMap?.[event?.starKey] ?? fallback}
                    </span>{" "}
                    have fallen!
                </span>
            );
        }

        case eventKeys.STARFALL_START: {
            return <span>{playerName ?? fallback}'s Starfall Start</span>;
        }

        case eventKeys.SINGULARITY: {
            return <span>{playerName ?? fallback}'s Singularity Start</span>;
        }

        case eventKeys.PROSECUTION: {
            return <span>{playerName ?? fallback}'s Prosecution Start</span>;
        }

        case eventKeys.MOON_PHASE:
            return <span>{`Moon Phase`}</span>;

        case eventKeys.ANOINTMENT:
            return <span>Anointment</span>;

        case eventKeys.RECKONING:
            return <span>Reckoning</span>;

        case eventKeys.ADD_RUNE:
            return (
                <span>
                    {playerName ?? fallback} carved{" "}
                    {renderName(runeMap, event?.rune, fallback)}
                </span>
            );

        case eventKeys.DETONATE_RUNE:
            return (
                <span>
                    {playerName ?? fallback}'s{" "}
                    {renderName(runeMap, event?.rune, fallback)} detonated!
                </span>
            );

        case eventKeys.SET_EDICT:
            console.log(event);
            return (
                <span>
                    {playerName ?? fallback}{" "}
                    {event?.enabled ? "enabled" : "disabled"}{" "}
                    <span
                        className={
                            event?.enabled
                                ? "history-edict-enabled"
                                : "history-edict-disabled"
                        }
                    >
                        {edictMap?.[event?.edict] ?? fallback}
                    </span>
                </span>
            );

        case eventKeys.USE_CELESTIAL_STARS:
            return (
                <span>
                    {playerName ?? fallback} used {event?.amount ?? fallback}{" "}
                    {renderName(celestialStarMap, event?.starKey, fallback)}
                </span>
            );

        case eventKeys.EXPUNGE_BLASPHEMY:
            return (
                <span>
                    {playerName ?? fallback} expunged{" "}
                    {renderName(blasphemyMap, event?.blasphemy, fallback)}
                </span>
            );

        case eventKeys.ADD_BLASPHEMY:
            return (
                <span>
                    {playerName ?? fallback} inscribed{" "}
                    {renderName(blasphemyMap, event?.blasphemy, fallback)}
                </span>
            );

        case eventKeys.GAME_OVER:
            return event?.status === turnStatus.DRAW ? (
                <span>Draw!</span>
            ) : (
                <span>{playerName ?? fallback} wins!</span>
            );

        case eventKeys.SET_CONSTELLATION:
            return (
                <span>
                    {playerName ?? fallback} set constellation to{" "}
                    {renderName(
                        constellationMap,
                        event?.constellation,
                        fallback,
                    )}
                </span>
            );

        default:
            console.error(`error when building history`);
            console.error(event);
            break;
    }
    return null;
}

export default function History() {
    const { game } = useGame();
    const { persistentUI, setPersistentUI } = useUI();

    const history = game.history;
    const simHistory = game.simGame?.history;
    const previewEntries =
        simHistory && history && simHistory.length > history.length
            ? simHistory.slice(history.length)
            : [];
    const listRef = useRef(null);
    const wasAtBottomRef = useRef(true);

    const handleScroll = () => {
        if (!listRef.current) {
            return;
        }
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        wasAtBottomRef.current = scrollHeight - scrollTop - clientHeight <= 30;
    };

    useEffect(() => {
        if (listRef.current && wasAtBottomRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [history, previewEntries.length]);

    if (!history || history.length <= 0 || !persistentUI.history) {
        return null;
    }

    return (
        <div
            className={`history-list-container${persistentUI.historyColor ? " history-colorful" : ""}`}
        >
            <div className="history-header">
                <span>History</span>
                <select
                    className="history-color-select"
                    value={
                        persistentUI.historyColor ? "colorful" : "monochrome"
                    }
                    onChange={(e) =>
                        setPersistentUI((prev) => ({
                            ...prev,
                            historyColor: e.target.value === "colorful",
                        }))
                    }
                >
                    <option value="colorful">Colorful</option>
                    <option value="monochrome">Monochrome</option>
                </select>
                <button
                    onClick={() => {
                        setPersistentUI((prev) => ({
                            ...prev,
                            history: false,
                        }));
                    }}
                >
                    &times;
                </button>
            </div>
            <div
                ref={listRef}
                onScroll={handleScroll}
                className="history-list-items"
            >
                {history.map((entry, index) => (
                    <div
                        key={index}
                        className={`history-entry${index === history.length - 1 ? " history-latest" : ""}`}
                    >
                        {buildHistory(entry)}
                    </div>
                ))}
                {previewEntries.map((entry, index) => (
                    <div
                        key={`preview-${index}`}
                        className="history-entry history-preview"
                    >
                        {buildHistory(entry)}
                    </div>
                ))}
            </div>
        </div>
    );
}
