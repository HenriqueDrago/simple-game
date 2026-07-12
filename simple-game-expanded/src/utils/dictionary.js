import { DESCRIPTIONS } from "./descriptions.js";

// Combine all entries values (as an array without their keys)
const allEntries = [...Object.values(DESCRIPTIONS)];

// Generate a dict with the names as keys
// reduce loops through the array and accumulates the entries generated in acc
export const keywordDictionary = allEntries.reduce((acc, entry) => {
    acc[entry.name] = {
        description: entry.description,
        type: entry.type,
    };
    return acc;
}, {});

// Sort by length for the correct parsing
export const sortedKeywordList = Object.keys(keywordDictionary).sort(
    (a, b) => b.length - a.length,
);

export function spawnTooltip(e, handleSetTooltip, itemKey) {
    // Mouse wheel opens tooltip
    if (e.button === 1) {
        e.preventDefault(); // Prevents the browser's auto-scroll icon from popping up
        console.log(itemKey);
        const entry = DESCRIPTIONS[itemKey];
        if (itemKey && entry) {
            handleSetTooltip({
                keyword: entry.name,
                type: entry.type,
                description: entry.description,
                x: e.clientX,
                y: e.clientY - 30,
            });
        } else {
            console.log(`Entry [${itemKey}] not found.`)
        }
    }
}
