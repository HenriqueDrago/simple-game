/*
 * DESCRIPTION WRITING GUIDELINES
 *
 * 1. Never address the reader directly. Describe what happens to "self", "the user",
 *    "the opponent", "the target", or "all entities" instead of "you"/"your".
 *      Bad:  "You gain 1 MANA."
 *      Good: "Gains 1 MANA."
 *
 * 2. Write effects as verbs in the third-person singular present tense (the "-s" form),
 *    with the subject implied.
 *      Bad:  "Gain HARMONY.", "Lose all HALO."
 *      Good: "Gains HARMONY.", "Loses all HALO.", "Restores RESOURCES.", "Deals PIERCING DAMAGE."
 *
 * 3. Omit the conversion rate when it is 1:1 between integers.
 *      Bad:  "Gains 1 MOONSHINE for every 1 HEALTH lost."
 *      Good: "Gains MOONSHINE equal to the HEALTH lost."
 *
 * 4. Always specify the conversion rate when converting between floats and integers.
 *      Floats:   percentages (DAMAGE MODIFIERS, SPIRITUAL ORDINANCES, PROVIDENCE, fixed resources).
 *      Integers: all other RESOURCES, and ATTRIBUTES.
 *      Bad:  "Raises DYNAMO for every ENERGY BARRIER lost."
 *      Good: "Raises DYNAMO by 5% for every ENERGY BARRIER lost.", "Gains PRECOGNITION for every 10% excess."
 *    Always write rates with "for every", never "per".
 *      Bad:  "Raises LUNACY by 2.5% per MOONSHINE spent."
 *      Good: "Raises LUNACY by 2.5% for every MOONSHINE spent."
 *    Omit the integer side of the rate when it is 1.
 *      Bad:  "Gains 1 PRECOGNITION for every 10% excess."
 *      Good: "Gains PRECOGNITION for every 10% excess.", "Gains 2 PRECOGNITION for every 10% excess."
 *
 * 5. When referencing another entry, write its name exactly as defined in that entry's
 *    `name` field, including case. The keyword dictionary matches names verbatim to
 *    highlight terms and link tooltips, so any variation breaks the integration.
 *      Bad:  "Gains Radiance.", "Enters weapons deployed.", "Raises the DIVINE SPARKS."
 *      Good: "Gains RADIANCE.", "Enters WEAPONS DEPLOYED.", "Raises DIVINE SPARK."
 *
 * 6. Use the verb pair that matches the kind of value being changed (increase / decrease):
 *      Resource categories (RESOURCES, LIMITED RESOURCES, etc.)   restores / consumes
 *      LIMITED RESOURCES                                          replenishes / loses
 *      LIMITED RESOURCES caps (MAX HEALTH, MAX MANA, etc.)        raises / lowers
 *      OVERFLOWN RESOURCES, FREE RESOURCES, MITIGATION RESOURCES  gains / loses
 *      STARS                                                      gains / loses
 *      Fixed resources                                            raises / lowers
 *      Ranked resources                                           raises / lowers, followed by "rank"
 *      Global resources                                           PROVIDENCE as fixed, DEFILEMENT as ranked
 *      DAMAGE MODIFIERS, SPIRITUAL ORDINANCES                     raises / lowers
 *      ATTRIBUTES                                                 raises / lowers
 *      Good: "Restores RESOURCES.", "Replenishes ENLIGHTENMENT.", "Gains MOONSHINE.",
 *            "Raises DYNAMO by 10%.", "Raises STARGATE rank by 1.", "Lowers WEAKNESS by 10%.",
 *            "Raises STRENGTH by 1."
 *    Exceptions:
 *      - Use "sets" when a value becomes another regardless of its current value.
 *          "Sets MAX HEALTH to 0."
 *      - Use "converts" when a resource is turned into another resource within the same sentence.
 *          "Converts all RED STARS into WHITE STARS."
 *      - Use "spends" when a value is used up to trigger an effect and "converts" does not apply.
 *          "Spends MOONSHINE to increase the base damage dealt."
 *      - Use "halves" when a value is reduced to half of its current amount.
 *          "Halves current HEALTH."
 *      - In SHADOW SORCERER entries, use "burns" for removing resources, unless the resource cannot
 *        be burned, or it is part of a list that includes a resource that cannot be burned; in
 *        those cases, use "extinguishes".
 *          "Burns RESOURCES on all entities.", "Extinguishes all SHADOWFLAME on self."
 *      - When several ranked resources share one operation, list them and write "ranks" once
 *        at the end instead of repeating "rank" after each.
 *          "Sets STARGATE, CONSTELLATION, AZURE CONSTELLATION, and CRIMSON CONSTELLATION ranks to 0."
 *      - Use "grants" where "gains" would apply, but the receiver is an entity other than self.
 *          "Grants DISSONANCE to the opponent."
 *      - Likewise, use "depletes" where "loses" would apply, but the loss is inflicted by an
 *        effect on a named entity rather than simply happening to self.
 *          "Spends PROPHECY OF DOOM to deplete the entity's PRECOGNITION, then MANA."
 *      - Use "reduces" / "increases" when the verbs above do not fit grammatically, such as in
 *        DAMAGE TYPES and TARNISHMENT TYPES entries, where the damage itself is the subject.
 *          "Reduces the target's HEALTH.", "Reduces the target's MAX ENLIGHTENMENT."
 *
 * 7. When an effect replenishes a LIMITED RESOURCE but cannot make it overflow, write
 *    "missing" before the resource name.
 *      Bad:  "Replenishes ENLIGHTENMENT." (when capped at MAX ENLIGHTENMENT)
 *      Good: "Replenishes missing ENLIGHTENMENT."
 *
 * 8. When damage or tarnishment is mentioned explicitly, use "deals" / "takes" for damage and
 *    "inflicts" / "receives" for tarnishment.
 *      Bad:  "Inflicts PHYSICAL DAMAGE.", "Takes TRUE TARNISHMENT."
 *      Good: "Deals PHYSICAL DAMAGE.", "Takes TRUE DAMAGE.", "Inflicts PHYSICAL TARNISHMENT.",
 *            "Receives TRUE TARNISHMENT."
 *
 * 9. Use "enters" / "exits" for STATES. Use "grants" when an entity other than self enters a state.
 *      Bad:  "Removes this state.", "Gains GUARDING.", "The opponent enters ANOINTED PROXY."
 *      Good: "Enters GUARDING state.", "At TURN START, exits this state.",
 *            "Grants ANOINTED PROXY to the opponent."
 *
 * 10. Refer to entities as follows:
 *      - Always specify which entity is affected, unless the verb already makes it explicit
 *        ("gains", "spends", "sets", "enters", "exits", "deals", "takes", "inflicts", "receives").
 *        "Sets" only names the entity when it is someone other than self. In ACTIONS, "replenishes"
 *        also counts as explicit.
 *      - In STATES, ELEMENTAL CRYSTALS elements, EDICTS, RUNES, and BLASPHEMIES entries, assume
 *        self; only specify the entity when it is someone else.
 *          "Raises DAMAGE REDUCTION by 50%." (GUARDING), "Raises DEFENSE by MOONLIGHT." (FROST)
 *      - For DAMAGE MODIFIERS, SPIRITUAL ORDINANCES, and ATTRIBUTES being changed, assume self
 *        unless stated otherwise. ATTRIBUTES used as a scaling source still name their owner.
 *          "Raises WEAKNESS and FRAGILITY equal to the entity's BAD OMEN."
 *          "Raises DEFENSE by the user's STRENGTH."
 *      - When a rate counts an amount the entity holds ("for every"), write "X on self" (or
 *        "X on the battlefield" for GLOBAL RESOURCES) instead of the possessive form.
 *          Bad:  "Raises STRENGTH for every 5% of the entity's DIVINE SPARK."
 *          Good: "Raises STRENGTH for every 5% DIVINE SPARK on self."
 *                "Gains INSPIRATION for every 10% PROVIDENCE on the battlefield."
 *      - FIXED RESOURCES, LIMITED RESOURCES, and CONDITION avoid "on self"; name their owner
 *        with the possessive form instead ("the user's", "the entity's", "the target's", etc.),
 *        unless the entry already assumes self. The exception is an amount counted by a rate ("for every").
 *          "Raises the user's DYNAMO and OVERHEAT by 10%." (LASER)
 *          "Raises STRENGTH for every 5% DIVINE SPARK on self."
 *      - With "converts" (X into Y), specify X's entity when the other rules require it, but only
 *        specify Y's entity when it ends up with a different entity than X.
 *          "At TURN START, converts all CONJECTURE on self into PRECOGNITION."
 *        STARS converted into other STARS always stay with the same entity, so neither side is
 *        specified, unless it is an ACTION.
 *          "At RED STARFALL, converts all RED STARS into WHITE STARS."
 *          "Converts all GRAY STARS on self into WHITE STARS." (CHART)
 *      - With "halves", use "the user's" (in ACTIONS) or "the entity's" (elsewhere) instead of
 *        "on self".
 *          "Halves the user's current HEALTH."
 *      - Self: use "self" for values that are changed by the effect, such as resources being
 *        restored, consumed, or transformed.
 *          "Consumes all RESOURCES on self.", "Loses all HALO on self.", "Restores RESOURCES on self."
 *      - User / entity: use "the user's" (in ACTIONS) or "the entity's" (elsewhere) for values
 *        that an effect scales on or converts from, but that are not changed by it.
 *          "Deals PHYSICAL DAMAGE equal to the user's STRENGTH."
 *          "Raises REVELATION by the entity's INSPIRATION."
 *      - Opponent: in OFFENSIVE ACTIONS and in DAMAGE TYPES / TARNISHMENT TYPES entries, use
 *        "target", since they carry offensive intent (even when they can affect self).
 *        Everywhere else, including class AI entries, use "opponent".
 *          "Reduces the target's HEALTH." (DAMAGE TYPES)
 *          "Raises the opponent's BAD OMEN by 30%." (elsewhere)
 *      - Multiple entities: use "all entities", with "to" after "restores" and "on" otherwise.
 *          "Restores RESOURCES to all entities.", "Burns RESOURCES on all entities."
 *      - Battlefield: use "the battlefield" for GLOBAL RESOURCES, since they belong to the
 *        battlefield rather than to any entity.
 *          "Raises the battlefield's PROVIDENCE by 2.5%."
 *      - Master: use "the master" for the owner of STARS.
 *          "Consumes the master's RESOURCES equal to normal ORANGE STARS converted."
 *      - Player: use "player" for general definitions outside of a MATCH or of any specific class.
 *          "During SETUP, players have 10 points to distribute freely."
 *      - PLAYER ONE / PLAYER TWO: use only when referring to that specific player.
 *      - Prefer the possessive form ("the opponent's X") over a prepositional one ("X on the
 *        opponent"), except with "self", which always uses "on self", even after "restores".
 *          Bad:  "PROVIDENCE on the battlefield", "BAD OMEN on the opponent", "RESOURCES to self"
 *          Good: "the battlefield's PROVIDENCE", "the opponent's BAD OMEN", "HALO on self",
 *                "Restores RESOURCES on self."
 *      - "their" / "its" may replace a repeated entity term, as long as the meaning stays clear.
 *          "When reducing the target's ENLIGHTENMENT below 0, raises their TARNISHED SIN instead."
 *
 * 11. When referring to amounts of a LIMITED RESOURCE:
 *      - Use "missing" for the gap between its max and its current amount.
 *          "Replenishes missing MANA by 30% of the user's MAX MANA."
 *      - Use "current" for the filled amount, explicitly excluding its OVERFLOWN RESOURCES.
 *          "Halves the user's current HEALTH." (SACRIFICE)
 *      - Use "total" to include its OVERFLOWN RESOURCES, only where leaving it out would be
 *        ambiguous, such as effects modeled on SACRIFICE.
 *          "Halves the user's total HEALTH." (LUNAR SHED)
 *          "Halves the entity's total ENLIGHTENMENT." (EDICT OF ANGELS)
 *
 * 12. Use these verbs when something becomes available:
 *      - "enables" when an entry passively causes a unique UI segment to be displayed.
 *          "Enables RUNIC ARRAY." (VISIONARY), "Enables the CODEX OF BLASPHEMY."
 *      - "enables" / "disables" when effects are turned on or off.
 *          "Enables the effects of FROST, NATURE, …" (SHATTERED), "Disables LUNACY's FRAGILITY."
 *      - "unlocks" when an option becomes selectable.
 *          "Unlocks EDICT OF ANGELS."
 *      - "adds" for BATTLE PHASES, stating where in the current ROUND cycle they are added. Name
 *        the entity whose phase is referenced, even in entries that otherwise assume self.
 *          "Adds MOON PHASE to the current ROUND cycle before ROUND END."
 *          "Adds SINGULARITY to the current ROUND cycle after the entity's STARFALL."
 *
 * 13. When mixing percentages and integers:
 *      - When changing an integer by a percentage, state what the percentage is taken from, since
 *        an integer can only change by an integer amount. It can be the value itself.
 *          Bad:  "Lowers STRENGTH by 30%."
 *          Good: "Lowers STRENGTH by 30% of itself.", "Replenishes HEALTH by 15% of MAX HEALTH."
 *      - When turning an integer into a percentage, state what it is compared against, unless it
 *        is the missing amount of a LIMITED RESOURCE (compared against its max implicitly).
 *          "Raises DAMAGE REDUCTION by the percentage of MAX HEALTH filled by BLOOD SACRIFICE."
 *          "Raises DAMAGE REDUCTION by the missing HEALTH percentage."
 *      - For values displayed as percentages (FIXED RESOURCES, PROVIDENCE, DAMAGE MODIFIERS,
 *        SPIRITUAL ORDINANCES), use percentages for direct additions and subtractions, and
 *        fractions for scaling.
 *          "Raises DYNAMO by 10%." (10% + 10% = 20%)
 *          "Raises MALEDICTION by half the missing ENLIGHTENMENT percentage." (66% / 2 = 33%)
 */

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
            "A highly complex turn-based combat game. In every ROUND of a MATCH, both players are granted a TURN on which they may choose at least one of a series of ACTIONS to execute. A MATCH ends when either player's HEALTH or MAX HEALTH reaches 0, granting victory to the surviving player, or ending in a draw. During SETUP, players may select whose TURN comes first on every ROUND, distribute BASE ATTRIBUTES points, and select each player's CONTROLLER. Pressing START ends SETUP and begins a MATCH.",
    },

    [effectKeys.PROGRESSION_MODE]: {
        name: "PROGRESSION MODE",
        type: entryTypes.MECHANIC,
        description:
            "In this mode, the player faces a series of battles against SIMPLE GAME's autonomous AIs. While enabled, PLAYER ONE is forced into HUMAN (manual) control, while PLAYER TWO is blocked from utilizing a non-AI CONTROLLER. Furthermore, PLAYER TWO always starts and always has its ATTRIBUTES distribution mode set to CHALLENGE. Additionally, most base ACTIONS are locked until defeating the corresponding enemy, save for ATTACK, GUARD, HEAL, and SPECIAL ATTACK. Lastly, a new enemy AI, its GLOSSARY entry, and related tooltips can only be unlocked upon defeating the preceding enemy.",
    },

    [effectKeys.SHORTCUTS]: {
        name: "SHORTCUTS",
        type: entryTypes.MECHANIC,
        description:
            "SIMPLE GAME comes equipped with a few shortcuts for an improved game experience. Pressing P during SETUP switches WHO STARTS the MATCH. Pressing SPACE starts a MATCH. While inside a MATCH, pressing SPACE pauses or unpauses the MATCH instead, which puts automatic phases on hold. Clicking with the MOUSE WHEEL on nearly anything spawns a TOOLTIP containing its description. Hovering over any ACTIONS simulates its effects. Holding SHIFT simulates TURN END and STARFALL effects, which can be combined with hover simulations. Pressing F during a MATCH cycles through game speed settings (1x/2x/4x), increasing the speed of animations and transitions. Pressing 1/2/3/4 directly sets speed settings to 1x/2x/4x/Inf. Pressing Z/X undoes or redoes the previous action on the current TURN; with a max of 99 undoable actions or combat interactions. Pressing G/H/C opens or closes GLOSSARY / HISTORY / CODE INSERT. Pressing R while holding SHIFT restarts a MATCH. Pressing R while holding ALT resets a MATCH and returns to the SETUP screen.",
    },

    [turnStatus.SETUP]: {
        name: "SETUP",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A pre-MATCH phase where players can distribute their BASE ATTRIBUTES and adjust settings.",
    },

    [effectKeys.CONTROLLER]: {
        name: "CONTROLLER",
        type: entryTypes.MECHANIC,
        description:
            "Determines how each player's ACTIONS and other combat interactions are decided. Includes HUMAN, WARLOCK, BLOODKNIGHT, PALADIN, SHADOW SORCERER, CYBORG, MAESTRO, AUGUR, VOYAGER, LUNATIC, and SERAPH. Selecting HUMAN allows a player to be manually controlled. Selecting any other option leaves control in the hands of an AI.",
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
            "A complete SIMPLE GAME battle. A MATCH can end in VICTORY, DRAW, or DEFEAT for any player.",
    },

    [effectKeys.ROUND]: {
        name: "ROUND",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A full MATCH cycle. A basic ROUND consists of: ROUND START, PLAYER ONE TURN, PLAYER TWO TURN, and ROUND END, but can be extended via additional phases.",
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
            "A player's active cycle. It can be subdivided into three phases: TURN START, ACTION PHASE, and TURN END. Every player has a single TURN per ROUND.",
    },

    [effectKeys.TURN_START]: {
        name: "TURN START",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where certain effects are applied. In this subphase, combat effects are applied in the following order: HALLOWED ECHOES, IRRADIATION, FAULTY FIRMAMENT, FRACTURED DOME, HARMONY, ENERGY BARRIER, STARDUST, MYCELIUM, CONJECTURE, SHADOWFLAME, LINGERING EMBER, ARMORED DEPLOYMENT, REFRACTED DIVINITY, HALO, INSIGHT, SANCTUARY, MOTES OF CREATION, HEAVENLY CHOIRS, STIGMATA, and finally, GUARDING, RADIANT, DARK EMBRACE, DIMMING DARKNESS, PRISMATIC, EVENT HORIZON, IMMACULATE, CEREMONIAL, MOON DEW and GIBBOUS clearance.",
    },

    [effectKeys.ACTIVE_PHASE]: {
        name: "ACTION PHASE",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where a player may use combat interactions. This subphase ends upon utilizing any of the available ACTIONS, unless it is a FREE ACTION.",
    },

    [effectKeys.TURN_END]: {
        name: "TURN END",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A TURN subphase where certain effects are applied. In this subphase, combat effects are applied in the following order: SACRED FLAMES, INSPIRATION, MARTYR, SACRILEGE, PENITENCE, MOTES OF RUIN, BAD OMEN, SHATTERED, MANA OVERFLOW, DISSONANCE, RADIANCE, MOONSHINE, GRAVITATION, ACCRETION, STARGATE, CONSTELLATION, AZURE CONSTELLATION, and CRIMSON CONSTELLATION.",
    },

    [entryTypes.ACTION]: {
        name: "ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "Abilities a player may choose to use during the ACTION PHASE of their TURN. Can be subdivided into OFFENSIVE ACTIONS, DEFENSIVE ACTIONS, and TRANSFORMATIVE ACTIONS. Most ACTIONS automatically advance the TURN phase to TURN END, unless it is a FREE ACTION. A player's base ACTIONS include: ATTACK, GUARD, HEAL, SPECIAL ATTACK, SACRIFICE, AEGIS, SHADOW PACT, DEPLOY, ATTUNE, CARVE, CHART, and REFRACT.",
    },

    [entryTypes.OFFENSIVE_ACTION]: {
        name: "OFFENSIVE ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ACTIONS. Includes ATTACK, SPECIAL ATTACK, SACRIFICE, BLACK MAYHEM, LASER, MELTDOWN, LUNAR STRIKE, LUNAR SMITE, LUNAR SHED, CHALK, and CONDEMN.",
    },

    [entryTypes.DEFENSIVE_ACTION]: {
        name: "DEFENSIVE ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ACTIONS. Includes GUARD, HEAL, AEGIS, SHADOW MANTLE, RITUAL OF ASH, LUNAR GROWTH, LUNAR TIDE, LUNAR SHROUD, and SUPPLICATE.",
    },

    [entryTypes.TRANSFORMATIVE_ACTION]: {
        name: "TRANSFORMATIVE ACTIONS",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ACTIONS. Includes DEPLOY, ATTUNE, DA CAPO, THE SOUND OF SILENCE, BABEL, SHADOW PACT, DARK PROMISE, CARVE, CURSE, CHART, REFRACT, MIRROR, SHATTER, RISE, ASCEND, JUDGEMENT, DISCERN, and ATONE.",
    },

    [effectKeys.HEALTH]: {
        name: "HEALTH",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped at MAX HEALTH. Starts at max capacity. Cannot replenish HEALTH above the limit. When HEALTH reaches 0, loses the MATCH.",
    },

    [effectKeys.MAX_HEALTH]: {
        name: "MAX HEALTH",
        type: entryTypes.MECHANIC,
        description:
            "Starts at 20. Limits how much HEALTH a player can hold. If MAX HEALTH is 0 or lower, loses the MATCH.",
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
        description: "Starts at 10. Limits how much MANA a player can hold.",
    },

    [effectKeys.MANA_OVERFLOW]: {
        name: "MANA OVERFLOW",
        type: entryTypes.OVERFLOWN_RESOURCE,
        description:
            "When losing MANA, loses MANA OVERFLOW on self first. At TURN END, loses all MANA OVERFLOW on self and takes TRUE DAMAGE equal to the amount lost.",
    },

    [entryTypes.ATTRIBUTES]: {
        name: "ATTRIBUTES",
        type: entryTypes.CATEGORY,
        description:
            "Can be subdivided into BASE ATTRIBUTES and SPECIAL ATTRIBUTES. When raising or lowering ATTRIBUTES via combat effects, raises or lowers only BASE ATTRIBUTES.",
    },

    [entryTypes.BASE_ATTRIBUTES]: {
        name: "BASE ATTRIBUTES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ATTRIBUTES. Includes STRENGTH and DEFENSE. During setup, players have 10 points to distribute freely between their BASE ATTRIBUTES. When raising or lowering BASE ATTRIBUTES via combat effects, alternates between each attribute, starting with STRENGTH.",
    },

    [effectKeys.STR]: {
        name: "STRENGTH",
        type: entryTypes.BASE_ATTRIBUTES,
        description:
            "The main offensive BASE ATTRIBUTES. Increases the damage dealt by certain ACTIONS.",
    },

    [effectKeys.DEF]: {
        name: "DEFENSE",
        type: entryTypes.BASE_ATTRIBUTES,
        description:
            "The main defensive BASE ATTRIBUTES. Decreases the PHYSICAL DAMAGE taken.",
    },

    [entryTypes.SPECIAL_ATTRIBUTES]: {
        name: "SPECIAL ATTRIBUTES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of ATTRIBUTES. Includes ENERGY LEVEL, MOONLIGHT, REVELATION, and FORTITUDE.",
    },

    [entryTypes.DAMAGE_TYPE]: {
        name: "DAMAGE TYPES",
        type: entryTypes.CATEGORY,
        description:
            "A property that defines how the resulting damage will be calculated. Includes PHYSICAL DAMAGE, PIERCING DAMAGE, TRUE DAMAGE, and LUNIC DAMAGE. All damage taken has a minimum of 1, regardless of DAMAGE TYPES, DEFENSE, or DAMAGE MODIFIERS.",
    },

    [dmgTypes.PHYSICAL]: {
        name: "PHYSICAL DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's HEALTH. Can be blocked by DEFENSE, affected by DAMAGE MODIFIERS, or mitigated by MITIGATION RESOURCES.",
    },

    [dmgTypes.PIERCING]: {
        name: "PIERCING DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's HEALTH. Ignores DEFENSE, but can be affected by DAMAGE MODIFIERS and mitigated by MITIGATION RESOURCES.",
    },

    [dmgTypes.TRUE]: {
        name: "TRUE DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's HEALTH. Cannot be blocked by DEFENSE, affected by DAMAGE MODIFIERS, or mitigated by MITIGATION RESOURCES.",
    },

    [entryTypes.DAMAGE_MODIFIERS]: {
        name: "DAMAGE MODIFIERS",
        type: entryTypes.CATEGORY,
        description:
            "A set of special values that affect the final PHYSICAL DAMAGE and PIERCING DAMAGE dealt by a player. Includes DAMAGE REDUCTION, DAMAGE BONUS, WEAKNESS, and FRAGILITY.",
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
            "A persistent effect that applies only to a singular entity. Includes GUARDING, TUTORIAL, CEREMONIAL, RADIANT, UMBRAL CORE, BLEAK DECEPTION, DARK EMBRACE, DIMMING DARKNESS, ARMORED DEPLOYMENT, WEAPONS DEPLOYED, THERMAL OVERLOAD, RESONANT, VISIONARY, STARGAZER, EVENT HORIZON, SELENIAN, PRISMATIC, MOON DEW, GIBBOUS, ZENITH OF MORTALITY, ABANDONED BY GRACE, ANOINTED PROXY, ASCENDENCE OF SPIRIT, CUTOFF WINGS, and IMMACULATE.",
    },

    [effectKeys.CONDITION]: {
        name: "CONDITION",
        type: entryTypes.MECHANIC,
        description:
            "A player's current status in a MATCH. Includes ATTRIBUTES, RESOURCES, STATES, and other special mechanics. When a player's condition is deleted, the player loses the MATCH.",
    },

    [entryTypes.BATTLE_PHASE]: {
        name: "BATTLE PHASES",
        type: entryTypes.CATEGORY,
        description: "A subsection of a MATCH.",
    },

    [entryTypes.RESOURCE]: {
        name: "RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "Can be subdivided into FREE RESOURCES, LIMITED RESOURCES, OVERFLOWN RESOURCES, MITIGATION RESOURCES, RANKED RESOURCES, FIXED RESOURCES, and GLOBAL RESOURCES. Abilities that restore RESOURCES restore LIMITED RESOURCES, FREE RESOURCES, and MITIGATION RESOURCES in this order. Abilities that consume RESOURCES follow the reverse order. Abilities that extinguish or burn RESOURCES follow the same rules as consumption.",
    },

    [entryTypes.FREE_RESOURCE]: {
        name: "FREE RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that have no upper cap. Includes SACRED FLAMES, MOTES OF CREATION, MOTES OF RUIN, INSPIRATION, PENITENCE, MARTYR, SACRILEGE, RADIANCE, MOONSHINE, STARDUST, PROPHECY OF DOOM, PRECOGNITION, DISSONANCE, CINDERS, and SHADOWFLAME. When restoring FREE RESOURCES, restores them in this order. When consuming FREE RESOURCES, consumes them in reverse order.",
    },

    [entryTypes.LIMITED_RESOURCE]: {
        name: "LIMITED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that have a variable upper cap. Includes HEALTH, BLOOD SACRIFICE, UNRELENTING SHADOWS, MANA, and ENLIGHTENMENT. When LIMITED RESOURCES are restored, they are restored in this order. When LIMITED RESOURCES are consumed, they are consumed in reverse order. When consuming LIMITED RESOURCES, consumes their corresponding OVERFLOWN RESOURCES first. When restoring LIMITED RESOURCES above the limit, if they have an overflow rule, follows that rule; otherwise, continues to the following RESOURCES on the list. When LIMITED RESOURCES are capped at 0, does not restore them; instead, continues to the following RESOURCES on the list.",
    },

    [entryTypes.OVERFLOWN_RESOURCE]: {
        name: "OVERFLOWN RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that can be gained when restoring LIMITED RESOURCES above their cap. Includes INSIGHT, SILVER BLOOD, and MANA OVERFLOW. When consuming LIMITED RESOURCES, consumes the corresponding OVERFLOWN RESOURCES first.",
    },

    [entryTypes.FIXED_RESOURCE]: {
        name: "FIXED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that vary within a fixed range and are displayed as percentages. Includes DIVINE SPARK, OVERHEAT, DYNAMO, SONORITY, BAD OMEN, RECOLLECTION, GRAVITATION, ACCRETION, IRRADIATION, LUNACY, HALLOWED ECHOES, and TARNISHED SIN.",
    },

    [entryTypes.MITIGATION_RESOURCE]: {
        name: "MITIGATION RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that mitigate damage or tarnishment received. Includes SANCTUARY, FAULTY FIRMAMENT, FRACTURED DOME, WISDOM, HALO, REFRACTED DIVINITY, CONJECTURE, ENERGY BARRIER, FUNERARY URN, LINGERING EMBER, HARMONY and MYCELIUM. When consuming this type of resource, consumes them in this order.",
    },

    [entryTypes.RANKED_RESOURCE]: {
        name: "RANKED RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are rank-based and displayed as Roman numerals. Includes STARGATE, CONSTELLATION, AZURE CONSTELLATION, CRIMSON CONSTELLATION, and STIGMATA.",
    },

    [entryTypes.GLOBAL_RESOURCE]: {
        name: "GLOBAL RESOURCES",
        type: entryTypes.CATEGORY,
        description:
            "A subset of RESOURCES that are shared between players. Includes PROVIDENCE and DEFILEMENT.",
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
            "Allows the player to utilize ACTIONS and other combat interactions. Does not trigger TURN START and TURN END effects. Ends when using any ACTIONS that are not a FREE ACTION.",
    },

    [effectKeys.FREE_ACTION]: {
        name: "FREE ACTION",
        type: entryTypes.MECHANIC,
        description:
            "A special category of ACTIONS that don't end a player's ACTION PHASE.",
    },
};

