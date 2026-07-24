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
    dmgTypes,
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

const SP_ATTACK_COST = 0.6;

const MANA_BLEED_MULT = 0.5;
const BLOOD_SACRIFICE_MULT = 1.0;

const ARRAY_DURATION = 3;
const MANA_SHACKLE_TURN_GAIN = 5;

const MAX_OVERHEAT = 100;
const VENTING_OVERHEAT_LOSS = 50;
const NATURAL_OVERHEAT_LOSS = 30;

const HALO_GEN_MULT = 2;
const SAC_HP_CONSUMPTION = 0.5;

const SHADOW_PACT_BURN = 5;

const RADIANT_DEF_EFFECT_MULTIPLIER = 0;

const STARTING_SONORITY = 0;
const SONORITY_LOWER_LIMIT = -50;
const SONORITY_HIGHER_LIMIT = 50;
const SONORITY_ON_DEFENSE = 5;
const SONORITY_ON_OFFENSE = -5;

const MAX_DIVINE_SPARK = 100;

const CHART_STAR_GAIN = 3;
const STARDUST_RATE_CONVERSION = 3;

const MAX_DYNAMO = 100;
const STARTING_ENERGY = 1;

const RESOURCES_CINDERS_MULT = 2;

const ALBEDO_ML_GAIN = 2;
const BLOOD_CORONA_ML_GAIN = 1;
const MIRROR_ML_GAIN = 3;
const LUNAR_GROWTH_MULT = 1;
const HIDDEN_MOON_ML_GAIN = 3;
const LUNAR_VEIL_TEARS_GAIN = 1;
const GIBBOUS_TEARS_GAIN = 1;

const MAX_LUNACY = 100;

const LUNAR_TIDE_MULT = 2;
const SMITE_MULT = 5;
const WITHER_LUNACY_MULT = 2;

const MAX_NEBULA = 100;
const MAX_STARBLIGHT = 100;

const NORMAL_YELLOW_NEBULA_GAIN = 5;
const GRAVITATION_GAIN = 10;
const MAX_GRAVITATION = 100;
const MAX_STARFLARE = 100;
const STARFLARE_GAIN = 5;

const DIVINE_SPARK_STR_CONVERSION = 5;

const URD_HEALTH_REGEN = 0.3;
const VERDANDI_OMEN_GAIN = 30;
const MAX_BAD_OMEN = 100;
const MAX_RECOLLECTION = 100;
const SKULD_PRECOGNITION_GAIN = 0.3;
const RECOLLECTION_LOSE = 30;
const PAST_MEMORIES_GAIN = 6;
const URD_DEF_REC = 3;
const SKULD_WEAK = 0.3;
const SKULD_MANA_REGEN = 0.3;
const CURSE_EMPTY_RUNE_DMG = 5;
const BAD_OMEN_TURN_END_LOSS = 30;

export const constants = {
    BAD_OMEN_TURN_END_LOSS,
    CURSE_EMPTY_RUNE_DMG,
    SKULD_MANA_REGEN,
    SKULD_WEAK,
    PAST_MEMORIES_GAIN,
    URD_DEF_REC,
    RECOLLECTION_LOSE,
    SKULD_PRECOGNITION_GAIN,
    MAX_RECOLLECTION,
    URD_HEALTH_REGEN,
    VERDANDI_OMEN_GAIN,
    MAX_BAD_OMEN,
    STARFLARE_GAIN,
    DIVINE_SPARK_STR_CONVERSION,
    MAX_STARFLARE,
    GRAVITATION_GAIN,
    MAX_GRAVITATION,
    NORMAL_YELLOW_NEBULA_GAIN,
    MAX_NEBULA,
    MAX_STARBLIGHT,
    SONORITY_ON_DEFENSE,
    SONORITY_ON_OFFENSE,
    WITHER_LUNACY_MULT,
    LUNAR_TIDE_MULT,
    MAX_LUNACY,
    GIBBOUS_TEARS_GAIN,
    LUNAR_VEIL_TEARS_GAIN,
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
    STANDARD_DR_INCREASE,
    STANDARD_DEF_EFFECT_INCREASE,
    GUARD_MANA_REGEN,
    HALO_GEN_MULT,
    SAC_HP_CONSUMPTION,
    SHADOW_PACT_BURN,
    RADIANT_DEF_EFFECT_MULTIPLIER,
    STARTING_SONORITY,
    SONORITY_LOWER_LIMIT,
    SONORITY_HIGHER_LIMIT,
    VENTING_OVERHEAT_LOSS,
    CHART_STAR_GAIN,
    STARDUST_RATE_CONVERSION,
    MAX_DIVINE_SPARK,
    NATURAL_OVERHEAT_LOSS,
    MAX_DYNAMO,
    STARTING_ENERGY,

    RESOURCES_CINDERS_MULT,

    ALBEDO_ML_GAIN,
    MIRROR_ML_GAIN,
    BLOOD_CORONA_ML_GAIN,
    LUNAR_GROWTH_MULT,

    HIDDEN_MOON_ML_GAIN,
    SMITE_MULT,
};

