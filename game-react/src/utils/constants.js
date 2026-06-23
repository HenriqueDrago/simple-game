import {
    simpleAI,
    bloodknightAI,
    paladinAI,
    hexerAI,
    warlockAI,
    shadowSorcererAI,
    cyborgAI,
    maestroAI,
    elementalistAI,
} from "./aiControllers.js";

import { aiKeys, actionKeys, effectKeys } from "./enums.js";

const INITIAL_POINTS_AVAILABLE = 10;

const ATTRIBUTE_NAMES = ["str", "def"];
const BASE_STATS = {
    str: 0,
    def: 0,
    hp: 20,
    mana: 10,
};
const STAT_MULTIPLIERS = {
    str: 1,
    def: 1,
};

const STANDARD_DR_INCREASE = 0.5;
const STANDARD_DEF_EFFECT_INCREASE = 1.5;
const GUARD_MANA_REGEN = 0.3;

const SP_ATTACK_COST = 6;

const MANA_BLEED_MULT = 0.5;
const BLOOD_SACRIFICE_MULT = 1.0;

const ARRAY_DURATION = 3;
const MANA_SHACKLE_TURN_GAIN = 4;

const MAX_OVERHEAT = 10;
const VENTING_OVERHEAT_LOSS = 5;

const HALO_GEN_MULT = 2;

const ELEMENTAL_RESOURCE_GAIN = 5;
const INITIAL_ELEMENTAL_ESSENCE_GAINED = 3;

const SAC_HP_CONSUMPTION = 0.5;

const SHADOW_PACT_BURN = 5;

const RADIANT_DEF_EFFECT_MULTIPLIER = 0;

const STARTING_SONORORITY = 0;
const SONORITY_LOWER_LIMIT = -5;
const SONORITY_HIGHER_LIMIT = 5;

const MAX_ENLIT = 100;
const MAX_INSIGHT = 100;
const MAX_TARNISHED_SIN = 100;

const INSIGHT_TO_REV_FACTOR = 10;

const NATURE_PASSIVE_MULT = 1.5;
const FROST_PASSIVE_MULT = 0.5;
const SCORCH_PASSIVE_MULT = 1.5;

const FLAMES_ABSORPTION_MULTIPLIER = 1;
const BENEDICTION_GEN = 2;

const DISTRIBUTION_MODES = [
    "Random",
    "Randomize Enemy",
    "Randomize Player",
    "Custom",
];

const freeResources = [
    effectKeys.SHADOWFLAME,
    effectKeys.UNRELENTING_SHADOWS,
    effectKeys.LINGERING_EMBER,
    effectKeys.CINDERS,
    effectKeys.POISON,
    effectKeys.MANA_OVERFLOW,
    effectKeys.SHACKLED_MANA,
    effectKeys.CRYOGENESIS,
    effectKeys.HALO,
    effectKeys.BENEDICTION,
    effectKeys.RADIANCE,
    effectKeys.BLOOD_SACRIFICE,
    effectKeys.SACRED_FLAMES,
];

const limitedResources = [
    "currOverheat",
    "currMana",
    "currHp",
    "currTarnishedSin",
    "currInsight",
    "currEnlit",
];

export const constants = {
    INITIAL_POINTS_AVAILABLE,
    ATTRIBUTE_NAMES,
    BASE_STATS,
    STAT_MULTIPLIERS,
    SP_ATTACK_COST,
    MANA_BLEED_MULT,
    BLOOD_SACRIFICE_MULT,
    ARRAY_DURATION,
    MANA_SHACKLE_TURN_GAIN,
    MAX_OVERHEAT,
    DISTRIBUTION_MODES,
    STANDARD_DR_INCREASE,
    STANDARD_DEF_EFFECT_INCREASE,
    GUARD_MANA_REGEN,
    freeResources,
    HALO_GEN_MULT,
    ELEMENTAL_RESOURCE_GAIN,
    INITIAL_ELEMENTAL_ESSENCE_GAINED,
    SAC_HP_CONSUMPTION,
    limitedResources,
    SHADOW_PACT_BURN,
    RADIANT_DEF_EFFECT_MULTIPLIER,
    STARTING_SONORORITY,
    SONORITY_LOWER_LIMIT,
    SONORITY_HIGHER_LIMIT,
    VENTING_OVERHEAT_LOSS,
    MAX_ENLIT,
    INSIGHT_TO_REV_FACTOR,
    SCORCH_PASSIVE_MULT,
    FROST_PASSIVE_MULT,
    NATURE_PASSIVE_MULT,
    BENEDICTION_GEN,
    FLAMES_ABSORPTION_MULTIPLIER,
    MAX_INSIGHT,
    MAX_TARNISHED_SIN,
};

