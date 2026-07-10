import {
    actionsClass,
    constants,
    freeResources,
    limitedResources,
    presetAi,
} from "./constants.js";
import {
    sdmKeys,
    actionKeys,
    effectKeys,
    dmgTypes,
    elementalKeys,
    eyeKeys,
    moonKeys,
    entityKeys,
    turnStatus,
} from "./enums.js";

export function consumeResources(entity, amount, cause) {
    let draftEntity = {
        ...entity,
        resources: { ...entity.resources },
    };

    let resourcesConsumed = {};
    let resourceIndex = 0;
    let totalConsumption = 0;

    // Free resources consumption
    while (amount > 0 && resourceIndex < freeResources.length) {
        const currResourceKey = freeResources[resourceIndex];

        // Avoid shadowflame (and related actions) burning unintended resources
        // Also avoid Sacred Flames burning themselves
        if (
            !(
                (cause === effectKeys.SHADOWFLAME ||
                    cause === actionKeys.SHADOW_PACT ||
                    cause === actionKeys.BLACK_MAYHEM) &&
                (currResourceKey === effectKeys.SHADOWFLAME ||
                    currResourceKey === effectKeys.LINGERING_EMBER ||
                    currResourceKey === effectKeys.UNRELENTING_SHADOWS)
            ) &&
            !(
                cause === effectKeys.SACRED_FLAMES &&
                currResourceKey === effectKeys.SACRED_FLAMES
            )
        ) {
            const currentAmount = draftEntity.resources[currResourceKey];
            const consumption = Math.min(currentAmount, amount);

            draftEntity = {
                ...draftEntity,
                resources: {
                    ...draftEntity.resources,
                    [currResourceKey]: currentAmount - consumption,
                },
            };

            resourcesConsumed = {
                ...resourcesConsumed,
                [currResourceKey]: consumption,
            };

            totalConsumption += consumption;
            amount -= consumption;
        }

        resourceIndex++;
    }

    resourceIndex = 0;

    // Limited resource consumption, skips if cause is Orange Star/Trail
    if (cause !== effectKeys.ORANGE_STAR && cause !== effectKeys.ORANGE_TRAIL) {
        while (
            amount > 0 &&
            resourceIndex < limitedResources.length &&
            (draftEntity.currHp > 0 ||
                (draftEntity.states.ascendenceOfSpirit &&
                    draftEntity.currEnlit > 0))
        ) {
            const currResourceKey = limitedResources[resourceIndex];

            const currentAmount = draftEntity[currResourceKey];
            const consumption = Math.min(currentAmount, amount);

            draftEntity = {
                ...draftEntity,
                [currResourceKey]: currentAmount - consumption,
            };

            resourcesConsumed = {
                ...resourcesConsumed,
                [currResourceKey]: consumption,
            };

            totalConsumption += consumption;
            amount -= consumption;

            resourceIndex++;
        }
    }

    resourcesConsumed = {
        ...resourcesConsumed,
        totalConsumption: totalConsumption,
    };

    return {
        draftEntity,
        resourcesConsumed,
    };
}

export function restoreResources(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    // Enlightenment
    if (entity[effectKeys.MAX_ENLIGHTENMENT] > 0) {
        const missingEnlit = draftEntity.maxEnlit - draftEntity.currEnlit;
        const restoredEnlit = Math.min(missingEnlit, amount);

        amount -= restoredEnlit;

        draftEntity = {
            ...draftEntity,
            currEnlit: draftEntity.currEnlit + restoredEnlit,
        };
    }

    // Insight
    if (entity[effectKeys.MAX_INSIGHT] > 0) {
        draftEntity = gainInsight(draftEntity, amount);
        return draftEntity; // Early return since restoring insight consumes all
    }

    // Health
    if (entity[effectKeys.MAX_HEALTH] > 0) {
        if (isElementActive(entity, elementalKeys.OCEAN)) {
            draftEntity = gainHp(draftEntity, amount);

            return draftEntity; // Early return since on Ocean all excess Health becomes Silver Blood
        }

        const missingHp = Math.max(
            0,
            getEntityMaxHealth(draftEntity) - draftEntity[effectKeys.HEALTH],
        );
        const restoredHp = Math.min(missingHp, amount);

        amount -= restoredHp;

        draftEntity = gainHp(draftEntity, restoredHp);
    }

    // Mana
    if (entity[effectKeys.MAX_MANA] > 0) {
        draftEntity = gainMana(draftEntity, amount);
        return draftEntity; // Early return since restoring mana consumes all
    }

    // The rest becomes sacred flames (safeguard, currently unreacheable)
    draftEntity = {
        ...draftEntity,
        resources: {
            ...draftEntity.resources,
            [effectKeys.SACRED_FLAMES]:
                draftEntity.resources[effectKeys.SACRED_FLAMES] + amount,
        },
    };

    return draftEntity;
}

