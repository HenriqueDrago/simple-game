import {
    actionMap,
    constants,
    elementsMap,
    FREE_ACTIONS,
} from "./constants.js";
import {
    canUseAction,
    consumeResources,
    gainHp,
    getEntityColoredStars,
    getEntityElement,
    getEntityTotalMana,
    isElementActive,
    loseMana,
    newDealDmg,
    processActionTypeUsed,
    processDeathCheck,
    restoreResources,
} from "./entities.js";
import {
    turnStatus,
    entityKeys,
    effectKeys,
    dmgTypes,
    starfallPhases,
    moonKeys,
    elementalKeys,
    roundPhases,
    playerTurnPhases,
    eventKeys,
} from "./enums.js";
import { simulators } from "./simulators.js";
import { processROYGBIVStar } from "./starfall.js";

export function processUpkeep(prev, targetKey, nonTargetKey) {
    let post = {
        ...prev,
    };

    let draftTarget = {
        ...post.entities[targetKey],
    };

    let draftNonTarget = {
        ...post.entities[nonTargetKey],
    };

    // Irradiation
    if (draftTarget[effectKeys.IRRADIATION] > 0) {
        draftTarget = {
            ...draftTarget,
            [effectKeys.IRRADIATION]: 0,
        };
    }

    // Faulty Firmament
    if (draftTarget.resources[effectKeys.FAULTY_FIRMAMENT] > 0) {
        const totalIrrad =
            draftTarget[effectKeys.IRRADIATION] +
            Math.floor(
                draftTarget.resources[effectKeys.FAULTY_FIRMAMENT] *
                    constants.IRRADIATION_GAIN_RATE,
            );
        const excessIrrad = Math.max(0, totalIrrad - constants.MAX_IRRADIATION);

        draftTarget = {
            ...draftTarget,
            [effectKeys.IRRADIATION]: totalIrrad - excessIrrad,
            resources: {
                ...draftTarget.resources,
                [effectKeys.FAULTY_FIRMAMENT]: 0,
            },
        };

        if (excessIrrad >= constants.IRRAD_DMG_EXCESS) {
            post = {
                ...post,
                entities: {
                    ...post.entities,
                    [targetKey]: draftTarget,
                    [nonTargetKey]: draftNonTarget,
                },
            };

            post = newDealDmg(
                post,
                Math.floor(excessIrrad / constants.IRRAD_DMG_EXCESS),
                targetKey,
                dmgTypes.TRUE,
                null,
            );

            draftTarget = { ...post.entities[targetKey] };
            draftNonTarget = { ...post.entities[nonTargetKey] };
        }
    }

    // Faulty Firmament
    if (draftTarget.resources[effectKeys.FRACTURED_DOME] > 0) {
        const dmgTaken = draftTarget.resources[effectKeys.FRACTURED_DOME];

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                [effectKeys.FRACTURED_DOME]: 0,
            },
        };

        post = {
            ...post,
            entities: {
                ...post.entities,
                [targetKey]: draftTarget,
                [nonTargetKey]: draftNonTarget,
            },
        };

        post = newDealDmg(post, dmgTaken, targetKey, dmgTypes.TRUE, null);

        draftTarget = { ...post.entities[targetKey] };
        draftNonTarget = { ...post.entities[nonTargetKey] };
    }

    // Stardust
    if (draftTarget.resources[effectKeys.STARDUST] > 0) {
        const newStardust =
            draftTarget.resources[effectKeys.STARDUST] %
            constants.STARDUST_RATE_CONVERSION;
        const newWhites =
            draftTarget.stars[effectKeys.WHITE_STAR] +
            Math.floor(
                draftTarget.resources[effectKeys.STARDUST] /
                    constants.STARDUST_RATE_CONVERSION,
            );

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                [effectKeys.STARDUST]: newStardust,
            },
            stars: {
                ...draftTarget.stars,
                [effectKeys.WHITE_STAR]: newWhites,
            },
        };
    }

    // Moon Dew
    if (draftTarget.states[effectKeys.MOON_DEW]) {
        draftTarget = restoreResources(
            draftTarget,
            draftTarget[effectKeys.MOONLIGHT],
        );

        draftTarget = {
            ...draftTarget,
            states: {
                ...draftTarget.states,
                [effectKeys.MOON_DEW]: false,
            },
        };
    }

    // Harmony
    if (draftTarget.resources[effectKeys.HARMONY] > 0) {
        draftTarget = restoreResources(
            draftTarget,
            draftTarget.resources[effectKeys.HARMONY],
        );

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                [effectKeys.HARMONY]: 0,
            },
        };
    }

    // Unrelenting Shadows
    if (draftTarget.resources.unrelentingShadows > 0) {
        draftTarget = restoreResources(
            draftTarget,
            draftTarget.resources.unrelentingShadows,
        );

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                unrelentingShadows: 0,
            },
        };
    }

    // Conjecture
    if (draftTarget.resources[effectKeys.CONJECTURE] > 0) {
        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                [effectKeys.PRECOGNITION]:
                    draftTarget.resources[effectKeys.PRECOGNITION] +
                    draftTarget.resources[effectKeys.CONJECTURE],
                [effectKeys.CONJECTURE]: 0,
            },
        };
    }

    // Shadowflame
    if (
        draftTarget.resources.shadowflame > 0 &&
        !draftTarget.states.darkEmbrace
    ) {
        const { draftEntity, resourcesConsumed } = consumeResources(
            draftTarget,
            draftTarget.resources.shadowflame,
            effectKeys.SHADOWFLAME,
        );

        draftTarget = {
            ...draftEntity,
        };

        const newShadowflame =
            draftTarget.resources.shadowflame +
            resourcesConsumed.totalConsumption;

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                shadowflame: newShadowflame,
            },
        };
    }

    // Lingering Embers
    if (draftTarget.resources.lingeringEmber > 0) {
        const halvedLE = Math.ceil(draftTarget.resources.lingeringEmber / 2);

        const newLE = draftTarget.resources.lingeringEmber - halvedLE;
        const newCinders = draftTarget.resources.cinders + halvedLE;
        const newSF = draftTarget.resources.shadowflame + halvedLE;

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                lingeringEmber: newLE,
                cinders: newCinders,
                shadowflame: newSF,
            },
        };
    }

    // Umbral Core
    if (
        draftTarget.states.umbralCore &&
        draftTarget.resources.lingeringEmber <= 0 &&
        draftTarget.resources.shadowflame <= 0
    ) {
        draftTarget = {
            ...draftTarget,
            states: {
                ...draftTarget.states,
                umbralCore: false,
                bleakDeception: true,
            },
        };
    }

    // Shattered
    if (isElementActive(draftTarget, elementalKeys.SHATTERED)) {
        post = {
            ...post,
            entities: {
                ...post.entities,
                [targetKey]: draftTarget,
                [nonTargetKey]: draftNonTarget,
            },
        };

        post = newDealDmg(
            post,
            draftTarget[effectKeys.MOONLIGHT],
            targetKey,
            dmgTypes.LUNIC,
            null,
        );

        draftTarget = { ...post.entities[targetKey] };
        draftNonTarget = { ...post.entities[nonTargetKey] };
    }

    // Mana Bleed
    if (draftTarget[effectKeys.MANA_BLEED] > 0) {
        const manaBleed = Math.min(
            getEntityTotalMana(draftTarget),
            draftTarget[effectKeys.MANA_BLEED],
        );

        draftTarget = loseMana(draftTarget, manaBleed);
        draftTarget = gainHp(draftTarget, manaBleed);
    }

    // Deployment
    if (draftTarget.states.deployment) {
        draftTarget = {
            ...draftTarget,
            states: {
                ...draftTarget.states,
                deployment: false,
                weaponsDeployed: true,
            },
        };
    }

    // Dynamo
    if (draftTarget[effectKeys.DYNAMO] >= constants.MAX_DYNAMO) {
        draftTarget = {
            ...draftTarget,
            [effectKeys.DYNAMO]: 0,
            [effectKeys.ENERGY_LEVEL]: draftTarget[effectKeys.ENERGY_LEVEL] + 1,
        };
    }

    // Refracted Divinity
    if (draftTarget.resources[effectKeys.REFRACTED_DIVINITY] > 0) {
        const newLunacy = Math.min(
            draftTarget.resources[effectKeys.REFRACTED_DIVINITY] +
                draftTarget[effectKeys.LUNACY],
            constants.MAX_LUNACY,
        );

        draftTarget = {
            ...draftTarget,
            [effectKeys.LUNACY]: newLunacy,
            resources: {
                ...draftTarget.resources,
                [effectKeys.REFRACTED_DIVINITY]: 0,
            },
        };
    }

    // Lunacy
    if (draftTarget[effectKeys.LUNACY] >= constants.MAX_LUNACY) {
        draftTarget = {
            ...draftTarget,
            [effectKeys.ELEMENTAL_CRYSTALS]: [elementalKeys.SHATTERED],
        };
    }

    // Halo
    if (draftTarget.resources[effectKeys.HALO] > 0) {
        const missingSpark =
            constants.MAX_DIVINE_SPARK - draftTarget[effectKeys.DIVINE_SPARK];
        const sparkGained = draftTarget.resources[effectKeys.HALO];

        const newSpark =
            draftTarget[effectKeys.DIVINE_SPARK] +
            Math.min(sparkGained, missingSpark);

        draftTarget = {
            ...draftTarget,
            [effectKeys.DIVINE_SPARK]: newSpark,
            resources: {
                ...draftTarget.resources,
                [effectKeys.HALO]: 0,
            },
        };

        const toBeRestored = Math.max(
            0,
            Math.floor(
                (sparkGained - missingSpark) / constants.SPARK_RESTORE_RATE,
            ),
        );
        draftTarget = restoreResources(draftTarget, toBeRestored);
    }

    // Laser used
    draftTarget = {
        ...draftTarget,
        lasersUsedThisTurn: 0,
    };

    // States cleared at turn start
    draftTarget = {
        ...draftTarget,
        states: {
            ...draftTarget.states,
            [effectKeys.GUARDING_STATE]: false,
            [effectKeys.SACRIFICIAL_STATE]: false,
            [effectKeys.RADIANT]: false,
            [effectKeys.DARK_EMBRACE]: false,
            [effectKeys.DIMMING_DARKNESS]: false,
            [effectKeys.PRISMATIC]: false,
            [effectKeys.EVENT_HORIZON]: false,
        },
    };

    const newQueue = post.playerQueue.slice(1);

    return processDeathCheck({
        ...post,
        playerQueue: newQueue,
        entities: {
            ...post.entities,
            [targetKey]: {
                ...draftTarget,
            },
            [nonTargetKey]: {
                ...draftNonTarget,
            },
        },
    });
}

