export const turnStatus = Object.freeze({
    SETUP: "setup",
    VICTORY: "victory",
    DEFEAT: "defeat",
    DRAW: "draw",
    ONGOING: "ongoing",
    ROUND_TRANSITION: "roundTrans",
    STARFALL_TRANSITION: "starfallTrans",
});

export const roundPhases = Object.freeze({
    ROUND_START: "roundStart",
    PLAYER_ONE_TURN: "p1turn",
    PLAYER_TWO_TURN: "p2turn",

    P1_STARS_TURN: "p1starfall",
    MOON_TURN: "moonPhaseTurn",
    P2_STARS_TURN: "p2Starfall",

    P1_SINGULARITY: "p1Singularity",
    P2_SINGULARITY: "p2Singularity",


    ROUND_END: "roundEnd",
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
    CYBORG: "cyborg",
    MAESTRO: "maestro",
    LUNATIC: "lunatic",
    STARFARER: "starfarer",
});

export const sdmKeys = Object.freeze({
    CUSTOM: "custom",
    BEST: "best",
    FULL_DEF: "fullDef",
    FULL_STR: "fullStr",
    BALANCED: "balanced"
});

export const elementalKeys = Object.freeze({
    DULLED: "dull",

    NATURE: "nature",
    FROST: "frost",
    SCORCH: "scorch",

    OCEAN: "ocean",
    ASH: "ash",
    WITHER: "wither",

    ALBEDO: "albedo",

    SHATTERED: "shattered",
});

export const whoStartsKeys = Object.freeze({
    RANDOM: 0,
    PLAYER_ONE: entityKeys.PLAYER_ONE,
    PLAYER_TWO: entityKeys.PLAYER_TWO,
});

export const dmgTypes = Object.freeze({
    PHYSICAL: "phys",
    PIERCING: "pierce",
    TRUE: "true",
    LUNIC: "lunic",
});

export const actionKeys = Object.freeze({
    ATTACK: "attack",
    HEAL: "heal",
    GUARD: "guard",
    SPECIAL_ATTACK: "spAtk",
    SACRIFICE: "sacrifice",

    AEGIS: "aegis",
    SHADOW_PACT: "shadowPact",
    BLACK_MAYHEM: "blackMayhem",
    SHADOW_MANTLE: "shadowMantle",
    RITUAL_OF_ASH: "ritualOfAsh",
    DARK_PROMISE: "darkPromise",
    ATTUNE: "attune",
    DA_CAPO: "daCapo",
    SOUND_OF_SILENCE: "soundOfSilence",
    DEPLOY: "deploy",
    LASER: "laser",
    MELTDOWN: "meltdown",
    BABEL: "babel",
    CHART: "chart",

    REFRACT: "refract",
    MIRROR: "mirror",
    LUNAR_STRIKE: "lunarStrike",
    LUNAR_SHED: "lunarShed",
    LUNAR_GROWTH: "lunarGrowth",
    LUNAR_SMITE: "lunarSmite",
    LUNAR_TIDE: "lunarTide",
    LUNAR_SHROUD: "lunarShroud",
    SHATTER: "shatter",
    CHALK: "chalk",

    ASCEND: "ascend",

    CARVE: "carve",
    CURSE: "curse",
});

export const effectKeys = Object.freeze({
    GUARDING_STATE: "guarding",
    MANA_BLEED: "manaBleed",
    MANA_OVERFLOW: "manaOverflow",
    SACRIFICIAL_STATE: "sacrificial",
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
    SONORITY: "sonority",
    RESONANT: "resonant",
    HALO: "halo",

    DEPLOYMENT: "deployment",
    WEAPONS_DEPLOYED: "weaponsDeployed",
    OVERHEAT: "currOverheat",
    THERMAL_OVERLOAD: "thermalOverload",
    VENTING: "venting",
    BLEAK_DECEPTION: "bleakDeception",
    HEALTH: "currHp",
    MANA: "currMana",
    MAX_MANA: "maxMana",
    MAX_HEALTH: "maxHp",
    STR: "str",
    DEF: "def",
    DAMAGE_REDUCTION: "dr",
    DEF_EFFECTIVENESS: "defEffect",
    WHITE_STAR: "white",
    GRAY_STAR: "gray",
    RED_STAR: "red",
    ORANGE_STAR: "orange",
    YELLOW_STAR: "yellow",
    GREEN_STAR: "green",
    BLUE_STAR: "blue",
    INDIGO_STAR: "indigo",
    VIOLET_STAR: "violet",
    STARDUST: "stardust",
    STARGAZER: "stargazer",
    STARFALL: "starfall",
    DOME: "dome",
    RED_STARFALL: "redStarfall",
    ORANGE_STARFALL: "orangeStarfall",
    YELLOW_STARFALL: "yellowStarfall",
    GREEN_STARFALL: "greenStarfall",
    BLUE_STARFALL: "blueStarfall",
    INDIGO_STARFALL: "indigoStarfall",
    VIOLET_STARFALL: "violetStarfall",

    DIVINE_SPARK: "currDivineSpark",

    DYNAMO: "dynamo",
    ENERGY_LEVEL: "energyLevel",
    MIRRORED_MOON: "mirrorMoon",
    MOONLIGHT: "moonlight",
    ELEMENTAL_CRYSTALS: "elementalCrystals",
    SELENIAN: "selenian",
    LUNACY: "lunacy",
    REFRACTED_DIVINITY: "refractedDivinity",
    PRISMATIC: "prismatic",
    MYCELIUM: "mycelium",
    MOONDUST: "moondust",
    MOONLIT_TEARS: "moonlitTears",
    SILVER_BLOOD: "silverBlood",
    MOON_DEW: "moonDew",
    TURN: "turn",
    ROUND: "round",
    ACTIONS: "actions",
    UPKEEP: "upkeep",
    PLAN: "plan",
    COMMIT: "commit",
    MANA_IMBALANCE: "manaImbalance",

    OFFENSIVE_ACTIONS: "offensiveActions",
    DEFENSIVE_ACTIONS: "defensiveActions",
    TRANSFORMATIVE_ACTIONS: "transformativeActions",

    MOON_PHASE: "moonPhase",

    FRAGILITY: "fragility",
    DAMAGE_BONUS: "dmgBonus",
    WEAKNESS: "weakness",
    EFFECTIVE_DEF: "effectiveDef",
    FUNERARY_URN: "funeraryUrn",

    HARMONY: "harmony",
    DISSONANCE: "dissonance",

    NEBULA: "nebula",
    STARBLIGHT: "starblight",
    CONSTELLATION: "constellation",
    NOVA: "nova",
    CRIMSON_CONSTELLATION: "crimsonConstellation",
    AZURE_CONSTELLATION: "azureConstellation",

    STARFLARE: "starflare",
    FIRMAMENT: "firmament",
    STARLIT_HEAVENS: "starlitHeavens",

    GRAVITATION: "gravitation",
    SINGULARITY: "singularity",

    // Runic Array
    RUNES: "runes",
    RUNIC_ARRAY: "runicArray",
    VISIONARY: "visionary",
    RECOLLECTION: "recollection",
    PRECOGNITION: "precognition",
    CONJECTURE: "conjecture",
    BAD_OMEN: "badOmen",
    PAST_MEMORIES: "pastMemories",
});

