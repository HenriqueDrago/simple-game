import { keywordDictionary } from '../utils/dictionary';
import './KeywordTooltip.css';

function KeywordTooltip({ keyword, type, handleSetTooltip, depth }) {
    
    const handleMouseDown = (e) => {
        // Trigger on mouse wheel
        if (e.button === 1) {
            e.preventDefault(); // Stops the auto-scroll icon
            e.stopPropagation(); // Prevents the backdrop from closing tooltips
            const entry = keywordDictionary[keyword];
            
            if (entry) {
                handleSetTooltip({ 
                    keyword: keyword, 
                    type: type, 
                    description: entry.description,
                    x: e.clientX,
                    y: e.clientY
                }, depth + 1); // Depth + 1 ensures it spawns as a child (in front)
            }
        }
    };

    return (
        <span 
            className={`keyword-text type-${type?.toLowerCase()}`}
            onMouseDown={handleMouseDown}
        >
            {keyword}
        </span>
    );
}

export default KeywordTooltip;