import {
    actionKeys,
    dmgTypes,
    effectKeys,
    elementalKeys,
    entryTypes,
    moonKeys,
    roundPhases,
} from "./enums";

export const ACTION_DESCRIPTIONS = {
    [actionKeys.ATTACK]: {
        name: "ATTACK",
        type: entryTypes.OFFENSIVE_ACTION,
        description: "Deals PHYSICAL DAMAGE equal to the user's STR.",
    },

    [actionKeys.HEAL]: {
        name: "HEAL",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Consumes MANA to replenish missing HEALTH. Cleanses POISON, then gains DISTILLED TOXIN equal to the amount cleansed.",
    },

    [actionKeys.GUARD]: {
        name: "GUARD",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Restores MANA equal to 30% of MAX MANA and enters GUARDING state until next turn start. Cannot gain MANA OVERFLOW this way.",
    },

    [actionKeys.SPECIAL_ATTACK]: {
        name: "SPECIAL ATTACK",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Deals PIERCING DAMAGE equal to the user's STR. If MANA IMBALANCE is positive, restores MANA to the target and increases the damage dealt by its value. If MANA IMBALANCE is negative, restores MANA on self and decreases the damage dealt by its value. Then, consumes 6 MANA. Cannot be used at less than 6 MANA.",
    },

    [actionKeys.SACRIFICE]: {
        name: "SACRIFICE",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Loses half current HEALTH, rounded up. Gains BLOOD SACRIFICE and increases MAX MANA equal to the HEALTH lost this way, raises MANA BLEED rank equal to half the HEALTH lost this way, rounded up, then enters SACRIFICIAL state until next turn start.",
    },

    [actionKeys.ARRAY]: {
        name: "ARRAY",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Envelops the battlefield in a RUNIC ARRAY for 3 turns. Consumes all MANA and MANA OVERFLOW from every entity, then grants SHACKLED MANA equal to the amount consumed on each entity.",
    },

    [actionKeys.CURSE]: {
        name: "CURSE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Ends RUNIC ARRAY. Then, consumes all SHACKLED MANA from every entity. Each entity gains POISON equal to the amount consumed on self.",
    },

    [actionKeys.SHADOW_PACT]: {
        name: "SHADOW PACT",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Enters UMBRAL CORE and exits all other states. Burns 5 RESOURCES, then gains SHADOWFLAME equal to the amount burned. Cannot burn SHADOWFLAME, LINGERING EMBER and UNRELENTING SHADOWS.",
    },

    [actionKeys.BLACK_MAYHEM]: {
        name: "BLACK MAYHEM",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Burns the target's RESOURCES equal to the user's SHADOWFLAME. Grants CINDERS to the target equal to twice the RESOURCES burnt. When burning CINDERS, does not grant CINDERS. Cannot burn SHADOWFLAME, LINGERING EMBER and UNRELENTING SHADOWS.",
    },

    [actionKeys.SHADOW_MANTLE]: {
        name: "SHADOW MANTLE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Gains UNRELENTING SHADOWS equal to SHADOWFLAME on self. Then, enters DARK EMBRACE until next turn start.",
    },

    [actionKeys.RITUAL_OF_ASH]: {
        name: "RITUAL OF ASH",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Extinguishes all SHADOWFLAME on self, then gains LINGERING EMBER equal to the amount lost.",
    },

    [actionKeys.DARK_PROMISE]: {
        name: "DARK PROMISE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Exits UMBRAL CORE and enters DIMMING DARKNESS until next turn start. Loses all SHADOWFLAME, LINGERING EMBER and CINDERS, then grants UNRELENTING SHADOWS to all entities equal to the SHADOWFLAME lost plus half the LINGERING EMBER lost.",
    },

    [actionKeys.DEPLOY]: {
        name: "DEPLOY",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters DEPLOYMENT state.",
    },

    [actionKeys.LASER]: {
        name: "LASER",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Deals PIERCING DAMAGE equal to the user's current ENERGY LEVEL. Raises DYNAMO and OVERHEAT by 10%. Raises OVERHEAT by an additional 10% for every LASER used this turn. Does not end turn.",
    },

    [actionKeys.MELTDOWN]: {
        name: "MELTDOWN",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "All entities take PHYSICAL DAMAGE equal to the user's current ENERGY LEVEL. Increases damage dealt by 1 for every 10% DYNAMO on self, then multiplies the resulting damage by current OVERHEAT. Afterwards, loses all DYNAMO on self, exits THERMAL OVERLOAD and enters VENTING state.",
    },
};

export const STATE_DESCRIPTIONS = {
    [effectKeys.GUARDING_STATE]: {
        name: "GUARDING",
        type: entryTypes.STATE,
        description:
            "Raises DEF EFFECTIVENESS and DAMAGE REDUCTION by 50%. Cleared at turn start.",
    },

    [effectKeys.SACRIFICIAL_STATE]: {
        name: "SACRIFICIAL",
        type: entryTypes.STATE,
        description: "Raises DAMAGE REDUCTION by 50%. Cleared at turn start.",
    },

    [effectKeys.UMBRAL_CORE]: {
        name: "UMBRAL CORE",
        type: entryTypes.STATE,
        description:
            "Replaces all actions with SHADOW MANTLE, BLACK MAYHEM, RITUAL OF ASH, and DARK PROMISE. At turn start, if at no SHADOWFLAME and LINGERING EMBER on self, exits UMBRAL CORE and gains BLEAK DECEPTION.",
    },

    [effectKeys.DARK_EMBRACE]: {
        name: "DARK EMBRACE",
        type: entryTypes.STATE,
        description:
            "Raises DAMAGE REDUCTION by 50%. While active, SHADOWFLAME on self does not burn RESOURCES. Cleared at turn start.",
    },

    [effectKeys.DIMMING_DARKNESS]: {
        name: "DIMMING DARKNESS",
        type: entryTypes.STATE,
        description:
            "Does not activate POISON and MANA OVERFLOW effects on self. Cleared at turn start.",
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
            "Replaces DEPLOY with LASER. At 100% or more OVERHEAT, becomes THERMAL OVERLOAD.",
    },

    [effectKeys.THERMAL_OVERLOAD]: {
        name: "THERMAL OVERLOAD",
        type: entryTypes.STATE,
        description: "Replaces all actions with MELTDOWN.",
    },

    [effectKeys.VENTING]: {
        name: "VENTING",
        type: entryTypes.STATE,
        description:
            "Cannot use DEPLOY, LASER or MELTDOWN. Raises DAMAGE REDUCTION by 50%. At turn start, lowers OVERHEAT by 50%. Additionally, if at 0% OVERHEAT, exits VENTING state and enters WEAPONS DEPLOYED.",
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
        type: entryTypes.OVERFLOWN_RESOURCE,
        description:
            "Used before MANA by abilities that consume MANA. At turn end, loses all MANA OVERFLOW on self and takes TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.SHACKLED_MANA]: {
        name: "SHACKLED MANA",
        type: entryTypes.FREE_RESOURCE,
        description:
            "Inactive. Cannot be used as MANA. When taking PHYSICAL DAMAGE, the attacker takes damage equal to SHACKLED MANA on self.",
    },

    [effectKeys.POISON]: {
        name: "POISON",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, takes TRUE DAMAGE equal to current POISON stacks.",
    },

    [effectKeys.DISTILLED_TOXIN]: {
        name: "DISTILLED TOXIN",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, loses half stack, rounded up, and replenishes MANA equal to the amount lost.",
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
            "Cannot be consumed by SHADOWFLAME. When suffering PHYSICAL DAMAGE or PIERCING DAMAGE, consumes LINGERING EMBER to reduce the damage taken and gains CINDERS equal to the amount lost this way. At turn start, converts half of current LINGERING EMBER into both SHADOWFLAME and CINDERS.",
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
            "Increases PHYSICAL DAMAGE dealt equal to BLOOD SACRIFICE on self.",
    },

    [effectKeys.UNRELENTING_SHADOWS]: {
        name: "UNRELENTING SHADOWS",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, loses all UNRELENTING SHADOWS. Then, restores RESOURCES based on the UNRELENTING SHADOWS lost this way.",
    },

    [effectKeys.OVERHEAT]: {
        name: "OVERHEAT",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Enabled when in DEPLOYMENT, WEAPONS DEPLOYED, THERMAL OVERLOAD or VENTING states. Can go over 100%. When using DEFENSIVE ACTIONS, lowers OVERHEAT by 30% and raises DYNAMO by the amount lowered this way.",
    },

    [effectKeys.MANA]: {
        name: "MANA",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped at MAX MANA. When restoring MANA above the limit, gains MANA OVERFLOW instead.",
    },

    [effectKeys.HEALTH]: {
        name: "HEALTH",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped at MAX HEALTH. Cannot restore HEALTH above the limit. When HEALTH reaches 0, loses the battle.",
    },
};

