import { constants } from "./constants.js";
import { sdmKeys } from "./enums.js";

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
        if (
            !(
                (cause === "shadowflame" ||
                    cause === "shadowPact" ||
                    cause === "blackMayhem") &&
                (currResourceKey === "shadowflame" ||
                    currResourceKey === "lingeringEmber" ||
                    currResourceKey === "unrelentingShadows")
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
        draftEntity.currHp > 0
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
        resources: { ...entity.resources },
    };

    const missingHp = draftEntity.maxHp - draftEntity.currHp;
    const restoredHp = Math.min(missingHp, amount);

    draftEntity.currHp += restoredHp;
    amount -= restoredHp;

    const missingMana = draftEntity.maxMana - draftEntity.currMana;
    const restoredMana = Math.min(missingMana, amount);

    draftEntity.currMana += restoredMana;
    amount -= restoredMana;

    draftEntity.resources.manaOverflow += amount;

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
            fadingLight: 0,
            permafrost: 0,
            overgrowth: 0,
            scoria: 0,
        },
        states: {
            guarding: false,
            sacrificial: false,
            radiant: false,
            thornedShackles: false,
            darkEmbrace: false,
            dimmingDarkness: false,
            umbralCore: false,
        },
        unspentPoints: constants.INITIAL_POINTS_AVAILABLE,
        attributes: baseAttributes,
    };
}

export function processEntityDR(entity) {
    let drMult = 1.0;
    console.log(entity);
    if (entity.states.guarding) {
        drMult *= constants.STANDARD_DR_INCREASE;
    }
    if (entity.states.sacrificial) {
        drMult *= constants.STANDARD_DR_INCREASE;
    }
    if (entity.states.darkEmbrace) {
        drMult *= constants.STANDARD_DR_INCREASE;
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
