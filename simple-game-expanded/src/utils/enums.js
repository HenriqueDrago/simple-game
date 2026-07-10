export const turnStatus = Object.freeze({
    SETUP: 0,
    VICTORY: 1,
    DEFEAT: 2,
    DRAW: 3,
    ONGOING: 4,
    ROUND_TRANSITION: 5,
    STARFALL_TRANSITION: 6,
});

export const roundPhases = Object.freeze({
    ROUND_START: 0,
    PLAYER_ONE_TURN: 1,
    PLAYER_TWO_TURN: 2,
    ARRAY_TURN: 11,
    EMINENCE_TURN: 12,
    P1_STARS_TURN: 13,
    MOON_TURN: 14,
    P2_STARS_TURN: 15,
    SPECIAL_EMINENCE_TURN: 16,
    MINI_ARRAY_TURN: 17,

    ROUND_END: 99,
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
    ELEMENTALIST: "elementalist",
    STARFARER: "starfarer",
});

export const sdmKeys = Object.freeze({
    CUSTOM: "custom",
    BEST: "best",
    FULL_DEF: "fullDef",
    FULL_STR: "fullStr",
});

export const elementalKeys = Object.freeze({
    DULLED: 0,

    NATURE: 1,
    FROST: 2,
    SCORCH: 3,

    OCEAN: 23,
    ASH: 13,
    WITHER: 12,

    ALBEDO: 123,

    SHATTERED: -1,
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
    ATTUNE: "attune",
    DA_CAPO: "daCapo",
    SOUND_OF_SILENCE: "soundOfSilence",
    DEPLOY: "deploy",
    LASER: "laser",
    MELTDOWN: "meltdown",
    BABEL: "babel",
    CHART: "chart",

    ASCEND: "ascend",

    BAPTISM_OF_THE_FLAMES: "baptismOfTheFlames",
    CELESTIAL_SCALE: "celestialScale",
    HYMNS_OF_SANCTIFICATION: "hymnsOfSanctification",
    GIFT_OF_APOTHEOSIS: "giftOfApotheosis",

    SERAPH_OF_CONDEMNATION: "seraphOfCondemnation",
    GLIMPSE_OF_PANDEMONIUM: "glimpseOfPandemonium",
    EDICT_OF_SEVERANCE: "edictOfSeverance",
    THE_WORD_MADE_FLESH: "theWordMadeFlesh",

    JUDGEMENT: "judgement",

    REFRACT: "refract",
    MIRROR: "mirror",
    LUNAR_STRIKE: "lunarStrike",
    LUNAR_VEIL: "lunarVeil",
    LUNAR_GROWTH: "lunarGrowth",
    LUNAR_SMITE: "lunarSmite",
    LUNAR_TIDE: "lunarTide",
    LUNAR_SHROUD: "lunarShroud",
    SHATTER: "shatter",
    CHALK: "chalk",
});

export const effectKeys = Object.freeze({
    GUARDING_STATE: "guarding",
    MANA_BLEED: "manaBleed",

    MANA_OVERFLOW: "manaOverflow",
    SACRIFICIAL_STATE: "sacrificial",

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

    FROST: "frost",
    NATURE: "nature",
    SCORCH: "scorch",

    SONORITY: "sonority",
    RESONANT: "resonant",
    HALO: "halo",
    ENLIGHTENMENT: "currEnlit",
    MAX_ENLIGHTENMENT: "maxEnlit",
    ASCENDENCE_OF_SPIRIT: "ascendenceOfSpirit",
    EYE_OF_HEAVENS: "eyeOfHeavens",
    PHYSICAL_DAMAGE: dmgTypes.PHYSICAL,
    PIERCING_DAMAGE: dmgTypes.PIERCING,
    TRUE_DAMAGE: dmgTypes.TRUE,
    DEPLOYMENT: "deployment",
    WEAPONS_DEPLOYED: "weaponsDeployed",
    OVERHEAT: "currOverheat",
    THERMAL_OVERLOAD: "thermalOverload",
    VENTING: "venting",
    CUTOFF_WINGS: "cutoffWings",
    INSIGHT: "currInsight",
    MAX_INSIGHT: "maxInsight",
    BLEAK_DECEPTION: "bleakDeception",
    SACRED_FLAMES: "sacredFlames",

    BURDEN_OF_STIGMA: "burdenOfStigma",
    REVELATION: "revelation",
    RUNIC_ARRAY: "runicArray",
    HEALTH: "currHp",
    MANA: "currMana",
    TARNISHED_SIN: "currTarnishedSin",
    MAX_MANA: "maxMana",
    MAX_HEALTH: "maxHp",
    STR: "str",
    DEF: "def",
    DAMAGE_REDUCTION: "dr",
    DEF_EFFECTIVENESS: "defEffect",
    ZENITH_OF_MORTALITY: "zenithOfMortality",

    WHITE_STAR: "white",
    GRAY_STAR: "gray",
    RED_STAR: "red",
    ORANGE_STAR: "orange",
    YELLOW_STAR: "yellow",
    GREEN_STAR: "green",
    BLUE_STAR: "blue",
    INDIGO_STAR: "indigo",
    VIOLET_STAR: "violet",

    DIMMED_RED_STAR: "dimRed",
    DIMMED_ORANGE_STAR: "dimOrange",
    DIMMED_YELLOW_STAR: "dimYellow",
    DIMMED_GREEN_STAR: "dimGreen",
    DIMMED_BLUE_STAR: "dimBlue",
    DIMMED_INDIGO_STAR: "dimIndigo",
    DIMMED_VIOLET_STAR: "dimViolet",

    RED_TRAIL: "trailRed",
    ORANGE_TRAIL: "trailOrange",
    YELLOW_TRAIL: "trailYellow",
    GREEN_TRAIL: "trailGreen",
    BLUE_TRAIL: "trailBlue",
    INDIGO_TRAIL: "trailIndigo",
    VIOLET_TRAIL: "trailViolet",

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
    RED_TRAILFALL: "redTrailfall",
    ORANGE_TRAILFALL: "orangeTrailfall",
    YELLOW_TRAILFALL: "yellowTrailfall",
    GREEN_TRAILFALL: "greenTrailfall",
    BLUE_TRAILFALL: "blueTrailfall",
    INDIGO_TRAILFALL: "indigoTrailfall",
    VIOLET_TRAILFALL: "violetTrailfall",

    INSPIRATION: "inspiration",

    SEVERED_TIME: "severedTime",

    DIVINE_SPARK: "currDivineSpark",

    ABANDONED_BY_GRACE: "abandonedByGrace",
    ANOINTED_PROXY: "anointedProxy",

    AUGMENTED_ORANGE_STAR: "augOrange",

    DYNAMO: "dynamo",
    ENERGY_LEVEL: "energyLevel",

    MIRRORED_MOON: "mirrorMoon",
    MOONLIGHT: "moonlight",
    ELEMENTAL_CRYSTALS: "elementalCrystals",
    SELENIAN: "selenian",

    LUNACY: "lunacy",
    REFRACTED_DIVINITY: "refractedDivinity",
    PRISMATIC: "prismatic",
    GIBBOUS: "gibbous",
    MOONDUST: "moondust",
    MOONLIT_TEARS: "moonlitTears",
    SILVER_BLOOD: "silverBlood",
});

