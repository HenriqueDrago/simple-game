import { actionKeys, effectKeys, entryTypes } from "./enums";

export const ACTION_DESCRIPTIONS = {
    [actionKeys.ATTACK]: {
        name: "ATTACK",
        type: entryTypes.ACTION,
        description: "Deals PHYSICAL DAMAGE equal to the user's STR.",
    },

    [actionKeys.HEAL]: {
        name: "HEAL",
        type: entryTypes.ACTION,
        description: "Converts MANA into HEALTH. Cleanses POISON.",
    },

    [actionKeys.GUARD]: {
        name: "GUARD",
        type: entryTypes.ACTION,
        description:
            "Restores MANA equal to 30% of MAX MANA and enters GUARDING state until next turn start. Cannot gain MANA OVERFLOW this way.",
    },

    [actionKeys.SPECIAL_ATTACK]: {
        name: "SPECIAL ATTACK",
        type: entryTypes.ACTION,
        description:
            "Consumes 6 MANA to deal PIERCING DAMAGE equal to the user's STR plus MANA IMBALANCE. The target restores MANA equal to the MANA IMBALANCE value.",
    },

    [actionKeys.SACRIFICE]: {
        name: "SELF-SACRIFICE",
        type: entryTypes.ACTION,
        description:
            "Takes TRUE DAMAGE equal to half of current HEALTH. Gains BLOOD SACRIFICE and MAX MANA equal to the HEALTH lost this way, then enters SACRIFICIAL state until next turn start.",
    },

    [actionKeys.ARRAY]: {
        name: "ARRAY",
        type: entryTypes.ACTION,
        description:
            "Envelops the battlefield in a RUNIC ARRAY for 3 turns. Consumes all MANA and MANA OVERFLOW from every entity, then grants SHACKLED MANA equal to the amount consumed on each entity.",
    },

    [actionKeys.CURSE]: {
        name: "CURSE",
        type: entryTypes.ACTION,
        description:
            "Ends RUNIC ARRAY. Then, consumes all SHACKLED MANA from every entity. Each entity gains POISON equal to the amount consumed on self.",
    },

    [actionKeys.SHADOW_PACT]: {
        name: "SHADOW PACT",
        type: entryTypes.ACTION,
        description:
            "Enters UMBRAL CORE and exits all other states. Burns 5 RESOURCES, then gains SHADOWFLAME equal to the amount burned. Cannot burn SHADOWFLAME, LINGERING EMBER and UNRELENTING SHADOWS.",
    },

    [actionKeys.BLACK_MAYHEM]: {
        name: "BLACK MAYHEM",
        type: entryTypes.ACTION,
        description:
            "Burns the target's RESOURCES equal to the user's SHADOWFLAME. Grants CINDERS to the target equal to the RESOURCES burnt. When burning CINDERS, gains LINGERING EMBER on self instead. Cannot burn SHADOWFLAME, LINGERING EMBER and UNRELENTING SHADOWS.",
    },

    [actionKeys.SHADOW_MANTLE]: {
        name: "SHADOW MANTLE",
        type: entryTypes.ACTION,
        description:
            "Gains UNRELENTING SHADOWS equal to SHADOWFLAME on self. Then, enters DARK EMBRACE until next turn start.",
    },

    [actionKeys.RITUAL_OF_ASH]: {
        name: "RITUAL OF ASH",
        type: entryTypes.ACTION,
        description:
            "Extinguishes all SHADOWFLAME on self, then gains LINGERING EMBER equal to the amount lost.",
    },

    [actionKeys.DARK_PROMISE]: {
        name: "DARK PROMISE",
        type: entryTypes.ACTION,
        description:
            "Exits UMBRAL CORE and enters DIMMING DARKNESS until next turn start. Loses all SHADOWFLAME, LINGERING EMBER and CINDERS, then grants UNRELENTING SHADOWS to all entities equal to the SHADOWFLAME lost plus half the LINGERING EMBER lost.",
    },

    [actionKeys.ATTUNE]: {
        name: "ATTUNE",
        type: entryTypes.ACTION,
        description: "Enters RESONANT state.",
    },

    [actionKeys.DA_CAPO]: {
        name: "DA CAPO",
        type: entryTypes.ACTION,
        description:
            "Usable at 0 SONORITY. Restores the user's condition to what it was at the beginning of battle.",
    },

    [actionKeys.SOUND_OF_SILENCE]: {
        name: "THE SOUND OF SILENCE",
        type: entryTypes.ACTION,
        description:
            "Usable at negative SONORITY. Inverses current SONORITY and restores RESOURCES on self by the difference.",
    },

    [actionKeys.BABEL]: {
        name: "BABEL",
        type: entryTypes.ACTION,
        description:
            "Usable at positive SONORITY. Inverses current SONORITY and deals TRUE DAMAGE to the opponent by the difference.",
    },

    [actionKeys.DEPLOY]: {
        name: "DEPLOY",
        type: entryTypes.ACTION,
        description: "Enters DEPLOYMENT state.",
    },

    [actionKeys.LASER]: {
        name: "LASER",
        type: entryTypes.ACTION,
        description:
            "Deals 1 PIERCING DAMAGE and gains OVERHEAT based on the amount of times LASER was used this turn. Does not end turn.",
    },

    [actionKeys.MELTDOWN]: {
        name: "MELTDOWN",
        type: entryTypes.ACTION,
        description:
            "All entities take PHYSICAL DAMAGE based on current OVERHEAT. Then enters VENTING state.",
    },

    [actionKeys.ALIGN]: {
        name: "ALIGN",
        type: entryTypes.ACTION,
        description:
            "If not on ALIGNED state, enters ALIGNED state. If ELEMENTAL WHEEL is inactive, activates ELEMENTAL WHEEL on NATURE and gain 3 of each ELEMENTAL ESSENCE. Otherwise, gains 5 ELEMENTAL ESSENCE of the current element and activates the current element's active effect.",
    },
};