export function commitTurn(prev, currActorKey, nextActorKey) {
    let post = {
        ...prev,
    };

    let draftCurrActor = {
        ...post.entities[currActorKey],
    };
    let draftNextActor = {
        ...post.entities[nextActorKey],
    };

    // Venting
    if (draftCurrActor.states[effectKeys.VENTING]) {
        const overheatConsumed = Math.min(
            constants.VENTING_OVERHEAT_LOSS,
            draftCurrActor[effectKeys.OVERHEAT],
        );

        const newOverheat =
            draftCurrActor[effectKeys.OVERHEAT] - overheatConsumed;
        const newDynamo = Math.min(
            constants.MAX_DYNAMO,
            draftCurrActor[effectKeys.DYNAMO] + overheatConsumed,
        );

        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.OVERHEAT]: newOverheat,
            [effectKeys.DYNAMO]: newDynamo,
            states: {
                ...draftCurrActor.states,
                [effectKeys.VENTING]: newOverheat > 0,
                [effectKeys.WEAPONS_DEPLOYED]: newOverheat <= 0,
            },
        };
    }

    // Bad Omen
    if (draftCurrActor[effectKeys.BAD_OMEN] > 0) {
        const pdGained = Math.floor(
            draftCurrActor[effectKeys.BAD_OMEN] / constants.PROPHECY_GAIN_RATE,
        );

        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.BAD_OMEN]: 0,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.PROPHECY_OF_DOOM]:
                    draftCurrActor.resources[effectKeys.PROPHECY_OF_DOOM] +
                    pdGained,
            },
        };
    }

    // Mana Overflow
    if (
        draftCurrActor.resources[effectKeys.MANA_OVERFLOW] > 0 &&
        !draftCurrActor.states.dimmingDarkness
    ) {
        const overflow = draftCurrActor.resources.manaOverflow;

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                manaOverflow: 0,
            },
        };

        post = {
            ...post,
            entities: {
                ...post.entities,
                [currActorKey]: draftCurrActor,
                [nextActorKey]: draftNextActor,
            },
        };

        post = newDealDmg(post, overflow, currActorKey, dmgTypes.TRUE, null);

        draftCurrActor = { ...post.entities[currActorKey] };
        draftNextActor = { ...post.entities[nextActorKey] };
    }

    // Dissonance
    if (draftCurrActor.resources[effectKeys.DISSONANCE] > 0) {
        const dissonance = draftCurrActor.resources[effectKeys.DISSONANCE];

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.DISSONANCE]: 0,
            },
        };

        post = {
            ...post,
            entities: {
                ...post.entities,
                [currActorKey]: draftCurrActor,
                [nextActorKey]: draftNextActor,
            },
        };

        post = newDealDmg(post, dissonance, currActorKey, dmgTypes.TRUE, null);

        draftCurrActor = { ...post.entities[currActorKey] };
        draftNextActor = { ...post.entities[nextActorKey] };
    }

    // Radiance
    if (draftCurrActor.resources[effectKeys.RADIANCE] > 0) {
        const radiance = draftCurrActor.resources[effectKeys.RADIANCE];

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.RADIANCE]: 0,
            },
        };

        post = {
            ...post,
            entities: {
                ...post.entities,
                [currActorKey]: draftCurrActor,
                [nextActorKey]: draftNextActor,
            },
        };

        post = newDealDmg(post, radiance, currActorKey, dmgTypes.TRUE, null);

        draftCurrActor = { ...post.entities[currActorKey] };
        draftNextActor = { ...post.entities[nextActorKey] };
    }

    // Moonshine
    if (draftCurrActor.resources[effectKeys.MOONSHINE] > 0) {
        const moonshine = draftCurrActor.resources[effectKeys.MOONSHINE];

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.MOONSHINE]: 0,
            },
        };

        post = {
            ...post,
            entities: {
                ...post.entities,
                [currActorKey]: draftCurrActor,
                [nextActorKey]: draftNextActor,
            },
        };

        post = newDealDmg(post, moonshine, currActorKey, dmgTypes.TRUE, null);

        draftCurrActor = { ...post.entities[currActorKey] };
        draftNextActor = { ...post.entities[nextActorKey] };
    }

    // Gravitation
    if (draftCurrActor[effectKeys.GRAVITATION] > 0) {
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.GRAVITATION]: 0,
        };
    }

    // Accretion
    if (draftCurrActor[effectKeys.ACCRETION] > 0) {
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.ACCRETION]: 0,
        };
    }

    // Starblight
    if (draftCurrActor[effectKeys.STARBLIGHT] > 0) {
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.STARBLIGHT]: 0,
        };
    }

    // Constellation
    if (draftCurrActor[effectKeys.CONSTELLATION] > 0) {
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.CONSTELLATION]: 0,
        };
    }

    // Azure Constellation
    if (draftCurrActor[effectKeys.AZURE_CONSTELLATION] > 0) {
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.AZURE_CONSTELLATION]: 0,
        };
    }

    // Crimson Constellation
    if (draftCurrActor[effectKeys.CRIMSON_CONSTELLATION] > 0) {
        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.CRIMSON_CONSTELLATION]: 0,
        };
    }

    // Laser used
    draftCurrActor = {
        ...draftCurrActor,
        lasersUsedThisTurn: 0,
    };

    const newQueue = post.playerQueue.slice(1);

    return processDeathCheck({
        ...post,
        playerQueue: newQueue,
        status: turnStatus.ROUND_TRANSITION,
        entities: {
            ...post.entities,
            [currActorKey]: {
                ...draftCurrActor,
            },
            [nextActorKey]: {
                ...draftNextActor,
            },
        },
    });
}

