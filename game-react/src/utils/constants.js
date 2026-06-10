import {
    simpleAI,
    bloodknightAI,
    paladinAI,
    hexerAI,
    warlockAI,
    adaptativeAI,
    shadowSorcererAI,
} from "./aiControllers.js";

import { aiKeys } from "./enums.js";

const INITIAL_POINTS_AVAILABLE = 10;

const ATTRIBUTE_NAMES = ["str", "def"];
const BASE_STATS = {
    str: 0,
    def: 0,
    hp: 15,
    mana: 10,
};
const STAT_MULTIPLIERS = {
    str: 1,
    def: 1,
};

const ALTERNATE_DR = 0.5;
const ALTERNATE_DEF_EFFECTIVENESS = 1.5;
const GUARD_MANA_REGEN = 0.3;

const SP_ATTACK_COST = 6;

const MANA_BLEED_MULT = 0.5;
const BLOOD_SACRIFICE_MULT = 1.0;

const ARRAY_DURATION = 3;
const MANA_SHACKLE_TURN_GAIN = 3;

const MAX_OVERHEAT = 5;
const OVERHEAT_ACTION_COOLING = 3;

const DISTRIBUTION_MODES = [
    "Random",
    "Randomize Enemy",
    "Randomize Player",
    "Custom",
];

const resources = [
    "shadowflame",
    "lingeringEmber",
    "cinders",
    "poison",
    "manaOverflow",
    "shackledMana",
    "overheat",
    "bloodSacrifice",
    "radiance",
    "currMana",
    "currHp",
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
    OVERHEAT_ACTION_COOLING,
    DISTRIBUTION_MODES,
    ALTERNATE_DR,
    ALTERNATE_DEF_EFFECTIVENESS,
    GUARD_MANA_REGEN,
    resources,
};

export const presetAi = {
    [aiKeys.HUMAN]: {
        name: "Human",
        best: {
            str: 5,
            def: 5,
        },
        caller: simpleAI, 
    },
    [aiKeys.SIMPLE]: {
        name: "Simple",
        best: {
            str: 6,
            def: 4,
        },
        caller: simpleAI,
    },
    [aiKeys.BLOODKNIGHT]: {
        name: "Bloodknight",
        best: {
            str: 7,
            def: 3,
        },
        caller: bloodknightAI,
    },
    [aiKeys.WARLOCK]: {
        name: "Warlock",
        best: {
            str: 5,
            def: 5,
        },
        caller: warlockAI,
    },
    [aiKeys.PALADIN]: {
        name: "Paladin",
        best: {
            str: 0,
            def: 10,
        },
        caller: paladinAI,
    },
    [aiKeys.HEXER]: {
        name: "Hexer",
        best: {
            str: 0,
            def: 10,
        },
        caller: hexerAI,
    },
    [aiKeys.SHADOW_SORCERER]: {
        name: "Shadow Sorcerer",
        best: {
            str: 0,
            def: 10,
        },
        caller: shadowSorcererAI,
    },
    [aiKeys.ADAPTATIVE]: {
        name: "Adaptative",
        best: {
            str: 4,
            def: 6,
        },
        caller: adaptativeAI,
    },
};