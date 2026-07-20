import { constants } from "./constants";
import { consumeResources, restoreResources, takeDamage } from "./entities";
import { dmgTypes, effectKeys } from "./enums";

export function processROYGBIVStar({ master, nonMaster }, starKey) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
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

    // Normal Blue Special Case
    if (starKey === effectKeys.BLUE_STAR) {
        draftMaster = {
            ...draftMaster,
            stars: {
                ...draftMaster.stars,
                [effectKeys.WHITE_STAR]:
                    draftMaster.stars[effectKeys.WHITE_STAR] - normalStars,
                [effectKeys.GRAY_STAR]:
                    draftMaster.stars[effectKeys.GRAY_STAR] + normalStars,
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
        // case effectKeys.VIOLET_STAR: {
        //     const newEntities = processVioletStar(
        //         newContext,
        //         normalStars,
        //         augmentedStars,
        //     );
        //     draftMaster = newEntities.draftMaster;
        //     draftNonMaster = newEntities.draftNonMaster;
        //     break;
        // }
        default:
            break;
    }

    return {
        draftMaster,
        draftNonMaster,
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

    if (normalStars > 0) {
        draftNonMaster = takeDamage(
            draftNonMaster,
            normalStars,
            dmgTypes.PHYSICAL,
        );
    }

    if (augmentedStars > 0) {
        draftNonMaster = takeDamage(
            draftNonMaster,
            augmentedStars,
            dmgTypes.PIERCING,
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
    draftMaster = consumeResources(
        draftMaster,
        normalStars + augmentedStars,
        effectKeys.ORANGE_STAR,
    ).draftEntity;

    // Consume resources on opponent
    draftNonMaster = consumeResources(
        draftNonMaster,
        augmentedStars,
        effectKeys.ORANGE_STAR,
    ).draftEntity;

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
                draftMaster.resources[effectKeys.DOME] +
                normalStars +
                augmentedStars * 2,
        },
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
    const totalRaise = normalStars * constants.NORMAL_YELLOW_NEBULA_GAIN;
    const nebulaRaised = Math.min(
        totalRaise,
        constants.MAX_NEBULA - draftMaster[effectKeys.NEBULA],
    );
    const starblightRaised = Math.min(
        totalRaise - nebulaRaised,
        constants.MAX_STARBLIGHT - draftMaster[effectKeys.STARBLIGHT],
    );

    draftMaster = {
        ...draftMaster,
        [effectKeys.NEBULA]: Math.max(
            0,
            draftMaster[effectKeys.NEBULA] + nebulaRaised,
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