export function buildRoundQueue(prev) {
    const currIndex = prev.roundIndex;
    const newQueue = prev.roundQueue
        ? [...prev.roundQueue.slice(0, currIndex + 1)]
        : [];

    const p1 = prev.entities[entityKeys.PLAYER_ONE];
    const p2 = prev.entities[entityKeys.PLAYER_TWO];

    // Round Start
    if (!newQueue.includes(roundPhases.ROUND_START)) {
        newQueue.push(roundPhases.ROUND_START);
    }

    // Player Logic Helper
    const playerLogic = (entityKey, turnKey, starfallKey, singularityKey) => {
        // Player Turn
        if (!newQueue.includes(turnKey)) {
            newQueue.push(turnKey);
        }

        // Starfall
        const player = prev.entities[entityKey];
        const hasStars = getEntityColoredStars(player) > 0;

        if (
            !newQueue.includes(starfallKey) &&
            player.states[effectKeys.STARGAZER] &&
            hasStars
        ) {
            newQueue.push(starfallKey);
        }

        // Singularity
        if (
            !newQueue.includes(singularityKey) &&
            player.states[effectKeys.EVENT_HORIZON]
        ) {
            newQueue.push(singularityKey);
        }
    };

    // Player Logic Order
    if (prev.startingPlayer === entityKeys.PLAYER_ONE) {
        playerLogic(
            entityKeys.PLAYER_ONE,
            roundPhases.PLAYER_ONE_TURN,
            roundPhases.P1_STARS_TURN,
            roundPhases.P1_SINGULARITY,
        );

        playerLogic(
            entityKeys.PLAYER_TWO,
            roundPhases.PLAYER_TWO_TURN,
            roundPhases.P2_STARS_TURN,
            roundPhases.P2_SINGULARITY,
        );
    } else {
        playerLogic(
            entityKeys.PLAYER_TWO,
            roundPhases.PLAYER_TWO_TURN,
            roundPhases.P2_STARS_TURN,
            roundPhases.P2_SINGULARITY,
        );

        playerLogic(
            entityKeys.PLAYER_ONE,
            roundPhases.PLAYER_ONE_TURN,
            roundPhases.P1_STARS_TURN,
            roundPhases.P1_SINGULARITY,
        );
    }

    // Moon Phase
    if (
        (p1.states[effectKeys.SELENIAN] || p2.states[effectKeys.SELENIAN]) &&
        !newQueue.includes(roundPhases.MOON_TURN)
    ) {
        newQueue.push(roundPhases.MOON_TURN);
    }

    // Round End
    if (!newQueue.includes(roundPhases.ROUND_END)) {
        newQueue.push(roundPhases.ROUND_END);
    }

    return processDeathCheck({
        ...prev,
        roundQueue: newQueue,
    });
}