export function distributePoints(
    entity,
    mode,
    bestStats = null,
    randomize = false,
) {
    let newEntity = {
        ...entity,
        attributes: {},
    };

    for (let attr of constants.ATTRIBUTE_NAMES) {
        newEntity.attributes[attr] = { ...entity.attributes[attr] };
    }

    switch (mode) {
        case sdmKeys.CUSTOM:
            if (randomize) {
                // Reset points before rolling
                newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
                for (let attr of constants.ATTRIBUTE_NAMES) {
                    newEntity.attributes[attr].points = 0;
                }

                // Roll random stats
                for (let i = 0; i < constants.INITIAL_POINTS_AVAILABLE; i++) {
                    let random_stat =
                        constants.ATTRIBUTE_NAMES[
                            Math.floor(
                                Math.random() *
                                    constants.ATTRIBUTE_NAMES.length,
                            )
                        ];
                    newEntity.attributes[random_stat].points += 1;
                    newEntity.unspentPoints -= 1;
                }
            }
            break;

        case sdmKeys.BEST:
            if (!bestStats) {
                break;
            }
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
            for (let attr of constants.ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: bestStats[attr],
                };
                newEntity.unspentPoints -= bestStats[attr];
            }
            break;

        case sdmKeys.FULL_DEF:
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
            for (let attr of constants.ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: 0,
                };
            }
            newEntity.attributes.def.points = newEntity.unspentPoints;
            newEntity.unspentPoints = 0;
            break;

        case sdmKeys.FULL_STR:
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
            for (let attr of constants.ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: 0,
                };
            }
            newEntity.attributes.str.points = newEntity.unspentPoints;
            newEntity.unspentPoints = 0;
            break;

        default:
            break;
    }

    // Builds values from points
    for (let attr of constants.ATTRIBUTE_NAMES) {
        newEntity.attributes[attr].value =
            constants.BASE_STATS[attr] +
            newEntity.attributes[attr].points *
                constants.STAT_MULTIPLIERS[attr];
    }

    return newEntity;
}

export function createBaseEntity() {
    let baseAttributes = {};

    for (let attr of constants.ATTRIBUTE_NAMES) {
        baseAttributes[attr] = {
            value: constants.BASE_STATS[attr],
            points: 0,
        };
    }

    return {
        // Limited Resources
        maxHp: constants.BASE_STATS.hp,
        currHp: constants.BASE_STATS.hp,
        maxMana: constants.BASE_STATS.mana,
        currMana: constants.BASE_STATS.mana,

        maxEnlit: 0,
        currEnlit: 0,
        maxInsight: 0,
        currInsight: 0,

        // fixed resources
        [effectKeys.TARNISHED_SIN]: 0,
        [effectKeys.DIVINE_SPARK]: 0,
        [effectKeys.DYNAMO]: 0,
        [effectKeys.OVERHEAT]: 0,
        [effectKeys.LUNACY]: 0,

        // special resources
        [effectKeys.BURDEN_OF_STIGMA]: 0,
        [effectKeys.MANA_BLEED]: 0,
        [effectKeys.MOONLIT_TEARS]: 0,

        // alternate stats
        [effectKeys.REVELATION]: 0,
        [effectKeys.ENERGY_LEVEL]: constants.STARTING_ENERGY,
        [effectKeys.MOONLIGHT]: 0,

        // other
        [effectKeys.SONORITY]: constants.STARTING_SONORITY,
        [effectKeys.MIRRORED_MOON]: moonKeys.HIDDEN,
        [effectKeys.ELEMENTAL_CRYSTALS]: [elementalKeys.DULLED],
        lasersUsedThisTurn: 0,

        resources: {
            [effectKeys.MANA_OVERFLOW]: 0,
            [effectKeys.BLOOD_SACRIFICE]: 0,
            [effectKeys.RADIANCE]: 0,
            [effectKeys.SHACKLED_MANA]: 0,
            [effectKeys.POISON]: 0,
            [effectKeys.SHADOWFLAME]: 0,
            [effectKeys.CINDERS]: 0,
            [effectKeys.LINGERING_EMBER]: 0,
            [effectKeys.UNRELENTING_SHADOWS]: 0,
            [effectKeys.HALO]: 0,
            [effectKeys.SACRED_FLAMES]: 0,
            [effectKeys.INSPIRATION]: 0,
            [effectKeys.STARDUST]: 0,
            [effectKeys.DOME]: 0,

            [effectKeys.SILVER_BLOOD]: 0,
            [effectKeys.REFRACTED_DIVINITY]: 0,
            [effectKeys.MOONDUST]: 0,
        },
        states: {
            // standalones
            [effectKeys.GUARDING_STATE]: false,
            [effectKeys.SACRIFICIAL_STATE]: false,

            [effectKeys.STARGAZER]: false,

            // Selenian
            [effectKeys.SELENIAN]: false,
            [effectKeys.PRISMATIC]: false,
            [effectKeys.GIBBOUS]: false,

            // Shadowflame
            [effectKeys.DARK_EMBRACE]: false,
            [effectKeys.DIMMING_DARKNESS]: false,
            [effectKeys.UMBRAL_CORE]: false,
            [effectKeys.BLEAK_DECEPTION]: false,

            // Deploy and sonority
            [effectKeys.DEPLOYMENT]: false,
            [effectKeys.WEAPONS_DEPLOYED]: false,
            [effectKeys.THERMAL_OVERLOAD]: false,
            [effectKeys.VENTING]: false,
            [effectKeys.RESONANT]: false,

            // Aegis
            [effectKeys.RADIANT]: false,
            [effectKeys.CUTOFF_WINGS]: false,
            [effectKeys.ASCENDENCE_OF_SPIRIT]: false,
            [effectKeys.ZENITH_OF_MORTALITY]: false,
            [effectKeys.ABANDONED_BY_GRACE]: false,
            [effectKeys.ANOINTED_PROXY]: false,
        },
        stars: {
            white: 0,
            gray: 0,
            red: 0,
            orange: 0,
            yellow: 0,
            green: 0,
            blue: 0,
            indigo: 0,
            violet: 0,
            dimRed: 0,
            dimOrange: 0,
            dimYellow: 0,
            dimGreen: 0,
            dimBlue: 0,
            dimIndigo: 0,
            dimViolet: 0,
            trailRed: 0,
            trailOrange: 0,
            trailYellow: 0,
            trailGreen: 0,
            trailBlue: 0,
            trailIndigo: 0,
            trailViolet: 0,
        },
        unspentPoints: constants.INITIAL_POINTS_AVAILABLE,
        attributes: baseAttributes,
    };
}