export const WARLOCK_DESCRIPTIONS = {
    [aiKeys.WARLOCK]: {
        name: "WARLOCK",
        type: entryTypes.CONTROLLER,
        description:
            "The first challenge. Focuses on the use of SPECIAL ATTACK and on replenishing MANA for maximizing its damage, utilizing HEAL or GUARD when at low HEALTH. In PROGRESSION MODE, defeating this enemy unlocks the BLOODKNIGHT enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.ATTACK]: {
        name: "ATTACK",
        type: entryTypes.OFFENSIVE_ACTION,
        description: "Deals PHYSICAL DAMAGE equal to the user's STRENGTH.",
    },

    [actionKeys.GUARD]: {
        name: "GUARD",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Replenishes missing MANA by 30% of the user's MAX MANA. Enters GUARDING state.",
    },

    [effectKeys.GUARDING_STATE]: {
        name: "GUARDING",
        type: entryTypes.STATE,
        description:
            "Raises DAMAGE REDUCTION by 50%. At TURN START, exits this state.",
    },

    [actionKeys.HEAL]: {
        name: "HEAL",
        type: entryTypes.DEFENSIVE_ACTION,
        description: "Spends MANA to replenish missing HEALTH.",
    },

    [actionKeys.SPECIAL_ATTACK]: {
        name: "SPECIAL ATTACK",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Spends MANA equal to 60% of the user's MAX MANA. Deals PIERCING DAMAGE equal to the user's STRENGTH. If the user's MANA is higher than the target's, increases final damage dealt and replenishes the target's MANA by the difference. If the user's MANA is lower than the target's, decreases final damage dealt and replenishes MANA by the difference. Cannot use this ability if the user doesn't have enough MANA to be spent, or if their MAX MANA is 0.",
    },
};

