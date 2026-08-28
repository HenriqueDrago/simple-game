import {
    actionsClass,
    ATTRIBUTE_NAMES,
    coloredStars,
    constants,
    edictChoirMap,
    FREE_RESOURCES,
    MITIGATION_RESOURCES,
    playerMap,
    presetAi,
} from "./constants.js";
import {
    sdmKeys,
    actionKeys,
    effectKeys,
    dmgTypes,
    elementalKeys,
    moonKeys,
    entityKeys,
    turnStatus,
    progKeys,
    aiKeys,
    playerTurnPhases,
    runeKeys,
    eventKeys,
    entryTypes,
    choirKeys,
    blasphemyKeys,
    edictKeys,
    tarnishTypes,
    eyeKeys,
} from "./enums.js";
import { buildHistory } from "./turnManagement.js";

export function restoreResources(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    // Health
    if (getEntityMaxHealth(draftEntity) > 0) {
        if (isElementActive(entity, elementalKeys.OCEAN)) {
            draftEntity = gainHp(draftEntity, amount);

            return draftEntity; // Early return since on Ocean all excess Health becomes Silver Blood
        }

        const missingHp = Math.max(
            0,
            getEntityMaxHealth(draftEntity) - draftEntity[effectKeys.HEALTH],
        );
        const restoredHp = Math.min(missingHp, amount);

        amount -= restoredHp;

        draftEntity = gainHp(draftEntity, restoredHp);
    }

    // Mana
    if (entity[effectKeys.MAX_MANA] > 0) {
        draftEntity = gainMana(draftEntity, amount);
        return draftEntity; // Early return since restoring mana consumes all
    }

    // Enlightenment
    if (entity[effectKeys.MAX_ENLIGHTENMENT] > 0) {
        draftEntity = gainEnlit(draftEntity, amount);
        return draftEntity; // Early return since restoring enlit consumes all
    }

    // Safenet (unreacheable in theory): Restore Sacred Flames (first Free Resource)
    if (amount > 0) {
        draftEntity = {
            ...draftEntity,
            resources: {
                ...draftEntity.resources,
                [effectKeys.SACRED_FLAMES]:
                    draftEntity.resources[effectKeys.SACRED_FLAMES] + amount,
            },
        };
    }

    return draftEntity;
}

export function distributePoints(
    entity,
    mode,
    bestStats = null,
    randomize = false,
) {
    let newEntity = {
        ...entity,
        attributes: {},
    };

    for (let attr of ATTRIBUTE_NAMES) {
        newEntity.attributes[attr] = { ...entity.attributes[attr] };
    }

    switch (mode) {
        case sdmKeys.CUSTOM:
            if (randomize) {
                // Reset points before rolling
                newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
                for (let attr of ATTRIBUTE_NAMES) {
                    newEntity.attributes[attr].points = 0;
                }

                // Roll random stats
                for (let i = 0; i < constants.INITIAL_POINTS_AVAILABLE; i++) {
                    let random_stat =
                        ATTRIBUTE_NAMES[
                            Math.floor(Math.random() * ATTRIBUTE_NAMES.length)
                        ];
                    newEntity.attributes[random_stat].points += 1;
                    newEntity.unspentPoints -= 1;
                }
            }
            break;

        case sdmKeys.BEST:
            if (!bestStats) {
                break;
            }
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
            for (let attr of ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: bestStats[attr],
                };
                newEntity.unspentPoints -= bestStats[attr];
            }
            break;

        case sdmKeys.FULL_DEF:
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
            for (let attr of ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: 0,
                };
            }
            newEntity.attributes.def.points = newEntity.unspentPoints;
            newEntity.unspentPoints = 0;
            break;

        case sdmKeys.FULL_STR:
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
            for (let attr of ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: 0,
                };
            }
            newEntity.attributes.str.points = newEntity.unspentPoints;
            newEntity.unspentPoints = 0;
            break;

        case sdmKeys.BALANCED:
            newEntity.unspentPoints = constants.INITIAL_POINTS_AVAILABLE;
            for (let attr of ATTRIBUTE_NAMES) {
                newEntity.attributes[attr] = {
                    ...newEntity.attributes[attr],
                    points: 0,
                };
            }
            newEntity.attributes.str.points = Math.floor(
                newEntity.unspentPoints / 2,
            );
            newEntity.attributes.def.points = Math.ceil(
                newEntity.unspentPoints / 2,
            );
            newEntity.unspentPoints = 0;
            break;

        default:
            break;
    }

    // Builds values from points
    for (let attr of ATTRIBUTE_NAMES) {
        newEntity.attributes[attr].value = newEntity.attributes[attr].points;
    }

    return newEntity;
}

export function createBaseEntity() {
    let baseAttributes = {};

    for (let attr of ATTRIBUTE_NAMES) {
        baseAttributes[attr] = {
            value: 0,
            points: 0,
        };
    }

    return {
        // Limited Resources
        [effectKeys.MAX_HEALTH]: constants.BASE_HEALTH,
        [effectKeys.HEALTH]: constants.BASE_HEALTH,
        [effectKeys.MAX_MANA]: constants.BASE_MANA,
        [effectKeys.MANA]: constants.BASE_MANA,
        [effectKeys.ENLIGHTENMENT]: 0,
        [effectKeys.MAX_ENLIGHTENMENT]: 0,

        // fixed resources
        [effectKeys.DIVINE_SPARK]: 0,
        [effectKeys.DYNAMO]: 0,
        [effectKeys.OVERHEAT]: 0,
        [effectKeys.SONORITY]: constants.STARTING_SONORITY,
        [effectKeys.LUNACY]: 0,
        [effectKeys.GRAVITATION]: 0,
        [effectKeys.BAD_OMEN]: 0,
        [effectKeys.RECOLLECTION]: 0,
        [effectKeys.ACCRETION]: 0,
        [effectKeys.IRRADIATION]: 0,
        [effectKeys.HALLOWED_ECHOES]: 0,
        [effectKeys.TARNISHED_SIN]: 0,

        // ranked resources
        [effectKeys.MANA_BLEED]: 0,
        [effectKeys.MOONLIT_TEARS]: 0,
        [effectKeys.CONSTELLATION]: 0,
        [effectKeys.AZURE_CONSTELLATION]: 0,
        [effectKeys.CRIMSON_CONSTELLATION]: 0,
        [effectKeys.STARBLIGHT]: 0,
        [effectKeys.BURDEN_OF_STIGMA]: 0,

        // special attributes
        [effectKeys.REVELATION]: 0,
        [effectKeys.FORTITUDE]: 0,
        [effectKeys.ENERGY_LEVEL]: constants.STARTING_ENERGY,
        [effectKeys.MOONLIGHT]: 0,

        // other
        [effectKeys.MIRRORED_MOON]: moonKeys.HIDDEN,
        [effectKeys.ELEMENTAL_CRYSTALS]: [elementalKeys.DULLED],
        [effectKeys.RUNIC_ARRAY]: [
            runeKeys.EMPTY,
            runeKeys.EMPTY,
            runeKeys.EMPTY,
        ],
        lasersUsedThisTurn: 0,
        [entryTypes.HEAVENLY_CHOIR]: choirKeys.NONE,
        [effectKeys.CODEX_OF_BLASPHEMY]: [
            blasphemyKeys.NONE,
            blasphemyKeys.NONE,
            blasphemyKeys.NONE,
        ],
        deleted: false,
        virtuesUsedThisTurn: 0,

        // Celestial Stars
        [effectKeys.STARS_OF_GENESIS]: 0,
        [effectKeys.STARS_OF_APOCALYPSE]: 0,

        resources: {
            // Overflown
            [effectKeys.MANA_OVERFLOW]: 0,
            [effectKeys.SILVER_BLOOD]: 0,
            [effectKeys.INSIGHT]: 0,

            // Free
            [effectKeys.BLOOD_SACRIFICE]: 0,
            [effectKeys.RADIANCE]: 0,
            [effectKeys.SHADOWFLAME]: 0,
            [effectKeys.CINDERS]: 0,
            [effectKeys.UNRELENTING_SHADOWS]: 0,
            [effectKeys.STARDUST]: 0,
            [effectKeys.MOONSHINE]: 0,
            [effectKeys.DISSONANCE]: 0,
            [effectKeys.PRECOGNITION]: 0,
            [effectKeys.PROPHECY_OF_DOOM]: 0,
            [effectKeys.MARTHYR]: 0,
            [effectKeys.SACRILEGE]: 0,
            [effectKeys.COVENANT]: 0,
            [effectKeys.SACRED_FLAMES]: 0,

            // Mitigation
            [effectKeys.HALO]: 0,
            [effectKeys.LINGERING_EMBER]: 0,
            [effectKeys.FUNERARY_URN]: 0,
            [effectKeys.FRACTURED_DOME]: 0,
            [effectKeys.FAULTY_FIRMAMENT]: 0,
            [effectKeys.MYCELIUM]: 0,
            [effectKeys.REFRACTED_DIVINITY]: 0,
            [effectKeys.HARMONY]: 0,
            [effectKeys.CONJECTURE]: 0,
            [effectKeys.SANCTUARY]: 0,
        },
        states: {
            // standalones
            [effectKeys.GUARDING_STATE]: false,
            [effectKeys.SACRIFICIAL_STATE]: false,
            [effectKeys.STARGAZER]: false,
            [effectKeys.SELENIAN]: false,
            [effectKeys.RESONANT]: false,
            [effectKeys.PRISMATIC]: false,
            [effectKeys.MOON_DEW]: false,
            [effectKeys.VISIONARY]: false,
            [effectKeys.EVENT_HORIZON]: false,

            // Shadowflame
            [effectKeys.DARK_EMBRACE]: false,
            [effectKeys.DIMMING_DARKNESS]: false,
            [effectKeys.UMBRAL_CORE]: false,
            [effectKeys.BLEAK_DECEPTION]: false,

            // Deploy
            [effectKeys.DEPLOYMENT]: false,
            [effectKeys.WEAPONS_DEPLOYED]: false,
            [effectKeys.THERMAL_OVERLOAD]: false,
            [effectKeys.VENTING]: false,

            // Aegis
            [effectKeys.RADIANT]: false,

            // Seraph
            [effectKeys.ABANDONED_BY_GRACE]: false,
            [effectKeys.ANOINTED_PROXY]: false,
            [effectKeys.CUTOFF_WINGS]: false,
            [effectKeys.ZENITH_OF_MORTALITY]: false,
            [effectKeys.ASCENDENCE_OF_SPIRIT]: false,
            [effectKeys.IMMACULATE]: false,
        },
        stars: {
            [effectKeys.WHITE_STAR]: 0,
            [effectKeys.GRAY_STAR]: 0,

            [effectKeys.RED_STAR]: 0,
            [effectKeys.ORANGE_STAR]: 0,
            [effectKeys.YELLOW_STAR]: 0,
            [effectKeys.GREEN_STAR]: 0,
            [effectKeys.BLUE_STAR]: 0,
            [effectKeys.INDIGO_STAR]: 0,
            [effectKeys.VIOLET_STAR]: 0,
        },
        edicts: {
            [edictKeys.ANGELS]: false,
            [edictKeys.ARCHANGELS]: false,
            [edictKeys.PRINCIPALITIES]: false,
            [edictKeys.POWERS]: false,
            [edictKeys.VIRTUES]: false,
            [edictKeys.DOMINIONS]: false,
            [edictKeys.THRONES]: false,
            [edictKeys.CHERUBIM]: false,
            [edictKeys.SERAPHIM]: false,
        },
        unspentPoints: constants.INITIAL_POINTS_AVAILABLE,
        attributes: baseAttributes,
    };
}

export function resetPlayerEntity(prev, entityKey) {
    const currentEntity = prev.entities[entityKey];
    const baseEntity = createBaseEntity();

    baseEntity.controller = currentEntity.controller;
    baseEntity.statDistributionMode = currentEntity.statDistributionMode;
    baseEntity.unspentPoints = currentEntity.unspentPoints;

    for (let attr of ATTRIBUTE_NAMES) {
        baseEntity.attributes[attr].points =
            currentEntity.attributes[attr].points;
    }

    return distributePoints(
        baseEntity,
        currentEntity.statDistributionMode,
        presetAi[currentEntity.controller].best,
    );
}

export function gainHp(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    if (draftEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        draftEntity = gainSin(draftEntity, amount * constants.HIGH_SIN_GAIN);
        amount = 0;
    }

    const missingHp =
        getEntityMaxHealth(draftEntity) - draftEntity[effectKeys.HEALTH];

    const hpGained = Math.min(missingHp, amount);
    const newHp = draftEntity[effectKeys.HEALTH] + hpGained;

    amount -= hpGained;

    draftEntity = {
        ...draftEntity,
        [effectKeys.HEALTH]: newHp,
    };

    // If on Ocean, restore Silver Blood past the limit
    if (isElementActive(draftEntity, elementalKeys.OCEAN)) {
        const newSB = draftEntity.resources[effectKeys.SILVER_BLOOD] + amount;

        draftEntity = {
            ...draftEntity,
            resources: {
                ...draftEntity.resources,
                [effectKeys.SILVER_BLOOD]: newSB,
            },
        };
    }

    return draftEntity;
}

