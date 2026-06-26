import { DESCRIPTIONS } from "./descriptions.js";

// Combine all entries values (as an array without their keys)
const allEntries = [
    ...Object.values(DESCRIPTIONS)
];

// Generate a dict with the names as keys
// reduce loops through the array and accumulates the entries generated in acc
export const keywordDictionary = allEntries.reduce((acc, entry) => {
    acc[entry.name] = {
        description: entry.description,
        type: entry.type 
    };
    return acc;
}, {});

// Sort by length to help with the parsing
export const sortedKeywordList = Object.keys(keywordDictionary).sort(
    (a, b) => b.length - a.length
);