export const BLOODKNIGHT_DESCRIPTIONS = {
    [aiKeys.BLOODKNIGHT]: {
        name: "BLOODKNIGHT",
        type: entryTypes.CONTROLLER,
        description:
            "The second challenge. Uses SACRIFICE to increase its own STRENGTH, utilizing ATTACK and SPECIAL ATTACK to pressure the opponent or DEFENSIVE ACTIONS when at low HEALTH. In PROGRESSION MODE, defeating this enemy unlocks the SACRIFICE action and the PALADIN enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS. In PROGRESSION MODE, if this enemy hasn't been defeated yet, enters TUTORIAL state at the beginning of the MATCH.",
    },

    [effectKeys.TUTORIAL]: {
        name: "TUTORIAL",
        type: entryTypes.STATE,
        description: "This is a tutorial enemy. Sets DAMAGE REDUCTION to 0%.",
    },

    [actionKeys.SACRIFICE]: {
        name: "SACRIFICE",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Enters CEREMONIAL state. Then, halves the user's current HEALTH.",
    },

    [effectKeys.CEREMONIAL]: {
        name: "CEREMONIAL",
        type: entryTypes.STATE,
        description:
            "When losing HEALTH, converts the HEALTH lost into BLOOD SACRIFICE. At TURN START, exits this state.",
    },

    [effectKeys.BLOOD_SACRIFICE]: {
        name: "BLOOD SACRIFICE",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped by MAX HEALTH. Cannot be replenished. Clogs the HEALTH bar, preventing further healing. Raises ATTRIBUTES by the entity's BLOOD SACRIFICE. Raises DAMAGE REDUCTION by the percentage of the entity's MAX HEALTH filled by BLOOD SACRIFICE. When using HEAL, converts all the entity's BLOOD SACRIFICE back into HEALTH.",
    },
};

export const PALADIN_DESCRIPTIONS = {
    [aiKeys.PALADIN]: {
        name: "PALADIN",
        type: entryTypes.CONTROLLER,
        description:
            "The third challenge. Focuses on the use of AEGIS to build up DIVINE SPARK, utilizing ATTACK to deal damage and dispose of harmful RADIANCE when suitable; after building enough DIVINE SPARK, shifts focus to SPECIAL ATTACK, utilizing AEGIS to restore RESOURCES via DIVINE SPARK overflow rules. In PROGRESSION MODE, defeating this enemy unlocks the AEGIS action and the SHADOW SORCERER enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.AEGIS]: {
        name: "AEGIS",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Gains HALO equal to twice the user's DEFENSE. Enters RADIANT state. At 0 or less DEFENSE, replaces AEGIS with RISE.",
    },

    [effectKeys.RADIANT]: {
        name: "RADIANT",
        type: entryTypes.STATE,
        description:
            "While on this state, sets DEFENSE to 0. At TURN START, exits this state.",
    },

    [effectKeys.HALO]: {
        name: "HALO",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends HALO to decrease the damage taken, then gains RADIANCE equal to the amount spent. At TURN START, loses all HALO on self, then raises the entity's DIVINE SPARK by 1% for every HALO lost this way.",
    },

    [effectKeys.RADIANCE]: {
        name: "RADIANCE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using ATTACK, spends all RADIANCE to increase the final damage dealt. At TURN END, loses all RADIANCE on self and takes TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.DIVINE_SPARK]: {
        name: "DIVINE SPARK",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises STRENGTH for every 5% DIVINE SPARK on self. When raising DIVINE SPARK above 100%, restores RESOURCES on self for every 2% excess.",
    },
};