export function loseHp(entity, amount) {
    const initialAmount = amount;
    let draftEntity = {
        ...entity,
    };

    // Silver Blood
    const silverBloodConsumed = Math.min(
        entity.resources[effectKeys.SILVER_BLOOD],
        amount,
    );

    amount -= silverBloodConsumed;

    draftEntity = {
        ...draftEntity,
        resources: {
            ...entity.resources,
            [effectKeys.SILVER_BLOOD]:
                entity.resources[effectKeys.SILVER_BLOOD] - silverBloodConsumed,
        },
    };

    // Health
    const hpConsumed = Math.min(entity[effectKeys.HEALTH], amount);
    draftEntity = {
        ...draftEntity,
        [effectKeys.HEALTH]: Math.max(
            0,
            entity[effectKeys.HEALTH] - hpConsumed,
        ),
    };

    amount -= hpConsumed;

    // Wither
    if (isElementActive(entity, elementalKeys.WITHER)) {
        const newLunacy = Math.min(
            draftEntity[effectKeys.LUNACY] +
                (initialAmount - amount) * constants.WITHER_LUNACY_MULT,
            constants.MAX_LUNACY,
        );
        draftEntity = {
            ...draftEntity,
            [effectKeys.LUNACY]: newLunacy,
        };
    }

    return {
        ...draftEntity,
    };
}

export function gainMana(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    if (draftEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        draftEntity = gainSin(draftEntity, amount * constants.HIGH_SIN_GAIN);
        amount = 0;
    }

    const missingMana = draftEntity.maxMana - draftEntity.currMana;

    const newMana = Math.min(
        draftEntity.maxMana,
        draftEntity.currMana + amount,
    );
    const newManaOverflow =
        draftEntity.resources.manaOverflow + Math.max(0, amount - missingMana);

    return {
        ...draftEntity,
        currMana: newMana,
        resources: {
            ...draftEntity.resources,
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

export function processExitStargazer(prev, targetKey) {
    const currentEntity = prev.entities[targetKey];

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...currentEntity,
                [effectKeys.CONSTELLATION]: 0,
                [effectKeys.AZURE_CONSTELLATION]: 0,
                [effectKeys.CRIMSON_CONSTELLATION]: 0,
                [effectKeys.STARBLIGHT]: 0,
                states: {
                    ...currentEntity.states,
                    [effectKeys.STARGAZER]: false,
                },
                stars: {
                    ...createBaseEntity().stars,
                },
            },
        },
    };
}

export function processExitResonant(prev, targetKey) {
    const currentEntity = prev.entities[targetKey];

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...currentEntity,
                [effectKeys.SONORITY]: 0,
                states: {
                    ...currentEntity.states,
                    [effectKeys.RESONANT]: false,
                },
            },
        },
    };
}

export function processExitSelenian(prev, targetKey) {
    const post = newDealDmg(
        prev,
        prev.entities[targetKey][effectKeys.MOONLIGHT],
        targetKey,
        dmgTypes.TRUE,
        null,
    );

    let draftEntity = {
        ...prev.entities[targetKey],
    };

    draftEntity = {
        ...draftEntity,
        [effectKeys.MOONLIGHT]: 0,
        [effectKeys.ELEMENTAL_CRYSTALS]: [],
        [effectKeys.MIRRORED_MOON]: moonKeys.HIDDEN,
        [effectKeys.LUNACY]: 0,
        [effectKeys.MOONLIT_TEARS]: 0,
        states: {
            ...draftEntity.states,
            [effectKeys.SELENIAN]: false,
        },
    };

    return {
        ...post,
        entities: {
            ...post.entities,
            [targetKey]: draftEntity,
        },
    };
}

export function processExitVisionary(prev, targetKey, nonTargetKey) {
    let newGameState = {
        ...prev,
    };

    const arrayLength =
        prev.entities[targetKey]?.[effectKeys.RUNIC_ARRAY]?.length || 0;

    for (let i = 0; i < arrayLength; i++) {
        newGameState = addRune(
            newGameState,
            targetKey,
            nonTargetKey,
            runeKeys.EMPTY,
        );
    }

    return {
        ...newGameState,
        entities: {
            ...newGameState.entities,
            [targetKey]: {
                ...newGameState.entities[targetKey],
                states: {
                    ...newGameState.entities[targetKey].states,
                    [effectKeys.VISIONARY]: false,
                },
            },
        },
    };
}

export function exitAllStates(prev, targetKey, nonTargetKey) {
    const originalStates = {
        ...prev.entities[targetKey].states,
    };

    // Clear all states
    let newGameState = {
        ...prev,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...prev.entities[targetKey],
                states: {
                    ...createBaseEntity().states,
                },
            },
        },
    };

    // Process special removals
    if (originalStates[effectKeys.VISIONARY]) {
        newGameState = processExitVisionary(
            newGameState,
            targetKey,
            nonTargetKey,
        );
    }
    if (originalStates[effectKeys.STARGAZER]) {
        newGameState = processExitStargazer(
            newGameState,
            targetKey,
            nonTargetKey,
        );
    }
    if (originalStates[effectKeys.RESONANT]) {
        newGameState = processExitResonant(
            newGameState,
            targetKey,
            nonTargetKey,
        );
    }
    if (originalStates[effectKeys.SELENIAN]) {
        newGameState = processExitSelenian(
            newGameState,
            targetKey,
            nonTargetKey,
        );
    }
    if (originalStates[effectKeys.UMBRAL_CORE]) {
        newGameState = processExitUmbral(newGameState, targetKey, nonTargetKey);
    }
    if (originalStates[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        newGameState = processExitAscendence(
            newGameState,
            targetKey,
            nonTargetKey,
        );
    }

    return newGameState;
}

export function processActionTypeUsed(prev, agentKey, nonAgentKey, action) {
    let draftAgent = {
        ...prev.entities[agentKey],
    };
    let draftNonAgent = {
        ...prev.entities[nonAgentKey],
    };

    const isDefensive = actionsClass.defensiveActions.includes(action);
    const isOffensive = actionsClass.offensiveActions.includes(action);

    if (isDefensive) {
        // Sonority
        if (draftAgent.states[effectKeys.RESONANT]) {
            const sonority = Math.min(
                constants.SONORITY_HIGHER_LIMIT,
                draftAgent[effectKeys.SONORITY] + constants.SONORITY_ON_DEFENSE,
            );

            draftAgent = {
                ...draftAgent,
                [effectKeys.SONORITY]: sonority,
            };
        }

        // Overheat
        if (draftAgent[effectKeys.OVERHEAT] > 0) {
            const overheatLost = Math.min(
                constants.NATURAL_OVERHEAT_LOSS,
                draftAgent[effectKeys.OVERHEAT],
            );

            const newOverheat = draftAgent[effectKeys.OVERHEAT] - overheatLost;
            const newDynamo = Math.min(
                draftAgent[effectKeys.DYNAMO] + overheatLost,
                constants.MAX_DYNAMO,
            );
            draftAgent = {
                ...draftAgent,
                [effectKeys.OVERHEAT]: newOverheat,
                [effectKeys.DYNAMO]: newDynamo,
            };
        }

        // Waning Moon
        if (draftAgent[effectKeys.MIRRORED_MOON] === moonKeys.WANING) {
            draftAgent = {
                ...draftAgent,
                [effectKeys.MIRRORED_MOON]: moonKeys.CORONAL,
            };
        }
    }

    if (isOffensive) {
        // Sonority
        if (draftAgent.states[effectKeys.RESONANT]) {
            const sonority = Math.max(
                constants.SONORITY_LOWER_LIMIT,
                draftAgent[effectKeys.SONORITY] + constants.SONORITY_ON_OFFENSE,
            );

            draftAgent = {
                ...draftAgent,
                [effectKeys.SONORITY]: sonority,
            };
        }

        // Waxing Moon
        if (draftAgent[effectKeys.MIRRORED_MOON] === moonKeys.WAXING) {
            draftAgent = {
                ...draftAgent,
                [effectKeys.MIRRORED_MOON]: moonKeys.BLOODSTAINED,
            };
        }

        // Ash
        if (isElementActive(draftAgent, elementalKeys.ASH)) {
            const toBeConsumed = Math.floor(
                consumeLimitedResources(draftAgent, Infinity, elementalKeys.ASH)
                    .limitedResourcesConsumed.totalLimitedResourcesConsumption /
                    2,
            );

            const result = consumeLimitedResources(
                draftAgent,
                toBeConsumed,
                elementalKeys.ASH,
            );

            draftAgent = result.draftEntity;

            draftAgent = {
                ...draftAgent,
                resources: {
                    ...draftAgent.resources,
                    [effectKeys.FUNERARY_URN]:
                        draftAgent.resources[effectKeys.FUNERARY_URN] +
                        result.limitedResourcesConsumed
                            .totalLimitedResourcesConsumption,
                },
            };
        }

        // Recollection
        if (draftAgent[effectKeys.RECOLLECTION] > 0) {
            draftAgent = {
                ...draftAgent,
                [effectKeys.RECOLLECTION]: 0,
            };
        }
    }

    let post = {
        ...prev,
        entities: {
            ...prev.entities,
            [agentKey]: draftAgent,
            [nonAgentKey]: draftNonAgent,
        },
    };

    // Runes
    if (draftAgent.states[effectKeys.VISIONARY]) {
        switch (action) {
            case actionKeys.GUARD: {
                post = addRune(post, agentKey, nonAgentKey, runeKeys.URD);
                break;
            }
            case actionKeys.HEAL: {
                post = addRune(post, agentKey, nonAgentKey, runeKeys.VERDANDI);
                break;
            }
            case actionKeys.SPECIAL_ATTACK: {
                post = addRune(post, agentKey, nonAgentKey, runeKeys.SKULD);
                break;
            }
            default: {
                break;
            }
        }
    }

    draftAgent = extractEntity(post, agentKey);
    draftNonAgent = extractEntity(post, nonAgentKey);

    // Hallowed Echoes
    if (isEdictActive(draftAgent, edictKeys.DOMINIONS)) {
        switch (action) {
            case actionKeys.CONDEMN: {
                draftAgent = {
                    ...draftAgent,
                    [effectKeys.HALLOWED_ECHOES]: Math.max(
                        draftAgent[effectKeys.HALLOWED_ECHOES] +
                            constants.HALLOW_CONDEMN,
                        constants.MIN_HALLOW,
                    ),
                };
                break;
            }
            case actionKeys.SUPPLICATE: {
                draftAgent = {
                    ...draftAgent,
                    [effectKeys.HALLOWED_ECHOES]: Math.min(
                        draftAgent[effectKeys.HALLOWED_ECHOES] +
                            constants.HALLOW_SUPPLICATE,
                        constants.MAX_HALLOW,
                    ),
                };
                break;
            }
            case actionKeys.DISCERN: {
                draftAgent = {
                    ...draftAgent,
                    [effectKeys.HALLOWED_ECHOES]:
                        -draftAgent[effectKeys.HALLOWED_ECHOES],
                };
                break;
            }
            default: {
                break;
            }
        }
    }

    post = replaceEntity(post, draftAgent, agentKey);
    post = replaceEntity(post, draftNonAgent, nonAgentKey);

    return post;
}

export function processDeathCheck(prev) {
    let post = {
        ...prev,
    };

    post = processEntityDeathStates(post, entityKeys.PLAYER_ONE);
    post = processEntityDeathStates(post, entityKeys.PLAYER_TWO);

    const p1Dead = isEntityDead(extractEntity(post, entityKeys.PLAYER_ONE));
    const p2Dead = isEntityDead(extractEntity(post, entityKeys.PLAYER_TWO));

    let status = prev.status;

    if (p1Dead) {
        status = p2Dead ? turnStatus.DRAW : turnStatus.DEFEAT;
    } else if (p2Dead) {
        status = turnStatus.VICTORY;
    }

    return processProgUnlock({
        ...post,
        status: status,
    });
}