export const FIELD_EFFECT_DESCRIPTIONS = {
    [effectKeys.RUNIC_ARRAY]: {
        name: "RUNIC ARRAY",
        type: entryTypes.FIELD_EFFECT,
        description:
            "While active, enables MANA SIPHON and RUNIC PULSE. Additionally, replaces ARRAY with CURSE and disables MANA OVERFLOW turn end effects.",
    },
};

export const DAMAGE_TYPE_DESCRIPTIONS = {
    [dmgTypes.PHYSICAL]: {
        name: "PHYSICAL DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's HEALTH. Can be blocked by EFFECTIVE DEFENSE, affected by DAMAGE MODIFIERS or mitigated by MITIGATION RESOURCES.",
    },

    [dmgTypes.PIERCING]: {
        name: "PIERCING DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's HEALTH. Ignores EFFECTIVE DEFENSE, but can be affected by DAMAGE MODIFIERS or mitigated by MITIGATION RESOURCES.",
    },

    [dmgTypes.TRUE]: {
        name: "TRUE DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's HEALTH. Cannot be blocked by EFFECTIVE DEFENSE, affected by DAMAGE MODIFIERS or mitigated by MITIGATION RESOURCES.",
    },

    [dmgTypes.LUNIC]: {
        name: "LUNIC DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's MAX HEALTH. Ignores EFFECTIVE DEFENSE, DAMAGE MODIFIERS and MITIGATION RESOURCES. When decreasing MAX HEALTH below 0, decreases MOONLIGHT instead.",
    },
};

export const STAT_DESCRIPTIONS = {
    [effectKeys.STR]: {
        name: "STR",
        type: entryTypes.BASE_ATTRIBUTES,
        description:
            "The main offensive ATTRIBUTES. Increases the damage dealt by some actions and effects.",
    },

    [effectKeys.DEF]: {
        name: "DEF",
        type: entryTypes.BASE_ATTRIBUTES,
        description:
            "The main defensive ATTRIBUTES. Decreases the damage taken from some actions and effects.",
    },
};