export const SHADOW_SORCERER_DESCRIPTIONS = {
    [aiKeys.SHADOW_SORCERER]: {
        name: "SHADOW SORCERER",
        type: entryTypes.CONTROLLER,
        description:
            "The fourth challenge. Focuses on managing SHADOWFLAME, using SHADOW MANTLE to restore RESOURCES when at low amounts, and RITUAL OF ASH to convert SHADOWFLAME when at risk of losing control; uses BLACK MAYHEM to build CINDERS and pressure the opponent, eventually finishing with either BLACK MAYHEM burning or a DARK PROMISE restoration bomb. In PROGRESSION MODE, defeating this enemy unlocks the SHADOW PACT action, alongside the CYBORG enemy and the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.SHADOW_PACT]: {
        name: "SHADOW PACT",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Exits all STATES. Enters UMBRAL CORE. Gains SHADOWFLAME equal to the user's STRENGTH. Gains LINGERING EMBER equal to the user's DEFENSE. Sets MAX UNRELENTING SHADOWS to 15.",
    },

    [effectKeys.UMBRAL_CORE]: {
        name: "UMBRAL CORE",
        type: entryTypes.STATE,
        description:
            "Replaces all ACTIONS with BLACK MAYHEM, SHADOW MANTLE, RITUAL OF ASH, and DARK PROMISE. Upon exiting this state, extinguishes all SHADOWFLAME, LINGERING EMBER, UNRELENTING SHADOWS and CINDERS and sets MAX UNRELENTING SHADOWS to 0. When losing all SHADOWFLAME and LINGERING EMBER due to external effects, exits UMBRAL CORE and enters BLEAK DECEPTION.",
    },

    [effectKeys.BLEAK_DECEPTION]: {
        name: "BLEAK DECEPTION",
        type: entryTypes.STATE,
        description: "Cannot use SHADOW PACT. Cannot exit this state.",
    },

    [effectKeys.SHADOWFLAME]: {
        name: "SHADOWFLAME",
        type: entryTypes.FREE_RESOURCE,
        description:
            "Cannot be burned. At TURN START, burns RESOURCES on self equal to the entity's SHADOWFLAME. Then, gains SHADOWFLAME equal to the amount burned.",
    },

    [effectKeys.LINGERING_EMBER]: {
        name: "LINGERING EMBER",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "Cannot be burned. When taking PHYSICAL DAMAGE or PIERCING DAMAGE, extinguishes LINGERING EMBER on self to reduce the damage taken. At TURN START, extinguishes half the LINGERING EMBER on self. Then, gains SHADOWFLAME equal to the amount extinguished.",
    },

    [effectKeys.UNRELENTING_SHADOWS]: {
        name: "UNRELENTING SHADOWS",
        type: entryTypes.LIMITED_RESOURCE,
        description: "Capped at MAX UNRELENTING SHADOWS. Starts at 0.",
    },

    [effectKeys.MAX_UNRELENTING_SHADOWS]: {
        name: "MAX UNRELENTING SHADOWS",
        type: entryTypes.MECHANIC,
        description:
            "Starts at 0. Limits how much UNRELENTING SHADOWS a player can hold.",
    },

    [actionKeys.BLACK_MAYHEM]: {
        name: "BLACK MAYHEM",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Burns RESOURCES on all entities equal to the user's SHADOWFLAME. Gains CINDERS equal to the total amount burned. When burning CINDERS, does not gain CINDERS.",
    },

    [effectKeys.CINDERS]: {
        name: "CINDERS",
        type: entryTypes.FREE_RESOURCE,
        description: "No effect.",
    },

    [actionKeys.SHADOW_MANTLE]: {
        name: "SHADOW MANTLE",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Restores RESOURCES on self equal to the user's SHADOWFLAME. Enters DARK EMBRACE.",
    },

    [effectKeys.DARK_EMBRACE]: {
        name: "DARK EMBRACE",
        type: entryTypes.STATE,
        description:
            "At TURN START, disables SHADOWFLAME effects, then exits this state.",
    },

    [actionKeys.RITUAL_OF_ASH]: {
        name: "RITUAL OF ASH",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Extinguishes all SHADOWFLAME on self. Gains LINGERING EMBER equal to half the amount extinguished.",
    },

    [actionKeys.DARK_PROMISE]: {
        name: "DARK PROMISE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Restores RESOURCES to all entities equal to the user's SHADOWFLAME. Then, exits UMBRAL CORE and enters DIMMING DARKNESS.",
    },

    [effectKeys.DIMMING_DARKNESS]: {
        name: "DIMMING DARKNESS",
        type: entryTypes.STATE,
        description:
            "At TURN END, disables MANA OVERFLOW effects. At TURN START, exits this state.",
    },
};

export const CYBORG_DESCRIPTIONS = {
    [aiKeys.CYBORG]: {
        name: "CYBORG",
        type: entryTypes.CONTROLLER,
        description:
            "The fifth challenge. Focuses on the use of LASER, ending turns with DEFENSIVE ACTIONS for maximizing DYNAMO generation; avoids THERMAL OVERLOAD unless its opponent can be killed via MELTDOWN. In PROGRESSION MODE, defeating this enemy unlocks the DEPLOY action and the MAESTRO enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.DEPLOY]: {
        name: "DEPLOY",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters ARMORED DEPLOYMENT state.",
    },

    [effectKeys.ARMORED_DEPLOYMENT]: {
        name: "ARMORED DEPLOYMENT",
        type: entryTypes.STATE,
        description:
            "Raises DAMAGE REDUCTION by 50%. At TURN START, exits this state and enters WEAPONS DEPLOYED.",
    },

    [effectKeys.WEAPONS_DEPLOYED]: {
        name: "WEAPONS DEPLOYED",
        type: entryTypes.STATE,
        description:
            "Enables ENERGY LEVEL, OVERHEAT, and DYNAMO. Replaces DEPLOY with LASER. Upon exiting this state, sets ENERGY LEVEL to 1 and OVERHEAT and DYNAMO to 0%.",
    },

    [actionKeys.LASER]: {
        name: "LASER",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Deals PIERCING DAMAGE equal to the user's ENERGY LEVEL. Raises the user's DYNAMO and OVERHEAT by 10%. Raises OVERHEAT by an additional 10% for every LASER used this TURN. This is a FREE ACTION.",
    },

    [effectKeys.ENERGY_LEVEL]: {
        name: "ENERGY LEVEL",
        type: entryTypes.SPECIAL_ATTRIBUTES,
        description: "Starts at 1. Scales certain ACTIONS and effects.",
    },

    [effectKeys.DYNAMO]: {
        name: "DYNAMO",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. When raising DYNAMO above 100%, gains ENERGY BARRIER for every 5% excess DYNAMO. At 100% DYNAMO, spends all DYNAMO to raise ENERGY LEVEL by 1.",
    },

    [effectKeys.ENERGY_BARRIER]: {
        name: "ENERGY BARRIER",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends ENERGY BARRIER to reduce the damage taken. At TURN START, loses all ENERGY BARRIER on self, then, raises the entity's DYNAMO by 5% for every ENERGY BARRIER lost.",
    },

    [effectKeys.OVERHEAT]: {
        name: "OVERHEAT",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Can be raised above the cap. Lowers STRENGTH by a percentage of itself equivalent to the entity's OVERHEAT. Raises FRAGILITY by the entity's OVERHEAT. When using DEFENSIVE ACTIONS, lowers the entity's OVERHEAT by 30%, and by an additional 5% for every STRENGTH on self. Then, raises the entity's DYNAMO by the total amount lowered. At 100% or more OVERHEAT, enters THERMAL OVERLOAD.",
    },

    [effectKeys.THERMAL_OVERLOAD]: {
        name: "THERMAL OVERLOAD",
        type: entryTypes.STATE,
        description: "Replaces all ACTIONS with MELTDOWN.",
    },

    [actionKeys.MELTDOWN]: {
        name: "MELTDOWN",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Spends all OVERHEAT and DYNAMO. Deals PHYSICAL DAMAGE equal to the user's ENERGY LEVEL. Increases base damage dealt for every 10% DYNAMO spent. Multiplies base damage dealt by the OVERHEAT spent. Then, exits WEAPONS DEPLOYED and THERMAL OVERLOAD.",
    },
};

export const MAESTRO_DESCRIPTIONS = {
    [aiKeys.MAESTRO]: {
        name: "MAESTRO",
        type: entryTypes.CONTROLLER,
        description:
            "The sixth challenge. Focuses on the use of LASER to shift SONORITY to its extremes; changing focus to BABEL and THE SOUND OF SILENCE when enough SONORITY has been built. In PROGRESSION MODE, defeating this enemy unlocks the ATTUNE action and the AUGUR enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.ATTUNE]: {
        name: "ATTUNE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters RESONANT state. This is a FREE ACTION.",
    },

    [effectKeys.RESONANT]: {
        name: "RESONANT",
        type: entryTypes.STATE,
        description:
            "Enables SONORITY. When SONORITY is at 0%, replaces ATTUNE with DA CAPO. When SONORITY is lower than 0%, replaces ATTUNE with THE SOUND OF SILENCE. When SONORITY is higher than 0%, replaces ATTUNE with BABEL. Upon exiting this state, sets SONORITY back to 0%.",
    },

    [effectKeys.SONORITY]: {
        name: "SONORITY",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Ranges from -75% to +75%. When using DEFENSIVE ACTIONS, raises the entity's SONORITY by 15%. When using OFFENSIVE ACTIONS, lowers the entity's SONORITY by 15%. Raises WEAKNESS and DAMAGE REDUCTION equal to the entity's SONORITY below 0. Raises DAMAGE BONUS and FRAGILITY equal to the entity's SONORITY above 0.",
    },

    [actionKeys.DA_CAPO]: {
        name: "DA CAPO",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Resets the user's CONDITION to how it was at the beginning of the MATCH.",
    },

    [actionKeys.SOUND_OF_SILENCE]: {
        name: "THE SOUND OF SILENCE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Inverts the user's SONORITY. Gains HARMONY for every 10% shift on SONORITY.",
    },

    [effectKeys.HARMONY]: {
        name: "HARMONY",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends HARMONY to reduce the damage taken, then restores RESOURCES to all entities equal to the amount spent. At TURN START, spends HARMONY to replenish the entity's missing HEALTH and missing MANA.",
    },

    [actionKeys.BABEL]: {
        name: "BABEL",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Inverts the user's SONORITY. Consumes RESOURCES on self for every 10% shift on SONORITY. Then, grants DISSONANCE to the opponent equal to the amount consumed.",
    },

    [effectKeys.DISSONANCE]: {
        name: "DISSONANCE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At TURN END, loses all DISSONANCE on self and takes TRUE DAMAGE equal to the amount lost.",
    },
};

