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

export const whoStartsKeys = Object.freeze({
    RANDOM: 0,
    PLAYER_ONE: 1,
    PLAYER_TWO: 2,
});

export const actionKeys = Object.freeze({
    ATTACK: "attack",
    HEAL: "heal",
    GUARD: "guard",
    SPECIAL_ATTACK: "spAtk",
    SACRIFICE: "sacrifice",
    ARRAY: "array",
    CURSE: "curse",
    AEGIS: "aegis",
    SHADOW_PACT: "shadowPact",
    BLACK_MAYHEM: "blackMayhem",
    SHADOW_MANTLE: "shadowMantle",
    RITUAL_OF_ASH: "ritualOfAsh",
    DARK_PROMISE: "darkPromise",
    WHEEL: "wheel",
    ATTUNE: "attune",
    DA_CAPO: "daCapo",
    SOUND_OF_SILENCE: "soundOfSilence",
    DEPLOY: "deploy",
    LASER: "laser",
    MELTDOWN: "meltdown",
});

export const effectKeys = Object.freeze({
    GUARDING_STATE: "guardingState",
    MANA_IMBALANCE: "manaImbalance",
    MANA_OVERFLOW: "manaOverflow",
    SACRIFICIAL_STATE: "sacrificialState",
    MANA_BLEED: "manaBleed",
    THORNED_SHACKLES: "thornedShackles",
    SHACKLED_MANA: "shackledMana",
    POISON: "poison",
    RADIANCE: "radiance",
    RESOURCES: "resources",
    UMBRAL_CORE: "umbralCore",
    SHADOWFLAME: "shadowflame",
    DARK_EMBRACE: "darkEmbrace",
    LINGERING_EMBER: "lingeringEmber",
    DIMMING_DARKNESS: "dimmingDarkness",
    CINDERS: "cinders",
    RADIANT: "radiant",
    BLOOD_SACRIFICE: "bloodSacrifice",
    UNRELENTING_SHADOWS: "unrelentingShadows",
    FADING_LIGHT: "fadingLight",
    ELEMENTAL_WHEEL: "elementalWheel",
    FROST: "frost",
    NATURE: "nature",
    SCORCH: "scorch",
    PERMAFROST: "permafrost",
    OVERGROWTH: "overgrowth",
    SCORIA: "scoria",
    SONORITY: "sonority",
    HARMONY: "harmony",
    DISSONANCE: "dissonance",
    HARMONIOUS: "harmonious",
    DISSONANT: "dissonant",
});