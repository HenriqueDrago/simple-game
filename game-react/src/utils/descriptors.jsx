export const ACTION_DESCRIPTIONS = {
    attack: (
        <div>
            <strong>ATTACK:</strong> Deals damage equal to the attacker's STR.
            Final damage is reduced by the target's DEF and DR.
        </div>
    ),

    heal: (
        <div>
            <strong>HEAL:</strong> Converts MANA into HP. Healing cannot exceed
            MAX HP, and MANA cannot drop below 0. Maximum healing is limited by
            both missing HP and current MANA. Cleanses POISON.
        </div>
    ),

    guard: (
        <div>
            <strong>GUARD:</strong> Restores MANA equal to a percentage of MAX
            MANA and enters GUARDING STATE until the next turn.
        </div>
    ),

    spAtk: (
        <div>
            <strong>SPECIAL ATTACK:</strong> Deals damage equal to the
            attacker's STR + MANA IMBALANCE. This damage ignores DEF and normal
            DR. The target restores MANA equal to the MANA IMBALANCE value. If
            this restoration exceeds MAX MANA, the excess becomes MANA OVERFLOW.
        </div>
    ),

    sacrifice: (
        <div>
            <strong>SELF-SACRIFICE:</strong> Consumes a percentage of current
            HP. Gains BLOOD SACRIFICE and MAX MANA equal to the HP lost, then
            enters SACRIFICIAL STATE until the next turn. While BLOOD SACRIFICE
            is present, suffers from MANA BLEED.
        </div>
    ),

    array: (
        <div>
            <strong>ARRAY:</strong> Envelops the battlefield in a magical array
            for 3 turns. Consumes all MANA and MANA OVERFLOW from every entity,
            then grants SHACKLED MANA equal to the amount consumed on each
            entity. While active, all entities gain THORNED SHACKLES, and ARRAY
            is replaced with CURSE.
        </div>
    ),

    curse: (
        <div>
            <strong>CURSE:</strong> Consumes all SHACKLED MANA from every
            entity. Each entity gains POISON equal to the amount consumed on
            self, then ARRAY ends.
        </div>
    ),

    aegis: (
        <div>
            <strong>AEGIS:</strong> Gains RADIANCE based on the caster's DEF.
            Gains HOLY PROTECTION until the next turn.
        </div>
    ),

    shadowPact: (
        <div>
            <strong>SHADOW PACT:</strong> Enters UMBRAL CORE. Burns 5 RESOURCES,
            then gains SHADOWFLAME equal to the amount burned. Cannot burn
            SHADOWFLAME and LINGERING EMBER.
        </div>
    ),

    blackMayhem: (
        <div>
            <strong>BLACK MAYHEM:</strong> Burns the target's RESOURCES equal to
            your SHADOWFLAME. Grants CINDERS to opponent equal to the RESOURCES
            burnt. When burning CINDERS, grants LINGERING EMBER to self instead.
            This effect ignores DEF and DR. Cannot burn SHADOWFLAME and
            LINGERING EMBER.
        </div>
    ),

    shadowMantle: (
        <div>
            <strong>SHADOW MANTLE:</strong> Gains UNRELENTING SHADOWS equal to
            SHADOWFLAME on self. Then, enters DARK EMBRACE until the next turn.
        </div>
    ),

    ritualOfAsh: (
        <div>
            <strong>RITUAL OF ASH:</strong> Extinguishes all SHADOWFLAME, then
            gains LINGERING EMBER equal to the amount lost.
        </div>
    ),

    darkPromise: (
        <div>
            <strong>DARK PROMISE:</strong> Exits UMBRAL CORE and enters DIMMING
            DARKNESS until the next turn. Loses all SHADOWFLAME, LINGERING EMBER
            and CINDERS, then grants UNRELENTING SHADOWS to all entities equal
            to the SHADOWFLAME lost plus half the LINGERING EMBER lost.
        </div>
    ),
};

