import {
    simpleAI,
    bloodknightAI,
    paladinAI,
    warlockAI,
    shadowSorcererAI,
    cyborgAI,
    maestroAI,
    starfarerAI,
    lunaticAI,
    augurAI,
} from "./aiControllers.js";
import {
    AUGUR_DESCRIPTIONS,
    BLOODKNIGHT_DESCRIPTIONS,
    CYBORG_DESCRIPTIONS,
    GENERAL_DESCRIPTIONS,
    LUNATIC_DESCRIPTIONS,
    MAESTRO_DESCRIPTIONS,
    BASIC_DESCRIPTIONS,
    PALADIN_DESCRIPTIONS,
    SHADOW_SORCERER_DESCRIPTIONS,
    STARFARER_DESCRIPTIONS,
    WARLOCK_DESCRIPTIONS,
    SERAPH_DESCRIPTIONS,
} from "./descriptions.js";
import { createBaseEntity, distributePoints } from "./entities.js";

import {
    aiKeys,
    actionKeys,
    effectKeys,
    starfallPhases,
    turnStatus,
    whoStartsKeys,
    progKeys,
    sdmKeys,
    entityKeys,
    entryTypes,
    roundPhases,
    elementalKeys,
    moonKeys,
} from "./enums.js";

export const ATTRIBUTE_NAMES = [effectKeys.STR, effectKeys.DEF];

export const constants = Object.freeze({
    IRRAD_DMG_EXCESS: 5,
    MAX_IRRADIATION: 100,
    IRRADIATION_GAIN_RATE: 5,
    BAD_OMEN_EXCESS_CONVERT_RATE: 10,
    PREMONITION_EXCESS_CONVERT_RATE: 10,
    BASE_HEALTH: 20,
    BASE_MANA: 10,
    SPARK_RESTORE_RATE: 2,
    ACC_STARBLIGHT_CONVERSION: 5,
    URD_STR_PAIN: 2,
    CHALK_EXTRA_DMG: 10,
    PRECOG_GAIN_RATE: 10,
    PROPHECY_GAIN_RATE: 10,
    MAX_PREMONITION: 100,
    SKULD_PREMONITION_GAIN: 20,
    PREMONITION_TURN_END_LOSS: 20,
    BAD_OMEN_TURN_END_LOSS: 20,
    CURSE_EMPTY_RUNE_DMG: 5,
    SKULD_MANA_REGEN: 0.3,
    SKULD_WEAK: 0.3,
    PAST_MEMORIES_GAIN_RATE: 5,
    URD_DEF_REC: 3,
    RECOLLECTION_LOSE: 20,
    SKULD_PRECOGNITION_GAIN: 0.3,
    MAX_RECOLLECTION: 100,
    URD_HEALTH_REGEN: 0.3,
    VERDANDI_OMEN_GAIN: 20,
    MAX_BAD_OMEN: 100,
    DIVINE_SPARK_STR_CONVERSION: 5,
    GRAVITATION_GAIN: 5,
    MAX_GRAVITATION: 100,
    MAX_ACCRETION: 100,
    SONORITY_ON_DEFENSE: 5,
    SONORITY_ON_OFFENSE: -5,
    WITHER_LUNACY_MULT: 1,
    LUNAR_TIDE_MULT: 2,
    MAX_LUNACY: 100,
    GIBBOUS_TEARS_GAIN: 1,
    LUNAR_VEIL_TEARS_GAIN: 1,
    INITIAL_POINTS_AVAILABLE: 10,
    SP_ATTACK_COST: 0.6,
    MANA_BLEED_MULT: 0.5,
    BLOOD_SACRIFICE_MULT: 1.0,
    ARRAY_DURATION: 3,
    MANA_SHACKLE_TURN_GAIN: 5,
    MAX_OVERHEAT: 100,
    STANDARD_DR_INCREASE: 0.5,
    STANDARD_DEF_EFFECT_INCREASE: 1.5,
    GUARD_MANA_REGEN: 0.3,
    HALO_GEN_MULT: 2,
    SAC_HP_CONSUMPTION: 0.5,
    SHADOW_PACT_BURN: 5,
    RADIANT_DEF_EFFECT_MULTIPLIER: 0,
    STARTING_SONORITY: 0,
    SONORITY_LOWER_LIMIT: -50,
    SONORITY_HIGHER_LIMIT: 50,
    VENTING_OVERHEAT_LOSS: 50,
    CHART_STAR_GAIN: 3,
    STARDUST_RATE_CONVERSION: 3,
    MAX_DIVINE_SPARK: 100,
    NATURAL_OVERHEAT_LOSS: 30,
    MAX_DYNAMO: 100,
    STARTING_ENERGY: 1,
    RESOURCES_CINDERS_MULT: 1,
    ALBEDO_ML_GAIN: 2,
    MIRROR_ML_GAIN: 3,
    BLOOD_CORONA_ML_GAIN: 1,
    LUNAR_GROWTH_MULT: 1,
    HIDDEN_MOON_ML_GAIN: 3,
    SMITE_MULT: 5,
});