// Realize "constant" checks
export function processEntityDeathStates(prev, entityKey) {
    let post = {
        ...prev,
    };

    let draftEntity = extractEntity(post, entityKey);

    // Process Max Health Alterations
    draftEntity = processHealth(draftEntity);

    // Profecy of Doom
    if (draftEntity.resources[effectKeys.PROPHECY_OF_DOOM] > 0) {
        // Consume Precognition
        const consumedPrecog = Math.min(
            draftEntity.resources[effectKeys.PRECOGNITION],
            draftEntity.resources[effectKeys.PROPHECY_OF_DOOM],
        );
        draftEntity = {
            ...draftEntity,
            resources: {
                ...draftEntity.resources,
                [effectKeys.PROPHECY_OF_DOOM]:
                    draftEntity.resources[effectKeys.PROPHECY_OF_DOOM] -
                    consumedPrecog,
                [effectKeys.PRECOGNITION]:
                    draftEntity.resources[effectKeys.PRECOGNITION] -
                    consumedPrecog,
            },
        };

        // Consume Mana
        const consumedMana = Math.min(
            getEntityTotalMana(draftEntity),
            draftEntity.resources[effectKeys.PROPHECY_OF_DOOM],
        );
        draftEntity = {
            ...draftEntity,
            resources: {
                ...draftEntity.resources,
                [effectKeys.PROPHECY_OF_DOOM]:
                    draftEntity.resources[effectKeys.PROPHECY_OF_DOOM] -
                    consumedMana,
            },
        };

        draftEntity = loseMana(draftEntity, consumedMana);
    }

    // Precognition
    if (draftEntity.resources[effectKeys.PRECOGNITION] > 0) {
        const missingMana =
            draftEntity[effectKeys.MAX_MANA] - draftEntity[effectKeys.MANA];

        if (missingMana > 0) {
            const precogConsumed = Math.min(
                missingMana,
                draftEntity.resources[effectKeys.PRECOGNITION],
            );

            draftEntity = {
                ...draftEntity,
                [effectKeys.MANA]:
                    draftEntity[effectKeys.MANA] + precogConsumed,
                resources: {
                    ...draftEntity.resources,
                    [effectKeys.PRECOGNITION]:
                        draftEntity.resources[effectKeys.PRECOGNITION] -
                        precogConsumed,
                },
            };
        }
    }

    // Gravitation
    if (draftEntity[effectKeys.GRAVITATION] >= constants.MAX_GRAVITATION) {
        draftEntity = {
            ...draftEntity,
            [effectKeys.GRAVITATION]: 0,
            states: {
                ...draftEntity.states,
                [effectKeys.EVENT_HORIZON]: true,
            },
        };
    }

    // Lunacy
    if (draftEntity[effectKeys.LUNACY] >= constants.MAX_LUNACY) {
        draftEntity = {
            ...draftEntity,
            [effectKeys.ELEMENTAL_CRYSTALS]: translateElementIntoCrystals(
                elementalKeys.SHATTERED,
            ),
        };
    }

    // Ascendence
    if (draftEntity.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        if (getTotalEnlit(draftEntity) <= 0 || getMaxEnlit(draftEntity) <= 0) {
            post = replaceEntity(post, draftEntity, entityKey);
            post = processExitAscendence(post, entityKey);
            draftEntity = extractEntity(post, entityKey);
        }
    }

    // Tarnish
    if (draftEntity[effectKeys.TARNISHED_SIN] >= constants.MAX_SIN) {
        draftEntity = {
            ...draftEntity,
            states: {
                ...draftEntity.states,
                [effectKeys.ABANDONED_BY_GRACE]: true,
            },
        };
    }

    post = replaceEntity(post, draftEntity, entityKey);

    return post;
}

export function isEntityDead(entity) {
    if (
        entity.states[effectKeys.ASCENDENCE_OF_SPIRIT] ||
        entity[effectKeys.BURDEN_OF_STIGMA] > 0
    ) {
        return false;
    }

    return getEntityTotalHealth(entity) <= 0 || getEntityMaxHealth(entity) <= 0;
}

export function getEntityElement(entity) {
    // Shattered override
    if (
        entity[effectKeys.ELEMENTAL_CRYSTALS].includes(elementalKeys.SHATTERED)
    ) {
        return elementalKeys.SHATTERED;
    }

    const hasScorch = entity[effectKeys.ELEMENTAL_CRYSTALS].includes(
        elementalKeys.SCORCH,
    );
    const hasFrost = entity[effectKeys.ELEMENTAL_CRYSTALS].includes(
        elementalKeys.FROST,
    );
    const hasNature = entity[effectKeys.ELEMENTAL_CRYSTALS].includes(
        elementalKeys.NATURE,
    );

    // triple elements
    if (hasFrost && hasNature && hasScorch) {
        return elementalKeys.ALBEDO;
    }

    // dual elements
    if (hasFrost && hasNature) {
        return elementalKeys.WITHER;
    }
    if (hasFrost && hasScorch) {
        return elementalKeys.OCEAN;
    }
    if (hasNature && hasScorch) {
        return elementalKeys.ASH;
    }

    // solo elements
    if (hasFrost) {
        return elementalKeys.FROST;
    }

    if (hasNature) {
        return elementalKeys.NATURE;
    }

    if (hasScorch) {
        return elementalKeys.SCORCH;
    }

    // no elements
    return elementalKeys.DULLED;
}

export function isElementActive(entity, element) {
    const activeElement = getEntityElement(entity);
    return (
        activeElement === element || activeElement === elementalKeys.SHATTERED
    );
}

export function getEntityDef(entity) {
    let draftEntity = {
        ...entity,
    };

    let bonusDEF = 0;

    if (entity[effectKeys.CONSTELLATION] > 0) {
        draftEntity = raiseStats(entity, entity[effectKeys.CONSTELLATION]);
    }

    if (draftEntity[effectKeys.AZURE_CONSTELLATION] > 0) {
        bonusDEF += draftEntity[effectKeys.AZURE_CONSTELLATION];
    }

    if (isElementActive(draftEntity, elementalKeys.FROST)) {
        bonusDEF += draftEntity[effectKeys.MOONLIGHT];
    }

    if (draftEntity.states[effectKeys.VISIONARY]) {
        bonusDEF -=
            countRunes(draftEntity[effectKeys.RUNIC_ARRAY], runeKeys.VERDANDI) *
            3;
    }

    return Math.max(0, draftEntity.attributes.def.value + bonusDEF);
}

export function getEntityStr(entity) {
    let draftEntity = {
        ...entity,
    };

    let bonusSTR = 0;

    if (entity[effectKeys.CONSTELLATION] > 0) {
        draftEntity = raiseStats(entity, entity[effectKeys.CONSTELLATION]);
    }

    if (entity[effectKeys.DIVINE_SPARK] > 0) {
        bonusSTR += Math.floor(
            entity[effectKeys.DIVINE_SPARK] /
                constants.DIVINE_SPARK_STR_CONVERSION,
        );
    }

    if (entity[effectKeys.RECOLLECTION] > 0) {
        bonusSTR += Math.floor(
            (getEntityDef(entity) * entity[effectKeys.RECOLLECTION]) / 100,
        );
    }

    if (draftEntity[effectKeys.CRIMSON_CONSTELLATION] > 0) {
        bonusSTR += draftEntity[effectKeys.CRIMSON_CONSTELLATION];
    }

    if (isElementActive(draftEntity, elementalKeys.SCORCH)) {
        bonusSTR += draftEntity[effectKeys.MOONLIGHT];
    }

    if (draftEntity.states[effectKeys.VISIONARY]) {
        bonusSTR -=
            countRunes(draftEntity[effectKeys.RUNIC_ARRAY], runeKeys.URD) * 3;
    }

    return Math.max(0, draftEntity.attributes.str.value + bonusSTR);
}

export function getEntityMaxHealth(entity) {
    return Math.ceil(
        entity[effectKeys.MAX_HEALTH] +
            (isElementActive(entity, elementalKeys.NATURE)
                ? entity[effectKeys.MOONLIGHT]
                : 0),
    );
}

export function getEntityTotalMana(entity) {
    return entity[effectKeys.MANA] + entity.resources[effectKeys.MANA_OVERFLOW];
}

export function getEntityTotalHealth(entity) {
    return (
        entity[effectKeys.HEALTH] + entity.resources[effectKeys.SILVER_BLOOD]
    );
}

export function consumeMitigationResources(entity, amount, cause = null) {
    let draftEntity = {
        ...entity,
    };

    let mitigationResourcesConsumed = {};
    let i = 0;
    let totalMitigationResourcesConsumption = 0;

    const isCauseDamage =
        cause === dmgTypes.PHYSICAL || cause === dmgTypes.PIERCING;
    const isCauseTarnish =
        cause === tarnishTypes.PHYSICAL || cause === tarnishTypes.PIERCING;

    while (amount > 0 && i < MITIGATION_RESOURCES.length) {
        const currResourceKey = MITIGATION_RESOURCES[i];

        // Avoid shadowflames and related actions from consuming LE
        // Avoid normal damage from consuming Sanctuary
        // Avoid Tarnish to consume other resources
        if (
            !(
                (cause === effectKeys.SHADOWFLAME ||
                    cause === actionKeys.SHADOW_PACT ||
                    cause === actionKeys.BLACK_MAYHEM) &&
                currResourceKey === effectKeys.LINGERING_EMBER
            ) ||
            !(isCauseDamage && currResourceKey === effectKeys.SANCTUARY) ||
            !(isCauseTarnish && currResourceKey !== effectKeys.SANCTUARY)
        ) {
            const currAmount = draftEntity.resources[currResourceKey];
            const consumption = Math.min(currAmount, amount);

            amount -= consumption;
            totalMitigationResourcesConsumption += consumption;

            mitigationResourcesConsumed = {
                ...mitigationResourcesConsumed,
                [currResourceKey]: consumption,
            };

            draftEntity = {
                ...draftEntity,
                resources: {
                    ...draftEntity.resources,
                    [currResourceKey]: currAmount - consumption,
                },
            };

            // Lingering Ember
            if (
                isCauseDamage &&
                currResourceKey === effectKeys.LINGERING_EMBER
            ) {
                const currentCinders =
                    draftEntity.resources[effectKeys.CINDERS];
                draftEntity = {
                    ...draftEntity,
                    resources: {
                        ...draftEntity.resources,
                        [effectKeys.CINDERS]: currentCinders + consumption,
                    },
                };
            }

            // Halo
            if (isCauseDamage && currResourceKey === effectKeys.HALO) {
                const currentRadiance =
                    draftEntity.resources[effectKeys.RADIANCE];
                draftEntity = {
                    ...draftEntity,
                    resources: {
                        ...draftEntity.resources,
                        [effectKeys.RADIANCE]: currentRadiance + consumption,
                    },
                };
            }

            // Sanctuary
            if (isCauseTarnish && currResourceKey === effectKeys.SANCTUARY) {
                const currentSacrilege =
                    draftEntity.resources[effectKeys.SACRILEGE];
                draftEntity = {
                    ...draftEntity,
                    resources: {
                        ...draftEntity.resources,
                        [effectKeys.SACRILEGE]: currentSacrilege + consumption,
                    },
                };
            }

            // Refracted Divinity
            if (
                isCauseDamage &&
                currResourceKey === effectKeys.REFRACTED_DIVINITY
            ) {
                const currentMoondust =
                    draftEntity.resources[effectKeys.MOONSHINE];
                draftEntity = {
                    ...draftEntity,
                    resources: {
                        ...draftEntity.resources,
                        [effectKeys.MOONSHINE]: currentMoondust + consumption,
                    },
                };
            }
        }

        i++;
    }

    mitigationResourcesConsumed = {
        ...mitigationResourcesConsumed,
        totalMitigationResourcesConsumption:
            totalMitigationResourcesConsumption,
        mitigationNotConsumed: amount,
    };

    return {
        draftEntity,
        mitigationResourcesConsumed,
    };
}

export function consumeFreeResources(entity, amount, cause = null) {
    let draftEntity = {
        ...entity,
    };

    let freeResourcesConsumed = {};
    let i = 0;
    let totalFreeResourcesConsumption = 0;

    while (amount > 0 && i < FREE_RESOURCES.length) {
        const currResourceKey = FREE_RESOURCES[i];

        // Avoid shadowflame and related actions from consuming Shadowflame and unrelenting shadows
        // Avoid glimpse consumingthe flames itself
        if (
            !(
                (cause === effectKeys.SHADOWFLAME ||
                    cause === actionKeys.SHADOW_PACT ||
                    cause === actionKeys.BLACK_MAYHEM) &&
                (currResourceKey === effectKeys.SHADOWFLAME ||
                    currResourceKey === effectKeys.UNRELENTING_SHADOWS)
            )
        ) {
            const currAmount = draftEntity.resources[currResourceKey];
            const consumption = Math.min(currAmount, amount);

            amount -= consumption;
            totalFreeResourcesConsumption += consumption;

            freeResourcesConsumed = {
                ...freeResourcesConsumed,
                [currResourceKey]: consumption,
            };

            draftEntity = {
                ...draftEntity,
                resources: {
                    ...draftEntity.resources,
                    [currResourceKey]: currAmount - consumption,
                },
            };
        }

        i++;
    }

    freeResourcesConsumed = {
        ...freeResourcesConsumed,
        totalFreeResourcesConsumption: totalFreeResourcesConsumption,
        freeNotConsumed: amount,
    };

    return {
        draftEntity,
        freeResourcesConsumed,
    };
}