export function processEntityDR(entity) {
    let drMult = 1.0;
    if (entity.states.guarding) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }
    if (entity.states.sacrificial) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }
    if (entity.states.darkEmbrace) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }
    if (entity.states.deployment) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }
    if (entity.states[effectKeys.VENTING]) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }
    if (entity.states[effectKeys.GIBBOUS]) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }

    return drMult;
}

export function processEntityDefEffect(entity) {
    let defEffect = 1.0;
    if (entity.states.guarding) {
        defEffect *= constants.STANDARD_DEF_EFFECT_INCREASE;
    }
    if (entity.states.radiant) {
        defEffect *= constants.RADIANT_DEF_EFFECT_MULTIPLIER;
    }
    if (entity.states[effectKeys.PRISMATIC]) {
        defEffect *= constants.RADIANT_DEF_EFFECT_MULTIPLIER;
    }

    return defEffect;
}

export function processEntityDamageBonus(entity) {
    let dmgBonus = 1.0;

    dmgBonus *= 1 + entity[effectKeys.LUNACY] / 100;

    return dmgBonus;
}

export function processEntityFragility(entity) {
    let frail = 1.0;

    frail *= 1 + entity[effectKeys.LUNACY] / 100;

    return frail;
}

export function processEntityWeakness(entity) {
    let weak = 1.0;

    if (entity) {
        return weak;
    }

    return weak;
}

