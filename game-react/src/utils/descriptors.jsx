import { actionKeys, effectKeys } from "./enums";

export const ACTION_DESCRIPTIONS = {
    [actionKeys.ATTACK]: (
        <div>
            <strong>ATTACK:</strong> Deals PHYSICAL DAMAGE equal to the user's
            STR.
        </div>
    ),

    [actionKeys.HEAL]: (
        <div>
            <strong>HEAL:</strong> Converts MANA into HP. Maximum healing is
            limited by both missing HP and current MANA. Cleanses POISON.
        </div>
    ),

    [actionKeys.GUARD]: (
        <div>
            <strong>GUARD:</strong> Restores MANA equal to 30% of MAX MANA and
            enters GUARDING state until next turn start. Cannot gain MANA
            OVERFLOW this way.
        </div>
    ),

    [actionKeys.SPECIAL_ATTACK]: (
        <div>
            <strong>SPECIAL ATTACK:</strong> Consumes 6 MANA. Deals PIERCING
            DAMAGE equal to the user's STR + MANA IMBALANCE. The target restores
            MANA equal to the MANA IMBALANCE value. If this restoration exceeds
            MAX MANA, the excess becomes MANA OVERFLOW.
        </div>
    ),

    [actionKeys.SACRIFICE]: (
        <div>
            <strong>SELF-SACRIFICE:</strong> Takes TRUE DAMAGE equal to half of
            current HP. Gains BLOOD SACRIFICE and MAX MANA equal to the HP lost
            this way, then enters SACRIFICIAL state until next turn start.
        </div>
    ),

    [actionKeys.ARRAY]: (
        <div>
            <strong>ARRAY:</strong> Envelops the battlefield in a magical array
            for the next 2 turns. Consumes all MANA and MANA OVERFLOW from every
            entity, then grants SHACKLED MANA equal to the amount consumed on
            each entity. While active, all entities gain THORNED SHACKLES, and
            ARRAY is replaced with CURSE.
        </div>
    ),

    [actionKeys.CURSE]: (
        <div>
            <strong>CURSE:</strong> Consumes all SHACKLED MANA from every
            entity. Each entity gains POISON equal to the amount consumed on
            self, then ARRAY ends.
        </div>
    ),

    [actionKeys.AEGIS]: (
        <div>
            <strong>AEGIS:</strong> Enters RADIANT state. Gains HALO equal to
            the user's DEF.
        </div>
    ),

    [actionKeys.SHADOW_PACT]: (
        <div>
            <strong>SHADOW PACT:</strong> Enters UMBRAL CORE. Burns 5 RESOURCES,
            then gains SHADOWFLAME equal to the amount burned. Cannot burn
            SHADOWFLAME, LINGERING EMBER and UNRELENTING SHADOWS. Exits all
            other states, except THORNED SHACKLES.
        </div>
    ),

    [actionKeys.BLACK_MAYHEM]: (
        <div>
            <strong>BLACK MAYHEM:</strong> Burns the target's RESOURCES equal to
            the user's SHADOWFLAME. Grants CINDERS to the target equal to the
            RESOURCES burnt. When burning CINDERS, grants LINGERING EMBER to
            self instead. Cannot burn SHADOWFLAME, LINGERING EMBER and
            UNRELENTING SHADOWS.
        </div>
    ),

    [actionKeys.SHADOW_MANTLE]: (
        <div>
            <strong>SHADOW MANTLE:</strong> Gains UNRELENTING SHADOWS equal to
            SHADOWFLAME on self. Then, enters DARK EMBRACE until next turn
            start.
        </div>
    ),

    [actionKeys.RITUAL_OF_ASH]: (
        <div>
            <strong>RITUAL OF ASH:</strong> Extinguishes all SHADOWFLAME, then
            gains LINGERING EMBER equal to the amount lost.
        </div>
    ),

    [actionKeys.DARK_PROMISE]: (
        <div>
            <strong>DARK PROMISE:</strong> Exits UMBRAL CORE and enters DIMMING
            DARKNESS until next turn start. Loses all SHADOWFLAME, LINGERING
            EMBER and CINDERS, then grants UNRELENTING SHADOWS to all entities
            equal to the SHADOWFLAME lost plus half the LINGERING EMBER lost.
        </div>
    ),

    [actionKeys.WHEEL]: (
        <div>
            <strong>[WHEEL]:</strong> Activates the ELEMENTAL WHEEL. If already
            active, turns the WHEEL.
        </div>
    ),

    [actionKeys.ATTUNE]: (
        <div>
            <strong>ATTUNE:</strong> Enters RESONANT state.
        </div>
    ),

    [actionKeys.DA_CAPO]: (
        <div>
            <strong>DA CAPO:</strong> Usable at 0 SONORITY. Restores the user's
            condition to what it was at the beginning of battle.
        </div>
    ),

    [actionKeys.SOUND_OF_SILENCE]: (
        <div>
            <strong>THE SOUND OF SILENCE:</strong> Usable at negative SONORITY.
            Reverses current SONORITY and restores RESOURCES on self by the
            difference.
        </div>
    ),

    [actionKeys.BABEL]: (
        <div>
            <strong>BABEL:</strong> Usable at positive SONORITY. Reverses
            current SONORITY and deals TRUE DAMAGE to the opponent by the
            difference.
        </div>
    ),

    [actionKeys.DEPLOY]: (
        <div>
            <strong>DEPLOY:</strong> Enters DEPLOYMENT state.
        </div>
    ),

    [actionKeys.LASER]: (
        <div>
            <strong>LASER:</strong> Consumes MANA based on current OVERHEAT.
            Deals 1 PIERCING DAMAGE and gains OVERHEAT based on the amount of
            times LASER was used this turn. Does not end the turn.
        </div>
    ),

    [actionKeys.MELTDOWN]: (
        <div>
            <strong>MELTDOWN:</strong> Deals PHYSICAL DAMAGE to all entities
            based on current OVERHEAT, then enters VENTING state.
        </div>
    ),
};