export function consumeLimitedResources(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    let limitedResourcesConsumed = {};
    let totalLimitedResourcesConsumption = 0;

    // Enlightenment
    const enlitConsumed = Math.min(getTotalEnlit(draftEntity), amount);
    draftEntity = loseEnlit(draftEntity, enlitConsumed);
    amount -= enlitConsumed;

    totalLimitedResourcesConsumption += enlitConsumed;
    limitedResourcesConsumed = {
        ...limitedResourcesConsumed,
        [effectKeys.ENLIGHTENMENT]: enlitConsumed,
    };

    // Mana
    const manaConsumed = Math.min(getEntityTotalMana(draftEntity), amount);
    draftEntity = loseMana(draftEntity, manaConsumed);
    amount -= manaConsumed;

    totalLimitedResourcesConsumption += manaConsumed;
    limitedResourcesConsumed = {
        ...limitedResourcesConsumed,
        [effectKeys.MANA]: manaConsumed,
    };

    // Health
    const healthConsumed = Math.min(getEntityTotalHealth(draftEntity), amount);
    draftEntity = loseHp(draftEntity, healthConsumed);
    amount -= healthConsumed;

    totalLimitedResourcesConsumption += healthConsumed;
    limitedResourcesConsumed = {
        ...limitedResourcesConsumed,
        [effectKeys.HEALTH]: healthConsumed,
    };

    // total
    limitedResourcesConsumed = {
        ...limitedResourcesConsumed,
        totalLimitedResourcesConsumption: totalLimitedResourcesConsumption,
        limitedNotConsumed: amount,
    };

    return {
        draftEntity,
        limitedResourcesConsumed,
    };
}

export function consumeResources(entity, amount, cause = null) {
    let draftEntity = {
        ...entity,
    };

    let totalConsumption = 0;
    let resourcesConsumed = {};

    // Mitigation
    const mitResult = consumeMitigationResources(draftEntity, amount, cause);

    draftEntity = mitResult.draftEntity;
    resourcesConsumed = {
        ...resourcesConsumed,
        ...mitResult.mitigationResourcesConsumed,
    };

    totalConsumption +=
        mitResult.mitigationResourcesConsumed
            .totalMitigationResourcesConsumption;
    amount -=
        mitResult.mitigationResourcesConsumed
            .totalMitigationResourcesConsumption;

    // Free
    const freeResult = consumeFreeResources(draftEntity, amount, cause);

    draftEntity = freeResult.draftEntity;
    resourcesConsumed = {
        ...resourcesConsumed,
        ...freeResult.freeResourcesConsumed,
    };

    totalConsumption +=
        freeResult.freeResourcesConsumed.totalFreeResourcesConsumption;
    amount -= freeResult.freeResourcesConsumed.totalFreeResourcesConsumption;

    // Limited
    const limResult = consumeLimitedResources(draftEntity, amount, cause);

    draftEntity = limResult.draftEntity;
    resourcesConsumed = {
        ...resourcesConsumed,
        ...limResult.limitedResourcesConsumed,
    };

    totalConsumption +=
        limResult.limitedResourcesConsumed.totalLimitedResourcesConsumption;
    amount -=
        limResult.limitedResourcesConsumed.totalLimitedResourcesConsumption;

    // total
    resourcesConsumed = {
        ...resourcesConsumed,
        totalConsumption: totalConsumption,
        notConsumed: amount,
    };

    return {
        draftEntity,
        resourcesConsumed,
    };
}

export function translateElementIntoCrystals(element) {
    let crystals;
    switch (element) {
        case elementalKeys.SHATTERED:
            crystals = [elementalKeys.SHATTERED];
            break;
        case elementalKeys.ALBEDO:
            crystals = [
                elementalKeys.FROST,
                elementalKeys.NATURE,
                elementalKeys.SCORCH,
            ];
            break;
        case elementalKeys.WITHER:
            crystals = [elementalKeys.FROST, elementalKeys.NATURE];
            break;
        case elementalKeys.OCEAN:
            crystals = [elementalKeys.FROST, elementalKeys.SCORCH];
            break;
        case elementalKeys.ASH:
            crystals = [elementalKeys.NATURE, elementalKeys.SCORCH];
            break;
        case elementalKeys.FROST:
            crystals = [elementalKeys.FROST];
            break;
        case elementalKeys.NATURE:
            crystals = [elementalKeys.NATURE];
            break;
        case elementalKeys.SCORCH:
            crystals = [elementalKeys.SCORCH];
            break;
        case elementalKeys.DULLED:
        default:
            crystals = [];
            break;
    }

    return crystals;
}

export function processHealth(entity) {
    let draftEntity = {
        ...entity,
    };

    if (draftEntity[effectKeys.HEALTH] > getEntityMaxHealth(draftEntity)) {
        // Converts excess Health into Silver Blood
        if (draftEntity.states[effectKeys.SELENIAN]) {
            const excessHealth = Math.max(
                0,
                draftEntity[effectKeys.HEALTH] -
                    getEntityMaxHealth(draftEntity),
            );
            const newHp = Math.min(
                draftEntity[effectKeys.HEALTH],
                getEntityMaxHealth(draftEntity),
            );
            const silverBlood =
                draftEntity.resources[effectKeys.SILVER_BLOOD] + excessHealth;

            draftEntity = {
                ...draftEntity,
                [effectKeys.HEALTH]: newHp,
                resources: {
                    ...draftEntity.resources,
                    [effectKeys.SILVER_BLOOD]: silverBlood,
                },
            };
        }
        // Removes excess Health
        else {
            draftEntity = {
                ...draftEntity,
                [effectKeys.HEALTH]: getEntityMaxHealth(entity),
            };
        }
    }

    // Convert Silver Blood into Health
    if (draftEntity.resources[effectKeys.SILVER_BLOOD] > 0) {
        const missingHp = Math.max(
            0,
            getEntityMaxHealth(draftEntity) - draftEntity[effectKeys.HEALTH],
        );

        const silverConsumed = Math.min(
            missingHp,
            draftEntity.resources[effectKeys.SILVER_BLOOD],
        );

        const newHp = draftEntity[effectKeys.HEALTH] + silverConsumed;
        const silverBlood =
            draftEntity.resources[effectKeys.SILVER_BLOOD] - silverConsumed;

        draftEntity = {
            ...draftEntity,
            [effectKeys.HEALTH]: newHp,
            resources: {
                ...draftEntity.resources,
                [effectKeys.SILVER_BLOOD]: silverBlood,
            },
        };
    }

    return draftEntity;
}

export function takeLunicDamage(entity, amount) {
    const maxHpConsumed = Math.min(amount, entity[effectKeys.MAX_HEALTH]);
    const moonlightConsumed = Math.min(
        amount - maxHpConsumed,
        entity[effectKeys.MOONLIGHT],
    );

    return {
        ...entity,
        [effectKeys.MAX_HEALTH]: entity[effectKeys.MAX_HEALTH] - maxHpConsumed,
        [effectKeys.MOONLIGHT]:
            entity[effectKeys.MOONLIGHT] - moonlightConsumed,
    };
}

export function raiseStats(entity, amount) {
    let attributes = {};

    // Initialization
    for (let attr of ATTRIBUTE_NAMES) {
        attributes = {
            ...attributes,
            [attr]: {
                value: entity.attributes[attr].value,
                points: entity.attributes[attr].points,
            },
        };
    }

    // Distribution
    while (amount > 0) {
        for (let attr of ATTRIBUTE_NAMES) {
            attributes = {
                ...attributes,
                [attr]: {
                    value: attributes[attr].value + 1,
                    points: attributes[attr].points,
                },
            };
            amount -= 1;

            if (amount <= 0) {
                break;
            }
        }
    }

    return {
        ...entity,
        attributes: attributes,
    };
}

export function lowerStats(entity, amount) {
    let attributes = {};
    let attrConsumed = {};

    // Initialization
    for (let attr of ATTRIBUTE_NAMES) {
        attributes = {
            ...attributes,
            [attr]: {
                value: entity.attributes[attr].value,
                points: entity.attributes[attr].points,
            },
        };
    }

    // Distribution
    while (amount > 0) {
        for (let attr of ATTRIBUTE_NAMES) {
            attributes = {
                ...attributes,
                [attr]: {
                    value: attributes[attr].value - 1,
                    points: attributes[attr].points,
                },
            };
            attrConsumed = {
                ...attrConsumed,
                [attr]: attrConsumed[attr] + 1,
            };
            amount -= 1;
            if (amount <= 0) {
                break;
            }
        }
    }

    return {
        ...entity,
        attributes: attributes,
    };
}

export function getEntityColoredStars(entity) {
    const coloredStarsCount = Object.values(coloredStars).reduce(
        (acc, starType) => {
            return acc + entity.stars[starType.star];
        },
        0,
    );

    return coloredStarsCount;
}

export function getEntityUsableStars(entity) {
    return getEntityColoredStars(entity) + entity.stars[effectKeys.WHITE_STAR];
}

export function getEntityTotalStars(entity) {
    return getEntityUsableStars(entity) + entity.stars[effectKeys.GRAY_STAR];
}