export const MITIGATION_RESOURCES = [
    effectKeys.STARLIT_DOME,
    effectKeys.DOME,
    effectKeys.HALO,
    effectKeys.REFRACTED_DIVINITY,
    effectKeys.CONJECTURE,
    effectKeys.FUNERARY_URN,
    effectKeys.LINGERING_EMBER,
    effectKeys.MYCELIUM,
    effectKeys.HARMONY,
];

export const FREE_RESOURCES = [
    effectKeys.SHADOWFLAME,
    effectKeys.UNRELENTING_SHADOWS,
    effectKeys.CINDERS,
    effectKeys.DISSONANCE,
    effectKeys.PRECOGNITION,
    effectKeys.PROPHECY_OF_DOOM,
    effectKeys.BLOOD_SACRIFICE,
    effectKeys.STARDUST,
    effectKeys.MOONSHINE,
    effectKeys.RADIANCE,
];

export const presetAi = {
    [aiKeys.HUMAN]: {
        name: "Human (No AI)",
        best: {
            str: 5,
            def: 5,
        },
        caller: simpleAI,
        desc: [...Object.keys(GENERAL_DESCRIPTIONS)],
    },
    [aiKeys.SIMPLE]: {
        name: "Mundane",
        best: {
            str: 5,
            def: 5,
        },
        caller: simpleAI,
        desc: [...Object.keys(BASIC_DESCRIPTIONS)],
    },
    [aiKeys.WARLOCK]: {
        name: "Warlock",
        best: {
            str: 5,
            def: 5,
        },
        caller: warlockAI,
        desc: [...Object.keys(WARLOCK_DESCRIPTIONS)],
    },
    [aiKeys.BLOODKNIGHT]: {
        name: "Bloodknight",
        best: {
            str: 5,
            def: 5,
        },
        caller: bloodknightAI,
        desc: [...Object.keys(BLOODKNIGHT_DESCRIPTIONS)],
    },
    [aiKeys.PALADIN]: {
        name: "Paladin",
        best: {
            str: 0,
            def: 10,
        },
        caller: paladinAI,
        desc: [...Object.keys(PALADIN_DESCRIPTIONS)],
    },
    [aiKeys.SHADOW_SORCERER]: {
        name: "Shadow Sorcerer",
        best: {
            str: 0,
            def: 10,
        },
        caller: shadowSorcererAI,
        desc: [...Object.keys(SHADOW_SORCERER_DESCRIPTIONS)],
    },
    [aiKeys.CYBORG]: {
        name: "Cyborg",
        best: {
            str: 0,
            def: 10,
        },
        caller: cyborgAI,
        desc: [...Object.keys(CYBORG_DESCRIPTIONS)],
    },
    [aiKeys.MAESTRO]: {
        name: "Maestro",
        best: {
            str: 0,
            def: 10,
        },
        caller: maestroAI,
        desc: [...Object.keys(MAESTRO_DESCRIPTIONS)],
    },
    [aiKeys.AUGUR]: {
        name: "Augur (Missing AI)",
        best: {
            str: 10,
            def: 0,
        },
        caller: augurAI,
        desc: [...Object.keys(AUGUR_DESCRIPTIONS)],
    },
    [aiKeys.STARFARER]: {
        name: "Starfarer",
        best: {
            str: 0,
            def: 10,
        },
        caller: starfarerAI,
        desc: [...Object.keys(STARFARER_DESCRIPTIONS)],
    },
    [aiKeys.LUNATIC]: {
        name: "Lunatic",
        best: {
            str: 0,
            def: 10,
        },
        caller: lunaticAI,
        desc: [...Object.keys(LUNATIC_DESCRIPTIONS)],
    },
    [aiKeys.SERAPH]: {
        name: "Seraph (Unimplemented)",
        best: {
            str: 0,
            def: 10,
        },
        caller: simpleAI,
        desc: [...Object.keys(SERAPH_DESCRIPTIONS)],
    },
};