export const STAR_DESCRIPTIONS = {
    [actionKeys.CHART]: {
        name: "CHART",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Gains 3 WHITE STAR. Converts all GRAY STAR on self into WHITE STAR. If not in the STARGAZER state, enters the STARGAZER state.",
    },

    [effectKeys.STARGAZER]: {
        name: "STARGAZER",
        type: entryTypes.STATE,
        description:
            "While active, enables STARFALL after turn end. During the action phase, enables a side-menu for star assignment. When exiting this state, loses all STARS and sets CONTELLATION rank to 0.",
    },

    [entryTypes.STAR]: {
        name: "STARS",
        type: entryTypes.CATEGORY,
        description:
            "A unique subset of RESOURCES. Includes WHITE STAR, GRAY STAR, RED STAR, ORANGE STAR, YELLOW STAR, GREEN STAR, BLUE STAR, INDIGO STAR, and VIOLET STAR",
    },

    [effectKeys.STARFALL]: {
        name: "STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase where colored STARS act. Divided into seven ordered subphases: RED STARFALL, ORANGE STARFALL, YELLOW STARFALL, GREEN STARFALL, BLUE STARFALL, INDIGO STARFALL and VIOLET STARFALL. This phase is skipped if the corresponding entity hasn't assigned any stars.",
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
        description:
            "The seventh and final subphase of STARFALL, when VIOLET STAR acts.",
    },

    [effectKeys.WHITE_STAR]: {
        name: "WHITE STAR",
        type: entryTypes.STAR,
        description:
            "Can be assigned colors to become RED STAR, ORANGE STAR, YELLOW STAR, GREEN STAR, BLUE STAR, INDIGO STAR, or VIOLET STAR.",
    },

    [effectKeys.RED_STAR]: {
        name: "RED STAR",
        type: entryTypes.STAR,
        description:
            "At RED STARFALL, converts all RED STAR into WHITE STAR. Deals PHYSICAL DAMAGE equal to the amount of normal RED STAR consumed. Deals PIERCING DAMAGE equal to the amount of augmented RED STAR consumed. These are considered two separate instances of damage. This effect does not look at the STARS owner current condition.",
    },

    [effectKeys.ORANGE_STAR]: {
        name: "ORANGE STAR",
        type: entryTypes.STAR,
        description:
            "At ORANGE STARFALL, converts all ORANGE STAR into WHITE STAR. Burns RESOURCES on self equal to the amount of normal ORANGE STAR consumed. Burns RESOURCES on both opponent and self equal to the amount of augmented ORANGE STAR consumed.",
    },

    [effectKeys.YELLOW_STAR]: {
        name: "YELLOW STAR",
        type: entryTypes.STAR,
        description:
            "At YELLOW STARFALL, converts all YELLOW STAR into WHITE STAR. Raises NEBULA by 5% for every normal YELLOW STAR consumed. Raises CONSTELLATION rank by the amount of augmented YELLOW STAR consumed.",
    },

    [effectKeys.NEBULA]: {
        name: "NEBULA",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. When raising NEBULA above 100%, raises STARBLIGHT instead. Raises DAMAGE BONUS equal to NEBULA. At turn end, lose all NEBULA.",
    },

    [effectKeys.STARBLIGHT]: {
        name: "STARBLIGHT",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Lowers MAX HEALTH equal to STARBLIGHT on self, rounded up. Raises DAMAGE BONUS equal to STARBLIGHT on self. When STARBLIGHT reaches 100%, enters NOVA state.",
    },

    [effectKeys.NOVA]: {
        name: "NOVA",
        type: entryTypes.STATE,
        description:
            "Cannot die. Replaces all actions with SUPERNOVA. At turn end, removes this state.",
    },

    [actionKeys.SUPERNOVA]: {
        name: "SUPERNOVA",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Consumes all STARS. Deals TRUE DAMAGE equal to half the STARS consumed, rounded up.",
    },

    [effectKeys.CONSTELLATION]: {
        name: "CONSTELLATION",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Raises ATTRIBUTES equal to CONSTELLATION rank. During the PLAN subphase of a player's TURN, can be interacted with to become AZURE CONSTELLATION or CRIMSON CONSTELLATION. At turn end, lose all CONSTELLATION.",
    },

    [effectKeys.AZURE_CONSTELLATION]: {
        name: "AZURE CONSTELLATION",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Raises DEF equal to AZURE CONSTELLATION rank. When raising CONSTELLATION rank, raises AZURE CONSTELLATION rank instead. During the PLAN subphase of a player's TURN, can be interacted with to become CONSTELLATION or CRIMSON CONSTELLATION. At turn end, lose all AZURE CONSTELLATION.",
    },

    [effectKeys.CRIMSON_CONSTELLATION]: {
        name: "CRIMSON CONSTELLATION",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Raises STR equal to CRIMSON CONSTELLATION rank. When raising CONSTELLATION rank, raises CRIMSON CONSTELLATION rank instead. During the PLAN subphase of a player's TURN, can be interacted with to become AZURE CONSTELLATION or CONSTELLATION. At turn end, lose all CRIMSON CONSTELLATION.",
    },

    [effectKeys.GREEN_STAR]: {
        name: "GREEN STAR",
        type: entryTypes.STAR,
        description:
            "At GREEN STARFALL, converts all GREEN STAR into WHITE STAR. Loses WHITE STAR and restores RESOURCES equal to the amount of normal GREEN STAR consumed. Restores RESOURCES on self equal to the amount of augmented GREEN STAR consumed.",
    },

    [effectKeys.BLUE_STAR]: {
        name: "BLUE STAR",
        type: entryTypes.STAR,
        description:
            "At BLUE STARFALL, converts all BLUE STAR into WHITE STAR. Gains DOME and converts WHITE STAR into GRAY STAR equal to the amount of normal BLUE STAR consumed. Gains DOME equal to twice the amount of augmented BLUE STAR consumed.",
    },

    [effectKeys.DOME]: {
        name: "DOME",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes DOME to reduce the damage taken. At turn start, converts all DOME into STARDUST.",
    },

    [effectKeys.STARDUST]: {
        name: "STARDUST",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, for every 3 STARDUST on self, loses 3 STARDUST and gains 1 WHITE STAR.",
    },

    [effectKeys.INDIGO_STAR]: {
        name: "INDIGO STAR",
        type: entryTypes.STAR,
        description:
            "At INDIGO STARFALL, converts all INDIGO STAR into WHITE STAR. Gains STARDUST equal to the amount of normal INDIGO STAR consumed. Gains GRAY STAR equal to the amount of augmented INDIGO STAR consumed.",
    },

    [effectKeys.VIOLET_STAR]: {
        name: "VIOLET STAR",
        type: entryTypes.STAR,
        description:
            "When a colored star is consumed, converts VIOLET STAR into WHITE STAR and converts that star into an augmented version of itself. At VIOLET STARFALL, converts all VIOLET STAR into WHITE STAR.",
    },

    [effectKeys.GRAY_STAR]: {
        name: "GRAY STAR",
        type: entryTypes.STAR,
        description: "Cannot be assigned a color.",
    },
};

