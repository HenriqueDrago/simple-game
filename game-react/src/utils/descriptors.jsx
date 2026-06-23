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
            <strong>HEAL:</strong> Converts MANA into HEALTH and cleanses POISON.
            Maximum healing is limited by both missing HEALTH and current MANA.
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
            DAMAGE equal to the user's STR plus MANA IMBALANCE. The target
            restores MANA equal to the MANA IMBALANCE value. If this restoration
            exceeds MAX MANA, the excess becomes MANA OVERFLOW.
        </div>
    ),

    [actionKeys.SACRIFICE]: (
        <div>
            <strong>SELF-SACRIFICE:</strong> Takes TRUE DAMAGE equal to half of
            current HEALTH. Gains BLOOD SACRIFICE and MAX MANA equal to the HEALTH lost
            this way, then enters SACRIFICIAL state until next turn start.
        </div>
    ),

    [actionKeys.ARRAY]: (
        <div>
            <strong>ARRAY:</strong> Envelops the battlefield in a RUNIC ARRAY
            for 3 turns. Consumes all MANA and MANA OVERFLOW from every entity,
            then grants SHACKLED MANA equal to the amount consumed on each
            entity.
        </div>
    ),

    [actionKeys.CURSE]: (
        <div>
            <strong>CURSE:</strong> Consumes all SHACKLED MANA from every
            entity. Each entity gains POISON equal to the amount consumed on
            self, then RUNIC ARRAY ends.
        </div>
    ),

    [actionKeys.AEGIS]: (
        <div>
            <strong>AEGIS:</strong> Gains HALO equal to twice your DEF. Enter
            RADIANT state until next turn.
        </div>
    ),

    [actionKeys.SHADOW_PACT]: (
        <div>
            <strong>SHADOW PACT:</strong> Enters UMBRAL CORE and exits all other
            states. Burns 5 RESOURCES, then gains SHADOWFLAME equal to the
            amount burned. Cannot burn SHADOWFLAME, LINGERING EMBER and
            UNRELENTING SHADOWS.
        </div>
    ),

    [actionKeys.BLACK_MAYHEM]: (
        <div>
            <strong>BLACK MAYHEM:</strong> Burns the target's RESOURCES equal to
            the user's SHADOWFLAME. Grants CINDERS to the target equal to the
            RESOURCES burnt. When burning CINDERS, gains LINGERING EMBER on self
            instead. Cannot burn SHADOWFLAME, LINGERING EMBER and UNRELENTING
            SHADOWS.
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
            <strong>RITUAL OF ASH:</strong> Extinguishes all SHADOWFLAME on
            self, then gains LINGERING EMBER equal to the amount lost.
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
            <strong>LASER:</strong> Deals 1 PIERCING DAMAGE and gains OVERHEAT
            based on the amount of times LASER was used this turn. Does not end
            turn.
        </div>
    ),

    [actionKeys.MELTDOWN]: (
        <div>
            <strong>MELTDOWN:</strong> All entities take PHYSICAL DAMAGE based
            on current OVERHEAT, then enters VENTING state.
        </div>
    ),

    [actionKeys.ALIGN]: (
        <div>
            <strong>ALIGN:</strong> If not on ALIGNED state, enters ALIGNED
            state. If WHEEL is inactive, activates WHEEL on NATURE and gain 3 of
            each ELEMENTAL ESSENCE. Otherwise, gains 5 ELEMENTAL ESSENCE of the
            current element.
        </div>
    ),

    [actionKeys.GRACE_OF_HEAVENS]: (
        <div>
            <strong>GRACE OF HEAVENS:</strong> Restores RESOURCES for the
            opponent equal to the REVELATION on self.
        </div>
    ),

    [actionKeys.SERAPH_OF_CONDEMNATION]: (
        <div>
            <strong>SERAPH OF CONDEMNATION:</strong> Inflicts TARNISHED_SIN on
            the opponent equal to the REVELATION on self.
        </div>
    ),

    [actionKeys.GIFT_OF_APOTHEOSIS]: (
        <div>
            <strong>GIFT OF APOTHEOSIS:</strong> Swaps your current condition
            with the opponent's and vice-versa. Cannot be used if the opponent
            is in the ASCENDENCE OF SPIRIT state.
        </div>
    ),

    [actionKeys.THE_WORD_MADE_FLESH]: (
        <div>
            <strong>THE WORD MADE FLESH:</strong> Exits ASCENDENCE OF SPIRIT and
            enters CUTOFF WINGS state. Then, inflicts BURDEN OF STIGMA on the
            opponent.
        </div>
    ),

    [actionKeys.CELESTIAL_SCALE]: (
        <div>
            <strong>CELESTIAL SCALE:</strong> Redistributes ENLIGHTENMENT and
            INSIGHT evenly on self.
        </div>
    ),

    [actionKeys.BAPTISM_OF_THE_FLAMES]: (
        <div>
            <strong>BAPTISM OF THE FLAMES:</strong> Converts all RESOURCES on
            self into SACRED FLAMES, and absorbs all SACRED FLAMES on the
            battlefield into self. Then, consumes all SACRED FLAMES on self and
            restores RESOURCES based on the amount consumed.
        </div>
    ),

    [actionKeys.SACRAMENT]: (
        <div>
            <strong>SACRAMENT:</strong> Gains BENEDICTION based on twice the
            REVELATION on self.
        </div>
    ),

    [actionKeys.EDICT_OF_SEVERANCE]: (
        <div>
            <strong>EDICT OF SEVERANCE:</strong> ???
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
            consume MANA. At turn end, all MANA OVERFLOW is lost and take TRUE
            DAMAGE on self equal to the amount lost.
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
            half of current BLOOD SACRIFICE and restores an equal amount of HEALTH.
        </div>
    ),

    [effectKeys.RUNIC_ARRAY]: (
        <div>
            <strong>[RUNIC ARRAY]:</strong> While active, enables ARRAY TURN at
            round end. On ARRAY TURN, consumes all MANA and MANA OVERFLOW from
            all entities, then grants SHACKLED MANA equal to the amount consumed
            on each entity. Furthermore, on ARRAY TURN, grants every player 3
            SHACKLED MANA. Additionally, if RUNIC ARRAY is about to end, consume
            all SHACKLED MANA on all entities, then distributes it evenly as
            MANA and MANA OVERFLOW between all entities. While RUNIC ARRAY is
            active, replaces ARRAY with CURSE, and all entities gain THORNED
            SHACKLES.
        </div>
    ),

    [effectKeys.THORNED_SHACKLES]: (
        <div>
            <strong>[THORNED SHACKLES]:</strong> When suffering PHYSICAL DAMAGE,
            the attacker takes TRUE DAMAGE equal to their own STR.
        </div>
    ),

    [effectKeys.SHACKLED_MANA]: (
        <div>
            <strong>[SHACKLED MANA]:</strong> Inactive. Cannot be used as MANA.
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
            <strong>[RADIANCE]:</strong> When using ATTACK, consumes all
            RADIANCE on self to increase the damage dealt.
        </div>
    ),

    [effectKeys.RESOURCES]: (
        <div>
            <strong>[RESOURCES]:</strong> Includes SHADOWFLAME, UNRELENTING
            SHADOWS, LINGERING EMBER, CINDERS, POISON, MANA OVERFLOW, SHACKLED
            MANA, CRYOGENESIS, HALO, BENEDICTION, RADIANCE, BLOOD SACRIFICE,
            SACRED FLAMES, OVERHEAT, MANA, HEALTH, TARNISHED_SIN, INSIGHT and
            ENLIGHTENMENT. When RESOURCES are consumed, they are consumed in
            this order. When RESOURCES are restored, they are restored in
            reverse order. Cannot restore INSIGHT or ENLIGHTENMENT outside of
            ASCENDENCE OF SPIRIT state.
        </div>
    ),

    [effectKeys.UMBRAL_CORE]: (
        <div>
            <strong>[UMBRAL CORE]:</strong> Replaces all actions with SHADOW
            MANTLE, BLACK MAYHEM, RITUAL OF ASH, and DARK PROMISE. At turn
            start, if at no SHADOWFLAME and LINGERING EMBER on self, exit UMBRAL
            CORE and gain BLEAK DECEPTION.
        </div>
    ),

    [effectKeys.SHADOWFLAME]: (
        <div>
            <strong>[SHADOWFLAME]:</strong> At turn start, burns RESOURCES equal
            to current SHADOWFLAME, then gains SHADOWFLAME equal to the amount
            burned. Cannot burn SHADOWFLAME, LINGERING EMBER and UNRELENTING
            SHADOWS.
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
            <strong>[RADIANT]:</strong> Nullifies all DEF effectiveness.
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
            UNRELENTING SHADOWS. Then, restores RESOURCES based on the
            UNRELENTING SHADOWS lost this way.
        </div>
    ),

    [effectKeys.ALIGNED]: (
        <div>
            <strong>[ALIGNED]:</strong> While the WHEEL is active, suffers the
            effects of the current element's passive effect. If at least one
            player has ALIGNED in the battlefield, enables WHEEL TURN at round
            end.
        </div>
    ),

    [effectKeys.WHEEL]: (
        <div>
            <strong>[WHEEL]:</strong> During WHEEL TURN, cycles to the next
            element and enables its passive effect. Follows the order: NATURE →
            FROST → SCORCH, then repeats.
        </div>
    ),

    [effectKeys.NATURE]: (
        <div>
            <strong>[NATURE]:</strong> Passive Effect - All ALIGNED entities
            restore +50% RESOURCES. Active Effect - Restore RESOURCES by
            OVERGROWTH on self.
        </div>
    ),

    [effectKeys.FROST]: (
        <div>
            <strong>[FROST]:</strong> Passive Effect - All ALIGNED entities deal
            and take -50% damage. Active Effect - Gain CRYOGENESIS by PERMAFROST
            on self.
        </div>
    ),

    [effectKeys.CRYOGENESIS]: (
        <div>
            <strong>[CRYOGENESIS]:</strong> When taking PHYSICAL or PIERCING
            DAMAGE, consumes CRYOGENESIS instead of HEALTH. When using an OFFENSIVE
            ACTION, lose all CRYOGENESIS on self.
        </div>
    ),

    [effectKeys.SCORCH]: (
        <div>
            <strong>[SCORCH]:</strong> Passive Effect - All ALIGNED entities
            deal and take +50% damage. Active Effect - Take TRUE DAMAGE by
            SCORIA on self.
        </div>
    ),

    [effectKeys.OVERGROWTH]: (
        <div>
            <strong>[OVERGROWTH]:</strong> Allows self to hold more HEALTH.
        </div>
    ),

    [effectKeys.PERMAFROST]: (
        <div>
            <strong>[PERMAFROST]:</strong> Added to DEF in calculations.
        </div>
    ),

    [effectKeys.SCORIA]: (
        <div>
            <strong>[SCORIA]:</strong> Added to STR in calculations.
        </div>
    ),

    [effectKeys.ELEMENTAL_ESSENCE]: (
        <div>
            <strong>[ELEMENTAL ESSENCE]:</strong> Includes OVERGROWTH,
            PERMAFROST and SCORIA, corresponding to NATURE, FROST and SCORCH
            respectively.
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
            loses HALO instead of HEALTH, then gains RADIANCE based on the amount
            lost. At turn start, converts into ENLIGHTENMENT.
        </div>
    ),

    [effectKeys.ENLIGHTENMENT]: (
        <div>
            <strong>[ENLIGHTENMENT]:</strong> At turn start, if at 100 or more
            ENLIGHTENMENT, enters ASCENDENCE OF SPIRIT state.
        </div>
    ),

    [effectKeys.ASCENDENCE_OF_SPIRIT]: (
        <div>
            <strong>[ASCENDENCE OF SPIRIT]:</strong> Upon entering this state,
            exits all other states and loses all resources on self. Then, gains
            INSIGHT based on the resources consumed. While in this state, cannot
            die by normal means. Furthermore, when taking damage, loses
            ENLIGHTENMENT instead of HEALTH. If at least one player is in this
            state, awakens the EYE OF HEAVENS. While the eye is open, replaces
            all actions with: GRACE OF HEAVENS, CELESTIAL SCALE, SACRAMENT and
            GIFT OF APOTHEOSIS. While the eye is closed, replaces all actions
            with: SERAPH OF CONDEMNATION, BAPTISM OF THE FLAMES, EDICT OF
            SEVERANCE and THE WORD MADE FLESH. When exiting this state, loses
            all RESOURCES on self.
        </div>
    ),

    [effectKeys.EYE_OF_HEAVENS]: (
        <div>
            <strong>[EYE OF HEAVENS]:</strong> While awoken, enables EMINENCE
            TURN at round end. On EMINENCE TURN, if the eye is open, closes the
            eye and consumes all INSIGHT on all entities. Then, grants
            REVELATION to each entity for every 10 INSIGHT they lost on self. If
            the eye is closed, opens the eye and, if an entity in the ASCENDENCE
            OF SPIRIT state has 0 or less ENLIGHTENMENT, removes them from the
            ASCENDENCE OF SPIRIT state and grants them the CUTOFF WINGS state.
            If there's no entity in the ASCENDENCE OF SPIRIT state in the
            battlefield, returns to dormant state.
        </div>
    ),

    [effectKeys.PHYSICAL_DAMAGE]: (
        <div>
            <strong>[PHYSICAL DAMAGE]:</strong> Reduces the target HEALTH. Can be
            blocked by DEF, reduced by DAMAGE REDUCTION and mitigated by
            shielding effects.
        </div>
    ),

    [effectKeys.PIERCING_DAMAGE]: (
        <div>
            <strong>[PIERCING DAMAGE]:</strong> Reduces the target HEALTH. Ignores
            DEF, but can be reduced by DAMAGE REDUCTION and mitigated by
            shielding effects.
        </div>
    ),

    [effectKeys.TRUE_DAMAGE]: (
        <div>
            <strong>[TRUE DAMAGE]:</strong> Reduces the target HEALTH. Cannot be
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
            <strong>[OVERHEAT]:</strong> Gained when using LASER. Using LASER
            multiple times a turn increases OVERHEAT generation.
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
            turn start, loses 5 OVERHEAT. At turn start, if at 0 OVERHEAT, exits
            VENTING and enters WEAPONS DEPLOYED.
        </div>
    ),

    [effectKeys.CUTOFF_WINGS]: (
        <div>
            <strong>[CUTOFF WINGS]:</strong> Cannot use AEGIS. Upon entering
            this state, recovers 1 HEALTH. Upon entering this state, at turn start
            and turn end, sets MAX HEALTH to 1 and reduces current HEALTH accordingly.
        </div>
    ),

    [effectKeys.BLEAK_DECEPTION]: (
        <div>
            <strong>[BLEAK DECEPTION]:</strong> Cannot use SHADOW PACT.
        </div>
    ),

    [effectKeys.SACRED_FLAMES]: (
        <div>
            <strong>[SACRED FLAMES]:</strong> At turn start, consumes RESOURCES
            on self by the stack. Then, restores RESOURCES on self by the stack
            and lose all SACRED FLAMES on self.
        </div>
    ),

    [effectKeys.BENEDICTION]: (
        <div>
            <strong>[BENEDICTION]:</strong> When taking PHYSICAL or PIERCING
            DAMAGE, lose BENEDICTION instead of ENLIGHTENMENT and grants SACRED
            FLAMES to the attacker based on the amount lost. At turn start, lose
            all BENEDICTION and restore RESOURCES based on the amount lost.
        </div>
    ),

    [effectKeys.BURDEN_OF_STIGMA]: (
        <div>
            <strong>[BURDEN OF STIGMA]:</strong> Cannot act. Removed at turn
            end.
        </div>
    ),

    [effectKeys.INSIGHT]: (
        <div>
            <strong>[INSIGHT]:</strong> When gaining INSIGHT above 100, gains
            SACRED FLAMES instead.
        </div>
    ),

    [effectKeys.REVELATION]: (
        <div>
            <strong>[REVELATION]:</strong> Alternative stat. Used for certain
            actions.
        </div>
    ),
};