export function dealDamage(
    attacker,
    defender,
    baseDmg,
    dmgType,
    isArrayActive,
) {
    let draftAttacker = {
        ...attacker,
    };

    let draftDefender = {
        ...defender,
    };

    // dmg types elemental overrides
    const isAtkAsh = isElementActive(draftAttacker, elementalKeys.ASH);
    const isDefWither = isElementActive(draftDefender, elementalKeys.WITHER);

    if (isAtkAsh && dmgType === dmgTypes.PHYSICAL) {
        if (!isDefWither) {
            dmgType = dmgTypes.PIERCING;
        }
    } else if (isDefWither && dmgType === dmgTypes.PIERCING) {
        dmgType = dmgTypes.PHYSICAL;
    }

    const additionalDmg =
        dmgType === dmgTypes.PHYSICAL
            ? draftAttacker.resources.bloodSacrifice + draftAttacker.sonority
            : dmgType === dmgTypes.PIERCING
              ? draftAttacker.sonority
              : 0;

    // Flat reduction
    const effectiveDef =
        dmgType === dmgTypes.PHYSICAL
            ? getEntityDef(draftDefender) *
              processEntityDefEffect(draftDefender)
            : 0;

    const effectiveRevelation =
        dmgType === dmgTypes.PHYSICAL
            ? draftDefender[effectKeys.REVELATION]
            : 0;

    const flatDr =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? -draftDefender.sonority + effectiveDef + effectiveRevelation
            : 0;

    // Multiplicative effects
    const drMult =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? processEntityDR(draftDefender)
            : 1.0;

    const weakMult =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? processEntityWeakness(draftAttacker)
            : 1.0;

    const bonusMult =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? processEntityDamageBonus(draftAttacker)
            : 1.0;

    const frailMult =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? processEntityFragility(draftDefender)
            : 1.0;

    const dmgPostMults = (baseDmg + additionalDmg) * bonusMult * weakMult;

    
    const dmgPostReduction = Math.max(
        1,
        Math.floor((dmgPostMults - flatDr) * drMult * frailMult),
    );

    // Mitigation
    let damagePostMitigation = dmgPostReduction;

    const domeConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(
                  damagePostMitigation,
                  draftDefender.resources[effectKeys.DOME],
              )
            : 0;
    damagePostMitigation -= domeConsumed;

    const haloConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(damagePostMitigation, draftDefender.resources.halo)
            : 0;
    damagePostMitigation -= haloConsumed;

    const divinityConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(
                  damagePostMitigation,
                  draftDefender.resources[effectKeys.REFRACTED_DIVINITY],
              )
            : 0;
    damagePostMitigation -= divinityConsumed;

    const emberConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(
                  damagePostMitigation,
                  draftDefender.resources.lingeringEmber,
              )
            : 0;
    damagePostMitigation -= emberConsumed;

    const defenderNewHalo = draftDefender.resources.halo - haloConsumed;
    const defenderNewEmbers =
        draftDefender.resources.lingeringEmber - emberConsumed;
    const defenderNewDome =
        draftDefender.resources[effectKeys.DOME] - domeConsumed;

    const defenderNewRadiance = draftDefender.resources.radiance + haloConsumed;
    const newCinders = draftDefender.resources.cinders + emberConsumed;

    const newDivinity =
        draftDefender.resources[effectKeys.REFRACTED_DIVINITY] -
        divinityConsumed;
    const newMoondust =
        draftDefender.resources[effectKeys.MOONDUST] + divinityConsumed;

    // Shackled Mana thorns
    const thornsDmg =
        isArrayActive && dmgType === dmgTypes.PHYSICAL
            ? draftDefender.resources[effectKeys.SHACKLED_MANA]
            : 0;

    if (thornsDmg > 0) {
        draftAttacker = takeDamage(draftAttacker, thornsDmg, dmgTypes.PHYSICAL);
    }

    if (draftDefender.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        if (dmgType === dmgTypes.TRUE) {
            draftDefender = gainSin(draftDefender, damagePostMitigation);
        } else {
            draftDefender = loseEnlit(draftDefender, damagePostMitigation);

            draftDefender = {
                ...draftDefender,
                resources: {
                    ...draftDefender.resources,
                    [effectKeys.INSPIRATION]:
                        draftDefender.resources[effectKeys.INSPIRATION] +
                        damagePostMitigation,
                },
            };
        }
    } else {
        draftDefender = loseHp(draftDefender, damagePostMitigation);
    }

    draftDefender = {
        ...draftDefender,
        resources: {
            ...draftDefender.resources,
            [effectKeys.HALO]: defenderNewHalo,
            [effectKeys.LINGERING_EMBER]: defenderNewEmbers,
            [effectKeys.RADIANCE]: defenderNewRadiance,
            [effectKeys.CINDERS]: newCinders,
            [effectKeys.DOME]: defenderNewDome,
            [effectKeys.REFRACTED_DIVINITY]: newDivinity,
            [effectKeys.MOONDUST]: newMoondust,
        },
    };

    // Gibbous Moonlit Gain
    if (
        (dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING) &&
        draftDefender.states[effectKeys.GIBBOUS]
    ) {
        draftDefender = {
            ...draftDefender,
            [effectKeys.MOONLIT_TEARS]:
                draftDefender[effectKeys.MOONLIT_TEARS] +
                constants.GIBBOUS_TEARS_GAIN,
        };
    }

    return {
        attacker: {
            ...draftAttacker,
        },
        defender: {
            ...draftDefender,
        },
    };
}