export const PALADIN_DESCRIPTIONS = {
    [actionKeys.AEGIS]: {
        name: "AEGIS",
        type: entryTypes.DEFENSIVE_ACTION,
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
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes HALO to decrease the damage taken, then gains RADIANCE equal to the amount lost. At turn start, loses all HALO, then raises DIVINE SPARK by 1% for every HALO lost this way.",
    },

    [effectKeys.RADIANCE]: {
        name: "RADIANCE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using ATTACK, consumes all RADIANCE on self to increase the damage dealt.",
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
        description:
            "Cannot exceed MAX ENLIGHTENMENT. Replaces HEALTH for entities on the ASCENDENCE OF SPIRIT state.",
    },

    [effectKeys.ZENITH_OF_MORTALITY]: {
        name: "ZENITH OF MORTALITY",
        type: entryTypes.STATE,
        description: "Replaces all actions with ASCEND.",
    },

    [actionKeys.ASCEND]: {
        name: "ASCEND",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Opens the EYE OF HEAVENS, exits all other states, and consumes all RESOURCES on self. Then gains REVELATION based on STR and DEF on self and enters ASCENDENCE OF SPIRIT. Afterwards, loses all STR and DEF on self, and gains INSPIRATION equal to the RESOURCES consumed previously. Additionally, sets MAX ENLIGHTENMENT and MAX INSIGHT to 100, then gains 100 ENLIGHTENMENT. This action does not end the turn.",
    },

    [effectKeys.ASCENDENCE_OF_SPIRIT]: {
        name: "ASCENDENCE OF SPIRIT",
        type: entryTypes.STATE,
        description:
            "Does not die upon reaching 0 HEALTH. At turn start, if at 0 or less ENLIGHTENMENT, exits this state and enters CUTOFF WINGS. When taking PHYSICAL DAMAGE or PIERCING DAMAGE, loses ENLIGHTENMENT instead of HEALTH, then gains INSPIRATION equal to the ENLIGHTENMENT lost. Additionally, when taking PHYSICAL DAMAGE, decreases the damage taken by the REVELATION on self. When taking TRUE DAMAGE, raises TARNISHED SIN by 1% for every point of damage received instead of losing HEALTH. When restoring HEALTH or MANA, gains INSPIRATION instead. Replaces all actions with ACTS OF BENEDICTION and ACTS OF MALEDICTION.",
    },

    [effectKeys.TARNISHED_SIN]: {
        name: "TARNISHED SIN",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "When reaching 100% TARNISHED SIN, enters ABANDONED BY GRACE state.",
    },

    [effectKeys.ABANDONED_BY_GRACE]: {
        name: "ABANDONED BY GRACE",
        type: entryTypes.STATE,
        description:
            "If there's any entity on this state, but no entity on ANOINTED PROXY state, immediately opens the EYE OF HEAVENS and triggers ANOINTMENT.",
    },

    [effectKeys.ANOINTED_PROXY]: {
        name: "ANOINTED PROXY",
        type: entryTypes.STATE,
        description: "Replaces all actions with JUDGEMENT.",
    },

    [actionKeys.JUDGEMENT]: {
        name: "JUDGEMENT",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Cleanses all STATES, TARNISHED SIN, and RESOURCES from the opponent. Then, exits ANOINTED PROXY.",
    },

    [effectKeys.EYE_OF_HEAVENS]: {
        name: "EYE OF HEAVENS",
        type: entryTypes.FIELD_EFFECT,
        description:
            "Enables EMANATION at round end. During EMANATION, if closed, opens, grants REVELATION to each entity for every 10 INSIGHT on them and removes SEVERED TIME from the battlefield; otherwise, closes. If there's at least one entity with ABANDONED BY GRACE on the battlefield, opens and grants ANOINTED PROXY to their adversary. If their adversary is also on the ABANDONED BY GRACE state, instead cleanses all STATES and consumes all RESOURCES from both entities, then ends battle.",
    },

    [effectKeys.ANOINTMENT]: {
        name: "ANOINTMENT",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase triggered when there's an entity in the ABANDONED BY GRACE state present, but no entity in the ANOINTED PROXY state. If there's at least one entity with ABANDONED BY GRACE on the battlefield, grants ANOINTED PROXY to their adversary. If their adversary is also on the ABANDONED BY GRACE state, instead cleanses all STATES, TARNISHED SIN and RESOURCES from both entities.",
    },

    [effectKeys.EMANATION]: {
        name: "EMANATION",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase triggered at ROUND end while EYE OF HEAVENS is awoken. On this phase, if there's no entities on the ASCENDENCE OF SPIRIT state present, EYE OF HEAVENS is set to DORMANT; if EYE OF HEAVENS is CLOSED, opens it, grants REVELATION to each entity for every 10 INSIGHT on them, and removes SEVERED TIME from the battlefield; if EYE OF HEAVENS is OPEN, closes it. ",
    },

    [effectKeys.INSIGHT]: {
        name: "INSIGHT",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Cannot exceed MAX INSIGHT. When restoring INSIGHT above the limit, gains INSPIRATION instead.",
    },

    [effectKeys.CUTOFF_WINGS]: {
        name: "CUTOFF WINGS",
        type: entryTypes.STATE,
        description:
            "Cannot use AEGIS. Upon entering this state, sets MAX HEALTH to 1 and recovers 1 HEALTH.",
    },

    [effectKeys.REVELATION]: {
        name: "REVELATION",
        type: entryTypes.SPECIAL_ATTRIBUTES,
        description: "Used by certain actions and effects.",
    },

    [effectKeys.SEVERED_TIME]: {
        name: "SEVERED TIME",
        type: entryTypes.FIELD_EFFECT,
        description:
            "Turn start and turn end effects do not trigger. At MOON PHASE, MIRRORED MOON does not change phases. At RUNIC PULSE, RUNIC ARRAY duration does not decrease.",
    },

    [effectKeys.INSPIRATION]: {
        name: "INSPIRATION",
        type: entryTypes.OVERFLOWN_RESOURCE,
        description:
            "At turn start, loses INSPIRATION equal to missing INSIGHT, then restores INSIGHT equal to the amount lost this way.",
    },

    [effectKeys.SACRED_FLAMES]: {
        name: "SACRED FLAMES",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, loses SACRED FLAMES for every 1% DIVINE SPARK on self, then loses 1% DIVINE SPARK for every SACRED FLAMES lost this way. Afterwards, loses SACRED FLAMES equal to ENLIGHTENMENT on self, then loses ENLIGHTENMENT equal to the amount lost this way. Finally, loses SACRED FLAMES equal to missing HEALTH, then restores HEALTH equal to the amount lost this way.",
    },

    [actionKeys.BAPTISM_OF_THE_FLAMES]: {
        name: "BAPTISM OF THE FLAMES",
        type: entryTypes.ACT_OF_BENEDICTION,
        description:
            "Grants SACRED FLAMES to the target based on REVELATION on self.",
    },

    [actionKeys.CELESTIAL_SCALE]: {
        name: "CELESTIAL SCALE",
        type: entryTypes.ACT_OF_BENEDICTION,
        description: "Redistributes ENLIGHTENMENT and INSIGHT evenly on self.",
    },

    [actionKeys.HYMNS_OF_SANCTIFICATION]: {
        name: "HYMNS OF SANCTIFICATION",
        type: entryTypes.ACT_OF_BENEDICTION,
        description:
            "Consumes all RESOURCES on self, then restores RESOURCES equal to the amount consumed.",
    },

    [actionKeys.GIFT_OF_APOTHEOSIS]: {
        name: "GIFT OF APOTHEOSIS",
        type: entryTypes.ACT_OF_BENEDICTION,
        description:
            "Absorbs all TARNISHED SIN on the opponent, then raises their DIVINE SPARK to 100%. Cannot be used if the target is in ASCENDENCE OF SPIRIT, ZENITH OF MORTALITY or CUTOFF WINGS states.",
    },

    [actionKeys.SERAPH_OF_CONDEMNATION]: {
        name: "SERAPH OF CONDEMNATION",
        type: entryTypes.ACT_OF_MALEDICTION,
        description:
            "Inflicts TARNISHED SIN on the target based on REVELATION on self.",
    },

    [actionKeys.GLIMPSE_OF_PANDEMONIUM]: {
        name: "GLIMPSE OF PANDEMONIUM",
        type: entryTypes.ACT_OF_MALEDICTION,
        description:
            "Burns RESOURCES on every entity equal to SACRED FLAMES on each, then restores RESOURCES equal to the amount consumed on each. Cannot burn SACRED FLAMES this way.",
    },

    [actionKeys.EDICT_OF_SEVERANCE]: {
        name: "EDICT OF SEVERANCE",
        type: entryTypes.ACT_OF_MALEDICTION,
        description: "Applies SEVERED TIME to the battlefield.",
    },

    [actionKeys.THE_WORD_MADE_FLESH]: {
        name: "THE WORD MADE FLESH",
        type: entryTypes.ACT_OF_MALEDICTION,
        description:
            "Gains BURDEN OF STIGMA equal to a tenth of current REVELATION. Then, exits ASCENDENCE OF SPIRIT.",
    },

    [effectKeys.BURDEN_OF_STIGMA]: {
        name: "BURDEN OF STIGMA",
        type: entryTypes.MECHANIC,
        description: "Cannot die. At turn start, loses 1 BURDEN OF STIGMA.",
    },

    [effectKeys.MAX_ENLIGHTENMENT]: {
        name: "MAX ENLIGHTENMENT",
        type: entryTypes.MECHANIC,
        description:
            "Starts at 0. Limits how much ENLIGHTENMENT you can hold. Increased to 100 upon using ASCEND.",
    },

    [effectKeys.MAX_INSIGHT]: {
        name: "MAX INSIGHT",
        type: entryTypes.MECHANIC,
        description:
            "Starts at 0. Limits how much INSIGHT you can hold. Increased to 100 upon using ASCEND.",
    },
};

