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
})

export const aiKeys = Object.freeze({
    HUMAN: 0,
    SIMPLE: 1,
    BLOODKNIGHT: 2,
    WARLOCK: 3,
    PALADIN: 4,
    HEXER: 5,
    SHADOW_SORCERER: 6,
    ADAPTATIVE: 7
})