export function processStarfallTurn(prev, masterKey, nonMasterKey) {
    const master = { ...prev.entities[masterKey] };

    const currentPhase = prev.starQueue[0];
    const newQueue = prev.starQueue.slice(1);

    // Exit Condition: Is Starfall End
    if (currentPhase === starfallPhases.STARFALL_END) {
        return processDeathCheck({
            ...prev,
            starQueue: null, // clears the queue
            status: turnStatus.ROUND_TRANSITION, // advances to the next round phase
        });
    }

    let newGameState = {
        ...prev,
        starQueue: newQueue,
        status: turnStatus.STARFALL_TRANSITION,
    };

    switch (currentPhase) {
        case starfallPhases.RED_STAR: {
            if (master.stars[effectKeys.RED_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.RED_STAR,
                );
            }
            break;
        }

        case starfallPhases.ORANGE_STAR: {
            if (master.stars[effectKeys.ORANGE_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.ORANGE_STAR,
                );
            }
            break;
        }

        case starfallPhases.YELLOW_STAR: {
            if (master.stars[effectKeys.YELLOW_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.YELLOW_STAR,
                );
            }
            break;
        }

        case starfallPhases.GREEN_STAR: {
            if (master.stars[effectKeys.GREEN_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.GREEN_STAR,
                );
            }
            break;
        }

        case starfallPhases.BLUE_STAR: {
            if (master.stars[effectKeys.BLUE_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.BLUE_STAR,
                );
            }
            break;
        }

        case starfallPhases.INDIGO_STAR: {
            if (master.stars[effectKeys.INDIGO_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.INDIGO_STAR,
                );
            }
            break;
        }

        case starfallPhases.VIOLET_STAR: {
            if (master.stars[effectKeys.VIOLET_STAR] > 0) {
                newGameState = processROYGBIVStar(
                    newGameState,
                    masterKey,
                    nonMasterKey,
                    effectKeys.VIOLET_STAR,
                );
            }
            break;
        }

        default: {
            break;
        }
    }

    // Process Death Checks
    newGameState = processDeathCheck(newGameState);

    // Death Override
    if (newGameState.status !== turnStatus.STARFALL_TRANSITION) {
        newGameState = {
            ...newGameState,
            starQueue: prev.starQueue,
        };
    }

    return newGameState;
}

