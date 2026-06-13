import { actionKeys, effectKeys } from "./enums";

export const ACTION_DESCRIPTIONS = {
    [actionKeys.ATTACK]: (
        <div>
            <strong>ATTACK:</strong> Deals damage equal to the user's STR. Final
            damage is reduced by the target's DEF and DAMAGE REDUCTION.
        </div>
    ),

    [actionKeys.HEAL]: (
        <div>
            <strong>HEAL:</strong> Converts MANA into HP. Healing cannot exceed
            MAX HP, and MANA cannot drop below 0. Maximum healing is limited by
            both missing HP and current MANA. Cleanses POISON.
        </div>
    ),

    [actionKeys.GUARD]: (
        <div>
            <strong>GUARD:</strong> Restores MANA equal to 30% of MAX MANA and
            enters GUARDING state until next turn start.
        </div>
    ),

    [actionKeys.SPECIAL_ATTACK]: (
        <div>
            <strong>SPECIAL ATTACK:</strong> Consumes 6 MANA. Deals damage equal
            to the user's STR + MANA IMBALANCE. This damage ignores DEF. The
            target restores MANA equal to the MANA IMBALANCE value. If this
            restoration exceeds MAX MANA, the excess becomes MANA OVERFLOW.
        </div>
    ),

    [actionKeys.SACRIFICE]: (
        <div>
            <strong>SELF-SACRIFICE:</strong> Takes damage equal to half of
            current HP. Gains BLOOD SACRIFICE and MAX MANA equal to the HP lost
            this way, then enters SACRIFICIAL state until next turn start.
        </div>
    ),

    [actionKeys.ARRAY]: (
        <div>
            <strong>ARRAY:</strong> Envelops the battlefield in a magical array
            for 3 turns. Consumes all MANA and MANA OVERFLOW from every entity,
            then grants SHACKLED MANA equal to the amount consumed on each
            entity. While active, all entities gain THORNED SHACKLES, and ARRAY
            is replaced with CURSE.
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
            <strong>AEGIS:</strong> Gains RADIANCE equal to the user's DEF.
            Enters RADIANT state until next turn start.
        </div>
    ),

    [actionKeys.SHADOW_PACT]: (
        <div>
            <strong>SHADOW PACT:</strong> Enters UMBRAL CORE. Burns 5 RESOURCES,
            then gains SHADOWFLAME equal to the amount burned. Cannot burn
            SHADOWFLAME, LINGERING EMBER and UNRELENTING SHADOWS. When burning
            RADIANCE, gains UNRELENTING SHADOWS by the amount burned.
        </div>
    ),

    [actionKeys.BLACK_MAYHEM]: (
        <div>
            <strong>BLACK MAYHEM:</strong> Burns the target's RESOURCES equal to
            the user's SHADOWFLAME. Grants CINDERS to the target equal to the
            RESOURCES burnt. When burning CINDERS, grants LINGERING EMBER to
            self instead. Cannot burn SHADOWFLAME, LINGERING EMBER and
            UNRELENTING SHADOWS. When burning RADIANCE, gains UNRELENTING
            SHADOWS by the amount burned.
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
            <strong>ATTUNE:</strong> Enters HARMONIOUS state and forces the
            target into DISSONANT state. Enables SONORITY on the battlefield.
        </div>
    ),

    [actionKeys.DA_CAPO]: (
        <div>
            <strong>DA CAPO:</strong> Exits HARMONIOUS state and ejects the
            target from DISSONANT state. All entities gain DISSONANCE based on
            negative SONORITY. Disables SONORITY on the battlefield.
        </div>
    ),

    [actionKeys.SOUND_OF_SILENCE]: (
        <div>
            <strong>THE SOUND OF SILENCE:</strong> Exits DISSONANT state and
            ejects the target from HARMONIOUS state. All entities gain HARMONY
            based on positive SONORITY. Disables SONORITY on the battlefield.
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
            damage equal to the amount lost.
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
            MANA cannot drop below 0, and HP cannot exceed MAX HP.
        </div>
    ),

    [effectKeys.THORNED_SHACKLES]: (
        <div>
            <strong>[THORNED SHACKLES]:</strong> At turn end, consumes all MANA
            and MANA OVERFLOW, then grants SHACKLED MANA equal to the amount
            consumed. When attacked, the attacker takes damage equal to their
            own STR.
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
            <strong>[POISON]:</strong> At turn start, takes damage equal to
            current POISON stacks.
        </div>
    ),

    [effectKeys.RADIANCE]: (
        <div>
            <strong>[RADIANCE]:</strong> When using ATTACK or SPECIAL ATTACK,
            consumes RADIANCE to increase damage dealt. When suffering damage
            from enemy attacks, consumes RADIANCE to reduce damage taken.
        </div>
    ),

    [effectKeys.RESOURCES]: (
        <div>
            <strong>[RESOURCES]:</strong> Includes SHADOWFLAME, UNRELENTING
            SHADOWS, LINGERING EMBER, CINDERS, POISON, MANA OVERFLOW, SHACKLED
            MANA, BLOOD SACRIFICE, FADING LIGHT, RADIANCE, MANA, and HP.
            Resources are consumed in this order and restored in reverse. HP
            cannot exceed MAX HP. Excess MANA gained this way becomes MANA
            OVERFLOW.
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
            SHADOWFLAME. When suffering damage from enemy attacks, consumes
            LINGERING EMBER to reduce damage taken. Gains CINDERS equal to the
            amount lost this way. At turn start, converts half of current
            LINGERING EMBER into both SHADOWFLAME and CINDERS.
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
            <strong>[RADIANT]:</strong> Nullifies DEF EFFECTIVENESS. When
            attacked, all RADIANCE lost on self is converted into FADING LIGHT
            for the attacker. Additionally, as long as self has MANA, take
            damage on MANA instead of HP.
        </div>
    ),

    [effectKeys.BLOOD_SACRIFICE]: (
        <div>
            <strong>[BLOOD SACRIFICE]:</strong> Increases damage dealt by the
            stack when using ATTACK. Causes MANA BLEED at turn start.
        </div>
    ),

    [effectKeys.UNRELENTING_SHADOWS]: (
        <div>
            <strong>[UNRELENTING SHADOWS]:</strong> At turn start, loses all
            UNRELENTING SHADOWS. Then, gains RESOURCES based on the UNRELENTING
            SHADOWS lost this way.
        </div>
    ),

    [effectKeys.FADING_LIGHT]: (
        <div>
            <strong>[FADING LIGHT]:</strong> When suffering damage from enemy
            attacks, consumes FADING LIGHT to reduce damage taken. At turn
            start, loses all FADING LIGHT and restores HP by the amount lost
            this way.
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
            OVERFLOW, FADING LIGHT, and MANA BLEED effects on self. Active:
            Gains 5 PERMAFROST.
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
            <strong>[SCORCH]:</strong> Passive: At turn end, deals 3 damage to
            all entities. This damage ignores DEF and DAMAGE REDUCTION. Active:
            Gains 5 SCORIA.
        </div>
    ),

    [effectKeys.PERMAFROST]: (
        <div>
            <strong>[PERMAFROST]:</strong> Reduces damage taken from ATTACK and
            SPECIAL ATTACK by current PERMAFROST.
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
            <strong>[SCORIA]:</strong> Increases ATTACK and SPECIAL ATTACK
            damage by current SCORIA.
        </div>
    ),

    [effectKeys.SONORITY]: (
        <div>
            <strong>[SONORITY]:</strong> Starts at 0 and ranges from -5 to 5.
            Increases when using DEFENSIVE ACTIONS. Decreases when using
            OFFENSIVE ACTIONS.
        </div>
    ),

    [effectKeys.HARMONIOUS]: (
        <div>
            <strong>[HARMONIOUS]:</strong> Deals higher or lower damage
            proportionally to current SONORITY. Replaces ATTUNE with DA CAPO.
        </div>
    ),

    [effectKeys.DISSONANT]: (
        <div>
            <strong>[DISSONANT]:</strong> Deals higher or lower damage
            proportionally to inverse SONORITY. Replaces ATTUNE with THE SOUND
            OF SILENCE.
        </div>
    ),

    [effectKeys.HARMONY]: (
        <div>
            <strong>[HARMONY]:</strong> Gained based on positive SONORITY. At
            turn end, consumes all HARMONY and restores HP equal to the amount
            consumed.
        </div>
    ),

    [effectKeys.DISSONANCE]: (
        <div>
            <strong>[DISSONANCE]:</strong> Gained based on negative SONORITY. At
            turn start, consumes all DISSONANCE and takes damage equal to the
            amount consumed.
        </div>
    ),
};