const offensiveActions = [
    actionKeys.ATTACK,
    actionKeys.SPECIAL_ATTACK,
    actionKeys.SACRIFICE,
    actionKeys.LASER,
    actionKeys.MELTDOWN,

    actionKeys.LUNAR_STRIKE,
    actionKeys.LUNAR_SMITE,
    actionKeys.LUNAR_SHED,
    actionKeys.CHALK,
];

const defensiveActions = [
    actionKeys.HEAL,
    actionKeys.GUARD,
    actionKeys.AEGIS,

    actionKeys.LUNAR_GROWTH,
    actionKeys.LUNAR_SHROUD,
    actionKeys.LUNAR_TIDE,
];

const transformativeActions = [
    actionKeys.DEPLOY,

    actionKeys.ATTUNE,
    actionKeys.DA_CAPO,
    actionKeys.SOUND_OF_SILENCE,
    actionKeys.BABEL,

    actionKeys.SHADOW_PACT,
    actionKeys.BLACK_MAYHEM,
    actionKeys.SHADOW_MANTLE,
    actionKeys.RITUAL_OF_ASH,
    actionKeys.DARK_PROMISE,

    actionKeys.CHART,
    actionKeys.REFRACT,
    actionKeys.MIRROR,
    actionKeys.SHATTER,
];

export const actionsClass = {
    offensiveActions,
    defensiveActions,
    transformativeActions,
};

export const coloredStars = [
    {
        name: "red",
        color: "#ff5a5f",
        star: effectKeys.RED_STAR,
        starPhase: starfallPhases.RED_STAR,
    },
    {
        name: "orange",
        color: "#ffb347",
        star: effectKeys.ORANGE_STAR,
        starPhase: starfallPhases.ORANGE_STAR,
    },
    {
        name: "yellow",
        color: "#fff275",
        star: effectKeys.YELLOW_STAR,
        starPhase: starfallPhases.YELLOW_STAR,
    },
    {
        name: "green",
        color: "#7dff8a",
        star: effectKeys.GREEN_STAR,
        starPhase: starfallPhases.GREEN_STAR,
    },
    {
        name: "blue",
        color: "#6ec6ff",
        star: effectKeys.BLUE_STAR,
        starPhase: starfallPhases.BLUE_STAR,
    },
    {
        name: "indigo",
        color: "#8b7dff",
        star: effectKeys.INDIGO_STAR,
        starPhase: starfallPhases.INDIGO_STAR,
    },
    {
        name: "violet",
        color: "#d291ff",
        star: effectKeys.VIOLET_STAR,
        starPhase: starfallPhases.VIOLET_STAR,
    },
];