export const MECHANIC_DESCRIPTIONS = {
    guardingState: (
        <div>
            <strong>[GUARDING STATE]:</strong> Raises DEF EFFECTIVENESS and
            grants additional DR.
        </div>
    ),

    manaImbalance: (
        <div>
            <strong>[MANA IMBALANCE]:</strong> The difference between the
            caster's and target's current MANA. If the target has equal or
            greater MANA, the value is 0.
        </div>
    ),

    manaOverflow: (
        <div>
            <strong>[MANA OVERFLOW]:</strong> Used before MANA by abilities that
            consume MANA. At turn end, all MANA OVERFLOW is lost and the owner
            takes damage equal to the amount lost.
        </div>
    ),

    sacrificialState: (
        <div>
            <strong>[SACRIFICIAL STATE]:</strong> Increases DR against all
            damage sources.
        </div>
    ),

    manaBleed: (
        <div>
            <strong>[MANA BLEED]:</strong> At turn start, loses MANA based on
            current BLOOD SACRIFICE and restores an equal amount of HP. MANA
            cannot drop below 0, and HP cannot exceed MAX HP.
        </div>
    ),

    thornedShackles: (
        <div>
            <strong>[THORNED SHACKLES]:</strong> At turn end, consumes all MANA
            and MANA OVERFLOW, then grants SHACKLED MANA equal to the amount
            consumed. When attacked, the attacker takes damage equal to their
            own STR.
        </div>
    ),

    shackledMana: (
        <div>
            <strong>[SHACKLED MANA]:</strong> At turn start, gains 3 SHACKLED
            MANA while ARRAY is active. When ARRAY ends, all SHACKLED MANA is
            consumed and distributed evenly as MANA among all entities. Excess
            MANA becomes MANA OVERFLOW.
        </div>
    ),

    poison: (
        <div>
            <strong>[POISON]:</strong> At turn start, takes damage equal to its
            current POISON stacks.
        </div>
    ),

    radiance: (
        <div>
            <strong>[RADIANCE]:</strong> Increases damage dealt when attacking
            and reduces damage received when attacked. RADIANCE consumed by
            SELF-SACRIFICE does not generate BLOOD SACRIFICE.
        </div>
    ),

    resources: (
        <div>
            <strong>[RESOURCES]:</strong> Includes SHADOWFLAME, LINGERING EMBER,
            CINDERS, POISON, MANA OVERFLOW, SHACKLED MANA, BLOOD SACRIFICE,
            RADIANCE, MANA, and HP. Resources are consumed in this order and
            restored in reverse. HP cannot exceed MAX HP. Excess MANA gained
            this way becomes MANA OVERFLOW.
        </div>
    ),

    umbralCore: (
        <div>
            <strong>[UMBRAL CORE]:</strong> Replaces actions with SHADOW MANTLE,
            BLACK MAYHEM, RITUAL OF ASH, and DARK PROMISE.
        </div>
    ),

    shadowflame: (
        <div>
            <strong>[SHADOWFLAME]:</strong> At turn start, burns RESOURCES equal
            to current SHADOWFLAME, then gains SHADOWFLAME equal to the amount
            burned. Cannot burn SHADOWFLAME and LINGERING EMBER.
        </div>
    ),

    darkEmbrace: (
        <div>
            <strong>[DARK EMBRACE]:</strong> Takes 50% less damage from all
            sources. SHADOWFLAME does not burn RESOURCES while active.
        </div>
    ),

    lingeringEmber: (
        <div>
            <strong>[LINGERING EMBER]:</strong> Cannot be consumed by
            SHADOWFLAME. Damage removes LINGERING EMBER instead of HP. Gains
            CINDERS equal to the amount lost this way. At turn start, converts
            half of current LINGERING EMBER into both SHADOWFLAME and CINDERS.
        </div>
    ),

    dimmingDarkness: (
        <div>
            <strong>[DIMMING DARKNESS]:</strong> Disables POISON, SHADOWFLAME,
            MANA OVERFLOW, and MANA BLEED effects on self.
        </div>
    ),

    cinders: (
        <div>
            <strong>[CINDERS]:</strong> No effect.
        </div>
    ),

    holyProtection: (
        <div>
            <strong>[HOLY PROTECTION]:</strong> Raises DEF EFFECTIVENESS.
        </div>
    ),

    bloodSacrifice: (
        <div>
            <strong>[BLOOD SACRIFICE]:</strong> Increases damage dealt when
            using ATTACK. Causes MANA BLEED at the start of the owner's turn.
        </div>
    ),

    unrelentingShadows: (
        <div>
            <strong>[UNRELENTING SHADOWS]</strong> On turn start, loses all
            UNRELENTING SHADOWS. Then, gains RESOURCES based on the UNRELENTING
            SHADOWS lost this way.
        </div>
    ),
};