export function processMoonPhase(prev) {
    const players = [entityKeys.PLAYER_ONE, entityKeys.PLAYER_TWO];

    let newGameState = { ...prev };

    for (let p of players) {
        let draftEntity = {
            ...newGameState.entities[p],
        };

        const moon = draftEntity[effectKeys.MIRRORED_MOON];
        let newMoon = moon;

        if (
            moon === moonKeys.HIDDEN ||
            moon === moonKeys.WANING ||
            moon === moonKeys.CORONAL
        ) {
            newMoon = moonKeys.WAXING;
        } else if (moon === moonKeys.BLOODSTAINED || moon === moonKeys.WAXING) {
            newMoon = moonKeys.WANING;
        }

        let newMoonlight = draftEntity[effectKeys.MOONLIGHT];

        // Moonlight gain
        if (moon === moonKeys.BLOODSTAINED || moon === moonKeys.CORONAL) {
            newMoonlight +=
                constants.BLOOD_CORONA_ML_GAIN +
                draftEntity[effectKeys.MOONLIT_TEARS];
        }
        if (moon === moonKeys.HIDDEN) {
            newMoonlight += constants.HIDDEN_MOON_ML_GAIN;
        }
        if (isElementActive(draftEntity, elementalKeys.ALBEDO)) {
            newMoonlight += constants.ALBEDO_ML_GAIN;
        }

        draftEntity = {
            ...draftEntity,
            [effectKeys.MOONLIGHT]: newMoonlight,
            [effectKeys.MIRRORED_MOON]: newMoon,
        };

        // Mycelium restore
        // Mycelium
        if (draftEntity.resources[effectKeys.MYCELIUM] > 0) {
            draftEntity = restoreResources(
                draftEntity,
                draftEntity.resources[effectKeys.MYCELIUM],
            );

            draftEntity = {
                ...draftEntity,
                resources: {
                    ...draftEntity.resources,
                    [effectKeys.MYCELIUM]: 0,
                },
            };
        }

        newGameState = {
            ...newGameState,
            entities: {
                ...newGameState.entities,
                [p]: draftEntity,
            },
        };
    }

    return processDeathCheck({
        ...newGameState,
        status: turnStatus.ROUND_TRANSITION,
    });
}

