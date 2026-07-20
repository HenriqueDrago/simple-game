import {
    actionsClass,
    coloredStars,
    constants,
    FREE_RESOURCES,
    MITIGATION_RESOURCES,
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
    progKeys,
    aiKeys,
} from "./enums.js";

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
    if (getEntityMaxHealth(draftEntity) > 0) {
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

        case sdmKeys.BALANCED:
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
            for (let attr of constants.ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: 0,
                };
            }
            newEntity.attributes.str.points = Math.floor(
                newEntity.unspentPoints / 2,
            );
            newEntity.attributes.def.points = Math.ceil(
                newEntity.unspentPoints / 2,
            );
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
        [effectKeys.STARBLIGHT]: 0,
        [effectKeys.NEBULA]: 0,

        // ranked resources
        [effectKeys.BURDEN_OF_STIGMA]: 0,
        [effectKeys.MANA_BLEED]: 0,
        [effectKeys.MOONLIT_TEARS]: 0,
        [effectKeys.CONSTELLATION]: 0,
        [effectKeys.AZURE_CONSTELLATION]: 0,
        [effectKeys.CRIMSON_CONSTELLATION]: 0,

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
            [effectKeys.UNRELENTING_SHADOWS]: 0,
            [effectKeys.SACRED_FLAMES]: 0,
            [effectKeys.INSPIRATION]: 0,
            [effectKeys.STARDUST]: 0,
            [effectKeys.SILVER_BLOOD]: 0,
            [effectKeys.MOONDUST]: 0,
            [effectKeys.DISTILLED_TOXIN]: 0,
            [effectKeys.DISSONANCE]: 0,

            // Mitigation
            [effectKeys.HALO]: 0,
            [effectKeys.LINGERING_EMBER]: 0,
            [effectKeys.FUNERARY_URN]: 0,
            [effectKeys.DOME]: 0,
            [effectKeys.MYCELIUM]: 0,
            [effectKeys.REFRACTED_DIVINITY]: 0,
            [effectKeys.HARMONY]: 0,
        },
        states: {
            // standalones
            [effectKeys.GUARDING_STATE]: false,
            [effectKeys.SACRIFICIAL_STATE]: false,
            [effectKeys.STARGAZER]: false,
            [effectKeys.NOVA]: false,
            [effectKeys.SELENIAN]: false,
            [effectKeys.RESONANT]: false,
            [effectKeys.PRISMATIC]: false,
            [effectKeys.MOON_DEW]: false,

            // Shadowflame
            [effectKeys.DARK_EMBRACE]: false,
            [effectKeys.DIMMING_DARKNESS]: false,
            [effectKeys.UMBRAL_CORE]: false,
            [effectKeys.BLEAK_DECEPTION]: false,

            // Deploy
            [effectKeys.DEPLOYMENT]: false,
            [effectKeys.WEAPONS_DEPLOYED]: false,
            [effectKeys.THERMAL_OVERLOAD]: false,
            [effectKeys.VENTING]: false,

            // Aegis
            [effectKeys.RADIANT]: false,
            [effectKeys.CUTOFF_WINGS]: false,
            [effectKeys.ASCENDENCE_OF_SPIRIT]: false,
            [effectKeys.ZENITH_OF_MORTALITY]: false,
            [effectKeys.ABANDONED_BY_GRACE]: false,
            [effectKeys.ANOINTED_PROXY]: false,
        },
        stars: {
            [effectKeys.WHITE_STAR]: 0,
            [effectKeys.GRAY_STAR]: 0,

            [effectKeys.RED_STAR]: 0,
            [effectKeys.ORANGE_STAR]: 0,
            [effectKeys.YELLOW_STAR]: 0,
            [effectKeys.GREEN_STAR]: 0,
            [effectKeys.BLUE_STAR]: 0,
            [effectKeys.INDIGO_STAR]: 0,
            [effectKeys.VIOLET_STAR]: 0,
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
    if (entity.states[effectKeys.MOON_DEW]) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }

    if (entity[effectKeys.SONORITY] < 0) {
        drMult *= Math.max(0, 1 + entity[effectKeys.SONORITY] / 100);
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

    if (entity[effectKeys.LUNACY] > 0) {
        dmgBonus *= 1 + entity[effectKeys.LUNACY] / 100;
    }
    if (entity[effectKeys.NEBULA] > 0) {
        dmgBonus *= 1 + entity[effectKeys.NEBULA] / 100;
    }
    if (entity[effectKeys.STARBLIGHT] > 0) {
        dmgBonus *= 1 + entity[effectKeys.STARBLIGHT] / 100;
    }
    if (entity[effectKeys.SONORITY] > 0) {
        dmgBonus *= 1 + entity[effectKeys.SONORITY] / 100;
    }

    return dmgBonus;
}

export function processEntityFragility(entity) {
    let frail = 1.0;

    frail *= 1 + entity[effectKeys.LUNACY] / 100;

    if (entity[effectKeys.SONORITY] > 0) {
        frail *= 1 + entity[effectKeys.SONORITY] / 100;
    }

    return frail;
}

