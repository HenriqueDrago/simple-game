import { constants } from "./constants.js";
import {
    sdmKeys,
    actionKeys,
    effectKeys,
    dmgTypes,
    elementalKeys,
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

    // Limited resource consumption
    while (
        amount > 0 &&
        resourceIndex < constants.limitedResources.length &&
        (draftEntity.currHp > 0 ||
            (draftEntity.states.ascendenceOfSpirit &&
                draftEntity.currEnlit > 0))
    ) {
        const currResourceKey = constants.limitedResources[resourceIndex];

        if (
            !(
                cause === effectKeys.ASCENDENCE_OF_SPIRIT &&
                (currResourceKey === "currEnlit" ||
                    currResourceKey === "currInsight")
            )
        ) {
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
        }

        resourceIndex++;
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
        resources: { ...entity.resources },
    };

    if (wheel === elementalKeys.NATURE && entity.states.aligned) {
        amount = Math.floor(amount * constants.NATURE_PASSIVE_MULT);
    }

    if (entity.states.ascendenceOfSpirit) {
        const missingEnlit = draftEntity.maxEnlit - draftEntity.currEnlit;
        const restoredEnlit = Math.min(missingEnlit, amount);

        amount -= restoredEnlit;

        draftEntity = {
            ...draftEntity,
            currEnlit: draftEntity.currEnlit + restoredEnlit,
        };

        draftEntity = gainInsight(draftEntity, amount);
    } else {
        const missingHp =
            draftEntity.maxHp + draftEntity.overgrowth - draftEntity.currHp;
        const restoredHp = Math.min(missingHp, amount);

        amount -= restoredHp;

        draftEntity = {
            ...draftEntity,
            currHp: draftEntity.currHp + restoredHp,
        };

        draftEntity = gainMana(draftEntity, amount);
    }

    return draftEntity;
}