export const STATE_DESCRIPTIONS = {
    [effectKeys.GUARDING_STATE]: {
        name: "GUARDING",
        type: entryTypes.STATE,
        description: "Raises DEF EFFECTIVENESS and DAMAGE REDUCTION by 50%.",
    },

    [effectKeys.SACRIFICIAL_STATE]: {
        name: "SACRIFICIAL",
        type: entryTypes.STATE,
        description: "Raises DAMAGE REDUCTION by 50%.",
    },

    [effectKeys.THORNED_SHACKLES]: {
        name: "THORNED SHACKLES",
        type: entryTypes.STATES,
        description:
            "When suffering PHYSICAL DAMAGE, the attacker takes TRUE DAMAGE equal to their own STR.",
    },

    [effectKeys.UMBRAL_CORE]: {
        name: "UMBRAL CORE",
        type: entryTypes.STATE,
        description:
            "Replaces all actions with SHADOW MANTLE, BLACK MAYHEM, RITUAL OF ASH, and DARK PROMISE. At turn start, if at no SHADOWFLAME and LINGERING EMBER on self, exit UMBRAL CORE and gain BLEAK DECEPTION.",
    },

    [effectKeys.DARK_EMBRACE]: {
        name: "DARK EMBRACE",
        type: entryTypes.STATE,
        description:
            "Raises DAMAGE REDUCTION by 50%. While active, SHADOWFLAME on self does not burn RESOURCES.",
    },

    [effectKeys.DIMMING_DARKNESS]: {
        name: "DIMMING DARKNESS",
        type: entryTypes.STATE,
        description:
            "Does not activate POISON and MANA OVERFLOW effects on self.",
    },

    [effectKeys.ALIGNED]: {
        name: "ALIGNED",
        type: entryTypes.STATE,
        description:
            "While the ELEMENTAL WHEEL is active, suffers the effects of the current element's passive effect. If at least one ALIGNED player is in the battlefield, enables WHEEL TURN at round end.",
    },

    [effectKeys.RESONANT]: {
        name: "RESONANT",
        type: entryTypes.STATE,
        description:
            "Enables SONORITY. Deals higher or lower PHYSICAL DAMAGE and PIERCING DAMAGE according to SONORITY. Takes higher or lower PHYSICAL DAMAGE and PIERCING DAMAGE according to SONORITY. At positive SONORITY, replaces ATTUNE with BABEL. At negative SONORITY, replaces ATTUNE with THE SOUND OF SILENCE. At 0 SONORITY, replaces ATTUNE with DA CAPO.",
    },

    [effectKeys.DEPLOYMENT]: {
        name: "DEPLOYMENT",
        type: entryTypes.STATE,
        description:
            "Raises DAMAGE REDUCTION by 50%. At turn start, becomes WEAPONS DEPLOYED.",
    },

    [effectKeys.WEAPONS_DEPLOYED]: {
        name: "WEAPONS DEPLOYED",
        type: entryTypes.STATE,
        description:
            "Enables OVERHEAT. Replaces DEPLOY with LASER. At 10 or more OVERHEAT, becomes THERMAL OVERLOAD.",
    },

    [effectKeys.THERMAL_OVERLOAD]: {
        name: "THERMAL OVERLOAD",
        type: entryTypes.STATE,
        description: "Enables OVERHEAT. Replaces all actions with MELTDOWN.",
    },

    [effectKeys.VENTING]: {
        name: "VENTING",
        type: entryTypes.STATE,
        description:
            "Enables OVERHEAT. Cannot use DEPLOY, LASER or MELTDOWN. At turn start, loses 5 OVERHEAT. At turn start, if at 0 OVERHEAT, exits VENTING and enters WEAPONS DEPLOYED.",
    },

    [effectKeys.BLEAK_DECEPTION]: {
        name: "BLEAK DECEPTION",
        type: entryTypes.STATE,
        description: "Cannot use SHADOW PACT.",
    },
};