export function takeDamage(entity, baseDmg, dmgType) {
    let draftEntity = {
        ...entity,
    };

    // Wither override
    if (
        dmgType === dmgTypes.PIERCING &&
        isElementActive(draftEntity, elementalKeys.WITHER)
    ) {
        dmgType = dmgTypes.PHYSICAL;
    }

    // Flat reduction
    const effectiveDef =
        dmgType === dmgTypes.PHYSICAL
            ? getEntityDef(draftEntity) * processEntityDefEffect(draftEntity)
            : 0;

    const effectiveRevelation =
        dmgType === dmgTypes.PHYSICAL ? draftEntity[effectKeys.REVELATION] : 0;

    const flatDr =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? -draftEntity.sonority + effectiveDef + effectiveRevelation
            : 0;

    // Multiplicative effects
    const drMult =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? processEntityDR(entity)
            : 1.0;

    const frailMult =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? processEntityFragility(draftEntity)
            : 1.0;

    const finalDmg = Math.max(
        1,
        Math.floor((baseDmg - flatDr) * drMult * frailMult),
    );

    // Mitigation
    let damagePostMitigation = finalDmg;

    const domeConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(damagePostMitigation, entity.resources[effectKeys.DOME])
            : 0;
    damagePostMitigation -= domeConsumed;

    const haloConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(damagePostMitigation, entity.resources.halo)
            : 0;
    damagePostMitigation -= haloConsumed;

    const divinityConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(
                  damagePostMitigation,
                  draftEntity.resources[effectKeys.REFRACTED_DIVINITY],
              )
            : 0;
    damagePostMitigation -= divinityConsumed;

    const emberConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(damagePostMitigation, entity.resources.lingeringEmber)
            : 0;
    damagePostMitigation -= emberConsumed;

    if (draftEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        if (dmgType === dmgTypes.TRUE) {
            draftEntity = gainSin(draftEntity, damagePostMitigation);
        } else {
            draftEntity = loseEnlit(draftEntity, damagePostMitigation);

            draftEntity = {
                ...draftEntity,
                resources: {
                    ...draftEntity.resources,
                    [effectKeys.INSPIRATION]:
                        draftEntity.resources[effectKeys.INSPIRATION] +
                        damagePostMitigation,
                },
            };
        }
    } else {
        draftEntity = loseHp(draftEntity, damagePostMitigation);
    }

    const newHalo = entity.resources.halo - haloConsumed;
    const newEmbers = entity.resources.lingeringEmber - emberConsumed;
    const newRadiance = entity.resources.radiance + haloConsumed;
    const newCinders = entity.resources.cinders + emberConsumed;
    const newDome = entity.resources[effectKeys.DOME] - domeConsumed;

    const newDivinity =
        entity.resources[effectKeys.REFRACTED_DIVINITY] - divinityConsumed;
    const newMoondust =
        entity.resources[effectKeys.MOONDUST] + divinityConsumed;

    // Gibbous Moonlit Gain
    if (
        (dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING) &&
        draftEntity.states[effectKeys.GIBBOUS]
    ) {
        draftEntity = {
            ...draftEntity,
            [effectKeys.MOONLIT_TEARS]:
                draftEntity[effectKeys.MOONLIT_TEARS] +
                constants.GIBBOUS_TEARS_GAIN,
        };
    }

    return {
        ...draftEntity,
        resources: {
            ...draftEntity.resources,
            [effectKeys.HALO]: newHalo,
            [effectKeys.LINGERING_EMBER]: newEmbers,
            [effectKeys.RADIANCE]: newRadiance,
            [effectKeys.CINDERS]: newCinders,
            [effectKeys.DOME]: newDome,
            [effectKeys.REFRACTED_DIVINITY]: newDivinity,
            [effectKeys.MOONDUST]: newMoondust,
        },
    };
}

export function resetPlayerEntity(prev, entityKey) {
    const currentEntity = prev.entities[entityKey];
    const baseEntity = createBaseEntity();

    baseEntity.controller = currentEntity.controller;
    baseEntity.statDistributionMode = currentEntity.statDistributionMode;
    baseEntity.unspentPoints = currentEntity.unspentPoints;

    for (let attr of constants.ATTRIBUTE_NAMES) {
        baseEntity.attributes[attr].points =
            currentEntity.attributes[attr].points;
    }

    return distributePoints(
        baseEntity,
        currentEntity.statDistributionMode,
        presetAi[currentEntity.controller].best,
    );
}

export function gainEnlit(entity, amount) {
    const newEnlit = Math.min(
        entity[effectKeys.MAX_ENLIGHTENMENT],
        entity[effectKeys.ENLIGHTENMENT] + amount,
    );

    return {
        ...entity,
        [effectKeys.ENLIGHTENMENT]: newEnlit,
    };
}

export function loseEnlit(entity, amount) {
    const newEnlit = Math.max(0, entity[effectKeys.ENLIGHTENMENT] - amount);

    return {
        ...entity,
        [effectKeys.ENLIGHTENMENT]: newEnlit,
    };
}

export function gainSin(entity, amount) {
    const newSin = Math.min(
        entity[effectKeys.TARNISHED_SIN] + amount,
        constants.MAX_TARNISHED_SIN,
    );

    return {
        ...entity,
        [effectKeys.TARNISHED_SIN]: newSin,
    };
}