export function distributePoints(entity, mode, bestStats = null) {
    let newEntity = {
        ...entity,
        attributes: {},
    };

    for (let attr of constants.ATTRIBUTE_NAMES) {
        newEntity.attributes[attr] = { ...entity.attributes[attr] };
    }

    switch (mode) {
        case sdmKeys.CUSTOM:
            // Do nothing
            break;

        case sdmKeys.RANDOM:
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
                            Math.random() * constants.ATTRIBUTE_NAMES.length,
                        )
                    ];
                newEntity.attributes[random_stat].points += 1;
                newEntity.unspentPoints -= 1;
            }

            // Apply values
            for (let attr of constants.ATTRIBUTE_NAMES) {
                newEntity.attributes[attr].value =
                    constants.BASE_STATS[attr] +
                    newEntity.attributes[attr].points *
                        constants.STAT_MULTIPLIERS[attr];
            }
            break;

        case sdmKeys.BEST:
            // Verify if a "Best" distribution has been passed
            if (!bestStats) {
                break;
            }

            // Reset points
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;

            // Distribute points
            for (let attr of constants.ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: bestStats[attr],
                    value:
                        constants.BASE_STATS[attr] +
                        bestStats[attr] * constants.STAT_MULTIPLIERS[attr],
                };

                newEntity.unspentPoints -= bestStats[attr];
            }
            break;

        case sdmKeys.FULL_DEF:
            // Reset points and stats
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;

            for (let attr of constants.ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: 0,
                    value: constants.BASE_STATS[attr],
                };
            }

            // Distribute points
            newEntity.attributes.def = {
                ...newEntity.attributes.def,
                points: newEntity.unspentPoints,
                value:
                    constants.BASE_STATS.def +
                    newEntity.unspentPoints * constants.STAT_MULTIPLIERS.def,
            };

            newEntity.unspentPoints = 0;

            break;

        case sdmKeys.FULL_STR:
            // Reset points
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;

            for (let attr of constants.ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: 0,
                    value: constants.BASE_STATS[attr],
                };
            }

            // Distribute points
            newEntity.attributes.str = {
                ...newEntity.attributes.str,
                points: newEntity.unspentPoints,
                value:
                    constants.BASE_STATS.str +
                    newEntity.unspentPoints * constants.STAT_MULTIPLIERS.str,
            };

            newEntity.unspentPoints = 0;

            break;

        default:
            break;
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
        maxHp: constants.BASE_STATS.hp,
        currHp: constants.BASE_STATS.hp,
        maxMana: constants.BASE_STATS.mana,
        currMana: constants.BASE_STATS.mana,
        maxOverheat: constants.MAX_OVERHEAT,
        currOverheat: 0,
        maxEnlit: constants.MAX_ENLIT,
        currEnlit: 0,
        maxInsight: constants.MAX_INSIGHT,
        currInsight: 0,
        maxTarnishedSin: constants.MAX_TARNISHED_SIN,
        currTarnishedSin: 0,
        sonority: 0,
        lasersUsedThisTurn: 0,
        permafrost: 0,
        overgrowth: 0,
        scoria: 0,
        revelation: 0,
        resources: {
            manaOverflow: 0,
            bloodSacrifice: 0,
            radiance: 0,
            shackledMana: 0,
            poison: 0,
            shadowflame: 0,
            cinders: 0,
            lingeringEmber: 0,
            unrelentingShadows: 0,
            halo: 0,
            cryogenesis: 0,
            sacredFlames: 0,
            benediction: 0,
            stardust: 0,
            [effectKeys.DOME]: 0,
        },
        states: {
            guarding: false,
            sacrificial: false,
            radiant: false,
            thornedShackles: false,
            darkEmbrace: false,
            dimmingDarkness: false,
            umbralCore: false,
            deployment: false,
            weaponsDeployed: false,
            thermalOverload: false,
            resonant: false,
            venting: false,
            aligned: false,
            cutoffWings: false,
            ascendenceOfSpirit: false,
            burdenOfStigma: false,
            stargazer: false,
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

    if (defender.states.ascendenceOfSpirit) {
        const finalDmg = Math.max(
            1,
            Math.floor(
                (baseDmg + additionalDmg) *
                    scorchAtkMult *
                    scorchDefMult *
                    frostAtkMult *
                    frostDefMult,
            ),
        );

        const beneConsumed =
            dmgType === dmgTypes.TRUE_DAMAGE
                ? 0
                : Math.min(defender.resources.benediction, finalDmg);
        const finalDmgPostMitigation = finalDmg - beneConsumed;

        const defenderNewEnlit = Math.max(
            0,
            defender.currEnlit - finalDmgPostMitigation,
        );

        const newBene = defender.resources.benediction - beneConsumed;

        draftDefender = {
            ...draftDefender,
            currEnlit: defenderNewEnlit,
            resources: {
                ...draftDefender.resources,
                benediction: newBene,
            },
        };

        draftAttacker = {
            ...draftAttacker,
            resources: {
                ...draftAttacker.resources,
                sacredFlames:
                    draftAttacker.resources.sacredFlames + beneConsumed,
            },
        };
    } else {
        const effectiveDef =
            dmgType === dmgTypes.PHYSICAL
                ? (draftDefender.attributes.def.value +
                      draftDefender.permafrost) *
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
                ? Math.min(
                      finalDmg - domeConsumed,
                      draftDefender.resources.halo,
                  )
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

        const defenderNewHp = Math.max(
            0,
            defender.currHp - damagePostMitigation,
        );

        const defenderNewHalo = defender.resources.halo - haloConsumed;
        const defenderNewCryo = defender.resources.cryogenesis - cryoConsumed;
        const defenderNewEmbers =
            defender.resources.lingeringEmber - emberConsumed;
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

        draftDefender = {
            ...draftDefender,
            currHp: defenderNewHp,
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

export function takeDamage(entity, baseDmg, dmgType, wheel) {
    const scorchMult =
        wheel === elementalKeys.SCORCH && entity.states.aligned
            ? constants.SCORCH_PASSIVE_MULT
            : 1.0;

    const frostMult =
        wheel === elementalKeys.FROST && entity.states.aligned
            ? constants.FROST_PASSIVE_MULT
            : 1.0;

    if (entity.states.ascendenceOfSpirit) {
        const finalDmg = Math.max(
            1,
            Math.floor(baseDmg * scorchMult * frostMult),
        );

        const beneConsumed =
            dmgType === dmgTypes.TRUE_DAMAGE
                ? 0
                : Math.min(entity.resources.benediction, finalDmg);
        const finalDmgPostMitigation = finalDmg - beneConsumed;

        const newEnlit = Math.max(0, entity.currEnlit - finalDmgPostMitigation);

        return {
            ...entity,
            currEnlit: newEnlit,
        };
    }

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

    let newHp = Math.max(0, entity.currHp - damagePostMitigation);

    const newHalo = entity.resources.halo - haloConsumed;
    const newCryo = entity.resources.cryogenesis - cryoConsumed;
    const newEmbers = entity.resources.lingeringEmber - emberConsumed;
    const newRadiance = entity.resources.radiance + haloConsumed;
    const newCinders = entity.resources.cinders + emberConsumed;
    const newDome = entity.resources[effectKeys.DOME] - domeConsumed;

    return {
        ...entity,
        currHp: newHp,
        resources: {
            ...entity.resources,
            halo: newHalo,
            lingeringEmber: newEmbers,
            radiance: newRadiance,
            cryogenesis: newCryo,
            cinders: newCinders,
            dome: newDome,
        },
    };
}

export function gainMana(entity, amount) {
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

export function gainInsight(entity, amount) {
    const missingInsight = entity.maxInsight - entity.currInsight;

    const newInsight = Math.min(entity.maxInsight, entity.currInsight + amount);
    const newSacredFlames =
        entity.resources.sacredFlames + Math.max(0, amount - missingInsight);

    return {
        ...entity,
        currInsight: newInsight,
        resources: {
            ...entity.resources,
            sacredFlames: newSacredFlames,
        },
    };
}
