import { actionKeys, effectKeys, entryTypes, mechanicKeys } from "./enums";

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
            "Usable at negative SONORITY. Inverts current SONORITY and restores RESOURCES on self by the difference.",
    },

    [actionKeys.BABEL]: {
        name: "BABEL",
        type: entryTypes.ACTION,
        description:
            "Usable at positive SONORITY. Inverts current SONORITY and deals TRUE DAMAGE to the opponent by the difference.",
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
            "Deals 1 PIERCING DAMAGE and raises OVERHEAT by 10%. Raises OVERHEAT by an additional 10% for every LASER used this turn. Does not end turn.",
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
            "If not on ALIGNED state, enters ALIGNED state. If ELEMENTAL WHEEL is inactive, activates ELEMENTAL WHEEL on NATURE and gains 3 of each ELEMENTAL ESSENCE. Otherwise, gains 5 ELEMENTAL ESSENCE of the current element and activates the current element's active effect.",
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
        type: entryTypes.STATE,
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
            "While the ELEMENTAL WHEEL is active, suffers the effects of the current element's passive effect. If at least one ALIGNED player is in the battlefield, enables ELEMENTAL CYCLE at round end.",
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
            "Enables OVERHEAT. Replaces DEPLOY with LASER. At 100% or more OVERHEAT, becomes THERMAL OVERLOAD.",
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
            "Enables OVERHEAT. Cannot use DEPLOY, LASER or MELTDOWN. Raises DAMAGE REDUCTION by 50%. At turn start, loses 50% OVERHEAT. At turn start, if at 0% OVERHEAT, exits VENTING and enters WEAPONS DEPLOYED.",
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
            "Increases PHYSICAL DAMAGE dealt equal to BLOOD SACRIFICE on self when using ATTACK. Causes MANA BLEED at turn start.",
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
        type: entryTypes.FIXED_RESOURCE,
        description: "Capped at MAX OVERHEAT. When using DEFENSIVE ACTIONS, lower OVERHEAT by 30%.",
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
        type: entryTypes.ELEMENTAL_ESSENCE,
        description: "Allows self to hold more HEALTH.",
    },

    [effectKeys.PERMAFROST]: {
        name: "PERMAFROST",
        type: entryTypes.ELEMENTAL_ESSENCE,
        description: "Added to DEF in calculations.",
    },

    [effectKeys.SCORIA]: {
        name: "SCORIA",
        type: entryTypes.ELEMENTAL_ESSENCE,
        description: "Added to STR in calculations.",
    },
};