export function canUseAction(prev, entityKey, action) {
    const entity = prev.entities[entityKey];
    const states = entity.states;

    // Exclusive Overriding Ultimate States
    if (states[effectKeys.THERMAL_OVERLOAD]) {
        return action === actionKeys.MELTDOWN;
    }

    if (states[effectKeys.ANOINTED_PROXY]) {
        return action === actionKeys.JUDGEMENT;
    }

    if (states[effectKeys.ZENITH_OF_MORTALITY]) {
        return (
            action === actionKeys.ASCEND &&
            !entity.states[effectKeys.CUTOFF_WINGS]
        );
    }

    // Reject ultimate actions if their corresponding state overrides are not active
    if ([actionKeys.MELTDOWN, actionKeys.JUDGEMENT].includes(action)) {
        return false;
    }

    // Umbral Core Actions
    const umbralActions = [
        actionKeys.BLACK_MAYHEM,
        actionKeys.SHADOW_MANTLE,
        actionKeys.RITUAL_OF_ASH,
        actionKeys.DARK_PROMISE,
    ];
    if (states[effectKeys.UMBRAL_CORE]) {
        return umbralActions.includes(action);
    }
    if (umbralActions.includes(action)) {
        return false;
    }

    // Ascendence Actions
    const ascendedActions = [
        actionKeys.CONDEMN,
        actionKeys.SUPPLICATE,
        actionKeys.DISCERN,
        actionKeys.ATONE,
    ];
    if (states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        return ascendedActions.includes(action);
    }
    if (ascendedActions.includes(action)) {
        return false;
    }

    // Helper to evaluate progression lock status for base actions only
    const isProgLocked = (bossKey) => {
        if (!prev.progressMode || entity.controller !== aiKeys.HUMAN) {
            return false;
        }
        const status = prev.progressStatus[bossKey];
        return !(
            status === progKeys.DEFEATED || status === progKeys.ALWAYS_OPEN
        );
    };

    // Ascend
    if (action === actionKeys.ASCEND) {
        if (entity.states[effectKeys.CUTOFF_WINGS]) {
            return false;
        }
        if (
            entity[effectKeys.DIVINE_SPARK] > 0 ||
            entity.states[effectKeys.ZENITH_OF_MORTALITY]
        ) {
            return !isProgLocked(aiKeys.SERAPH);
        }

        return false;
    }

    // Rise
    if (action === actionKeys.RISE) {
        if (entity.states[effectKeys.CUTOFF_WINGS]) {
            return false;
        }
        if (getEntityDef(entity) <= 0) {
            return !isProgLocked(aiKeys.SERAPH);
        }

        return false;
    }

    // Sonority Transformations (Resonant State)
    if (action === actionKeys.BABEL) {
        return states[effectKeys.RESONANT] && entity[effectKeys.SONORITY] > 0;
    }
    if (action === actionKeys.SOUND_OF_SILENCE) {
        return states[effectKeys.RESONANT] && entity[effectKeys.SONORITY] < 0;
    }
    if (action === actionKeys.DA_CAPO) {
        return states[effectKeys.RESONANT] && entity[effectKeys.SONORITY] === 0;
    }
    if (action === actionKeys.ATTUNE) {
        if (states[effectKeys.RESONANT]) {
            return false;
        }
        return !isProgLocked(aiKeys.MAESTRO);
    }

    // Cyborg Mechanics & Venting Lockouts
    if (
        states[effectKeys.VENTING] &&
        [actionKeys.DEPLOY, actionKeys.LASER].includes(action)
    ) {
        return false;
    }
    if (action === actionKeys.LASER) {
        return states[effectKeys.WEAPONS_DEPLOYED];
    }
    if (action === actionKeys.DEPLOY) {
        if (states[effectKeys.WEAPONS_DEPLOYED]) {
            return false;
        }
        return !isProgLocked(aiKeys.CYBORG);
    }

    // Selenian Actions & Active Element Conditions
    if (!states[effectKeys.SELENIAN]) {
        const lunarActions = [
            actionKeys.LUNAR_SMITE,
            actionKeys.LUNAR_GROWTH,
            actionKeys.LUNAR_TIDE,
            actionKeys.LUNAR_STRIKE,
            actionKeys.LUNAR_SHED,
            actionKeys.LUNAR_SHROUD,
            actionKeys.CHALK,
            actionKeys.SHATTER,
            actionKeys.MIRROR,
        ];
        if (lunarActions.includes(action)) {
            return false;
        }
    } else {
        if (action === actionKeys.REFRACT) {
            return false;
        }
        if (action === actionKeys.LUNAR_SMITE) {
            return isElementActive(entity, elementalKeys.ASH);
        }
        if (action === actionKeys.LUNAR_GROWTH) {
            return isElementActive(entity, elementalKeys.NATURE);
        }
        if (action === actionKeys.LUNAR_TIDE) {
            return isElementActive(entity, elementalKeys.OCEAN);
        }
        if (action === actionKeys.LUNAR_STRIKE) {
            return isElementActive(entity, elementalKeys.SCORCH);
        }
        if (action === actionKeys.LUNAR_SHED) {
            return isElementActive(entity, elementalKeys.WITHER);
        }
        if (action === actionKeys.LUNAR_SHROUD) {
            return (
                isElementActive(entity, elementalKeys.FROST) &&
                getEntityDef(entity) > 0
            );
        }
        if (action === actionKeys.CHALK) {
            return isElementActive(entity, elementalKeys.SHATTERED);
        }
        if (action === actionKeys.SHATTER) {
            return (
                isElementActive(entity, elementalKeys.ALBEDO) &&
                !isElementActive(entity, elementalKeys.SHATTERED)
            );
        }
        if (action === actionKeys.MIRROR) {
            return (
                !isElementActive(entity, elementalKeys.SHATTERED) &&
                !isElementActive(entity, elementalKeys.ALBEDO)
            );
        }
    }

    // Base Core Actions (Blocked if element equivalents override them)
    if (action === actionKeys.ATTACK) {
        return !isElementActive(entity, elementalKeys.ASH);
    }
    if (action === actionKeys.GUARD) {
        return !isElementActive(entity, elementalKeys.NATURE);
    }
    if (action === actionKeys.HEAL) {
        return !isElementActive(entity, elementalKeys.OCEAN);
    }
    if (action === actionKeys.SPECIAL_ATTACK) {
        if (isElementActive(entity, elementalKeys.SCORCH)) {
            return false;
        }
        return (
            getEntityTotalMana(entity) >=
            constants.SP_ATTACK_COST * entity[effectKeys.MAX_MANA]
        );
    }
    if (action === actionKeys.SACRIFICE) {
        if (isElementActive(entity, elementalKeys.WITHER)) {
            return false;
        }
        return !isProgLocked(aiKeys.BLOODKNIGHT);
    }
    if (action === actionKeys.AEGIS) {
        if (isElementActive(entity, elementalKeys.FROST)) {
            return false;
        }
        if (getEntityDef(entity) <= 0) {
            return false;
        }
        if (entity.states[effectKeys.CUTOFF_WINGS]) {
            return false;
        }

        return !isProgLocked(aiKeys.PALADIN);
    }

    // Curse
    if (action === actionKeys.CURSE) {
        if (states[effectKeys.VISIONARY]) {
            if (
                countRunes(entity[effectKeys.RUNIC_ARRAY], runeKeys.EMPTY) ===
                entity[effectKeys.RUNIC_ARRAY].length
            ) {
                return false;
            }
            return true;
        }
        return false;
    }

    // Untransformed Base Stances
    if (action === actionKeys.REFRACT) {
        return !isProgLocked(aiKeys.LUNATIC);
    }
    if (action === actionKeys.CHART) {
        return !isProgLocked(aiKeys.VOYAGER);
    }
    if (action === actionKeys.SHADOW_PACT) {
        if (states[effectKeys.BLEAK_DECEPTION]) {
            return false;
        }
        return !isProgLocked(aiKeys.SHADOW_SORCERER);
    }
    if (action === actionKeys.CARVE) {
        if (states[effectKeys.VISIONARY]) {
            return false;
        }
        return !isProgLocked(aiKeys.AUGUR);
    }

    return false;
}

export function getActions(prev, entityKey) {
    const entity = prev.entities[entityKey];
    const states = entity.states;

    // Ultimate Action Overrides
    if (states[effectKeys.THERMAL_OVERLOAD]) {
        return [actionKeys.MELTDOWN];
    }

    if (states[effectKeys.ANOINTED_PROXY]) {
        return [actionKeys.JUDGEMENT];
    }

    if (states[effectKeys.ZENITH_OF_MORTALITY]) {
        return [actionKeys.ASCEND];
    }

    // Umbral Core Actions
    if (states[effectKeys.UMBRAL_CORE]) {
        return [
            actionKeys.BLACK_MAYHEM,
            actionKeys.SHADOW_MANTLE,
            actionKeys.RITUAL_OF_ASH,
            actionKeys.DARK_PROMISE,
        ];
    }

    // Ascended Actions
    if (states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        return [
            actionKeys.CONDEMN,
            actionKeys.SUPPLICATE,
            actionKeys.DISCERN,
            actionKeys.ATONE,
        ];
    }

    // Base Actions + Replacements
    const actions = [];

    // Attack / Lunar Smite
    if (isElementActive(entity, elementalKeys.ASH)) {
        actions.push(actionKeys.LUNAR_SMITE);
    } else {
        actions.push(actionKeys.ATTACK);
    }

    // Guard / Lunar Growth
    if (isElementActive(entity, elementalKeys.NATURE)) {
        actions.push(actionKeys.LUNAR_GROWTH);
    } else {
        actions.push(actionKeys.GUARD);
    }

    // Heal / Lunar Tide
    if (isElementActive(entity, elementalKeys.OCEAN)) {
        actions.push(actionKeys.LUNAR_TIDE);
    } else {
        actions.push(actionKeys.HEAL);
    }

    // Special Attack / Lunar Strike
    if (isElementActive(entity, elementalKeys.SCORCH)) {
        actions.push(actionKeys.LUNAR_STRIKE);
    } else {
        actions.push(actionKeys.SPECIAL_ATTACK);
    }

    // Sacrifice / Lunar Shed
    if (isElementActive(entity, elementalKeys.WITHER)) {
        actions.push(actionKeys.LUNAR_SHED);
    } else {
        actions.push(actionKeys.SACRIFICE);
    }

    // Aegis / Lunar Shroud
    if (getEntityDef(entity) <= 0) {
        actions.push(actionKeys.RISE);
    } else if (isElementActive(entity, elementalKeys.FROST)) {
        actions.push(actionKeys.LUNAR_SHROUD);
    } else {
        actions.push(actionKeys.AEGIS);
    }

    // Shadow Pact
    actions.push(actionKeys.SHADOW_PACT);

    // Deploy / Laser
    if (states[effectKeys.WEAPONS_DEPLOYED]) {
        actions.push(actionKeys.LASER);
    } else {
        actions.push(actionKeys.DEPLOY);
    }

    // Attune Transformations
    if (!states[effectKeys.RESONANT]) {
        actions.push(actionKeys.ATTUNE);
    } else {
        if (entity[effectKeys.SONORITY] > 0) {
            actions.push(actionKeys.BABEL);
        }
        if (entity[effectKeys.SONORITY] < 0) {
            actions.push(actionKeys.SOUND_OF_SILENCE);
        }
        if (entity[effectKeys.SONORITY] === 0) {
            actions.push(actionKeys.DA_CAPO);
        }
    }

    // Carve / Curse
    if (states[effectKeys.VISIONARY]) {
        actions.push(actionKeys.CURSE);
    } else {
        actions.push(actionKeys.CARVE);
    }

    // Chart
    actions.push(actionKeys.CHART);

    // Refract Transformations
    if (!states[effectKeys.SELENIAN]) {
        actions.push(actionKeys.REFRACT);
    } else {
        if (isElementActive(entity, elementalKeys.SHATTERED)) {
            actions.push(actionKeys.CHALK);
        } else {
            if (isElementActive(entity, elementalKeys.ALBEDO)) {
                actions.push(actionKeys.SHATTER);
            } else {
                actions.push(actionKeys.MIRROR);
            }
        }
    }

    return actions;
}

export function canUseCombatInteractions(
    prev,
    entityKey,
    allowExtraTurn = true,
    onlyHuman = true,
) {
    const currRoundPhase =
        prev.roundQueue && prev.roundQueue.length > 0
            ? prev.roundQueue[prev.roundIndex]
            : null;

    const currPlayerPhase =
        prev.playerQueue && prev.playerQueue.length > 0
            ? prev.playerQueue[0]
            : null;

    const currPlayer = getCurrActivePlayer(prev);

    // Incorrect Player
    if (currPlayer !== entityKey) {
        return false;
    }

    // Battle not ongoing
    if (prev.status !== turnStatus.ONGOING) {
        return false;
    }

    // Player not human
    if (onlyHuman && prev.entities[entityKey].controller !== aiKeys.HUMAN) {
        return false;
    }

    // Incorrect Round Phase
    if (!playerMap[entityKey].turn.includes(currRoundPhase)) {
        return false;
    }

    // Extra Turn
    if (
        !allowExtraTurn &&
        playerMap[entityKey].extra.includes(currRoundPhase)
    ) {
        return false;
    }

    // Normal Turn and not Plan
    if (
        currPlayerPhase !== playerTurnPhases.PLAN &&
        !playerMap[entityKey].extra.includes(currRoundPhase)
    ) {
        return false;
    }

    return true;
}

export function addRune(prev, targetKey, nonTargetKey, newRune) {
    let draftTarget = {
        ...prev.entities[targetKey],
    };

    const disposedRune =
        draftTarget[effectKeys.RUNIC_ARRAY][0] || runeKeys.EMPTY;

    let newGameState = {
        ...prev,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...draftTarget,
            },
        },
    };

    // Detonate Old Rune
    switch (disposedRune) {
        case runeKeys.URD: {
            newGameState = detonateUrd(newGameState, targetKey, nonTargetKey);
            break;
        }
        case runeKeys.VERDANDI: {
            newGameState = detonateVerdandi(
                newGameState,
                targetKey,
                nonTargetKey,
            );
            break;
        }
        case runeKeys.SKULD: {
            newGameState = detonateSkuld(newGameState, targetKey, nonTargetKey);
            break;
        }

        default: {
            break;
        }
    }

    draftTarget = {
        ...newGameState.entities[targetKey],
    };

    // Activate On Aquisition Effects
    switch (newRune) {
        case runeKeys.URD: {
            // Gain Recollection
            const totalRec =
                draftTarget[effectKeys.RECOLLECTION] + constants.URD_DEF_REC;
            const excessRec = Math.max(
                0,
                totalRec - constants.MAX_RECOLLECTION,
            );

            const precogGain = Math.floor(
                excessRec / constants.RECOLLECTION_EXCESS_RATE,
            );

            draftTarget = {
                ...draftTarget,
                [effectKeys.RECOLLECTION]: totalRec - excessRec,
                resources: {
                    ...draftTarget.resources,
                    [effectKeys.PRECOGNITION]:
                        draftTarget.resources[effectKeys.PRECOGNITION] +
                        precogGain,
                },
            };

            break;
        }
        case runeKeys.VERDANDI: {
            // Gain Conjecture
            draftTarget = {
                ...draftTarget,
                resources: {
                    ...draftTarget.resources,
                    [effectKeys.CONJECTURE]:
                        draftTarget.resources[effectKeys.CONJECTURE] +
                        getEntityDef(draftTarget),
                },
            };

            break;
        }
        case runeKeys.SKULD: {
            // Restore Mana
            draftTarget = {
                ...gainMana(
                    draftTarget,
                    draftTarget[effectKeys.MAX_MANA] *
                        constants.SKULD_MANA_REGEN,
                ),
            };

            break;
        }

        default: {
            break;
        }
    }

    // Add the new rune
    const newArray = [...draftTarget[effectKeys.RUNIC_ARRAY].slice(1), newRune];
    draftTarget = {
        ...draftTarget,
        [effectKeys.RUNIC_ARRAY]: [...newArray],
    };

    newGameState = {
        ...newGameState,
        entities: {
            ...newGameState.entities,
            [targetKey]: draftTarget,
        },
    };

    return newGameState;
}