export const MECHANIC_DESCRIPTIONS = {
    [effectKeys.MANA_IMBALANCE]: {
        name: "MANA IMBALANCE",
        type: entryTypes.MECHANIC,
        description:
            "The difference between the user's and target's current MANA.",
    },

    [effectKeys.MANA_BLEED]: {
        name: "MANA BLEED",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "At turn start, loses MANA equal to MANA BLEED current level and restores an equal amount of HEALTH.",
    },

    [effectKeys.RESOURCES]: {
        name: "RESOURCES",
        type: entryTypes.MECHANIC,
        description:
            "Can be subdivided into MITIGATION RESOURCES, FREE RESOURCES, OVERFLOWN RESOURCES, LIMITED RESOURCES, RANKED RESOURCES and FIXED RESOURCES. When consuming RESOURCES, consumes only MITIGATION RESOURCES, FREE RESOURCES and LIMITED RESOURCES in this order. When restoring RESOURCES, follows the order in reverse. OVERFLOWN RESOURCES may be consumed or restored alongside LIMITED RESOURCES according to special rules.",
    },

    [effectKeys.MAX_MANA]: {
        name: "MAX MANA",
        type: entryTypes.MECHANIC,
        description: "Starts at 10. Limits how much MANA you can hold.",
    },

    [effectKeys.MAX_HEALTH]: {
        name: "MAX HEALTH",
        type: entryTypes.MECHANIC,
        description:
            "Starts at 20. Limits how much HEALTH you can hold. If MAX HEALTH is 0 or lower, loses the battle.",
    },

    [effectKeys.DEF_EFFECTIVENESS]: {
        name: "DEF EFFECTIVENESS",
        type: entryTypes.MECHANIC,
        description:
            "Used to calculate EFFECTIVE DEFENSE. Defines how much PHYSICAL DAMAGE a point of DEF can block.",
    },

    [effectKeys.EFFECTIVE_DEF]: {
        name: "EFFECTIVE DEFENSE",
        type: entryTypes.MECHANIC,
        description: "Decreases PHYSICAL DAMAGE taken.",
    },

    [effectKeys.DYNAMO]: {
        name: "DYNAMO",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Enabled when in DEPLOYMENT, WEAPONS DEPLOYED, THERMAL OVERLOAD and VENTING states. Capped at 100%. At turn start, if at 100%, resets to 0% and increases ENERGY LEVEL by 1.",
    },

    [effectKeys.ENERGY_LEVEL]: {
        name: "ENERGY LEVEL",
        type: entryTypes.SPECIAL_ATTRIBUTES,
        description: "Increases LASER and MELTDOWN damage.",
    },

    [effectKeys.DAMAGE_REDUCTION]: {
        name: "DAMAGE REDUCTION",
        type: entryTypes.DAMAGE_MODIFIERS,
        description:
            "Decreases PHYSICAL DAMAGE and PIERCING DAMAGE taken by the percentage.",
    },

    [effectKeys.FRAGILITY]: {
        name: "FRAGILITY",
        type: entryTypes.DAMAGE_MODIFIERS,
        description:
            "Increases PHYSICAL DAMAGE and PIERCING DAMAGE taken by the percentage.",
    },

    [effectKeys.DAMAGE_BONUS]: {
        name: "DAMAGE BONUS",
        type: entryTypes.DAMAGE_MODIFIERS,
        description:
            "Increases PHYSICAL DAMAGE and PIERCING DAMAGE dealt by the percentage.",
    },

    [effectKeys.WEAKNESS]: {
        name: "WEAKNESS",
        type: entryTypes.DAMAGE_MODIFIERS,
        description:
            "Decreases PHYSICAL DAMAGE and PIERCING DAMAGE dealt by the percentage.",
    },
};

export const BATTLE_PHASE_DESCRIPTIONS = {
    [effectKeys.ROUND]: {
        name: "ROUND",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A full game cycle. A basic ROUND consists of: ROUND START, PLAYER ONE TURN, PLAYER TWO TURN and ROUND END, but can be extended via additional phases. A complete game round may consist of: ROUND START, PLAYER ONE TURN, PLAYER ONE STARFALL, RUNIC PULSE, PLAYER TWO TURN, PLAYER TWO STARFALL, RUNIC PULSE, MOON PHASE, EMANATION and ROUND END, disregarding MANA SIPHON and ANOINTMENT, which can be triggered at any given time between ROUND START and ROUND END.",
    },

    [roundPhases.ROUND_START]: {
        name: "ROUND START",
        type: entryTypes.BATTLE_PHASE,
        description: "A transitional phase at the start of a ROUND.",
    },

    [roundPhases.ROUND_END]: {
        name: "ROUND END",
        type: entryTypes.BATTLE_PHASE,
        description: "A transitional phase at the end of a ROUND.",
    },

    [effectKeys.TURN]: {
        name: "TURN",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A player's active cycle. It can be subdivided into three phases: UPKEEP, PLAN and COMMIT. Every player has a single TURN per ROUND.",
    },

    [effectKeys.UPKEEP]: {
        name: "UPKEEP",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where the 'Turn Start' effects are applied.",
    },

    [effectKeys.COMMIT]: {
        name: "COMMIT",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where the 'Turn End' effects are applied.",
    },

    [effectKeys.PLAN]: {
        name: "PLAN",
        type: entryTypes.BATTLE_PHASE,
        description: "A TURN subphase where an ACTION can be used.",
    },

    [effectKeys.RUNIC_PULSE]: {
        name: "RUNIC PULSE",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase triggered between each player's TURN while RUNIC ARRAY is active. On this phase, grants every entity 5 SHACKLED MANA and decreases remaining RUNIC ARRAY duration. If duration reaches 0 due to this effect, does not grant SHACKLED MANA; instead, absorbs all SHACKLED MANA on all entities, then redistributes it evenly between them and ends RUNIC ARRAY.",
    },

    [effectKeys.MANA_SIPHON]: {
        name: "MANA SIPHON",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase triggered whenever an entity has MANA or MANA OVERFLOW during a phase transition. On this phase, absorbs all MANA and MANA OVERFLOW from each entity, then grants SHACKLED MANA corresponding to the amount consumed on each.",
    },
};