export const FIELD_EFFECT_DESCRIPTIONS = {
    [effectKeys.RUNIC_ARRAY]: {
        name: "RUNIC ARRAY",
        type: entryTypes.FIELD_EFFECT,
        description:
            "While active, enables RUNIC INSCRIPTION at round end. On RUNIC INSCRIPTION, consumes all MANA and MANA OVERFLOW from all entities, then grants SHACKLED MANA equal to the amount consumed on each entity. Furthermore, on RUNIC INSCRIPTION, grants every player 3 SHACKLED MANA. Additionally, if RUNIC ARRAY is about to end, consumes all SHACKLED MANA on all entities, then distributes it evenly as MANA and MANA OVERFLOW between all entities. While RUNIC ARRAY is active, replaces ARRAY with CURSE, and all entities gain THORNED SHACKLES.",
    },

    [effectKeys.ELEMENTAL_WHEEL]: {
        name: "ELEMENTAL WHEEL",
        type: entryTypes.FIELD_EFFECT,
        description:
            "During ELEMENTAL CYCLE, cycles to the next element and enables its passive effect. Follows the order: NATURE → FROST → SCORCH, then repeats.",
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
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase where colored stars act. Divided into fourteen ordered subphases: RED STARFALL, ORANGE STARFALL, YELLOW STARFALL, GREEN STARFALL, BLUE STARFALL, INDIGO STARFALL, VIOLET STARFALL, RED TRAILFALL, ORANGE TRAILFALL, YELLOW TRAILFALL, GREEN TRAILFALL, BLUE TRAILFALL, INDIGO TRAILFALL and VIOLET TRAILFALL. Trailfall phases are skipped if the user has no trails on self.",
    },

    [effectKeys.RED_STARFALL]: {
        name: "RED STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The first subphase of STARFALL, when RED STAR acts.",
    },

    [effectKeys.ORANGE_STARFALL]: {
        name: "ORANGE STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The second subphase of STARFALL, when ORANGE STAR acts.",
    },

    [effectKeys.YELLOW_STARFALL]: {
        name: "YELLOW STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The third subphase of STARFALL, when YELLOW STAR acts.",
    },

    [effectKeys.GREEN_STARFALL]: {
        name: "GREEN STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The fourth subphase of STARFALL, when GREEN STAR acts.",
    },

    [effectKeys.BLUE_STARFALL]: {
        name: "BLUE STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The fifth subphase of STARFALL, when BLUE STAR acts.",
    },

    [effectKeys.INDIGO_STARFALL]: {
        name: "INDIGO STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The sixth subphase of STARFALL, when INDIGO STAR acts.",
    },

    [effectKeys.VIOLET_STARFALL]: {
        name: "VIOLET STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The seventh subphase of STARFALL, when VIOLET STAR acts.",
    },

    [effectKeys.RED_TRAILFALL]: {
        name: "RED TRAILFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The eighth subphase of STARFALL, when RED TRAIL acts.",
    },

    [effectKeys.ORANGE_TRAILFALL]: {
        name: "ORANGE TRAILFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The ninth subphase of STARFALL, when ORANGE TRAIL acts.",
    },

    [effectKeys.YELLOW_TRAILFALL]: {
        name: "YELLOW TRAILFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The tenth subphase of STARFALL, when YELLOW TRAIL acts.",
    },

    [effectKeys.GREEN_TRAILFALL]: {
        name: "GREEN TRAILFALL",
        type: entryTypes.BATTLE_PHASE,
        description:
            "The eleventh subphase of STARFALL, when GREEN TRAIL acts.",
    },

    [effectKeys.BLUE_TRAILFALL]: {
        name: "BLUE TRAILFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The twelfth subphase of STARFALL, when BLUE TRAIL acts.",
    },

    [effectKeys.INDIGO_TRAILFALL]: {
        name: "INDIGO TRAILFALL",
        type: entryTypes.BATTLE_PHASE,
        description:
            "The thirteenth subphase of STARFALL, when INDIGO TRAIL acts.",
    },

    [effectKeys.VIOLET_TRAILFALL]: {
        name: "VIOLET TRAILFALL",
        type: entryTypes.BATTLE_PHASE,
        description:
            "The fourteenth subphase of STARFALL, when VIOLET TRAIL acts.",
    },

    [effectKeys.WHITE_STAR]: {
        name: "WHITE STAR",
        type: entryTypes.STAR,
        description:
            "No effect. Can be assigned colors to become RED STAR, ORANGE STAR, YELLOW STAR, GREEN STAR, BLUE STAR, INDIGO STAR, or VIOLET STAR.",
    },

    [effectKeys.RED_STAR]: {
        name: "RED STAR",
        type: entryTypes.STAR,
        description:
            "At RED STARFALL, deals PHYSICAL DAMAGE equal to RED STAR. When augmented, deals PIERCING DAMAGE instead. When fractured, gains RED TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.ORANGE_STAR]: {
        name: "ORANGE STAR",
        type: entryTypes.STAR,
        description:
            "At ORANGE STARFALL, consumes all ORANGE STAR on self, then burns FREE RESOURCES on the opponent equal to the amount lost. When augmented, burn RESOURCES instead. When fractured, gain DIMMED ORANGE STAR equal to the amount fractured and ORANGE TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.YELLOW_STAR]: {
        name: "YELLOW STAR",
        type: entryTypes.STAR,
        description:
            "At YELLOW STARFALL, gains STARDUST equal to YELLOW STAR. When augmented, gains WHITE STAR instead. When fractured, gains YELLOW TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.GREEN_STAR]: {
        name: "GREEN STAR",
        type: entryTypes.STAR,
        description:
            "At GREEN STARFALL, restores RESOURCES on self equal to GREEN STAR. When augmented, restores RESOURCES to the opponent instead. When fractured, gains GREEN TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.BLUE_STAR]: {
        name: "BLUE STAR",
        type: entryTypes.STAR,
        description:
            "At BLUE STARFALL, loses all BLUE STAR, then gains DOME and GRAY STAR equal to the amount lost. When augmented, gains WHITE STAR instead of GRAY STAR. When fractured, gains DIMMED BLUE STAR equal to the amount fractured and BLUE TRAIL equal to twice the amount fractured instead.",
    },

    [effectKeys.INDIGO_STAR]: {
        name: "INDIGO STAR",
        type: entryTypes.STAR,
        description:
            "When a colored star takes an action, consumes INDIGO STAR to use the fractured version of that action instead. Fractured actions take priority over augmented ones. At INDIGO STARFALL, loses all INDIGO STAR and gains DIMMED INDIGO STAR equal to the amount lost.",
    },

    [effectKeys.VIOLET_STAR]: {
        name: "VIOLET STAR",
        type: entryTypes.STAR,
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
        type: entryTypes.STAR,
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
        type: entryTypes.STAR,
        description: "At turn start, converts into RED STAR.",
    },

    [effectKeys.DIMMED_ORANGE_STAR]: {
        name: "DIMMED ORANGE STAR",
        type: entryTypes.STAR,
        description: "At turn start, converts into ORANGE STAR.",
    },

    [effectKeys.DIMMED_YELLOW_STAR]: {
        name: "DIMMED YELLOW STAR",
        type: entryTypes.STAR,
        description: "At turn start, converts into YELLOW STAR.",
    },

    [effectKeys.DIMMED_GREEN_STAR]: {
        name: "DIMMED GREEN STAR",
        type: entryTypes.STAR,
        description: "At turn start, converts into GREEN STAR.",
    },

    [effectKeys.DIMMED_BLUE_STAR]: {
        name: "DIMMED BLUE STAR",
        type: entryTypes.STAR,
        description: "At turn start, converts into BLUE STAR.",
    },

    [effectKeys.DIMMED_INDIGO_STAR]: {
        name: "DIMMED INDIGO STAR",
        type: entryTypes.STAR,
        description: "At turn start, converts into INDIGO STAR.",
    },

    [effectKeys.DIMMED_VIOLET_STAR]: {
        name: "DIMMED VIOLET STAR",
        type: entryTypes.STAR,
        description: "At turn start, converts into VIOLET STAR.",
    },

    [effectKeys.RED_TRAIL]: {
        name: "RED TRAIL",
        type: entryTypes.STAR,
        description:
            "At RED TRAILFALL, deals PHYSICAL DAMAGE equal to RED TRAIL. Then, loses all RED TRAIL on self.",
    },

    [effectKeys.ORANGE_TRAIL]: {
        name: "ORANGE TRAIL",
        type: entryTypes.STAR,
        description:
            "At ORANGE TRAILFALL, consumes DIMMED ORANGE STAR equal to ORANGE TRAIL and burns FREE RESOURCES on the opponent equal to the amount lost. If there are not enough DIMMED ORANGE STARS, consumes DIMMED INDIGO STAR instead. Then, loses all BLUE TRAIL on self.",
    },

    [effectKeys.YELLOW_TRAIL]: {
        name: "YELLOW TRAIL",
        type: entryTypes.STAR,
        description:
            "At YELLOW TRAILFALL, gains STARDUST equal to YELLOW TRAIL. Then, loses all YELLOW TRAIL on self.",
    },

    [effectKeys.GREEN_TRAIL]: {
        name: "GREEN TRAIL",
        type: entryTypes.STAR,
        description:
            "At GREEN TRAILFALL, restores RESOURCES on self equal to GREEN TRAIL. Then, loses all GREEN TRAIL on self.",
    },

    [effectKeys.BLUE_TRAIL]: {
        name: "BLUE TRAIL",
        type: entryTypes.STAR,
        description:
            "At BLUE TRAILFALL, loses DIMMED BLUE STAR equal to BLUE TRAIL and gains DOME and GRAY STAR equal to the amount lost. If there are not enough DIMMED BLUE STARS, consumes DIMMED INDIGO STAR instead. Then, loses all BLUE TRAIL on self.",
    },

    [effectKeys.INDIGO_TRAIL]: {
        name: "INDIGO TRAIL",
        type: entryTypes.STAR,
        description: "At INDIGO TRAILFALL, lose all INDIGO TRAIL.",
    },

    [effectKeys.VIOLET_TRAIL]: {
        name: "VIOLET TRAIL",
        type: entryTypes.STAR,
        description: "At VIOLET TRAILFALL, lose all VIOLET TRAIL.",
    },
};