export function detonateUrd(prev, targetKey, nonTargetKey) {
    let draftTarget = {
        ...prev.entities[targetKey],
    };

    let draftNonTarget = {
        ...prev.entities[nonTargetKey],
    };

    draftTarget = gainHp(
        draftTarget,
        getEntityMaxHealth(draftTarget) * constants.URD_HEALTH_REGEN,
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...draftTarget,
            },
            [nonTargetKey]: {
                ...draftNonTarget,
            },
        },
    };
}

export function detonateVerdandi(prev, targetKey, nonTargetKey) {
    let draftTarget = {
        ...prev.entities[targetKey],
    };

    let draftNonTarget = {
        ...prev.entities[nonTargetKey],
    };

    const missingMana = Math.max(
        0,
        draftTarget[effectKeys.MAX_MANA] - getEntityTotalMana(draftTarget),
    );

    draftTarget = gainMana(
        draftTarget,
        Math.floor(missingMana * constants.VERDANDI_MANA_RESTORE),
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...draftTarget,
            },
            [nonTargetKey]: {
                ...draftNonTarget,
            },
        },
    };
}

export function detonateSkuld(prev, targetKey, nonTargetKey) {
    let draftTarget = {
        ...prev.entities[targetKey],
    };

    let draftNonTarget = {
        ...prev.entities[nonTargetKey],
    };

    const totalBadOmen =
        draftNonTarget[effectKeys.BAD_OMEN] + constants.VERDANDI_OMEN_GAIN;
    const excessBadOmen = Math.max(0, totalBadOmen - constants.MAX_BAD_OMEN);
    const pdGained = Math.floor(
        excessBadOmen / constants.BAD_OMEN_EXCESS_CONVERT_RATE,
    );

    draftNonTarget = {
        ...draftNonTarget,
        [effectKeys.BAD_OMEN]: totalBadOmen - excessBadOmen,
        resources: {
            ...draftNonTarget.resources,
            [effectKeys.PROPHECY_OF_DOOM]:
                draftNonTarget.resources[effectKeys.PROPHECY_OF_DOOM] +
                pdGained,
        },
    };

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...draftTarget,
            },
            [nonTargetKey]: {
                ...draftNonTarget,
            },
        },
    };
}

export function countRunes(array, targetRune) {
    return array.filter((rune) => rune === targetRune).length;
}

export function newDealDmg(
    prev,
    baseDmg,
    takerKeys,
    dmgType,
    dealerKey = null,
    finalDmgBonus = 0,
) {
    let dmgDealt = baseDmg;

    // Calculates Final Damage Dealt
    let defPen = 0;
    if (dealerKey && prev?.entities?.[dealerKey]) {
        defPen = getEntityDefPen(prev, dealerKey);
        switch (dmgType) {
            case dmgTypes.PHYSICAL:
            case dmgTypes.PIERCING: {
                // Weakness
                const weakMult = getEntityWeakness(prev, dealerKey);

                // Dmg Bonus
                const dmgBonusMult = getEntityDamageBonus(prev, dealerKey);

                dmgDealt = Math.floor(dmgDealt * weakMult * dmgBonusMult);

                break;
            }
            case tarnishTypes.PHYSICAL:
            case tarnishTypes.PIERCING: {
                // Benediction
                const beneMult = getBenediction(prev, dealerKey);

                // Dmg Bonus
                const maleMult = getMalediction(prev, dealerKey);

                dmgDealt = Math.floor(dmgDealt * beneMult * maleMult);

                break;
            }
            case tarnishTypes.TRUE:
            case tarnishTypes.LUNIC:
            case dmgTypes.TRUE:
            case dmgTypes.LUNIC:
            default: {
                break;
            }
        }
    }

    dmgDealt += finalDmgBonus;

    return newTakeDmg(prev, dmgDealt, takerKeys, dmgType, defPen);
}

export function newTakeDmg(prev, dmgDealt, takerKeys, dmgType, defPen = 0) {
    let processedGame = {
        ...prev,
    };

    const keys = Array.isArray(takerKeys) ? takerKeys : [takerKeys];

    for (let entityKey of keys) {
        let draftTaker = {
            ...prev.entities[entityKey],
        };

        // Prismatic Override
        let dmgTypeTaken = dmgType;
        if (
            dmgTypeTaken === dmgTypes.PHYSICAL &&
            draftTaker.states[effectKeys.PRISMATIC]
        ) {
            dmgTypeTaken = dmgTypes.PIERCING;
        }

        // Ascendance Override
        if (draftTaker.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
            switch (dmgTypeTaken) {
                case dmgTypes.PHYSICAL: {
                    dmgTypeTaken = tarnishTypes.PHYSICAL;
                    break;
                }
                case dmgTypes.PIERCING: {
                    dmgTypeTaken = tarnishTypes.PIERCING;
                    break;
                }
                case dmgTypes.TRUE: {
                    dmgTypeTaken = tarnishTypes.TRUE;
                    break;
                }
                case dmgTypes.LUNIC: {
                    dmgTypeTaken = tarnishTypes.LUNIC;
                    break;
                }
                default: {
                    break;
                }
            }
        }

        let dmgTaken = dmgDealt;

        // Damage Reduction
        const drMult = getEntityDR(prev, entityKey);

        // Fragility
        const frailMult = getEntityFragility(prev, entityKey);

        // Grace
        const graceMult = getGrace(prev, entityKey);

        // Disgrace
        const disgraceMult = getDisgrace(prev, entityKey);

        // Flat Reduction
        const flatDR = Math.max(
            0,
            Math.floor(
                getEntityDef(draftTaker) * getEntityDefEffect(prev, entityKey),
            ) - defPen,
        );

        // Fortitude
        const fort = Math.max(
            0,
            getFortitude(processedGame, entityKey) -
                getDefilement(processedGame),
        );

        switch (dmgTypeTaken) {
            case dmgTypes.PHYSICAL: {
                dmgTaken -= flatDR;

                dmgTaken = Math.floor(dmgTaken * drMult * frailMult);

                break;
            }
            case dmgTypes.PIERCING: {
                dmgTaken = Math.floor(dmgTaken * drMult * frailMult);

                break;
            }
            case tarnishTypes.PHYSICAL: {
                dmgTaken -= fort;

                dmgTaken = Math.floor(dmgTaken * graceMult * disgraceMult);

                break;
            }
            case tarnishTypes.PIERCING: {
                dmgTaken = Math.floor(dmgTaken * graceMult * disgraceMult);

                break;
            }
            case dmgTypes.TRUE:
            case dmgTypes.LUNIC:
            default: {
                break;
            }
        }

        dmgTaken = Math.max(1, dmgTaken); // All damage has a minimum of 1

        switch (dmgTypeTaken) {
            case dmgTypes.PHYSICAL:
            case dmgTypes.PIERCING: {
                const consumeResult = consumeMitigationResources(
                    draftTaker,
                    dmgTaken,
                    dmgTypeTaken,
                );

                draftTaker = consumeResult.draftEntity;
                let remainingDmg =
                    dmgTaken -
                    consumeResult.mitigationResourcesConsumed
                        .totalMitigationResourcesConsumption;

                draftTaker = loseHp(draftTaker, remainingDmg);

                break;
            }
            case dmgTypes.TRUE: {
                draftTaker = loseHp(draftTaker, dmgTaken);
                break;
            }
            case dmgTypes.LUNIC: {
                draftTaker = loseMaxHealth(draftTaker, dmgTaken);
                break;
            }
            case tarnishTypes.PHYSICAL:
            case tarnishTypes.PIERCING: {
                const consumeResult = consumeMitigationResources(
                    draftTaker,
                    dmgTaken,
                    dmgTypeTaken,
                );

                draftTaker = consumeResult.draftEntity;
                let remainingDmg =
                    dmgTaken -
                    consumeResult.mitigationResourcesConsumed
                        .totalMitigationResourcesConsumption;

                draftTaker = loseEnlit(draftTaker, remainingDmg);
                break;
            }
            case tarnishTypes.TRUE: {
                draftTaker = loseEnlit(draftTaker, dmgTaken);
                break;
            }
            case tarnishTypes.LUNIC: {
                draftTaker = loseMaxEnlit(draftTaker, dmgTaken);
                break;
            }
            default: {
                break;
            }
        }

        processedGame = buildHistory(
            {
                ...processedGame,
                entities: {
                    ...processedGame.entities,
                    [entityKey]: draftTaker,
                },
            },
            eventKeys.TOOK_DMG,
            {
                player: entityKey,
                damage: dmgTaken,
                dmgType: dmgTypeTaken,
            },
        );
    }

    return processedGame;
}

export function getEntityDR(prev, entityKey) {
    const entity = {
        ...prev.entities[entityKey],
    };

    let drMult = 1.0;
    if (entity.states[effectKeys.GUARDING_STATE]) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }
    if (entity.states[effectKeys.SACRIFICIAL_STATE]) {
        const missingHealth = Math.max(
            0,
            getEntityMaxHealth(entity) - getEntityTotalHealth(entity),
        );
        drMult *=
            getEntityMaxHealth(entity) > 0
                ? Math.max(0, 1 - missingHealth / getEntityMaxHealth(entity))
                : 1;
    }
    if (isElementActive(entity, elementalKeys.WITHER)) {
        const missingHealth = Math.max(
            0,
            getEntityMaxHealth(entity) - getEntityTotalHealth(entity),
        );
        drMult *=
            getEntityMaxHealth(entity) > 0
                ? Math.max(0, 1 - missingHealth / getEntityMaxHealth(entity))
                : 1;
    }
    if (entity.states[effectKeys.DARK_EMBRACE]) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }
    if (entity.states[effectKeys.DEPLOYMENT]) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }

    if (entity.states[effectKeys.MOON_DEW]) {
        drMult *= Math.max(0, 1 - constants.STANDARD_DR_INCREASE);
    }

    if (entity[effectKeys.SONORITY] < 0) {
        drMult *= Math.max(0, 1 + entity[effectKeys.SONORITY] / 100);
    }

    if (entity.states[effectKeys.VENTING]) {
        const missingOverheat = Math.max(
            0,
            entity[effectKeys.OVERHEAT] - constants.MAX_OVERHEAT,
        );
        drMult *= Math.max(0, 1 - missingOverheat / constants.MAX_OVERHEAT);
    }

    if (entity.states[effectKeys.VISIONARY]) {
        drMult *=
            1 -
            countRunes(entity[effectKeys.RUNIC_ARRAY], runeKeys.SKULD) *
                constants.SKULD_WEAK;
    }

    return drMult;
}

export function getEntityDefEffect(prev, entityKey) {
    const entity = {
        ...prev.entities[entityKey],
    };
    let defEffect = 1.0;
    if (entity.states[effectKeys.GUARDING_STATE]) {
        defEffect *= constants.STANDARD_DEF_EFFECT_INCREASE;
    }
    if (entity.states[effectKeys.RADIANT]) {
        defEffect *= constants.RADIANT_DEF_EFFECT_MULTIPLIER;
    }

    return defEffect;
}

export function getEntityDefPen(prev, entityKey) {
    const entity = {
        ...prev.entities[entityKey],
    };

    let defPen = 0;
    if (entity[effectKeys.STARBLIGHT] > 0) {
        defPen += entity[effectKeys.STARBLIGHT];
    }

    return defPen;
}

export function getEntityDamageBonus(prev, entityKey) {
    const entity = {
        ...prev.entities[entityKey],
    };

    let dmgBonus = 1.0;

    if (entity[effectKeys.LUNACY] > 0) {
        dmgBonus *= 1 + entity[effectKeys.LUNACY] / 100;
    }
    if (entity[effectKeys.GRAVITATION] > 0) {
        dmgBonus *= 1 + entity[effectKeys.GRAVITATION] / 100;
    }
    if (entity[effectKeys.ACCRETION] > 0) {
        dmgBonus *= 1 + entity[effectKeys.ACCRETION] / 100;
    }
    if (entity[effectKeys.SONORITY] > 0) {
        dmgBonus *= 1 + entity[effectKeys.SONORITY] / 100;
    }
    if (entity[effectKeys.RECOLLECTION] > 0) {
        dmgBonus *= 1 + entity[effectKeys.RECOLLECTION] / 100;
    }

    return dmgBonus;
}

export function getEntityFragility(prev, entityKey) {
    const entity = {
        ...prev.entities[entityKey],
    };

    let frail = 1.0;

    if (entity[effectKeys.LUNACY] > 0) {
        frail *= 1 + entity[effectKeys.LUNACY] / 100;
    }

    if (entity[effectKeys.SONORITY] > 0) {
        frail *= 1 + entity[effectKeys.SONORITY] / 100;
    }

    if (entity[effectKeys.BAD_OMEN] > 0) {
        frail *= 1 + entity[effectKeys.BAD_OMEN] / 100;
    }

    if (entity[effectKeys.IRRADIATION] > 0) {
        frail *= 1 + entity[effectKeys.IRRADIATION] / 100;
    }

    if (entity[effectKeys.OVERHEAT] > 0) {
        frail *= 1 + entity[effectKeys.OVERHEAT] / 100;
    }

    return frail;
}