export const EFFECT_DESCRIPTIONS = {
    [effectKeys.GUARDING_STATE]: (
        <div>
            <strong>[GUARDING]:</strong> Raises DEF EFFECTIVENESS and DAMAGE
            REDUCTION by 50%.
        </div>
    ),

    [effectKeys.MANA_IMBALANCE]: (
        <div>
            <strong>[MANA IMBALANCE]:</strong> The difference between the user's
            and target's current MANA. If the target has equal or greater MANA,
            the value is 0.
        </div>
    ),

    [effectKeys.MANA_OVERFLOW]: (
        <div>
            <strong>[MANA OVERFLOW]:</strong> Used before MANA by abilities that
            consume MANA. At turn end, all MANA OVERFLOW is lost and self takes
            TRUE DAMAGE equal to the amount lost.
        </div>
    ),

    [effectKeys.SACRIFICIAL_STATE]: (
        <div>
            <strong>[SACRIFICIAL]:</strong> Raises DAMAGE REDUCTION by 50%.
        </div>
    ),

    [effectKeys.MANA_BLEED]: (
        <div>
            <strong>[MANA BLEED]:</strong> At turn start, loses MANA equal to
            half of current BLOOD SACRIFICE and restores an equal amount of HP.
        </div>
    ),

    [effectKeys.THORNED_SHACKLES]: (
        <div>
            <strong>[THORNED SHACKLES]:</strong> At turn end, consumes all MANA
            and MANA OVERFLOW, then grants SHACKLED MANA equal to the amount
            consumed. When attacked, the attacker takes TRUE DAMAGE equal to
            their own STR.
        </div>
    ),

    [effectKeys.SHACKLED_MANA]: (
        <div>
            <strong>[SHACKLED MANA]:</strong> At turn start, gains 3 SHACKLED
            MANA while ARRAY is active. When ARRAY ends, all SHACKLED MANA is
            consumed and distributed evenly as MANA among all entities. Excess
            MANA becomes MANA OVERFLOW.
        </div>
    ),

    [effectKeys.POISON]: (
        <div>
            <strong>[POISON]:</strong> At turn start, takes TRUE DAMAGE equal to
            current POISON stacks.
        </div>
    ),

    [effectKeys.RADIANCE]: (
        <div>
            <strong>[RADIANCE]:</strong> When using ATTACK, consumes RADIANCE to
            increase PHYSICAL and PIERCING DAMAGE dealt.
        </div>
    ),

    [effectKeys.RESOURCES]: (
        <div>
            <strong>[RESOURCES]:</strong> Includes SHADOWFLAME, UNRELENTING
            SHADOWS, LINGERING EMBER, CINDERS, POISON, MANA OVERFLOW, SHACKLED
            MANA, BLOOD SACRIFICE, DIVINITY, HALO, RADIANCE, OVERHEAT, MANA, and
            HP. When RESOURCES are consumed, they are consumed in this order.
            When RESOURCES are restored, they are restored in reverse order.
        </div>
    ),

    [effectKeys.UMBRAL_CORE]: (
        <div>
            <strong>[UMBRAL CORE]:</strong> Replaces all actions with SHADOW
            MANTLE, BLACK MAYHEM, RITUAL OF ASH, and DARK PROMISE.
        </div>
    ),

    [effectKeys.SHADOWFLAME]: (
        <div>
            <strong>[SHADOWFLAME]:</strong> At turn start, burns RESOURCES equal
            to current SHADOWFLAME, then gains SHADOWFLAME equal to the amount
            burned. Cannot burn SHADOWFLAME, LINGERING EMBER and UNRELENTING
            SHADOWS. When burning RADIANCE, gains UNRELENTING SHADOWS by the
            amount burned.
        </div>
    ),

    [effectKeys.DARK_EMBRACE]: (
        <div>
            <strong>[DARK EMBRACE]:</strong> Raises DAMAGE REDUCTION by 50%.
            While active, SHADOWFLAME on self does not burn RESOURCES.
        </div>
    ),

    [effectKeys.LINGERING_EMBER]: (
        <div>
            <strong>[LINGERING EMBER]:</strong> Cannot be consumed by
            SHADOWFLAME. When suffering PHYSICAL or PIERCING DAMAGE from enemy
            attacks, consumes LINGERING EMBER to reduce the damage taken. Gains
            CINDERS equal to the amount lost this way. At turn start, converts
            half of current LINGERING EMBER into both SHADOWFLAME and CINDERS.
        </div>
    ),

    [effectKeys.DIMMING_DARKNESS]: (
        <div>
            <strong>[DIMMING DARKNESS]:</strong> Does not activate POISON and
            MANA OVERFLOW effects on self.
        </div>
    ),

    [effectKeys.CINDERS]: (
        <div>
            <strong>[CINDERS]:</strong> No effect.
        </div>
    ),

    [effectKeys.RADIANT]: (
        <div>
            <strong>[RADIANT]:</strong> Nullifies DEF EFFECTIVENESS.
        </div>
    ),

    [effectKeys.BLOOD_SACRIFICE]: (
        <div>
            <strong>[BLOOD SACRIFICE]:</strong> Increases PHYSICAL DAMAGE dealt
            by the stack when using ATTACK. Causes MANA BLEED at turn start.
        </div>
    ),

    [effectKeys.UNRELENTING_SHADOWS]: (
        <div>
            <strong>[UNRELENTING SHADOWS]:</strong> At turn start, loses all
            UNRELENTING SHADOWS. Then, gains RESOURCES based on the UNRELENTING
            SHADOWS lost this way.
        </div>
    ),

    [effectKeys.ELEMENTAL_WHEEL]: (
        <div>
            <strong>[ELEMENTAL WHEEL]:</strong> While active, grants a passive
            effect based on the current element. When activated or turned,
            activates the active effect of the incoming element.
        </div>
    ),

    [effectKeys.FROST]: (
        <div>
            <strong>[FROST]:</strong> Passive: Does not activate POISON, MANA
            OVERFLOW, and MANA BLEED effects on self. Active: Gains 5
            PERMAFROST.
        </div>
    ),

    [effectKeys.NATURE]: (
        <div>
            <strong>[NATURE]:</strong> Passive: At turn start, restores 2 HP and
            3 MANA. Excess MANA becomes MANA OVERFLOW. Active: Gains 5
            OVERGROWTH.
        </div>
    ),

    [effectKeys.SCORCH]: (
        <div>
            <strong>[SCORCH]:</strong> Passive: At turn end, deals 3 TRUE DAMAGE
            to all entities. Active: Gains 5 SCORIA.
        </div>
    ),

    [effectKeys.PERMAFROST]: (
        <div>
            <strong>[PERMAFROST]:</strong> Reduces PHYSICAL and PIERCING DAMAGE
            taken by current PERMAFROST.
        </div>
    ),

    [effectKeys.OVERGROWTH]: (
        <div>
            <strong>[OVERGROWTH]:</strong> Increases MAX HP. Upon gaining
            OVERGROWTH, restores HP equal to the amount gained.
        </div>
    ),

    [effectKeys.SCORIA]: (
        <div>
            <strong>[SCORIA]:</strong> Increases PHYSICAL and PIERCING DAMAGE
            dealt by current SCORIA.
        </div>
    ),

    [effectKeys.SONORITY]: (
        <div>
            <strong>[SONORITY]:</strong> Starts at 0 and ranges from -5 to 5.
            Increases when using DEFENSIVE ACTIONS. Decreases when using
            OFFENSIVE ACTIONS.
        </div>
    ),

    [effectKeys.RESONANT]: (
        <div>
            <strong>[RESONANT]:</strong> Enables SONORITY. Deals higher or lower
            PHYSICAL and PIERCING DAMAGE according to SONORITY. Takes higher or
            lower PHYSICAL and PIERCING DAMAGE according to SONORITY. At
            positive SONORITY, replaces ATTUNE with BABEL. At negative SONORITY,
            replaces ATTUNE with THE SOUND OF SILENCE. At 0 SONORITY, replaces
            ATTUNE with DA CAPO.
        </div>
    ),

    [effectKeys.HALO]: (
        <div>
            <strong>[HALO]:</strong> When taking PHYSICAL or PIERCING DAMAGE,
            consumes HALO to reduce the damage taken. Gain RADIANCE equal to the
            HALO lost this way.
        </div>
    ),

    [effectKeys.DIVINITY]: (
        <div>
            <strong>[DIVINITY]:</strong> Raises DAMAGE REDUCTION by 1% per
            DIVINITY on self.
        </div>
    ),

    [effectKeys.PHYSICAL_DAMAGE]: (
        <div>
            <strong>[PHYSICAL_DAMAGE]:</strong> Reduces the target HP. Can be
            blocked by DEF, reduced by DAMAGE REDUCTION and mitigated by
            shielding effects.
        </div>
    ),

    [effectKeys.PIERCING_DAMAGE]: (
        <div>
            <strong>[PIERCING_DAMAGE]:</strong> Reduces the target HP. Ignores
            DEF, but can be reduced by DAMAGE REDUCTION and mitigated by
            shielding effects.
        </div>
    ),

    [effectKeys.TRUE_DAMAGE]: (
        <div>
            <strong>[TRUE_DAMAGE]:</strong> Reduces the target HP. Cannot be
            blocked by DEF, reduced by DAMAGE REDUCTION or mitigated by
            shielding effects.
        </div>
    ),
    [effectKeys.DEPLOYMENT]: (
        <div>
            <strong>[DEPLOYMENT]:</strong> Raises DAMAGE REDUCTION by 50%. At
            turn start, becomes WEAPONS DEPLOYED.
        </div>
    ),

    [effectKeys.WEAPONS_DEPLOYED]: (
        <div>
            <strong>[WEAPONS DEPLOYED]:</strong> Enables OVERHEAT. Replaces
            DEPLOY with LASER. At 10 or more OVERHEAT, becomes THERMAL OVERLOAD.
        </div>
    ),

    [effectKeys.OVERHEAT]: (
        <div>
            <strong>[OVERHEAT]:</strong> Increases the MANA cost of LASER.
        </div>
    ),

    [effectKeys.THERMAL_OVERLOAD]: (
        <div>
            <strong>[THERMAL OVERLOAD]:</strong> Enables OVERHEAT. Replaces all
            actions with MELTDOWN.
        </div>
    ),

    [effectKeys.VENTING]: (
        <div>
            <strong>[VENTING]:</strong> Enables OVERHEAT. Cannot use DEPLOY. At
            turn start, loses 5 OVERHEAT. At 0 OVERHEAT, lose this state.
        </div>
    ),
};