export const eyeKeys = Object.freeze({
    DORMANT: 0,
    OPEN: 1,
    CLOSED: 2,
});

export const moonKeys = Object.freeze({
    HIDDEN: 0,
    WAXING: 1,
    WANING: 2,
    BLOODSTAINED: 11,
    CORONAL: 12,
});

export const entryTypes = Object.freeze({
    ACTION: "ACTION",
    STATE: "STATE",
    DAMAGE_TYPE: "DAMAGE TYPE",
    FIELD_EFFECT: "FIELD EFFECT",
    MECHANIC: "MECHANIC",
    STAT: "STAT",
    MITIGATION_RESOURCE: "MITIGATION RESOURCE",
    FREE_RESOURCE: "FREE RESOURCE",
    LIMITED_RESOURCE: "LIMITED RESOURCE",
    CATEGORY: "CATEGORY",
    BATTLE_PHASE: "BATTLE PHASE",
    FIXED_RESOURCE: "FIXED RESOURCE",
    STAR: "STAR",
});

export const starfallPhases = Object.freeze({
    STARFALL_INIT: 0,
    RED_STAR: effectKeys.RED_STAR,
    ORANGE_STAR: effectKeys.ORANGE_STAR,
    YELLOW_STAR: effectKeys.YELLOW_STAR,
    GREEN_STAR: effectKeys.GREEN_STAR,
    BLUE_STAR: effectKeys.BLUE_STAR,
    INDIGO_STAR: effectKeys.INDIGO_STAR,
    VIOLET_STAR: effectKeys.VIOLET_STAR,
    RED_TRAIL: effectKeys.RED_TRAIL,
    ORANGE_TRAIL: effectKeys.ORANGE_TRAIL,
    YELLOW_TRAIL: effectKeys.YELLOW_TRAIL,
    GREEN_TRAIL: effectKeys.GREEN_TRAIL,
    BLUE_TRAIL: effectKeys.BLUE_TRAIL,
    INDIGO_TRAIL: effectKeys.INDIGO_TRAIL,
    VIOLET_TRAIL: effectKeys.VIOLET_TRAIL,
});

export const playerTurnPhases = Object.freeze({
    UPKEEP: 0,
    PLAN: 1,
    COMMIT: 2,
});

export const progKeys = Object.freeze({
    ALWAYS_OPEN: 0,
    DEFEATED: 1,
    OPEN_UNDEFEATED: 2,
    LOCKED: 3,
});

export const mechanicKeys = Object.freeze({
    TURN: "turn",
    ROUND: "round",
    ACTIONS: "actions",
    UPKEEP: "upkeep",
    PLAN: "plan",
    COMMIT: "commit",
    MANA_IMBALANCE: "manaImbalance",

    RUNIC_PULSE: "runicPulse",
    MANA_SIPHON: "manaSiphon",

    EMANATION: "emanation",
    OFFENSIVE_ACTIONS: "offensiveActions",
    DEFENSIVE_ACTIONS: "defensiveActions",
    TRANSFORMATIVE_ACTIONS: "transformativeActions",
    ACTS_OF_BENEDICTION: "actsOfBenediction",
    ACTS_OF_MALEDICTION: "actsOfMalediction",

    MOON_PHASE: "moonPhase",

    ANOINTMENT: "anointment",
});
