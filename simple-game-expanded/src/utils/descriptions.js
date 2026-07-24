import {
    actionKeys,
    dmgTypes,
    effectKeys,
    elementalKeys,
    entryTypes,
    moonKeys,
    roundPhases,
    runeKeys,
} from "./enums";

export const HUMAN_DESCRIPTIONS = {
    [effectKeys.ROUND]: {
        name: "ROUND",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A full game cycle. A basic ROUND consists of: ROUND START, PLAYER ONE TURN, PLAYER TWO TURN and ROUND END, but can be extended via additional phases. A complete game round may consist of: ROUND START, PLAYER ONE TURN, PLAYER ONE STARFALL, RUNIC PULSE, PLAYER TWO TURN, PLAYER TWO STARFALL, RUNIC PULSE, MOON PHASE and ROUND END, disregarding MANA SIPHON, which can be triggered at any given time between ROUND START and ROUND END.",
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

    [effectKeys.PLAN]: {
        name: "PLAN",
        type: entryTypes.BATTLE_PHASE,
        description: "A TURN subphase where an ACTION can be used.",
    },

    [effectKeys.COMMIT]: {
        name: "COMMIT",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where the 'Turn End' effects are applied.",
    },

    [effectKeys.HEALTH]: {
        name: "HEALTH",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped at MAX HEALTH. Cannot restore HEALTH above the limit. When HEALTH reaches 0, loses the battle.",
    },

    [effectKeys.MAX_HEALTH]: {
        name: "MAX HEALTH",
        type: entryTypes.MECHANIC,
        description:
            "Starts at 20. Limits how much HEALTH you can hold. If MAX HEALTH is 0 or lower, loses the battle.",
    },

    [effectKeys.MANA]: {
        name: "MANA",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped at MAX MANA. When restoring MANA above the limit, gains MANA OVERFLOW instead.",
    },

    [effectKeys.MAX_MANA]: {
        name: "MAX MANA",
        type: entryTypes.MECHANIC,
        description: "Starts at 10. Limits how much MANA you can hold.",
    },

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

    [effectKeys.DEF_EFFECTIVENESS]: {
        name: "DEF EFFECTIVENESS",
        type: entryTypes.MECHANIC,
        description:
            "Used to calculate EFFECTIVE DEFENSE. Defines how much PHYSICAL DAMAGE a point of DEF can block.",
    },

    [effectKeys.DAMAGE_REDUCTION]: {
        name: "DAMAGE REDUCTION",
        type: entryTypes.DAMAGE_MODIFIERS,
        description:
            "Decreases PHYSICAL DAMAGE and PIERCING DAMAGE taken by the percentage.",
    },

    [effectKeys.RESOURCES]: {
        name: "RESOURCES",
        type: entryTypes.MECHANIC,
        description:
            "Can be subdivided into MITIGATION RESOURCES, FREE RESOURCES, OVERFLOWN RESOURCES, LIMITED RESOURCES, RANKED RESOURCES and FIXED RESOURCES. When consuming RESOURCES, consumes only MITIGATION RESOURCES, FREE RESOURCES and LIMITED RESOURCES in this order. When restoring RESOURCES, follows the order in reverse. OVERFLOWN RESOURCES may be consumed or restored alongside LIMITED RESOURCES according to special rules.",
    },

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
            "A subset of RESOURCES that have no upper cap. Includes SHADOWFLAME, UNRELENTING SHADOWS, CINDERS, DISSONANCE, PRECOGNITION, BLOOD SACRIFICE, STARDUST, MOONDUST and RADIANCE. When FREE RESOURCES are consumed, they're consumed in this order. When they're restored, they're restored in reverse order.",
    },

    [entryTypes.LIMITED_RESOURCE]: {
        name: "LIMITED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that has upper cap. Includes MANA and HEALTH. When LIMITED RESOURCES are consumed, they're consumed in this order. When they're restored, they're restored in reverse order. When consuming LIMITED RESOURCES, consumes their corresponding OVERFLOWN RESOURCES first. Cannot restore LIMITED RESOURCES when their max limit is 0, instead, continues to the next RESOURCE on the list. When restoring a LIMITED RESOURCE above the limit, if they have an overflow rule, follows that rule; otherwise continues to the next RESOURCE on the list.",
    },

    [entryTypes.FIXED_RESOURCE]: {
        name: "FIXED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are percentage-based and have strict limits. Includes OVERHEAT, DYNAMO, DIVINE SPARK, SONORITY, BAD OMEN, RECOLLECTION, NEBULA, STARBLIGHT, GRAVITATION, STARFLARE and LUNACY.",
    },

    [entryTypes.MITIGATION_RESOURCE]: {
        name: "MITIGATION RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that mitigate PHYSICAL DAMAGE and PIERCING DAMAGE taken. Includes STARLIT HEAVENS, FIRMAMENT, DOME, HALO, REFRACTED DIVINITY, CONJECTURE, FUNERARY URN, LINGERING EMBER, MYCELIUM and HARMONY. When consuming this type of resource, consumes them in this order.",
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

    [effectKeys.EFFECTIVE_DEF]: {
        name: "EFFECTIVE DEFENSE",
        type: entryTypes.MECHANIC,
        description: "Decreases PHYSICAL DAMAGE taken.",
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

    [entryTypes.ACTION]: {
        name: "ACTION",
        type: entryTypes.CATEGORY,
        description:
            "Abilities a player may choose to use during the PLAN subphase of their TURN. Can be subdivided into OFFENSIVE ACTIONS, DEFENSIVE ACTIONS and TRANSFORMATIVE ACTIONS. Most actions automatically advance the turn phase to COMMIT. A player's base actions include: ATTACK, GUARD, HEAL, SPECIAL ATTACK, SACRIFICE, CARVE, DEPLOY, ATTUNE, REFRACT, CHART, SHADOW PACT and AEGIS.",
    },

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
            "A type of ACTION. Includes CARVE, CURSE, DEPLOY, ATTUNE, DA CAPO, SOUND OF SILENCE, BABEL, SHADOW PACT, BLACK MAYHEM, SHADOW MANTLE, RITUAL OF ASH, DARK PROMISE, CHART, REFRACT, MIRROR and SHATTER.",
    },

    [entryTypes.RANKED_RESOURCE]: {
        name: "RANKED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are rank-based. Includes MANA BLEED, PAST MEMORIES, CONSTELLATION, AZURE CONSTELLATION, CRIMSON CONSTELLATION and MOONLIT TEARS.",
    },

    [entryTypes.OVERFLOWN_RESOURCE]: {
        name: "OVERFLOWN RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that can be gained when restoring LIMITED RESOURCES above their cap. Includes SILVER BLOOD and MANA OVERFLOW. When consuming LIMITED RESOURCES, consumes the corresponding OVERFLOWN RESOURCES first.",
    },

    [entryTypes.DAMAGE_MODIFIERS]: {
        name: "DAMAGE MODIFIERS",
        type: entryTypes.CATEGORY,
        description:
            "A set of special values that affect the final PHYSICAL DAMAGE and PIERCING DAMAGE dealt by an action or effect. Includes DAMAGE REDUCTION, DAMAGE BONUS, WEAKNESS AND FRAGILITY.",
    },

    [entryTypes.MECHANIC]: {
        name: "MECHANIC",
        type: entryTypes.CATEGORY,
        description: "A core gameplay system.",
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

    [entryTypes.CATEGORY]: {
        name: "CATEGORY",
        type: entryTypes.CATEGORY,
        description: "A classification grouping for game mechanics.",
    },
};

export const MUNDANE_DESCRIPTIONS = {
    [actionKeys.ATTACK]: {
        name: "ATTACK",
        type: entryTypes.OFFENSIVE_ACTION,
        description: "Deals PHYSICAL DAMAGE equal to the user's STR.",
    },

    [actionKeys.GUARD]: {
        name: "GUARD",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Restores 30% of MAX MANA and enters GUARDING state until next turn start. Cannot gain MANA OVERFLOW this way.",
    },

    [effectKeys.GUARDING_STATE]: {
        name: "GUARDING",
        type: entryTypes.STATE,
        description:
            "Raises DEF EFFECTIVENESS and DAMAGE REDUCTION by 50%. Cleared at turn start.",
    },

    [actionKeys.HEAL]: {
        name: "HEAL",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Consumes MANA to replenish missing HEALTH. Cleanses POISON and gains DISTILLED TOXIN equal to the amount cleansed.",
    },
};

export const WARLOCK_DESCRIPTIONS = {
    [actionKeys.SPECIAL_ATTACK]: {
        name: "SPECIAL ATTACK",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Deals PIERCING DAMAGE equal to the user's STR. If MANA IMBALANCE is positive, restores MANA to the target and increases the damage dealt by its value. If MANA IMBALANCE is negative, restores MANA on self and decreases the damage dealt by its value. Then, consumes MANA equal to 60% of MAX MANA. Cannot be used at less than 60% MAX MANA.",
    },

    [effectKeys.MANA_IMBALANCE]: {
        name: "MANA IMBALANCE",
        type: entryTypes.MECHANIC,
        description:
            "The difference between the user's and target's current MANA.",
    },

    [effectKeys.MANA_OVERFLOW]: {
        name: "MANA OVERFLOW",
        type: entryTypes.OVERFLOWN_RESOURCE,
        description:
            "Used before MANA by abilities that consume MANA. At turn end, loses all MANA OVERFLOW on self and takes TRUE DAMAGE equal to the amount lost.",
    },
};

export const BLOODKNIGHT_DESCRIPTIONS = {
    [actionKeys.SACRIFICE]: {
        name: "SACRIFICE",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Halves current HEALTH. Gains BLOOD SACRIFICE and increases MAX MANA equal to the HEALTH lost this way, raises MANA BLEED rank equal to half the HEALTH lost this way. Enters SACRIFICIAL state until next turn start.",
    },

    [effectKeys.SACRIFICIAL_STATE]: {
        name: "SACRIFICIAL",
        type: entryTypes.STATE,
        description: "Raises DAMAGE REDUCTION by 50%. Cleared at turn start.",
    },

    [effectKeys.BLOOD_SACRIFICE]: {
        name: "BLOOD SACRIFICE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "Increases PHYSICAL DAMAGE dealt equal to BLOOD SACRIFICE on self.",
    },

    [effectKeys.MANA_BLEED]: {
        name: "MANA BLEED",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "At turn start, loses MANA equal to MANA BLEED current level and restores an equal amount of HEALTH.",
    },
};

export const PALADIN_DESCRIPTIONS = {
    [actionKeys.AEGIS]: {
        name: "AEGIS",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Gains HALO equal to twice the user's DEF. Enters RADIANT state until next turn start. Cannot be used at 0 or less DEF.",
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
            "When using ATTACK, consumes all RADIANCE on self to increase the damage dealt. At turn end, lose all RADIANCE and take TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.DIVINE_SPARK]: {
        name: "DIVINE SPARK",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises STR by every 5% DIVINE SPARK on self.",
    },
};

export const CYBORG_DESCRIPTIONS = {
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
            "Cannot use DEPLOY, LASER or MELTDOWN. At turn start, lowers OVERHEAT by 50% and raises DYNAMO equal to the amount lowered. Additionally, if at 0% OVERHEAT, exits VENTING state and enters WEAPONS DEPLOYED.",
    },

    [effectKeys.OVERHEAT]: {
        name: "OVERHEAT",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Enabled when in DEPLOYMENT, WEAPONS DEPLOYED, THERMAL OVERLOAD or VENTING states. Can go over 100%. When using DEFENSIVE ACTIONS, lowers OVERHEAT by 30% and raises DYNAMO by the amount lowered this way.",
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
};

export const MAESTRO_DESCRIPTIONS = {
    [actionKeys.ATTUNE]: {
        name: "ATTUNE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters RESONANT state.",
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

    [effectKeys.HARMONY]: {
        name: "HARMONY",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes HARMONY to reduce the damage taken. At turn start, lose all HARMONY and restores RESOURCES equal to the amount lost.",
    },

    [actionKeys.BABEL]: {
        name: "BABEL",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Inverts current SONORITY. Inflicts 1 DISSONANCE on the opponent for every 10% shift on SONORITY.",
    },

    [effectKeys.DISSONANCE]: {
        name: "DISSONANCE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn end, lose all DISSONANCE and take TRUE DAMAGE equal to the amount lost.",
    },
};

export const AUGUR_DESCRIPTIONS = {
    [actionKeys.CARVE]: {
        name: "CARVE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters VISIONARY state.",
    },

    [actionKeys.CURSE]: {
        name: "CURSE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Detonates all RUNES, starting from the newest. Takes 5 TRUE DAMAGE when detonating an empty socket. This action does not end your turn. Cannot be used when RUNIC ARRAY is empty.",
    },

    [effectKeys.VISIONARY]: {
        name: "VISIONARY",
        type: entryTypes.STATE,
        description:
            "Enables RUNIC ARRAY. When using GUARD, HEAL or SPECIAL ATTACK, adds RUNE OF URD, RUNE OF VERDANDI or RUNE OF SKULD to the RUNIC ARRAY, respectively. When exiting this state, detonates all RUNES.",
    },

    [effectKeys.RUNIC_ARRAY]: {
        name: "RUNIC ARRAY",
        type: entryTypes.MECHANIC,
        description:
            "Can hold up to 3 RUNES. When acquiring more than 3 RUNES, detonate the oldest one to make space.",
    },

    [entryTypes.RUNES]: {
        name: "RUNES",
        type: entryTypes.CATEGORY,
        description:
            "Includes RUNE OF URD, RUNE OF VERDANDI and RUNE OF SKULD.",
    },

    [runeKeys.URD]: {
        name: "RUNE OF URD",
        type: entryTypes.RUNES,
        description:
            "Gained from GUARD. Upon acquisition: Raises RECOLLECTION by 3% for every point of the user's DEF. While on RUNIC ARRAY: Raises the user's STR by 3. Upon detonation: Restores HEALTH equal to 30% MAX HEALTH.",
    },

    [runeKeys.VERDANDI]: {
        name: "RUNE OF VERDANDI",
        type: entryTypes.RUNES,
        description:
            "Gained from HEAL. Upon acquisition: Gains CONJECTURE equal to the user's STR. While on RUNIC ARRAY: Lowers the user's STR by 3. Upon detonation: Raises the opponent's BAD OMEN by 30%.",
    },

    [runeKeys.SKULD]: {
        name: "RUNE OF SKULD",
        type: entryTypes.RUNES,
        description:
            "Gained from SPECIAL ATTACK. Upon acquisition: Restores 30% MAX MANA. While on RUNIC ARRAY: Raises WEAKNESS by 30%. Upon detonation: Gains PRECOGNITION equal to 30% MAX MANA.",
    },

    [effectKeys.PRECOGNITION]: {
        name: "PRECOGNITION",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When MANA falls below MAX MANA, consumes PRECOGNITION to replenish missing MANA.",
    },

    [effectKeys.CONJECTURE]: {
        name: "CONJECTURE",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes CONJECTURE to reduce the damage taken. Then, restores MANA equal to the CONJECTURE consumed this way.",
    },

    [effectKeys.BAD_OMEN]: {
        name: "BAD OMEN",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises WEAKNESS and FRAGILITY equal to BAD OMEN on self. At turn end, lowers BAD OMEN by 30%.",
    },

    [effectKeys.RECOLLECTION]: {
        name: "RECOLLECTION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises DAMAGE BONUS equal to RECOLLECTION on self. When RUNES detonate, lose 30% RECOLLECTION and raises PAST MEMORIES rank by 1 for every 6% RECOLLECTION lost.",
    },

    [effectKeys.PAST_MEMORIES]: {
        name: "PAST MEMORIES",
        type: entryTypes.RANKED_RESOURCE,
        description: "Raises STR by its rank.",
    },
};

export const SHADOW_SORCERER_DESCRIPTIONS = {
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

    [effectKeys.BLEAK_DECEPTION]: {
        name: "BLEAK DECEPTION",
        type: entryTypes.STATE,
        description: "Cannot use SHADOW PACT.",
    },

    [effectKeys.SHADOWFLAME]: {
        name: "SHADOWFLAME",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, burns RESOURCES equal to current SHADOWFLAME, then gains SHADOWFLAME equal to the amount burned. Cannot burn SHADOWFLAME, LINGERING EMBER and UNRELENTING SHADOWS.",
    },

    [effectKeys.UNRELENTING_SHADOWS]: {
        name: "UNRELENTING SHADOWS",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, loses all UNRELENTING SHADOWS. Then, restores RESOURCES based on the UNRELENTING SHADOWS lost this way.",
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
};

export const STARFARER_DESCRIPTIONS = {
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
            "While active, enables STARFALL after turn end. During the action phase, enables a side-menu for star assignment. When exiting this state, loses all STARS and sets CONSTELLATION, AZURE CONSTELLATION and CRIMSON CONSTELLATION to zero.",
    },

    [entryTypes.STAR]: {
        name: "STARS",
        type: entryTypes.CATEGORY,
        description:
            "Includes WHITE STAR, GRAY STAR, RED STAR, ORANGE STAR, YELLOW STAR, GREEN STAR, BLUE STAR, INDIGO STAR, and VIOLET STAR. The latter seven are labeled colored STARS and have three levels: normal, augmented and nova.",
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
            "At RED STARFALL, converts all RED STAR into WHITE STAR. All entities take PHYSICAL DAMAGE equal to normal RED STAR converted. All entities take PIERCING DAMAGE equal to augmented RED STAR converted. All entities take TRUE DAMAGE equal to nova RED STAR converted. These are considered three separate instances of damage.",
    },

    [effectKeys.ORANGE_STAR]: {
        name: "ORANGE STAR",
        type: entryTypes.STAR,
        description:
            "At ORANGE STARFALL, converts all ORANGE STAR into WHITE STAR. Burns RESOURCES on self equal to normal ORANGE STAR converted. Burns RESOURCES on both opponent and self equal to augmented ORANGE STAR converted. Burns RESOURCES on the opponent only equal to nova ORANGE STAR converted. Gains GRAY STAR equal to the total amount of RESOURCES burned.",
    },

    [effectKeys.YELLOW_STAR]: {
        name: "YELLOW STAR",
        type: entryTypes.STAR,
        description:
            "At YELLOW STARFALL, converts all YELLOW STAR into WHITE STAR. Raises NEBULA by 5% for every normal YELLOW STAR converted. Raises CONSTELLATION rank by the amount of augmented YELLOW STAR converted. Raises GRAVITATION by 10% for every nova YELLOW STAR converted.",
    },

    [effectKeys.GREEN_STAR]: {
        name: "GREEN STAR",
        type: entryTypes.STAR,
        description:
            "At GREEN STARFALL, converts all GREEN STAR into WHITE STAR. Loses WHITE STAR and restores RESOURCES equal to normal GREEN STAR converted. Restores RESOURCES on self equal to augmented GREEN STAR converted. Restores RESOURCES on all entities equal to nova GREEN STAR converted.",
    },

    [effectKeys.BLUE_STAR]: {
        name: "BLUE STAR",
        type: entryTypes.STAR,
        description:
            "At BLUE STARFALL, converts all BLUE STAR into WHITE STAR. Gains DOME equal to normal BLUE STAR converted. Gains FIRMAMENT equal to augmented BLUE STAR converted. Gains STARLIT HEAVENS equal to nova BLUE STAR converted.",
    },

    [effectKeys.INDIGO_STAR]: {
        name: "INDIGO STAR",
        type: entryTypes.STAR,
        description:
            "At INDIGO STARFALL, converts all INDIGO STAR into WHITE STAR. Gains STARDUST equal to normal INDIGO STAR converted. Gains GRAY STAR equal to augmented INDIGO STAR converted. Gains WHITE STAR equal to nova INDIGO STAR converted.",
    },

    [effectKeys.VIOLET_STAR]: {
        name: "VIOLET STAR",
        type: entryTypes.STAR,
        description:
            "When other colored STARS are converted, raises their level by 1 and converts equivalent VIOLET STAR into WHITE STAR. Cannot raise VIOLET STAR levels this way. Cannot raise the same STARS level more than once. At VIOLET STARFALL, converts all VIOLET STAR into WHITE STAR. Raises STARFLARE by 5% for every VIOLET STAR converted at VIOLET STARFALL.",
    },

    [effectKeys.GRAY_STAR]: {
        name: "GRAY STAR",
        type: entryTypes.STAR,
        description: "Cannot be assigned a color.",
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
            "Lowers MAX HEALTH equal to STARBLIGHT on self. Raises DAMAGE BONUS equal to STARBLIGHT on self. At turn end, lose all STARBLIGHT.",
    },

    [effectKeys.GRAVITATION]: {
        name: "GRAVITATION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. At 100%, enables SINGULARITY. At SINGULARITY end, lose all GRAVITATION.",
    },

    [effectKeys.SINGULARITY]: {
        name: "SINGULARITY",
        type: entryTypes.BATTLE_PHASE,
        description:
            "Special phase equivalent to a player's PLAN subphase. Added to the round queue after STARFALL. Does not trigger UPKEEP or COMMIT subphases.",
    },

    [effectKeys.CONSTELLATION]: {
        name: "CONSTELLATION",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Raises ATTRIBUTES equal to CONSTELLATION rank. During the PLAN subphase of a player's TURN, can be interacted with to become AZURE CONSTELLATION or CRIMSON CONSTELLATION.",
    },

    [effectKeys.AZURE_CONSTELLATION]: {
        name: "AZURE CONSTELLATION",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Raises DEF equal to AZURE CONSTELLATION rank. When raising CONSTELLATION rank, raises AZURE CONSTELLATION rank instead. During the PLAN subphase of a player's TURN, can be interacted with to become CONSTELLATION or CRIMSON CONSTELLATION.",
    },

    [effectKeys.CRIMSON_CONSTELLATION]: {
        name: "CRIMSON CONSTELLATION",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Raises STR equal to CRIMSON CONSTELLATION rank. When raising CONSTELLATION rank, raises CRIMSON CONSTELLATION rank instead. During the PLAN subphase of a player's TURN, can be interacted with to become AZURE CONSTELLATION or CONSTELLATION.",
    },

    [effectKeys.STARDUST]: {
        name: "STARDUST",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, for every 3 STARDUST on self, loses 3 STARDUST and gains 1 WHITE STAR.",
    },

    [effectKeys.DOME]: {
        name: "DOME",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes DOME to reduce the damage taken. At turn start, converts all DOME into STARDUST.",
    },

    [effectKeys.FIRMAMENT]: {
        name: "FIRMAMENT",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes FIRMAMENT to reduce the damage taken, then gains STARDUST equal to the amount lost this way. At turn start, converts all FIRMAMENT into DOME.",
    },

    [effectKeys.STARLIT_HEAVENS]: {
        name: "STARLIT HEAVENS",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes STARLIT HEAVENS to reduce the damage taken, then gains GRAY STAR equal to the amount lost this way. At turn start, converts all STARLIT HEAVENS into FIRMAMENT.",
    },

    [effectKeys.STARFLARE]: {
        name: "STARFLARE",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capper at 100%. At turn start, if at 100%, loses all STARFLARE and enters NOVA state.",
    },

    [effectKeys.NOVA]: {
        name: "NOVA",
        type: entryTypes.STATE,
        description:
            "Raises all STARS levels by 1. At STARFALL end, exit NOVA.",
    },
};

export const LUNATIC_DESCRIPTIONS = {
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

    [dmgTypes.LUNIC]: {
        name: "LUNIC DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's MAX HEALTH. Ignores EFFECTIVE DEFENSE, DAMAGE MODIFIERS and MITIGATION RESOURCES. When decreasing MAX HEALTH below 0, decreases MOONLIGHT instead.",
    },
};

export const DESCRIPTIONS = {
    ...HUMAN_DESCRIPTIONS,
    ...MUNDANE_DESCRIPTIONS,
    ...WARLOCK_DESCRIPTIONS,
    ...BLOODKNIGHT_DESCRIPTIONS,
    ...PALADIN_DESCRIPTIONS,
    ...CYBORG_DESCRIPTIONS,
    ...MAESTRO_DESCRIPTIONS,
    ...AUGUR_DESCRIPTIONS,
    ...SHADOW_SORCERER_DESCRIPTIONS,
    ...STARFARER_DESCRIPTIONS,
    ...LUNATIC_DESCRIPTIONS,
};