export const RESOURCE_DESCRIPTIONS = {
    [effectKeys.MANA_OVERFLOW]: {
        name: "MANA OVERFLOW",
        type: entryTypes.FREE_RESOURCE,
        description:
            "Used before MANA by abilities that consume MANA. At turn end, loses all MANA OVERFLOW on self and takes TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.SHACKLED_MANA]: {
        name: "SHACKLED MANA",
        type: entryTypes.FREE_RESOURCE,
        description: "Inactive. Cannot be used as MANA.",
    },

    [effectKeys.POISON]: {
        name: "POISON",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, takes TRUE DAMAGE equal to current POISON stacks.",
    },

    [effectKeys.SHADOWFLAME]: {
        name: "SHADOWFLAME",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, burns RESOURCES equal to current SHADOWFLAME, then gains SHADOWFLAME equal to the amount burned. Cannot burn SHADOWFLAME, LINGERING EMBER and UNRELENTING SHADOWS.",
    },

    [effectKeys.LINGERING_EMBER]: {
        name: "LINGERING EMBER",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "Cannot be consumed by SHADOWFLAME. When suffering PHYSICAL DAMAGE or PIERCING DAMAGE from enemy attacks, consumes LINGERING EMBER to reduce the damage taken and gains CINDERS equal to the amount lost this way. At turn start, converts half of current LINGERING EMBER into both SHADOWFLAME and CINDERS.",
    },

    [effectKeys.CINDERS]: {
        name: "CINDERS",
        type: entryTypes.FREE_RESOURCE,
        description: "No effect.",
    },

    [effectKeys.BLOOD_SACRIFICE]: {
        name: "BLOOD SACRIFICE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "Increases PHYSICAL DAMAGE dealt by the stack when using ATTACK. Causes MANA BLEED at turn start.",
    },

    [effectKeys.UNRELENTING_SHADOWS]: {
        name: "UNRELENTING SHADOWS",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, loses all UNRELENTING SHADOWS. Then, restores RESOURCES based on the UNRELENTING SHADOWS lost this way.",
    },

    [effectKeys.CRYOGENESIS]: {
        name: "CRYOGENESIS",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes CRYOGENESIS to reduce the damage taken. When using an OFFENSIVE ACTION, lose all CRYOGENESIS on self.",
    },

    [effectKeys.OVERHEAT]: {
        name: "OVERHEAT",
        type: entryTypes.LIMITED_RESOURCE,
        description: "Capped at MAX OVERHEAT.",
    },

    [effectKeys.MANA]: {
        name: "MANA",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped at MAX MANA. When restoring MANA above the limit, gain MANA OVERFLOW instead.",
    },

    [effectKeys.HEALTH]: {
        name: "HEALTH",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped at MAX HEALTH. Cannot restore HEALTH above the limit. When HEALTH reaches 0, lose the battle.",
    },
};

export const ESSENCE_DESCRIPTIONS = {
    [effectKeys.OVERGROWTH]: {
        name: "OVERGROWTH",
        type: entryTypes.ESSENCE,
        description: "Allows self to hold more HEALTH.",
    },

    [effectKeys.PERMAFROST]: {
        name: "PERMAFROST",
        type: entryTypes.ESSENCE,
        description: "Added to DEF in calculations.",
    },

    [effectKeys.SCORIA]: {
        name: "SCORIA",
        type: entryTypes.ESSENCE,
        description: "Added to STR in calculations.",
    },
};

