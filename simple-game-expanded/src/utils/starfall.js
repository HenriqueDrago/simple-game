import { constants } from "./constants";
import {
    consumeResources,
    restoreResources,
    takeDamage,
} from "./entities";
import { dmgTypes, effectKeys } from "./enums";

export function processROYGBIVStar(prev, masterkey, nonMasterKey, starKey) {
    let draftMaster = {
        ...prev.entities[masterkey],
    };

    let draftNonMaster = {
        ...prev.entities[nonMasterKey],
    };

    // Calculate augmented amount
    const totalStars = draftMaster.stars[starKey];
    let augmentedStars = 0;
    let normalStars = totalStars;
    if (starKey !== effectKeys.VIOLET_STAR) {

        augmentedStars = 

            Math.min(totalStars, draftMaster.stars[effectKeys.VIOLET_STAR]);

        normalStars = totalStars - augmentedStars;

        // Augment Logic
        const newViolet =
            draftMaster.stars[effectKeys.VIOLET_STAR] -
             augmentedStars;

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

    // Process star action
    const newContext = { master: draftMaster, nonMaster: draftNonMaster };

    switch (starKey) {
        case effectKeys.RED_STAR: {
            const newEntities = processRedStar(
                newContext,
                normalStars,
                augmentedStars,
            );
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.ORANGE_STAR: {
            const newEntities = processOrangeStar(
                newContext,
                normalStars,
                augmentedStars,
            );
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.YELLOW_STAR: {
            const newEntities = processYellowStar(
                newContext,
                normalStars,
                augmentedStars,
            );
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.GREEN_STAR: {
            const newEntities = processGreenStar(
                newContext,
                normalStars,
                augmentedStars,
            );
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.BLUE_STAR: {
            const newEntities = processBlueStar(
                newContext,
                normalStars,
                augmentedStars,
            );
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.INDIGO_STAR: {
            const newEntities = processIndigoStar(
                newContext,
                normalStars,
                augmentedStars,
            );
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.VIOLET_STAR: {
            const newEntities = processVioletStar(
                newContext,
                normalStars,
                augmentedStars,
            );
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        default:
            break;
    }

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [masterkey]: draftMaster,
            [nonMasterKey]: draftNonMaster,
        }
    };
}

export function processRedStar(
    { master, nonMaster },
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    if (augmentedStars > 0) {
        draftNonMaster = takeDamage(
            draftNonMaster,
            augmentedStars,
            dmgTypes.PIERCING,
        );
    }

    if (normalStars > 0) {
        draftNonMaster = takeDamage(
            draftNonMaster,
            normalStars,
            dmgTypes.PHYSICAL,
        );
    }

    return {
        draftMaster,
        draftNonMaster,
    };
}

export function processOrangeStar(
    { master, nonMaster },
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
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
        draftMaster,
        draftNonMaster,
    };
}

export function processIndigoStar(
    { master, nonMaster },
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
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
        draftMaster,
        draftNonMaster,
    };
}

export function processGreenStar(
    { master, nonMaster },
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    // Restores resources
    draftMaster = restoreResources(
        draftMaster,
        normalStars + augmentedStars,
    );

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
        draftMaster,
        draftNonMaster,
    };
}

export function processBlueStar(
    { master, nonMaster },
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    draftMaster = {
        ...draftMaster,
        resources: {
            ...draftMaster.resources,
            [effectKeys.DOME]:
                draftMaster.resources[effectKeys.DOME] + normalStars,
            [effectKeys.STARLIT_DOME]:
                draftMaster.resources[effectKeys.STARLIT_DOME] + augmentedStars,
        },
        stars: {
            ...draftMaster.stars,
            [effectKeys.WHITE_STAR]: draftMaster.stars[effectKeys.WHITE_STAR] - normalStars,
            [effectKeys.GRAY_STAR]: draftMaster.stars[effectKeys.GRAY_STAR] + normalStars,
        }
    };

    return {
        draftMaster,
        draftNonMaster,
    };
}

export function processYellowStar(
    { master, nonMaster },
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    // Normal Star
    const totalRaise = normalStars * constants.GRAVITATION_GAIN;
    const gravRaised = Math.min(
        totalRaise,
        constants.MAX_GRAVITATION - draftMaster[effectKeys.GRAVITATION],
    );
    const starblightRaised = Math.min(
        totalRaise - gravRaised,
        constants.MAX_STARBLIGHT - draftMaster[effectKeys.STARBLIGHT],
    );

    draftMaster = {
        ...draftMaster,
        [effectKeys.GRAVITATION]: Math.max(
            0,
            draftMaster[effectKeys.GRAVITATION] + gravRaised,
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
        draftMaster,
        draftNonMaster,
    };
}

export function processVioletStar(
    { master, nonMaster },
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    // Convert Gray Star into White Star
    const grayConsumed = Math.min(draftMaster.stars[effectKeys.GRAY_STAR], normalStars + augmentedStars);

    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [effectKeys.WHITE_STAR]: draftMaster.stars[effectKeys.WHITE_STAR] + grayConsumed,
            [effectKeys.GRAY_STAR]: draftMaster.stars[effectKeys.GRAY_STAR] - grayConsumed,
        }
    }

    return {
        draftMaster,
        draftNonMaster,
    };
}
