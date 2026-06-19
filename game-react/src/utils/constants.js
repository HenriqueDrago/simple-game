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
const MANA_SHACKLE_TURN_GAIN = 3;

const MAX_OVERHEAT = 10;
const VENTING_OVERHEAT_LOSS = 5;

const HALO_GEN_MULT = 2;

const ELEMENTAL_RESOURCE_GAIN = 3;
const INITIAL_ELEMENTAL_ESSENCE_GAINED = 0;

const SAC_HP_CONSUMPTION = 0.5;

const SHADOW_PACT_BURN = 5;

const RADIANT_DEF_EFFECT_MULTIPLIER = 0;

const NATURE_MANA_REGEN = 3;
const NATURE_HP_REGEN = 2;

const STARTING_SONORORITY = 0;
const SONORITY_LOWER_LIMIT = -5;
const SONORITY_HIGHER_LIMIT = 5;

const MAX_ENLIT = 100;

const INSIGHT_TO_REV_MULT = 0.1

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
    effectKeys.RADIANCE,
    effectKeys.BLOOD_SACRIFICE,
];

const limitedResources = [
    "currOverheat",
    "currMana",
    "currHp",
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
    NATURE_HP_REGEN,
    NATURE_MANA_REGEN,
    STARTING_SONORORITY,
    SONORITY_LOWER_LIMIT,
    SONORITY_HIGHER_LIMIT,
    VENTING_OVERHEAT_LOSS,
    MAX_ENLIT,
    INSIGHT_TO_REV_MULT
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
            str: 4,
            def: 6,
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
    actionKeys.ALIGN,
    actionKeys.HALT,
];

export const actionsClass = {
    offensiveActions,
    defensiveActions,
    transformativeActions,
};

export const UMBRAL_ACTIONS = [
    {
        key: actionKeys.BLACK_MAYHEM,
        label: "Black Mayhem",
        hoverKeys: [
            actionKeys.BLACK_MAYHEM,
            effectKeys.RESOURCES,
            effectKeys.SHADOWFLAME,
            effectKeys.CINDERS,
            effectKeys.LINGERING_EMBER,
            effectKeys.UNRELENTING_SHADOWS,
        ],
    },
    {
        key: actionKeys.SHADOW_MANTLE,
        label: "Shadow Mantle",
        hoverKeys: [
            actionKeys.SHADOW_MANTLE,
            effectKeys.UNRELENTING_SHADOWS,
            effectKeys.SHADOWFLAME,
            effectKeys.DARK_EMBRACE,
        ],
    },
    {
        key: actionKeys.RITUAL_OF_ASH,
        label: "Ritual Of Ash",
        hoverKeys: [
            actionKeys.RITUAL_OF_ASH,
            effectKeys.SHADOWFLAME,
            effectKeys.LINGERING_EMBER,
        ],
    },
    {
        key: actionKeys.DARK_PROMISE,
        label: "Dark Promise",
        hoverKeys: [
            actionKeys.DARK_PROMISE,
            effectKeys.UMBRAL_CORE,
            effectKeys.DIMMING_DARKNESS,
            effectKeys.SHADOWFLAME,
            effectKeys.LINGERING_EMBER,
            effectKeys.CINDERS,
            effectKeys.UNRELENTING_SHADOWS,
        ],
    },
];

export const ANGEL_ACTIONS = [
    {
        key: actionKeys.SPARK_OF_DIVINITY,
        label: "Spark of Divinity",
        hoverKeys: [
            actionKeys.SPARK_OF_DIVINITY,
            effectKeys.SACRED_FLAMES,
            effectKeys.REVELATION,
            effectKeys.INSPIRATION,
            effectKeys.RESOURCES,
        ],
    },
    {
        key: actionKeys.HEAVENLY_SCALE,
        label: "Heavenly Scale",
        hoverKeys: [
            actionKeys.HEAVENLY_SCALE,
            effectKeys.ENLIGHTENMENT,
            effectKeys.INSIGHT,
            effectKeys.INSPIRATION,
        ],
    },
    {
        key: actionKeys.SERAPH_OF_RECLAMATION,
        label: "Seraph of Reclamation",
        hoverKeys: [
            actionKeys.SERAPH_OF_RECLAMATION,
            effectKeys.SACRED_FLAMES,
            effectKeys.INSIGHT,
        ],
    },
    {
        key: actionKeys.THE_WORD_MADE_FLESH,
        label: "The Word Made Flesh",
        hoverKeys: [actionKeys.THE_WORD_MADE_FLESH, effectKeys.CUTOFF_WINGS],
    },
];