export const FIELD_EFFECT_DESCRIPTIONS = {
    [effectKeys.RUNIC_ARRAY]: {
        name: "RUNIC ARRAY",
        type: entryTypes.FIELD_EFFECT,
        description:
            "While active, enables ARRAY TURN at round end. On ARRAY TURN, consumes all MANA and MANA OVERFLOW from all entities, then grants SHACKLED MANA equal to the amount consumed on each entity. Furthermore, on ARRAY TURN, grants every player 3 SHACKLED MANA. Additionally, if RUNIC ARRAY is about to end, consume all SHACKLED MANA on all entities, then distributes it evenly as MANA and MANA OVERFLOW between all entities. While RUNIC ARRAY is active, replaces ARRAY with CURSE, and all entities gain THORNED SHACKLES.",
    },

    [effectKeys.ELEMENTAL_WHEEL]: {
        name: "ELEMENTAL WHEEL",
        type: entryTypes.FIELD_EFFECT,
        description:
            "During WHEEL TURN, cycles to the next element and enables its passive effect. Follows the order: NATURE → FROST → SCORCH, then repeats.",
    },
};

export const DAMAGE_TYPE_DESCRIPTIONS = {
    [effectKeys.PHYSICAL_DAMAGE]: {
        name: "PHYSICAL DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target HEALTH. Can be blocked by DEF, reduced by DAMAGE REDUCTION and mitigated by MITIGATION RESOURCES.",
    },

    [effectKeys.PIERCING_DAMAGE]: {
        name: "PIERCING DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target HEALTH. Ignores DEF, but can be reduced by DAMAGE REDUCTION and mitigated by MITIGATION RESOURCES.",
    },

    [effectKeys.TRUE_DAMAGE]: {
        name: "TRUE DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target HEALTH. Cannot be blocked by DEF, reduced by DAMAGE REDUCTION or mitigated by MITIGATION RESOURCES.",
    },
};

export const STAT_DESCRIPTIONS = {
    [effectKeys.STR]: {
        name: "STR",
        type: entryTypes.STAT,
        description:
            "The main offensive stat. Increases the damage dealt by some actions and effects.",
    },

    [effectKeys.DEF]: {
        name: "DEF",
        type: entryTypes.STAT,
        description:
            "The main defensive stat. Decreases the damage taken from some actions and effects.",
    },
};

export const MECHANIC_DESCRIPTIONS = {
    [effectKeys.MANA_IMBALANCE]: {
        name: "MANA IMBALANCE",
        type: entryTypes.MECHANIC,
        description:
            "The difference between the user's and target's current MANA. If the target has equal or greater MANA, this value is 0.",
    },

    [effectKeys.MITIGATION_RESOURCES]: {
        name: "MITIGATION RESOURCES",
        type: entryTypes.MECHANIC,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes a RESOURCES of this type to decrease damage taken.",
    },

    [effectKeys.MANA_BLEED]: {
        name: "MANA BLEED",
        type: entryTypes.MECHANIC,
        description:
            "At turn start, loses MANA equal to half of current BLOOD SACRIFICE and restores an equal amount of HEALTH.",
    },

    [effectKeys.RESOURCES]: {
        name: "RESOURCES",
        type: entryTypes.MECHANIC,
        description:
            "Includes SHADOWFLAME, UNRELENTING SHADOWS, LINGERING EMBER, CINDERS, POISON, MANA OVERFLOW, SHACKLED MANA, CRYOGENESIS, HALO, BENEDICTION, RADIANCE, BLOOD SACRIFICE, SACRED FLAMES, OVERHEAT, MANA, HEALTH, TARNISHED SIN, INSIGHT and ENLIGHTENMENT. When RESOURCES are consumed, they are consumed in this order. When RESOURCES are restored, they are restored in reverse order. Can only restore TARNISHED SIN, INSIGHT and ENLIGHTENMENT under special conditions.",
    },

    [effectKeys.NATURE]: {
        name: "NATURE",
        type: entryTypes.MECHANIC,
        description:
            "Passive Effect - All ALIGNED entities restore +50% RESOURCES. Active Effect - Restore RESOURCES by OVERGROWTH on self.",
    },

    [effectKeys.FROST]: {
        name: "FROST",
        type: entryTypes.MECHANIC,
        description:
            "Passive Effect - All ALIGNED entities deal and take -50% damage. Active Effect - Gain CRYOGENESIS by PERMAFROST on self.",
    },

    [effectKeys.SCORCH]: {
        name: "SCORCH",
        type: entryTypes.MECHANIC,
        description:
            "Passive Effect - All ALIGNED entities deal and take +50% damage. Active Effect - Take TRUE DAMAGE by SCORIA on self.",
    },

    [effectKeys.ELEMENTAL_ESSENCE]: {
        name: "ELEMENTAL ESSENCE",
        type: entryTypes.MECHANIC,
        description:
            "Includes OVERGROWTH, PERMAFROST and SCORIA, corresponding to NATURE, FROST and SCORCH respectively.",
    },

    [effectKeys.SONORITY]: {
        name: "SONORITY",
        type: entryTypes.MECHANIC,
        description:
            "Starts at 0 and ranges from -5 to 5. Increases when using DEFENSIVE ACTIONS. Decreases when using OFFENSIVE ACTIONS.",
    },

    [effectKeys.MAX_MANA]: {
        name: "MAX MANA",
        type: entryTypes.MECHANIC,
        description: "Starts at 10. Limits how much MANA you can hold.",
    },

    [effectKeys.MAX_HEALTH]: {
        name: "MAX HEALTH",
        type: entryTypes.MECHANIC,
        description: "Starts at 20. Limits how much HEALTH you can hold.",
    },

    [effectKeys.DAMAGE_REDUCTION]: {
        name: "DAMAGE REDUCTION",
        type: entryTypes.MECHANIC,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, reduces damage taken by the percentage.",
    },

    [effectKeys.DEF_EFFECTIVENESS]: {
        name: "DEF EFFECTIVENESS",
        type: entryTypes.MECHANIC,
        description:
            "When taking PHYSICAL DAMAGE, increases how much damage can be blocked by DEF by the percentage.",
    },

    [effectKeys.MAX_OVERHEAT]: {
        name: "MAX OVERHEAT",
        type: entryTypes.MECHANIC,
        description: "Starts at 10. Limits how much OVERHEAT you can hold.",
    },
};

