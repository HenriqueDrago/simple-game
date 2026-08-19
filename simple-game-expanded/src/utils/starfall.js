import { coloredStars, constants } from "./constants";
import {
    consumeResources,
    processDeathCheck,
    restoreResources,
    newDealDmg,
    isEntityDead,
} from "./entities";
import { dmgTypes, effectKeys, eventKeys } from "./enums";
import { buildHistory } from "./turnManagement";

export function processROYGBIVStar(prev, masterKey, nonMasterKey, starKey) {
    let draftMaster = {
        ...prev.entities[masterKey],
    };

    // Calculate augmented amount
    const totalStars = draftMaster.stars[starKey];
    let augmentedStars = 0;
    let normalStars = totalStars;
    if (starKey !== effectKeys.VIOLET_STAR) {
        augmentedStars = Math.min(
            totalStars,
            draftMaster.stars[effectKeys.VIOLET_STAR],
        );

        normalStars = totalStars - augmentedStars;

        // Augment Logic
        const newViolet =
            draftMaster.stars[effectKeys.VIOLET_STAR] - augmentedStars;

        // Convert all into White Star
        draftMaster = {
            ...draftMaster,
            stars: {
                ...draftMaster.stars,
                [starKey]: 0,
                [effectKeys.WHITE_STAR]:
                    draftMaster.stars[effectKeys.WHITE_STAR] +
                    totalStars +
                    augmentedStars,
                [effectKeys.VIOLET_STAR]: newViolet,
            },
        };
    } else {
        draftMaster = {
            ...draftMaster,
            stars: {
                ...draftMaster.stars,
                [starKey]: 0,
                [effectKeys.WHITE_STAR]:
                    draftMaster.stars[effectKeys.WHITE_STAR] + totalStars,
            },
        };
    }

    const currentGameState = buildHistory(
        {
            ...prev,
            entities: {
                ...prev.entities,
                [masterKey]: draftMaster,
            },
        },
        eventKeys.STARFALL_SUBPHASE,
        { player: masterKey, normalStars, augmentedStars, starKey },
    );

    switch (starKey) {
        case effectKeys.RED_STAR:
            return processRedStar(
                currentGameState,
                masterKey,
                nonMasterKey,
                normalStars,
                augmentedStars,
            );
        case effectKeys.ORANGE_STAR:
            return processOrangeStar(
                currentGameState,
                masterKey,
                nonMasterKey,
                normalStars,
                augmentedStars,
            );
        case effectKeys.YELLOW_STAR:
            return processYellowStar(
                currentGameState,
                masterKey,
                nonMasterKey,
                normalStars,
                augmentedStars,
            );
        case effectKeys.GREEN_STAR:
            return processGreenStar(
                currentGameState,
                masterKey,
                nonMasterKey,
                normalStars,
                augmentedStars,
            );
        case effectKeys.BLUE_STAR:
            return processBlueStar(
                currentGameState,
                masterKey,
                nonMasterKey,
                normalStars,
                augmentedStars,
            );
        case effectKeys.INDIGO_STAR:
            return processIndigoStar(
                currentGameState,
                masterKey,
                nonMasterKey,
                normalStars,
                augmentedStars,
            );
        case effectKeys.VIOLET_STAR:
            return processVioletStar(
                currentGameState,
                masterKey,
                nonMasterKey,
                normalStars,
                augmentedStars,
            );
        default:
            return currentGameState;
    }
}

export function processRedStar(
    prev,
    masterKey,
    nonMasterKey,
    normalStars,
    augmentedStars,
) {
    let currentGameState = prev;
    const targetKeys = [masterKey, nonMasterKey];

    if (augmentedStars > 0) {
        currentGameState = newDealDmg(
            currentGameState,
            augmentedStars,
            targetKeys,
            dmgTypes.PIERCING,
            null,
        );
    }

    if (normalStars > 0) {
        currentGameState = newDealDmg(
            currentGameState,
            normalStars,
            targetKeys,
            dmgTypes.PHYSICAL,
            null,
        );
    }

    return currentGameState;
}

export function processOrangeStar(
    prev,
    masterKey,
    nonMasterKey,
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...prev.entities[masterKey],
    };

    let draftNonMaster = {
        ...prev.entities[nonMasterKey],
    };

    // Consume resources on self
    const resultSelf = consumeResources(
        draftMaster,
        normalStars + augmentedStars,
        effectKeys.ORANGE_STAR,
    );

    // Consume resources on opponent
    const resultNonSelf = consumeResources(
        draftNonMaster,
        augmentedStars,
        effectKeys.ORANGE_STAR,
    );

    draftMaster = resultSelf.draftEntity;
    draftNonMaster = resultNonSelf.draftEntity;

    // Gain Gray Star equal to the total consumed
    const consumed =
        resultSelf.resourcesConsumed.totalConsumption +
        resultNonSelf.resourcesConsumed.totalConsumption;

    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [effectKeys.GRAY_STAR]:
                draftMaster.stars[effectKeys.GRAY_STAR] + consumed,
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [masterKey]: draftMaster,
            [nonMasterKey]: draftNonMaster,
        },
    };
}