export function processActionUse(prev, agentKey, nonAgentKey, action) {
    // Cancel action if it cannot be used
    if (!canUseAction(prev, agentKey, action)) {
        return buildHistory(prev, eventKeys.FAILED_ACTION, {
            player: agentKey,
            action: action,
        });
    }

    let processedGame = buildHistory(prev, eventKeys.USE_ACTION, {
        player: agentKey,
        action: action,
    });

    // Run the action
    const agent = processedGame.entities[agentKey];
    const nonAgent = processedGame.entities[nonAgentKey];

    const context = {
        agent,
        agentKey,
        nonAgent,
        nonAgentKey,
        prev: processedGame,
    };

    const sim = simulators?.[action];
    const simulationResult = sim ? sim(context) : processedGame;

    // Process effects on Action Type
    processedGame = processActionTypeUsed(
        simulationResult,
        agentKey,
        nonAgentKey,
        action,
    );

    return processedGame;
}

export function processSingularity(prev, agentKey, action) {
    let newGameState = processDeathCheck(prev);

    if (newGameState.status !== turnStatus.ONGOING) {
        return buildHistory(buildRoundQueue(newGameState), null);
    }

    // Free actions do not end singularity
    const newStatus = FREE_ACTIONS.includes(action)
        ? turnStatus.ONGOING
        : turnStatus.ROUND_TRANSITION;

    return buildRoundQueue({
        ...newGameState,
        status: newStatus,
    });
}