export const AUGUR_DESCRIPTIONS = {
    [aiKeys.AUGUR]: {
        name: "AUGUR",
        type: entryTypes.CONTROLLER,
        description:
            "The seventh challenge. Cycles through the use of GUARD to buff itself or SPECIAL ATTACK to deal direct PIERCING DAMAGE, while utilizing HEAL to maintain survivability; eventually detonating RUNES via CURSE to clear debuffs and trigger special effects. In PROGRESSION MODE, defeating this enemy unlocks the CARVE action and the VOYAGER enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
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
            "Enables RUNIC ARRAY. When using GUARD, HEAL, or SPECIAL ATTACK, adds RUNE OF URD, RUNE OF VERDANDI, or RUNE OF SKULD to the RUNIC ARRAY, respectively. Upon exiting this state, detonates all RUNES, starting from the oldest.",
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
            "Includes RUNE OF URD, RUNE OF VERDANDI, and RUNE OF SKULD.",
    },

    [runeKeys.URD]: {
        name: "RUNE OF URD",
        type: entryTypes.RUNES,
        description:
            "Gained from GUARD. Upon acquisition: Raises RECOLLECTION by 50%. While on RUNIC ARRAY: Lowers STRENGTH by 30% of itself. Upon detonation: Replenishes HEALTH by 15% of MAX HEALTH.",
    },

    [effectKeys.RECOLLECTION]: {
        name: "RECOLLECTION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises DAMAGE BONUS equal to the entity's RECOLLECTION. Raises STRENGTH by a percentage of the entity's DEFENSE equivalent to their RECOLLECTION. When raising RECOLLECTION above 100%, gains PRECOGNITION for every 10% excess. When using OFFENSIVE ACTIONS, sets RECOLLECTION to 0%.",
    },

    [effectKeys.PRECOGNITION]: {
        name: "PRECOGNITION",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When MANA falls below MAX MANA, spends PRECOGNITION to replenish the entity's missing MANA. When using SPECIAL ATTACK or HEAL, spends PRECOGNITION before MANA.",
    },

    [runeKeys.VERDANDI]: {
        name: "RUNE OF VERDANDI",
        type: entryTypes.RUNES,
        description:
            "Gained from HEAL. Upon acquisition: Gains CONJECTURE equal to DEFENSE. While on RUNIC ARRAY: Lowers DEFENSE by 30% of itself. Upon detonation: Replenishes 60% of missing MANA and 60% of missing HEALTH.",
    },

    [effectKeys.CONJECTURE]: {
        name: "CONJECTURE",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends CONJECTURE to reduce the damage taken. At TURN START, converts all CONJECTURE on self into PRECOGNITION.",
    },

    [runeKeys.SKULD]: {
        name: "RUNE OF SKULD",
        type: entryTypes.RUNES,
        description:
            "Gained from SPECIAL ATTACK. Upon acquisition: Replenishes missing MANA by 30% of MAX MANA. While on RUNIC ARRAY: Raises WEAKNESS and DAMAGE REDUCTION by 30%. Upon detonation: Raises the opponent's BAD OMEN by 30%.",
    },

    [effectKeys.BAD_OMEN]: {
        name: "BAD OMEN",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises WEAKNESS and FRAGILITY equal to the entity's BAD OMEN. When raising BAD OMEN above 100%, gains PROPHECY OF DOOM for every 5% excess. At TURN END, sets BAD OMEN to 0% and gains PROPHECY OF DOOM for every 5% lowered this way.",
    },

    [effectKeys.PROPHECY_OF_DOOM]: {
        name: "PROPHECY OF DOOM",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When the entity has PRECOGNITION or MANA, spends PROPHECY OF DOOM to deplete their PRECOGNITION, then MANA.",
    },

    [actionKeys.CURSE]: {
        name: "CURSE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Detonates all RUNES, starting from the oldest. Takes TRUE DAMAGE equal to 30% of the user's MAX HEALTH when detonating an empty socket. This is a FREE ACTION. Cannot be used when RUNIC ARRAY is empty.",
    },
};

export const VOYAGER_DESCRIPTIONS = {
    [aiKeys.VOYAGER]: {
        name: "VOYAGER",
        type: entryTypes.CONTROLLER,
        description:
            "The eighth challenge. Focuses on the use of CHART, alongside ORANGE STARS, INDIGO STARS, and VIOLET STARS for maximizing STARS generation and the use of GREEN STARS and BLUE STARS for defensive utility; upon acquiring enough STARS, attempts to kill the opponent using RED STARS, ORANGE STARS, YELLOW STARS, or VIOLET STARS alongside DEFENSIVE ACTIONS to mitigate the STARS effects or OFFENSIVE ACTIONS to maximize damage dealt. In PROGRESSION MODE, defeating this enemy unlocks the CHART action and the LUNATIC enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.CHART]: {
        name: "CHART",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Enters STARGAZER state. Gains 3 WHITE STARS. Converts all GRAY STARS on self into WHITE STARS.",
    },

    [effectKeys.STARGAZER]: {
        name: "STARGAZER",
        type: entryTypes.STATE,
        description:
            "While active, adds STARFALL to the current ROUND cycle after the entity's TURN. Enables a side-menu for assigning STARS. Upon exiting this state, loses all STARS and sets STARGATE, CONSTELLATION, AZURE CONSTELLATION, and CRIMSON CONSTELLATION ranks to 0.",
    },

    [entryTypes.STAR]: {
        name: "STARS",
        type: entryTypes.CATEGORY,
        description:
            "Includes WHITE STARS, GRAY STARS, RED STARS, ORANGE STARS, YELLOW STARS, GREEN STARS, BLUE STARS, INDIGO STARS, and VIOLET STARS. The latter seven are labeled colored STARS and have two forms: normal and augmented. Clicking on the star panel adds or subtracts STARS, converting WHITE STARS into colored STARS and back. Right-clicking adds or subtracts in batches of 10.",
    },

    [effectKeys.STARFALL]: {
        name: "STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description:
            "A special phase where colored STARS act. Divided into seven ordered subphases: RED STARFALL, ORANGE STARFALL, YELLOW STARFALL, GREEN STARFALL, BLUE STARFALL, INDIGO STARFALL, and VIOLET STARFALL. This phase is skipped if the corresponding entity hasn't assigned any STARS.",
    },

    [effectKeys.RED_STARFALL]: {
        name: "RED STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The first subphase of STARFALL, when RED STARS act.",
    },

    [effectKeys.ORANGE_STARFALL]: {
        name: "ORANGE STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The second subphase of STARFALL, when ORANGE STARS act.",
    },

    [effectKeys.YELLOW_STARFALL]: {
        name: "YELLOW STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The third subphase of STARFALL, when YELLOW STARS act.",
    },

    [effectKeys.GREEN_STARFALL]: {
        name: "GREEN STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The fourth subphase of STARFALL, when GREEN STARS act.",
    },

    [effectKeys.BLUE_STARFALL]: {
        name: "BLUE STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The fifth subphase of STARFALL, when BLUE STARS act.",
    },

    [effectKeys.INDIGO_STARFALL]: {
        name: "INDIGO STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description: "The sixth subphase of STARFALL, when INDIGO STARS act.",
    },

    [effectKeys.VIOLET_STARFALL]: {
        name: "VIOLET STARFALL",
        type: entryTypes.BATTLE_PHASE,
        description:
            "The seventh and final subphase of STARFALL, when VIOLET STARS act.",
    },

    [effectKeys.WHITE_STAR]: {
        name: "WHITE STARS",
        type: entryTypes.STAR,
        description:
            "Can be assigned a color to become RED STARS, ORANGE STARS, YELLOW STARS, GREEN STARS, BLUE STARS, INDIGO STARS, or VIOLET STARS.",
    },

    [effectKeys.RED_STAR]: {
        name: "RED STARS",
        type: entryTypes.STAR,
        description:
            "At RED STARFALL, converts all RED STARS into WHITE STARS. All entities take PHYSICAL DAMAGE equal to normal RED STARS converted. All entities take PIERCING DAMAGE equal to augmented RED STARS converted. These are considered two separate instances of damage. This damage does not take the master's DAMAGE MODIFIERS into consideration.",
    },

    [effectKeys.ORANGE_STAR]: {
        name: "ORANGE STARS",
        type: entryTypes.STAR,
        description:
            "At ORANGE STARFALL, converts all ORANGE STARS into WHITE STARS. Consumes the master's RESOURCES equal to normal ORANGE STARS converted. Consumes RESOURCES on all entities equal to augmented ORANGE STARS converted. Gains GRAY STARS equal to the total amount of RESOURCES consumed.",
    },

    [effectKeys.GRAY_STAR]: {
        name: "GRAY STARS",
        type: entryTypes.STAR,
        description: "Cannot be assigned a color.",
    },

    [effectKeys.YELLOW_STAR]: {
        name: "YELLOW STARS",
        type: entryTypes.STAR,
        description:
            "At YELLOW STARFALL, converts all YELLOW STARS into WHITE STARS. Raises the master's GRAVITATION by 5% for every normal YELLOW STARS converted. Raises the master's CONSTELLATION rank by the amount of augmented YELLOW STARS converted.",
    },

    [effectKeys.GRAVITATION]: {
        name: "GRAVITATION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises DAMAGE BONUS equal to the entity's GRAVITATION. When raising GRAVITATION above 100%, raises the entity's ACCRETION instead. At 100% GRAVITATION, spends all GRAVITATION to enter EVENT HORIZON. At TURN END, sets GRAVITATION to 0%.",
    },

    [effectKeys.EVENT_HORIZON]: {
        name: "EVENT HORIZON",
        type: entryTypes.STATE,
        description:
            "Adds SINGULARITY to the current ROUND cycle after the entity's STARFALL. At TURN START, exits this state.",
    },

    [effectKeys.SINGULARITY]: {
        name: "SINGULARITY",
        type: entryTypes.BATTLE_PHASE,
        description:
            "Counts as an EXTRA TURN. Added to ROUND after the corresponding entity's STARFALL. Cannot assign STARS on this phase.",
    },

    [effectKeys.ACCRETION]: {
        name: "ACCRETION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises DAMAGE BONUS equal to the entity's ACCRETION. When raising ACCRETION above 100%, raises STARGATE rank on self for every 5% excess. At TURN END, sets ACCRETION to 0%.",
    },

    [effectKeys.STARGATE]: {
        name: "STARGATE",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "When dealing PHYSICAL DAMAGE, ignores a portion of the target's DEFENSE equal to the entity's STARGATE rank. At TURN END, sets STARGATE rank to 0.",
    },

    [effectKeys.CONSTELLATION]: {
        name: "CONSTELLATION",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Raises ATTRIBUTES equal to the entity's CONSTELLATION rank. During ACTION PHASE, can be interacted with to become AZURE CONSTELLATION or CRIMSON CONSTELLATION. At TURN END, sets CONSTELLATION rank to 0.",
    },

    [effectKeys.AZURE_CONSTELLATION]: {
        name: "AZURE CONSTELLATION",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Raises DEFENSE equal to the entity's AZURE CONSTELLATION rank. When raising CONSTELLATION rank, raises AZURE CONSTELLATION rank on self instead. During ACTION PHASE, can be interacted with to become CONSTELLATION or CRIMSON CONSTELLATION. At TURN END, sets AZURE CONSTELLATION rank to 0.",
    },

    [effectKeys.CRIMSON_CONSTELLATION]: {
        name: "CRIMSON CONSTELLATION",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Raises STRENGTH equal to the entity's CRIMSON CONSTELLATION rank. When raising CONSTELLATION rank, raises CRIMSON CONSTELLATION rank on self instead. During ACTION PHASE, can be interacted with to become AZURE CONSTELLATION or CONSTELLATION. At TURN END, sets CRIMSON CONSTELLATION rank to 0.",
    },

    [effectKeys.GREEN_STAR]: {
        name: "GREEN STARS",
        type: entryTypes.STAR,
        description:
            "At GREEN STARFALL, converts all GREEN STARS into WHITE STARS. Spends WHITE STARS to restore the master's RESOURCES equal to normal GREEN STARS converted. Converts WHITE STARS into GRAY STARS and restores the master's RESOURCES equal to augmented GREEN STARS converted.",
    },

    [effectKeys.BLUE_STAR]: {
        name: "BLUE STARS",
        type: entryTypes.STAR,
        description:
            "At BLUE STARFALL, converts all BLUE STARS into WHITE STARS. Gains FRACTURED DOME equal to normal BLUE STARS converted. Gains FAULTY FIRMAMENT equal to augmented BLUE STARS converted.",
    },

    [effectKeys.FRACTURED_DOME]: {
        name: "FRACTURED DOME",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends FRACTURED DOME to reduce the damage taken. At TURN START, loses all FRACTURED DOME on self and takes TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.FAULTY_FIRMAMENT]: {
        name: "FAULTY FIRMAMENT",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends FAULTY FIRMAMENT to reduce the damage taken. At TURN START, loses all FAULTY FIRMAMENT on self and raises the entity's IRRADIATION by 5% for every FAULTY FIRMAMENT lost.",
    },

    [effectKeys.IRRADIATION]: {
        name: "IRRADIATION",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises WEAKNESS and FRAGILITY equal to the entity's IRRADIATION. When raising IRRADIATION above 100%, takes TRUE DAMAGE for every 5% excess. At TURN START, sets IRRADIATION to 0%.",
    },

    [effectKeys.INDIGO_STAR]: {
        name: "INDIGO STARS",
        type: entryTypes.STAR,
        description:
            "At INDIGO STARFALL, converts all INDIGO STARS into WHITE STARS. Gains STARDUST equal to normal INDIGO STARS converted. Gains GRAY STARS equal to augmented INDIGO STARS converted.",
    },

    [effectKeys.STARDUST]: {
        name: "STARDUST",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At TURN START, converts STARDUST into WHITE STARS for every 3 STARDUST on self.",
    },

    [effectKeys.VIOLET_STAR]: {
        name: "VIOLET STARS",
        type: entryTypes.STAR,
        description:
            "When other colored STARS are converted, converts equivalent VIOLET STARS into WHITE STARS and augments those STARS' effects. Cannot augment VIOLET STARS. At VIOLET STARFALL, converts all VIOLET STARS into WHITE STARS. Converts GRAY STARS into WHITE STARS equal to VIOLET STARS converted at this phase.",
    },
};

