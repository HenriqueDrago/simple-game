import { actionKeys, effectKeys } from "./enums";

export const getUmbralActions = () => [
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

export const getGoodAngelActions = () => [
    {
        key: actionKeys.GRACE_OF_HEAVENS,
        label: "Grace of heavens",
        hoverKeys: [
            actionKeys.GRACE_OF_HEAVENS,
            effectKeys.RESOURCES,
        ],
    },
    {
        key: actionKeys.CELESTIAL_SCALE,
        label: "Celestial Scale",
        hoverKeys: [
            actionKeys.CELESTIAL_SCALE,
            effectKeys.ENLIGHTENMENT,
            effectKeys.INSIGHT,
        ],
    },
    {
        key: actionKeys.SACRAMENT,
        label: "Sacrament",
        hoverKeys: [
            actionKeys.SACRAMENT,
            effectKeys.BENEDICTION,
            effectKeys.REVELATION,
        ],
    },

    {
        key: actionKeys.GIFT_OF_APOTHEOSIS,
        label: "Gift of Apotheosis",
        hoverKeys: [
            actionKeys.GIFT_OF_APOTHEOSIS,
            effectKeys.ASCENDENCE_OF_SPIRIT,
        ],
    },
];

export const getBadAngelActions = () => [
    {
        key: actionKeys.SERAPH_OF_CONDEMNATION,
        label: "Seraph of Condemnation",
        hoverKeys: [
            actionKeys.SERAPH_OF_CONDEMNATION,
        ],
    },
    {
        key: actionKeys.BAPTISM_OF_THE_FLAMES,
        label: "Baptism of the Flames",
        hoverKeys: [actionKeys.BAPTISM_OF_THE_FLAMES, effectKeys.SACRED_FLAMES, effectKeys.RESOURCES],
    },

    {
        key: actionKeys.THE_WORD_MADE_FLESH,
        label: "The Word Made Flesh",
        hoverKeys: [
            actionKeys.THE_WORD_MADE_FLESH,
            effectKeys.ASCENDENCE_OF_SPIRIT,
            effectKeys.CUTOFF_WINGS,
            effectKeys.BURDEN_OF_STIGMA,
        ],
    },
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

        {
            key: actionKeys.ALIGN,
            label: "Align",
            hoverKeys: [
                actionKeys.ALIGN,
                effectKeys.ALIGNED,
                effectKeys.WHEEL,
                effectKeys.ELEMENTAL_ESSENCE,
                effectKeys.NATURE,
                effectKeys.OVERGROWTH,
                effectKeys.FROST,
                effectKeys.CRYOGENESIS,
                effectKeys.PERMAFROST,
                effectKeys.SCORCH,
                effectKeys.SCORIA,
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
