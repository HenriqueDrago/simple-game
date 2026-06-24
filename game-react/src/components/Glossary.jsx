import { presetAi } from "../utils/constants";
import { DESCRIPTIONS } from "../utils/descriptions";
import { aiKeys } from "../utils/enums";
import "./Glossary.css";

function Glossary({ handleGlossary }) {
    const aiObjects = [...Object.values(presetAi)];
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

            {aiObjects.map((aiObj, i) => {
                const name =
                    aiObj === presetAi[aiKeys.HUMAN] ? "General" : aiObj.name;

                if (!aiObj.desc) {
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
