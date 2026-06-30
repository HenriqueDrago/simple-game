import { constants, presetAi } from "./constants.js";
import {
    sdmKeys,
    actionKeys,
    effectKeys,
    dmgTypes,
    elementalKeys,
    eyeKeys,
    angelActKeys,
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
    while (amount > 0 && resourceIndex < constants.freeResources.length) {
        const currResourceKey = constants.freeResources[resourceIndex];

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

    // Limited resource consumption, skips if cause is Hymmns or Orange Star/Trail
    if (
        cause !== actionKeys.HYMNS_OF_SANCTIFICATION &&
        cause !== effectKeys.ORANGE_STAR &&
        cause !== effectKeys.ORANGE_TRAIL
    ) {
        while (
            amount > 0 &&
            resourceIndex < constants.limitedResources.length &&
            (draftEntity.currHp > 0 ||
                (draftEntity.states.ascendenceOfSpirit &&
                    draftEntity.currEnlit > 0))
        ) {
            const currResourceKey = constants.limitedResources[resourceIndex];

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

export function restoreResources(entity, amount, wheel) {
    let draftEntity = {
        ...entity,
    };

    // Increases amount restored if Nature and aligned
    if (wheel === elementalKeys.NATURE && entity.states.aligned) {
        amount = Math.floor(amount * constants.NATURE_PASSIVE_MULT);
    }

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
        const missingHp =
            draftEntity.maxHp + draftEntity.overgrowth - draftEntity.currHp;
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
        maxOverheat: constants.MAX_OVERHEAT,
        currOverheat: 0,
        maxEnlit: 0,
        currEnlit: 0,
        maxInsight: 0,
        currInsight: 0,

        // %-based
        [effectKeys.TARNISHED_SIN]: 0,
        [effectKeys.DIVINE_SPARK]: 0,
        [effectKeys.DYNAMO]: 0,

        // other
        [effectKeys.SONORITY]: 0,
        [effectKeys.REVELATION]: 0,
        [effectKeys.ENERGY_LEVEL]: constants.STARTING_ENERGY,
        lasersUsedThisTurn: 0,

        // Essences
        [effectKeys.OVERGROWTH]: 0,
        [effectKeys.PERMAFROST]: 0,
        [effectKeys.SCORIA]: 0,

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
            [effectKeys.CRYOGENESIS]: 0,
            [effectKeys.SACRED_FLAMES]: 0,
            [effectKeys.INSPIRATION]: 0,
            [effectKeys.STARDUST]: 0,
            [effectKeys.DOME]: 0,
        },
        states: {
            // standalones
            [effectKeys.GUARDING_STATE]: false,
            [effectKeys.SACRIFICIAL_STATE]: false,
            [effectKeys.ALIGNED]: false,
            [effectKeys.THORNED_SHACKLES]: false,
            [effectKeys.STARGAZER]: false,

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
            [effectKeys.BURDEN_OF_STIGMA]: false,
            [effectKeys.ZENITH_OF_MORTALITY]: false,
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

    return defEffect;
}

export function dealDamage(
    attacker,
    defender,
    baseDmg,
    dmgType,
    isArrayActive,
    wheel,
) {
    let draftAttacker = {
        ...attacker,
    };

    let draftDefender = {
        ...defender,
    };

    const additionalDmg =
        dmgType === dmgTypes.PHYSICAL
            ? draftAttacker.resources.bloodSacrifice + draftAttacker.sonority
            : dmgType === dmgTypes.PIERCING
              ? draftAttacker.sonority
              : 0;

    const scorchAtkMult =
        wheel === elementalKeys.SCORCH && attacker.states.aligned
            ? constants.SCORCH_PASSIVE_MULT
            : 1.0;

    const scorchDefMult =
        wheel === elementalKeys.SCORCH && defender.states.aligned
            ? constants.SCORCH_PASSIVE_MULT
            : 1.0;

    const frostAtkMult =
        wheel === elementalKeys.FROST && attacker.states.aligned
            ? constants.FROST_PASSIVE_MULT
            : 1.0;

    const frostDefMult =
        wheel === elementalKeys.FROST && defender.states.aligned
            ? constants.FROST_PASSIVE_MULT
            : 1.0;

    const effectiveDef =
        dmgType === dmgTypes.PHYSICAL
            ? (draftDefender.attributes.def.value + draftDefender.permafrost) *
              processEntityDefEffect(draftDefender)
            : 0;

    const drMult =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? processEntityDR(draftDefender)
            : 1.0;

    const flatDr =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? -draftDefender.sonority
            : 0;

    const finalDmg = Math.max(
        1,
        Math.floor(
            (baseDmg + additionalDmg - effectiveDef - flatDr) *
                drMult *
                scorchAtkMult *
                scorchDefMult *
                frostAtkMult *
                frostDefMult,
        ),
    );

    // Mitigation
    const domeConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(finalDmg, defender.resources[effectKeys.DOME])
            : 0;

    const haloConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(finalDmg - domeConsumed, draftDefender.resources.halo)
            : 0;
    const cryoConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(
                  finalDmg - haloConsumed - domeConsumed,
                  draftDefender.resources.cryogenesis,
              )
            : 0;
    const emberConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(
                  finalDmg - haloConsumed - cryoConsumed - domeConsumed,
                  draftDefender.resources.lingeringEmber,
              )
            : 0;

    const damagePostMitigation =
        finalDmg - emberConsumed - haloConsumed - cryoConsumed - domeConsumed;

    const defenderNewHalo = defender.resources.halo - haloConsumed;
    const defenderNewCryo = defender.resources.cryogenesis - cryoConsumed;
    const defenderNewEmbers = defender.resources.lingeringEmber - emberConsumed;
    const defenderNewRadiance = defender.resources.radiance + haloConsumed;
    const newCinders = defender.resources.cinders + emberConsumed;

    const newDome = defender.resources[effectKeys.DOME] - domeConsumed;

    const thornsDmg =
        isArrayActive && dmgType === dmgTypes.PHYSICAL
            ? attacker.attributes.str.value + attacker.scoria
            : 0;

    if (thornsDmg > 0) {
        draftAttacker = takeDamage(
            draftAttacker,
            thornsDmg,
            dmgTypes.PHYSICAL,
            wheel,
        );
    }

    if (draftDefender.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        if (dmgType === dmgTypes.TRUE) {
            draftDefender = gainSin(draftDefender, damagePostMitigation);
        } else {
            draftDefender = loseEnlit(draftDefender, damagePostMitigation);
            if (dmgType === dmgTypes.PHYSICAL) {
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
        }
    } else {
        draftDefender = loseHp(draftDefender, damagePostMitigation);
    }

    draftDefender = {
        ...draftDefender,
        resources: {
            ...draftDefender.resources,
            halo: defenderNewHalo,
            lingeringEmber: defenderNewEmbers,
            radiance: defenderNewRadiance,
            cryogenesis: defenderNewCryo,
            cinders: newCinders,
            [effectKeys.DOME]: newDome,
        },
    };

    return {
        attacker: {
            ...draftAttacker,
        },
        defender: {
            ...draftDefender,
        },
    };
}

export function takeDamage(entity, baseDmg, dmgType, wheel) {
    let draftEntity = {
        ...entity,
    };

    const scorchMult =
        wheel === elementalKeys.SCORCH && entity.states.aligned
            ? constants.SCORCH_PASSIVE_MULT
            : 1.0;

    const frostMult =
        wheel === elementalKeys.FROST && entity.states.aligned
            ? constants.FROST_PASSIVE_MULT
            : 1.0;

    const effectiveDef =
        dmgType === dmgTypes.PHYSICAL
            ? (entity.attributes.def.value + entity.permafrost) *
              processEntityDefEffect(entity)
            : 0;

    const drMult =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? processEntityDR(entity)
            : 1.0;

    const flatDr =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? -entity.sonority
            : 0;

    const finalDmg = Math.max(
        1,
        Math.floor(
            (baseDmg - effectiveDef - flatDr) * drMult * scorchMult * frostMult,
        ),
    );

    // Mitigation
    const domeConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(finalDmg, entity.resources.dome)
            : 0;
    const haloConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(finalDmg, entity.resources.halo - domeConsumed)
            : 0;
    const cryoConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(
                  finalDmg - haloConsumed - domeConsumed,
                  entity.resources.cryogenesis,
              )
            : 0;
    const emberConsumed =
        dmgType === dmgTypes.PHYSICAL || dmgType === dmgTypes.PIERCING
            ? Math.min(
                  finalDmg - haloConsumed - cryoConsumed - domeConsumed,
                  entity.resources.lingeringEmber,
              )
            : 0;

    const damagePostMitigation =
        finalDmg - emberConsumed - haloConsumed - cryoConsumed - domeConsumed;

    if (draftEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        if (dmgType === dmgTypes.TRUE) {
            draftEntity = gainSin(draftEntity, damagePostMitigation);
        } else {
            draftEntity = loseEnlit(draftEntity, damagePostMitigation);
            if (dmgType === dmgTypes.PHYSICAL) {
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
        }
    } else {
        draftEntity = loseHp(draftEntity, damagePostMitigation);
    }

    const newHalo = entity.resources.halo - haloConsumed;
    const newCryo = entity.resources.cryogenesis - cryoConsumed;
    const newEmbers = entity.resources.lingeringEmber - emberConsumed;
    const newRadiance = entity.resources.radiance + haloConsumed;
    const newCinders = entity.resources.cinders + emberConsumed;
    const newDome = entity.resources[effectKeys.DOME] - domeConsumed;

    return {
        ...draftEntity,
        resources: {
            ...draftEntity.resources,
            halo: newHalo,
            lingeringEmber: newEmbers,
            radiance: newRadiance,
            cryogenesis: newCryo,
            cinders: newCinders,
            dome: newDome,
        },
    };
}

export function processEntityDeathStates(entity) {
    let draftEntity = { ...entity };

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
        (draftEntity[effectKeys.ENLIGHTENMENT] <= 0 ||
            draftEntity.states[effectKeys.ABANDONED_BY_GRACE])
    ) {
        draftEntity = {
            ...draftEntity,
            [effectKeys.ENLIGHTENMENT]: 0,
            [effectKeys.MAX_ENLIGHTENMENT]: 0,
            [effectKeys.INSIGHT]: 0,
            [effectKeys.MAX_INSIGHT]: 0,
            states: {
                ...draftEntity.states,
                [effectKeys.ASCENDENCE_OF_SPIRIT]: false,
                [effectKeys.CUTOFF_WINGS]: true,
            },
        };
    }

    draftEntity = processEntityCutoffWings(draftEntity);

    return draftEntity;
}

export function processEntityCutoffWings(entity) {
    let draft = { ...entity };

    if (draft.states[effectKeys.CUTOFF_WINGS]) {
        draft = {
            ...draft,
            [effectKeys.HEALTH]: Math.max(
                0,
                Math.min(1, draft[effectKeys.HEALTH]),
            ),
            [effectKeys.MAX_HEALTH]: 1,
        };
    }

    return draft;
}

export function isEntityDead(entity) {
    return entity.currHp <= 0 && !entity.states.ascendenceOfSpirit;
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

export function applyBenedictionMalediction(entity, eye, actionType) {
    const eyeIsOpen = eye === eyeKeys.OPEN;

    const gainSin = eyeIsOpen && actionType === angelActKeys.MALEDICTION;
    const gainIns = !eyeIsOpen && actionType === angelActKeys.BENEDICTION;

    const newSin = gainSin
        ? Math.min(
              constants.MAX_TARNISHED_SIN,
              entity[effectKeys.TARNISHED_SIN] + entity[effectKeys.REVELATION],
          )
        : entity[effectKeys.TARNISHED_SIN];

    const newIns = gainIns
        ? entity.resources[effectKeys.INSPIRATION] +
          entity[effectKeys.REVELATION]
        : entity.resources[effectKeys.INSPIRATION];

    return {
        ...entity,
        [effectKeys.TARNISHED_SIN]: newSin,
        resources: {
            ...entity.resources,
            [effectKeys.INSPIRATION]: newIns,
        },
    };
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

    const newHp = Math.min(
        entity[effectKeys.HEALTH] + amount,
        entity[effectKeys.MAX_HEALTH] + entity[effectKeys.OVERGROWTH],
    );

    return {
        ...entity,
        [effectKeys.HEALTH]: newHp,
    };
}

export function loseHp(entity, amount) {
    const newHp = Math.max(0, entity[effectKeys.HEALTH] - amount);

    return {
        ...entity,
        [effectKeys.HEALTH]: newHp,
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

export function processExitAligned(entity) {
    return {
        ...entity,
        states: {
            ...entity.states,
            [effectKeys.ALIGNED]: false,
        },
        [effectKeys.OVERGROWTH]: 0,
        [effectKeys.PERMAFROST]: 0,
        [effectKeys.SCORIA]: 0,
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

export function processExitsResonant(entity) {
    return {
        ...entity,
        [effectKeys.SONORITY]: 0,
        states: {
            ...entity.states,
            [effectKeys.RESONANT]: false,
        },
    };
}

export function exitAllStates(entity) {
    let draftEntity = {
        ...entity,
    };

    draftEntity = processExitAligned(draftEntity);
    draftEntity = processExitStargazer(draftEntity);
    draftEntity = processExitsResonant(draftEntity);

    draftEntity = {
        ...draftEntity,
        states: {
            ...createBaseEntity().states,
        },
    };

    return draftEntity;
}
