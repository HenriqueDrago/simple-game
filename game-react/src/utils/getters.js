import { actionKeys, effectKeys } from "./enums";

export const getUmbralActions = () => [
    {
        key: actionKeys.BLACK_MAYHEM,
        label: "Black Mayhem",
    },
    {
        key: actionKeys.SHADOW_MANTLE,
        label: "Shadow Mantle",
    },
    {
        key: actionKeys.RITUAL_OF_ASH,
        label: "Ritual Of Ash",
    },
    {
        key: actionKeys.DARK_PROMISE,
        label: "Dark Promise",
    },
];

export const getAngelActions = (isEyeOpen) => [
    // Good actions
    {
        key: actionKeys.GRACE_OF_HEAVENS,
        label: "Grace of heavens",
        disabled: !isEyeOpen,
    },
    {
        key: actionKeys.CELESTIAL_SCALE,
        label: "Celestial Scale",
        disabled: !isEyeOpen,
    },
    {
        key: actionKeys.SACRAMENT,
        label: "Sacrament",
        disabled: !isEyeOpen,
    },
    {
        key: actionKeys.GIFT_OF_APOTHEOSIS,
        label: "Gift of Apotheosis",
        disabled: !isEyeOpen,
    },

    // Bad Actions
    {
        key: actionKeys.SERAPH_OF_CONDEMNATION,
        label: "Seraph of Condemnation",
        disabled: isEyeOpen,
    },
    {
        key: actionKeys.BAPTISM_OF_THE_FLAMES,
        label: "Baptism of the Flames",
        disabled: isEyeOpen,
    },

    {
        key: actionKeys.THE_WORD_MADE_FLESH,
        label: "The Word Made Flesh",
        disabled: isEyeOpen,
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
    if (currEntity.states[effectKeys.ZENITH_OF_MORTALITY]) {
        return [
            {
                key: actionKeys.ASCEND,
                label: "Ascend",
                specialClass: "ascend-button",
            },
        ];
    }

    if (currEntity.states.thermalOverload) {
        return [
            {
                key: actionKeys.MELTDOWN,
                label: "Meltdown",
                specialClass: "meltdown-button",
            },
        ];
    }

    return [
        {
            key: actionKeys.ATTACK,
            label: "Attack",
        },
        {
            key: actionKeys.GUARD,
            label: "Guard",
        },
        {
            key: actionKeys.HEAL,
            label: "Heal",
        },
        {
            key: actionKeys.SPECIAL_ATTACK,
            label: "Special Attack",

            disabled: !canUseSpAtk,
        },
        {
            key: actionKeys.SACRIFICE,
            label: "Self Sacrifice",
        },
        arrayActive
            ? {
                  key: actionKeys.CURSE,
                  label: "Curse",
              }
            : {
                  key: actionKeys.ARRAY,
                  label: "Array",
              },
        currEntity.states.weaponsDeployed
            ? {
                  key: actionKeys.LASER,
                  label: "Laser",
              }
            : {
                  key: actionKeys.DEPLOY,
                  label: "Deploy",
                  disabled: !canUseDeploy,
              },

        !currEntity.states.resonant
            ? {
                  key: actionKeys.ATTUNE,
                  label: "Attune",
              }
            : currEntity.sonority > 0
              ? {
                    key: actionKeys.BABEL,
                    label: "Babel",
                }
              : currEntity.sonority < 0
                ? {
                      key: actionKeys.SOUND_OF_SILENCE,
                      label: "The Sound of Silence",
                  }
                : {
                      key: actionKeys.DA_CAPO,
                      label: "Da Capo",
                  },

        {
            key: actionKeys.ALIGN,
            label: "Align",
        },

        {
            key: actionKeys.CHART,
            label: "Chart",
        },

        {
            key: actionKeys.SHADOW_PACT,
            label: "Shadow Pact",
        },

        {
            key: actionKeys.AEGIS,
            label: "Aegis",
        },
    ];
};
