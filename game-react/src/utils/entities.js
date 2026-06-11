import { constants } from "./constants.js";
import { sdmKeys } from "./enums.js";

export function consumeResources(entity, amount, cause) {
    let draftEntity = {
        ...entity,
    };

    const ogAmount = amount;

    let resourceIndex = 0;
    while (amount > 0) {
        if (
            draftEntity.currHp <= 0 ||
            resourceIndex >= constants.resources.length
        ) {
            break;
        }

        if (
            !(
                (cause === "shadowflame" ||
                    cause === "shadowPact" ||
                    cause === "blackMayhem") &&
                (constants.resources[resourceIndex] === "shadowflame" ||
                    constants.resources[resourceIndex] === "lingeringEmber")
            )
        ) {
            const consumption = Math.min(
                draftEntity[constants.resources[resourceIndex]],
                amount,
            );

            draftEntity[constants.resources[resourceIndex]] -= consumption;
            amount -= consumption;
        }

        resourceIndex++;
    }

    if (cause === "shadowflame" || cause === "shadowPact") {
        const consumed = ogAmount - amount;
        draftEntity.shadowflame += consumed;
    }

    if (cause === "blackMayhem") {
        return {
            draftEntity,
            consumed: ogAmount - amount,
        };
    }

    return draftEntity;
}

export function restoreResources(entity, amount) {
    const missingHp = entity.maxHp - entity.currHp;
    const restoredHp = Math.min(missingHp, amount);

    entity.currHp += restoredHp;
    amount -= restoredHp;

    if (amount <= 0) {
        return entity;
    }

    const missingMana = entity.maxMana - entity.currMana;
    const restoredMana = Math.min(missingMana, amount);

    entity.currMana += restoredMana;
    amount -= restoredMana;

    if (amount <= 0) {
        return entity;
    }

    entity.manaOverflow += amount;

    return entity;
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
        manaOverflow: 0,
        bloodSacrifice: 0,
        radiance: 0,
        shackledMana: 0,
        poison: 0,
        shadowflame: 0,
        cinders: 0,
        lingeringEmber: 0,
        unrelentingShadows: 0,
        overheat: 0,
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
        drMult *= constants.ALTERNATE_DR;
    }
    if (entity.states.sacrificial) {
        drMult *= constants.ALTERNATE_DR;
    }
    if (entity.states.darkEmbrace) {
        drMult *= constants.ALTERNATE_DR;
    }

    return drMult;
}

export function processEntityDefEffect(entity) {
    let defEffect = 1.0;
    if (entity.states.guarding) {
        defEffect *= constants.ALTERNATE_DEF_EFFECTIVENESS;
    }
    if (entity.states.radiant) {
        defEffect *= 0;
    }

    return defEffect;
}
