import { presetAi } from "../utils/constants";
import { DESCRIPTIONS } from "../utils/descriptions";
import { aiKeys, progKeys } from "../utils/enums";
import "./Glossary.css";

function Glossary({ handleGlossary, game }) {
    const aiObjects = [...Object.entries(presetAi)];
    return (
        <div className="glossary-container">
            <button
                className="glossary-close-button"
                onClick={() => {
                    handleGlossary(false);
                }}
                aria-label="Close glossary"
            >
                &times;
            </button>

            {aiObjects.map(([aiKey, aiObj], i) => {
                const name =
                     aiKey === aiKeys.HUMAN ? "General" : aiObj.name;

                if (!aiObj.desc || (game.progressMode && game.progressStatus[aiKey] === progKeys.LOCKED)) {
                    return null;
                }

                return (
                    <div className="glossary-column-container" key={i}>
                        <h2 className="glossary-column-title">{name}</h2>

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
                                            {descData.type}
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