export const INITIAL_GAME_STATE = {
    // turn logic
    status: turnStatus.SETUP,
    nextStatus: null,
    lastPlayerTurn: null,
    roundCount: 0,
    starQueue: null,
    playerQueue: null,
    roundQueue: null,
    roundIndex: 0,
    history: [],

    // other
    whoStarts: whoStartsKeys.PLAYER_ONE,
    startingPlayer: entityKeys.PLAYER_ONE,
    progressMode: false,
    simGame: null,
    paused: false,

    progressStatus: {
        [aiKeys.HUMAN]: progKeys.ALWAYS_OPEN,
        [aiKeys.SIMPLE]: progKeys.OPEN_UNDEFEATED,
        [aiKeys.WARLOCK]: progKeys.LOCKED,
        [aiKeys.BLOODKNIGHT]: progKeys.LOCKED,
        [aiKeys.AUGUR]: progKeys.LOCKED,
        [aiKeys.CYBORG]: progKeys.LOCKED,
        [aiKeys.MAESTRO]: progKeys.LOCKED,
        [aiKeys.LUNATIC]: progKeys.LOCKED,
        [aiKeys.STARFARER]: progKeys.LOCKED,
        [aiKeys.SHADOW_SORCERER]: progKeys.LOCKED,
        [aiKeys.PALADIN]: progKeys.LOCKED,
        [aiKeys.SERAPH]: progKeys.LOCKED,
    },
    entities: {
        [entityKeys.PLAYER_ONE]: {
            ...distributePoints(
                createBaseEntity(),
                sdmKeys.CUSTOM,
                presetAi[aiKeys.HUMAN].best,
                true,
            ),
            controller: aiKeys.HUMAN,
            statDistributionMode: sdmKeys.CUSTOM,
        },
        [entityKeys.PLAYER_TWO]: {
            ...distributePoints(
                createBaseEntity(),
                sdmKeys.CUSTOM,
                presetAi[aiKeys.SIMPLE].best,
                true,
            ),
            controller: aiKeys.SIMPLE,
            statDistributionMode: sdmKeys.CUSTOM,
        },
    },
};

export const CHECKPOINT_STATES = [
    turnStatus.SETUP,
    turnStatus.VICTORY,
    turnStatus.DEFEAT,
    turnStatus.DRAW,
    turnStatus.ROUND_TRANSITION,
];

export const roundPhasesMap = {
    [roundPhases.ROUND_START]: {
        descKey: roundPhases.ROUND_START,
        name: "Round Start",
    },
    [roundPhases.PLAYER_ONE_TURN]: {
        descKey: effectKeys.TURN,
        name: "Player One Turn",
    },
    [roundPhases.PLAYER_TWO_TURN]: {
        descKey: effectKeys.TURN,
        name: "Player Two Turn",
    },
    [roundPhases.P1_STARS_TURN]: {
        descKey: effectKeys.STARFALL,
        name: "Player One Starfall",
    },
    [roundPhases.MOON_TURN]: {
        descKey: effectKeys.MOON_PHASE,
        name: "Moon Phase",
    },
    [roundPhases.P2_STARS_TURN]: {
        descKey: effectKeys.STARFALL,
        name: "Player Two Starfall",
    },

    [roundPhases.ROUND_END]: {
        descKey: roundPhases.ROUND_END,
        name: "Round End",
    },
    [roundPhases.P1_SINGULARITY]: {
        descKey: effectKeys.SINGULARITY,
        name: "Player One Singularity",
    },
    [roundPhases.P2_SINGULARITY]: {
        descKey: effectKeys.SINGULARITY,
        name: "Player Two Singularity",
    },
};

export const elementsMap = {
    [elementalKeys.ALBEDO]: "ALBEDO",

    [elementalKeys.NATURE]: "NATURE",
    [elementalKeys.FROST]: "FROST",
    [elementalKeys.SCORCH]: "SCORCH",

    [elementalKeys.OCEAN]: "OCEAN",
    [elementalKeys.WITHER]: "WITHER",
    [elementalKeys.ASH]: "ASH",

    [elementalKeys.SHATTERED]: "SHATTERED",

    [elementalKeys.DULLED]: "DULLED",
};