export function gainInsight(entity, amount) {
    const missingInsight = entity.maxInsight - entity.currInsight;

    const newInsight = Math.min(entity.maxInsight, entity.currInsight + amount);
    const newInspiration =
        entity.resources[effectKeys.INSPIRATION] +
        Math.max(0, amount - missingInsight);

    return {
        ...entity,
        currInsight: newInsight,
        resources: {
            ...entity.resources,
            [effectKeys.INSPIRATION]: newInspiration,
        },
    };
}

export function gainHp(entity, amount) {
    // If on ascendence, restore inspiration and returns early
    if (entity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        const newInspiration =
            entity.resources[effectKeys.INSPIRATION] + amount;
        return {
            ...entity,
            resources: {
                ...entity.resources,
                [effectKeys.INSPIRATION]: newInspiration,
            },
        };
    }

    const missingHp = getEntityMaxHealth(entity) - entity[effectKeys.HEALTH];

    const hpGained = Math.min(missingHp, amount);
    const newHp = entity[effectKeys.HEALTH] + hpGained;

    amount -= hpGained;

    let draftEntity = {
        ...entity,
        [effectKeys.HEALTH]: newHp,
    };

    // If on Ocean, restore Silver Blood past the limit
    if (isElementActive(entity, elementalKeys.OCEAN)) {
        const newSB = entity.resources[effectKeys.SILVER_BLOOD] + amount;

        draftEntity = {
            ...draftEntity,
            resources: {
                ...draftEntity.resources,
                [effectKeys.SILVER_BLOOD]: newSB,
            },
        };
    }

    return draftEntity;
}

export function loseHp(entity, amount) {
    const silverBloodConsumed = Math.min(
        entity.resources[effectKeys.SILVER_BLOOD],
        amount,
    );

    amount -= silverBloodConsumed;
    const newHp = Math.max(0, entity[effectKeys.HEALTH] - amount);

    return {
        ...entity,
        [effectKeys.HEALTH]: newHp,
        resources: {
            ...entity.resources,
            [effectKeys.SILVER_BLOOD]:
                entity.resources[effectKeys.SILVER_BLOOD] - silverBloodConsumed,
        },
    };
}

export function gainMana(entity, amount) {
    // If on ascendence, restore inspiration and returns early
    if (entity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        const newInspiration =
            entity.resources[effectKeys.INSPIRATION] + amount;
        return {
            ...entity,
            resources: {
                ...entity.resources,
                [effectKeys.INSPIRATION]: newInspiration,
            },
        };
    }

    const missingMana = entity.maxMana - entity.currMana;

    const newMana = Math.min(entity.maxMana, entity.currMana + amount);
    const newManaOverflow =
        entity.resources.manaOverflow + Math.max(0, amount - missingMana);

    return {
        ...entity,
        currMana: newMana,
        resources: {
            ...entity.resources,
            manaOverflow: newManaOverflow,
        },
    };
}

export function loseMana(entity, amount) {
    const overflowConsumed = Math.min(amount, entity.resources.manaOverflow);
    const newOverflow = Math.max(
        0,
        entity.resources.manaOverflow - overflowConsumed,
    );

    const newMana = Math.max(0, entity.currMana - (amount - overflowConsumed));

    return {
        ...entity,
        currMana: newMana,
        resources: {
            ...entity.resources,
            manaOverflow: newOverflow,
        },
    };
}

export function processExitStargazer(entity) {
    return {
        ...entity,
        states: {
            ...entity.states,
            [effectKeys.STARGAZER]: false,
        },
        stars: {
            ...createBaseEntity().stars,
        },
    };
}

export function processExitResonant(entity) {
    return {
        ...entity,
        [effectKeys.SONORITY]: 0,
        states: {
            ...entity.states,
            [effectKeys.RESONANT]: false,
        },
    };
}

export function processExitAscendence(entity) {
    let { draftEntity } = consumeResources(
        entity,
        Infinity,
        effectKeys.ASCENDENCE_OF_SPIRIT,
    );

    draftEntity = {
        ...draftEntity,
        [effectKeys.MAX_ENLIGHTENMENT]: 0,
        [effectKeys.MAX_INSIGHT]: 0,
        [effectKeys.REVELATION]: 0,
        states: {
            ...draftEntity.states,
            [effectKeys.ASCENDENCE_OF_SPIRIT]: false,
        },
    };

    return processEnterCutoffWings(draftEntity);
}

export function processExitSelenian(entity) {
    let draftEntity = {
        ...entity,
    };

    draftEntity = takeDamage(
        draftEntity,
        draftEntity[effectKeys.MOONLIGHT],
        dmgTypes.TRUE,
    );

    draftEntity = {
        ...draftEntity,
        [effectKeys.MOONLIGHT]: 0,
        [effectKeys.ELEMENTAL_CRYSTALS]: [],
        [effectKeys.MIRRORED_MOON]: moonKeys.HIDDEN,
    };

    return draftEntity;
}

