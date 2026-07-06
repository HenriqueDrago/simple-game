import {
    simpleAI,
    bloodknightAI,
    paladinAI,
    hexerAI,
    warlockAI,
    shadowSorcererAI,
    cyborgAI,
    maestroAI,
} from "./aiControllers.js";
import { createBaseEntity, distributePoints } from "./entities.js";

import {
    aiKeys,
    actionKeys,
    effectKeys,
    starfallPhases,
    turnStatus,
    whoStartsKeys,
    eyeKeys,
    progKeys,
    sdmKeys,
    entityKeys,
    mechanicKeys,
    entryTypes,
} from "./enums.js";

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

const MAX_OVERHEAT = 100;
const VENTING_OVERHEAT_LOSS = 50;
const NATURAL_OVERHEAT_LOSS = 30;

const HALO_GEN_MULT = 20
const SAC_HP_CONSUMPTION = 0.5;

const SHADOW_PACT_BURN = 5;

const RADIANT_DEF_EFFECT_MULTIPLIER = 0;

const STARTING_SONORORITY = 0;
const SONORITY_LOWER_LIMIT = -10;
const SONORITY_HIGHER_LIMIT = 10;

const MAX_ENLIT = 100;
const MAX_INSIGHT = 100;
const MAX_TARNISHED_SIN = 100;
const MAX_DIVINE_SPARK = 100;

const INSIGHT_TO_REV_FACTOR = 10;

const FLAMES_ABSORPTION_MULTIPLIER = 1;
const BENEDICTION_GEN = 2;

const CHART_STAR_GAIN = 3;
const STARDUST_RATE_CONVERSION = 3;

const MAX_DYNAMO = 100;
const STARTING_ENERGY = 1;

const SCORCH_DMG_BONUS = 1.5;
const SCORCH_FRAGILITY = 1.5;
const FROST_DR = 0.5;
const FROST_WEAKNESS = 0.5;

const RESOURCES_CINDERS_MULT = 2;

const DISTRIBUTION_MODES = [
    "Random",
    "Randomize Enemy",
    "Randomize Player",
    "Custom",
];

export const freeResources = [
    effectKeys.SHADOWFLAME,
    effectKeys.UNRELENTING_SHADOWS,
    effectKeys.LINGERING_EMBER,
    effectKeys.CINDERS,

    effectKeys.POISON,
    effectKeys.MANA_OVERFLOW,
    effectKeys.SHACKLED_MANA,

    effectKeys.RIME,
    effectKeys.CRYOGENESIS,
    effectKeys.KINDLING,
    effectKeys.INCANDESCENCE,
    effectKeys.MYCELIUM,

    effectKeys.BLOOD_SACRIFICE,

    effectKeys.DOME,
    effectKeys.STARDUST,

    effectKeys.RADIANCE,
    effectKeys.HALO,
    effectKeys.INSPIRATION,

    effectKeys.SACRED_FLAMES,
];

export const limitedResources = [
    effectKeys.MANA,
    effectKeys.HEALTH,
    effectKeys.INSIGHT,
    effectKeys.ENLIGHTENMENT,
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
    BENEDICTION_GEN,
    FLAMES_ABSORPTION_MULTIPLIER,
    MAX_INSIGHT,
    MAX_TARNISHED_SIN,
    CHART_STAR_GAIN,
    STARDUST_RATE_CONVERSION,
    MAX_DIVINE_SPARK,
    NATURAL_OVERHEAT_LOSS,
    MAX_DYNAMO,
    STARTING_ENERGY,

    SCORCH_DMG_BONUS,
    SCORCH_FRAGILITY,
    FROST_DR,
    FROST_WEAKNESS,

    RESOURCES_CINDERS_MULT,
};