export function getEntityWeakness(prev, entityKey) {
    const entity = {
        ...prev.entities[entityKey],
    };

    let weak = 1.0;

    if (entity[effectKeys.SONORITY] < 0) {
        weak *= 1 + entity[effectKeys.SONORITY] / 100;
    }

    if (entity[effectKeys.BAD_OMEN] > 0) {
        weak *= 1 - entity[effectKeys.BAD_OMEN] / 100;
    }

    if (entity[effectKeys.IRRADIATION] > 0) {
        weak *= 1 - entity[effectKeys.IRRADIATION] / 100;
    }

    if (entity.states[effectKeys.VISIONARY]) {
        weak *=
            1 -
            countRunes(entity[effectKeys.RUNIC_ARRAY], runeKeys.SKULD) *
                constants.SKULD_WEAK;
    }

    return weak;
}

function processProgUnlock(prev) {
    if (prev.status === turnStatus.VICTORY && prev.progressMode) {
        const currController = prev.entities[entityKeys.PLAYER_TWO].controller;

        const keys = Object.keys(presetAi);
        const currIndex = keys.indexOf(currController);

        // If index is not found or human
        if (currIndex === -1 || currController === aiKeys.HUMAN) {
            return prev;
        }

        const nextKey = keys?.[currIndex + 1];

        if (!nextKey) {
            return prev;
        }

        // If next enemy is already defeated or is always open
        if (
            prev.progressStatus[nextKey] === progKeys.DEFEATED ||
            prev.progressStatus[nextKey] === progKeys.ALWAYS_OPEN
        ) {
            return prev;
        }

        return {
            ...prev,
            progressStatus: {
                ...prev.progressStatus,
                [currController]: progKeys.DEFEATED,
                [nextKey]: progKeys.OPEN_UNDEFEATED,
            },
        };
    }

    return prev;
}

export function loseMaxHealth(entity, amount) {
    let draftEntity = {
        ...entity,
    };
    const maxHpConsumed = Math.min(amount, draftEntity[effectKeys.MAX_HEALTH]);
    draftEntity = {
        ...draftEntity,
        [effectKeys.MAX_HEALTH]:
            draftEntity[effectKeys.MAX_HEALTH] - maxHpConsumed,
    };

    if (draftEntity.states[effectKeys.SELENIAN]) {
        const moonlightConsumed = Math.min(
            amount - maxHpConsumed,
            draftEntity[effectKeys.MOONLIGHT],
        );

        draftEntity = {
            ...draftEntity,
            [effectKeys.MOONLIGHT]:
                draftEntity[effectKeys.MOONLIGHT] - moonlightConsumed,
        };
    }

    return draftEntity;
}

export function processExitUmbral(prev, targetKey) {
    const entity = {
        ...prev.entities[targetKey],
    };

    const newShadows = Math.floor(
        entity.resources[effectKeys.SHADOWFLAME] +
            entity.resources[effectKeys.LINGERING_EMBER] / 2,
    );

    return {
        ...prev,
        entities: {
            ...prev.entities,
            [targetKey]: {
                ...entity,
                states: {
                    ...entity.states,
                    [effectKeys.UMBRAL_CORE]: false,
                },
                resources: {
                    ...entity.resources,
                    [effectKeys.SHADOWFLAME]: 0,
                    [effectKeys.CINDERS]: 0,
                    [effectKeys.LINGERING_EMBER]: 0,
                    [effectKeys.UNRELENTING_SHADOWS]: newShadows,
                },
            },
        },
    };
}

export function getCurrActivePlayer(prev) {
    const currPhase = prev?.roundQueue?.[prev?.roundIndex];

    const isPlayerOneTurn =
        playerMap[entityKeys.PLAYER_ONE].turn.includes(currPhase);
    const isPlayerTwoTurn =
        playerMap[entityKeys.PLAYER_TWO].turn.includes(currPhase);

    if (isPlayerOneTurn) {
        return entityKeys.PLAYER_ONE;
    }
    if (isPlayerTwoTurn) {
        return entityKeys.PLAYER_TWO;
    }

    return null;
}

export function getEntityLabel(prev, entityKey) {
    let label = "";
    if (!prev?.entities?.[entityKey]) {
        return label;
    }

    const controller = prev.entities[entityKey].controller;
    if (controller === aiKeys.HUMAN) {
        label =
            entityKey === entityKeys.PLAYER_ONE ? "Player One" : "Player Two";
    } else {
        const otherEntityKey =
            entityKey === entityKeys.PLAYER_ONE
                ? entityKeys.PLAYER_TWO
                : entityKeys.PLAYER_ONE;

        const otherController = prev.entities[otherEntityKey].controller;

        if (controller === otherController) {
            label = `${presetAi[controller].name} ${entityKey === entityKeys.PLAYER_ONE ? "(Player One)" : "(Player Two)"}`;
        } else {
            label = `${presetAi[controller].name}`;
        }
    }

    return label;
}

export function getOtherEntity(entityKey) {
    if (!Object.values(entityKeys).includes(entityKey)) {
        return null;
    }

    return entityKey === entityKeys.PLAYER_ONE
        ? entityKeys.PLAYER_TWO
        : entityKeys.PLAYER_ONE;
}

export function deleteCondition(entity) {
    const newAttr = resetAttr(entity).attributes;
    return {
        ...createBaseEntity(),
        [effectKeys.MAX_HEALTH]: 0,
        [effectKeys.HEALTH]: 0,
        [effectKeys.MAX_MANA]: 0,
        [effectKeys.MANA]: 0,
        deleted: true,
        attributes: {
            ...newAttr,
        },
    };
}

export function resetAttr(entity) {
    let newAttr = {};
    for (let attr of ATTRIBUTE_NAMES) {
        newAttr = {
            ...newAttr,
            [attr]: {
                value: 0,
                points: entity.attributes[attr].points,
            },
        };
    }

    return {
        ...entity,
        attributes: newAttr,
    };
}

export function getTotalEnlit(entity) {
    return (
        entity[effectKeys.ENLIGHTENMENT] + entity.resources[effectKeys.INSIGHT]
    );
}

export function getMaxEnlit(entity) {
    return entity[effectKeys.MAX_ENLIGHTENMENT];
}

export function loseEnlit(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    // Lose Insight
    const insightLost = Math.min(
        amount,
        draftEntity.resources[effectKeys.INSIGHT],
    );

    draftEntity = {
        ...draftEntity,
        resources: {
            ...draftEntity.resources,
            [effectKeys.INSIGHT]:
                draftEntity.resources[effectKeys.INSIGHT] - insightLost,
        },
    };

    // Lose Enligtenment
    const enlitLost = Math.min(
        amount - insightLost,
        draftEntity[effectKeys.ENLIGHTENMENT],
    );

    draftEntity = {
        ...draftEntity,
        [effectKeys.ENLIGHTENMENT]:
            draftEntity[effectKeys.ENLIGHTENMENT] - enlitLost,
    };

    // Gain Marthyr
    if (draftEntity.edicts[edictKeys.ARCHANGELS]) {
        draftEntity = {
            ...draftEntity,
            resources: {
                ...draftEntity.resources,
                [effectKeys.MARTHYR]:
                    draftEntity.resources[effectKeys.MARTHYR] +
                    insightLost +
                    enlitLost,
            },
        };
    }

    // Gain Sin
    const tarnishGain =
        (amount - insightLost - enlitLost) * constants.TARNISH_SIN_CONVERSION;
    draftEntity = gainSin(draftEntity, tarnishGain);

    return draftEntity;
}

export function gainEnlit(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    const missingEnlit = Math.max(
        0,
        getMaxEnlit(draftEntity) - getTotalEnlit(draftEntity),
    );
    const enlitGain = Math.min(amount, missingEnlit);

    draftEntity = {
        ...draftEntity,
        [effectKeys.ENLIGHTENMENT]:
            draftEntity[effectKeys.ENLIGHTENMENT] + enlitGain,
        resources: {
            ...draftEntity.resources,
            [effectKeys.INSIGHT]:
                draftEntity.resources[effectKeys.INSIGHT] + amount - enlitGain,
        },
    };

    return draftEntity;
}

export function loseMaxEnlit(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    const maxEnlitLost = Math.min(
        amount,
        draftEntity[effectKeys.MAX_ENLIGHTENMENT],
    );

    draftEntity = {
        ...draftEntity,
        [effectKeys.MAX_ENLIGHTENMENT]:
            draftEntity[effectKeys.MAX_ENLIGHTENMENT] - maxEnlitLost,
    };

    const tarnishGain =
        (amount - maxEnlitLost) * constants.TARNISH_SIN_CONVERSION;
    draftEntity = gainSin(draftEntity, tarnishGain);

    return draftEntity;
}

export function gainSin(entity, amount) {
    let draftEntity = {
        ...entity,
    };

    const sinGain = Math.min(constants.MAX_SIN, amount);

    draftEntity = {
        ...draftEntity,
        [effectKeys.TARNISHED_SIN]:
            draftEntity[effectKeys.TARNISHED_SIN] + sinGain,
    };

    return draftEntity;
}

export function getBenediction(prev, entityKey) {
    const entity = extractEntity(prev, entityKey);

    let bene = 1.0;

    // Genesis
    if (entity[effectKeys.STARS_OF_GENESIS] > 0) {
        bene *= 1 - entity[effectKeys.STARS_OF_GENESIS] * constants.GENE_BENE;
    }

    // Seraphim
    if (entity.edicts[edictKeys.SERAPHIM]) {
        if (prev.btt[effectKeys.EYE_OF_HEAVENS] === eyeKeys.OPEN) {
            const prov = prev.btt[effectKeys.PROVIDENCE];
            bene *= 1 - prov * constants.SERAPHIM_MULT;
        } else if (prev.btt[effectKeys.EYE_OF_HEAVENS] === eyeKeys.CLOSED) {
            const missingProv = Math.max(
                0,
                constants.MAX_PROVIDENCE - prev.btt[effectKeys.PROVIDENCE],
            );
            bene *=
                1 -
                (missingProv / constants.MAX_PROVIDENCE) *
                    constants.SERAPHIM_MULT;
        }
    }

    // Hallowed Echoes
    if (entity[effectKeys.HALLOWED_ECHOES] > 0) {
        bene *= 1 + entity[effectKeys.HALLOWED_ECHOES];
    }

    return bene;
}

export function getMalediction(prev, entityKey) {
    const entity = extractEntity(prev, entityKey);
    let male = 1.0;

    // Archangels
    if (entity.edicts[edictKeys.ARCHANGELS]) {
        const missingEnlit = Math.max(
            0,
            getMaxEnlit(entity) - getTotalEnlit(entity),
        );
        male *=
            getMaxEnlit(entity) > 0
                ? Math.max(0, 1 + missingEnlit / getMaxEnlit(entity))
                : 1;
    }

    // Seraphim
    if (entity.edicts[edictKeys.SERAPHIM]) {
        if (prev.btt[effectKeys.EYE_OF_HEAVENS] === eyeKeys.CLOSED) {
            const prov = prev.btt[effectKeys.PROVIDENCE];
            male *= 1 + prov * constants.SERAPHIM_MULT;
        } else if (prev.btt[effectKeys.EYE_OF_HEAVENS] === eyeKeys.OPEN) {
            const missingProv = Math.max(
                0,
                constants.MAX_PROVIDENCE - prev.btt[effectKeys.PROVIDENCE],
            );
            male *=
                1 +
                (missingProv / constants.MAX_PROVIDENCE) *
                    constants.SERAPHIM_MULT;
        }
    }

    // Hallowed Echoes
    if (entity[effectKeys.HALLOWED_ECHOES] < 0) {
        male *= 1 - entity[effectKeys.HALLOWED_ECHOES];
    }

    return male;
}

