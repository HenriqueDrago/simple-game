import { entryTypeClassMap } from '../utils/constants';
import { keywordDictionary } from '../utils/dictionary';
import './KeywordTooltip.css';

function KeywordTooltip({ keyword, type, handleSetTooltip, depth }) {
    const handleMouseDown = (e) => {
        if (e.button === 1 || e.button === 0) {
            e.preventDefault();
            e.stopPropagation();
            const entry = keywordDictionary[keyword];
            
            if (entry) {
                handleSetTooltip({ 
                    keyword: keyword, 
                    type: type, 
                    description: entry.description,
                    x: e.clientX,
                    y: e.clientY
                }, depth + 1);
            }
        }
    };

    const typeClass = entryTypeClassMap[type] || 'type-category';

    return (
        <span 
            className={`keyword-text ${typeClass}`}
            onMouseDown={handleMouseDown}
        >
            {keyword}
        </span>
    );
}

export default KeywordTooltip;