export function processEnterCutoffWings(entity) {
    let draftEntity = {
        ...entity,
        [effectKeys.HEALTH]: 1,
        [effectKeys.MAX_HEALTH]: 1,
        states: {
            ...entity.states,
            [effectKeys.CUTOFF_WINGS]: true,
        },
    };

    return draftEntity;
}

export function exitAllStates(entity) {
    let draftEntity = {
        ...entity,
    };

    if (draftEntity.states[effectKeys.STARGAZER]) {
        draftEntity = processExitStargazer(draftEntity);
    }
    if (draftEntity.states[effectKeys.RESONANT]) {
        draftEntity = processExitResonant(draftEntity);
    }
    if (draftEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        draftEntity = processExitAscendence(draftEntity);
    }
    if (draftEntity.states[effectKeys.SELENIAN]) {
        draftEntity = processExitSelenian(draftEntity);
    }

    draftEntity = {
        ...draftEntity,
        states: {
            ...createBaseEntity().states,
        },
    };

    return draftEntity;
}

export function processActionTypeUsed(prev, agentKey, nonAgentKey, action) {
    let draftAgent = {
        ...prev.entities[agentKey],
    };
    let draftNonAgent = {
        ...prev.entities[nonAgentKey],
    };

    const isDefensive = actionsClass.defensiveActions.includes(action);
    const isOffensive = actionsClass.offensiveActions.includes(action);
    const isBenediction = actionsClass.actsOfBenediction.includes(action);
    const isMalediction = actionsClass.actsOfMalediction.includes(action);

    if (isDefensive) {
        // Sonority
        if (draftAgent.states[effectKeys.RESONANT]) {
            const sonority = Math.min(
                constants.SONORITY_HIGHER_LIMIT,
                draftAgent.sonority + 1,
            );

            draftAgent = {
                ...draftAgent,
                [effectKeys.SONORITY]: sonority,
            };
        }

        // Overheat
        if (draftAgent[effectKeys.OVERHEAT] > 0) {
            const overheatLost = Math.min(
                constants.NATURAL_OVERHEAT_LOSS,
                draftAgent[effectKeys.OVERHEAT],
            );

            const newOverheat = draftAgent[effectKeys.OVERHEAT] - overheatLost;
            const newDynamo = Math.min(
                draftAgent[effectKeys.DYNAMO] + overheatLost,
                constants.MAX_DYNAMO,
            );
            draftAgent = {
                ...draftAgent,
                [effectKeys.OVERHEAT]: newOverheat,
                [effectKeys.DYNAMO]: newDynamo,
            };
        }

        // Waning Moon
        if (draftAgent[effectKeys.MIRRORED_MOON] === moonKeys.WANING) {
            draftAgent = {
                ...draftAgent,
                [effectKeys.MIRRORED_MOON]: moonKeys.CORONAL,
            };
        }
    }

    if (isOffensive) {
        // Sonority
        if (draftAgent.states[effectKeys.RESONANT]) {
            const sonority = Math.max(
                constants.SONORITY_LOWER_LIMIT,
                draftAgent.sonority - 1,
            );

            draftAgent = {
                ...draftAgent,
                [effectKeys.SONORITY]: sonority,
            };
        }

        // Waxing Moon
        if (draftAgent[effectKeys.MIRRORED_MOON] === moonKeys.WAXING) {
            draftAgent = {
                ...draftAgent,
                [effectKeys.MIRRORED_MOON]: moonKeys.BLOODSTAINED,
            };
        }
    }

    if (isBenediction) {
        if (prev[effectKeys.EYE_OF_HEAVENS] === eyeKeys.CLOSED) {
            const newIns =
                draftAgent.resources[effectKeys.INSPIRATION] +
                draftAgent[effectKeys.REVELATION];

            draftAgent = {
                ...draftAgent,
                resources: {
                    ...draftAgent.resources,
                    [effectKeys.INSPIRATION]: newIns,
                },
            };
        }
    }

    if (isMalediction) {
        if (prev[effectKeys.EYE_OF_HEAVENS] === eyeKeys.OPEN) {
            const newSin = Math.min(
                constants.MAX_TARNISHED_SIN,
                draftAgent[effectKeys.TARNISHED_SIN] +
                    draftAgent[effectKeys.REVELATION],
            );

            draftAgent = {
                ...draftAgent,
                [effectKeys.TARNISHED_SIN]: newSin,
            };
        }
    }

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: draftAgent,
            [nonAgentKey]: draftNonAgent,
        },
    };
}