export const ACTION_CATEGORY_DESCRIPTIONS = {
    [entryTypes.OFFENSIVE_ACTION]: {
        name: "OFFENSIVE ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "A type of ACTION. Includes ATTACK, SPECIAL ATTACK, SACRIFICE, LASER, MELTDOWN, LUNAR STRIKE, LUNAR SMITE, LUNAR SHED and CHALK.",
    },

    [entryTypes.DEFENSIVE_ACTION]: {
        name: "DEFENSIVE ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "A type of ACTION. Includes HEAL, GUARD, AEGIS, LUNAR GROWTH, LUNAR TIDE and LUNAR SHROUD.",
    },

    [entryTypes.TRANSFORMATIVE_ACTION]: {
        name: "TRANSFORMATIVE ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "A type of ACTION. Includes ARRAY, CURSE, DEPLOY, ATTUNE, DA CAPO, SOUND OF SILENCE, BABEL, SHADOW PACT, BLACK MAYHEM, SHADOW MANTLE, RITUAL OF ASH, DARK PROMISE, CHART, REFRACT, MIRROR, SHATTER, ASCEND and JUDGEMENT.",
    },

    [entryTypes.ACT_OF_BENEDICTION]: {
        name: "ACTS OF BENEDICTION",
        type: entryTypes.CATEGORY,
        description:
            "A type of ACTION. Includes BAPTISM OF THE FLAMES, CELESTIAL SCALE, HYMNS OF SANCTIFICATION and GIFT OF APOTHEOSIS. When using an ACT OF BENEDICTION while EYE OF HEAVENS is CLOSED, gains INSPIRATION equal to REVELATION on self.",
    },

    [entryTypes.ACT_OF_MALEDICTION]: {
        name: "ACTS OF MALEDICTION",
        type: entryTypes.CATEGORY,
        description:
            "A type of ACTION. Includes SERAPH OF CONDEMNATION, GLIMPSE OF PANDEMONIUM, EDICT OF SEVERANCE and THE WORD MADE FLESH. When using an ACT OF MALEDICTION while EYE OF HEAVENS is OPEN, raises TARNISHED SIN on self by 1% for every REVELATION on self.",
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
            "A persistent effect that applies only to a singular entity.",
    },

    [entryTypes.ATTRIBUTES]: {
        name: "ATTRIBUTES",
        type: entryTypes.CATEGORY,
        description:
            "Can be subdivided into BASE ATTRIBUTES and SPECIAL ATTRIBUTES. When raising or lowering ATTRIBUTES via combat effects, raises or lowers only BASE ATTRIBUTES in alternating fashion.",
    },

    [entryTypes.BASE_ATTRIBUTES]: {
        name: "BASE ATTRIBUTES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ATTRIBUTES. Includes STR and DEF. When raising or lowering BASE ATTRIBUTES via combat effects, alternates between each attribute, starting with STR.",
    },

    [entryTypes.SPECIAL_ATTRIBUTES]: {
        name: "SPECIAL ATTRIBUTES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ATTRIBUTES. Includes ENERGY LEVEL, MOONLIGHT and REVELATION.",
    },

    [entryTypes.DAMAGE_TYPE]: {
        name: "DAMAGE TYPE",
        type: entryTypes.CATEGORY,
        description:
            "A property that defines how the resulting damage will be calculated and applied. Includes PHYSICAL DAMAGE, PIERCING DAMAGE, TRUE DAMAGE and LUNIC DAMAGE.",
    },

    [entryTypes.FREE_RESOURCE]: {
        name: "FREE RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that have no upper cap. Includes SHADOWFLAME, UNRELENTING SHADOWS, CINDERS, POISON, SHACKLED MANA, BLOOD SACRIFICE, STARDUST, RADIANCE, MOONDUST and SACRED FLAMES. When FREE RESOURCES are consumed, they're consumed in this order. When they're restored, they're restored in reverse order.",
    },

    [entryTypes.LIMITED_RESOURCE]: {
        name: "LIMITED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that has upper cap. Includes MANA, HEALTH, INSIGHT, ENLIGHTENMENT. When LIMITED RESOURCES are consumed, they're consumed in this order. When they're restored, they're restored in reverse order. When consuming LIMITED RESOURCES, consumes their corresponding OVERFLOWN RESOURCES first. Cannot restore LIMITED RESOURCES when their max limit is 0, instead, continues to the next RESOURCE on the list. When restoring a LIMITED RESOURCE above the limit, if they have an overflow rule, follows that rule; otherwise continues to the next RESOURCE on the list.",
    },

    [entryTypes.FIXED_RESOURCE]: {
        name: "FIXED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are percentage-based and have strict limits. Includes OVERHEAT, DYNAMO, LUNACY, TARNISHED SIN and DIVINE SPARK.",
    },

    [entryTypes.RANKED_RESOURCE]: {
        name: "RANKED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are rank-based. Includes MANA BLEED, MOONLIT TEARS and BURDEN OF STIGMA.",
    },

    [entryTypes.MITIGATION_RESOURCE]: {
        name: "MITIGATION RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that mitigate PHYSICAL DAMAGE and PIERCING DAMAGE taken. Includes REFRACTED DIVINITY, HALO, LINGERING EMBER, DOME and MYCELIUM. When consuming this type of resource, consumes them in this order.",
    },

    [entryTypes.OVERFLOWN_RESOURCE]: {
        name: "OVERFLOWN RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that can be gained when restoring LIMITED RESOURCES above their cap. Includes SILVER BLOOD, MANA OVERFLOW and INSPIRATION. When consuming LIMITED RESOURCES, consumes the corresponding OVERFLOWN RESOURCES first.",
    },

    [entryTypes.BATTLE_PHASE]: {
        name: "BATTLE PHASE",
        type: entryTypes.CATEGORY,
        description: "A subsection of a battle.",
    },

    [entryTypes.STAR]: {
        name: "STAR",
        type: entryTypes.CATEGORY,
        description:
            "Special resource type that interacts with the STARFALL phase.",
    },

    [entryTypes.MECHANIC]: {
        name: "MECHANIC",
        type: entryTypes.CATEGORY,
        description: "A core gameplay system.",
    },

    [entryTypes.DAMAGE_MODIFIERS]: {
        name: "DAMAGE MODIFIERS",
        type: entryTypes.CATEGORY,
        description:
            "A set of special values that affect the final PHYSICAL DAMAGE and PIERCING DAMAGE dealt by an action or effect. Includes DAMAGE REDUCTION, DAMAGE BONUS, WEAKNESS AND FRAGILITY.",
    },

    [entryTypes.ACTION]: {
        name: "ACTION",
        type: entryTypes.CATEGORY,
        description:
            "Abilities a player may choose to use during the PLAN subphase of their TURN. Can be subdivided into OFFENSIVE ACTIONS, DEFENSIVE ACTIONS, TRANSFORMATIVE ACTIONS, ACTS OF BENEDICTION and ACTS OF MALEDICTION. Most actions automatically advance the turn phase to COMMIT. A player's base actions include: ATTACK, GUARD, HEAL, SPECIAL ATTACK, SACRIFICE, ARRAY, DEPLOY, ATTUNE, REFRACT, CHART, SHADOW PACT and AEGIS.",
    },
};