export const runeKeys = Object.freeze({
    EMPTY: "empty",
    URD: "urd",
    VERDANDI: "verdandi",
    SKULD: "skuld",
});

export const moonKeys = Object.freeze({
    HIDDEN: "hidden",
    WAXING: "waxing",
    WANING: "waning",
    BLOODSTAINED: "bloodstained",
    CORONAL: "coronal",
});

export const entryTypes = Object.freeze({
    ACTION: "action",
    STATE: "state",
    DAMAGE_TYPE: "damageType",
    FIELD_EFFECT: "fieldEffect",
    MECHANIC: "mechanic",
    ATTRIBUTES: "stat",
    MITIGATION_RESOURCE: "mitigationResource",
    FREE_RESOURCE: "freeResource",
    LIMITED_RESOURCE: "limitedResource",
    CATEGORY: "category",
    BATTLE_PHASE: "battlePhase",
    FIXED_RESOURCE: "fixedResource",
    STAR: "star",
    RANKED_RESOURCE: "rankedResource",
    OVERFLOWN_RESOURCE: "overflownResource",
    DAMAGE_MODIFIERS: "damageModifiers",
    OFFENSIVE_ACTION: "offensiveActions",
    DEFENSIVE_ACTION: "defensiveActions",
    TRANSFORMATIVE_ACTION: "transformativeActions",
    BASE_ATTRIBUTES: "baseStats",
    SPECIAL_ATTRIBUTES: "alternateStats",
    RUNES: "runes",
});

export const starfallPhases = Object.freeze({
    STARFALL_INIT: "starfallInit",
    RED_STAR: effectKeys.RED_STAR,
    ORANGE_STAR: effectKeys.ORANGE_STAR,
    YELLOW_STAR: effectKeys.YELLOW_STAR,
    GREEN_STAR: effectKeys.GREEN_STAR,
    BLUE_STAR: effectKeys.BLUE_STAR,
    INDIGO_STAR: effectKeys.INDIGO_STAR,
    VIOLET_STAR: effectKeys.VIOLET_STAR,
    STARFALL_END: "starfallEnd",
});

export const playerTurnPhases = Object.freeze({
    UPKEEP: "upkeep",
    PLAN: "plan",
    COMMIT: "commit",
});

export const progKeys = Object.freeze({
    ALWAYS_OPEN: 0,
    DEFEATED: 1,
    OPEN_UNDEFEATED: 2,
    LOCKED: 3,
});

export const eventKeys = Object.freeze({
    BATTLE_START: "battleStart",
    BATTLE_END: "battleEnd",
    ROUND_START: "roundStart",
    ROUND_END: "roundEnd",
    PLAYER_TURN_START: "playerTurnStart",
    USE_ACTION: "useAction",
    SET_ELEMENT: "setElement",
    SET_STAR: "setStar",
    SET_MASS_STARS: "setMassStars",
    TURN_UPKEEP: "turnUpkeep",
    TURN_COMMIT: "turnCommit",
    STAR_ACTIVATION: "starActivation",
    MOON_PHASE: "moonPhase",
    VICTORY: "victory",
    DEFEAT: "defeat",
    DRAW: "draw",
    STARFALL_START: "starfallStart",
    FAILED_ACTION: "failedAction",
});
