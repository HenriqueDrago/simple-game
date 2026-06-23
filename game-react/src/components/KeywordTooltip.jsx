import { keywordDictionary } from '../utils/dictionary';
import './KeywordTooltip.css';

function KeywordTooltip({ keyword, type, handleSetTooltip, depth }) {
    
    const handleClick = (e) => {
        e.stopPropagation(); // Prevents the backdrop from closing the tooltips when you click a word
        const entry = keywordDictionary[keyword];
        
        if (entry) {
            handleSetTooltip({ 
                keyword: keyword, 
                type: type, 
                description: entry.description,
                x: e.clientX,
                y: e.clientY
            }, depth + 1); // Depth + 1 ensures it spawns as a child without deleting the parent!
        }
    };

    return (
        <span 
            className={`keyword-text type-${type?.toLowerCase()}`}
            onClick={handleClick}
        >
            {keyword}
        </span>
    );
}

export default KeywordTooltip;