export const SELENIAN_DESCRIPTIONS = {
    [actionKeys.REFRACT]: {
        name: "REFRACT",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters SELENIAN.",
    },

    [effectKeys.SELENIAN]: {
        name: "SELENIAN",
        type: entryTypes.STATE,
        description:
            "Enables ELEMENTAL CRYSTALS, MIRRORED MOON and MOON PHASE. Replaces REFRACT with MIRROR. Upon exiting this state, takes LUNIC DAMAGE equal to MOONLIGHT on self, then loses all MOONLIGHT, LUNACY and MOONLIT TEARS, also sets MIRRORED MOON to HIDDEN, ELEMENTAL CRYSTALS to DULLED and disables them.",
    },

    [actionKeys.MIRROR]: {
        name: "MIRROR",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Gains 3 MOONLIGHT.",
    },

    [effectKeys.MOONLIGHT]: {
        name: "MOONLIGHT",
        type: entryTypes.SPECIAL_ATTRIBUTES,
        description: "Used by some actions and effects.",
    },

    [effectKeys.MIRRORED_MOON]: {
        name: "MIRRORED MOON",
        type: entryTypes.MECHANIC,
        description:
            "Has five states: HIDDEN, WAXING, BLOODSTAINED, WANING and CORONAL. Starts at HIDDEN.",
    },

    [moonKeys.HIDDEN]: {
        name: "HIDDEN",
        type: entryTypes.MECHANIC,
        description: "At MOON PHASE, gains 3 MOONLIGHT.",
    },

    [moonKeys.WAXING]: {
        name: "WAXING",
        type: entryTypes.MECHANIC,
        description: "When using an OFFENSIVE ACTION, becomes BLOODSTAINED.",
    },

    [moonKeys.WANING]: {
        name: "WANING",
        type: entryTypes.MECHANIC,
        description: "When using a DEFENSIVE ACTION, becomes CORONAL.",
    },

    [moonKeys.BLOODSTAINED]: {
        name: "BLOODSTAINED",
        type: entryTypes.MECHANIC,
        description: "At MOON PHASE, gains 1 MOONLIGHT.",
    },

    [moonKeys.CORONAL]: {
        name: "CORONAL",
        type: entryTypes.MECHANIC,
        description: "At MOON PHASE, gains 1 MOONLIGHT.",
    },

    [effectKeys.MOON_PHASE]: {
        name: "MOON PHASE",
        type: entryTypes.BATTLE_PHASE,
        description:
            "Happens at ROUND END. If MIRRORED MOON is HIDDEN, WANING or CORONAL, sets it to WAXING. If MIRRORED MOON is WAXING or BLOODSTAINED, sets it to WANING.",
    },

    [effectKeys.ELEMENTAL_CRYSTALS]: {
        name: "ELEMENTAL CRYSTALS",
        type: entryTypes.MECHANIC,
        description:
            "Has three main crystals: FROST, NATURE and SCORCH. A player may click on the crystals during the PLAN subphase of their turn to activate a crystal. When no crystals are active, the current element is set to DULLED. When a single crystal is active, the current element is set to that crystal's element, that is: FROST, NATURE or SCORCH. When two crystals are active, sets the current element to one of the combination elements, which includes: ASH, the combination of NATURE and SCORCH, WITHER, the combination of FROST and NATURE, and OCEAN, the combination of FROST and SCORCH. When selecting all crystals, sets the current element to ALBEDO.",
    },

    [elementalKeys.DULLED]: {
        name: "DULLED",
        type: entryTypes.MECHANIC,
        description: "No effect.",
    },

    [elementalKeys.FROST]: {
        name: "FROST",
        type: entryTypes.MECHANIC,
        description:
            "While active, raises DEF by MOONLIGHT on self. Replaces AEGIS with LUNAR SHROUD.",
    },

    [actionKeys.LUNAR_SHROUD]: {
        name: "LUNAR SHROUD",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Gains REFRACTED DIVINITY equal to the user's DEF, then enters PRISMATIC state.",
    },

    [effectKeys.PRISMATIC]: {
        name: "PRISMATIC",
        type: entryTypes.STATE,
        description: "Nullifies all DEF EFFECTIVENESS.",
    },

    [effectKeys.REFRACTED_DIVINITY]: {
        name: "REFRACTED DIVINITY",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes this resource to decrease the damage taken, then gains MOONDUST equal to the amount lost this way. At turn start, loses all remaining REFRACTED DIVINITY, then raises LUNACY by 1% for every REFRACTED DIVINITY lost this way.",
    },

    [effectKeys.MOONDUST]: {
        name: "MOONDUST",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using LUNAR STRIKE, consumes MOONDUST to increase the damage dealt.",
    },

    [effectKeys.LUNACY]: {
        name: "LUNACY",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Raises DAMAGE BONUS and FRAGILITY equal to the percentage. At turn start, if at 100% LUNACY, sets ELEMENTAL CRYSTALS to SHATTERED.",
    },

    [elementalKeys.NATURE]: {
        name: "NATURE",
        type: entryTypes.MECHANIC,
        description:
            "While active, raises MAX HEALTH by MOONLIGHT on self. Additionally, replaces GUARD with LUNAR GROWTH. When entering NATURE, consumes SILVER BLOOD to replenish missing HEALTH. When exiting NATURE, converts all excess HEALTH into SILVER BLOOD.",
    },

    [effectKeys.SILVER_BLOOD]: {
        name: "SILVER BLOOD",
        type: entryTypes.OVERFLOWN_RESOURCE,
        description:
            "When taking any damage, loses SILVER BLOOD first before HEALTH. Before checking for an entity's death, consumes SILVER BLOOD on them to replenish missing HEALTH.",
    },

    [actionKeys.LUNAR_GROWTH]: {
        name: "LUNAR GROWTH",
        type: entryTypes.DEFENSIVE_ACTION,
        description: "Enters MOON DEW state.",
    },

    [effectKeys.MOON_DEW]: {
        name: "MOON DEW",
        type: entryTypes.STATE,
        description:
            "Raises DAMAGE REDUCTION by 50%. At turn start, restores RESOURCES equal to MOONLIGHT on self, then removes this effect.",
    },

    [elementalKeys.SCORCH]: {
        name: "SCORCH",
        type: entryTypes.MECHANIC,
        description:
            "While active, raises STR by MOONLIGHT on self. Additionally, replaces SPECIAL ATTACK with LUNAR STRIKE.",
    },

    [actionKeys.LUNAR_STRIKE]: {
        name: "LUNAR STRIKE",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Deals PIERCING DAMAGE equal to half the user's STR, rounded down.",
    },

    [elementalKeys.OCEAN]: {
        name: "OCEAN",
        type: entryTypes.MECHANIC,
        description:
            "Combination of FROST and SCORCH. While active, when restoring HEALTH above the limit, restores SILVER BLOOD instead. Replaces HEAL with LUNAR TIDE.",
    },

    [actionKeys.LUNAR_TIDE]: {
        name: "LUNAR TIDE",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Consumes RESOURCES equal to twice the MOONLIGHT on self, then restores RESOURCES equal to the amount consumed.",
    },

    [elementalKeys.WITHER]: {
        name: "WITHER",
        type: entryTypes.MECHANIC,
        description:
            "Combination of FROST and NATURE. While active, when losing HEALTH or SILVER BLOOD, raises LUNACY by 2% for every 1 HEALTH or SILVER BLOOD lost. Additionally, when taking any damage, raises MOONLIT TEARS rank by 1. Replaces SACRIFICE with LUNAR SHED.",
    },

    [effectKeys.MOONLIT_TEARS]: {
        name: "MOONLIT TEARS",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "At MOON PHASE, lowers MOONLIT TEARS rank by 1 and gains 1 MOONLIGHT.",
    },

    [actionKeys.LUNAR_SHED]: {
        name: "LUNAR SHED",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Takes TRUE DAMAGE and gains MYCELIUM equal to MOONLIGHT on self.",
    },

    [effectKeys.MYCELIUM]: {
        name: "MYCELIUM",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes MYCELIUM to reduce the damage taken. At MOON PHASE, restores RESOURCES equal to MYCELIUM on self. Then, loses all MYCELIUM.",
    },

    [elementalKeys.ASH]: {
        name: "ASH",
        type: entryTypes.MECHANIC,
        description:
            "Combination of NATURE and SCORCH. While active, when using an OFFENSIVE ACTION, consumes LIMITED RESOURCES equal to half the sum of all LIMITED RESOURCES on self, rounded down. Then, gains FUNERARY URN equal to the amount consumed. Replaces ATTACK with LUNAR SMITE.",
    },

    [effectKeys.FUNERARY_URN]: {
        name: "FUNERARY URN",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes FUNERARY URN to reduce the damage taken.",
    },

    [actionKeys.LUNAR_SMITE]: {
        name: "LUNAR SMITE",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Deals PIERCING DAMAGE equal to the user's MOONLIGHT. Increases the damage dealt by 5% for every 1 missing LIMITED RESOURCES on self.",
    },

    [elementalKeys.ALBEDO]: {
        name: "ALBEDO",
        type: entryTypes.MECHANIC,
        description:
            "Combination of NATURE, FROST and SCORCH. While active, on MOON PHASE, gains 1 MOONLIGHT. Replaces MIRROR with SHATTER.",
    },

    [actionKeys.SHATTER]: {
        name: "SHATTER",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Sets ELEMENTAL CRYSTALS to SHATTERED.",
    },

    [elementalKeys.SHATTERED]: {
        name: "SHATTERED",
        type: entryTypes.MECHANIC,
        description:
            "Cannot change elements. At turn start, takes LUNIC DAMAGE equal to MOONLIGHT on self. Enables the effects of FROST, NATURE, SCORCH, OCEAN, WITHER, ASH and ALBEDO. Replaces MIRROR with CHALK instead of SHATTER.",
    },

    [actionKeys.CHALK]: {
        name: "CHALK",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Deals LUNIC DAMAGE equal to MOONLIGHT on self. Increases damage dealt by 1 for every 10% LUNACY on self.",
    },
};

