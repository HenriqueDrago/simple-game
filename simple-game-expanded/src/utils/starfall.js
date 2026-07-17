import { consumeResources, restoreResources, takeDamage } from "./entities";
import { dmgTypes, effectKeys } from "./enums";

export function processROYGBStar({ master, nonMaster }, starKey, trailKey) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    // Calculate augment/fracture amount
    const totalStars = draftMaster.stars[starKey];
    const fracturedStars = Math.min(
        totalStars,
        draftMaster.stars[effectKeys.INDIGO_STAR],
    );
    const augmentedStars = Math.min(
        totalStars - fracturedStars,
        draftMaster.stars[effectKeys.VIOLET_STAR],
    );
    const normalStars = totalStars - fracturedStars - augmentedStars;

    // Fracture logic
    const newTrails = draftMaster.stars[trailKey] + fracturedStars * 2;
    const newIndigo =
        draftMaster.stars[effectKeys.INDIGO_STAR] - fracturedStars;

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
                augmentedStars +
                fracturedStars,
            [effectKeys.VIOLET_STAR]: newViolet,
            [trailKey]: newTrails,
            [effectKeys.INDIGO_STAR]: newIndigo,
        },
    };

    // Normal/Fractured Blue Special Case
    if (starKey === effectKeys.BLUE_STAR) {
        draftMaster = {
            ...draftMaster,
            stars: {
                ...draftMaster.stars,
                [effectKeys.WHITE_STAR]:
                    draftMaster.stars[effectKeys.WHITE_STAR] -
                    (fracturedStars * 2) -
                    normalStars,
                [effectKeys.GRAY_STAR]:
                    draftMaster.stars[effectKeys.GRAY_STAR] +
                    (fracturedStars * 2) +
                    normalStars,
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
    }

    return {
        draftMaster,
        draftNonMaster,
    };
}

export function processIVStar({ master, nonMaster }, starKey) {
    const draftMaster = {
        ...master,
        stars: {
            ...master.stars,
            [starKey]: 0,
            [effectKeys.WHITE_STAR]:
                master.stars[starKey] + master.stars[effectKeys.WHITE_STAR],
        },
    };

    return {
        draftMaster,
        nonMaster,
    };
}

export function processTrail({ master, nonMaster }, trailKey) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    // Process star action
    const trails = master.stars[trailKey];
    const newContext = { master: draftMaster, nonMaster: draftNonMaster };

    switch (trailKey) {
        case effectKeys.RED_TRAIL: {
            const newEntities = processRedStar(newContext, trails, 0);
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.ORANGE_TRAIL: {
            const newEntities = processOrangeStar(newContext, trails, 0);
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.YELLOW_TRAIL: {
            const newEntities = processYellowStar(newContext, trails, 0);
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.GREEN_TRAIL: {
            const newEntities = processGreenStar(newContext, trails, 0);
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.BLUE_TRAIL: {
            const newEntities = processBlueStar(newContext, trails, 0);
            draftMaster = newEntities.draftMaster;
            draftNonMaster = newEntities.draftNonMaster;
            break;
        }
        case effectKeys.INDIGO_TRAIL: {
            draftMaster = {
                ...draftMaster,
                stars: {
                    ...draftMaster.stars,
                    [effectKeys.INDIGO_TRAIL]: 0,
                },
            };
            break;
        }
        case effectKeys.VIOLET_TRAIL: {
            draftMaster = {
                ...draftMaster,
                stars: {
                    ...draftMaster.stars,
                    [effectKeys.VIOLET_TRAIL]: 0,
                },
            };
            break;
        }
    }

    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [trailKey]: 0,
        },
    };

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

    // Consume resources on opponent
    draftNonMaster = consumeResources(
        draftNonMaster,
        normalStars + augmentedStars,
        effectKeys.ORANGE_STAR,
    ).draftEntity;

    // lose white star
    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [effectKeys.WHITE_STAR]: draftMaster.stars[effectKeys.WHITE_STAR] - normalStars,
        }
    }

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

    const {draftEntity, resourcesConsumed} = consumeResources(draftMaster, normalStars, effectKeys.GREEN_STAR);
    draftMaster = restoreResources(draftEntity, augmentedStars + resourcesConsumed.totalConsumption);

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