export const STAR_DESCRIPTIONS = {
    [actionKeys.CHART]: {
        name: "CHART",
        type: entryTypes.ACTION,
        description:
            "Gains 3 WHITE STAR. If not in the STARGAZER state, enters the STARGAZER state.",
    },

    [effectKeys.STARGAZER]: {
        name: "STARGAZER",
        type: entryTypes.STATE,
        description:
            "While active, enables STARFALL at turn end. During the action phase, enables a side-menu for star assignment.",
    },

    [effectKeys.STARFALL]: {
        name: "STARFALL",
        type: entryTypes.MECHANIC,
        description:
            "A special phase where colored stars act. Divided into twelve ordered subphases: RED STARFALL, ORANGE STARFALL, YELLOW STARFALL, GREEN STARFALL, BLUE STARFALL, INDIGO STARFALL, VIOLET STARFALL, RED TRAILFALL, ORANGE TRAILFALL, YELLOW TRAILFALL, GREEN TRAILFALL, and BLUE TRAILFALL. Skips the subphase if there are no corresponding stars or trails available.",
    },

    [effectKeys.RED_STARFALL]: {
        name: "RED STARFALL",
        type: entryTypes.MECHANIC,
        description: "The first subphase of STARFALL, when RED STAR acts.",
    },

    [effectKeys.ORANGE_STARFALL]: {
        name: "ORANGE STARFALL",
        type: entryTypes.MECHANIC,
        description: "The second subphase of STARFALL, when ORANGE STAR acts.",
    },

    [effectKeys.YELLOW_STARFALL]: {
        name: "YELLOW STARFALL",
        type: entryTypes.MECHANIC,
        description: "The third subphase of STARFALL, when YELLOW STAR acts.",
    },

    [effectKeys.GREEN_STARFALL]: {
        name: "GREEN STARFALL",
        type: entryTypes.MECHANIC,
        description: "The fourth subphase of STARFALL, when GREEN STAR acts.",
    },

    [effectKeys.BLUE_STARFALL]: {
        name: "BLUE STARFALL",
        type: entryTypes.MECHANIC,
        description: "The fifth subphase of STARFALL, when BLUE STAR acts.",
    },

    [effectKeys.INDIGO_STARFALL]: {
        name: "INDIGO STARFALL",
        type: entryTypes.MECHANIC,
        description: "The sixth subphase of STARFALL, when INDIGO STAR acts.",
    },

    [effectKeys.VIOLET_STARFALL]: {
        name: "VIOLET STARFALL",
        type: entryTypes.MECHANIC,
        description: "The seventh subphase of STARFALL, when VIOLET STAR acts.",
    },

    [effectKeys.RED_TRAILFALL]: {
        name: "RED TRAILFALL",
        type: entryTypes.MECHANIC,
        description: "The eighth subphase of STARFALL, when RED TRAIL acts.",
    },

    [effectKeys.ORANGE_TRAILFALL]: {
        name: "ORANGE TRAILFALL",
        type: entryTypes.MECHANIC,
        description: "The ninth subphase of STARFALL, when ORANGE TRAIL acts.",
    },

    [effectKeys.YELLOW_TRAILFALL]: {
        name: "YELLOW TRAILFALL",
        type: entryTypes.MECHANIC,
        description: "The tenth subphase of STARFALL, when YELLOW TRAIL acts.",
    },

    [effectKeys.GREEN_TRAILFALL]: {
        name: "GREEN TRAILFALL",
        type: entryTypes.MECHANIC,
        description: "The eleventh subphase of STARFALL, when GREEN TRAIL acts.",
    },

    [effectKeys.BLUE_TRAILFALL]: {
        name: "BLUE TRAILFALL",
        type: entryTypes.MECHANIC,
        description: "The twelfth subphase of STARFALL, when BLUE TRAIL acts.",
    },

    [effectKeys.WHITE_STAR]: {
        name: "WHITE STAR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "No effect. Can be assigned colors to become RED STAR, ORANGE STAR, YELLOW STAR, GREEN STAR, BLUE STAR, INDIGO STAR, or VIOLET STAR.",
    },

    [effectKeys.RED_STAR]: {
        name: "RED STAR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At RED STARFALL, deals PHYSICAL DAMAGE equal to RED STAR. When augmented, deals TRUE DAMAGE instead. When fractured, gains RED TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.ORANGE_STAR]: {
        name: "ORANGE STAR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At ORANGE STARFALL, consumes RESOURCES from the opponent equal to ORANGE STAR. When augmented, transfers them to self instead. When fractured, gains ORANGE TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.YELLOW_STAR]: {
        name: "YELLOW STAR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At YELLOW STARFALL, gains STARDUST equal to YELLOW STAR. When augmented, gains WHITE STAR instead. When fractured, gains YELLOW TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.GREEN_STAR]: {
        name: "GREEN STAR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At GREEN STARFALL, restores RESOURCES on self equal to GREEN STAR. When augmented, restores RESOURCES to the opponent instead. When fractured, gains GREEN TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.BLUE_STAR]: {
        name: "BLUE STAR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At BLUE STARFALL, loses all BLUE STAR, then gains DOME and GRAY STAR equal to the amount lost. When augmented, gains WHITE STAR instead of GRAY STAR. When fractured, gains DIMMED BLUE STAR equal to the amount fractured and BLUE TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.INDIGO_STAR]: {
        name: "INDIGO STAR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When a colored star takes an action, consumes INDIGO STAR to use the fractured version of that action instead. Fractured actions take priority over augmented ones. At INDIGO STARFALL, loses all INDIGO STAR and gains DIMMED INDIGO STAR equal to the amount lost.",
    },

    [effectKeys.VIOLET_STAR]: {
        name: "VIOLET STAR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When a colored star takes an action, consumes VIOLET STAR to use the augmented version of that action instead. Then, gains DIMMED VIOLET STAR equal to the amount consumed. At VIOLET STARFALL, loses all VIOLET STAR and gains DIMMED VIOLET STAR equal to the amount lost.",
    },

    [effectKeys.DOME]: {
        name: "DOME",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes DOME to reduce the damage taken.",
    },

    [effectKeys.GRAY_STAR]: {
        name: "GRAY STAR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "Cannot be assigned a color. At turn end, converts into WHITE STAR.",
    },

    [effectKeys.STARDUST]: {
        name: "STARDUST",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, for every 3 STARDUST on self, lose STARDUST. Then, gains WHITE STAR equal to a third of the STARDUST lost this way.",
    },

    [effectKeys.DIMMED_RED_STAR]: {
        name: "DIMMED RED STAR",
        type: entryTypes.FREE_RESOURCE,
        description: "At turn start, converts into RED STAR.",
    },

    [effectKeys.DIMMED_ORANGE_STAR]: {
        name: "DIMMED ORANGE STAR",
        type: entryTypes.FREE_RESOURCE,
        description: "At turn start, converts into ORANGE STAR.",
    },

    [effectKeys.DIMMED_YELLOW_STAR]: {
        name: "DIMMED YELLOW STAR",
        type: entryTypes.FREE_RESOURCE,
        description: "At turn start, converts into YELLOW STAR.",
    },

    [effectKeys.DIMMED_GREEN_STAR]: {
        name: "DIMMED GREEN STAR",
        type: entryTypes.FREE_RESOURCE,
        description: "At turn start, converts into GREEN STAR.",
    },

    [effectKeys.DIMMED_BLUE_STAR]: {
        name: "DIMMED BLUE STAR",
        type: entryTypes.FREE_RESOURCE,
        description: "At turn start, converts into BLUE STAR.",
    },

    [effectKeys.DIMMED_INDIGO_STAR]: {
        name: "DIMMED INDIGO STAR",
        type: entryTypes.FREE_RESOURCE,
        description: "At turn start, converts into INDIGO STAR.",
    },

    [effectKeys.DIMMED_VIOLET_STAR]: {
        name: "DIMMED VIOLET STAR",
        type: entryTypes.FREE_RESOURCE,
        description: "At turn start, converts into VIOLET STAR.",
    },

    [effectKeys.RED_TRAIL]: {
        name: "RED TRAIL",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At RED TRAILFALL, deals PHYSICAL DAMAGE equal to RED TRAIL. Then, loses all RED TRAIL on self.",
    },

    [effectKeys.ORANGE_TRAIL]: {
        name: "ORANGE TRAIL",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At ORANGE TRAILFALL, consumes RESOURCES from the opponent equal to ORANGE TRAIL. Then, loses all ORANGE TRAIL on self.",
    },

    [effectKeys.YELLOW_TRAIL]: {
        name: "YELLOW TRAIL",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At YELLOW TRAILFALL, gains STARDUST equal to YELLOW TRAIL. Then, loses all YELLOW TRAIL on self.",
    },

    [effectKeys.GREEN_TRAIL]: {
        name: "GREEN TRAIL",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At GREEN TRAILFALL, restores RESOURCES on self equal to GREEN TRAIL. Then, loses all GREEN TRAIL on self.",
    },

    [effectKeys.BLUE_TRAIL]: {
        name: "BLUE TRAIL",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At BLUE TRAILFALL, loses DIMMED BLUE STAR equal to BLUE TRAIL and gains DOME and GRAY STAR equal to the amount lost. If there are not enough DIMMED BLUE STARS, consumes DIMMED INDIGO STAR instead. Then, loses all BLUE TRAIL on self.",
    },
};