export const SONORITY_DESCRIPTIONS = {
    [actionKeys.ATTUNE]: {
        name: "ATTUNE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters RESONANT state.",
    },

    [actionKeys.DA_CAPO]: {
        name: "DA CAPO",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Resets your current condition to how it was at beginning of battle.",
    },

    [actionKeys.SOUND_OF_SILENCE]: {
        name: "THE SOUND OF SILENCE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Inverts current SONORITY. Gain 1 HARMONY for every 10% shift on SONORITY.",
    },

    [actionKeys.BABEL]: {
        name: "BABEL",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Inverts current SONORITY. Inflicts 1 DISSONANCE on the opponent for every 10% shift on SONORITY.",
    },

    [effectKeys.RESONANT]: {
        name: "RESONANT",
        type: entryTypes.STATE,
        description:
            "Enables SONORITY. When SONORITY is 0, replaces ATTUNE with DA CAPO. When SONORITY is lower than 0, replaces ATTUNE with THE SOUND OF SILENCE. When SONORITY is higher than 0, replaces ATTUNE with BABEL.",
    },

    [effectKeys.SONORITY]: {
        name: "SONORITY",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Ranges from -100% to +100%. When using a DEFENSIVE ACTION, raises SONORITY by 10%. When using an OFFENSIVE ACTION, lowers SONORITY by 10%. Raises WEAKNESS and DAMAGE REDUCTION equal to SONORITY below 0. Raises DAMAGE BONUS and FRAGILITY equal to SONORITY above 0.",
    },

    [effectKeys.HARMONY]: {
        name: "HARMONY",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes HARMONY to reduce the damage taken. At turn start, lose all HARMONY and restores RESOURCES equal to the amount lost.",
    },

    [effectKeys.DISSONANCE]: {
        name: "DISSONANCE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn end, lose all DISSONANCE and take TRUE DAMAGE equal to the amount lost.",
    },
};

export const DESCRIPTIONS = {
    ...ACTION_DESCRIPTIONS,
    ...DAMAGE_TYPE_DESCRIPTIONS,
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
    ...SELENIAN_DESCRIPTIONS,
    ...SONORITY_DESCRIPTIONS,
};