export const getNormalActions = (
    arrayActive,
    currEntity,
    canUseSpAtk,
    canUseDeploy,
) => {
    if (currEntity.states.thermalOverload) {
        return [
            {
                key: actionKeys.MELTDOWN,
                label: "Meltdown",
                hoverKeys: [
                    actionKeys.MELTDOWN,
                    effectKeys.PHYSICAL_DAMAGE,
                    effectKeys.VENTING,
                ],
                isMeltdown: true,
            },
        ];
    }

    return [
        {
            key: actionKeys.ATTACK,
            label: "Attack",
            hoverKeys: [actionKeys.ATTACK, effectKeys.PHYSICAL_DAMAGE],
        },
        {
            key: actionKeys.GUARD,
            label: "Guard",
            hoverKeys: [actionKeys.GUARD, effectKeys.GUARDING_STATE],
        },
        {
            key: actionKeys.HEAL,
            label: "Heal",
            hoverKeys: [actionKeys.HEAL, effectKeys.POISON],
        },
        {
            key: actionKeys.SPECIAL_ATTACK,
            label: "Special Attack",
            hoverKeys: [
                actionKeys.SPECIAL_ATTACK,
                effectKeys.PIERCING_DAMAGE,
                effectKeys.MANA_IMBALANCE,
                effectKeys.MANA_OVERFLOW,
            ],
            disabled: !canUseSpAtk,
        },
        arrayActive
            ? {
                  key: actionKeys.CURSE,
                  label: "Curse",
                  hoverKeys: [
                      actionKeys.CURSE,
                      effectKeys.POISON,
                      effectKeys.SHACKLED_MANA,
                      effectKeys.RUNIC_ARRAY,
                  ],
              }
            : {
                  key: actionKeys.ARRAY,
                  label: "Array",
                  hoverKeys: [
                      actionKeys.ARRAY,
                      effectKeys.RUNIC_ARRAY,
                      effectKeys.SHACKLED_MANA,
                      effectKeys.THORNED_SHACKLES,
                  ],
              },
        {
            key: actionKeys.SACRIFICE,
            label: "Self Sacrifice",
            hoverKeys: [
                actionKeys.SACRIFICE,
                effectKeys.TRUE_DAMAGE,
                effectKeys.SACRIFICIAL_STATE,
                effectKeys.BLOOD_SACRIFICE,
                effectKeys.MANA_BLEED,
            ],
        },
        {
            key: actionKeys.AEGIS,
            label: "Aegis",
            hoverKeys: [
                actionKeys.AEGIS,
                effectKeys.RADIANT,
                effectKeys.HALO,
                effectKeys.ENLIGHTENMENT,
                effectKeys.CUTOFF_WINGS,
                effectKeys.INSIGHT,
                effectKeys.INSPIRATION,
            ],
        },
        {
            key: actionKeys.SHADOW_PACT,
            label: "Shadow Pact",
            hoverKeys: [
                actionKeys.SHADOW_PACT,
                effectKeys.UMBRAL_CORE,
                effectKeys.SHADOWFLAME,
                effectKeys.RESOURCES,
            ],
        },
        currEntity.states.aligned
            ? {
                  key: actionKeys.HALT,
                  label: "Halt",
                  hoverKeys: [
                      actionKeys.HALT,
                      effectKeys.ELEMENTAL_ESSENCE,
                      effectKeys.WHEEL,
                  ],
              }
            : {
                  key: actionKeys.ALIGN,
                  label: "Align",
                  hoverKeys: [
                      actionKeys.ALIGN,
                      effectKeys.ALIGNED,
                      effectKeys.WHEEL,
                      effectKeys.NATURE,
                      effectKeys.OVERGROWTH,
                      effectKeys.FROST,
                      effectKeys.CRYOGENESIS,
                      effectKeys.PERMAFROST,
                      effectKeys.SCORCH,
                      effectKeys.SCORIA
                  ],
              },
        !currEntity.states.resonant
            ? {
                  key: actionKeys.ATTUNE,
                  label: "Attune",
                  hoverKeys: [
                      actionKeys.ATTUNE,
                      effectKeys.RESONANT,
                      effectKeys.SONORITY,
                  ],
              }
            : currEntity.sonority > 0
              ? {
                    key: actionKeys.BABEL,
                    label: "Babel",
                    hoverKeys: [
                        actionKeys.BABEL,
                        effectKeys.SONORITY,
                        effectKeys.TRUE_DAMAGE,
                    ],
                }
              : currEntity.sonority < 0
                ? {
                      key: actionKeys.SOUND_OF_SILENCE,
                      label: "The Sound of Silence",
                      hoverKeys: [
                          actionKeys.SOUND_OF_SILENCE,
                          effectKeys.SONORITY,
                          effectKeys.RESOURCES,
                      ],
                  }
                : {
                      key: actionKeys.DA_CAPO,
                      label: "Da Capo",
                      hoverKeys: [actionKeys.DA_CAPO, effectKeys.SONORITY],
                  },
        currEntity.states.weaponsDeployed
            ? {
                  key: actionKeys.LASER,
                  label: "Laser",
                  hoverKeys: [
                      actionKeys.LASER,
                      effectKeys.PIERCING_DAMAGE,
                      effectKeys.OVERHEAT,
                  ],
              }
            : {
                  key: actionKeys.DEPLOY,
                  label: "Deploy",
                  hoverKeys: [actionKeys.DEPLOY, effectKeys.DEPLOYMENT],
                  disabled: !canUseDeploy,
              },
        {
            key: actionKeys.CHART,
            label: "Chart",
            hoverKeys: [],
            disabled: true,
        },
    ];
};

