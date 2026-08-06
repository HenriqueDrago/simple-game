import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { entryTypesMap, presetAi } from "../utils/constants";
import { DESCRIPTIONS } from "../utils/descriptions";
import { aiKeys, effectKeys, progKeys } from "../utils/enums";
import "./Glossary.css";

function Glossary() {
    const { game } = useGame();
    const { UIElements, setUIElements } = useUI();

    if (!UIElements.glossary) {
        return null;
    }

    const aiObjects = [...Object.entries(presetAi)];
    return (
        <div className="glossary-container">
            <div className="glossary-header-container">
                <span>Glossary</span>
                <button
                    className="glossary-close-button"
                    onClick={() => {
                        setUIElements((prev) => {
                            return {
                                ...prev,
                                glossary: false,
                            };
                        });
                    }}
                >
                    &times;
                </button>
            </div>

            {aiObjects.map(([aiKey, aiObj], i) => {
                const name = aiKey === aiKeys.HUMAN ? "General" : aiObj.name;

                if (
                    !aiObj.desc ||
                    (game[effectKeys.PROGRESSION_MODE] &&
                        game.progressStatus[aiKey] === progKeys.LOCKED)
                ) {
                    return null;
                }

                return (
                    <div className="glossary-column-container" key={i}>
                        <span className="glossary-column-title">{name}</span>

                        {aiObj.desc.map((item) => {
                            const descData = DESCRIPTIONS[item];

                            if (!descData) {
                                return null;
                            }

                            return (
                                <div className="glossary-item" key={item}>
                                    <div className="glossary-item-header">
                                        <span className="glossary-item-title">
                                            {descData.name}
                                        </span>
                                        <span className="glossary-item-type">
                                            {entryTypesMap[descData.type]}
                                        </span>
                                    </div>
                                    <div className="glossary-item-body">
                                        {descData.description}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}

export default Glossary;
