import { useMemo } from "react";
import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import {
    entryTypesMap,
    entryTypeClassMap,
    presetAi,
    ALL_CATEGORY_KEY,
    INITIAL_GLOSSARY_SPECS,
} from "../utils/constants";
import { DESCRIPTIONS } from "../utils/descriptions";
import { aiKeys, progKeys } from "../utils/enums";
import "./Glossary.css";

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Glossary() {
    const { game } = useGame();
    const { UIElements, setUIElements, glossarySpecs, setGlossarySpecs } =
        useUI();

    const availableCategories = useMemo(() => {
        return Object.entries(presetAi).filter(([aiKey, aiObj]) => {
            if (!aiObj.desc) return false;
            if (
                game.progressMode &&
                game.progressStatus[aiKey] === progKeys.LOCKED
            ) {
                return false;
            }
            return true;
        });
    }, [game.progressMode, game.progressStatus]);

    const isAllSelected = glossarySpecs?.selectedCategory === ALL_CATEGORY_KEY;
    const activeCategoryKey = isAllSelected
        ? ALL_CATEGORY_KEY
        : availableCategories.some(
                ([key]) => key === glossarySpecs?.selectedCategory,
            )
          ? glossarySpecs?.selectedCategory
          : ALL_CATEGORY_KEY;

    const rawItems = useMemo(() => {
        if (activeCategoryKey === ALL_CATEGORY_KEY) {
            const allItemKeys = [];
            availableCategories.forEach(([, aiObj]) => {
                if (aiObj.desc) {
                    allItemKeys.push(...aiObj.desc);
                }
            });
            return Array.from(new Set(allItemKeys));
        }
        const activeData = presetAi[activeCategoryKey];
        return activeData?.desc || [];
    }, [activeCategoryKey, availableCategories]);

    const activeCategoryName =
        activeCategoryKey === ALL_CATEGORY_KEY
            ? "All"
            : activeCategoryKey === aiKeys.HUMAN
              ? "General"
              : presetAi[activeCategoryKey]?.name;

    const filteredItems = useMemo(() => {
        const query = glossarySpecs?.searchQuery.trim();
        if (!query) return rawItems;

        try {
            const escaped = escapeRegExp(query);
            const pattern = glossarySpecs?.matchWholeWord
                ? `\\b${escaped}\\b`
                : escaped;
            const flags = glossarySpecs?.matchCase ? "" : "i";
            const regex = new RegExp(pattern, flags);

            return rawItems.filter((itemKey) => {
                const descData = DESCRIPTIONS[itemKey];
                if (!descData) return false;

                const nameMatch = regex.test(descData.name || "");
                const descMatch = regex.test(descData.description || "");
                const typeMatch = regex.test(
                    entryTypesMap[descData.type] || "",
                );

                return nameMatch || descMatch || typeMatch;
            });
        } catch {
            return rawItems;
        }
    }, [rawItems, glossarySpecs]);

    if (!UIElements.glossary) {
        return null;
    }

    return (
        <div className="glossary-container">
            <div className="glossary-header-container">
                <span>Glossary</span>
                <button
                    className="glossary-close-button"
                    onClick={() => {
                        setUIElements((prev) => ({
                            ...prev,
                            glossary: false,
                        }));
                        setGlossarySpecs(INITIAL_GLOSSARY_SPECS);
                    }}
                >
                    &times;
                </button>
            </div>

            <div className="glossary-main-layout">
                {/* Navigation Sidebar */}
                <nav className="glossary-sidebar">
                    <button
                        className={`glossary-nav-item ${
                            activeCategoryKey === ALL_CATEGORY_KEY
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setGlossarySpecs((prev) => {
                                return {
                                    ...prev,
                                    selectedCategory: ALL_CATEGORY_KEY,
                                };
                            })
                        }
                    >
                        <span>All</span>
                    </button>

                    {availableCategories.map(([aiKey, aiObj]) => {
                        const name =
                            aiKey === aiKeys.HUMAN ? "General" : aiObj.name;
                        const isSelected = aiKey === activeCategoryKey;

                        return (
                            <button
                                key={aiKey}
                                className={`glossary-nav-item ${
                                    isSelected ? "active" : ""
                                }`}
                                onClick={() =>
                                    setGlossarySpecs((prev) => {
                                        return {
                                            ...prev,
                                            selectedCategory: aiKey,
                                        };
                                    })
                                }
                            >
                                <span>{name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Detail Content Area */}
                <div className="glossary-detail-view">
                    <div className="glossary-detail-header">
                        <h2>{activeCategoryName}</h2>
                        <div className="glossary-search-container">
                            <div className="glossary-search-input-wrapper">
                                <input
                                    type="text"
                                    className="glossary-search-input"
                                    placeholder="Search entries..."
                                    value={glossarySpecs?.searchQuery ?? ""}
                                    onChange={(e) =>
                                        setGlossarySpecs((prev) => {
                                            return {
                                                ...prev,
                                                searchQuery: e.target.value,
                                            };
                                        })
                                    }
                                />
                                {glossarySpecs?.searchQuery && (
                                    <button
                                        className="glossary-search-clear"
                                        onClick={() =>
                                            setGlossarySpecs((prev) => {
                                                return {
                                                    ...prev,
                                                    searchQuery: "",
                                                };
                                            })
                                        }
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>

                            <div className="glossary-search-toggles">
                                <button
                                    type="button"
                                    className={`glossary-search-toggle-btn ${
                                        glossarySpecs?.matchCase ? "active" : ""
                                    }`}
                                    onClick={() =>
                                        setGlossarySpecs((prev) => {
                                            return {
                                                ...prev,
                                                matchCase: !prev?.matchCase,
                                            };
                                        })
                                    }
                                    title="Match Case"
                                >
                                    Aa
                                </button>
                                <button
                                    type="button"
                                    className={`glossary-search-toggle-btn ${
                                        glossarySpecs?.matchWholeWord
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setGlossarySpecs((prev) => {
                                            return {
                                                ...prev,
                                                matchWholeWord:
                                                    !prev?.matchWholeWord,
                                            };
                                        })
                                    }
                                    title="Match Whole Word"
                                >
                                    "W"
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glossary-detail-items">
                        {filteredItems.length === 0 ? (
                            <div className="glossary-no-results">
                                No matching entries found.
                            </div>
                        ) : (
                            filteredItems.map((item) => {
                                const descData = DESCRIPTIONS[item];

                                if (!descData) {
                                    return null;
                                }

                                const typeClass =
                                    entryTypeClassMap?.[descData.type] || "";

                                return (
                                    <div className="glossary-item" key={item}>
                                        <div className="glossary-item-header">
                                            <span className="glossary-item-title">
                                                {descData.name}
                                            </span>
                                            <span
                                                className={`glossary-item-type ${typeClass}`}
                                            >
                                                {entryTypesMap[descData.type]}
                                            </span>
                                        </div>
                                        <div className="glossary-item-body">
                                            {descData.description}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Glossary;