export const presetAi = {
    [aiKeys.HUMAN]: {
        name: "Human (No AI)",
        best: {
            str: 5,
            def: 5,
            
        },
        caller: simpleAI,
        desc: [
            mechanicKeys.ROUND,
            mechanicKeys.TURN,
            mechanicKeys.UPKEEP,
            mechanicKeys.PLAN,
            mechanicKeys.COMMIT,
            mechanicKeys.ACTIONS,
            effectKeys.HEALTH,
            effectKeys.MAX_HEALTH,
            effectKeys.MANA,
            effectKeys.MAX_MANA,
            effectKeys.STR,
            effectKeys.DEF,
            effectKeys.PHYSICAL_DAMAGE,
            effectKeys.PIERCING_DAMAGE,
            effectKeys.TRUE_DAMAGE,
            effectKeys.DEF_EFFECTIVENESS,
            effectKeys.DAMAGE_REDUCTION,
            effectKeys.RESOURCES,

            entryTypes.FIELD_EFFECT,
            entryTypes.STATE,
            entryTypes.DAMAGE_TYPE,
            entryTypes.FREE_RESOURCE,
            entryTypes.LIMITED_RESOURCE,
            entryTypes.FIXED_RESOURCE,
            entryTypes.MITIGATION_RESOURCE,
            entryTypes.BATTLE_PHASE,
            entryTypes.STAR,
            mechanicKeys.OFFENSIVE_ACTIONS,
            mechanicKeys.DEFENSIVE_ACTIONS,
            mechanicKeys.TRANSFORMATIVE_ACTIONS,
        ],
    },
    [aiKeys.SIMPLE]: {
        name: "Mundane",
        best: {
            str: 10,
            def: 0,
        },
        caller: simpleAI,
        desc: [
            actionKeys.ATTACK,
            actionKeys.GUARD,
            effectKeys.GUARDING_STATE,
            actionKeys.HEAL,
        ],
    },
    [aiKeys.WARLOCK]: {
        name: "Warlock",
        best: {
            str: 10,
            def: 0,
        },
        caller: warlockAI,
        desc: [
            actionKeys.SPECIAL_ATTACK,
            mechanicKeys.MANA_IMBALANCE,
            effectKeys.MANA_OVERFLOW,
        ],
    },
    [aiKeys.BLOODKNIGHT]: {
        name: "Bloodknight",
        best: {
            str: 0,
            def: 10,
        },
        caller: bloodknightAI,
        desc: [
            actionKeys.SACRIFICE,
            effectKeys.SACRIFICIAL_STATE,
            effectKeys.BLOOD_SACRIFICE,
            mechanicKeys.MANA_BLEED,
        ],
    },
    [aiKeys.HEXER]: {
        name: "Hexer",
        best: {
            str: 10,
            def: 0,
        },
        caller: hexerAI,
        desc: [
            actionKeys.ARRAY,
            actionKeys.CURSE,
            effectKeys.RUNIC_ARRAY,
            mechanicKeys.RUNIC_INSCRIPTION,
            effectKeys.THORNED_SHACKLES,
            effectKeys.SHACKLED_MANA,
            effectKeys.POISON,
        ],
    },
    [aiKeys.CYBORG]: {
        name: "Cyborg",
        best: {
            str: 0,
            def: 10,
        },
        caller: cyborgAI,
        desc: [
            actionKeys.DEPLOY,
            actionKeys.LASER,
            actionKeys.MELTDOWN,
            effectKeys.DEPLOYMENT,
            effectKeys.WEAPONS_DEPLOYED,
            effectKeys.THERMAL_OVERLOAD,
            effectKeys.VENTING,
            effectKeys.OVERHEAT,

            effectKeys.DYNAMO,
            effectKeys.ENERGY_LEVEL,
        ],
    },
    [aiKeys.MAESTRO]: {
        name: "Maestro",
        best: {
            str: 0,
            def: 10,
        },
        caller: maestroAI,
        desc: [
            actionKeys.ATTUNE,
            actionKeys.DA_CAPO,
            actionKeys.SOUND_OF_SILENCE,
            actionKeys.BABEL,
            effectKeys.RESONANT,
            effectKeys.SONORITY,
        ],
    },

    [aiKeys.SHADOW_SORCERER]: {
        name: "Shadow Sorcerer",
        best: {
            str: 0,
            def: 10,
        },
        caller: shadowSorcererAI,
        desc: [
            actionKeys.SHADOW_PACT,
            actionKeys.BLACK_MAYHEM,
            actionKeys.SHADOW_MANTLE,
            actionKeys.RITUAL_OF_ASH,
            actionKeys.DARK_PROMISE,
            effectKeys.UMBRAL_CORE,
            effectKeys.DARK_EMBRACE,
            effectKeys.DIMMING_DARKNESS,
            effectKeys.BLEAK_DECEPTION,
            effectKeys.SHADOWFLAME,
            effectKeys.UNRELENTING_SHADOWS,
            effectKeys.LINGERING_EMBER,
            effectKeys.CINDERS,
        ],
    },

    [aiKeys.STARFARER]: {
        name: "Starfarer (Unimplemented)",
        best: {
            str: 0,
            def: 10,
        },
        caller: simpleAI,
        desc: [
            actionKeys.CHART,
            effectKeys.STARGAZER,
            effectKeys.STARFALL,
            effectKeys.RED_STARFALL,
            effectKeys.ORANGE_STARFALL,
            effectKeys.YELLOW_STARFALL,
            effectKeys.GREEN_STARFALL,
            effectKeys.BLUE_STARFALL,
            effectKeys.INDIGO_STARFALL,
            effectKeys.VIOLET_STARFALL,
            effectKeys.RED_TRAILFALL,
            effectKeys.ORANGE_TRAILFALL,
            effectKeys.YELLOW_TRAILFALL,
            effectKeys.GREEN_TRAILFALL,
            effectKeys.BLUE_TRAILFALL,
            effectKeys.INDIGO_TRAILFALL,
            effectKeys.VIOLET_TRAILFALL,
            effectKeys.WHITE_STAR,
            effectKeys.RED_STAR,
            effectKeys.ORANGE_STAR,
            effectKeys.YELLOW_STAR,
            effectKeys.GREEN_STAR,
            effectKeys.BLUE_STAR,
            effectKeys.INDIGO_STAR,
            effectKeys.VIOLET_STAR,
            effectKeys.DIMMED_RED_STAR,
            effectKeys.DIMMED_ORANGE_STAR,
            effectKeys.DIMMED_YELLOW_STAR,
            effectKeys.DIMMED_GREEN_STAR,
            effectKeys.DIMMED_BLUE_STAR,
            effectKeys.DIMMED_INDIGO_STAR,
            effectKeys.DIMMED_VIOLET_STAR,
            effectKeys.RED_TRAIL,
            effectKeys.ORANGE_TRAIL,
            effectKeys.YELLOW_TRAIL,
            effectKeys.GREEN_TRAIL,
            effectKeys.BLUE_TRAIL,
            effectKeys.INDIGO_TRAIL,
            effectKeys.VIOLET_TRAIL,
            effectKeys.GRAY_STAR,
            effectKeys.STARDUST,
            effectKeys.DOME,
        ],
    },

    [aiKeys.ELEMENTALIST]: {
        name: "Elementalist (Unimplemented)",
        best: {
            str: 0,
            def: 10,
        },
        caller: simpleAI,
        desc: [

            actionKeys.ALIGN,
            effectKeys.SELENIAN,
            effectKeys.ELEMENTAL_CRYSTALS,
            effectKeys.NATURE,
            effectKeys.MYCELIUM,
            effectKeys.FROST,
            effectKeys.CRYOGENESIS,
            effectKeys.RIME,
            effectKeys.SCORCH,
            effectKeys.KINDLING,
            effectKeys.INCANDESCENCE,
            effectKeys.MIRRORED_MOON,
            actionKeys.MIRROR,
            effectKeys.REFLECTED_FIRMAMENT,
            mechanicKeys.MOON_PHASE,
            effectKeys.MOONLIGHT,
        ],
    },

    [aiKeys.PALADIN]: {
        name: "Paladin (Incomplete)",
        best: {
            str: 0,
            def: 10,
        },
        caller: paladinAI,
        desc: [
            actionKeys.AEGIS,
            effectKeys.RADIANT,
            effectKeys.HALO,
            effectKeys.RADIANCE,
            effectKeys.ENLIGHTENMENT,
            effectKeys.MAX_ENLIGHTENMENT,
            effectKeys.ZENITH_OF_MORTALITY,
            actionKeys.ASCEND,
            effectKeys.ASCENDENCE_OF_SPIRIT,
            mechanicKeys.ACTS_OF_BENEDICTION,
            mechanicKeys.ACTS_OF_MALEDICTION,
            effectKeys.TARNISHED_SIN,
            effectKeys.EYE_OF_HEAVENS,
            effectKeys.INSIGHT,
            effectKeys.MAX_INSIGHT,
            effectKeys.CUTOFF_WINGS,
            effectKeys.REVELATION,
            effectKeys.BURDEN_OF_STIGMA,
            effectKeys.SEVERED_TIME,
            effectKeys.INSPIRATION,
            effectKeys.SACRED_FLAMES,
            actionKeys.BAPTISM_OF_THE_FLAMES,
            actionKeys.CELESTIAL_SCALE,
            actionKeys.HYMNS_OF_SANCTIFICATION,
            actionKeys.GIFT_OF_APOTHEOSIS,
            actionKeys.SERAPH_OF_CONDEMNATION,
            actionKeys.GLIMPSE_OF_PANDEMONIUM,
            actionKeys.EDICT_OF_SEVERANCE,
            actionKeys.THE_WORD_MADE_FLESH,

            effectKeys.DIVINE_SPARK,
            actionKeys.JUDGEMENT,
            effectKeys.ABANDONED_BY_GRACE,
            effectKeys.ANOINTED_PROXY,
            mechanicKeys.EMANATION,
        ],
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
    actionKeys.CHART,
];

const actsOfBenediction = [
    actionKeys.BAPTISM_OF_THE_FLAMES,
    actionKeys.CELESTIAL_SCALE,
    actionKeys.HYMNS_OF_SANCTIFICATION,
    actionKeys.GIFT_OF_APOTHEOSIS,
];

const actsOfMalediction = [
    actionKeys.SERAPH_OF_CONDEMNATION,
    actionKeys.GLIMPSE_OF_PANDEMONIUM,
    actionKeys.EDICT_OF_SEVERANCE,
    actionKeys.THE_WORD_MADE_FLESH,
];

export const actionsClass = {
    offensiveActions,
    defensiveActions,
    transformativeActions,
    actsOfBenediction,
    actsOfMalediction,
};

export const stackCounters = {
    [effectKeys.BLOOD_SACRIFICE]: {
        label: "Blood Sacrifice",
        style: {
            color: "#ff3333",
            borderColor: "#ff3333",
            backgroundColor: "rgba(255, 51, 51, 0.2)",
        },
    },

    [effectKeys.POISON]: {
        label: "Poison",
        style: {
            color: "#00e676",
            borderColor: "#00e676",
            backgroundColor: "rgba(0, 230, 118, 0.2)",
        },
    },

    [effectKeys.CRYOGENESIS]: {
        label: "Cryogenesis",
        style: {
            color: "#00b0ff",
            borderColor: "#00b0ff",
            backgroundColor: "rgba(0, 176, 255, 0.2)",
        },
    },

    [effectKeys.SHACKLED_MANA]: {
        label: "Shackled Mana",
        style: {
            color: "#2979ff",
            borderColor: "#2979ff",
            backgroundColor: "rgba(41, 121, 255, 0.2)",
        },
    },

    [effectKeys.SHADOWFLAME]: {
        label: "Shadowflame",
        style: {
            color: "#d500f9",
            borderColor: "#d500f9",
            backgroundColor: "rgba(213, 0, 249, 0.2)",
        },
    },

    [effectKeys.UNRELENTING_SHADOWS]: {
        label: "Unrelenting Shadows",
        style: {
            color: "#651fff",
            borderColor: "#651fff",
            backgroundColor: "rgba(101, 31, 255, 0.2)",
        },
    },

    [effectKeys.LINGERING_EMBER]: {
        label: "Lingering Ember",
        style: {
            color: "#f50057",
            borderColor: "#f50057",
            backgroundColor: "rgba(245, 0, 87, 0.2)",
        },
    },

    [effectKeys.CINDERS]: {
        label: "Cinders",
        style: {
            color: "#e0e0e0",
            borderColor: "#9e9e9e",
            backgroundColor: "rgba(158, 158, 158, 0.2)",
        },
    },

    [effectKeys.RADIANCE]: {
        label: "Radiance",
        style: {
            color: "#ffea00",
            borderColor: "#ffea00",
            backgroundColor: "rgba(255, 234, 0, 0.2)",
        },
    },

    [effectKeys.HALO]: {
        label: "Halo",
        style: {
            color: "#fff59d",
            borderColor: "#fff59d",
            backgroundColor: "rgba(255, 245, 157, 0.2)",
        },
    },

    [effectKeys.SACRED_FLAMES]: {
        label: "Sacred Flames",
        style: {
            color: "#ffb300",
            borderColor: "#ffb300",
            backgroundColor: "rgba(255, 179, 0, 0.2)",
        },
    },

    [effectKeys.DOME]: {
        label: "Dome",
        style: {
            color: "#80d8ff",
            borderColor: "#80d8ff",
            backgroundColor: "rgba(128, 216, 255, 0.2)",
        },
    },

    [effectKeys.STARDUST]: {
        label: "Stardust",
        style: {
            color: "#ff8a65",
            borderColor: "#ff8a65",
            backgroundColor: "rgba(255, 138, 101, 0.2)",
        },
    },

    [effectKeys.INSPIRATION]: {
        label: "Inspiration",
        style: {
            color: "white",
            borderColor: "white",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
        },
    },

    [effectKeys.RIME]: {
        label: "Rime",
        style: {
            color: "#00e5ff",
            borderColor: "#00e5ff",
            backgroundColor: "rgba(0, 229, 255, 0.2)",
        },
    },

    [effectKeys.KINDLING]: {
        label: "Kindling",
        style: {
            color: "#ff9100",
            borderColor: "#ff9100",
            backgroundColor: "rgba(255, 145, 0, 0.2)",
        },
    },

    [effectKeys.INCANDESCENCE]: {
        label: "Incandescence",
        style: {
            color: "#ff3d00",
            borderColor: "#ff3d00",
            backgroundColor: "rgba(255, 61, 0, 0.2)",
        },
    },

    [effectKeys.MYCELIUM]: {
        label: "Mycelium",
        style: {
            color: "#4caf50",
            borderColor: "#4caf50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
        },
    },
};

export const coloredStars = [
    {
        name: "red",
        color: "#ff5a5f",
        star: effectKeys.RED_STAR,
        dimmed: effectKeys.DIMMED_RED_STAR,
        trail: effectKeys.RED_TRAIL,
        starPhase: starfallPhases.RED_STAR,
        trailPhase: starfallPhases.RED_TRAIL,
    },
    {
        name: "orange",
        color: "#ffb347",
        star: effectKeys.ORANGE_STAR,
        dimmed: effectKeys.DIMMED_ORANGE_STAR,
        trail: effectKeys.ORANGE_TRAIL,
        starPhase: starfallPhases.ORANGE_STAR,
        trailPhase: starfallPhases.ORANGE_TRAIL,
    },
    {
        name: "yellow",
        color: "#fff275",
        star: effectKeys.YELLOW_STAR,
        dimmed: effectKeys.DIMMED_YELLOW_STAR,
        trail: effectKeys.YELLOW_TRAIL,
        starPhase: starfallPhases.YELLOW_STAR,
        trailPhase: starfallPhases.YELLOW_TRAIL,
    },
    {
        name: "green",
        color: "#7dff8a",
        star: effectKeys.GREEN_STAR,
        dimmed: effectKeys.DIMMED_GREEN_STAR,
        trail: effectKeys.GREEN_TRAIL,
        starPhase: starfallPhases.GREEN_STAR,
        trailPhase: starfallPhases.GREEN_TRAIL,
    },
    {
        name: "blue",
        color: "#6ec6ff",
        star: effectKeys.BLUE_STAR,
        dimmed: effectKeys.DIMMED_BLUE_STAR,
        trail: effectKeys.BLUE_TRAIL,
        starPhase: starfallPhases.BLUE_STAR,
        trailPhase: starfallPhases.BLUE_TRAIL,
    },
    {
        name: "indigo",
        color: "#8b7dff",
        star: effectKeys.INDIGO_STAR,
        dimmed: effectKeys.DIMMED_INDIGO_STAR,
        trail: effectKeys.INDIGO_TRAIL,
        starPhase: starfallPhases.INDIGO_STAR,
        trailPhase: starfallPhases.INDIGO_TRAIL,
    },
    {
        name: "violet",
        color: "#d291ff",
        star: effectKeys.VIOLET_STAR,
        dimmed: effectKeys.DIMMED_VIOLET_STAR,
        trail: effectKeys.VIOLET_TRAIL,
        starPhase: starfallPhases.VIOLET_STAR,
        trailPhase: starfallPhases.VIOLET_TRAIL,
    },
];

export const INITIAL_GAME_STATE = {
    status: turnStatus.SETUP,
    nextStatus: null,
    lastPlayerTurn: null,
    remainingArray: 0,
    whoStarts: whoStartsKeys.PLAYER_ONE,
    turnCount: 0,
    eyeOfHeavens: eyeKeys.DORMANT,
    starQueue: null,
    progressMode: false,
    [effectKeys.SEVERED_TIME]: false,
    progressStatus: {
        [aiKeys.HUMAN]: progKeys.ALWAYS_OPEN,
        [aiKeys.SIMPLE]: progKeys.OPEN_UNDEFEATED,
        [aiKeys.WARLOCK]: progKeys.LOCKED,
        [aiKeys.BLOODKNIGHT]: progKeys.LOCKED,
        [aiKeys.HEXER]: progKeys.LOCKED,
        [aiKeys.CYBORG]: progKeys.LOCKED,
        [aiKeys.MAESTRO]: progKeys.LOCKED,
        [aiKeys.ELEMENTALIST]: progKeys.LOCKED,
        [aiKeys.STARFARER]: progKeys.LOCKED,
        [aiKeys.SHADOW_SORCERER]: progKeys.LOCKED,
        [aiKeys.PALADIN]: progKeys.LOCKED,
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
    turnStatus.TRANSITION,
    turnStatus.SHORT_TRANSITION,
    turnStatus.VICTORY,
    turnStatus.DEFEAT,
    turnStatus.DRAW,
];