export const LUNATIC_DESCRIPTIONS = {
    [aiKeys.LUNATIC]: {
        name: "LUNATIC",
        type: entryTypes.CONTROLLER,
        description:
            "The ninth challenge. Focuses on the use of MIRROR, LUNAR SHROUD, and LUNAR SHED to build LUNACY and MOONLIGHT according to the current ATTRIBUTES, MOONLIGHT, and MIRRORED MOON phase; utilizing LUNAR TIDE or LUNAR GROWTH when in danger, and LUNAR SMITE or LUNAR STRIKE when it can finish the opponent; eventually using SHATTER to finish the fight with CHALK once enough MOONLIGHT and LUNACY have been accumulated. In PROGRESSION MODE, defeating this enemy unlocks the REFRACT action and the SERAPH enemy, alongside the corresponding GLOSSARY entries and TOOLTIPS.",
    },

    [actionKeys.REFRACT]: {
        name: "REFRACT",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Enters SELENIAN state.",
    },

    [effectKeys.SELENIAN]: {
        name: "SELENIAN",
        type: entryTypes.STATE,
        description:
            "Enables the ELEMENTAL CRYSTALS and MIRRORED MOON. Adds MOON PHASE to the current ROUND cycle before ROUND END. Replaces REFRACT with MIRROR. Upon exiting this state, takes LUNIC DAMAGE equal to MOONLIGHT, then sets MOONLIGHT to 0 and LUNACY to 0%, also sets MIRRORED MOON to HIDDEN, ELEMENTAL CRYSTALS to DULLED, and disables them. When MAX HEALTH falls below current HEALTH, converts excess HEALTH into SILVER BLOOD. When MAX HEALTH rises past current HEALTH, spends SILVER BLOOD to replenish missing HEALTH. When base MAX HEALTH is lowered below 0, lowers MOONLIGHT instead.",
    },

    [actionKeys.MIRROR]: {
        name: "MIRROR",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description: "Raises MOONLIGHT by 3.",
    },

    [effectKeys.MOONLIGHT]: {
        name: "MOONLIGHT",
        type: entryTypes.SPECIAL_ATTRIBUTES,
        description: "Scales certain ACTIONS and effects.",
    },

    [effectKeys.MIRRORED_MOON]: {
        name: "MIRRORED MOON",
        type: entryTypes.MECHANIC,
        description:
            "Has five states: HIDDEN, WAXING, BLOODSTAINED, WANING, and CORONAL. Starts at HIDDEN.",
    },

    [moonKeys.HIDDEN]: {
        name: "HIDDEN",
        type: entryTypes.MECHANIC,
        description: "At MOON PHASE, raises MOONLIGHT by 4.",
    },

    [moonKeys.WAXING]: {
        name: "WAXING",
        type: entryTypes.MECHANIC,
        description: "When using OFFENSIVE ACTIONS, becomes BLOODSTAINED.",
    },

    [moonKeys.WANING]: {
        name: "WANING",
        type: entryTypes.MECHANIC,
        description: "When using DEFENSIVE ACTIONS, becomes CORONAL.",
    },

    [moonKeys.BLOODSTAINED]: {
        name: "BLOODSTAINED",
        type: entryTypes.MECHANIC,
        description: "At MOON PHASE, raises MOONLIGHT by 1.",
    },

    [moonKeys.CORONAL]: {
        name: "CORONAL",
        type: entryTypes.MECHANIC,
        description: "At MOON PHASE, raises MOONLIGHT by 1.",
    },

    [effectKeys.MOON_PHASE]: {
        name: "MOON PHASE",
        type: entryTypes.BATTLE_PHASE,
        description:
            "Added to ROUND before ROUND END. If MIRRORED MOON is HIDDEN, WANING, or CORONAL, sets it to WAXING. If MIRRORED MOON is WAXING or BLOODSTAINED, sets it to WANING.",
    },

    [effectKeys.ELEMENTAL_CRYSTALS]: {
        name: "ELEMENTAL CRYSTALS",
        type: entryTypes.MECHANIC,
        description:
            "Has three main crystals: FROST, NATURE, and SCORCH. A player may click on the crystals during the ACTION PHASE of their TURN to activate a crystal. When no crystals are active, the current element is set to DULLED. When a single crystal is active, the current element is set to that crystal's element, that is: FROST, NATURE, or SCORCH. When two crystals are active, sets the current element to one of the combination elements, which includes: ASH, the combination of NATURE and SCORCH, WITHER, the combination of FROST and NATURE, and OCEAN, the combination of FROST and SCORCH. When selecting all crystals, sets the current element to ALBEDO. Combination elements do not inherit the effects of their components.",
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
            "While active, raises DEFENSE by MOONLIGHT. Replaces AEGIS with LUNAR SHROUD.",
    },

    [actionKeys.LUNAR_SHROUD]: {
        name: "LUNAR SHROUD",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Gains REFRACTED DIVINITY equal to the user's DEFENSE. Enters PRISMATIC state.",
    },

    [effectKeys.PRISMATIC]: {
        name: "PRISMATIC",
        type: entryTypes.STATE,
        description:
            "Converts all PHYSICAL DAMAGE taken into PIERCING DAMAGE. At TURN START, exits this state.",
    },

    [effectKeys.REFRACTED_DIVINITY]: {
        name: "REFRACTED DIVINITY",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends REFRACTED DIVINITY to decrease the damage taken, then gains MOONSHINE equal to the amount spent. At TURN START, loses all remaining REFRACTED DIVINITY on self, then raises the entity's LUNACY by 1.25% for every REFRACTED DIVINITY lost this way.",
    },

    [effectKeys.MOONSHINE]: {
        name: "MOONSHINE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using LUNAR STRIKE, spends MOONSHINE to increase the base damage dealt. When using MIRROR, spends all MOONSHINE to raise the entity's LUNACY by 2.5% for every MOONSHINE spent. At TURN END, loses all MOONSHINE on self and takes TRUE DAMAGE equal to the amount lost.",
    },

    [effectKeys.LUNACY]: {
        name: "LUNACY",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Capped at 100%. Raises DAMAGE BONUS and FRAGILITY equal to the entity's LUNACY. At 100% LUNACY, sets ELEMENTAL CRYSTALS to SHATTERED.",
    },

    [elementalKeys.NATURE]: {
        name: "NATURE",
        type: entryTypes.MECHANIC,
        description:
            "While active, raises MAX HEALTH by MOONLIGHT. Additionally, replaces GUARD with LUNAR GROWTH.",
    },

    [effectKeys.SILVER_BLOOD]: {
        name: "SILVER BLOOD",
        type: entryTypes.OVERFLOWN_RESOURCE,
        description: "When losing HEALTH, loses SILVER BLOOD on self first.",
    },

    [actionKeys.LUNAR_GROWTH]: {
        name: "LUNAR GROWTH",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Restores RESOURCES on self equal to the user's MOONLIGHT. Enters MOON DEW state.",
    },

    [effectKeys.MOON_DEW]: {
        name: "MOON DEW",
        type: entryTypes.STATE,
        description:
            "Disables LUNACY's FRAGILITY. At TURN START, exits this state.",
    },

    [elementalKeys.SCORCH]: {
        name: "SCORCH",
        type: entryTypes.MECHANIC,
        description:
            "While active, raises STRENGTH by MOONLIGHT. Additionally, replaces SPECIAL ATTACK with LUNAR STRIKE.",
    },

    [actionKeys.LUNAR_STRIKE]: {
        name: "LUNAR STRIKE",
        type: entryTypes.OFFENSIVE_ACTION,
        description: "Deals PIERCING DAMAGE equal to half the user's STRENGTH.",
    },

    [elementalKeys.OCEAN]: {
        name: "OCEAN",
        type: entryTypes.MECHANIC,
        description:
            "Combination of FROST and SCORCH. While active, when replenishing HEALTH above the limit, gains SILVER BLOOD instead. Replaces HEAL with LUNAR TIDE.",
    },

    [actionKeys.LUNAR_TIDE]: {
        name: "LUNAR TIDE",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Consumes RESOURCES on self equal to twice the user's MOONLIGHT. Then, restores RESOURCES on self equal to the amount consumed.",
    },

    [elementalKeys.WITHER]: {
        name: "WITHER",
        type: entryTypes.MECHANIC,
        description:
            "Combination of FROST and NATURE. While active, when losing HEALTH or SILVER BLOOD, raises LUNACY by 2.5% for every HEALTH or SILVER BLOOD lost. Replaces SACRIFICE with LUNAR SHED.",
    },

    [actionKeys.LUNAR_SHED]: {
        name: "LUNAR SHED",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Enters GIBBOUS state. Halves the user's total HEALTH. Gains MYCELIUM equal to the amount lost.",
    },

    [effectKeys.GIBBOUS]: {
        name: "GIBBOUS",
        type: entryTypes.STATE,
        description:
            "Raises DAMAGE REDUCTION by the missing HEALTH percentage. At TURN START, exits this state.",
    },

    [effectKeys.MYCELIUM]: {
        name: "MYCELIUM",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends MYCELIUM to reduce the damage taken. At TURN START, loses all MYCELIUM on self, then restores RESOURCES on self equal to the amount lost.",
    },

    [elementalKeys.ASH]: {
        name: "ASH",
        type: entryTypes.MECHANIC,
        description:
            "Combination of NATURE and SCORCH. While active, when losing LIMITED RESOURCES, gains FUNERARY URN equal to the amount lost. Replaces ATTACK with LUNAR SMITE.",
    },

    [effectKeys.FUNERARY_URN]: {
        name: "FUNERARY URN",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends FUNERARY URN to reduce the damage taken.",
    },

    [actionKeys.LUNAR_SMITE]: {
        name: "LUNAR SMITE",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Consumes the user's LIMITED RESOURCES equal to half of their sum. Deals PIERCING DAMAGE equal to the amount consumed.",
    },

    [elementalKeys.ALBEDO]: {
        name: "ALBEDO",
        type: entryTypes.MECHANIC,
        description:
            "Combination of NATURE, FROST, and SCORCH. While active, on MOON PHASE, raises MOONLIGHT by 1. Replaces MIRROR with SHATTER.",
    },

    [actionKeys.SHATTER]: {
        name: "SHATTER",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Sets ELEMENTAL CRYSTALS to SHATTERED. This is a FREE ACTION.",
    },

    [elementalKeys.SHATTERED]: {
        name: "SHATTERED",
        type: entryTypes.MECHANIC,
        description:
            "Cannot change elements. At TURN END, takes LUNIC DAMAGE equal to MOONLIGHT. Enables the effects of FROST, NATURE, SCORCH, OCEAN, WITHER, ASH, and ALBEDO. Replaces SHATTER with CHALK.",
    },

    [actionKeys.CHALK]: {
        name: "CHALK",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Spends all LUNACY. Deals LUNIC DAMAGE for every 5% LUNACY spent.",
    },

    [dmgTypes.LUNIC]: {
        name: "LUNIC DAMAGE",
        type: entryTypes.DAMAGE_TYPE,
        description:
            "Reduces the target's MAX HEALTH. Ignores DEFENSE, DAMAGE MODIFIERS, and MITIGATION RESOURCES.",
    },
};