export const stackCounters = [
    [
        "Blood Sacrifice",
        effectKeys.BLOOD_SACRIFICE,
        "#ff4d4d",
        "rgba(255, 77, 77, 0.1)",
    ],
    ["Poison", effectKeys.POISON, "#32cd32", "rgba(50, 205, 50, 0.1)"],
    [
        "Shackled Mana",
        effectKeys.SHACKLED_MANA,
        "#3f51b5",
        "rgba(63, 81, 181, 0.15)",
    ],
    [
        "Shadowflame",
        effectKeys.SHADOWFLAME,
        "#ff1493",
        "rgba(255, 20, 147, 0.15)",
    ],
    [
        "Lingering Ember",
        effectKeys.LINGERING_EMBER,
        "#e998fd",
        "rgba(245, 208, 254, 0.12)",
    ],
    ["Cinders", effectKeys.CINDERS, "#a9a9a9", "rgba(169, 169, 169, 0.15)"],
    [
        "Unrelenting Shadows",
        effectKeys.UNRELENTING_SHADOWS,
        "#9370db",
        "rgba(147, 112, 219, 0.1)",
    ],
    [
        "Cryogenesis",
        effectKeys.CRYOGENESIS,
        "#00ffff",
        "rgba(176, 216, 222, 0.15)",
    ],
    ["Radiance", effectKeys.RADIANCE, "#fff59d", "rgba(255, 245, 157, 0.15)"],
    ["Halo", effectKeys.HALO, "#fff9c4", "rgba(255, 249, 196, 0.15)"],
    ["Inspiration", effectKeys.INSPIRATION, "white", "rgba(255, 255, 255, 0.15)"],
    ["Sacred Flames", effectKeys.SACRED_FLAMES, "gold", "rgba(255, 245, 157, 0.15)"],
];

export const getSonorityColor = (sonority) => {
    const colors = {
        "-5": "#ff4500",
        "-4": "#ff6a33",
        "-3": "#ff8f66",
        "-2": "#ffb499",
        "-1": "#ffdacc",
        0: "#ffffff",
        1: "#ccf2ff",
        2: "#99e5ff",
        3: "#66d9ff",
        4: "#33ccff",
        5: "#00bfff",
    };
    return colors[sonority] || "#ffffff";
};