export function processPlan(prev, action) {
    let newGameState = processDeathCheck(prev);

    if (newGameState.status !== turnStatus.ONGOING) {
        return buildHistory(buildRoundQueue(newGameState), null);
    }

    // Free actions do not advance turn subphase
    const newQueue = FREE_ACTIONS.includes(action)
        ? prev.playerQueue
        : prev.playerQueue.slice(1);

    // Guarantes Commit executes without a round transition
    const newStatus =
        newQueue[0] === playerTurnPhases.COMMIT
            ? turnStatus.ONGOING
            : newGameState.status;

    return buildRoundQueue({
        ...newGameState,
        status: newStatus,
        playerQueue: newQueue,
    });
}

export function buildHistory(prev, event, info = {}) {
    const history = [...prev.history];
    const { player, action } = info;

    const playerName = player
        ? player === entityKeys.PLAYER_ONE
            ? "Player One"
            : "Player Two"
        : "";

    const dmgMap = {
        [dmgTypes.PHYSICAL]: "Physical Damage",
        [dmgTypes.PIERCING]: "Piercing Damage",
        [dmgTypes.TRUE]: "True Damage",
        [dmgTypes.LUNIC]: "Lunic Damage",
    };

    const starMap = {
        [effectKeys.RED_STAR]: "Red Star",
        [effectKeys.ORANGE_STAR]: "Orange Star",
        [effectKeys.YELLOW_STAR]: "Yellow Star",
        [effectKeys.GREEN_STAR]: "Green Star",
        [effectKeys.BLUE_STAR]: "Blue Star",
        [effectKeys.INDIGO_STAR]: "Indigo Star",
        [effectKeys.VIOLET_STAR]: "Violet Star",
    };

    let string;
    switch (event) {
        case eventKeys.BATTLE_START:
            string = "Battle Start";
            break;

        case eventKeys.ROUND_START:
            string = `Round ${prev.roundCount} Start`;
            break;

        case eventKeys.PLAYER_TURN_START:
            string = `${playerName}'s Turn Start`;
            break;

        case eventKeys.USE_ACTION: {
            const actionName = actionMap?.[action]?.name;
            string = `${playerName} used ${actionName}`;
            break;
        }

        case eventKeys.FAILED_ACTION: {
            const actionName = actionMap?.[action]?.name;
            string = `${playerName} failed to use ${actionName}!`;
            break;
        }

        case eventKeys.SET_ELEMENT: {
            const elementName =
                elementsMap[getEntityElement(prev.entities[player])];
            string = `${playerName} set element to ${elementName}`;
            break;
        }

        case eventKeys.TOOK_DMG: {
            string = `${playerName} took ${info?.damage ?? "Unknown"} ${dmgMap?.[info?.dmgType] ?? "Unknown"}!`;
            break;
        }

        case eventKeys.STARFALL_SUBPHASE: {
            string = `${playerName}'s ${info?.normalStars ?? "Unknown"} Normal and ${info?.augmentedStars ?? "Unknown"} Augmented ${starMap?.[info?.starKey] ?? "Unknown"} have fallen!`;
            break;
        }

        case eventKeys.STARFALL_START: {
            string = `${playerName}'s Starfall Start`;
            break;
        }

        case eventKeys.SINGULARITY: {
            string = `${playerName}'s Singularity Start`;
            break;
        }

        case eventKeys.MOON_PHASE:
            string = "Moon Phase";
            break;

        default:
            string = null;
            break;
    }

    if (string) {
        history.push(string);
    }

    if (prev.status === turnStatus.DEFEAT) {
        history.push("Player Two Win");
    }
    if (prev.status === turnStatus.VICTORY) {
        history.push("Player One Win");
    }
    if (prev.status === turnStatus.DRAW) {
        history.push("Draw");
    }

    return {
        ...prev,
        history: history,
    };
}