export const moonMap = {
    [moonKeys.HIDDEN]: "HIDDEN",

    [moonKeys.WAXING]: "WAXING",
    [moonKeys.BLOODSTAINED]: "BLOODSTAINED",

    [moonKeys.WANING]: "WANING",
    [moonKeys.CORONAL]: "CORONAL",
};

export const entryTypesMap = {
    [entryTypes.ACTION]: "ACTION",
    [entryTypes.STATE]: "STATE",
    [entryTypes.DAMAGE_TYPE]: "DAMAGE TYPE",
    [entryTypes.FIELD_EFFECT]: "FIELD EFFECT",
    [entryTypes.MECHANIC]: "MECHANIC",
    [entryTypes.ATTRIBUTES]: "ATTRIBUTES",
    [entryTypes.BASE_ATTRIBUTES]: "BASE ATTRIBUTES",
    [entryTypes.SPECIAL_ATTRIBUTES]: "SPECIAL ATTRIBUTES",
    [entryTypes.MITIGATION_RESOURCE]: "MITIGATION RESOURCE",
    [entryTypes.FREE_RESOURCE]: "FREE RESOURCE",
    [entryTypes.LIMITED_RESOURCE]: "LIMITED RESOURCE",
    [entryTypes.CATEGORY]: "CATEGORY",
    [entryTypes.BATTLE_PHASE]: "BATTLE PHASE",
    [entryTypes.FIXED_RESOURCE]: "FIXED RESOURCE",
    [entryTypes.STAR]: "STAR",
    [entryTypes.RANKED_RESOURCE]: "RANKED RESOURCE",
    [entryTypes.OVERFLOWN_RESOURCE]: "OVERFLOWN RESOURCE",
    [entryTypes.DAMAGE_MODIFIERS]: "DAMAGE MODIFIER",
    [entryTypes.OFFENSIVE_ACTION]: "OFFENSIVE ACTION",
    [entryTypes.DEFENSIVE_ACTION]: "DEFENSIVE ACTION",
    [entryTypes.TRANSFORMATIVE_ACTION]: "TRANSFORMATIVE ACTION",
    [entryTypes.RUNES]: "RUNE",
    [entryTypes.CONTROLLER]: "CONTROLLER",
};

export const actionMap = {
    [actionKeys.ATTACK]: { name: "Attack", specialClass: "" },
    [actionKeys.HEAL]: { name: "Heal", specialClass: "action-verdandi" },
    [actionKeys.GUARD]: { name: "Guard", specialClass: "action-urd" },
    [actionKeys.SPECIAL_ATTACK]: {
        name: "Special Attack",
        specialClass: "action-skuld",
    },
    [actionKeys.SACRIFICE]: { name: "Sacrifice", specialClass: "" },
    [actionKeys.AEGIS]: { name: "Aegis", specialClass: "" },
    [actionKeys.SHADOW_PACT]: { name: "Shadow Pact", specialClass: "" },
    [actionKeys.BLACK_MAYHEM]: { name: "Black Mayhem", specialClass: "" },
    [actionKeys.SHADOW_MANTLE]: { name: "Shadow Mantle", specialClass: "" },
    [actionKeys.RITUAL_OF_ASH]: { name: "Ritual of Ash", specialClass: "" },
    [actionKeys.DARK_PROMISE]: { name: "Dark Promise", specialClass: "" },
    [actionKeys.ATTUNE]: { name: "Attune", specialClass: "" },
    [actionKeys.DA_CAPO]: { name: "Da Capo", specialClass: "" },
    [actionKeys.SOUND_OF_SILENCE]: {
        name: "The Sound of Silence",
        specialClass: "",
    },
    [actionKeys.DEPLOY]: { name: "Deploy", specialClass: "" },
    [actionKeys.LASER]: { name: "Laser", specialClass: "" },
    [actionKeys.MELTDOWN]: {
        name: "Meltdown",
        specialClass: "meltdown-button",
    },
    [actionKeys.BABEL]: { name: "Babel", specialClass: "" },
    [actionKeys.CHART]: { name: "Chart", specialClass: "" },

    [actionKeys.REFRACT]: { name: "Refract", specialClass: "" },
    [actionKeys.MIRROR]: { name: "Mirror", specialClass: "" },
    [actionKeys.LUNAR_STRIKE]: { name: "Lunar Strike", specialClass: "" },
    [actionKeys.LUNAR_SHED]: { name: "Lunar Shed", specialClass: "" },
    [actionKeys.LUNAR_GROWTH]: { name: "Lunar Growth", specialClass: "" },
    [actionKeys.LUNAR_SMITE]: { name: "Lunar Smite", specialClass: "" },
    [actionKeys.LUNAR_TIDE]: { name: "Lunar Tide", specialClass: "" },
    [actionKeys.LUNAR_SHROUD]: { name: "Lunar Shroud", specialClass: "" },
    [actionKeys.SHATTER]: { name: "Shatter", specialClass: "" },
    [actionKeys.CHALK]: { name: "Chalk", specialClass: "" },

    [actionKeys.CARVE]: { name: "Carve", specialClass: "" },
    [actionKeys.CURSE]: { name: "Curse", specialClass: "" },
};

