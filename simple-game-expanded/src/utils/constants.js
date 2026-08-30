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
    VOYAGER_DESCRIPTIONS,
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
    speedKeys,
    eyeKeys,
    edictKeys,
    choirKeys,
} from "./enums.js";

export const ATTRIBUTE_NAMES = [effectKeys.STR, effectKeys.DEF];

export const constants = Object.freeze({
    // Seraph
    TARNISH_SIN_CONVERSION: 0.5,
    MAX_SIN: 100,
    MAX_PROVIDENCE: 100,
    DISCERN_RATE: 1 / 10,
    BASE_SIN_GAIN: 0.5,
    BASE_PROV_GAIN: 2.5,
    POWERS_RATE: 1 / 10,
    BASE_VIRTUES_COST: 10,
    VIRTUES_EXTRA_COST: 10,
    STAR_GAIN_RATE: 1 / 2.5,
    APOC_BASE_DMG: 1,
    GENE_BASE_RESTORE: 1,
    APOC_DISGRACE: 2.5,
    GENE_BENE: 2.5,
    SERAPHIM_MULT: 0.5,
    ASCEND_SKIP_RATE: 20,
    HALLOW_CONDEMN: -10,
    HALLOW_SUPPLICATE: 10,
    MIN_HALLOW: -50,
    MAX_HALLOW: 50,
    HIGH_SIN_GAIN: 2.5,
    YEST_SIN_RATE: 1 / 10,
    TOMOR_RATE: 1 / 10,
    ANGEL_LOSE: 0.5,
    STIGMA_RATE: 1 / 20,

    IRRAD_DMG_EXCESS: 5,
    MAX_IRRADIATION: 100,
    IRRADIATION_GAIN_RATE: 5,
    BASE_HEALTH: 20,
    BASE_MANA: 10,
    SPARK_RESTORE_RATE: 2,
    ACC_STARBLIGHT_CONVERSION: 5,
    CHALK_EXTRA_DMG: 10,

    // Sonority
    BABEL_RATE: 1 / 10,
    SILENCE_RATE: 1 / 10,
    SONORITY_ON_DEFENSE: 15,
    SONORITY_ON_OFFENSE: -15,
    STARTING_SONORITY: 0,
    SONORITY_LOWER_LIMIT: -75,
    SONORITY_HIGHER_LIMIT: 75,

    // Verdandi
    VERDANDI_MANA_RESTORE: 0.6,

    // Skuld
    SKULD_MANA_REGEN: 0.3,
    SKULD_WEAK: 0.3,
    BAD_OMEN_EXCESS_CONVERT_RATE: 5,
    VERDANDI_OMEN_GAIN: 30,
    MAX_BAD_OMEN: 100,
    PROPHECY_GAIN_RATE: 5,

    // URD
    URD_DEF_REC: 50,
    MAX_RECOLLECTION: 100,
    URD_HEALTH_REGEN: 0.15,
    RECOLLECTION_EXCESS_RATE: 10,

    CURSE_EMPTY_RUNE_DMG: 0.3,
    DIVINE_SPARK_STR_CONVERSION: 5,
    GRAVITATION_GAIN: 5,
    MAX_GRAVITATION: 100,
    MAX_ACCRETION: 100,

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
    effectKeys.SANCTUARY,
    effectKeys.FAULTY_FIRMAMENT,
    effectKeys.FRACTURED_DOME,
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
    effectKeys.SACRILEGE,
    effectKeys.MARTHYR,
    effectKeys.COVENANT,
    effectKeys.INSPIRATION,
    effectKeys.SACRED_FLAMES,
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
            str: 10,
            def: 0,
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
        name: "Augur",
        best: {
            str: 10,
            def: 0,
        },
        caller: augurAI,
        desc: [...Object.keys(AUGUR_DESCRIPTIONS)],
    },
    [aiKeys.VOYAGER]: {
        name: "Voyager",
        best: {
            str: 0,
            def: 10,
        },
        caller: starfarerAI,
        desc: [...Object.keys(VOYAGER_DESCRIPTIONS)],
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

    actionKeys.CONDEMN,
];

const defensiveActions = [
    actionKeys.HEAL,
    actionKeys.GUARD,
    actionKeys.AEGIS,

    actionKeys.LUNAR_GROWTH,
    actionKeys.LUNAR_SHROUD,
    actionKeys.LUNAR_TIDE,

    actionKeys.SUPPLICATE,
    actionKeys.ATONE,
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

    actionKeys.RISE,
    actionKeys.ASCEND,
    actionKeys.JUDGEMENT,
    actionKeys.DISCERN,
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

export const gameSpeeds = Object.freeze({
    [speedKeys.ONE]: {
        label: "1x",
        mod: 1,
    },
    [speedKeys.TWO]: {
        label: "2x",
        mod: 0.5,
    },
    [speedKeys.INF]: {
        label: "Inf",
        mod: 0,
    },
});

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
    undoPile: [],
    redoPile: [],

    speed: speedKeys.ONE,

    progressStatus: {
        [aiKeys.HUMAN]: progKeys.ALWAYS_OPEN,
        [aiKeys.SIMPLE]: progKeys.OPEN_UNDEFEATED,
        [aiKeys.WARLOCK]: progKeys.LOCKED,
        [aiKeys.BLOODKNIGHT]: progKeys.LOCKED,
        [aiKeys.AUGUR]: progKeys.LOCKED,
        [aiKeys.CYBORG]: progKeys.LOCKED,
        [aiKeys.MAESTRO]: progKeys.LOCKED,
        [aiKeys.LUNATIC]: progKeys.LOCKED,
        [aiKeys.VOYAGER]: progKeys.LOCKED,
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
    btt: {
        [effectKeys.EYE_OF_HEAVENS]: eyeKeys.DORMANT,
        [effectKeys.PROVIDENCE]: 0,
        [effectKeys.DEFILEMENT]: 0,
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
    [roundPhases.P1_SINGULARITY]: {
        descKey: effectKeys.SINGULARITY,
        name: "Player One Singularity",
    },
    [roundPhases.P2_SINGULARITY]: {
        descKey: effectKeys.SINGULARITY,
        name: "Player Two Singularity",
    },
    [roundPhases.RECKONING]: {
        descKey: roundPhases.RECKONING,
        name: "Reckoning",
    },
    [roundPhases.ANOINTMENT]: {
        descKey: roundPhases.ANOINTMENT,
        name: "Anointment",
    },
    [roundPhases.P1_TRIAL]: {
        descKey: effectKeys.TRIAL,
        name: "Player One Trial",
    },
    [roundPhases.P2_TRIAL]: {
        descKey: effectKeys.TRIAL,
        name: "Player Two Trial",
    },
    [roundPhases.ROUND_END]: {
        descKey: roundPhases.ROUND_END,
        name: "Round End",
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
    [entryTypes.TARNISHMENT_TYPE]: "TARNISHMENT TYPE",
    [entryTypes.SPIRITUAL_ORDINANCE]: "SPIRITUAL ORDINANCE",
    [entryTypes.BLASPHEMY]: "BLASPHEMY",
    [entryTypes.CELESTIAL_STAR]: "CELESTIAL STAR",
    [entryTypes.GLOBAL_RESOURCE]: "GLOBAL RESOURCE",
    [entryTypes.EDICT]: "EDICT",
    [entryTypes.HEAVENLY_CHOIR]: "HEAVENLY CHOIR",
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

    [actionKeys.RISE]: { name: "Rise", specialClass: "" },
    [actionKeys.ASCEND]: { name: "Ascend", specialClass: "action-ascend" },
    [actionKeys.JUDGEMENT]: {
        name: "Judgement",
        specialClass: "action-judgement",
    },
    [actionKeys.CONDEMN]: { name: "Condemn", specialClass: "" },
    [actionKeys.SUPPLICATE]: { name: "Supplicate", specialClass: "" },
    [actionKeys.DISCERN]: { name: "Discern", specialClass: "" },
    [actionKeys.ATONE]: { name: "Atone", specialClass: "" },
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
    [entryTypes.CONTROLLER]: "type-controller",
    [entryTypes.TARNISHMENT_TYPE]: "type-tarnishment-type",
    [entryTypes.SPIRITUAL_ORDINANCE]: "type-spiritual-ordinance",
    [entryTypes.BLASPHEMY]: "type-blasphemy",
    [entryTypes.CELESTIAL_STAR]: "type-celestial-star",
    [entryTypes.GLOBAL_RESOURCE]: "type-global-resource",
    [entryTypes.EDICT]: "type-edict",
    [entryTypes.HEAVENLY_CHOIR]: "type-heavenly-choir",
};

export const FIXED_RESOURCES = [
    effectKeys.DIVINE_SPARK,
    effectKeys.OVERHEAT,
    effectKeys.DYNAMO,
    effectKeys.SONORITY,
    effectKeys.BAD_OMEN,
    effectKeys.RECOLLECTION,
    effectKeys.IRRADIATION,
    effectKeys.GRAVITATION,
    effectKeys.ACCRETION,
    effectKeys.LUNACY,
    effectKeys.TARNISHED_SIN,
];

export const RANKED_RESOURCES = [
    effectKeys.MANA_BLEED,
    effectKeys.STARBLIGHT,
    effectKeys.CONSTELLATION,
    effectKeys.CRIMSON_CONSTELLATION,
    effectKeys.AZURE_CONSTELLATION,
    effectKeys.MOONLIT_TEARS,
    effectKeys.BURDEN_OF_STIGMA,
];

export const FREE_ACTIONS = [
    actionKeys.LASER,
    actionKeys.CURSE,
    actionKeys.ASCEND,
];

export const ALL_CATEGORY_KEY = "ALL";

export const INITIAL_GLOSSARY_SPECS = {
    selectedCategory: ALL_CATEGORY_KEY,
    searchQuery: "",
    matchCase: false,
    matchWholeWord: false,
};

export const playerMap = Object.freeze({
    [entityKeys.PLAYER_ONE]: {
        turn: [
            roundPhases.PLAYER_ONE_TURN,
            roundPhases.P1_SINGULARITY,
            roundPhases.P1_TRIAL,
        ],
        extra: [roundPhases.P1_SINGULARITY, roundPhases.P1_TRIAL],
    },
    [entityKeys.PLAYER_TWO]: {
        turn: [
            roundPhases.PLAYER_TWO_TURN,
            roundPhases.P2_SINGULARITY,
            roundPhases.P2_TRIAL,
        ],
        extra: [roundPhases.P2_SINGULARITY, roundPhases.P2_TRIAL],
    },
});

export const edictChoirMap = Object.freeze({
    [edictKeys.ANGELS]: choirKeys.FIRST,
    [edictKeys.ARCHANGELS]: choirKeys.SECOND,
    [edictKeys.PRINCIPALITIES]: choirKeys.THIRD,
    [edictKeys.POWERS]: choirKeys.FOURTH,
    [edictKeys.VIRTUES]: choirKeys.FIFTH,
    [edictKeys.DOMINIONS]: choirKeys.SIXTH,
    [edictKeys.THRONES]: choirKeys.SEVENTH,
    [edictKeys.CHERUBIM]: choirKeys.EIGHTH,
    [edictKeys.SERAPHIM]: choirKeys.NINTH,
});