export const SERAPH_DESCRIPTIONS = {
    [aiKeys.SERAPH]: {
        name: "SERAPH",
        type: entryTypes.CONTROLLER,
        description:
            "The tenth and final challenge. Focuses on using RISE to enable ASCEND or building up DIVINE SPARK via AEGIS, choosing to ASCEND when suitable; after ascension, optimizes EDICTS and ACTIONS to maximize its offense, defense, and scaling, choosing to use ATONE when cornered. In PROGRESSION MODE, defeating this enemy unlocks the RISE and ASCEND actions.",
    },

    [actionKeys.RISE]: {
        name: "RISE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Exits all STATES. Raises DEFENSE by the user's STRENGTH. Gains WISDOM equal to twice the user's STRENGTH. Enters ZENITH OF MORTALITY.",
    },

    [effectKeys.WISDOM]: {
        name: "WISDOM",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When taking PHYSICAL DAMAGE or PIERCING DAMAGE, spends WISDOM to reduce the damage taken. When receiving PHYSICAL TARNISHMENT or PIERCING TARNISHMENT, spends WISDOM to reduce the tarnishment received.",
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
            "Exits all STATES. Consumes all RESOURCES on self. Sets MAX ENLIGHTENMENT to the sum of the user's MAX MANA and MAX HEALTH. Then, sets MAX MANA and MAX HEALTH to 0. Replenishes ENLIGHTENMENT equal to the LIMITED RESOURCES consumed. Raises the battlefield's PROVIDENCE by 5% for every WISDOM or RADIANCE consumed. Raises the user's TARNISHED SIN by 2.5% for every other RESOURCES consumed. Raises REVELATION by the user's STRENGTH. Raises FORTITUDE by the user's DEFENSE. Then, sets all BASE ATTRIBUTES to 0. Spends all DIVINE SPARK. Enters ASCENDENCE OF SPIRIT and initiates the HEAVENLY CHOIRS. Advances the HEAVENLY CHOIRS for every 12.5% DIVINE SPARK spent. Raises the battlefield's PROVIDENCE by the DIVINE SPARK spent. This is a FREE ACTION.",
    },

    [effectKeys.REVELATION]: {
        name: "REVELATION",
        type: entryTypes.SPECIAL_ATTRIBUTES,
        description: "Scales certain ACTIONS and effects.",
    },

    [effectKeys.FORTITUDE]: {
        name: "FORTITUDE",
        type: entryTypes.SPECIAL_ATTRIBUTES,
        description: "Reduces PHYSICAL TARNISHMENT received.",
    },

    [effectKeys.PROVIDENCE]: {
        name: "PROVIDENCE",
        type: entryTypes.GLOBAL_RESOURCE,
        description:
            "Capped at 100%. When raising PROVIDENCE above 100%, raises TARNISHED SIN on all entities by a fifth of the excess.",
    },

    [effectKeys.ENLIGHTENMENT]: {
        name: "ENLIGHTENMENT",
        type: entryTypes.LIMITED_RESOURCE,
        description:
            "Capped by MAX ENLIGHTENMENT. When replenishing ENLIGHTENMENT above the limit, gains INSIGHT instead. While on ASCENDENCE OF SPIRIT, at 0 or less ENLIGHTENMENT, exits ASCENDENCE OF SPIRIT.",
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
            "When losing ENLIGHTENMENT, loses INSIGHT on self first. When ENLIGHTENMENT falls below MAX ENLIGHTENMENT, spends INSIGHT to replenish the entity's missing ENLIGHTENMENT. At TURN START, loses all INSIGHT on self, then raises the entity's TARNISHED SIN by 0.25% for every INSIGHT lost and the battlefield's PROVIDENCE by 2.5% for every INSIGHT lost.",
    },

    [effectKeys.TARNISHED_SIN]: {
        name: "TARNISHED SIN",
        type: entryTypes.FIXED_RESOURCE,
        description: "Capped at 100%. At 100%, enters ABANDONED BY GRACE.",
    },

    [effectKeys.ABANDONED_BY_GRACE]: {
        name: "ABANDONED BY GRACE",
        type: entryTypes.STATE,
        description:
            "Cannot act. If there's no entity on ANOINTED PROXY on the battlefield, awakens the EYE OF HEAVENS and adds ANOINTMENT to the current ROUND cycle right after the current phase.",
    },

    [roundPhases.ANOINTMENT]: {
        name: "ANOINTMENT",
        type: entryTypes.BATTLE_PHASE,
        description:
            "If the EYE OF HEAVENS is CLOSED, sets it to OPEN. If both entities are on ABANDONED BY GRACE, deletes the CONDITION of both entities and ends the MATCH in a draw. Otherwise, grants ANOINTED PROXY to the entity not on ABANDONED BY GRACE.",
    },

    [effectKeys.ANOINTED_PROXY]: {
        name: "ANOINTED PROXY",
        type: entryTypes.STATE,
        description:
            "Cannot die. Adds PROSECUTION to the current ROUND cycle right after the current phase. Replaces all ACTIONS with JUDGEMENT.",
    },

    [effectKeys.PROSECUTION]: {
        name: "PROSECUTION",
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
            "Cannot die. Replaces HEALTH and MANA with ENLIGHTENMENT. Replaces DAMAGE MODIFIERS with SPIRITUAL ORDINANCES. Converts all DAMAGE TYPES taken into their corresponding TARNISHMENT TYPES. Replaces all ACTIONS with CONDEMN, SUPPLICATE, DISCERN, and ATONE. Enables a side-menu for enabling or disabling EDICTS. Effects that replenish HEALTH or MANA directly will instead raise TARNISHED SIN by 1.25% for every HEALTH or MANA replenished. Raises DISGRACE by TARNISHED SIN. Upon exiting this state, exits the HEAVENLY CHOIRS and IMMACULATE, sets REVELATION and FORTITUDE to 0, and consumes all RESOURCES, then sets MAX HEALTH to MAX ENLIGHTENMENT and MAX ENLIGHTENMENT to 0, restores RESOURCES equal to the ENLIGHTENMENT consumed, gains SACRED FLAMES equal to the other RESOURCES consumed, raises ATTRIBUTES equal to half the sum of REVELATION and FORTITUDE lowered this way, then, finally, enters CUTOFF WINGS.",
    },

    [effectKeys.CUTOFF_WINGS]: {
        name: "CUTOFF WINGS",
        type: entryTypes.STATE,
        description:
            "Cannot use AEGIS, RISE, or ASCEND. Cannot exit this state.",
    },

    [entryTypes.TARNISHMENT_TYPE]: {
        name: "TARNISHMENT TYPES",
        type: entryTypes.CATEGORY,
        description:
            "Includes PHYSICAL TARNISHMENT, PIERCING TARNISHMENT, TRUE TARNISHMENT, and LUNIC TARNISHMENT. All tarnishment received has a minimum of 1. When tarnishment would bring a target's ENLIGHTENMENT or MAX ENLIGHTENMENT below 0, raises their TARNISHED SIN by 0.5% for every point of tarnishment received instead.",
    },

    [tarnishTypes.PHYSICAL]: {
        name: "PHYSICAL TARNISHMENT",
        type: entryTypes.TARNISHMENT_TYPE,
        description:
            "Reduces the target's ENLIGHTENMENT. Can be blocked by FORTITUDE, affected by SPIRITUAL ORDINANCES, and mitigated by certain MITIGATION RESOURCES.",
    },

    [tarnishTypes.PIERCING]: {
        name: "PIERCING TARNISHMENT",
        type: entryTypes.TARNISHMENT_TYPE,
        description:
            "Reduces the target's ENLIGHTENMENT. Ignores FORTITUDE, but can be affected by SPIRITUAL ORDINANCES and mitigated by certain MITIGATION RESOURCES.",
    },

    [tarnishTypes.TRUE]: {
        name: "TRUE TARNISHMENT",
        type: entryTypes.TARNISHMENT_TYPE,
        description:
            "Reduces the target's ENLIGHTENMENT. Cannot be blocked by FORTITUDE, affected by SPIRITUAL ORDINANCES, or mitigated by MITIGATION RESOURCES.",
    },

    [tarnishTypes.LUNIC]: {
        name: "LUNIC TARNISHMENT",
        type: entryTypes.TARNISHMENT_TYPE,
        description:
            "Reduces the target's MAX ENLIGHTENMENT. Cannot be blocked by FORTITUDE, affected by SPIRITUAL ORDINANCES, or mitigated by MITIGATION RESOURCES.",
    },

    [effectKeys.DEFILEMENT]: {
        name: "DEFILEMENT",
        type: entryTypes.GLOBAL_RESOURCE,
        description:
            "When receiving PHYSICAL TARNISHMENT, ignores a portion of the entity's FORTITUDE equal to the battlefield's DEFILEMENT rank. Raises the battlefield's DEFILEMENT rank by the sum of all entities' STARGATE rank.",
    },

    [entryTypes.SPIRITUAL_ORDINANCE]: {
        name: "SPIRITUAL ORDINANCES",
        type: entryTypes.CATEGORY,
        description:
            "Includes MALEDICTION, BENEDICTION, GRACE, and DISGRACE. All sources of SPIRITUAL ORDINANCES stack multiplicatively.",
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
            "Includes HEAVENLY CHOIR: THE FIRST, HEAVENLY CHOIR: THE SECOND, HEAVENLY CHOIR: THE THIRD, HEAVENLY CHOIR: THE FOURTH, HEAVENLY CHOIR: THE FIFTH, HEAVENLY CHOIR: THE SIXTH, HEAVENLY CHOIR: THE SEVENTH, HEAVENLY CHOIR: THE EIGHTH, and HEAVENLY CHOIR: THE NINTH. Each of the HEAVENLY CHOIRS inherits the effects of all previous HEAVENLY CHOIRS. Upon initiating the HEAVENLY CHOIRS, enters HEAVENLY CHOIR: THE FIRST. Upon exiting the HEAVENLY CHOIRS, disables all EDICTS. Effects that trigger upon exiting the HEAVENLY CHOIRS are resolved in HEAVENLY CHOIRS order.",
    },

    [actionKeys.CONDEMN]: {
        name: "CONDEMN",
        type: entryTypes.OFFENSIVE_ACTION,
        description:
            "Inflicts PHYSICAL TARNISHMENT equal to the user's REVELATION. Then, gains PENITENCE equal to half the user's REVELATION.",
    },

    [effectKeys.PENITENCE]: {
        name: "PENITENCE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "Lowers REVELATION by the entity's PENITENCE. At TURN END, loses all PENITENCE on self and raises the entity's TARNISHED SIN by 0.25% for every PENITENCE lost.",
    },

    [actionKeys.SUPPLICATE]: {
        name: "SUPPLICATE",
        type: entryTypes.DEFENSIVE_ACTION,
        description:
            "Restores RESOURCES on self equal to the user's FORTITUDE. Then, enters IMMACULATE state.",
    },

    [effectKeys.IMMACULATE]: {
        name: "IMMACULATE",
        type: entryTypes.STATE,
        description:
            "Lowers FORTITUDE by a percentage of itself equivalent to the battlefield's missing PROVIDENCE. At TURN START, exits this state.",
    },

    [actionKeys.DISCERN]: {
        name: "DISCERN",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Gains INSPIRATION for every 10% PROVIDENCE on the battlefield.",
    },

    [effectKeys.INSPIRATION]: {
        name: "INSPIRATION",
        type: entryTypes.FREE_RESOURCE,
        description:
            "Raises REVELATION by the entity's INSPIRATION. At TURN END, loses all INSPIRATION on self, then raises the battlefield's PROVIDENCE by 2.5% for every INSPIRATION lost.",
    },

    [actionKeys.ATONE]: {
        name: "ATONE",
        type: entryTypes.TRANSFORMATIVE_ACTION,
        description:
            "Exits ASCENDENCE OF SPIRIT. Spends all TARNISHED SIN. Raises STIGMATA rank on self for every 20% TARNISHED SIN spent.",
    },

    [effectKeys.BURDEN_OF_STIGMA]: {
        name: "STIGMATA",
        type: entryTypes.RANKED_RESOURCE,
        description:
            "Cannot die. At TURN START, lowers STIGMATA rank on self by 1.",
    },

    [entryTypes.EDICT]: {
        name: "EDICTS",
        type: entryTypes.CATEGORY,
        description:
            "Includes EDICT OF ANGELS, EDICT OF ARCHANGELS, EDICT OF PRINCIPALITIES, EDICT OF POWERS, EDICT OF VIRTUES, EDICT OF DOMINIONS, EDICT OF THRONES, EDICT OF CHERUBIM, and EDICT OF SERAPHIM. Multiple EDICTS may be enabled at a time.",
    },

    [choirKeys.FIRST]: {
        name: "HEAVENLY CHOIR: THE FIRST",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF ANGELS. At TURN START, becomes HEAVENLY CHOIR: THE SECOND.",
    },

    [edictKeys.ANGELS]: {
        name: "EDICT OF ANGELS",
        type: entryTypes.EDICT,
        description:
            "When using CONDEMN, halves the entity's total ENLIGHTENMENT. Then, increases the final tarnishment inflicted by the ENLIGHTENMENT lost.",
    },

    [choirKeys.SECOND]: {
        name: "HEAVENLY CHOIR: THE SECOND",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF ARCHANGELS. At TURN START, becomes HEAVENLY CHOIR: THE THIRD.",
    },

    [edictKeys.ARCHANGELS]: {
        name: "EDICT OF ARCHANGELS",
        type: entryTypes.EDICT,
        description:
            "Raises MALEDICTION by half the missing ENLIGHTENMENT percentage. When losing ENLIGHTENMENT or INSIGHT, gains MARTYR equal to the amount lost.",
    },

    [effectKeys.MARTYR]: {
        name: "MARTYR",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At TURN END, loses all MARTYR on self. Then, raises the entity's TARNISHED SIN by 0.25% for every MARTYR lost and the battlefield's PROVIDENCE by 2.5% for every MARTYR lost.",
    },

    [choirKeys.THIRD]: {
        name: "HEAVENLY CHOIR: THE THIRD",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF PRINCIPALITIES. At TURN START, becomes HEAVENLY CHOIR: THE FOURTH.",
    },

    [edictKeys.PRINCIPALITIES]: {
        name: "EDICT OF PRINCIPALITIES",
        type: entryTypes.EDICT,
        description:
            "When using SUPPLICATE, gains SANCTUARY instead of restoring RESOURCES.",
    },

    [effectKeys.SANCTUARY]: {
        name: "SANCTUARY",
        type: entryTypes.MITIGATION_RESOURCE,
        description:
            "When receiving PHYSICAL TARNISHMENT or PIERCING TARNISHMENT, spends SANCTUARY to reduce the tarnishment received, then gains SACRILEGE equal to the amount spent. At TURN START, loses all SANCTUARY on self and raises the battlefield's PROVIDENCE by 2.5% for every SANCTUARY lost.",
    },

    [effectKeys.SACRILEGE]: {
        name: "SACRILEGE",
        type: entryTypes.FREE_RESOURCE,
        description:
            "When using CONDEMN, spends all SACRILEGE to increase the base tarnishment inflicted by the amount spent. At TURN END, loses all SACRILEGE on self and raises the entity's TARNISHED SIN by 2.5% for every SACRILEGE lost.",
    },

    [choirKeys.FOURTH]: {
        name: "HEAVENLY CHOIR: THE FOURTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF POWERS. At TURN START, becomes HEAVENLY CHOIR: THE FIFTH.",
    },

    [edictKeys.POWERS]: {
        name: "EDICT OF POWERS",
        type: entryTypes.EDICT,
        description:
            "When using DISCERN, gains SACRED FLAMES for every 10% PROVIDENCE on the battlefield.",
    },

    [effectKeys.SACRED_FLAMES]: {
        name: "SACRED FLAMES",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At TURN END, raises the entity's TARNISHED SIN by 0.25% and restores RESOURCES on self for every SACRED FLAMES on self.",
    },

    [choirKeys.FIFTH]: {
        name: "HEAVENLY CHOIR: THE FIFTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF VIRTUES. At TURN START, becomes HEAVENLY CHOIR: THE SIXTH.",
    },

    [edictKeys.VIRTUES]: {
        name: "EDICT OF VIRTUES",
        type: entryTypes.EDICT,
        description:
            "When using ACTIONS, if not already a FREE ACTION, spends 10% of the battlefield's PROVIDENCE to become a FREE ACTION. Increases the PROVIDENCE spent by 10% for every time this effect has triggered on the current TURN. Does not activate if the battlefield does not have enough PROVIDENCE.",
    },

    [choirKeys.SIXTH]: {
        name: "HEAVENLY CHOIR: THE SIXTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF DOMINIONS and enables HALLOWED ECHOES. At TURN START, becomes HEAVENLY CHOIR: THE SEVENTH.",
    },

    [edictKeys.DOMINIONS]: {
        name: "EDICT OF DOMINIONS",
        type: entryTypes.EDICT,
        description:
            "When using CONDEMN, lowers HALLOWED ECHOES by 10%. When using SUPPLICATE, raises HALLOWED ECHOES by 10%. When using DISCERN, inverts HALLOWED ECHOES.",
    },

    [effectKeys.HALLOWED_ECHOES]: {
        name: "HALLOWED ECHOES",
        type: entryTypes.FIXED_RESOURCE,
        description:
            "Starts at 0%. Can go from -50% to 50%. Raises MALEDICTION and DISGRACE equal to the entity's HALLOWED ECHOES lower than 0%. Raises BENEDICTION and GRACE equal to the entity's HALLOWED ECHOES higher than 0%. At TURN START, or when exiting the HEAVENLY CHOIRS, sets HALLOWED ECHOES to 0%.",
    },

    [choirKeys.SEVENTH]: {
        name: "HEAVENLY CHOIR: THE SEVENTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF THRONES and enables the CODEX OF BLASPHEMY. At TURN START, becomes HEAVENLY CHOIR: THE EIGHTH.",
    },

    [edictKeys.THRONES]: {
        name: "EDICT OF THRONES",
        type: entryTypes.EDICT,
        description:
            "When using CONDEMN, SUPPLICATE, or DISCERN, adds BLASPHEMY OF YESTERDAY, BLASPHEMY OF TODAY, or BLASPHEMY OF TOMORROW to the CODEX OF BLASPHEMY, respectively.",
    },

    [effectKeys.CODEX_OF_BLASPHEMY]: {
        name: "CODEX OF BLASPHEMY",
        type: entryTypes.MECHANIC,
        description:
            "Can hold up to three BLASPHEMIES. When a fourth one is added, expunges the oldest one to make space. Clicking on any blasphemy expunges it. When exiting the HEAVENLY CHOIRS, expunges all BLASPHEMIES, starting from the oldest.",
    },

    [entryTypes.BLASPHEMY]: {
        name: "BLASPHEMIES",
        type: entryTypes.CATEGORY,
        description:
            "Includes BLASPHEMY OF YESTERDAY, BLASPHEMY OF TODAY, and BLASPHEMY OF TOMORROW. When BLASPHEMIES are expunged, receives TRUE TARNISHMENT equal to 20% of MAX ENLIGHTENMENT and removes them from the CODEX OF BLASPHEMY.",
    },

    [blasphemyKeys.YESTERDAY]: {
        name: "BLASPHEMY OF YESTERDAY",
        type: entryTypes.BLASPHEMY,
        description:
            "When expunged, lowers TARNISHED SIN by a tenth of the missing ENLIGHTENMENT percentage.",
    },

    [blasphemyKeys.TODAY]: {
        name: "BLASPHEMY OF TODAY",
        type: entryTypes.BLASPHEMY,
        description:
            "When expunged, lowers TARNISHED SIN by a tenth of the battlefield's PROVIDENCE.",
    },

    [blasphemyKeys.TOMORROW]: {
        name: "BLASPHEMY OF TOMORROW",
        type: entryTypes.BLASPHEMY,
        description:
            "When expunged, transfers a tenth of TARNISHED SIN to the opponent.",
    },

    [choirKeys.EIGHTH]: {
        name: "HEAVENLY CHOIR: THE EIGHTH",
        type: entryTypes.HEAVENLY_CHOIR,
        description:
            "Unlocks EDICT OF CHERUBIM. At TURN START, becomes HEAVENLY CHOIR: THE NINTH and awakens the EYE OF HEAVENS.",
    },

    [edictKeys.CHERUBIM]: {
        name: "EDICT OF CHERUBIM",
        type: entryTypes.EDICT,
        description:
            "When the battlefield's PROVIDENCE is lowered, gains MOTES OF RUIN for every 2.5% lowered. When the battlefield's PROVIDENCE is raised, gains MOTES OF CREATION for every 2.5% raised.",
    },

    [effectKeys.MOTES_OF_RUIN]: {
        name: "MOTES OF RUIN",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At TURN END, converts MOTES OF RUIN into STARS OF APOCALYPSE for every 4 MOTES OF RUIN on self.",
    },

    [effectKeys.MOTES_OF_CREATION]: {
        name: "MOTES OF CREATION",
        type: entryTypes.FREE_RESOURCE,
        description:
            "At TURN START, converts MOTES OF CREATION into STARS OF GENESIS for every 4 MOTES OF CREATION on self.",
    },

    [entryTypes.CELESTIAL_STAR]: {
        name: "CELESTIAL STARS",
        type: entryTypes.CATEGORY,
        description:
            "Includes STARS OF APOCALYPSE and STARS OF GENESIS. When exiting the HEAVENLY CHOIRS, enacts all STARS OF GENESIS and STARS OF APOCALYPSE in this order.",
    },

    [effectKeys.STARS_OF_APOCALYPSE]: {
        name: "STARS OF APOCALYPSE",
        type: entryTypes.CELESTIAL_STAR,
        description:
            "Raises DISGRACE by 2.5% for every STARS OF APOCALYPSE on self. Clicking enacts a star, inflicting TRUE TARNISHMENT on all entities. Right-clicking enacts in batches of 10.",
    },

    [effectKeys.STARS_OF_GENESIS]: {
        name: "STARS OF GENESIS",
        type: entryTypes.CELESTIAL_STAR,
        description:
            "Raises BENEDICTION by 2.5% for every STARS OF GENESIS on self. Clicking enacts a star, restoring RESOURCES to all entities. Right-clicking enacts in batches of 10.",
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
            "Can be CLOSED or OPEN. Awakens as OPEN. While awakened, adds RECKONING to the current ROUND cycle after ROUND START.",
    },

    [roundPhases.RECKONING]: {
        name: "RECKONING",
        type: entryTypes.BATTLE_PHASE,
        description:
            "Added to ROUND after ROUND START. At RECKONING, if there is no entity on the battlefield on HEAVENLY CHOIR: THE NINTH, returns the EYE OF HEAVENS to dormancy.",
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
            "When the EYE OF HEAVENS is OPEN: Raises BENEDICTION and GRACE by half the battlefield's PROVIDENCE. Raises MALEDICTION and DISGRACE by half the battlefield's missing PROVIDENCE. When the EYE OF HEAVENS is CLOSED: Raises MALEDICTION and DISGRACE by half the battlefield's PROVIDENCE. Raises BENEDICTION and GRACE by half the battlefield's missing PROVIDENCE.",
    },
};

export const DESCRIPTIONS = {
    ...GENERAL_DESCRIPTIONS,
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
