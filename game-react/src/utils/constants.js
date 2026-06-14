import {
    simpleAI,
    bloodknightAI,
    paladinAI,
    hexerAI,
    warlockAI,
    shadowSorcererAI,
} from "./aiControllers.js";

import { aiKeys, actionKeys, effectKeys } from "./enums.js";

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

const STANDARD_DR_INCREASE = 0.5;
const STANDARD_DEF_EFFECT_INCREASE = 1.5;
const GUARD_MANA_REGEN = 0.3;

const SP_ATTACK_COST = 6;

const MANA_BLEED_MULT = 0.5;
const BLOOD_SACRIFICE_MULT = 1.0;

const ARRAY_DURATION = 2;
const MANA_SHACKLE_TURN_GAIN = 3;

const MAX_OVERHEAT = 10;
const VENTING_OVERHEAT_LOSS = 5;

const HALO_GEN_MULT = 1;

const ELEMENTAL_RESOURCE_GAIN = 5;
const SCORCH_DMG = 3;

const SAC_HP_CONSUMPTION = 0.5;

const SHADOW_PACT_BURN = 5;

const RADIANT_DEF_EFFECT_MULTIPLIER = 0;

const NATURE_MANA_REGEN = 3;
const NATURE_HP_REGEN = 2;

const STARTING_SONORORITY = 0;
const SONORITY_LOWER_LIMIT = -5;
const SONORITY_HIGHER_LIMIT = 5;

const DIVINITY_DR = 0.01;

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
    effectKeys.BLOOD_SACRIFICE,
    effectKeys.DIVINITY,
    effectKeys.HALO,
    effectKeys.RADIANCE
];

const limitedResources = ["currOverheat", "currMana", "currHp"];

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
    SCORCH_DMG,
    SAC_HP_CONSUMPTION,
    limitedResources,
    SHADOW_PACT_BURN,
    RADIANT_DEF_EFFECT_MULTIPLIER,
    NATURE_HP_REGEN,
    NATURE_MANA_REGEN,
    STARTING_SONORORITY,
    SONORITY_LOWER_LIMIT,
    SONORITY_HIGHER_LIMIT,
    DIVINITY_DR,
    VENTING_OVERHEAT_LOSS,
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
            str: 10,
            def: 0,
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
];

export const actionsClass = {
    offensiveActions,
    defensiveActions,
    transformativeActions,
};