export function processIndigoStar(
    prev,
    masterKey,
    nonMasterKey,
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...prev.entities[masterKey],
    };

    draftMaster = {
        ...draftMaster,
        resources: {
            ...draftMaster.resources,
            [effectKeys.STARDUST]:
                draftMaster.resources[effectKeys.STARDUST] + normalStars,
        },
        stars: {
            ...draftMaster.stars,
            [effectKeys.GRAY_STAR]:
                draftMaster.stars[effectKeys.GRAY_STAR] + augmentedStars,
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [masterKey]: draftMaster,
        },
    };
}

export function processGreenStar(
    prev,
    masterKey,
    nonMasterKey,
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...prev.entities[masterKey],
    };

    // Restores resources
    draftMaster = restoreResources(draftMaster, normalStars + augmentedStars);

    // lose normal stars used
    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [effectKeys.WHITE_STAR]:
                draftMaster.stars[effectKeys.WHITE_STAR] - normalStars,
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [masterKey]: draftMaster,
        },
    };
}

export function processBlueStar(
    prev,
    masterKey,
    nonMasterKey,
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...prev.entities[masterKey],
    };

    draftMaster = {
        ...draftMaster,
        resources: {
            ...draftMaster.resources,
            [effectKeys.FRACTURED_DOME]:
                draftMaster.resources[effectKeys.FRACTURED_DOME] + normalStars,
            [effectKeys.FAULTY_FIRMAMENT]:
                draftMaster.resources[effectKeys.FAULTY_FIRMAMENT] +
                augmentedStars,
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [masterKey]: draftMaster,
        },
    };
}

export function processYellowStar(
    prev,
    masterKey,
    nonMasterKey,
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...prev.entities[masterKey],
    };

    // Normal Star
    const totalRaise = normalStars * constants.GRAVITATION_GAIN;
    const gravRaised = Math.min(
        totalRaise,
        constants.MAX_GRAVITATION - draftMaster[effectKeys.GRAVITATION],
    );
    const accretionRaised = Math.min(
        totalRaise - gravRaised,
        constants.MAX_ACCRETION - draftMaster[effectKeys.ACCRETION],
    );
    const starblightRaised = Math.floor(
        (totalRaise - gravRaised - accretionRaised) /
            constants.ACC_STARBLIGHT_CONVERSION,
    );

    draftMaster = {
        ...draftMaster,
        [effectKeys.GRAVITATION]: Math.max(
            0,
            draftMaster[effectKeys.GRAVITATION] + gravRaised,
        ),
        [effectKeys.ACCRETION]: Math.max(
            0,
            draftMaster[effectKeys.ACCRETION] + accretionRaised,
        ),
        [effectKeys.STARBLIGHT]: Math.max(
            0,
            draftMaster[effectKeys.STARBLIGHT] + starblightRaised,
        ),
    };

    // Augmented Star
    // Azure
    if (draftMaster[effectKeys.AZURE_CONSTELLATION] > 0) {
        draftMaster = {
            ...draftMaster,
            [effectKeys.AZURE_CONSTELLATION]:
                draftMaster[effectKeys.AZURE_CONSTELLATION] + augmentedStars,
        };
    }
    // Crimson
    else if (draftMaster[effectKeys.CRIMSON_CONSTELLATION] > 0) {
        draftMaster = {
            ...draftMaster,
            [effectKeys.CRIMSON_CONSTELLATION]:
                draftMaster[effectKeys.CRIMSON_CONSTELLATION] + augmentedStars,
        };
    }
    // Default
    else {
        draftMaster = {
            ...draftMaster,
            [effectKeys.CONSTELLATION]:
                draftMaster[effectKeys.CONSTELLATION] + augmentedStars,
        };
    }

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [masterKey]: draftMaster,
        },
    };
}

export function processVioletStar(
    prev,
    masterKey,
    nonMasterKey,
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...prev.entities[masterKey],
    };

    // Convert Gray Star into White Star
    const grayConsumed = Math.min(
        draftMaster.stars[effectKeys.GRAY_STAR],
        normalStars + augmentedStars,
    );

    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [effectKeys.WHITE_STAR]:
                draftMaster.stars[effectKeys.WHITE_STAR] + grayConsumed,
            [effectKeys.GRAY_STAR]:
                draftMaster.stars[effectKeys.GRAY_STAR] - grayConsumed,
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [masterKey]: draftMaster,
        },
    };
}

export function simulateFullStarfall(prev, ownerKey, nonOwnerKey) {
    if (!prev?.entities?.[ownerKey]?.states?.[effectKeys.STARGAZER]) {
        return prev;
    }

    let gameState = {
        ...prev,
    };

    for (let star of Object.values(coloredStars)) {
        gameState = processDeathCheck(
            processROYGBIVStar(gameState, ownerKey, nonOwnerKey, star.star),
        );

        if (
            isEntityDead(gameState.entities[ownerKey]) ||
            isEntityDead(gameState.entities[nonOwnerKey])
        ) {
            return gameState;
        }
    }

    return gameState;
}