// Work in progress
export const PALADIN_DESCRIPTIONS = {
    [effectKeys.REVELATION]: {
        name: "REVELATION",
        type: entryTypes.STAT,
        description: "Alternative stat. Used for certain actions.",
    },
    [actionKeys.AEGIS]: {
        name: "AEGIS",
        type: entryTypes.ACTION,
        description:
            "Gains HALO equal to twice your DEF. Enters RADIANT state until next turn.",
    },

    [actionKeys.GRACE_OF_HEAVENS]: {
        name: "GRACE OF HEAVENS",
        type: entryTypes.ACTION,
        description:
            "Restores RESOURCES for the opponent equal to the REVELATION on self.",
    },

    [actionKeys.SERAPH_OF_CONDEMNATION]: {
        name: "SERAPH OF CONDEMNATION",
        type: entryTypes.ACTION,
        description:
            "Inflicts TARNISHED SIN on the opponent equal to the REVELATION on self.",
    },

    [actionKeys.GIFT_OF_APOTHEOSIS]: {
        name: "GIFT OF APOTHEOSIS",
        type: entryTypes.ACTION,
        description:
            "Swaps your current condition with the opponent's and vice-versa. Cannot be used if the opponent is in the ASCENDENCE OF SPIRIT state.",
    },

    [actionKeys.THE_WORD_MADE_FLESH]: {
        name: "THE WORD MADE FLESH",
        type: entryTypes.ACTION,
        description:
            "Exits ASCENDENCE OF SPIRIT and enters CUTOFF WINGS state. Then, inflicts BURDEN OF STIGMA on the opponent.",
    },

    [actionKeys.CELESTIAL_SCALE]: {
        name: "CELESTIAL SCALE",
        type: entryTypes.ACTION,
        description: "Redistributes ENLIGHTENMENT and INSIGHT evenly on self.",
    },

    [actionKeys.BAPTISM_OF_THE_FLAMES]: {
        name: "BAPTISM OF THE FLAMES",
        type: entryTypes.ACTION,
        description:
            "Converts all RESOURCES on self into SACRED FLAMES, and absorbs all SACRED FLAMES on the battlefield into self. Then, consumes all SACRED FLAMES on self and restores RESOURCES based on the amount consumed.",
    },

    [actionKeys.SACRAMENT]: {
        name: "SACRAMENT",
        type: entryTypes.ACTION,
        description: "Gains BENEDICTION based on twice the REVELATION on self.",
    },

    [actionKeys.EDICT_OF_SEVERANCE]: {
        name: "EDICT OF SEVERANCE",
        type: entryTypes.ACTION,
        description: "TODO: Add Edict of Severance description here.",
    },

    [effectKeys.RADIANT]: {
        name: "RADIANT",
        type: entryTypes.STATE,
        description: "Nullifies all DEF EFFECTIVENESS.",
    },

    [effectKeys.BURDEN_OF_STIGMA]: {
        name: "BURDEN OF STIGMA",
        type: entryTypes.STATES,
        description: "Cannot act. Removed at turn end.",
    },

    [effectKeys.ASCENDENCE_OF_SPIRIT]: {
        name: "ASCENDENCE OF SPIRIT",
        type: entryTypes.STATE,
        description:
            "Upon entering this state, exits all other states and loses all resources on self. Then, gains INSIGHT based on the resources consumed. While in this state, cannot die by normal means. Furthermore, when taking damage, loses ENLIGHTENMENT instead of HEALTH. If at least one player is in this state, awakens the EYE OF HEAVENS. While the eye is open, replaces all actions with: GRACE OF HEAVENS, CELESTIAL SCALE, SACRAMENT and GIFT OF APOTHEOSIS. While the eye is closed, replaces all actions with: SERAPH OF CONDEMNATION, BAPTISM OF THE FLAMES, EDICT OF SEVERANCE and THE WORD MADE FLESH. When exiting this state, loses all RESOURCES on self.",
    },

    [effectKeys.CUTOFF_WINGS]: {
        name: "CUTOFF WINGS",
        type: entryTypes.STATE,
        description:
            "Cannot use AEGIS. Upon entering this state, recovers 1 HEALTH. Upon entering this state, at turn start and turn end, sets MAX HEALTH to 1 and reduces current HEALTH accordingly.",
    },

    [effectKeys.ENLIGHTENMENT]: {
        name: "ENLIGHTENMENT",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "At turn start, if at 100 or more ENLIGHTENMENT, enters ASCENDENCE OF SPIRIT state.",
    },

    [effectKeys.SACRED_FLAMES]: {
        name: "SACRED FLAMES",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, consumes RESOURCES on self by the stack. Then, restores RESOURCES on self by the stack and lose all SACRED FLAMES on self.",
    },

    [effectKeys.BENEDICTION]: {
        name: "BENEDICTION",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, lose BENEDICTION instead of ENLIGHTENMENT and grants SACRED FLAMES to the attacker based on the amount lost. At turn start, lose all BENEDICTION and restore RESOURCES based on the amount lost.",
    },

    [effectKeys.INSIGHT]: {
        name: "INSIGHT",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "When gaining INSIGHT above 100, gains SACRED FLAMES instead.",
    },

    [effectKeys.TARNISHED_SIN]: {
        name: "TARNISHED SIN",
        type: entryTypes.LIMITED_RESOURCE,
        description: "TODO: Add Tarnished Sin description here.",
    },

    [effectKeys.HALO]: {
        name: "HALO",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes HALO to reduce the damage taken and gains RADIANCE based on the amount lost. At turn start, converts all HALO into ENLIGHTENMENT.",
    },

    [effectKeys.RADIANCE]: {
        name: "RADIANCE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using ATTACK, consumes all RADIANCE on self to increase the damage dealt.",
    },

    [effectKeys.EYE_OF_HEAVENS]: {
        name: "EYE OF HEAVENS",
        type: entryTypes.FIELD_EFFECT,
        description:
            "While awoken, enables EMINENCE TURN at round end. On EMINENCE TURN, if the eye is open, closes the eye and consumes all INSIGHT on all entities. Then, grants REVELATION to each entity for every 10 INSIGHT they lost on self. If the eye is closed, opens the eye and, if an entity in the ASCENDENCE OF SPIRIT state has 0 or less ENLIGHTENMENT, removes them from the ASCENDENCE OF SPIRIT state and grants them the CUTOFF WINGS state. If there's no entity in the ASCENDENCE OF SPIRIT state in the battlefield, returns to dormant state.",
    },
};

export const DESCRIPTIONS = {
    ...ACTION_DESCRIPTIONS,
    ...DAMAGE_TYPE_DESCRIPTIONS,
    ...ESSENCE_DESCRIPTIONS,
    ...FIELD_EFFECT_DESCRIPTIONS,
    ...MECHANIC_DESCRIPTIONS,
    ...RESOURCE_DESCRIPTIONS,
    ...STATE_DESCRIPTIONS,
    ...STAT_DESCRIPTIONS,
    ...PALADIN_DESCRIPTIONS,
    ...STAR_DESCRIPTIONS,
};
