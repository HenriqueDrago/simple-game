import { constants } from "./constants";

export function generateEntitiesForMode(
    mode,
    playerController,
    enemyController,
) {
    let newPlayer = {
        ...createBaseEntity(),
        controller: playerController,
        key: "_player",
    };
    let newEnemy = {
        ...createBaseEntity(),
        controller: enemyController,
        key: "_enemy",
    };

    switch (mode) {
        case "Random":
            newEnemy = distribute_points(newEnemy);
            newPlayer = distribute_points(newPlayer);
            break;
        case "Randomize Enemy":
            newEnemy = distribute_points(newEnemy);
            break;
        case "Randomize Player":
            newPlayer = distribute_points(newPlayer);
            break;
        case "Custom":
        default:
            break;
    }

    return {
        player: newPlayer,
        enemy: newEnemy,
    };
}

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

export function applyStats(attributes) {
    let newAtt = {
        ...attributes,
    };

    for (let att of constants.ATTRIBUTE_NAMES) {
        newAtt[att] = {
            ...newAtt[att],
            value:
                constants.BASE_STATS[att] +
                newAtt[att].points * constants.STAT_MULTIPLIERS[att],
        };
    }

    return newAtt;
}

export function distribute_points(entity) {
    let clonedAttributes = {};

    for (let att of constants.ATTRIBUTE_NAMES) {
        clonedAttributes[att] = { ...entity.attributes[att] };
    }

    let newEntity = {
        ...entity,
        attributes: clonedAttributes,
    };

    for (let i = 0; i < constants.INITIAL_POINTS_AVAILABLE; i++) {
        let random_stat =
            constants.ATTRIBUTE_NAMES[
                Math.floor(Math.random() * constants.ATTRIBUTE_NAMES.length)
            ];
        newEntity.attributes[random_stat].points += 1;
        newEntity.unspentPoints -= 1;
    }

    for (let attr of constants.ATTRIBUTE_NAMES) {
        newEntity.attributes[attr] = {
            ...newEntity.attributes[attr],
            valuePreview:
                constants.BASE_STATS[attr] +
                newEntity.attributes[attr].points *
                    constants.STAT_MULTIPLIERS[attr],
        };
    }

    return newEntity;
}

export function createBaseEntity() {
    let baseAttributes = {};

    for (let attr of constants.ATTRIBUTE_NAMES) {
        baseAttributes[attr] = {
            value: constants.BASE_STATS[attr],
            valuePreview: constants.BASE_STATS[attr],
            points: 0,
        };
    }

    return {
        maxHp: constants.BASE_STATS.hp,
        currHp: constants.BASE_STATS.hp,
        maxMana: constants.BASE_STATS.mana,
        currMana: constants.BASE_STATS.mana,
        manaOverflow: 0,
        dmgReduction: 0,
        defEffect: 1.0,
        bloodSacrifice: 0,
        radiance: 0,
        shackledMana: 0,
        poison: 0,
        shadowflame: 0,
        cinders: 0,
        lingeringEmber: 0,
        unrelentingShadows: 0,
        overheat: 0,
        darkEmbrace: false,
        dimmingDarkness: false,
        umbralCore: false,
        unspentPoints: constants.INITIAL_POINTS_AVAILABLE,
        attributes: baseAttributes,
    };
}
