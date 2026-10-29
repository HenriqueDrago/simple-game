import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { getEntryTypeClass, presetAi } from "../utils/constants";
import { keywordDictionary } from "../utils/dictionary";
import { progKeys } from "../utils/enums";
import "./KeywordTooltip.css";

function KeywordTooltip({
    keyword,
    type,
    depth,
    originalKey,
    interactive = true,
}) {
    const { game } = useGame();
    const { handleSetTooltip } = useUI();

    const isLocked = () => {
        if (game.progressMode) {
            for (let ai of Object.entries(presetAi)) {
                if (
                    ai[1].desc.includes(originalKey) &&
                    game.progressStatus[ai[0]] !== progKeys.ALWAYS_OPEN &&
                    game.progressStatus[ai[0]] !== progKeys.OPEN_UNDEFEATED
                ) {
                    return true;
                }
            }
        }

        return false;
    };

    const handleMouseDown = (e) => {
        if (e.button === 1 || e.button === 0) {
            e.preventDefault();
            e.stopPropagation();
            const entry = keywordDictionary[keyword];

            if (isLocked()) {
                return;
            }

            if (entry) {
                handleSetTooltip(
                    {
                        keyword: keyword,
                        type: type,
                        description: entry.description,
                        x: e.clientX,
                        y: e.clientY,
                    },
                    depth + 1,
                );
            }
        }
    };

    const typeClass = getEntryTypeClass(type, originalKey);

    return (
        <span
            className={`keyword-text ${typeClass} ${isLocked() ? "locked" : ""} ${interactive ? "" : "static"}`}
            onMouseDown={interactive ? handleMouseDown : undefined}
        >
            {keyword}
        </span>
    );
}

export default KeywordTooltip;
