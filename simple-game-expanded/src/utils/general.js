// Roman numerals helper
export function toRoman(num) {
    if (!num || num <= 0) {
        return "∅";
    }

    const matrix = [
        ["M", 1000],
        ["CM", 900],
        ["D", 500],
        ["CD", 400],
        ["C", 100],
        ["XC", 90],
        ["L", 50],
        ["XL", 40],
        ["X", 10],
        ["IX", 9],
        ["V", 5],
        ["IV", 4],
        ["I", 1],
    ];

    let roman = "";
    for (const [letter, value] of matrix) {
        while (num >= value) {
            roman += letter;
            num -= value;
        }
    }
    return roman;
}

export function roundNumber(num, houses) {
    const divider = Math.pow(10, Math.max(0, houses));

    return (
        (num >= 0 ? Math.floor(num * divider) : Math.ceil(num * divider)) /
        divider
    );
}
