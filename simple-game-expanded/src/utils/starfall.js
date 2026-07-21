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

    const isNova = draftMaster.states[effectKeys.NOVA];

    // Calculate augmented amount
    const totalStars = draftMaster.stars[starKey];
    let augmentedStars = 0;
    let novaStars = 0;
    let normalStars = totalStars;
    if (starKey !== effectKeys.VIOLET_STAR) {
        novaStars = isNova
            ? Math.min(totalStars, draftMaster.stars[effectKeys.VIOLET_STAR])
            : 0;

        augmentedStars = isNova
            ? totalStars - novaStars
            : Math.min(totalStars, draftMaster.stars[effectKeys.VIOLET_STAR]);

        normalStars = isNova ? 0 : totalStars - augmentedStars;

        // Augment Logic
        const newViolet =
            draftMaster.stars[effectKeys.VIOLET_STAR] -
            (isNova ? novaStars : augmentedStars);

        // Convert all into White Star
        draftMaster = {
            ...draftMaster,
            stars: {
                ...draftMaster.stars,
                [starKey]: 0,
                [effectKeys.WHITE_STAR]:
                    draftMaster.stars[effectKeys.WHITE_STAR] +
                    totalStars +
                    (isNova ? novaStars : augmentedStars),
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
                novaStars,
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
                novaStars,
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
                novaStars,
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
                novaStars,
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
                novaStars,
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
                novaStars,
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
                novaStars,
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
    novaStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    if (novaStars > 0) {
        draftNonMaster = takeDamage(draftNonMaster, novaStars, dmgTypes.TRUE);

        draftMaster = takeDamage(draftMaster, novaStars, dmgTypes.TRUE);
    }

    if (augmentedStars > 0) {
        draftNonMaster = takeDamage(
            draftNonMaster,
            augmentedStars,
            dmgTypes.PIERCING,
        );

        draftMaster = takeDamage(
            draftMaster,
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

        draftMaster = takeDamage(draftMaster, normalStars, dmgTypes.PHYSICAL);
    }

    console.log(draftMaster)

    return {
        draftMaster,
        draftNonMaster,
    };
}

export function processOrangeStar(
    { master, nonMaster },
    normalStars,
    augmentedStars,
    novaStars,
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
        augmentedStars + novaStars,
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
    novaStars,
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
            [effectKeys.WHITE_STAR]:
                draftMaster.stars[effectKeys.WHITE_STAR] + novaStars,
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
    novaStars,
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
        normalStars + augmentedStars + novaStars,
    );
    draftNonMaster = restoreResources(draftNonMaster, novaStars);

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
    novaStars,
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
            [effectKeys.FIRMAMENT]:
                draftMaster.resources[effectKeys.FIRMAMENT] + normalStars,
            [effectKeys.STARLIT_HEAVENS]:
                draftMaster.resources[effectKeys.STARLIT_HEAVENS] + novaStars,
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
    novaStars,
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

    // Nova Star
    draftMaster = {
        ...draftMaster,
        [effectKeys.GRAVITATION]: Math.min(
            constants.MAX_GRAVITATION,
            draftMaster[effectKeys.GRAVITATION] +
                novaStars * constants.GRAVITATION_GAIN,
        ),
    };

    return {
        draftMaster,
        draftNonMaster,
    };
}

export function processVioletStar(
    { master, nonMaster },
    normalStars,
    augmentedStars,
    novaStars,
) {
    let draftMaster = {
        ...master,
    };

    let draftNonMaster = {
        ...nonMaster,
    };

    draftMaster = {
        ...draftMaster,
        [effectKeys.STARFLARE]: Math.min(
            constants.MAX_STARFLARE,
            draftMaster[effectKeys.STARFLARE] +
                (normalStars + augmentedStars + novaStars) *
                    constants.STARFLARE_GAIN,
        ),
    };

    console.log(draftMaster);

    return {
        draftMaster,
        draftNonMaster,
    };
}
