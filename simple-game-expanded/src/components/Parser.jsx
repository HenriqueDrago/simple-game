import { keywordDictionary, sortedKeywordList } from "../utils/dictionary";
import KeywordTooltip from "./KeywordTooltip";
import './Parser.css';

// Regex to capture and list the keys found
const keywordRegex = new RegExp(`\\b(${sortedKeywordList.join("|")})\\b`, "g");

function Parser({ rawText, depth }) {
    if (!rawText) {
        return null;
    }

    // Splits the text, keeping the keywords as separate items
    const parsedTextArray = rawText.split(keywordRegex);

    return (
        <span className="parsed-description-container">
            {parsedTextArray.map((textChunk, index) => {
                
                // For every text chunk the array returned, we check if it's in the dict
                const dictionaryEntry = keywordDictionary[textChunk];
                if (dictionaryEntry) {
                    return (
                        <KeywordTooltip
                            key={index}
                            originalKey={dictionaryEntry.originalKey}
                            keyword={textChunk}
                            type={dictionaryEntry.type}
                            depth={depth} 
                        />
                    );
                }

                // If not in dictionary, render as normal text
                return <span key={index}>{textChunk}</span>;
            })}
        </span>
    );
}

export default Parser;