export const presetAi = {
    [aiKeys.HUMAN]: {
        name: "Human (No AI)",
        best: {
            str: 5,
            def: 5,
        },
        caller: simpleAI,
    },
    [aiKeys.SIMPLE]: {
        name: "Mundane",
        best: {
            str: 6,
            def: 4,
        },
        caller: simpleAI,
    },
    [aiKeys.WARLOCK]: {
        name: "Warlock",
        best: {
            str: 10,
            def: 0,
        },
        caller: warlockAI,
    },
    [aiKeys.BLOODKNIGHT]: {
        name: "Bloodknight",
        best: {
            str: 7,
            def: 3,
        },
        caller: bloodknightAI,
    },
    [aiKeys.HEXER]: {
        name: "Hexer",
        best: {
            str: 4,
            def: 6,
        },
        caller: hexerAI,
    },
    [aiKeys.CYBORG]: {
        name: "Cyborg",
        best: {
            str: 0,
            def: 10,
        },
        caller: cyborgAI,
    },
    [aiKeys.ELEMENTALIST]: {
        name: "Elementalist",
        best: {
            str: 5,
            def: 5,
        },
        caller: elementalistAI,
    },
    [aiKeys.SHADOW_SORCERER]: {
        name: "Shadow Sorcerer",
        best: {
            str: 0,
            def: 10,
        },
        caller: shadowSorcererAI,
    },
    [aiKeys.MAESTRO]: {
        name: "Maestro",
        best: {
            str: 0,
            def: 10,
        },
        caller: maestroAI,
    },
    [aiKeys.PALADIN]: {
        name: "Paladin",
        best: {
            str: 0,
            def: 10,
        },
        caller: paladinAI,
    },
};

const offensiveActions = [
    actionKeys.ATTACK,
    actionKeys.SPECIAL_ATTACK,
    actionKeys.LASER,
    actionKeys.MELTDOWN,
    actionKeys.SACRIFICE,
];

const defensiveActions = [actionKeys.HEAL, actionKeys.GUARD, actionKeys.AEGIS];

const transformativeActions = [
    actionKeys.ARRAY,
    actionKeys.SHADOW_PACT,
    actionKeys.DARK_PROMISE,
    actionKeys.WHEEL,
    actionKeys.ATTUNE,
    actionKeys.DA_CAPO,
    actionKeys.DEPLOY,
    actionKeys.CURSE,
    actionKeys.RITUAL_OF_ASH,
    actionKeys.SOUND_OF_SILENCE,
    actionKeys.BABEL,
    actionKeys.SHADOW_MANTLE,
    actionKeys.BLACK_MAYHEM,
    actionKeys.ALIGN,
    actionKeys.HALT,
];

export const actionsClass = {
    offensiveActions,
    defensiveActions,
    transformativeActions,
};

export const stackCounters = [
    [
        "Blood Sacrifice",
        effectKeys.BLOOD_SACRIFICE,
        "#ff3333",
        "rgba(255, 51, 51, 0.15)",
    ],
    ["Poison", effectKeys.POISON, "#00e676", "rgba(0, 230, 118, 0.15)"],
    [
        "Cryogenesis",
        effectKeys.CRYOGENESIS,
        "#00e5ff",
        "rgba(0, 229, 255, 0.15)",
    ],
    [
        "Shackled Mana",
        effectKeys.SHACKLED_MANA,
        "#2979ff",
        "rgba(41, 121, 255, 0.15)",
    ],

    // Shadowflame
    [
        "Shadowflame",
        effectKeys.SHADOWFLAME,
        "#d500f9",
        "rgba(213, 0, 249, 0.15)",
    ],
    [
        "Unrelenting Shadows",
        effectKeys.UNRELENTING_SHADOWS,
        "#651fff",
        "rgba(101, 31, 255, 0.15)",
    ],
    [
        "Lingering Ember",
        effectKeys.LINGERING_EMBER,
        "#f50057",
        "rgba(245, 0, 87, 0.15)",
    ],
    ["Cinders", effectKeys.CINDERS, "#9e9e9e", "rgba(158, 158, 158, 0.15)"],

    // Holy Effects
    ["Radiance", effectKeys.RADIANCE, "#ffea00", "rgba(255, 234, 0, 0.15)"],
    ["Halo", effectKeys.HALO, "#fff59d", "rgba(255, 245, 157, 0.15)"],
    [
        "Sacred Flames",
        effectKeys.SACRED_FLAMES,
        "#ffb300",
        "rgba(255, 179, 0, 0.15)",
    ],
    [
        "Benediction",
        effectKeys.BENEDICTION,
        "#80d8ff",
        "rgba(128, 216, 255, 0.15)",
    ],
];
