import { consumeResources, restoreResources, takeDamage } from "./entities";
import { dmgTypes, effectKeys } from "./enums";
import { constants } from "./constants";

export function processROYGBStar({ master, nonMaster }, starKey, trailKey) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    // Calculate augment/fracture amount
    const totalStars = draftMaster.stars[starKey];
    const fracturedStars = Math.min(totalStars, draftMaster.stars.indigo);
    const augmentedStars = Math.min(
        totalStars - fracturedStars,
        draftMaster.stars.violet,
    );
    const normalStars = totalStars - fracturedStars - augmentedStars;

    // Fracture logic
    const newTrails = draftMaster.stars[trailKey] + fracturedStars * 2;
    const newIndigo = draftMaster.stars.indigo - fracturedStars;
    const newDimIndigo =
        draftMaster.stars[effectKeys.DIMMED_INDIGO_STAR] + fracturedStars;

    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [trailKey]: newTrails,
            [effectKeys.INDIGO_STAR]: newIndigo,
            [effectKeys.DIMMED_INDIGO_STAR]: newDimIndigo,
        },
    };

    // Blue special logic
    if (starKey === effectKeys.BLUE_STAR && fracturedStars > 0) {
        draftMaster = {
            ...draftMaster,
            stars: {
                ...draftMaster.stars,
                [effectKeys.DIMMED_BLUE_STAR]: 
                    draftMaster.stars[effectKeys.DIMMED_BLUE_STAR] + fracturedStars,
                [effectKeys.BLUE_STAR]: 
                    draftMaster.stars[effectKeys.BLUE_STAR] - fracturedStars,
            }
        };
    }

    // Calculate new violets
    const newViolet = draftMaster.stars.violet - augmentedStars;
    const newDimViolet =
        draftMaster.stars[effectKeys.DIMMED_VIOLET_STAR] + augmentedStars;

    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [effectKeys.VIOLET_STAR]: newViolet,
            [effectKeys.DIMMED_VIOLET_STAR]: newDimViolet,
        },
    };

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

export function processIVStar({ master, nonMaster }, starKey, dimStarKey) {
    const draftMaster = {
        ...master,
        stars: {
            ...master.stars,
            [starKey]: 0,
            [dimStarKey]: master.stars[starKey] + master.stars[dimStarKey],
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
            const newEntities = processBlueTrail(newContext, trails);
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
            }
            break;
        }
        case effectKeys.VIOLET_TRAIL: {
            draftMaster = {
                ...draftMaster,
                stars: {
                    ...draftMaster.stars,
                    [effectKeys.VIOLET_TRAIL]: 0,
                },
            }
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

function processRedStar(
    { master, nonMaster, wheel },
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
            wheel,
        );
    }
    
    if (augmentedStars > 0) {
        draftNonMaster = takeDamage(
            draftNonMaster,
            augmentedStars,
            dmgTypes.TRUE,
            wheel,
        );
    }

    return {
        draftMaster,
        draftNonMaster,
    };
}

function processOrangeStar({ master, nonMaster }, normalStars, augmentedStars) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    const result = consumeResources(
        draftNonMaster,
        normalStars,
        effectKeys.ORANGE_STAR,
    );
    draftNonMaster = {
        ...result.draftEntity,
    };

    const { draftEntity, resourcesConsumed } = consumeResources(
        draftNonMaster,
        augmentedStars,
        effectKeys.ORANGE_STAR,
    );

    draftNonMaster = {
        ...draftEntity,
    };

    for (let value of constants.limitedResources) {
        draftMaster = {
            ...draftMaster,
            [value]: draftMaster[value] + (resourcesConsumed[value] || 0),
        };
    }

    for (let value of constants.freeResources) {
        draftMaster = {
            ...draftMaster,
            resources: {
                ...draftMaster.resources,
                [value]: draftMaster.resources[value] + (resourcesConsumed[value] || 0),
            },
        };
    }

    return {
        draftMaster,
        draftNonMaster,
    };
}

function processYellowStar({ master, nonMaster }, normalStars, augmentedStars) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [effectKeys.WHITE_STAR]:
                draftMaster.stars[effectKeys.WHITE_STAR] + augmentedStars,
        },
        resources: {
            ...draftMaster.resources,
            [effectKeys.STARDUST]:
                draftMaster.resources[effectKeys.STARDUST] + normalStars,
        },
    };

    return {
        draftMaster,
        draftNonMaster,
    };
}

function processGreenStar(
    { master, nonMaster, wheel },
    normalStars,
    augmentedStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    draftMaster = restoreResources(draftMaster, normalStars, wheel);
    draftNonMaster = restoreResources(draftNonMaster, augmentedStars, wheel);

    return {
        draftMaster,
        draftNonMaster,
    };
}

function processBlueStar({ master, nonMaster }, normalStars, augmentedStars) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    const normalBlueConsumed = Math.min(
        draftMaster.stars[effectKeys.BLUE_STAR],
        normalStars,
    );
    const augmentedBlueConsumed = Math.min(
        draftMaster.stars[effectKeys.BLUE_STAR],
        augmentedStars,
    );

    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [effectKeys.BLUE_STAR]:
                draftMaster.stars[effectKeys.BLUE_STAR] -
                normalBlueConsumed -
                augmentedBlueConsumed,
            [effectKeys.WHITE_STAR]:
                draftMaster.stars[effectKeys.WHITE_STAR] +
                augmentedBlueConsumed,
            [effectKeys.GRAY_STAR]:
                draftMaster.stars[effectKeys.GRAY_STAR] +
                normalBlueConsumed,
        },
        resources: {
            ...draftMaster.resources,
            [effectKeys.DOME]:
                draftMaster.resources[effectKeys.DOME] +
                normalBlueConsumed +
                augmentedBlueConsumed,
        },
    };

    return {
        draftMaster,
        draftNonMaster,
    };
}

function processBlueTrail({ master, nonMaster }, trails) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    const dimBlueConsumed = Math.min(
        draftMaster.stars[effectKeys.DIMMED_BLUE_STAR],
        trails,
    );

    const dimIndigoConsumed = Math.min(
        draftMaster.stars[effectKeys.DIMMED_INDIGO_STAR],
        trails - dimBlueConsumed,
    );

    draftMaster = {
        ...draftMaster,
        stars: {
            ...draftMaster.stars,
            [effectKeys.DIMMED_BLUE_STAR]:
                draftMaster.stars[effectKeys.DIMMED_BLUE_STAR] -
                dimBlueConsumed,
            [effectKeys.DIMMED_INDIGO_STAR]:
                draftMaster.stars[effectKeys.DIMMED_INDIGO_STAR] -
                dimIndigoConsumed,
            [effectKeys.GRAY_STAR]:
                draftMaster.stars[effectKeys.GRAY_STAR] +
                dimBlueConsumed +
                dimIndigoConsumed,
        },
        resources: {
            ...draftMaster.resources,
            [effectKeys.DOME]:
                draftMaster.resources[effectKeys.DOME] +
                dimBlueConsumed +
                dimIndigoConsumed,
        },
    };

    return {
        draftMaster,
        draftNonMaster,
    };
}
