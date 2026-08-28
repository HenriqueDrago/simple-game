import {
    actionKeys,
    aiKeys,
    dmgTypes,
    edictKeys,
    effectKeys,
    elementalKeys,
    entryTypes,
    eyeKeys,
    choirKeys,
    moonKeys,
    roundPhases,
    runeKeys,
    tarnishTypes,
    turnStatus,
    blasphemyKeys,
} from "./enums";

export const GENERAL_DESCRIPTIONS = {
    [effectKeys.SIMPLE_GAME]: {
        name: "SIMPLE GAME",
        type: entryTypes.MECHANIC,
        description:
            "A simple turn-based combat game. Every ROUND of a MATCH, both players are granted a TURN on which they may choose at least one of a series of ACTIONS to execute. A MATCH ends when either player's HEALTH or MAX HEALTH reaches 0, granting victory to the surviving player, or ending on a draw. During SETUP, players may select whose TURN comes first on every round, distribute BASE ATTRIBUTES points and select each player's CONTROLLER. Press START to end SETUP and begin a MATCH.",
    },

    [effectKeys.PROGRESSION_MODE]: {
        name: "PROGRESSION MODE",
        type: entryTypes.MECHANIC,
        description:
            "In this mode, faces a series of battles against SIMPLE GAME's autonomous AIs. While enabled, PLAYER ONE is forced into HUMAN (manual) control, while PLAYER TWO is blocked from utilizing a non-AI CONTROLLER. Furthermore, PLAYER TWO always starts and always has its ATTRIBUTES distribution mode set to CHALLENGE. Additionally, most base ACTIONS are blocked until defeating the corresponding enemy, save for ATTACK, GUARD, HEAL and SPECIAL ATTACK. Lastly, a new enemy AI, it's GLOSSARY entry and related tooltips can only be unlocked upon defeating the preceding enemy.",
    },

    [effectKeys.SHORTCUTS]: {
        name: "PROGRESSION MODE",
        type: entryTypes.MECHANIC,
        description:
            "SIMPLE GAME comes equipped with a few shortcuts for improved game experience. Press SPACE to Pause/Unpause a MATCH, which puts automatic phases on a hold. Click using MOUSE-WHEEL on nearly anything to spawn a TOOLTIP containing it's description. Hover over any ACTIONS to simulate its effects. Hold SHIFT to simulate COMMIT (turn end) and STARFALL effects, which can be combined with on hover simulations. Press F during a MATCH to cycle through the game speed settings, increasing the speed of animations and transitions. Press 1/2/3 to directly set the speed settings to 1x/2x/Inf. Press Z/X to undo/redo your previous action on the current turn.",
    },

    [turnStatus.SETUP]: {
        name: "SETUP",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A pre-battle phase where player's can distribute their ATTRIBUTES and set the game's configurations.",
    },

    [effectKeys.CONTROLLER]: {
        name: "CONTROLLER",
        type: entryTypes.MECHANIC,
        description:
            "Determines how each player's ACTIONS and other combat interactions are decided. Includes HUMAN, MUNDANE, WARLOCK, BLOODKNIGHT, PALADIN, CYBORG, MAESTRO, AUGUR, SHADOW SORCERER, VOYAGER, SELENIAN and SERAPH. Selecting HUMAN allows a player to be manually controlled. Selecting any other option leaves the control at the hands of an AI.",
    },

    [aiKeys.HUMAN]: {
        name: "HUMAN",
        type: entryTypes.CONTROLLER,
        description:
            "Allows a player to manually control their ACTIONS and other combat interactions.",
    },

    [effectKeys.MATCH]: {
        name: "MATCH",
        type: entryTypes.MECHANIC,
        description:
            "A complete SIMPLE GAME battle. A MATCH can end in VICTORY, DRAW or DEFEAT for any player.",
    },

    [effectKeys.ROUND]: {
        name: "ROUND",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A full MATCH cycle. A basic ROUND consists of: ROUND START, PLAYER ONE TURN, PLAYER TWO TURN and ROUND END, but can be extended via additional phases.",
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

    [effectKeys.PLAN]: {
        name: "PLAN",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where a player may use combat interactions. This subphase ends upon utilizing any of the available ACTIONS, unless explicitly stated.",
    },

    [effectKeys.COMMIT]: {
        name: "COMMIT",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where the 'Turn End' effects are applied.",
    },

    [entryTypes.ACTION]: {
        name: "ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "Abilities a player may choose to use during the PLAN subphase of their TURN. Can be subdivided into OFFENSIVE ACTIONS, DEFENSIVE ACTIONS and TRANSFORMATIVE ACTIONS. Most actions automatically advance the turn phase to COMMIT. A player's base actions include: ATTACK, GUARD, HEAL, SPECIAL ATTACK, SACRIFICE, AEGIS, SHADOW PACT, DEPLOY, ATTUNE, CARVE, CHART and REFRACT.",
    },

    [entryTypes.OFFENSIVE_ACTION]: {
        name: "OFFENSIVE ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ACTIONS. Includes ATTACK, SPECIAL ATTACK, SACRIFICE, LASER, MELTDOWN, LUNAR STRIKE, LUNAR SMITE, LUNAR SHED and CHALK.",
    },

    [entryTypes.DEFENSIVE_ACTION]: {
        name: "DEFENSIVE ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ACTIONS. Includes GUARD, HEAL, AEGIS, LUNAR GROWTH, LUNAR TIDE and LUNAR SHROUD.",
    },

    [entryTypes.TRANSFORMATIVE_ACTION]: {
        name: "TRANSFORMATIVE ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ACTIONS. Includes CARVE, CURSE, DEPLOY, ATTUNE, DA CAPO, THE SOUND OF SILENCE, BABEL, SHADOW PACT, BLACK MAYHEM, SHADOW MANTLE, RITUAL OF ASH, DARK PROMISE, CHART, REFRACT, MIRROR and SHATTER.",
    },

    [effectKeys.HEALTH]: {
        name: "HEALTH",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped at MAX HEALTH. Starts at max capacity. Cannot restore HEALTH above the limit. When HEALTH reaches 0, loses the battle.",
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
            "Capped at MAX MANA. Starts at max capacity. When replenishing MANA above the limit, gains MANA OVERFLOW instead.",
    },

    [effectKeys.MAX_MANA]: {
        name: "MAX MANA",
        type: entryTypes.MECHANIC,
        description: "Starts at 10. Limits how much MANA you can hold.",
    },

    [effectKeys.MANA_OVERFLOW]: {
        name: "MANA OVERFLOW",
        type: entryTypes.OVERFLOWN_RESOURCE,
        description:
            "Used before MANA by abilities that consume MANA. At turn end, loses all MANA OVERFLOW on self and takes TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.STR]: {
        name: "STR",
        type: entryTypes.BASE_ATTRIBUTES,
        description:
            "The main offensive BASE ATTRIBUTES. Increases the damage dealt by certain ACTIONS.",
    },

    [effectKeys.DEF]: {
        name: "DEF",
        type: entryTypes.BASE_ATTRIBUTES,
        description:
            "The main defensive BASE ATTRIBUTES. Decreases the PHYSICAL DAMAGE taken.",
    },

    [entryTypes.DAMAGE_TYPE]: {
        name: "DAMAGE TYPE",
        type: entryTypes.CATEGORY,
        description:
            "A property that defines how the resulting damage will be calculated and applied. Includes PHYSICAL DAMAGE, PIERCING DAMAGE, TRUE DAMAGE and LUNIC DAMAGE. All damage taken has a minimum of 1, regardless of DAMAGE TYPE, EFFECTIVE DEFENSE or DAMAGE MODIFIERS.",
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
        description:
            "Decreases PHYSICAL DAMAGE taken based on DEF and DEF EFFECTIVENESS.",
    },

    [effectKeys.DEF_EFFECTIVENESS]: {
        name: "DEF EFFECTIVENESS",
        type: entryTypes.MECHANIC,
        description:
            "Defaults to 100%. Used to calculate EFFECTIVE DEFENSE. Defines how much PHYSICAL DAMAGE a point of DEF can block.",
    },

    [entryTypes.DAMAGE_MODIFIERS]: {
        name: "DAMAGE MODIFIERS",
        type: entryTypes.CATEGORY,
        description:
            "A set of special values that affect the final PHYSICAL DAMAGE and PIERCING DAMAGE dealt by an action or effect. Includes DAMAGE REDUCTION, DAMAGE BONUS, WEAKNESS AND FRAGILITY.",
    },

    [effectKeys.WEAKNESS]: {
        name: "WEAKNESS",
        type: entryTypes.DAMAGE_MODIFIERS,
        description:
            "Defaults to 0%. Decreases PHYSICAL DAMAGE and PIERCING DAMAGE dealt by the percentage.",
    },

    [effectKeys.DAMAGE_REDUCTION]: {
        name: "DAMAGE REDUCTION",
        type: entryTypes.DAMAGE_MODIFIERS,
        description:
            "Defaults to 0%. Decreases PHYSICAL DAMAGE and PIERCING DAMAGE taken by the percentage.",
    },

    [effectKeys.FRAGILITY]: {
        name: "FRAGILITY",
        type: entryTypes.DAMAGE_MODIFIERS,
        description:
            "Defaults to 0%. Increases PHYSICAL DAMAGE and PIERCING DAMAGE taken by the percentage.",
    },

    [effectKeys.DAMAGE_BONUS]: {
        name: "DAMAGE BONUS",
        type: entryTypes.DAMAGE_MODIFIERS,
        description:
            "Defaults to 0%. Increases PHYSICAL DAMAGE and PIERCING DAMAGE dealt by the percentage.",
    },

    [entryTypes.STATE]: {
        name: "STATES",
        type: entryTypes.CATEGORY,
        description:
            "A persistent effect that applies only to a singular entity.",
    },

    [effectKeys.CONDITION]: {
        name: "CONDITION",
        type: entryTypes.MECHANIC,
        description:
            "A player's current status in a MATCH. Includes ATTRIBUTES, RESOURCES, STATES and other special mechanics. When a player's condition is deleted, it loses the MATCH.",
    },

    [entryTypes.BATTLE_PHASE]: {
        name: "BATTLE PHASE",
        type: entryTypes.CATEGORY,
        description: "A subsection of a battle.",
    },

    [effectKeys.RESOURCES]: {
        name: "RESOURCES",
        type: entryTypes.MECHANIC,
        description:
            "Can be subdivided into FREE RESOURCES, LIMITED RESOURCES, OVERFLOWN RESOURCES, MITIGATION RESOURCES, RANKED RESOURCES, FIXED RESOURCES and GLOBAL RESOURCES. Abilities that consume RESOURCES, consume MITIGATION RESOURCES, FREE RESOURCES and LIMITED RESOURCES in this order. Abilities that restore RESOURCES follow reverse order.",
    },

    [entryTypes.FREE_RESOURCE]: {
        name: "FREE RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that have no upper cap. Includes SHADOWFLAME, UNRELENTING SHADOWS, CINDERS, DISSONANCE, PRECOGNITION, PROPHECY OF DOOM, BLOOD SACRIFICE, STARDUST, MOONSHINE, RADIANCE, SAACRILEGE, MARTHYR, COVENANT and SACRED FLAMES. When FREE RESOURCES are consumed, they're consumed in this order. When they're restored, they're restored in reverse order.",
    },

    [entryTypes.LIMITED_RESOURCE]: {
        name: "LIMITED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that has a non-fixed upper cap. Includes ENLIGHTENMENT, MANA and HEALTH. When LIMITED RESOURCES are consumed, they're consumed in this order. When they're restored, they're restored in reverse order. When consuming LIMITED RESOURCES, consumes their corresponding OVERFLOWN RESOURCES first. Cannot restore LIMITED RESOURCES when their max limit is 0, instead, continue to the following RESOURCES on the list. When restoring LIMITED RESOURCES above the limit, if they have an overflow rule, follows that rule; otherwise continue to the following RESOURCES on the list.",
    },

    [entryTypes.OVERFLOWN_RESOURCE]: {
        name: "OVERFLOWN RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that can be gained when restoring LIMITED RESOURCES above their cap. Includes INSIGHT, SILVER BLOOD and MANA OVERFLOW. When consuming LIMITED RESOURCES, consumes the corresponding OVERFLOWN RESOURCES first.",
    },

    [entryTypes.FIXED_RESOURCE]: {
        name: "FIXED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are percentage-based and have strict limits. Includes OVERHEAT, DYNAMO, DIVINE SPARK, SONORITY, BAD OMEN, RECOLLECTION, GRAVITATION, ACCRETION, LUNACY and TARNISHED SIN.",
    },

    [entryTypes.MITIGATION_RESOURCE]: {
        name: "MITIGATION RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that mitigate PHYSICAL DAMAGE and PIERCING DAMAGE taken. Includes SANCTUARY, FAULTY FIRMAMENT, FRACTURED DOME, HALO, REFRACTED DIVINITY, CONJECTURE, FUNERARY URN, LINGERING EMBER, MYCELIUM and HARMONY. When consuming this type of resource, consumes them in this order.",
    },

    [entryTypes.RANKED_RESOURCE]: {
        name: "RANKED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are rank-based. Includes MANA BLEED, STARBLIGHT, CONSTELLATION, AZURE CONSTELLATION, CRIMSON CONSTELLATION, MOONLIT TEARS and BURDEN OF STIGMA.",
    },

    [entryTypes.GLOBAL_RESOURCE]: {
        name: "GLOBAL RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are shared between players. Includes PROVIDENCE and DEFILEMENT.",
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
            "A subset of ATTRIBUTES. Includes STR and DEF. During setup, players have 10 points to distribute freely between their BASE ATTRIBUTES. When raising or lowering BASE ATTRIBUTES via combat effects, alternates between each attribute, starting with STR.",
    },

    [entryTypes.SPECIAL_ATTRIBUTES]: {
        name: "SPECIAL ATTRIBUTES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ATTRIBUTES. Includes ENERGY LEVEL, MOONLIGHT, REVELATION and FORTITUDE.",
    },

    [entryTypes.MECHANIC]: {
        name: "MECHANIC",
        type: entryTypes.CATEGORY,
        description: "A core gameplay system.",
    },

    [entryTypes.CATEGORY]: {
        name: "CATEGORY",
        type: entryTypes.CATEGORY,
        description: "A classification grouping for game mechanics.",
    },

    [effectKeys.EXTRA_TURN]: {
        name: "EXTRA TURN",
        type: entryTypes.MECHANIC,
        description:
            "Allows the player to utilize ACTIONS and other combat interactions. Does not trigger turn start and turn end effects. Ends when using any ACTIONS that aren't a FREE ACTION.",
    },
};

export const BASIC_DESCRIPTIONS = {
    [aiKeys.SIMPLE]: {
        name: "MUNDANE",
        type: entryTypes.CONTROLLER,
        description:
            "A tutorial enemy. Repeatedly uses ATTACK, switching to GUARD or HEAL when in danger. In PROGRESSION MODE, defeat this enemy to unlock the WARLOCK enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.ATTACK]: {
        name: "ATTACK",
        type: entryTypes.OFFENSIVE_ACTION,
        description: "Deals PHYSICAL DAMAGE equal to the user's STR.",
    },

    [actionKeys.GUARD]: {
        name: "GUARD",
        type: entryTypes.DEFENSIVE_ACTION,
        description: "Replenishes 30% of MAX MANA and enters GUARDING state.",
    },

    [effectKeys.GUARDING_STATE]: {
        name: "GUARDING",
        type: entryTypes.STATE,
        description:
            "Raises DEF EFFECTIVENESS and DAMAGE REDUCTION by 50%. At turn start, exits this state.",
    },

    [actionKeys.HEAL]: {
        name: "HEAL",
        type: entryTypes.DEFENSIVE_ACTION,
        description: "Consumes MANA to replenish missing HEALTH.",
    },
};

export const WARLOCK_DESCRIPTIONS = {
    [aiKeys.WARLOCK]: {
        name: "WARLOCK",
        type: entryTypes.CONTROLLER,
        description:
            "The first challenge. Focuses on the use of SPECIAL ATTACK and on replenishing MANA for maximizing it's damage. In PROGRESSION MODE, defeat this enemy to unlock the BLOODKNIGHT enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.SPECIAL_ATTACK]: {
        name: "SPECIAL ATTACK",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Consumes MANA equal to 60% of MAX MANA. Deals PIERCING DAMAGE equal to the user's STR. If the user's MANA is higher than the target's, increases final damage dealt and restores the opponent's MANA equal to the difference. If the user's MANA is lower than the target's, decreases final damage dealt and restores the user's MANA equal to the difference. Cannot be when MANA is lower than 60% of MAX MANA.",
    },
};

export const BLOODKNIGHT_DESCRIPTIONS = {
    [aiKeys.BLOODKNIGHT]: {
        name: "BLOODKNIGHT",
        type: entryTypes.CONTROLLER,
        description:
            "The second challenge. Focuses on the use of SACRIFICE to increase the PHYSICAL DAMAGE dealt, utilizing of the MANA BLEED mechanics to turn GUARD into delayed healing. In PROGRESSION MODE, defeat this enemy to unlock the SACRIFICE action and the PALADIN enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.SACRIFICE]: {
        name: "SACRIFICE",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Halves current total HEALTH. Gains BLOOD SACRIFICE and increases MAX MANA equal to the total HEALTH lost this way, raises MANA BLEED rank by half the HEALTH lost this way. Enters SACRIFICIAL state.",
    },

    [effectKeys.SACRIFICIAL_STATE]: {
        name: "SACRIFICIAL",
        type: entryTypes.STATE,
        description:
            "Raises DAMAGE REDUCTION by the user's missing HEALTH percentage. At turn start, exits this state.",
    },

    [effectKeys.BLOOD_SACRIFICE]: {
        name: "BLOOD SACRIFICE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using ATTACK, increases the damage dealt by BLOOD SACRIFICE on self.",
    },

    [effectKeys.MANA_BLEED]: {
        name: "MANA BLEED",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "At turn start, loses MANA equal to MANA BLEED current rank and restores an equal amount of HEALTH.",
    },
};

export const PALADIN_DESCRIPTIONS = {
    [aiKeys.PALADIN]: {
        name: "PALADIN",
        type: entryTypes.CONTROLLER,
        description:
            "The third challenge. Focuses on the use of AEGIS to build up DIVINE SPARK, utilizing of ATTACK to deal damage and dispose of harmful RADIANCE when suitable; after building enough DIVINE SPARK, shifts focus to SPECIAL ATTACK, utilizing of AEGIS to restore RESOURCES via DIVINE SPARK overflow rules. In PROGRESSION MODE, defeat this enemy to unlock the AEGIS action and the SHADOW SORCERER enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.AEGIS]: {
        name: "AEGIS",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Gains HALO equal to twice the user's DEF. Enters RADIANT state. Cannot be used at 0 or less DEF.",
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
            "When using ATTACK, consumes all RADIANCE on self to increase the damage dealt. At turn end, loses all RADIANCE and takes TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.DIVINE_SPARK]: {
        name: "DIVINE SPARK",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises STR for every 5% DIVINE SPARK on self. When raising DIVINE SPARK above 100%, restores RESOURCES for every 2% excess.",
    },
};

export const SHADOW_SORCERER_DESCRIPTIONS = {
    [aiKeys.SHADOW_SORCERER]: {
        name: "SHADOW SORCERER",
        type: entryTypes.CONTROLLER,
        description:
            "The fourth challenge. Focuses on managing SHADOWFLAME, utilizing of SHADOW MANTLE when at low RESOURCES and RITUAL OF ASH when risking losing control; eventually finishing battle with BLACK MAYHEM consumption or DARK PROMISE restoration bomb. In PROGRESSION MODE, defeat this enemy to unlock the SHADOW PACT action and the CYBORG enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.SHADOW_PACT]: {
        name: "SHADOW PACT",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Exits all STATES and enters UMBRAL CORE. Then, burns 5 RESOURCES on self and gains SHADOWFLAME equal to the amount burned. Cannot burn SHADOWFLAME, LINGERING EMBER or UNRELENTING SHADOWS this way. When exiting this state, loses all SHADOWFLAME, LINGERING EMBER and CINDERS on self, then gains UNRELENTING SHADOWS equal to SHADOWFLAME consumed plus half the LINGERING EMBER consumed.",
    },

    [effectKeys.SHADOWFLAME]: {
        name: "SHADOWFLAME",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, burns RESOURCES on self equal to current SHADOWFLAME, then gains SHADOWFLAME equal to the amount burned. Cannot burn SHADOWFLAME, LINGERING EMBER or UNRELENTING SHADOWS this way.",
    },

    [effectKeys.UMBRAL_CORE]: {
        name: "UMBRAL CORE",
        type: entryTypes.STATE,
        description:
            "Replaces all actions with SHADOW MANTLE, BLACK MAYHEM, RITUAL OF ASH, and DARK PROMISE. At turn start, if at no SHADOWFLAME and no LINGERING EMBER on self, exits UMBRAL CORE and enters BLEAK DECEPTION.",
    },

    [effectKeys.BLEAK_DECEPTION]: {
        name: "BLEAK DECEPTION",
        type: entryTypes.STATE,
        description: "Cannot use SHADOW PACT.",
    },

    [actionKeys.BLACK_MAYHEM]: {
        name: "BLACK MAYHEM",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Burns the target's RESOURCES equal to the user's SHADOWFLAME. Grants CINDERS to the target equal to the amount of RESOURCES burnt. When burning CINDERS, does not grant CINDERS. Cannot burn SHADOWFLAME, LINGERING EMBER or UNRELENTING SHADOWS this way.",
    },

    [effectKeys.CINDERS]: {
        name: "CINDERS",
        type: entryTypes.FREE_RESOURCE,
        description: "No effect.",
    },

    [actionKeys.SHADOW_MANTLE]: {
        name: "SHADOW MANTLE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Gains UNRELENTING SHADOWS equal to SHADOWFLAME on self. Enters DARK EMBRACE.",
    },

    [effectKeys.UNRELENTING_SHADOWS]: {
        name: "UNRELENTING SHADOWS",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn start, loses all UNRELENTING SHADOWS and restores RESOURCES equal to the amount lost.",
    },

    [effectKeys.DARK_EMBRACE]: {
        name: "DARK EMBRACE",
        type: entryTypes.STATE,
        description:
            "Raises DAMAGE REDUCTION by 50%. While active, does not trigger SHADOWFLAME turn start effects. At turn start, exits this state.",
    },

    [actionKeys.RITUAL_OF_ASH]: {
        name: "RITUAL OF ASH",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Extinguishes all SHADOWFLAME on self, then gains LINGERING EMBER equal to the amount extinguished.",
    },

    [effectKeys.LINGERING_EMBER]: {
        name: "LINGERING EMBER",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "Cannot be consumed by SHADOWFLAME. When suffering PHYSICAL DAMAGE or PIERCING DAMAGE, consumes LINGERING EMBER to reduce the damage taken and gains CINDERS equal to the amount lost this way. At turn start, converts half of current LINGERING EMBER into both SHADOWFLAME and CINDERS.",
    },

    [actionKeys.DARK_PROMISE]: {
        name: "DARK PROMISE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Loses all SHADOWFLAME, LINGERING EMBER and CINDERS on self, then restores RESOURCES on all entities equal to the SHADOWFLAME lost plus half the LINGERING EMBER lost. Afterwards, exits UMBRAL CORE and enters DIMMING DARKNESS. ",
    },

    [effectKeys.DIMMING_DARKNESS]: {
        name: "DIMMING DARKNESS",
        type: entryTypes.STATE,
        description:
            "Does not activate MANA OVERFLOW turn end effects. At turn start, exits this state.",
    },
};

export const CYBORG_DESCRIPTIONS = {
    [aiKeys.CYBORG]: {
        name: "CYBORG",
        type: entryTypes.CONTROLLER,
        description:
            "The fifth challenge. Focuses on the use of LASER, ending turns with a DEFENSIVE ACTION for maximizing DYNAMO generation; avoids THERMAL OVERLOAD unless its enemy can be killed via MELTDOWN. In PROGRESSION MODE, defeat this enemy to unlock the DEPLOY action and the MAESTRO enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.DEPLOY]: {
        name: "DEPLOY",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters DEPLOYMENT state.",
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

    [actionKeys.LASER]: {
        name: "LASER",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Deals PIERCING DAMAGE equal to the user's current ENERGY LEVEL. Raises DYNAMO and OVERHEAT by 10%. Raises OVERHEAT by an additional 10% for every LASER used this TURN. This action does not end advance your TURN phase to COMMIT.",
    },

    [effectKeys.ENERGY_LEVEL]: {
        name: "ENERGY LEVEL",
        type: entryTypes.SPECIAL_ATTRIBUTES,
        description: "Increases LASER and MELTDOWN damage.",
    },

    [effectKeys.DYNAMO]: {
        name: "DYNAMO",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Enabled when in DEPLOYMENT, WEAPONS DEPLOYED, THERMAL OVERLOAD or VENTING states. Capped at 100%. At turn start, if at 100%, resets to 0% and increases ENERGY LEVEL by 1.",
    },

    [effectKeys.OVERHEAT]: {
        name: "OVERHEAT",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Enabled when in DEPLOYMENT, WEAPONS DEPLOYED, THERMAL OVERLOAD or VENTING states. Can go over 100%. When using DEFENSIVE ACTIONS, lowers OVERHEAT by 30% and raises DYNAMO by the amount lowered this way. Raises FRAGILITY by OVERHEAT on self.",
    },

    [effectKeys.THERMAL_OVERLOAD]: {
        name: "THERMAL OVERLOAD",
        type: entryTypes.STATE,
        description: "Replaces all actions with MELTDOWN.",
    },

    [actionKeys.MELTDOWN]: {
        name: "MELTDOWN",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "All entities take PHYSICAL DAMAGE equal to the user's current ENERGY LEVEL. Increases damage dealt by 1 for every 10% DYNAMO on self, then multiplies the resulting damage by current OVERHEAT. Afterwards, loses all DYNAMO on self, exits THERMAL OVERLOAD and enters VENTING state.",
    },

    [effectKeys.VENTING]: {
        name: "VENTING",
        type: entryTypes.STATE,
        description:
            "Cannot use DEPLOY, LASER or MELTDOWN. At turn end, lowers OVERHEAT by 50% and raises DYNAMO equal to the amount lowered. Additionally, if at 0% OVERHEAT, exits VENTING state and enters WEAPONS DEPLOYED. Raises DAMAGE REDUCTION by missing OVERHEAT on self.",
    },
};

export const MAESTRO_DESCRIPTIONS = {
    [aiKeys.MAESTRO]: {
        name: "MAESTRO",
        type: entryTypes.CONTROLLER,
        description:
            "The sixth challenge. Focuses on the use of LASER to lower SONORITY; shifting focus to BABEL and THE SOUND OF SILENCE when LASER is unavailable or enough SONORITY has been built. In PROGRESSION MODE, defeat this enemy to unlock the ATTUNE action and the AUGUR enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.ATTUNE]: {
        name: "ATTUNE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters RESONANT state.",
    },

    [effectKeys.RESONANT]: {
        name: "RESONANT",
        type: entryTypes.STATE,
        description:
            "Enables SONORITY. When SONORITY is 0, replaces ATTUNE with DA CAPO. When SONORITY is lower than 0, replaces ATTUNE with THE SOUND OF SILENCE. When SONORITY is higher than 0, replaces ATTUNE with BABEL. Upon exiting this state, sets SONORITY to 0.",
    },

    [effectKeys.SONORITY]: {
        name: "SONORITY",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Ranges from -75% to +75%. When using a DEFENSIVE ACTION, raises SONORITY by 15%. When using an OFFENSIVE ACTION, lowers SONORITY by 15%. Raises WEAKNESS and DAMAGE REDUCTION equal to SONORITY below 0. Raises DAMAGE BONUS and FRAGILITY equal to SONORITY above 0.",
    },

    [actionKeys.DA_CAPO]: {
        name: "DA CAPO",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Resets your current CONDITION to how it was at beginning of battle.",
    },

    [actionKeys.SOUND_OF_SILENCE]: {
        name: "THE SOUND OF SILENCE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Inverts current SONORITY. Gains HARMONY for every 10% shift on SONORITY.",
    },

    [effectKeys.HARMONY]: {
        name: "HARMONY",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes HARMONY to reduce the damage taken. At turn start, loses all HARMONY and restores RESOURCES equal to the amount lost.",
    },

    [actionKeys.BABEL]: {
        name: "BABEL",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Inverts current SONORITY. Inflicts DISSONANCE on the opponent for every 10% shift on SONORITY.",
    },

    [effectKeys.DISSONANCE]: {
        name: "DISSONANCE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn end, lose all DISSONANCE and takes TRUE DAMAGE equal to the amount lost.",
    },
};

export const AUGUR_DESCRIPTIONS = {
    [aiKeys.AUGUR]: {
        name: "AUGUR",
        type: entryTypes.CONTROLLER,
        description:
            "The seventh challenge. Cycles through the use of GUARD to buff itself or SPECIAL ATTACK to deal direct PIERCING DAMAGE, while utilizing of HEAL to maintain survivability; eventually detonating RUNES via CURSE to clear debuffs and trigger special effects. In PROGRESSION MODE, defeat this enemy to unlock the CARVE action and the VOYAGER enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.CARVE]: {
        name: "CARVE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters VISIONARY state.",
    },

    [effectKeys.VISIONARY]: {
        name: "VISIONARY",
        type: entryTypes.STATE,
        description:
            "Enables RUNIC ARRAY. When using GUARD, HEAL or SPECIAL ATTACK, adds RUNE OF URD, RUNE OF VERDANDI or RUNE OF SKULD to the RUNIC ARRAY, respectively. Upon exiting this state, detonates all RUNES, starting from the oldest.",
    },

    [effectKeys.RUNIC_ARRAY]: {
        name: "RUNIC ARRAY",
        type: entryTypes.MECHANIC,
        description:
            "Can hold up to 3 RUNES. When acquiring more than 3 RUNES, detonates the oldest one to make space.",
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
            "Gained from GUARD. Upon acquisition: Raises RECOLLECTION by 50%. While on RUNIC ARRAY: Lowers the user's STR by 3. Upon detonation: Restores HEALTH equal to 15% of MAX HEALTH.",
    },

    [effectKeys.RECOLLECTION]: {
        name: "RECOLLECTION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises DAMAGE BONUS equal to RECOLLECTION on self. Raises STR by a percentage of DEF equivalent to RECOLLECTION on self. When raising RECOLLECTION above 100%, gains PRECOGNITION for every 10% excess. When using an OFFENSIVE ACTION, lose all RECOLLECTION.",
    },

    [effectKeys.PRECOGNITION]: {
        name: "PRECOGNITION",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When MANA falls below MAX MANA, consumes PRECOGNITION to replenish missing MANA.",
    },

    [runeKeys.VERDANDI]: {
        name: "RUNE OF VERDANDI",
        type: entryTypes.RUNES,
        description:
            "Gained from HEAL. Upon acquisition: Gains CONJECTURE equal to the user's DEF. While on RUNIC ARRAY: Lowers the user's DEF by 3. Upon detonation: Replenishes 60% missing MANA.",
    },

    [effectKeys.CONJECTURE]: {
        name: "CONJECTURE",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes CONJECTURE to reduce the damage taken. At turn start, converts all CONJECTURE into PRECOGNITION.",
    },

    [runeKeys.SKULD]: {
        name: "RUNE OF SKULD",
        type: entryTypes.RUNES,
        description:
            "Gained from SPECIAL ATTACK. Upon acquisition: Replenishes MANA equal to 30% of MAX MANA. While on RUNIC ARRAY: Raises WEAKNESS and DAMAGE REDUCTION by 30%. Upon detonation: Raises the opponent's BAD OMEN by 30%.",
    },

    [effectKeys.BAD_OMEN]: {
        name: "BAD OMEN",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises WEAKNESS and FRAGILITY equal to BAD OMEN on self. When raising BAD OMEN above 100%, gains PROPHECY OF DOOM for every 5% excess. At turn end, loses all BAD OMEN and gains PROPHECY OF DOOM for every 5% lost.",
    },

    [effectKeys.PROPHECY_OF_DOOM]: {
        name: "PROPHECY OF DOOM",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When this entity has MANA or PRECOGNITION, spends PROPHECY OF DOOM to consume MANA or PRECOGNITION on them.",
    },

    [actionKeys.CURSE]: {
        name: "CURSE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Detonates all RUNES, starting from the oldest. Takes TRUE DAMAGE equal to 30% of MAX HEALTH when detonating an empty socket. This action does not end advance your TURN phase to COMMIT. Cannot be used when RUNIC ARRAY is empty.",
    },
};

export const VOYAGER_DESCRIPTIONS = {
    [aiKeys.VOYAGER]: {
        name: "VOYAGER",
        type: entryTypes.CONTROLLER,
        description:
            "The eighth challenge. Focuses on the use of CHART, alongside ORANGE STAR, INDIGO STAR and VIOLET STAR for maximizing STARS generation and the use of GREEN STAR for healing; upon acquiring enough STARS, attempts to kill the opponent using RED STARS, ORANGE STARS, YELLOW STARS and VIOLET STARS alongside DEFENSIVE ACTIONS to mitigate the STARS effects and OFFENSIVE ACTIONS to maximize damage dealt. In PROGRESSION MODE, defeat this enemy to unlock the CHART action and the LUNATIC enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.CHART]: {
        name: "CHART",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Gains 3 WHITE STAR. Converts all GRAY STAR on self into WHITE STAR. If not on STARGAZER state, enters STARGAZER state.",
    },

    [effectKeys.STARGAZER]: {
        name: "STARGAZER",
        type: entryTypes.STATE,
        description:
            "While active, enables STARFALL after the corresponding player's TURN. Enables a side-menu for assigning STARS. Upon exiting this state, loses all STARS and sets STARBLIGHT, CONSTELLATION, AZURE CONSTELLATION and CRIMSON CONSTELLATION to zero.",
    },

    [entryTypes.STAR]: {
        name: "STARS",
        type: entryTypes.CATEGORY,
        description:
            "Includes WHITE STAR, GRAY STAR, RED STAR, ORANGE STAR, YELLOW STAR, GREEN STAR, BLUE STAR, INDIGO STAR, and VIOLET STAR. The latter seven are labeled colored STARS and have two forms: normal and augmented. Click on the starpanel to add or subtract STARS, converting WHITE STARS into colored STARS and back. Left click to add or subtract in batches of 10.",
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
            "Can be assigned a color to become RED STAR, ORANGE STAR, YELLOW STAR, GREEN STAR, BLUE STAR, INDIGO STAR, or VIOLET STAR.",
    },

    [effectKeys.RED_STAR]: {
        name: "RED STAR",
        type: entryTypes.STAR,
        description:
            "At RED STARFALL, converts all RED STAR into WHITE STAR. All entities take PHYSICAL DAMAGE equal to normal RED STAR converted. All entities take PIERCING DAMAGE equal to augmented RED STAR converted. These are considered two separate instances of damage.",
    },

    [effectKeys.ORANGE_STAR]: {
        name: "ORANGE STAR",
        type: entryTypes.STAR,
        description:
            "At ORANGE STARFALL, converts all ORANGE STAR into WHITE STAR. Burns RESOURCES on self equal to normal ORANGE STAR converted. Burns RESOURCES on both opponent and self equal to augmented ORANGE STAR converted. Gains GRAY STAR equal to the total amount of RESOURCES burned.",
    },

    [effectKeys.GRAY_STAR]: {
        name: "GRAY STAR",
        type: entryTypes.STAR,
        description: "Cannot be assigned a color.",
    },

    [effectKeys.YELLOW_STAR]: {
        name: "YELLOW STAR",
        type: entryTypes.STAR,
        description:
            "At YELLOW STARFALL, converts all YELLOW STAR into WHITE STAR. Raises GRAVITATION by 5% for every normal YELLOW STAR converted. Raises CONSTELLATION rank by the amount of augmented YELLOW STAR converted.",
    },

    [effectKeys.GRAVITATION]: {
        name: "GRAVITATION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises DAMAGE BONUS equal to GRAVITATION on self. When raising GRAVITATION above 100%, raises ACCRETION instead. At 100% GRAVITATION, loses all GRAVITATION and enters EVENT HORIZON. At turn end, lose all GRAVITATION.",
    },

    [effectKeys.EVENT_HORIZON]: {
        name: "EVENT HORIZON",
        type: entryTypes.STATE,
        description:
            "Enables this player's SINGULARITY. At turn start, remove this state.",
    },

    [effectKeys.SINGULARITY]: {
        name: "SINGULARITY",
        type: entryTypes.BATTLE_PHASE,
        description:
            "Added to ROUND QUEUE after the corresponding player's STARFALL. Allows the use of ACTIONS and other combat interactions. Cannot assign STARS on this phase.",
    },

    [effectKeys.ACCRETION]: {
        name: "ACCRETION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises DAMAGE BONUS equal to ACCRETION on self. When raising ACCRETION above 100%, raises STARBLIGHT rank for every 5% excess. At turn end, lose all ACCRETION.",
    },

    [effectKeys.STARBLIGHT]: {
        name: "STARBLIGHT",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Increases DEFENSE PENETRATION by its rank. At turn end, sets STARBLIGHT to 0.",
    },

    [effectKeys.DEF_PEN]: {
        name: "DEFENSE PENETRATION",
        type: entryTypes.MECHANIC,
        description:
            "When dealing PHYSICAL DAMAGE, ignores EFFECTIVE DEFENSE equal to the user's DEFENSE PENETRATION.",
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
            "At GREEN STARFALL, converts all GREEN STAR into WHITE STAR. Consumes WHITE STAR and restores RESOURCES equal to normal GREEN STAR converted. Restores RESOURCES on self equal to augmented GREEN STAR converted.",
    },

    [effectKeys.BLUE_STAR]: {
        name: "BLUE STAR",
        type: entryTypes.STAR,
        description:
            "At BLUE STARFALL, converts all BLUE STAR into WHITE STAR. Gains FRACTURED DOME equal to normal BLUE STAR converted. Gains FAULTY FIRMAMENT equal to augmented BLUE STAR converted.",
    },

    [effectKeys.FRACTURED_DOME]: {
        name: "FRACTURED DOME",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes FRACTURED DOME to reduce the damage taken. At turn start, loses all FRACTURED DOME and takes TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.FAULTY_FIRMAMENT]: {
        name: "FAULTY FIRMAMENT",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes FAULTY FIRMAMENT to reduce the damage taken. At turn start, loses all FAULTY FIRMAMENT and raises IRRADIATION by 5% per FAULTY FIRMAMENT lost.",
    },

    [effectKeys.IRRADIATION]: {
        name: "IRRADIATION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises WEAKNESS and FRAGILITY equal to IRRADIATION on self. When raising IRRADIATION above 100%, takes TRUE DAMAGE for every 5% excess. At turn start, loses all IRRADIATION.",
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
            "At INDIGO STARFALL, converts all INDIGO STAR into WHITE STAR. Gains STARDUST equal to normal INDIGO STAR converted. Gains GRAY STAR equal to augmented INDIGO STAR converted.",
    },

    [effectKeys.VIOLET_STAR]: {
        name: "VIOLET STAR",
        type: entryTypes.STAR,
        description:
            "When other colored STARS are converted, converts equivalent VIOLET STAR into WHITE STAR and augments that STARS effects. Cannot augment VIOLET STAR. At VIOLET STARFALL, converts all VIOLET STAR into WHITE STAR. Converts GRAY STAR into WHITE STAR equal to VIOLET STAR converted at this phase.",
    },
};

export const LUNATIC_DESCRIPTIONS = {
    [aiKeys.LUNATIC]: {
        name: "LUNATIC",
        type: entryTypes.CONTROLLER,
        description:
            "The ninth challenge. Focuses on the use of MIRROR, LUNAR SHROUD and LUNAR SHED to build LUNACY and MOONLIGHT according to the current ATTRIBUTES, MOONLIGHT and MIRRORED MOON phase; utilizing of LUNAR TIDE or LUNAR GROWTH when in danger, and LUNAR SMITE or LUNAR STRIKE when it can finish the enemy; eventually using SHATTER to finish the fight with CHALK once enough MOONLIGHT and LUNACY have been accumulated. In PROGRESSION MODE, defeat this enemy to unlock the REFRACT action and the SERAPH enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.REFRACT]: {
        name: "REFRACT",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters SELENIAN.",
    },

    [effectKeys.SELENIAN]: {
        name: "SELENIAN",
        type: entryTypes.STATE,
        description:
            "Enables ELEMENTAL CRYSTALS, MIRRORED MOON and MOON PHASE. Replaces REFRACT with MIRROR. Upon exiting this state, takes LUNIC DAMAGE equal to MOONLIGHT on self, then loses all MOONLIGHT, LUNACY and MOONLIT TEARS, also sets MIRRORED MOON to HIDDEN, ELEMENTAL CRYSTALS to DULLED and disables them. When MAX HEALTH falls below current HEALTH, converts excess HEALTH into SILVER BLOOD. When MAX HEALTH rises past current HEALTH, consumes SILVER BLOOD to replenish missing HEALTH. When MAX HEALTH is decreased below 0, lose MOONLIGHT instead.",
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
        description: "Converts all PHYSICAL DAMAGE taken into PIERCING DAMAGE.",
    },

    [effectKeys.REFRACTED_DIVINITY]: {
        name: "REFRACTED DIVINITY",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, consumes this resource to decrease the damage taken, then gains MOONSHINE equal to the amount lost this way. At turn start, loses all remaining REFRACTED DIVINITY, then raises LUNACY by 1% for every REFRACTED DIVINITY lost this way.",
    },

    [effectKeys.MOONSHINE]: {
        name: "MOONSHINE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using LUNAR STRIKE, consumes MOONSHINE to increase the damage dealt. At turn end, loses all MOONSHINE and takes TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.LUNACY]: {
        name: "LUNACY",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Raises DAMAGE BONUS and FRAGILITY equal to the percentage. At 100% LUNACY, sets ELEMENTAL CRYSTALS to SHATTERED.",
    },

    [elementalKeys.NATURE]: {
        name: "NATURE",
        type: entryTypes.MECHANIC,
        description:
            "While active, raises MAX HEALTH by MOONLIGHT on self. Additionally, replaces GUARD with LUNAR GROWTH.",
    },

    [effectKeys.SILVER_BLOOD]: {
        name: "SILVER BLOOD",
        type: entryTypes.OVERFLOWN_RESOURCE,
        description:
            "When taking any damage, loses SILVER BLOOD first before HEALTH.",
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
        description: "Deals PIERCING DAMAGE equal to half the user's STR.",
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
            "Combination of FROST and NATURE. While active, when losing HEALTH or SILVER BLOOD, raises LUNACY by 1% for every HEALTH or SILVER BLOOD lost. Additionally, raises DAMAGE REDUCTION by the user's missing HEALTH percentage. Replaces SACRIFICE with LUNAR SHED.",
    },

    [effectKeys.MOONLIT_TEARS]: {
        name: "MOONLIT TEARS",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "At MOON PHASE, when the MIRRORED MOON is BLOODSTAINED or CORONAL, increases MOONLIGHT generated by its rank.",
    },

    [actionKeys.LUNAR_SHED]: {
        name: "LUNAR SHED",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Takes TRUE DAMAGE and gains MYCELIUM equal to MOONLIGHT on self. Raises MOONLIT TEARS rank by 1.",
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
            "Combination of NATURE and SCORCH. While active, when using an OFFENSIVE ACTION, consumes LIMITED RESOURCES equal to half the sum of all LIMITED RESOURCES on self. Then, gains FUNERARY URN equal to the amount consumed. Replaces ATTACK with LUNAR SMITE.",
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
            "Deals PIERCING DAMAGE equal to the user's MOONLIGHT. Increases the damage dealt by 5% for every missing LIMITED RESOURCES on self.",
    },

    [elementalKeys.ALBEDO]: {
        name: "ALBEDO",
        type: entryTypes.MECHANIC,
        description:
            "Combination of NATURE, FROST and SCORCH. While active, on MOON PHASE, increases MOONLIGHT by 2. Replaces MIRROR with SHATTER.",
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
            "Deals LUNIC DAMAGE equal to MOONLIGHT on self. Increases damage dealt for every 10% LUNACY on self.",
    },

    [dmgTypes.LUNIC]: {
        name: "LUNIC DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's MAX HEALTH. Ignores EFFECTIVE DEFENSE, DAMAGE MODIFIERS and MITIGATION RESOURCES.",
    },
};

export const SERAPH_DESCRIPTIONS = {
    [aiKeys.SERAPH]: {
        name: "SERAPH",
        type: entryTypes.CONTROLLER,
        description:
            "The tenth and final challenge. In PROGRESSION MODE, defeat this enemy to unlock the RISE and ASCEND actions.",
    },

    [actionKeys.RISE]: {
        name: "RISE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Raises STR by 10. Enters ZENITH OF MORTALITY.",
    },

    [effectKeys.ZENITH_OF_MORTALITY]: {
        name: "ZENITH OF MORTALITY",
        type: entryTypes.STATE,
        description: "Replaces all ACTIONS with ASCEND.",
    },

    [actionKeys.ASCEND]: {
        name: "ASCEND",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Exits all states. Consumes all LIMITED RESOURCES on self and sets MAX ENLIGHTENMENT to the sum of MAX MANA and MAX HEALTH. Then, sets MAX MANA and MAX HEALTH to 0 and replenishes ENLIGHTENMENT equal to the LIMITED RESOURCES consumed. Raises REVELATION by the user's STR. Raises FORTITUDE by the user's DEF. Then, sets all BASE ATTRIBUTES to 0. Consumes all DIVINE SPARK on self. Enters ASCENDENCE OF SPIRIT and initiates the HEAVENLY CHOIRS. Advances the HEAVENLY CHOIRS for every 20% DIVINE SPARK consumed. Raises the battlefield's PROVIDENCE by the total DIVINE SPARK consumed. This is a FREE ACTION.",
    },

    [effectKeys.REVELATION]: {
        name: "REVELATION",
        type: entryTypes.SPECIAL_ATTRIBUTES,
        description: "Scales certain actions and effects.",
    },

    [effectKeys.PROVIDENCE]: {
        name: "PROVIDENCE",
        type: entryTypes.GLOBAL_RESOURCE,
        description:
            "Capped at 100%. When restoring PROVIDENCE above 100%, restores RESOURCES to all entities for every 2.5% excess.",
    },

    [effectKeys.ENLIGHTENMENT]: {
        name: "ENLIGHTENMENT",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped by MAX ENLIGHTENMENT. When restoring ENLIGHTENMENT above the limit, restores INSIGHT instead. While on ASCENDENCE OF SPIRIT, at 0 or less ENLIGHTENMENT, exits ASCENDENCE OF SPIRIT.",
    },

    [effectKeys.MAX_ENLIGHTENMENT]: {
        name: "MAX ENLIGHTENMENT",
        type: entryTypes.MECHANIC,
        description:
            "Starts at 0. While on ASCENDENCE OF SPIRIT, at 0 or less MAX ENLIGHTENMENT, exits ASCENDENCE OF SPIRIT.",
    },

    [effectKeys.INSIGHT]: {
        name: "INSIGHT",
        type: entryTypes.OVERFLOWN_RESOURCE,
        description:
            "When losing ENLIGHTENMENT, lose INSIGHT first. At turn start, loses all INSIGHT, then, raises TARNISHED SIN on self by 0.5% per INSIGHT lost and the battlefield's PROVIDENCE by 2.5% per INSIGHT lost.",
    },

    [effectKeys.TARNISHED_SIN]: {
        name: "TARNISHED SIN",
        type: entryTypes.FIXED_RESOURCE,
        description: "At 100%, enters ABANDONED BY GRACE.",
    },

    [effectKeys.ABANDONED_BY_GRACE]: {
        name: "ABANDONED BY GRACE",
        type: entryTypes.STATE,
        description:
            "Cannot act. If there's no entity on ANOINTED PROXY on the battlefield, awakens the EYE OF HEAVENS and triggers ANOINTMENT.",
    },

    [roundPhases.ANOINTMENT]: {
        name: "ANOINTMENT",
        type: entryTypes.BATTLE_PHASE,
        description:
            "If the EYE OF HEAVENS is CLOSED, sets it to OPEN. If both entities are on ABANDONED BY GRACE, delete both entities CONDITION and ends the MATCH in a draw. Otherwise, grants ANOINTED PROXY to the entity not on ABANDONED BY GRACE.",
    },

    [effectKeys.ANOINTED_PROXY]: {
        name: "ANOINTED PROXY",
        type: entryTypes.STATE,
        description:
            "Cannot die. Triggers the corresponding player's TRIAL. Replaces all actions with JUDGEMENT.",
    },

    [effectKeys.TRIAL]: {
        name: "TRIAL",
        type: entryTypes.BATTLE_PHASE,
        description: "Counts as an EXTRA TURN.",
    },

    [actionKeys.JUDGEMENT]: {
        name: "JUDGEMENT",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Deletes the opponent's CONDITION. Then, exits ANOINTED PROXY.",
    },

    [effectKeys.ASCENDENCE_OF_SPIRIT]: {
        name: "ASCENDENCE OF SPIRIT",
        type: entryTypes.STATE,
        description:
            "Cannot die. Replaces HEALTH and MANA with ENLIGHTENMENT. Replaces DAMAGE MODIFIERS, EFFECTIVE DEFENSE, DEFENSE EFFECTIVENESS and DEFENSE PENETRATION with SPIRITUAL ORDINANCES, FORTITUDE, INTEGRITY and DEFILEMENT. Converts all DAMAGE TYPES taken into their corresponding TARNISHMENT TYPES. Replaces all actions with CONDEMN, SUPPLICATE, DISCERN and ATONE. Opens a side-menu for enabling or disabling EDICTS. Effects that replenish HEALTH or MANA directly will instead raise TARNISHED SIN by 2.5% per point replenished. Raises DISGRACE by TARNISHED SIN on self. When exiting this state, exits the HEAVENLY CHOIRS, lose all REVELATION and FORTITUDE on self, consumes all LIMITED RESOURCES on self, sets MAX HEALTH to MAX ENLIGHTENMENT and MAX ENLIGHTENMENT to 0, then restores RESOURCES equal to the LIMITED RESOURCES consumed and enters CUTOFF WINGS.",
    },

    [effectKeys.CUTOFF_WINGS]: {
        name: "CUTOFF WINGS",
        type: entryTypes.STATE,
        description: "Cannot use AEGIS, RISE or ASCEND.",
    },

    [entryTypes.TARNISHMENT_TYPE]: {
        name: "TARNISHMENT TYPES",
        type: entryTypes.CATEGORY,
        description:
            "Includes PHYSICAL TARNISHMENT, PIERCING TARNISHMENT, TRUE TARNISHMENT and LUNIC TARNISHMENT. All TARNISHMENT received has a minimum of 1. When reducing a target's ENLIGHTENMENT or MAX ENLIGHTENMENT below 0, raises their TARNISHED SIN by 0.5% per point of tarnishment received instead.",
    },

    [tarnishTypes.PHYSICAL]: {
        name: "PHYSICAL TARNISHMENT",
        type: entryTypes.TARNISHMENT_TYPE,
        description:
            "Reduces the target's ENLIGHTENMENT. Can be blocked by FORTITUDE, affected by SPIRITUAL ORDINANCES and mitigated by SANCTUARY.",
    },

    [tarnishTypes.PIERCING]: {
        name: "PIERCING TARNISHMENT",
        type: entryTypes.TARNISHMENT_TYPE,
        description:
            "Reduces the target's ENLIGHTENMENT. Ignores FORTITUDE, but can be affected by SPIRITUAL ORDINANCES and mitigated by SANCTUARY.",
    },

    [tarnishTypes.TRUE]: {
        name: "TRUE TARNISHMENT",
        type: entryTypes.TARNISHMENT_TYPE,
        description:
            "Reduces the target's ENLIGHTENMENT. Cannot be blocked by FORTITUDE, affected by SPIRITUAL ORDINANCES or mitigated by SANCTUARY.",
    },

    [tarnishTypes.LUNIC]: {
        name: "LUNIC TARNISHMENT",
        type: entryTypes.TARNISHMENT_TYPE,
        description:
            "Reduces the target's MAX ENLIGHTENMENT. Cannot be blocked by FORTITUDE, affected by SPIRITUAL ORDINANCES or mitigated by SANCTUARY.",
    },

    [effectKeys.FORTITUDE]: {
        name: "FORTITUDE",
        type: entryTypes.MECHANIC,
        description: "Reduces PHYSICAL TARNISHMENT received.",
    },

    [effectKeys.INTEGRITY]: {
        name: "INTEGRITY",
        type: entryTypes.MECHANIC,
        description:
            "Defaults to 0%. Raises FORTITUDE by a percentage of the user's REVELATION equivalent to INTEGRITY on self.",
    },

    [effectKeys.DEFILEMENT]: {
        name: "DEFILEMENT",
        type: entryTypes.MECHANIC,
        description:
            "When inflicting PHYSICAL TARNISHMENT, ignores a portion of the target's FORTITUDE equal to the battlefield's DEFILEMENT. Raises the battlefield's DEFILEMENT by the sum of all entities DEFENSE PENETRATION.",
    },

    [entryTypes.SPIRITUAL_ORDINANCE]: {
        name: "SPIRITUAL ORDINANCES",
        type: entryTypes.CATEGORY,
        description:
            "Includes MALEDICTION, BENEDICTION, GRACE and DISGRACE. All sources of SPIRITUAL ORDINANCES stack multiplicatively.",
    },

    [effectKeys.MALEDICTION]: {
        name: "MALEDICTION",
        type: entryTypes.SPIRITUAL_ORDINANCE,
        description:
            "Defaults to 0%. Increases PHYSICAL TARNISHMENT and PIERCING TARNISHMENT inflicted by the percentage.",
    },

    [effectKeys.BENEDICTION]: {
        name: "BENEDICTION",
        type: entryTypes.SPIRITUAL_ORDINANCE,
        description:
            "Defaults to 0%. Decreases PHYSICAL TARNISHMENT and PIERCING TARNISHMENT inflicted by the percentage.",
    },

    [effectKeys.GRACE]: {
        name: "GRACE",
        type: entryTypes.SPIRITUAL_ORDINANCE,
        description:
            "Defaults to 0%. Decreases PHYSICAL TARNISHMENT and PIERCING TARNISHMENT received by the percentage.",
    },

    [effectKeys.DISGRACE]: {
        name: "DISGRACE",
        type: entryTypes.SPIRITUAL_ORDINANCE,
        description:
            "Defaults to 0%. Increases PHYSICAL TARNISHMENT and PIERCING TARNISHMENT received by the percentage.",
    },

    [entryTypes.HEAVENLY_CHOIR]: {
        name: "HEAVENLY CHOIRS",
        type: entryTypes.CATEGORY,
        description:
            "Includes HEAVENLY CHOIR: THE FIRST, HEAVENLY CHOIR: THE SECOND, HEAVENLY CHOIR: THE THIRD, HEAVENLY CHOIR: THE FOURTH, HEAVENLY CHOIR: THE FIFTH, HEAVENLY CHOIR: THE SIXTH, HEAVENLY CHOIR: THE SEVENTH, HEAVENLY CHOIR: THE EIGHTH and HEAVENLY CHOIR: THE NINTH. Each of the HEAVENLY CHOIRS inherits the effects of all previous HEAVENLY CHOIRS. Upon initiating the HEAVENLY CHOIRS, enters HEAVENLY CHOIR: THE FIRST. Upon exiting the HEAVENLY CHOIRS, disables all EDICTS.",
    },

    [actionKeys.CONDEMN]: {
        name: "CONDEMN",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Inflicts PHYSICAL TARNISHMENT equal to the user's REVELATION.",
    },

    [actionKeys.SUPPLICATE]: {
        name: "SUPPLICATE",
        type: entryTypes.DEFENSIVE_ACTION,
        description: "Restores RESOURCES on self equal to REVELATION.",
    },

    [actionKeys.DISCERN]: {
        name: "DISCERN",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Raises REVELATION for every 10% PROVIDENCE on the battlefield.",
    },

    [actionKeys.ATONE]: {
        name: "ATONE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Consumes all REVELATION and FORTITUDE on self and PROVIDENCE on the battlefield. Raises BURDEN OF STIGMA rank for every 20% PROVIDENCE consumed. Raises ATTRIBUTES equal to REVELATION consumed. Then, exits ASCENDENCE OF SPIRIT.",
    },

    [effectKeys.BURDEN_OF_STIGMA]: {
        name: "BURDEN OF STIGMA",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Cannot Die. At turn start, lowers BURDEN OF STIGMA rank by 1.",
    },

    [entryTypes.EDICT]: {
        name: "EDICTS",
        type: entryTypes.CATEGORY,
        description:
            "Includes EDICT OF ANGELS, EDICT OF ARCHANGELS, EDICT OF PRINCIPALITIES, EDICT OF POWERS, EDICT OF VIRTUES, EDICT OF DOMINIONS, EDICT OF THRONES, EDICT OF CHERUBIM and EDICT OF SERAPHIM. Multiple EDICTS may be enabled at a time.",
    },

    [choirKeys.FIRST]: {
        name: "HEAVENLY CHOIR: THE FIRST",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF ANGELS. At turn start, becomes HEAVENLY CHOIR: THE SECOND.",
    },

    [edictKeys.ANGELS]: {
        name: "EDICT OF ANGELS",
        type: entryTypes.EDICT,
        description:
            "When using CONDEMN, halves the user's total ENLIGHTENMENT. Then, increases the tarnishment inflicted by the ENLIGHTENMENT lost.",
    },

    [choirKeys.SECOND]: {
        name: "HEAVENLY CHOIR: THE SECOND",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF ARCHANGELS. At turn start, becomes HEAVENLY CHOIR: THE THIRD.",
    },

    [edictKeys.ARCHANGELS]: {
        name: "EDICT OF ARCHANGELS",
        type: entryTypes.EDICT,
        description:
            "Raises GRACE and MALEDICTION by the user's missing ENLIGHTENMENT percentage. When losing ENLIGHTENMENT or INSIGHT, gains MARTHYR equal to the amount lost.",
    },

    [effectKeys.MARTHYR]: {
        name: "MARTHYR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At turn end, lose all MARTHYR. Then, raises TARNISHED SIN on self by 0.5% per MARTHYR lost and the battlefield's PROVIDENCE by 2.5% per MARTHYR lost.",
    },

    [choirKeys.THIRD]: {
        name: "HEAVENLY CHOIR: THE THIRD",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF PRINCIPALITIES. At turn start, becomes HEAVENLY CHOIR: THE FOURTH.",
    },

    [edictKeys.PRINCIPALITIES]: {
        name: "EDICT OF PRINCIPALITIES",
        type: entryTypes.EDICT,
        description:
            "Raises the user's INTEGRITY by the battlefield's PROVIDENCE. When using SUPPLICATE, instead of restoring RESOURCES, gains SANCTUARY equal to the user's FORTITUDE and enters IMMACULATE state.",
    },

    [effectKeys.SANCTUARY]: {
        name: "SANCTUARY",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When receiving PHYSICAL TARNISHMENT or PIERCING TARNISHMENT, consumes SANCTUARY to reduce the tarnishment received, then gains SACRILEGE equal to the amount lost. At turn start, loses all SANCTUARY and raises PROVIDENCE on the battlefield by 2.5% for every SANCTUARY lost.",
    },

    [effectKeys.SACRILEGE]: {
        name: "SACRILEGE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using CONDEMN, consumes all SACRILEGE on self, then increases the tarnishment inflicted by the amount lost. At turn end, loses all SACRILEGE and raises TARNISHED SIN on self by 0.5% for every SACRILEGE lost.",
    },

    [effectKeys.IMMACULATE]: {
        name: "IMMACULATE",
        type: entryTypes.STATE,
        description: "Nullifies the user's FORTITUDE.",
    },

    [choirKeys.FOURTH]: {
        name: "HEAVENLY CHOIR: THE FOURTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF POWERS. At turn start, becomes HEAVENLY CHOIR: THE FIFTH.",
    },

    [edictKeys.POWERS]: {
        name: "EDICT OF POWERS",
        type: entryTypes.EDICT,
        description:
            "When using DISCERN, consumes RESOURCES on self for every 5% PROVIDENCE on the battlefield. Then, gains SACRED FLAMES equal to the amount consumed.",
    },

    [effectKeys.SACRED_FLAMES]: {
        name: "SACRED FLAMES",
        type: entryTypes.MECHANIC,
        description:
            "At turn end, restores RESOURCES equal to SACRED FLAMES on self.",
    },

    [choirKeys.FIFTH]: {
        name: "HEAVENLY CHOIR: THE FIFTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF VIRTUES. At turn start, becomes HEAVENLY CHOIR: THE SIXTH.",
    },

    [edictKeys.VIRTUES]: {
        name: "EDICT OF VIRTUES",
        type: entryTypes.EDICT,
        description:
            "When using ACTIONS, if not already a FREE ACTION, consumes 10% PROVIDENCE to become a FREE ACTION. Increases the PROVIDENCE consumed by 10% for every time this effect has triggered on the current turn. Does not activate if there's not enough PROVIDENCE on the battlefield.",
    },

    [choirKeys.SIXTH]: {
        name: "HEAVENLY CHOIR: THE SIXTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF DOMINIONS and HALLOWED ECHOES. At turn start, becomes HEAVENLY CHOIR: THE SEVENTH.",
    },

    [edictKeys.DOMINIONS]: {
        name: "EDICT OF DOMINIONS",
        type: entryTypes.EDICT,
        description:
            "When using CONDEMN, lowers HALLOWED ECHOES by 15%. When using SUPPLICATE, raises HALLOWED ECHOES by 15%. When using DISCERN, inverts HALLOWED ECHOES.",
    },

    [effectKeys.HALLOWED_ECHOES]: {
        name: "HALLOWED ECHOES",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Starts at 0. Can go from -75% to 75%. Raises MALEDICTION and DISGRACE equal to HALLOWED ECHOES lower than 0. Raises BENEDICTION and GRACE equal to HALLOWED ECHOES higher than 0. At turn start, resets HALLOWED ECHOES to 0. When exiting ASCENDENCE OF SPIRIT, sets HALLOWED ECHOES to 0.",
    },

    [choirKeys.SEVENTH]: {
        name: "HEAVENLY CHOIR: THE SEVENTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF THRONES and the CODEX OF BLASPHEMY. At turn start, becomes HEAVENLY CHOIR: THE EIGHTH.",
    },

    [edictKeys.THRONES]: {
        name: "EDICT OF THRONES",
        type: entryTypes.EDICT,
        description:
            "When using CONDEMN, SUPPLICATE or DISCERN, add BLASPHEMY OF YESTERDAY, BLASPHEMY OF TODAY or BLASPHEMY OF TOMORROW to the CODEX OF BLASPHEMY, respectively.",
    },

    [effectKeys.CODEX_OF_BLASPHEMY]: {
        name: "CODEX OF BLASPHEMY",
        type: entryTypes.MECHANIC,
        description:
            "Can hold up to three BLASPHEMIES. When a fourth one is added, expunge the oldest one to make space. Click on any blasphemy to expunge it. When exiting ASCENDENCE OF SPIRIT, expunge all BLASPHEMIES, starting from the oldest.",
    },

    [entryTypes.BLASPHEMY]: {
        name: "BLASPHEMIES",
        type: entryTypes.CATEGORY,
        description:
            "Includes BLASPHEMY OF YESTERDAY, BLASPHEMY OF TODAY and BLASPHEMY OF TOMORROW. When BLASPHEMIES are expunged, raise TARNISHED SIN on self by 5% and remove them from the CODEX OF BLASPHEMY.",
    },

    [blasphemyKeys.YESTERDAY]: {
        name: "BLASPHEMY OF YESTERDAY",
        type: entryTypes.BLASPHEMY,
        description:
            "When expunged, transfers a tenth of the TARNISHED SIN on self to the opponent.",
    },

    [blasphemyKeys.TODAY]: {
        name: "BLASPHEMY OF TODAY",
        type: entryTypes.BLASPHEMY,
        description:
            "When expunged, inflicts PHYSICAL TARNISHMENT on all entities equal to the user's missing ENLIGHTENMENT.",
    },

    [blasphemyKeys.TOMORROW]: {
        name: "BLASPHEMY OF TOMORROW",
        type: entryTypes.BLASPHEMY,
        description:
            "When expunged, gains COVENANT for every 10% missing PROVIDENCE on the battlefield.",
    },

    [effectKeys.COVENANT]: {
        name: "COVENANT",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using CONDEMN, consumes all COVENANT, then inflicts LUNIC TARNISHMENT equal to the amount consumed. When using SUPPLICATE, consumes all COVENANT, then raises MAX ENLIGHTENMENT on self equal to the amount consumed. At turn end, lose all COVENANT, then raise TARNISHED SIN on self by 0.5% for every COVENANT lost.",
    },

    [choirKeys.EIGHTH]: {
        name: "HEAVENLY CHOIR: THE EIGHTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF CHERUBIM. At turn start, becomes HEAVENLY CHOIR: THE NINTH and awakens the EYE OF HEAVENS.",
    },

    [edictKeys.CHERUBIM]: {
        name: "EDICT OF CHERUBIM",
        type: entryTypes.EDICT,
        description:
            "When the battlefield's PROVIDENCE is consumed, gains STARS OF APOCALYPSE for every 2.5% consumption. When the battlefield's PROVIDENCE is restored, gains STARS OF GENESIS for every 2.5% restored.",
    },

    [entryTypes.CELESTIAL_STAR]: {
        name: "CELESTIAL STARS",
        type: entryTypes.CATEGORY,
        description: "Includes STARS OF APOCALYPSE and STARS OF GENESIS.",
    },

    [effectKeys.STARS_OF_APOCALYPSE]: {
        name: "STARS OF APOCALYPSE",
        type: entryTypes.CELESTIAL_STAR,
        description:
            "Raises DISGRACE by 2.5% for every STARS OF APOCALYPSE on self. Click to consume a star and inflict 1 TRUE TARNISHMENT on all entities.",
    },

    [effectKeys.STARS_OF_GENESIS]: {
        name: "STARS OF GENESIS",
        type: entryTypes.CELESTIAL_STAR,
        description:
            "Raises BENEDICTION by 2.5% for every STARS OF GENESIS on self. Click to consume a star and restore 1 RESOURCES to all entities.",
    },

    [choirKeys.NINTH]: {
        name: "HEAVENLY CHOIR: THE NINTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description: "Unlocks EDICT OF SERAPHIM.",
    },

    [effectKeys.EYE_OF_HEAVENS]: {
        name: "EYE OF HEAVENS",
        type: entryTypes.MECHANIC,
        description:
            "Can be CLOSED or OPEN. Awakens as OPEN. Enables RECKONING.",
    },

    [roundPhases.RECKONING]: {
        name: "RECKONING",
        type: entryTypes.BATTLE_PHASE,
        description:
            "Added to ROUND QUEUE after ROUND START. At RECKONING, if there's no entity on the battlefield on HEAVENLY CHOIR: THE NINTH, returns the EYE OF HEAVENS to dormancy.",
    },

    [eyeKeys.CLOSED]: {
        name: "CLOSED",
        type: entryTypes.MECHANIC,
        description: "At RECKONING, becomes OPEN.",
    },

    [eyeKeys.OPEN]: {
        name: "OPEN",
        type: entryTypes.MECHANIC,
        description: "At RECKONING, becomes CLOSED.",
    },

    [edictKeys.SERAPHIM]: {
        name: "EDICT OF SERAPHIM",
        type: entryTypes.EDICT,
        description:
            "When the EYE OF HEAVENS is OPEN: Raises BENEDICTION and GRACE on self by half the battlefield's PROVIDENCE. Raises MALEDICTION and DISGRACE on self by half the battlefield's missing PROVIDENCE. When the EYE OF HEAVENS is CLOSED: Raises MALEDICTION and DISGRACE on self by half the battlefield's PROVIDENCE. Raises BENEDICTION and GRACE on self by half the battlefield's missing PROVIDENCE.",
    },
};

export const DESCRIPTIONS = {
    ...GENERAL_DESCRIPTIONS,
    ...BASIC_DESCRIPTIONS,
    ...WARLOCK_DESCRIPTIONS,
    ...BLOODKNIGHT_DESCRIPTIONS,
    ...PALADIN_DESCRIPTIONS,
    ...CYBORG_DESCRIPTIONS,
    ...MAESTRO_DESCRIPTIONS,
    ...AUGUR_DESCRIPTIONS,
    ...SHADOW_SORCERER_DESCRIPTIONS,
    ...VOYAGER_DESCRIPTIONS,
    ...LUNATIC_DESCRIPTIONS,
    ...SERAPH_DESCRIPTIONS,
};