export const MITIGATION_RESOURCES = [
    effectKeys.STARLIT_HEAVENS,
    effectKeys.FIRMAMENT,
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
    effectKeys.BLOOD_SACRIFICE,
    effectKeys.STARDUST,
    effectKeys.MOONDUST,
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
        desc: [
            effectKeys.ROUND,
            effectKeys.TURN,
            effectKeys.UPKEEP,
            effectKeys.PLAN,
            effectKeys.COMMIT,
            effectKeys.HEALTH,
            effectKeys.MAX_HEALTH,
            effectKeys.MANA,
            effectKeys.MAX_MANA,
            effectKeys.STR,
            effectKeys.DEF,
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

            dmgTypes.PHYSICAL,
            dmgTypes.PIERCING,
            dmgTypes.TRUE,
            effectKeys.EFFECTIVE_DEF,
            effectKeys.FRAGILITY,
            effectKeys.DAMAGE_BONUS,
            effectKeys.WEAKNESS,
            roundPhases.ROUND_START,
            roundPhases.ROUND_END,
            entryTypes.ACTION,
            entryTypes.OFFENSIVE_ACTION,
            entryTypes.DEFENSIVE_ACTION,
            entryTypes.TRANSFORMATIVE_ACTION,
            entryTypes.RANKED_RESOURCE,
            entryTypes.OVERFLOWN_RESOURCE,
            entryTypes.DAMAGE_MODIFIERS,
            entryTypes.MECHANIC,
            entryTypes.ATTRIBUTES,
            entryTypes.BASE_ATTRIBUTES,
            entryTypes.SPECIAL_ATTRIBUTES,
            entryTypes.CATEGORY,
        ],
    },
    [aiKeys.SIMPLE]: {
        name: "Mundane",
        best: {
            str: 5,
            def: 5,
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
            effectKeys.MANA_IMBALANCE,
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
            effectKeys.MANA_BLEED,
        ],
    },
    [aiKeys.PALADIN]: {
        name: "Paladin",
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
            effectKeys.DIVINE_SPARK,
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
            effectKeys.RESONANT,
            effectKeys.SONORITY,
            actionKeys.DA_CAPO,
            actionKeys.SOUND_OF_SILENCE,
            effectKeys.HARMONY,
            actionKeys.BABEL,
            effectKeys.DISSONANCE,
        ],
    },
    [aiKeys.HEXER]: {
        name: "Augur",
        best: {
            str: 10,
            def: 0,
        },
        caller: augurAI,
        desc: [
            actionKeys.CARVE,
            actionKeys.CURSE,
            effectKeys.VISIONARY,
            effectKeys.RUNIC_ARRAY,
            entryTypes.RUNES,
            runeKeys.URD,
            runeKeys.VERDANDI,
            runeKeys.SKULD,
            effectKeys.PRECOGNITION,
            effectKeys.CONJECTURE,
            effectKeys.BAD_OMEN,
            effectKeys.RECOLLECTION,
            effectKeys.PAST_MEMORIES,
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
        name: "Starfarer",
        best: {
            str: 0,
            def: 10,
        },
        caller: starfarerAI,
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
            effectKeys.WHITE_STAR,
            effectKeys.RED_STAR,
            effectKeys.ORANGE_STAR,
            effectKeys.YELLOW_STAR,
            effectKeys.GREEN_STAR,
            effectKeys.BLUE_STAR,
            effectKeys.INDIGO_STAR,
            effectKeys.VIOLET_STAR,
            effectKeys.GRAY_STAR,
            effectKeys.NEBULA,
            effectKeys.STARBLIGHT,
            effectKeys.GRAVITATION,
            effectKeys.SINGULARITY,
            effectKeys.CONSTELLATION,
            effectKeys.AZURE_CONSTELLATION,
            effectKeys.CRIMSON_CONSTELLATION,
            effectKeys.STARDUST,
            effectKeys.DOME,
            effectKeys.FIRMAMENT,
            effectKeys.STARLIT_HEAVENS,
            effectKeys.STARFLARE,
            effectKeys.NOVA,
        ],
    },
    [aiKeys.LUNATIC]: {
        name: "Lunatic",
        best: {
            str: 5,
            def: 5,
        },
        caller: lunaticAI,
        desc: [
            actionKeys.REFRACT,
            effectKeys.SELENIAN,
            actionKeys.MIRROR,
            effectKeys.MOONLIGHT,
            effectKeys.MIRRORED_MOON,
            moonKeys.HIDDEN,
            moonKeys.WAXING,
            moonKeys.WANING,
            moonKeys.BLOODSTAINED,
            moonKeys.CORONAL,
            effectKeys.MOON_PHASE,
            effectKeys.ELEMENTAL_CRYSTALS,
            elementalKeys.DULLED,
            elementalKeys.FROST,
            actionKeys.LUNAR_SHROUD,
            effectKeys.PRISMATIC,
            effectKeys.REFRACTED_DIVINITY,
            effectKeys.MOONDUST,
            effectKeys.LUNACY,
            elementalKeys.NATURE,
            effectKeys.SILVER_BLOOD,
            actionKeys.LUNAR_GROWTH,
            effectKeys.MOON_DEW,
            elementalKeys.SCORCH,
            actionKeys.LUNAR_STRIKE,
            elementalKeys.OCEAN,
            actionKeys.LUNAR_TIDE,
            elementalKeys.WITHER,
            effectKeys.MOONLIT_TEARS,
            actionKeys.LUNAR_SHED,
            effectKeys.MYCELIUM,
            elementalKeys.ASH,
            effectKeys.FUNERARY_URN,
            actionKeys.LUNAR_SMITE,
            elementalKeys.ALBEDO,
            actionKeys.SHATTER,
            elementalKeys.SHATTERED,
            actionKeys.CHALK,
            dmgTypes.LUNIC,
        ],
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

export const stackCounters = {
    [effectKeys.BLOOD_SACRIFICE]: {
        label: "Blood Sacrifice",
        style: {
            color: "#ff3333",
            borderColor: "#ff3333",
            backgroundColor: "rgba(255, 51, 51, 0.2)",
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

    [effectKeys.STARDUST]: {
        label: "Stardust",
        style: {
            color: "#ff8a65",
            borderColor: "#ff8a65",
            backgroundColor: "rgba(255, 138, 101, 0.2)",
        },
    },

    [effectKeys.MOONDUST]: {
        label: "Moondust",
        style: {
            color: "#e1f5fe",
            borderColor: "#e1f5fe",
            backgroundColor: "rgba(225, 245, 254, 0.2)",
        },
    },

    [effectKeys.DISSONANCE]: {
        label: "Dissonance",
        style: {
            color: "#ff3333",
            borderColor: "#ff3333",
            backgroundColor: "rgba(255, 51, 51, 0.2)",
        },
    },

    [effectKeys.PRECOGNITION]: {
        label: "Precognition",
        style: {
            color: "#b388ff",
            borderColor: "#b388ff",
            backgroundColor: "rgba(179, 136, 255, 0.2)",
        },
    },
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

    progressStatus: {
        [aiKeys.HUMAN]: progKeys.ALWAYS_OPEN,
        [aiKeys.SIMPLE]: progKeys.OPEN_UNDEFEATED,
        [aiKeys.WARLOCK]: progKeys.LOCKED,
        [aiKeys.BLOODKNIGHT]: progKeys.LOCKED,
        [aiKeys.HEXER]: progKeys.LOCKED,
        [aiKeys.CYBORG]: progKeys.LOCKED,
        [aiKeys.MAESTRO]: progKeys.LOCKED,
        [aiKeys.LUNATIC]: progKeys.LOCKED,
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
