import { DESCRIPTIONS } from "./descriptions.js";

// Combine all entries values (as an array without their keys)
const allEntries = [...Object.entries(DESCRIPTIONS)];

// Generate a dict with the names as keys
// reduce loops through the array and accumulates the entries generated in acc
export const keywordDictionary = allEntries.reduce((acc, entry) => {
    acc[entry[1].name] = {
        description: entry[1].description,
        type: entry[1].type,
        originalKey: entry[0],
    };
    return acc;
}, {});

// Sort by length for the correct parsing
export const sortedKeywordList = Object.keys(keywordDictionary).sort(
    (a, b) => b.length - a.length,
);
