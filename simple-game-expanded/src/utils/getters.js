import { actionKeys, aiKeys, effectKeys, progKeys } from "./enums";

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

export const getAngelActions = () => [
    // Good actions
    {
        key: actionKeys.BAPTISM_OF_THE_FLAMES,
        label: "Baptism of the Flames",
        specialClass: "good-angel-button"
    },
    {
        key: actionKeys.CELESTIAL_SCALE,
        label: "Celestial Scale",
        specialClass: "good-angel-button"
    },
    {
        key: actionKeys.HYMNS_OF_SANCTIFICATION,
        label: "Hymns of Sanctification",
        specialClass: "good-angel-button"
    },
    {
        key: actionKeys.GIFT_OF_APOTHEOSIS,
        label: "Gift of Apotheosis",
        specialClass: "good-angel-button"
    },

    // Bad Actions
    {
        key: actionKeys.SERAPH_OF_CONDEMNATION,
        label: "Seraph of Condemnation",
        specialClass: "bad-angel-button"
    },
    {
        key: actionKeys.GLIMPSE_OF_PANDEMONIUM,
        label: "Glimpse of Pandemonium",
        specialClass: "bad-angel-button"
    },
    {
        key: actionKeys.EDICT_OF_SEVERANCE,
        label: "Edict of Severance",
        specialClass: "bad-angel-button"
    },
    {
        key: actionKeys.THE_WORD_MADE_FLESH,
        label: "The Word Made Flesh",
        specialClass: "bad-angel-button"
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

export const getJudgement = () => {
    return [
        {
            key: actionKeys.JUDGEMENT,
            label: "Judgement",
            specialClass: "ascend-button"
        }
    ]
}

export const getNormalActions = (
    arrayActive,
    currEntity,
    canUseSpAtk,
    canUseDeploy,
    progMode,
    progStatus
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
            disabled: false,
        },
        {
            key: actionKeys.GUARD,
            label: "Guard",
            disabled: false,
        },
        {
            key: actionKeys.HEAL,
            label: "Heal",
            disabled: false,
        },
        {
            key: actionKeys.SPECIAL_ATTACK,
            label: "Special Attack",
            disabled: !canUseSpAtk,
        },
        {
            key: actionKeys.SACRIFICE,
            label: "Self Sacrifice",
            disabled: progMode && !(progStatus[aiKeys.BLOODKNIGHT] === progKeys.DEFEATED || progStatus[aiKeys.BLOODKNIGHT] === progKeys.ALWAYS_OPEN)
        },
        arrayActive
            ? {
                  key: actionKeys.CURSE,
                  label: "Curse",
                  disabled: progMode && !(progStatus[aiKeys.HEXER] === progKeys.DEFEATED || progStatus[aiKeys.HEXER] === progKeys.ALWAYS_OPEN)
              }
            : {
                  key: actionKeys.ARRAY,
                  label: "Array",
                  disabled: progMode && !(progStatus[aiKeys.HEXER] === progKeys.DEFEATED || progStatus[aiKeys.HEXER] === progKeys.ALWAYS_OPEN)
              },
        currEntity.states.weaponsDeployed
            ? {
                  key: actionKeys.LASER,
                  label: "Laser",
                  disabled: progMode && !(progStatus[aiKeys.CYBORG] === progKeys.DEFEATED || progStatus[aiKeys.CYBORG] === progKeys.ALWAYS_OPEN)
              }
            : {
                  key: actionKeys.DEPLOY,
                  label: "Deploy",
                  disabled: !canUseDeploy || progMode && !(progStatus[aiKeys.CYBORG] === progKeys.DEFEATED || progStatus[aiKeys.CYBORG] === progKeys.ALWAYS_OPEN),
              },

        !currEntity.states.resonant
            ? {
                  key: actionKeys.ATTUNE,
                  label: "Attune",
                  disabled: progMode && !(progStatus[aiKeys.MAESTRO] === progKeys.DEFEATED || progStatus[aiKeys.MAESTRO] === progKeys.ALWAYS_OPEN)
              }
            : currEntity.sonority > 0
              ? {
                    key: actionKeys.BABEL,
                    label: "Babel",
                    disabled: progMode && !(progStatus[aiKeys.MAESTRO] === progKeys.DEFEATED || progStatus[aiKeys.MAESTRO] === progKeys.ALWAYS_OPEN)
                }
              : currEntity.sonority < 0
                ? {
                      key: actionKeys.SOUND_OF_SILENCE,
                      label: "The Sound of Silence",
                      disabled: progMode && !(progStatus[aiKeys.MAESTRO] === progKeys.DEFEATED || progStatus[aiKeys.MAESTRO] === progKeys.ALWAYS_OPEN)
                  }
                : {
                      key: actionKeys.DA_CAPO,
                      label: "Da Capo",
                      disabled: progMode && !(progStatus[aiKeys.MAESTRO] === progKeys.DEFEATED || progStatus[aiKeys.MAESTRO] === progKeys.ALWAYS_OPEN)
                  },

        {
            key: actionKeys.ALIGN,
            label: "Align",
            disabled: progMode && !(progStatus[aiKeys.ELEMENTALIST] === progKeys.DEFEATED || progStatus[aiKeys.ELEMENTALIST] === progKeys.ALWAYS_OPEN)
        },

        {
            key: actionKeys.CHART,
            label: "Chart",
            disabled: progMode && !(progStatus[aiKeys.STARFARER] === progKeys.DEFEATED || progStatus[aiKeys.STARFARER] === progKeys.ALWAYS_OPEN)
        },

        {
            key: actionKeys.SHADOW_PACT,
            label: "Shadow Pact",
            disabled: progMode && !(progStatus[aiKeys.SHADOW_SORCERER] === progKeys.DEFEATED || progStatus[aiKeys.SHADOW_SORCERER] === progKeys.ALWAYS_OPEN)
        },

        {
            key: actionKeys.AEGIS,
            label: "Aegis",
            disabled: progMode && !(progStatus[aiKeys.PALADIN] === progKeys.DEFEATED || progStatus[aiKeys.PALADIN] === progKeys.ALWAYS_OPEN)
        },
    ];
};