export const entryTypeClassMap = {
    [entryTypes.ACTION]: "type-action",
    [entryTypes.OFFENSIVE_ACTION]: "type-offensive-action",
    [entryTypes.DEFENSIVE_ACTION]: "type-defensive-action",
    [entryTypes.TRANSFORMATIVE_ACTION]: "type-transformative-action",
    [entryTypes.STATE]: "type-state",
    [entryTypes.FIELD_EFFECT]: "type-field-effect",
    [entryTypes.DAMAGE_TYPE]: "type-damage-type",
    [entryTypes.DAMAGE_MODIFIERS]: "type-damage-modifiers",
    [entryTypes.RESOURCE]: "type-resource",
    [entryTypes.MITIGATION_RESOURCE]: "type-mitigation-resource",
    [entryTypes.FREE_RESOURCE]: "type-free-resource",
    [entryTypes.LIMITED_RESOURCE]: "type-limited-resource",
    [entryTypes.FIXED_RESOURCE]: "type-fixed-resource",
    [entryTypes.RANKED_RESOURCE]: "type-ranked-resource",
    [entryTypes.OVERFLOWN_RESOURCE]: "type-overflown-resource",
    [entryTypes.ATTRIBUTES]: "type-stat",
    [entryTypes.BASE_ATTRIBUTES]: "type-base-stats",
    [entryTypes.SPECIAL_ATTRIBUTES]: "type-alternate-stats",
    [entryTypes.BATTLE_PHASE]: "type-battle-phase",
    [entryTypes.MECHANIC]: "type-mechanic",
    [entryTypes.CATEGORY]: "type-category",
    [entryTypes.STAR]: "type-star",
    [entryTypes.RUNES]: "type-runes",
};

export const FIXED_RESOURCES = [
    effectKeys.DIVINE_SPARK,
    effectKeys.OVERHEAT,
    effectKeys.DYNAMO,
    effectKeys.SONORITY,
    effectKeys.BAD_OMEN,
    effectKeys.RECOLLECTION,
    effectKeys.PREMONITION,
    effectKeys.IRRADIATION,
    effectKeys.GRAVITATION,
    effectKeys.ACCRETION,
    effectKeys.LUNACY,
];

export const RANKED_RESOURCES = [
    effectKeys.MANA_BLEED,
    effectKeys.PAST_MEMORIES,
    effectKeys.STARBLIGHT,
    effectKeys.CONSTELLATION,
    effectKeys.CRIMSON_CONSTELLATION,
    effectKeys.AZURE_CONSTELLATION,
    effectKeys.MOONLIT_TEARS,
];

export const FREE_ACTIONS = [actionKeys.LASER, actionKeys.CURSE];