// Work in progress
export const PALADIN_DESCRIPTIONS = {
    [actionKeys.AEGIS]: {
        name: "AEGIS",
        type: entryTypes.ACTION,
        description:
            "Gains HALO equal to twice the user's DEF. Enters RADIANT state until next turn start.",
    },

    [effectKeys.RADIANT]: {
        name: "RADIANT",
        type: entryTypes.STATE,
        description: "Nullifies all DEF EFFECTIVENESS.",
    },

    [effectKeys.HALO]: {
        name: "HALO",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, loses HALO instead of HEALTH, then gains RADIANCE equal to the amount lost. At turn start, lose all HALO, then raise DIVINE SPARK by 1% for every HALO lost this way.",
    },

    [effectKeys.RADIANCE]: {
        name: "RADIANCE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using ATTACK, consumes all RADIANCE on self to increase the DAMAGE dealt.",
    },

    [effectKeys.DIVINE_SPARK]: {
        name: "DIVINE SPARK",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "At turn start, if at 100% DIVINE SPARK, enters ZENITH OF MORTALITY. Additionally, if the EYE OF HEAVENS is DORMANT, awakens it in the CLOSED state.",
    },

    [effectKeys.ENLIGHTENMENT]: {
        name: "ENLIGHTENMENT",
        type: entryTypes.LIMITED_RESOURCE,
        description: "Cannot exceed MAX ENLIGHTENMENT.",
    },

    [effectKeys.ZENITH_OF_MORTALITY]: {
        name: "ZENITH OF MORTALITY",
        type: entryTypes.STATE,
        description: "Replaces all actions with ASCEND.",
    },

    [actionKeys.ASCEND]: {
        name: "ASCEND",
        type: entryTypes.ACTION,
        description:
            "Opens the EYE OF HEAVENS, exits all other states, and consumes all RESOURCES on self. Then gains REVELATION based on STR and DEF on self and enters ASCENDENCE OF SPIRIT. Afterwards, loses all STR and DEF on self, and restores RESOURCES. Aditionaly, sets MAX ENLIGHTENMENT and MAX INSIGHT to 100. This action does not end the turn.",
    },

    [effectKeys.ASCENDENCE_OF_SPIRIT]: {
        name: "ASCENDENCE OF SPIRIT",
        type: entryTypes.STATE,
        description:
            "Does not die upon reaching 0 HEALTH. At turn start, if at 0 or less ENLIGHTENMENT, exits this state, then enters CUTOFF WINGS and recovers 1 HEALTH. When taking PHYSICAL DAMAGE or PIERCING DAMAGE, lose ENLIGHTENMENT instead of HEALTH. Additionally, if it was PHYSICAL DAMAGE taken, gain INSPIRATION equal to the ENLIGHTENMENT lost. When taking TRUE DAMAGE, raise TARNISHED SIN by 1% for every point of damage received instead of losing HEALTH. When restoring HEALTH or MANA, gain INSPIRATION instead. Replaces all actions with ACTS OF BENEDICTION and ACTS OF MALEDICTION.",
    },

    [mechanicKeys.ACTS_OF_BENEDICTION]: {
        name: "ACTS OF BENEDICTION",
        type: entryTypes.MECHANIC,
        description:
            "Includes BAPTISM OF THE FLAMES, CELESTIAL SCALE, HYMNS OF SANCTIFICATION and GIFT OF APOTHEOSIS. When using an ACT OF BENEDICTION while EYE OF HEAVENS is CLOSED, gains INSPIRATION equal to REVELATION on self.",
    },

    [mechanicKeys.ACTS_OF_MALEDICTION]: {
        name: "ACTS OF MALEDICTION",
        type: entryTypes.MECHANIC,
        description:
            "Includes SERAPH OF CONDEMNATION, GLIMPSE OF PANDEMONIUM, EDICT OF SEVERANCE and THE WORD MADE FLESH. When using an ACT OF MALEDICTION while EYE OF HEAVENS is OPEN, raise TARNISHED SIN by 1% for every REVELATION on self.",
    },

    [effectKeys.TARNISHED_SIN]: {
        name: "TARNISHED SIN",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "When reaching 100% TARNISHED SIN, receives ABANDONED BY GRACE state.",
    },

    [effectKeys.ABANDONED_BY_GRACE]: {
        name: "ABANDONED BY GRACE",
        type: entryTypes.STATE,
        description:
            "If there's any entity on this state, but no entity on ANOINTED PROXY state, immediatelly opens the EYE OF HEAVENS and triggers an EMANATION.",
    },

    [effectKeys.ANOINTED_PROXY]: {
        name: "ANOINTED PROXY",
        type: entryTypes.STATE,
        description: "Replaces all actions with JUDGEMENT.",
    },

    [actionKeys.JUDGEMENT]: {
        name: "JUDGEMENT",
        type: entryTypes.ACTION,
        description: "Cleases all STATES and RESOURCES from the opponent.",
    },

    [effectKeys.EYE_OF_HEAVENS]: {
        name: "EYE OF HEAVENS",
        type: entryTypes.FIELD_EFFECT,
        description:
            "While awoken, triggers EMANATION at round end. During EMANATION, if closed, opens and grants REVELATION to all entites for every 10 INSIGHT on each; otherwise, closes and removes SEVERED TIME from the battlefield. If there's at least one entity with ABANDONED BY GRACE on the battlefield, opens and grants ANOINTED PROXY to their adversary. If their adversary is also on the ABANDONED BY GRACE state, cleanses all STATES and RESOURCES from both entities, then ends battle.",
    },

    [effectKeys.INSIGHT]: {
        name: "INSIGHT",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Cannot exceed MAX INSIGHT. When restoring INSIGHT above the limit, gain INSPIRATION instead.",
    },

    [effectKeys.CUTOFF_WINGS]: {
        name: "CUTOFF WINGS",
        type: entryTypes.STATE,
        description:
            "Cannot use AEGIS. While on this state, MAX HEALTH is set to 1.",
    },

    [effectKeys.REVELATION]: {
        name: "REVELATION",
        type: entryTypes.STAT,
        description: "An alternative stat used by certain effects.",
    },

    [effectKeys.BURDEN_OF_STIGMA]: {
        name: "BURDEN OF STIGMA",
        type: entryTypes.STATE,
        description: "Cannot act. Removed at turn end.",
    },

    [effectKeys.REMNANTS_OF_DIVINITY]: {
        name: "REMNANTS OF DIVINITY",
        type: entryTypes.STATE,
        description:
            "At turn start, loses this state and gains BURDEN OF STIGMA.",
    },

    [effectKeys.SEVERED_TIME]: {
        name: "SEVERED TIME",
        type: entryTypes.FIELD_EFFECT,
        description:
            "Turn Start and Turn End effects do not trigger. The ELEMENTAL WHEEL does not turn. RUNIC ARRAY duration does not decrease.",
    },

    [effectKeys.INSPIRATION]: {
        name: "INSPIRATION",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, loses INSPIRATION equal to missing ENLIGHTENMENT, then gains ENLIGHTENMENT equal to the amount lost this way.",
    },

    [effectKeys.SACRED_FLAMES]: {
        name: "SACRED FLAMES",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, loses SACRED FLAMES equal to missing HEALTH, then restores HEALTH equal to the amount lost this way.",
    },

    [actionKeys.BAPTISM_OF_THE_FLAMES]: {
        name: "BAPTISM OF THE FLAMES",
        type: entryTypes.ACTION,
        description:
            "Grants SACRED FLAMES to the target based on REVELATION on self.",
    },

    [actionKeys.CELESTIAL_SCALE]: {
        name: "CELESTIAL SCALE",
        type: entryTypes.ACTION,
        description: "Redistributes ENLIGHTENMENT and INSIGHT evenly on self.",
    },

    [actionKeys.HYMNS_OF_SANCTIFICATION]: {
        name: "HYMNS OF SANCTIFICATION",
        type: entryTypes.ACTION,
        description:
            "Consumes all FREE RESOURCES on self, then gains INSIGHT based on the amount consumed.",
    },

    [actionKeys.GIFT_OF_APOTHEOSIS]: {
        name: "GIFT OF APOTHEOSIS",
        type: entryTypes.ACTION,
        description:
            "Swaps the user's current condition with the target's, then gain BURDEN OF STIGMA on self. Cannot be used if the target is in ASCENDENCE OF SPIRIT state.",
    },

    [actionKeys.SERAPH_OF_CONDEMNATION]: {
        name: "SERAPH OF CONDEMNATION",
        type: entryTypes.ACTION,
        description:
            "Inflicts TARNISHED SIN on the target based on REVELATION on self.",
    },

    [actionKeys.GLIMPSE_OF_PANDEMONIUM]: {
        name: "GLIMPSE OF PANDEMONIUM",
        type: entryTypes.ACTION,
        description:
            "Burns RESOURCES on every entity equal to SACRED FLAMES on each. Then, all entities lose all SACRED FLAMES on them. Cannot burn SACRED FLAMES this way.",
    },

    [actionKeys.EDICT_OF_SEVERANCE]: {
        name: "EDICT OF SEVERANCE",
        type: entryTypes.ACTION,
        description: "Applies SEVERED TIME to the battlefield.",
    },

    [actionKeys.THE_WORD_MADE_FLESH]: {
        name: "THE WORD MADE FLESH",
        type: entryTypes.ACTION,
        description:
            "Consumes all RESOURCES on self and inflicts BURDEN OF STIGMA on the target. Then, exits ASCENDENCE OF SPIRIT and enters CUTOFF WINGS. Afterwards, restores RESOURCES on self equal to the amount consumed.",
    },
};

