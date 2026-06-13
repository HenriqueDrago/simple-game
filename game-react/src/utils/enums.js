export const turnStatus = Object.freeze({
    SETUP: 0,
    PLAYER_ONE_TURN: 1,
    PLAYER_TWO_TURN: 2,
    UPKEEP_PLAYER_ONE: 3,
    UPKEEP_PLAYER_TWO: 4,
    VICTORY: 5,
    DEFEAT: 6,
    DRAW: 7,
    TRANSITION: 8,
});

export const entityKeys = Object.freeze({
    PLAYER_ONE: "p1",
    PLAYER_TWO: "p2",
});

export const aiKeys = Object.freeze({
    HUMAN: "human",
    SIMPLE: "simple",
    BLOODKNIGHT: "bloodknight",
    WARLOCK: "warlock",
    PALADIN: "paladin",
    HEXER: "hexer",
    SHADOW_SORCERER: "shadowSorcerer",
    ADAPTATIVE: "adaptative",
});

export const sdmKeys = Object.freeze({
    RANDOM: "random",
    CUSTOM: "custom",
    BEST: "best",
});

export const elementalKeys = Object.freeze({
    INACTIVE: 0,
    NATURE: 1,
    FROST: 2,
    SCORCH: 3,
});