export function processEntityWeakness(entity) {
    let weak = 1.0;

    if (entity[effectKeys.SONORITY] < 0) {
        weak *= 1 + entity[effectKeys.SONORITY] / 100;
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

    // Lunic override
    if (dmgType === dmgTypes.LUNIC) {
        draftDefender = takeLunicDamage(draftDefender, baseDmg);

        return {
            attacker: {
                ...draftAttacker,
            },
            defender: {
                ...draftDefender,
            },
        };
    }

    const additionalDmg =
        dmgType === dmgTypes.PHYSICAL
            ? draftAttacker.resources[effectKeys.BLOOD_SACRIFICE]
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
            ? effectiveDef + effectiveRevelation
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

    console.log(
        `base: ${baseDmg}, additional: ${additionalDmg}, bonus: ${bonusMult}, weak: ${weakMult}, dr: ${drMult}, frail: ${frailMult}`,
    );

    const dmgPostMults = (baseDmg + additionalDmg) * bonusMult * weakMult;

    const dmgPostReduction = Math.max(
        1,
        Math.floor((dmgPostMults - flatDr) * drMult * frailMult),
    );

    // Mitigation
    let damagePostMitigation = dmgPostReduction;
    if (dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING) {
        const consumptionResult = consumeMitigationResources(
            draftDefender,
            damagePostMitigation,
            dmgType,
        );

        draftDefender = consumptionResult.draftEntity;
        damagePostMitigation =
            consumptionResult.mitigationResourcesConsumed.mitigationNotConsumed;
    }

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

    // Wither Moonlit Gain
    if (isElementActive(draftDefender, elementalKeys.WITHER)) {
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

    // Lunic override
    if (dmgType === dmgTypes.LUNIC) {
        return takeLunicDamage(draftEntity, baseDmg);
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
            ? effectiveDef + effectiveRevelation
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

    let damagePostMitigation = finalDmg;
    if (dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING) {
        const consumptionResult = consumeMitigationResources(
            draftEntity,
            finalDmg,
            dmgType,
        );

        draftEntity = consumptionResult.draftEntity;
        damagePostMitigation =
            consumptionResult.mitigationResourcesConsumed.mitigationNotConsumed;
    }

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

    // Wither Moonlit Gain
    if (isElementActive(draftEntity, elementalKeys.WITHER)) {
        draftEntity = {
            ...draftEntity,
            [effectKeys.MOONLIT_TEARS]:
                draftEntity[effectKeys.MOONLIT_TEARS] +
                constants.GIBBOUS_TEARS_GAIN,
        };
    }

    return {
        ...draftEntity,
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

export function loseInsight(entity, amount) {
    const newInsight = Math.max(0, entity[effectKeys.INSIGHT] - amount);

    return {
        ...entity,
        [effectKeys.INSIGHT]: newInsight,
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
    const initialAmount = amount;
    let draftEntity = {
        ...entity,
    };

    // Silver Blood
    const silverBloodConsumed = Math.min(
        entity.resources[effectKeys.SILVER_BLOOD],
        amount,
    );

    amount -= silverBloodConsumed;

    draftEntity = {
        ...draftEntity,
        resources: {
            ...entity.resources,
            [effectKeys.SILVER_BLOOD]:
                entity.resources[effectKeys.SILVER_BLOOD] - silverBloodConsumed,
        },
    };

    // Health
    const hpConsumed = Math.min(entity[effectKeys.HEALTH], amount);
    draftEntity = {
        ...draftEntity,
        [effectKeys.HEALTH]: Math.max(
            0,
            entity[effectKeys.HEALTH] - hpConsumed,
        ),
    };

    amount -= hpConsumed;

    // Wither
    if (isElementActive(entity, elementalKeys.WITHER)) {
        const newLunacy = Math.min(
            draftEntity[effectKeys.LUNACY] +
                (initialAmount - amount) * constants.WITHER_LUNACY_MULT,
            constants.MAX_LUNACY,
        );
        draftEntity = {
            ...draftEntity,
            [effectKeys.LUNACY]: newLunacy,
        };
    }

    return {
        ...draftEntity,
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
        [effectKeys.CONSTELLATION]: 0,
        [effectKeys.AZURE_CONSTELLATION]: 0,
        [effectKeys.CRIMSON_CONSTELLATION]: 0,
        [effectKeys.NEBULA]: 0,
        [effectKeys.STARBLIGHT]: 0,
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
        dmgTypes.LUNIC,
    );

    draftEntity = {
        ...draftEntity,
        [effectKeys.MOONLIGHT]: 0,
        [effectKeys.ELEMENTAL_CRYSTALS]: [],
        [effectKeys.MIRRORED_MOON]: moonKeys.HIDDEN,
        [effectKeys.LUNACY]: 0,
        [effectKeys.MOONLIT_TEARS]: 0,
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
            [effectKeys.CUTOFF_WINGS]:
                draftEntity.states[effectKeys.CUTOFF_WINGS],
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
                draftAgent[effectKeys.SONORITY] + constants.SONORITY_ON_DEFENSE,
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
                draftAgent[effectKeys.SONORITY] + constants.SONORITY_ON_OFFENSE,
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

        // Ash
        if (isElementActive(draftAgent, elementalKeys.ASH)) {
            const toBeConsumed = Math.floor(
                consumeLimitedResources(draftAgent, Infinity, elementalKeys.ASH)
                    .limitedResourcesConsumed.totalLimitedResourcesConsumption /
                    2,
            );

            draftAgent = consumeLimitedResources(
                draftAgent,
                toBeConsumed,
                elementalKeys.ASH,
            ).draftEntity;

            draftAgent = {
                ...draftAgent,
                resources: {
                    ...draftAgent.resources,
                    [effectKeys.FUNERARY_URN]: toBeConsumed,
                },
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

    if (draftEntity[effectKeys.TARNISHED_SIN] >= constants.MAX_TARNISHED_SIN) {
        draftEntity = {
            ...draftEntity,
            states: {
                ...draftEntity.states,
                [effectKeys.ABANDONED_BY_GRACE]: true,
            },
        };
    }

    if (draftEntity[effectKeys.STARBLIGHT] >= constants.MAX_STARBLIGHT) {
        draftEntity = {
            ...draftEntity,
            states: {
                ...draftEntity.states,
                [effectKeys.NOVA]: true,
            },
        };
    }

    if (
        draftEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT] &&
        draftEntity[effectKeys.ENLIGHTENMENT] <= 0
    ) {
        draftEntity = processExitAscendence(draftEntity);
    }

    return processHealth(draftEntity);
}

export function isEntityDead(entity) {
    return (
        (getEntityTotalHealth(entity) <= 0 ||
            getEntityMaxHealth(entity) <= 0) &&
        !entity.states[effectKeys.ASCENDENCE_OF_SPIRIT] &&
        entity[effectKeys.BURDEN_OF_STIGMA] <= 0 &&
        !entity.states[effectKeys.NOVA]
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
    let draftEntity = {
        ...entity,
    };

    if (entity[effectKeys.CONSTELLATION] > 0) {
        draftEntity = raiseStats(entity, entity[effectKeys.CONSTELLATION]);
    }

    return (
        draftEntity.attributes.def.value +
        (isElementActive(draftEntity, elementalKeys.FROST)
            ? draftEntity[effectKeys.MOONLIGHT]
            : 0) +
        draftEntity[effectKeys.AZURE_CONSTELLATION]
    );
}

export function getEntityStr(entity) {
    let draftEntity = {
        ...entity,
    };

    if (entity[effectKeys.CONSTELLATION] > 0) {
        draftEntity = raiseStats(entity, entity[effectKeys.CONSTELLATION]);
    }

    return (
        draftEntity.attributes.str.value +
        (isElementActive(draftEntity, elementalKeys.SCORCH)
            ? draftEntity[effectKeys.MOONLIGHT]
            : 0) +
        draftEntity[effectKeys.CRIMSON_CONSTELLATION]
    );
}

export function getEntityMaxHealth(entity) {
    const starblightMult = 1 - entity[effectKeys.STARBLIGHT] / 100;
    return Math.ceil(
        (entity[effectKeys.MAX_HEALTH] +
            (isElementActive(entity, elementalKeys.NATURE)
                ? entity[effectKeys.MOONLIGHT]
                : 0)) *
            starblightMult,
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

export function getEntityTotalInsight(entity) {
    return entity[effectKeys.INSIGHT];
}

export function getEntityTotalEnlightenment(entity) {
    return entity[effectKeys.ENLIGHTENMENT];
}

export function consumeMitigationResources(entity, amount, cause = null) {
    let draftEntity = {
        ...entity,
    };

    let mitigationResourcesConsumed = {};
    let i = 0;
    let totalMitigationResourcesConsumption = 0;

    const isCauseDamage =
        cause === dmgTypes.PHYSICAL || cause === dmgTypes.PIERCING;

    while (amount > 0 && i < MITIGATION_RESOURCES.length) {
        const currResourceKey = MITIGATION_RESOURCES[i];

        // Avoid shadowflames and related actions from consuming LE
        if (
            !(
                (cause === effectKeys.SHADOWFLAME ||
                    cause === actionKeys.SHADOW_PACT ||
                    cause === actionKeys.BLACK_MAYHEM) &&
                currResourceKey === effectKeys.LINGERING_EMBER
            )
        ) {
            const currAmount = draftEntity.resources[currResourceKey];
            const consumption = Math.min(currAmount, amount);

            amount -= consumption;
            totalMitigationResourcesConsumption += consumption;

            mitigationResourcesConsumed = {
                ...mitigationResourcesConsumed,
                [currResourceKey]: consumption,
            };

            draftEntity = {
                ...draftEntity,
                resources: {
                    ...draftEntity.resources,
                    [currResourceKey]: currAmount - consumption,
                },
            };

            // Lingering Ember
            if (
                isCauseDamage &&
                currResourceKey === effectKeys.LINGERING_EMBER
            ) {
                const currentCinders =
                    draftEntity.resources[effectKeys.CINDERS];
                draftEntity = {
                    ...draftEntity,
                    resources: {
                        ...draftEntity.resources,
                        [effectKeys.CINDERS]: currentCinders + consumption,
                    },
                };
            }

            // Halo
            if (isCauseDamage && currResourceKey === effectKeys.HALO) {
                const currentRadiance =
                    draftEntity.resources[effectKeys.RADIANCE];
                draftEntity = {
                    ...draftEntity,
                    resources: {
                        ...draftEntity.resources,
                        [effectKeys.RADIANCE]: currentRadiance + consumption,
                    },
                };
            }

            // Refracted Divinity
            if (
                isCauseDamage &&
                currResourceKey === effectKeys.REFRACTED_DIVINITY
            ) {
                const currentMoondust =
                    draftEntity.resources[effectKeys.MOONDUST];
                draftEntity = {
                    ...draftEntity,
                    resources: {
                        ...draftEntity.resources,
                        [effectKeys.MOONDUST]: currentMoondust + consumption,
                    },
                };
            }
        }

        i++;
    }

    mitigationResourcesConsumed = {
        ...mitigationResourcesConsumed,
        totalMitigationResourcesConsumption:
            totalMitigationResourcesConsumption,
        mitigationNotConsumed: amount,
    };

    return {
        draftEntity,
        mitigationResourcesConsumed,
    };
}

export function consumeFreeResources(entity, amount, cause = null) {
    let draftEntity = {
        ...entity,
    };

    let freeResourcesConsumed = {};
    let i = 0;
    let totalFreeResourcesConsumption = 0;

    while (amount > 0 && i < FREE_RESOURCES.length) {
        const currResourceKey = FREE_RESOURCES[i];

        // Avoid shadowflame and related actions from consuming Shadowflame and unrelenting shadows
        // Avoid glimpse consumingthe flames itself
        if (
            !(
                (cause === effectKeys.SHADOWFLAME ||
                    cause === actionKeys.SHADOW_PACT ||
                    cause === actionKeys.BLACK_MAYHEM) &&
                (currResourceKey === effectKeys.SHADOWFLAME ||
                    currResourceKey === effectKeys.UNRELENTING_SHADOWS)
            ) &&
            !(
                cause === actionKeys.GLIMPSE_OF_PANDEMONIUM &&
                currResourceKey === effectKeys.SACRED_FLAMES
            )
        ) {
            const currAmount = draftEntity.resources[currResourceKey];
            const consumption = Math.min(currAmount, amount);

            amount -= consumption;
            totalFreeResourcesConsumption += consumption;

            freeResourcesConsumed = {
                ...freeResourcesConsumed,
                [currResourceKey]: consumption,
            };

            draftEntity = {
                ...draftEntity,
                resources: {
                    ...draftEntity.resources,
                    [currResourceKey]: currAmount - consumption,
                },
            };
        }

        i++;
    }

    freeResourcesConsumed = {
        ...freeResourcesConsumed,
        totalFreeResourcesConsumption: totalFreeResourcesConsumption,
        freeNotConsumed: amount,
    };

    return {
        draftEntity,
        freeResourcesConsumed,
    };
}

export function consumeLimitedResources(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    let limitedResourcesConsumed = {};
    let totalLimitedResourcesConsumption = 0;

    // Mana
    const manaConsumed = Math.min(getEntityTotalMana(draftEntity), amount);
    draftEntity = loseMana(draftEntity, manaConsumed);
    amount -= manaConsumed;

    totalLimitedResourcesConsumption += manaConsumed;
    limitedResourcesConsumed = {
        ...limitedResourcesConsumed,
        [effectKeys.MANA]: manaConsumed,
    };

    // Health
    const healthConsumed = Math.min(getEntityTotalHealth(draftEntity), amount);
    draftEntity = loseHp(draftEntity, healthConsumed);
    amount -= healthConsumed;

    totalLimitedResourcesConsumption += healthConsumed;
    limitedResourcesConsumed = {
        ...limitedResourcesConsumed,
        [effectKeys.HEALTH]: healthConsumed,
    };

    // Insight
    const insightConsumed = Math.min(
        getEntityTotalInsight(draftEntity),
        amount,
    );
    draftEntity = loseInsight(draftEntity, insightConsumed);
    amount -= insightConsumed;

    totalLimitedResourcesConsumption += insightConsumed;
    limitedResourcesConsumed = {
        ...limitedResourcesConsumed,
        [effectKeys.INSIGHT]: insightConsumed,
    };

    // Enlightenment
    const enlitConsumed = Math.min(
        getEntityTotalEnlightenment(draftEntity),
        amount,
    );
    draftEntity = loseEnlit(draftEntity, enlitConsumed);
    amount -= enlitConsumed;

    totalLimitedResourcesConsumption += enlitConsumed;
    limitedResourcesConsumed = {
        ...limitedResourcesConsumed,
        [effectKeys.ENLIGHTENMENT]: enlitConsumed,
    };

    // total
    limitedResourcesConsumed = {
        ...limitedResourcesConsumed,
        totalLimitedResourcesConsumption: totalLimitedResourcesConsumption,
        limitedNotConsumed: amount,
    };

    return {
        draftEntity,
        limitedResourcesConsumed,
    };
}

export function consumeResources(entity, amount, cause = null) {
    let draftEntity = {
        ...entity,
    };

    let totalConsumption = 0;
    let resourcesConsumed = {};

    // Mitigation
    const mitResult = consumeMitigationResources(draftEntity, amount, cause);

    draftEntity = mitResult.draftEntity;
    resourcesConsumed = {
        ...resourcesConsumed,
        ...mitResult.mitigationResourcesConsumed,
    };

    totalConsumption +=
        mitResult.mitigationResourcesConsumed
            .totalMitigationResourcesConsumption;
    amount -=
        mitResult.mitigationResourcesConsumed
            .totalMitigationResourcesConsumption;

    // Free
    const freeResult = consumeFreeResources(draftEntity, amount, cause);

    draftEntity = freeResult.draftEntity;
    resourcesConsumed = {
        ...resourcesConsumed,
        ...freeResult.freeResourcesConsumed,
    };

    totalConsumption +=
        freeResult.freeResourcesConsumed.totalFreeResourcesConsumption;
    amount -= freeResult.freeResourcesConsumed.totalFreeResourcesConsumption;

    // Limited
    const limResult = consumeLimitedResources(draftEntity, amount, cause);

    draftEntity = limResult.draftEntity;
    resourcesConsumed = {
        ...resourcesConsumed,
        ...limResult.limitedResourcesConsumed,
    };

    totalConsumption +=
        limResult.limitedResourcesConsumed.totalLimitedResourcesConsumption;
    amount -=
        limResult.limitedResourcesConsumed.totalLimitedResourcesConsumption;

    // total
    resourcesConsumed = {
        ...resourcesConsumed,
        totalConsumption: totalConsumption,
        notConsumed: amount,
    };

    return {
        draftEntity,
        resourcesConsumed,
    };
}

export function processSilverBlood(entity) {
    let draftEntity = {
        ...entity,
    };

    // Converts excess Health into Silver Blood
    if (draftEntity[effectKeys.HEALTH] > draftEntity[effectKeys.MAX_HEALTH]) {
        const excessHealth = Math.max(
            0,
            draftEntity[effectKeys.HEALTH] - getEntityMaxHealth(draftEntity),
        );
        const newHp = Math.min(
            draftEntity[effectKeys.HEALTH],
            getEntityMaxHealth(draftEntity),
        );
        const silverBlood =
            draftEntity.resources[effectKeys.SILVER_BLOOD] + excessHealth;

        draftEntity = {
            ...draftEntity,
            [effectKeys.HEALTH]: newHp,
            resources: {
                ...draftEntity.resources,
                [effectKeys.SILVER_BLOOD]: silverBlood,
            },
        };
    }

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

    return draftEntity;
}

export function translateElementIntoCrystals(element) {
    let crystals;
    switch (element) {
        case elementalKeys.ALBEDO:
            crystals = [
                elementalKeys.FROST,
                elementalKeys.NATURE,
                elementalKeys.SCORCH,
            ];
            break;
        case elementalKeys.WITHER:
            crystals = [elementalKeys.FROST, elementalKeys.NATURE];
            break;
        case elementalKeys.OCEAN:
            crystals = [elementalKeys.FROST, elementalKeys.SCORCH];
            break;
        case elementalKeys.ASH:
            crystals = [elementalKeys.NATURE, elementalKeys.SCORCH];
            break;
        case elementalKeys.FROST:
            crystals = [elementalKeys.FROST];
            break;
        case elementalKeys.NATURE:
            crystals = [elementalKeys.NATURE];
            break;
        case elementalKeys.SCORCH:
            crystals = [elementalKeys.SCORCH];
            break;
        case elementalKeys.DULLED:
        default:
            crystals = [];
            break;
    }

    return crystals;
}

export function processHealth(entity) {
    let draftEntity = {
        ...entity,
    };

    if (getEntityMaxHealth(entity) < entity[effectKeys.HEALTH]) {
        if (entity.states[effectKeys.SELENIAN]) {
            const extraBlood =
                entity[effectKeys.HEALTH] - getEntityMaxHealth(entity);

            draftEntity = {
                ...draftEntity,
                [effectKeys.HEALTH]: getEntityMaxHealth(entity),
                resources: {
                    ...draftEntity.resources,
                    [effectKeys.SILVER_BLOOD]:
                        draftEntity.resources[effectKeys.SILVER_BLOOD] +
                        extraBlood,
                },
            };
        } else {
            draftEntity = {
                ...draftEntity,
                [effectKeys.HEALTH]: getEntityMaxHealth(entity),
            };
        }
    }

    return draftEntity;
}

export function takeLunicDamage(entity, amount) {
    const maxHpConsumed = Math.min(amount, entity[effectKeys.MAX_HEALTH]);
    const moonlightConsumed = Math.min(
        amount - maxHpConsumed,
        entity[effectKeys.MOONLIGHT],
    );

    return {
        ...entity,
        [effectKeys.MAX_HEALTH]: entity[effectKeys.MAX_HEALTH] - maxHpConsumed,
        [effectKeys.MOONLIGHT]:
            entity[effectKeys.MOONLIGHT] - moonlightConsumed,
    };
}

export function raiseStats(entity, amount) {
    let attributes = {};

    // Initialization
    for (let attr of constants.ATTRIBUTE_NAMES) {
        attributes = {
            ...attributes,
            [attr]: {
                value: entity.attributes[attr].value,
                points: entity.attributes[attr].points,
            },
        };
    }

    // Distribution
    while (amount > 0) {
        for (let attr of constants.ATTRIBUTE_NAMES) {
            attributes = {
                ...attributes,
                [attr]: {
                    value: attributes[attr].value + 1,
                    points: attributes[attr].points,
                },
            };
            amount -= 1;

            if (amount <= 0) {
                break;
            }
        }
    }

    return {
        ...entity,
        attributes: attributes,
    };
}

export function lowerStats(entity, amount) {
    let attributes = {};
    let attrConsumed = {};

    // Initialization
    for (let attr of constants.ATTRIBUTE_NAMES) {
        attributes = {
            ...attributes,
            [attr]: {
                value: entity.attributes[attr].value,
                points: entity.attributes[attr].points,
            },
        };
    }

    // Distribution
    while (amount > 0) {
        for (let attr of constants.ATTRIBUTE_NAMES) {
            attributes = {
                ...attributes,
                [attr]: {
                    value: attributes[attr].value - 1,
                    points: attributes[attr].points,
                },
            };
            attrConsumed = {
                ...attrConsumed,
                [attr]: attrConsumed[attr] + 1,
            };
            amount -= 1;
            if (amount <= 0) {
                break;
            }
        }
    }

    return {
        ...entity,
        attributes: attributes,
    };
}

export function getEntityColoredStars(entity) {
    const coloredStarsCount = Object.values(coloredStars).reduce(
        (acc, starType) => {
            return acc + entity.stars[starType.star];
        },
        0,
    );

    return coloredStarsCount;
}

export function getEntityUsableStars(entity) {
    return getEntityColoredStars(entity) + entity.stars[effectKeys.WHITE_STAR];
}

export function getEntityTotalStars(entity) {
    return getEntityUsableStars(entity) + entity.stars[effectKeys.GRAY_STAR];
}

export function canUse(prev, entityKey, action) {
    const entity = prev.entities[entityKey];
    const states = entity.states;

    // Exclusive Overriding Ultimate States
    if (states[effectKeys.ZENITH_OF_MORTALITY]) {
        return action === actionKeys.ASCEND;
    }
    if (states[effectKeys.NOVA]) {
        return action === actionKeys.SUPERNOVA;
    }
    if (states[effectKeys.THERMAL_OVERLOAD]) {
        return action === actionKeys.MELTDOWN;
    }
    if (states[effectKeys.ANOINTED_PROXY]) {
        return action === actionKeys.JUDGEMENT;
    }

    // Reject ultimate actions if their corresponding state overrides are not active
    if ([actionKeys.ASCEND, actionKeys.SUPERNOVA, actionKeys.MELTDOWN, actionKeys.JUDGEMENT].includes(action)) {
        return false;
    }

    // Umbral Core Actions
    const umbralActions = [
        actionKeys.BLACK_MAYHEM,
        actionKeys.SHADOW_MANTLE,
        actionKeys.RITUAL_OF_ASH,
        actionKeys.DARK_PROMISE
    ];
    if (states[effectKeys.UMBRAL_CORE]) {
        return umbralActions.includes(action);
    }
    if (umbralActions.includes(action)) {
        return false;
    }

    // Angel Actions (Acts of Benediction & Malediction)
    const angelActions = [
        actionKeys.BAPTISM_OF_THE_FLAMES, actionKeys.CELESTIAL_SCALE, 
        actionKeys.HYMNS_OF_SANCTIFICATION, actionKeys.GIFT_OF_APOTHEOSIS,
        actionKeys.SERAPH_OF_CONDEMNATION, actionKeys.GLIMPSE_OF_PANDEMONIUM, 
        actionKeys.EDICT_OF_SEVERANCE, actionKeys.THE_WORD_MADE_FLESH
    ];
    if (states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        return angelActions.includes(action);
    }
    if (angelActions.includes(action)) {
        return false;
    }

    // Helper to evaluate progression lock status for base actions only
    const isProgLocked = (bossKey) => {
        if (!prev.progMode) {
            return false;
        }
        const status = prev.progStatus[bossKey];
        return !(status === progKeys.DEFEATED || status === progKeys.ALWAYS_OPEN);
    };

    // Sonority Transformations (Resonant State)
    if (action === actionKeys.BABEL) {
        return states[effectKeys.RESONANT] && entity[effectKeys.SONORITY] > 0;
    }
    if (action === actionKeys.SOUND_OF_SILENCE) {
        return states[effectKeys.RESONANT] && entity[effectKeys.SONORITY] < 0;
    }
    if (action === actionKeys.DA_CAPO) {
        return states[effectKeys.RESONANT] && entity[effectKeys.SONORITY] === 0;
    }
    if (action === actionKeys.ATTUNE) {
        if (states[effectKeys.RESONANT]) {
            return false;
        }
        return !isProgLocked(aiKeys.MAESTRO);
    }

    // Cyborg Mechanics & Venting Lockouts
    if (states[effectKeys.VENTING] && [actionKeys.DEPLOY, actionKeys.LASER].includes(action)) {
        return false;
    }
    if (action === actionKeys.LASER) {
        return states[effectKeys.WEAPONS_DEPLOYED];
    }
    if (action === actionKeys.DEPLOY) {
        if (states[effectKeys.WEAPONS_DEPLOYED]) {
            return false;
        }
        return !isProgLocked(aiKeys.CYBORG);
    }

    // Runic Array Mechanics
    const arrayActive = prev[effectKeys.RUNIC_ARRAY] > 0;
    if (action === actionKeys.CURSE) {
        return arrayActive;
    }
    if (action === actionKeys.ARRAY) {
        if (arrayActive) {
            return false;
        }
        return !isProgLocked(aiKeys.HEXER);
    }

    // Selenian Actions & Active Element Conditions
    if (!states[effectKeys.SELENIAN]) {
        const lunarActions = [
            actionKeys.LUNAR_SMITE, actionKeys.LUNAR_GROWTH, actionKeys.LUNAR_TIDE,
            actionKeys.LUNAR_STRIKE, actionKeys.LUNAR_SHED, actionKeys.LUNAR_SHROUD,
            actionKeys.CHALK, actionKeys.SHATTER, actionKeys.MIRROR
        ];
        if (lunarActions.includes(action)) {
            return false;
        }
    } else {
        if (action === actionKeys.REFRACT) {
            return false;
        }
        if (action === actionKeys.LUNAR_SMITE) {
            return isElementActive(entity, elementalKeys.ASH);
        }
        if (action === actionKeys.LUNAR_GROWTH) {
            return isElementActive(entity, elementalKeys.NATURE);
        }
        if (action === actionKeys.LUNAR_TIDE) {
            return isElementActive(entity, elementalKeys.OCEAN);
        }
        if (action === actionKeys.LUNAR_STRIKE) {
            return isElementActive(entity, elementalKeys.SCORCH);
        }
        if (action === actionKeys.LUNAR_SHED) {
            return isElementActive(entity, elementalKeys.WITHER);
        }
        if (action === actionKeys.LUNAR_SHROUD) {
            return isElementActive(entity, elementalKeys.FROST);
        }
        if (action === actionKeys.CHALK) {
            return isElementActive(entity, elementalKeys.SHATTERED);
        }
        if (action === actionKeys.SHATTER) {
            return isElementActive(entity, elementalKeys.ALBEDO) && !isElementActive(entity, elementalKeys.SHATTERED);
        }
        if (action === actionKeys.MIRROR) {
            return !isElementActive(entity, elementalKeys.SHATTERED) && !isElementActive(entity, elementalKeys.ALBEDO);
        }
    }

    // Base Core Actions (Blocked if element equivalents override them)
    if (action === actionKeys.ATTACK) {
        return !isElementActive(entity, elementalKeys.ASH);
    }
    if (action === actionKeys.GUARD) {
        return !isElementActive(entity, elementalKeys.NATURE);
    }
    if (action === actionKeys.HEAL) {
        return !isElementActive(entity, elementalKeys.OCEAN);
    }
    if (action === actionKeys.SPECIAL_ATTACK) {
        if (isElementActive(entity, elementalKeys.SCORCH)) {
            return false;
        }
        return getEntityTotalMana(entity) >= constants.SP_ATTACK_COST;
    }
    if (action === actionKeys.SACRIFICE) {
        if (isElementActive(entity, elementalKeys.WITHER)) {
            return false;
        }
        return !isProgLocked(aiKeys.BLOODKNIGHT);
    }
    if (action === actionKeys.AEGIS) {
        if (isElementActive(entity, elementalKeys.FROST)) {
            return false;
        }
        if (states[effectKeys.CUTOFF_WINGS]) {
            return false;
        }
        return !isProgLocked(aiKeys.PALADIN);
    }

    // Untransformed Base Stances
    if (action === actionKeys.REFRACT) {
        return !isProgLocked(aiKeys.LUNATIC);
    }
    if (action === actionKeys.CHART) {
        return !isProgLocked(aiKeys.STARFARER);
    }
    if (action === actionKeys.SHADOW_PACT) {
        if (states[effectKeys.BLEAK_DECEPTION]) {
            return false;
        }
        return !isProgLocked(aiKeys.SHADOW_SORCERER);
    }

    return true;
}

export function getActions(prev, entityKey) {
    const entity = prev.entities[entityKey];
    const states = entity.states;

    // Ultimate Action Overrides
    if (states[effectKeys.ZENITH_OF_MORTALITY]) {
        return [actionKeys.ASCEND];
    }
    if (states[effectKeys.NOVA]) {
        return [actionKeys.SUPERNOVA];
    }
    if (states[effectKeys.THERMAL_OVERLOAD]) {
        return [actionKeys.MELTDOWN];
    }
    if (states[effectKeys.ANOINTED_PROXY]) {
        return [actionKeys.JUDGEMENT];
    }

    // Angel Actions (Acts of Benediction & Malediction)
    if (states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        return [
            actionKeys.BAPTISM_OF_THE_FLAMES,
            actionKeys.CELESTIAL_SCALE,
            actionKeys.HYMNS_OF_SANCTIFICATION,
            actionKeys.GIFT_OF_APOTHEOSIS,
            actionKeys.SERAPH_OF_CONDEMNATION,
            actionKeys.GLIMPSE_OF_PANDEMONIUM,
            actionKeys.EDICT_OF_SEVERANCE,
            actionKeys.THE_WORD_MADE_FLESH
        ];
    }

    // Umbral Core Actions
    if (states[effectKeys.UMBRAL_CORE]) {
        return [
            actionKeys.BLACK_MAYHEM,
            actionKeys.SHADOW_MANTLE,
            actionKeys.RITUAL_OF_ASH,
            actionKeys.DARK_PROMISE
        ];
    }

    // Base Actions + Replacements
    const actions = [];

    // Attack / Lunar Smite
    if (isElementActive(entity, elementalKeys.ASH)) {
        actions.push(actionKeys.LUNAR_SMITE);
    } else {
        actions.push(actionKeys.ATTACK);
    }

    // Guard / Lunar Growth
    if (isElementActive(entity, elementalKeys.NATURE)) {
        actions.push(actionKeys.LUNAR_GROWTH);
    } else {
        actions.push(actionKeys.GUARD);
    }

    // Heal / Lunar Tide
    if (isElementActive(entity, elementalKeys.OCEAN)) {
        actions.push(actionKeys.LUNAR_TIDE);
    } else {
        actions.push(actionKeys.HEAL);
    }

    // Special Attack / Lunar Strike
    if (isElementActive(entity, elementalKeys.SCORCH)) {
        actions.push(actionKeys.LUNAR_STRIKE);
    } else {
        actions.push(actionKeys.SPECIAL_ATTACK);
    }

    // Sacrifice / Lunar Shed
    if (isElementActive(entity, elementalKeys.WITHER)) {
        actions.push(actionKeys.LUNAR_SHED);
    } else {
        actions.push(actionKeys.SACRIFICE);
    }

    // Array / Curse
    const arrayActive = prev[effectKeys.RUNIC_ARRAY] > 0;
    if (arrayActive) {
        actions.push(actionKeys.CURSE);
    } else {
        actions.push(actionKeys.ARRAY);
    }

    // Deploy / Laser
    if (states[effectKeys.WEAPONS_DEPLOYED]) {
        actions.push(actionKeys.LASER);
    } else {
        actions.push(actionKeys.DEPLOY);
    }

    // Attune Transformations
    if (!states[effectKeys.RESONANT]) {
        actions.push(actionKeys.ATTUNE);
    } else {
        if (entity[effectKeys.SONORITY] > 0) {
            actions.push(actionKeys.BABEL);
        }
        if (entity[effectKeys.SONORITY] < 0) {
            actions.push(actionKeys.SOUND_OF_SILENCE);
        }
        if (entity[effectKeys.SONORITY] === 0) {
            actions.push(actionKeys.DA_CAPO);
        }
    }

    // Refract Transformations
    if (!states[effectKeys.SELENIAN]) {
        actions.push(actionKeys.REFRACT);
    } else {
        if (isElementActive(entity, elementalKeys.SHATTERED)) {
            actions.push(actionKeys.CHALK);
        } else {
            if (isElementActive(entity, elementalKeys.ALBEDO)) {
                actions.push(actionKeys.SHATTER);
            } else {
                actions.push(actionKeys.MIRROR);
            }
        }
    }

    // Chart
    actions.push(actionKeys.CHART);

    // Shadow Pact
    actions.push(actionKeys.SHADOW_PACT);

    // Aegis / Lunar Shroud
    if (isElementActive(entity, elementalKeys.FROST)) {
        actions.push(actionKeys.LUNAR_SHROUD);
    } else {
        actions.push(actionKeys.AEGIS);
    }

    return actions;
}