export function processDeathCheck(prev) {
    let p1 = prev.entities[entityKeys.PLAYER_ONE];
    let p2 = prev.entities[entityKeys.PLAYER_TWO];

    p1 = processEntityDeathStates(p1);
    p2 = processEntityDeathStates(p2);

    const p1Dead = isEntityDead(p1);
    const p2Dead = isEntityDead(p2);

    let status = prev.status;

    if (p1Dead) {
        status = p2Dead ? turnStatus.DRAW : turnStatus.DEFEAT;
    } else if (p2Dead) {
        status = turnStatus.VICTORY;
    }

    return {
        ...prev,
        status: status,
        entities: {
            ...prev.entities,
            [entityKeys.PLAYER_ONE]: p1,
            [entityKeys.PLAYER_TWO]: p2,
        },
    };
}

export function processEntityDeathStates(entity) {
    let draftEntity = { ...entity };

    // Convert Silver Blood into Health
    if (draftEntity.resources[effectKeys.SILVER_BLOOD] > 0) {
        const missingHp = Math.max(
            0,
            getEntityMaxHealth(draftEntity) - draftEntity[effectKeys.HEALTH],
        );

        const silverConsumed = Math.min(
            missingHp,
            draftEntity.resources[effectKeys.SILVER_BLOOD],
        );

        const newHp = draftEntity[effectKeys.HEALTH] + silverConsumed;
        const silverBlood =
            draftEntity.resources[effectKeys.SILVER_BLOOD] - silverConsumed;

        draftEntity = {
            ...draftEntity,
            [effectKeys.HEALTH]: newHp,
            resources: {
                ...draftEntity.resources,
                [effectKeys.SILVER_BLOOD]: silverBlood,
            },
        };
    }

    if (draftEntity[effectKeys.TARNISHED_SIN] >= 100) {
        draftEntity = {
            ...draftEntity,
            states: {
                ...draftEntity.states,
                [effectKeys.ABANDONED_BY_GRACE]: true,
            },
        };
    }

    if (
        draftEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT] &&
        draftEntity[effectKeys.ENLIGHTENMENT] <= 0
    ) {
        draftEntity = processExitAscendence(draftEntity);
    }

    return draftEntity;
}

export function isEntityDead(entity) {
    return (
        getEntityTotalHealth(entity) <= 0 &&
        !entity.states[effectKeys.ASCENDENCE_OF_SPIRIT] &&
        entity[effectKeys.BURDEN_OF_STIGMA] <= 0
    );
}

export function getEntityElement(entity) {
    // Shattered override
    if (
        entity[effectKeys.ELEMENTAL_CRYSTALS].includes(elementalKeys.SHATTERED)
    ) {
        return elementalKeys.SHATTERED;
    }

    const hasScorch = entity[effectKeys.ELEMENTAL_CRYSTALS].includes(
        elementalKeys.SCORCH,
    );
    const hasFrost = entity[effectKeys.ELEMENTAL_CRYSTALS].includes(
        elementalKeys.FROST,
    );
    const hasNature = entity[effectKeys.ELEMENTAL_CRYSTALS].includes(
        elementalKeys.NATURE,
    );

    // triple elements
    if (hasFrost && hasNature && hasScorch) {
        return elementalKeys.ALBEDO;
    }

    // dual elements
    if (hasFrost && hasNature) {
        return elementalKeys.WITHER;
    }
    if (hasFrost && hasScorch) {
        return elementalKeys.OCEAN;
    }
    if (hasNature && hasScorch) {
        return elementalKeys.ASH;
    }

    // solo elements
    if (hasFrost) {
        return elementalKeys.FROST;
    }

    if (hasNature) {
        return elementalKeys.NATURE;
    }

    if (hasScorch) {
        return elementalKeys.SCORCH;
    }

    // no elements
    return elementalKeys.DULLED;
}

export function isElementActive(entity, element) {
    const activeElement = getEntityElement(entity);
    return (
        activeElement === element || activeElement === elementalKeys.SHATTERED
    );
}

export function getEntityDef(entity) {
    return (
        entity.attributes.def.value +
        (isElementActive(entity, elementalKeys.FROST)
            ? entity[effectKeys.MOONLIGHT]
            : 0)
    );
}

export function getEntityStr(entity) {
    return (
        entity.attributes.str.value +
        (isElementActive(entity, elementalKeys.SCORCH)
            ? entity[effectKeys.MOONLIGHT]
            : 0)
    );
}

export function getEntityMaxHealth(entity) {
    return (
        entity[effectKeys.MAX_HEALTH] +
        (isElementActive(entity, elementalKeys.NATURE)
            ? entity[effectKeys.MOONLIGHT]
            : 0)
    );
}

export function getEntityTotalMana(entity) {
    return entity[effectKeys.MANA] + entity.resources[effectKeys.MANA_OVERFLOW];
}

export function getEntityTotalHealth(entity) {
    return (
        entity[effectKeys.HEALTH] + entity.resources[effectKeys.SILVER_BLOOD]
    );
}