export function getGrace(prev, entityKey) {
    const entity = extractEntity(prev, entityKey);

    let grace = 1.0;

    // Archangels
    if (entity.edicts[edictKeys.ARCHANGELS]) {
        const missingEnlit = Math.max(
            0,
            getMaxEnlit(entity) - getTotalEnlit(entity),
        );
        grace *=
            getMaxEnlit(entity) > 0
                ? Math.max(0, 1 - missingEnlit / getMaxEnlit(entity))
                : 1;
    }

    // Seraphim
    if (entity.edicts[edictKeys.SERAPHIM]) {
        if (prev.btt[effectKeys.EYE_OF_HEAVENS] === eyeKeys.OPEN) {
            const prov = prev.btt[effectKeys.PROVIDENCE];
            grace *= 1 - prov * constants.SERAPHIM_MULT;
        } else if (prev.btt[effectKeys.EYE_OF_HEAVENS] === eyeKeys.CLOSED) {
            const missingProv = Math.max(
                0,
                constants.MAX_PROVIDENCE - prev.btt[effectKeys.PROVIDENCE],
            );
            grace *=
                1 -
                (missingProv / constants.MAX_PROVIDENCE) *
                    constants.SERAPHIM_MULT;
        }
    }

    // Hallowed Echoes
    if (entity[effectKeys.HALLOWED_ECHOES] > 0) {
        grace *= 1 - entity[effectKeys.HALLOWED_ECHOES];
    }

    return grace;
}

export function getDisgrace(prev, entityKey) {
    const entity = extractEntity(prev, entityKey);
    let disgrace = 1.0;

    // Apocalypse
    if (entity[effectKeys.STARS_OF_APOCALYPSE] > 0) {
        disgrace *=
            1 +
            entity[effectKeys.STARS_OF_APOCALYPSE] * constants.APOC_DISGRACE;
    }

    // Seraphim
    if (entity.edicts[edictKeys.SERAPHIM]) {
        if (prev.btt[effectKeys.EYE_OF_HEAVENS] === eyeKeys.CLOSED) {
            const prov = prev.btt[effectKeys.PROVIDENCE];
            disgrace *= 1 + prov * constants.SERAPHIM_MULT;
        } else if (prev.btt[effectKeys.EYE_OF_HEAVENS] === eyeKeys.OPEN) {
            const missingProv = Math.max(
                0,
                constants.MAX_PROVIDENCE - prev.btt[effectKeys.PROVIDENCE],
            );
            disgrace *=
                1 +
                (missingProv / constants.MAX_PROVIDENCE) *
                    constants.SERAPHIM_MULT;
        }
    }

    // Ascendence + Tarnished Sin
    if (
        entity[effectKeys.TARNISHED_SIN] > 0 &&
        entity.states[effectKeys.ASCENDENCE_OF_SPIRIT]
    ) {
        disgrace *= 1 + entity[effectKeys.TARNISHED_SIN] / 100;
    }

    // Hallowed Echoes
    if (entity[effectKeys.HALLOWED_ECHOES] < 0) {
        disgrace *= 1 - entity[effectKeys.HALLOWED_ECHOES];
    }

    return disgrace;
}

export function getIntegrity(prev, entityKey) {
    const entity = extractEntity(prev, entityKey);

    let integrity = 0.0;

    if (entity.edicts[edictKeys.PRINCIPALITIES]) {
        integrity += prev.btt[effectKeys.PROVIDENCE];
    }

    return integrity;
}

export function getFortitude(prev, entityKey) {
    const entity = extractEntity(prev, entityKey);

    if (entity.states[effectKeys.IMMACULATE]) {
        return 0;
    }

    let fort = entity[effectKeys.FORTITUDE];

    fort += Math.max(
        0,
        Math.floor(
            entity[effectKeys.REVELATION] * getIntegrity(prev, entityKey),
        ),
    );

    return fort;
}

export function getRevelation(prev, entityKey) {
    const entity = extractEntity(prev, entityKey);

    let rev = entity[effectKeys.REVELATION];

    return rev;
}

export function getDefilement(prev) {
    let defil = 0;

    defil += getEntityDefPen(prev, entityKeys.PLAYER_ONE);
    defil += getEntityDefPen(prev, entityKeys.PLAYER_TWO);

    return defil;
}

export function advanceChoir(entity) {
    let draftEntity = {
        ...entity,
    };

    const choirs = Object.values(choirKeys);

    if (
        !draftEntity[entryTypes.HEAVENLY_CHOIR] ||
        !choirs.includes(draftEntity[entryTypes.HEAVENLY_CHOIR]) ||
        draftEntity[entryTypes.HEAVENLY_CHOIR] === choirKeys.NONE
    ) {
        return draftEntity;
    }

    const currIndex = choirs.indexOf(draftEntity[entryTypes.HEAVENLY_CHOIR]);
    const newIndex = Math.min(currIndex + 1, choirs.length - 1);

    const newChoir = choirs[newIndex];

    return {
        ...draftEntity,
        [entryTypes.HEAVENLY_CHOIR]: newChoir,
    };
}

export function isChoirActive(entity, targetChoir) {
    const choirs = Object.values(choirKeys);

    if (
        !entity[entryTypes.HEAVENLY_CHOIR] ||
        !choirs.includes(entity[entryTypes.HEAVENLY_CHOIR]) ||
        entity[entryTypes.HEAVENLY_CHOIR] === choirKeys.NONE
    ) {
        return false;
    }

    const currIndex = choirs.indexOf(entity[entryTypes.HEAVENLY_CHOIR]);
    const targetIndex = choirs.indexOf(targetChoir);

    return currIndex >= targetIndex;
}

export function isEdictUnlocked(entity, targetEdict) {
    if (!entity || !entity?.states?.[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        return false;
    }

    const targetChoir = edictChoirMap[targetEdict];

    return isChoirActive(entity, targetChoir);
}

export function raiseProvidence(prev, amount) {
    let post = {
        ...prev,
    };

    const provGain = Math.min(
        constants.MAX_PROVIDENCE - post.btt[effectKeys.PROVIDENCE],
        amount,
    );

    post = {
        ...post,
        btt: {
            ...post.btt,
            [effectKeys.PROVIDENCE]: post.btt[effectKeys.PROVIDENCE] + provGain,
        },
    };

    const restore = Math.floor(
        (amount - provGain) * constants.EXCESS_PROV_RESTORE_RATE,
    );
    if (restore > 0) {
        const p1 = restoreResources(post.entities[entityKeys.PLAYER_ONE]);
        const p2 = restoreResources(post.entities[entityKeys.PLAYER_TWO]);

        post = {
            ...post,
            entities: {
                ...post.entities,
                [entityKeys.PLAYER_ONE]: p1,
                [entityKeys.PLAYER_TWO]: p2,
            },
        };
    }

    let p1 = extractEntity(post, entityKeys.PLAYER_ONE);
    let p2 = extractEntity(post, entityKeys.PLAYER_TWO);

    if (isEdictActive(p1, edictKeys.CHERUBIM)) {
        p1 = {
            ...p1,
            [effectKeys.STARS_OF_GENESIS]:
                p1[effectKeys.STARS_OF_GENESIS] +
                Math.floor(provGain * constants.STAR_GAIN_RATE),
        };

        post = replaceEntity(post, p1, entityKeys.PLAYER_ONE);
    }

    if (isEdictActive(p2, edictKeys.CHERUBIM)) {
        p2 = {
            ...p2,
            [effectKeys.STARS_OF_GENESIS]:
                p2[effectKeys.STARS_OF_GENESIS] +
                Math.floor(provGain * constants.STAR_GAIN_RATE),
        };

        post = replaceEntity(post, p2, entityKeys.PLAYER_TWO);
    }

    return post;
}

export function replaceEntity(prev, entity, entityKey) {
    return {
        ...prev,
        entities: {
            ...prev?.entities,
            [entityKey]: {
                ...entity,
            },
        },
    };
}

export function extractEntity(prev, entityKey) {
    return prev?.entities?.[entityKey];
}

export function loseProvidence(prev, amount) {
    let post = {
        ...prev,
    };
    const provLost = Math.min(post.btt[effectKeys.PROVIDENCE], amount);

    let p1 = extractEntity(post, entityKeys.PLAYER_ONE);
    let p2 = extractEntity(post, entityKeys.PLAYER_TWO);

    if (isEdictActive(p1, edictKeys.CHERUBIM)) {
        p1 = {
            ...p1,
            [effectKeys.STARS_OF_APOCALYPSE]:
                p1[effectKeys.STARS_OF_APOCALYPSE] +
                Math.floor(provLost * constants.STAR_GAIN_RATE),
        };

        post = replaceEntity(post, p1, entityKeys.PLAYER_ONE);
    }

    if (isEdictActive(p2, edictKeys.CHERUBIM)) {
        p2 = {
            ...p2,
            [effectKeys.STARS_OF_APOCALYPSE]:
                p2[effectKeys.STARS_OF_APOCALYPSE] +
                Math.floor(provLost * constants.STAR_GAIN_RATE),
        };

        post = replaceEntity(post, p2, entityKeys.PLAYER_TWO);
    }

    return {
        ...post,
        btt: {
            ...post.btt,
            [effectKeys.PROVIDENCE]: post.btt[effectKeys.PROVIDENCE] - provLost,
        },
    };
}

export function isEdictActive(entity, edict) {
    return !isEdictUnlocked(entity, edict) && entity?.edicts?.[edict];
}

export function processExitAscendence(prev, entityKey) {
    let post = {
        ...prev,
    };

    post = exitChoirs(post, entityKey);

    let draftEntity = extractEntity(post, entityKey);

    draftEntity = {
        ...draftEntity,
        [effectKeys.REVELATION]: 0,
        [effectKeys.FORTITUDE]: 0,
    };

    const result = consumeLimitedResources(draftEntity, Infinity);

    draftEntity = result.draftEntity;

    draftEntity = {
        ...draftEntity,
        [effectKeys.MAX_HEALTH]: draftEntity[effectKeys.MAX_ENLIGHTENMENT],
        [effectKeys.MAX_ENLIGHTENMENT]: 0,
    };

    draftEntity = restoreResources(
        draftEntity,
        result.limitedResourcesConsumed.totalLimitedResourcesConsumption,
    );

    draftEntity = {
        ...draftEntity,
        states: {
            ...draftEntity.states,
            [effectKeys.CUTOFF_WINGS]: true,
            [effectKeys.ASCENDENCE_OF_SPIRIT]: false,
        },
    };

    post = replaceEntity(post, draftEntity, entityKey);

    return post;
}

export function exitChoirs(prev, entityKey) {
    return replaceEntity(
        prev,
        {
            ...extractEntity(prev, entityKey),
            edicts: {
                ...createBaseEntity().edicts,
            },
        },
        entityKey,
    );
}

export function addBlasphemy(prev, targetKey, nonTargetKey, newBlas) {
    let post = {
        ...prev,
    };

    let draftTarget = extractEntity(post, targetKey);

    const disposedBlasphemy =
        draftTarget[effectKeys.CODEX_OF_BLASPHEMY][0] || blasphemyKeys.NONE;

    // Expunge Old Blasphemy
    post = expungeBlas(post, targetKey, nonTargetKey, disposedBlasphemy);

    // Add the new Blasphemy
    draftTarget = extractEntity(post, targetKey);
    const newCodex = [
        ...draftTarget[effectKeys.CODEX_OF_BLASPHEMY].slice(1),
        newBlas,
    ];
    draftTarget = {
        ...draftTarget,
        [effectKeys.CODEX_OF_BLASPHEMY]: [...newCodex],
    };

    post = replaceEntity(post, draftTarget, targetKey);

    return post;
}

export function expungeBlas(prev, targetKey, nonTargetKey, blasphemy) {
    let post = {
        ...prev,
    };

    let draftTarget = extractEntity(post, targetKey);
    let draftNonTarget = extractEntity(post, nonTargetKey);

    switch (blasphemy) {
        case blasphemyKeys.YESTERDAY: {
            const sinTransfer =
                draftTarget[effectKeys.TARNISHED_SIN] * constants.YEST_SIN_RATE;

            draftTarget = {
                ...draftTarget,
                [effectKeys.TARNISHED_SIN]:
                    draftTarget[effectKeys.TARNISHED_SIN] - sinTransfer,
            };

            draftNonTarget = {
                ...draftNonTarget,
                [effectKeys.TARNISHED_SIN]: Math.min(
                    constants.MAX_SIN,
                    draftNonTarget[effectKeys.TARNISHED_SIN] + sinTransfer,
                ),
            };
            break;
        }

        case blasphemyKeys.TODAY: {
            const missingEnlit = Math.max(
                0,
                getMaxEnlit(draftTarget) - getTotalEnlit(draftTarget),
            );

            post = newDealDmg(
                post,
                missingEnlit,
                [targetKey, nonTargetKey],
                tarnishTypes.PHYSICAL,
                targetKey,
            );

            break;
        }

        case blasphemyKeys.TOMORROW: {
            draftTarget = {
                ...draftTarget,
                resources: {
                    ...draftTarget.resources,
                    [effectKeys.COVENANT]:
                        draftTarget.resources[effectKeys.COVENANT] +
                        post.btt[effectKeys.PROVIDENCE] * constants.TOMOR_RATE,
                },
            };
            break;
        }

        default: {
            break;
        }
    }

    post = replaceEntity(post, draftTarget, targetKey);
    post = replaceEntity(post, draftNonTarget, nonTargetKey);

    return post;
}