export const MECHANIC_DESCRIPTIONS = {
    [mechanicKeys.MANA_IMBALANCE]: {
        name: "MANA IMBALANCE",
        type: entryTypes.MECHANIC,
        description:
            "The difference between the user's and target's current MANA. If the target has equal or greater MANA, this value is 0.",
    },

    [mechanicKeys.MANA_BLEED]: {
        name: "MANA BLEED",
        type: entryTypes.MECHANIC,
        description:
            "At turn start, loses MANA equal to half of current BLOOD SACRIFICE and restores an equal amount of HEALTH.",
    },

    [effectKeys.RESOURCES]: {
        name: "RESOURCES",
        type: entryTypes.MECHANIC,
        description:
            "Can be divided into FREE RESOURCES, LIMITED RESOURCES and FIXED RESOURCES. When RESOURCES are consumed, consume FREE RESOURCES first, then LIMITED RESOURCES. When RESOURCES are restored, follow the opposite order. FIXED RESOURCES cannot be restored or consumed.",
    },

    [effectKeys.NATURE]: {
        name: "NATURE",
        type: entryTypes.MECHANIC,
        description:
            "Passive Effect - All ALIGNED entities restore double RESOURCES. Active Effect - Restore RESOURCES by OVERGROWTH on self.",
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

    [effectKeys.SONORITY]: {
        name: "SONORITY",
        type: entryTypes.MECHANIC,
        description:
            "Starts at 0 and ranges from -10 to 10. Increases when using DEFENSIVE ACTIONS. Decreases when using OFFENSIVE ACTIONS.",
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

    [mechanicKeys.ACTIONS]: {
        name: "ACTIONS",
        type: entryTypes.MECHANIC,
        description:
            "Abilities a player may choose to use during the PLAN subphase of their TURN. Can be subdivided into OFFENSIVE ACTIONS, DEFENSIVE ACTIONS and TRANSFORMATIVE ACTIONS. Most actions automatically advance the turn phase to COMMIT.",
    },
};

export const BATTLE_PHASE_DESCRIPTIONS = {
    [mechanicKeys.ROUND]: {
        name: "ROUND",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A full game cycle. A basic ROUND consists only a TURN from each player, but can be extended via additional phases. A full ROUND can be subdivided as follows: FIRST PLAYER TURN, FIRST PLAYER STARFALL, RUNIC INSCRIPTION, SECOND PLAYER TURN, SECOND PLAYER STARFALL, RUNIC INSCRIPTION, ELEMENTAL CYCLE and EMANATION.",
    },

    [mechanicKeys.TURN]: {
        name: "TURN",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A player's active cycle. It can be subdivided into three phases: UPKEEP, PLAN and COMMIT. Every player has a single TURN per ROUND.",
    },

    [mechanicKeys.UPKEEP]: {
        name: "UPKEEP",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where the 'Turn Start' effects are applied.",
    },

    [mechanicKeys.COMMIT]: {
        name: "COMMIT",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where the 'Turn End' effects are applied.",
    },

    [mechanicKeys.PLAN]: {
        name: "PLAN",
        type: entryTypes.BATTLE_PHASE,
        description: "A TURN subphase where ACTIONS can be used.",
    },

    [mechanicKeys.RUNIC_INSCRIPTION]: {
        name: "RUNIC INSCRIPTION",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase triggered at between each player's TURN while RUNIC ARRAY is active.",
    },

    [mechanicKeys.ELEMENTAL_CYCLE]: {
        name: "ELEMENTAL CYCLE",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase triggered at ROUND end if at least one ALIGNED player is on the battlefield.",
    },

    [mechanicKeys.EMANATION]: {
        name: "EMANATION",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase triggered at ROUND end while EYE OF HEAVENS is awoken.",
    },
};

export const ACTION_CATEGORY_DESCRIPTIONS = {
    [mechanicKeys.OFFENSIVE_ACTIONS]: {
        name: "OFFENSIVE ACTIONS",
        type: entryTypes.MECHANIC,
        description:
            "Includes ATTACK, SPECIAL ATTACK, LASER, MELTDOWN, and SELF-SACRIFICE.",
    },

    [mechanicKeys.DEFENSIVE_ACTIONS]: {
        name: "DEFENSIVE ACTIONS",
        type: entryTypes.MECHANIC,
        description: "Includes HEAL, GUARD, and AEGIS.",
    },

    [mechanicKeys.TRANSFORMATIVE_ACTIONS]: {
        name: "TRANSFORMATIVE ACTIONS",
        type: entryTypes.MECHANIC,
        description:
            "Includes ARRAY, SHADOW PACT, DARK PROMISE, ATTUNE, DA CAPO, DEPLOY, CURSE, RITUAL OF ASH, SOUND OF SILENCE, BABEL, SHADOW MANTLE, BLACK MAYHEM, ALIGN, and CHART.",
    },
};

export const CATEGORY_DESCRIPTIONS = {
    [entryTypes.FIELD_EFFECT]: {
        name: "FIELD EFFECT",
        type: entryTypes.CATEGORY,
        description:
            "A persistent effect that applies to the entire battlefield, affecting all entities equally.",
    },

    [entryTypes.STATE]: {
        name: "STATE",
        type: entryTypes.CATEGORY,
        description:
            "A persistent effect that applies only to the entity in question.",
    },

    [entryTypes.DAMAGE_TYPE]: {
        name: "DAMAGE TYPE",
        type: entryTypes.CATEGORY,
        description:
            "A property that defines how the resulting damage will be calculated and applied. Includes PHYSICAL DAMAGE, PIERCING DAMAGE and TRUE DAMAGE.",
    },

    [entryTypes.FREE_RESOURCE]: {
        name: "FREE RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that have no upper cap. Includes SHADOWFLAME, UNRELENTING SHADOWS, LINGERING EMBER, CINDERS, POISON, MANA OVERFLOW, SHACKLED MANA, CRYOGENESIS, BLOOD SACRIFICE, DOME, STARDUST, RADIANCE, HALO, INSPIRATION and SACRED FLAMES. When FREE RESOURCES are consumed, they're consumed in this order. When they're restored, they're restored in reverse order.",
    },

    [entryTypes.LIMITED_RESOURCE]: {
        name: "LIMITED RESOURCE",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that has upper cap. Includes OVERHEAT, MANA, HEALTH, INSIGHT, ENLIGHTENMENT. When LIMITED RESOURCES are consumed, they're consumed in this order. When they're restored, they're restored in reverse order. Cannot restore LIMITED RESOURCES when their max limit is 0, instead, continue to the next RESOURCE on the list. When restoring a LIMITED RESOURCE above the limit, if they have an overflow rule, follow that rule; otherwise continue to the next RESOURCE on the list.",
    },

    [entryTypes.FIXED_RESOURCE]: {
        name: "FIXED RESOURCE",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are percentage-based and have strict limits. Includes  TARNISHED SIN and DIVINE SPARK. Cannot restore or consume FIXED RESOURCES.",
    },

    [entryTypes.MITIGATION_RESOURCE]: {
        name: "MITIGATION RESOURCE",
        type: entryTypes.CATEGORY,
        description:
            "A subset of FREE RESOURCES. When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes RESOURCES of this type to decrease damage taken. Includes HALO, CRYOGENESIS, DOME and LINGERING EMBER. When consuming this type of resource due to damage taken, consume them in this order.",
    },

    [entryTypes.BATTLE_PHASE]: {
        name: "BATTLE PHASE",
        type: entryTypes.CATEGORY,
        description: "A subsection of a battle.",
    },

    [entryTypes.ELEMENTAL_ESSENCE]: {
        name: "ELEMENTAL ESSENCE",
        type: entryTypes.CATEGORY,
        description:
            "Includes OVERGROWTH, PERMAFROST and SCORIA, corresponding to NATURE, FROST and SCORCH respectively.",
    },

    [entryTypes.STAR]: {
        name: "STAR",
        type: entryTypes.CATEGORY,
        description:
            "Special resource type that interacts with the STARFALL phase.",
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
    ...ACTION_CATEGORY_DESCRIPTIONS,
    ...CATEGORY_DESCRIPTIONS,
    ...BATTLE_PHASE_DESCRIPTIONS,
};
