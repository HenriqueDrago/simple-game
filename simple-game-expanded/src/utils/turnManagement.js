import {
    actionMap,
    constants,
    elementsMap,
    FREE_ACTIONS,
} from "./constants.js";
import {
    advanceChoir,
    canUseAction,
    consumeResources,
    deleteCondition,
    extractEntity,
    gainHp,
    gainSin,
    getEntityColoredStars,
    getEntityElement,
    getEntityTotalMana,
    getProvForVirtues,
    isChoirActive,
    isEdictActive,
    isElementActive,
    loseMana,
    loseProvidence,
    newDealDmg,
    processActionTypeUsed,
    processDeathCheck,
    raiseProvidence,
    replaceEntity,
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
    edictKeys,
    choirKeys,
    eyeKeys,
    tarnishTypes,
} from "./enums.js";
import { simulators } from "./simulators.js";
import { processROYGBIVStar } from "./starfall.js";

// eslint-disable-next-line no-unused-vars
export function processUpkeep(prev, targetKey, nonTargetKey) {
    let post = {
        ...prev,
    };

    let draftTarget = {
        ...post.entities[targetKey],
    };

    // Hallowed Echoes
    if (draftTarget[effectKeys.HALLOWED_ECHOES] !== 0) {
        draftTarget = {
            ...draftTarget,
            [effectKeys.HALLOWED_ECHOES]: 0,
        };
    }

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
        }
    }

    // Fractured Dome
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
            },
        };

        post = newDealDmg(post, dmgTaken, targetKey, dmgTypes.TRUE, null);

        draftTarget = { ...post.entities[targetKey] };
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

    // Insight
    if (draftTarget.resources[effectKeys.INSIGHT] > 0) {
        const sinGained =
            draftTarget.resources[effectKeys.INSIGHT] * constants.BASE_SIN_GAIN;
        const provGained =
            draftTarget.resources[effectKeys.INSIGHT] *
            constants.BASE_PROV_GAIN;

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                [effectKeys.INSIGHT]: 0,
            },
        };

        draftTarget = gainSin(draftTarget, sinGained);
        post = replaceEntity(post, draftTarget, targetKey);

        post = raiseProvidence(post, provGained);
        draftTarget = extractEntity(post, targetKey);
    }

    // Sanctuary
    if (draftTarget.resources[effectKeys.SANCTUARY] > 0) {
        const provGain =
            draftTarget.resources[effectKeys.SANCTUARY] *
            constants.BASE_PROV_GAIN;

        draftTarget = {
            ...draftTarget,
            resources: {
                ...draftTarget.resources,
                [effectKeys.SANCTUARY]: 0,
            },
        };

        post = replaceEntity(post, draftTarget, targetKey);
        post = raiseProvidence(post, provGain);
        draftTarget = extractEntity(post, targetKey);
    }

    // Motes of Creation
    if (
        draftTarget.resources[effectKeys.MOTES_OF_CREATION] >=
        constants.MOTE_CONVERSION
    ) {
        const starGain = Math.floor(
            draftTarget.resources[effectKeys.MOTES_OF_CREATION] /
                constants.MOTE_CONVERSION,
        );
        const remainingMote =
            draftTarget.resources[effectKeys.MOTES_OF_CREATION] %
            constants.MOTE_CONVERSION;

        draftTarget = {
            ...draftTarget,
            [effectKeys.STARS_OF_GENESIS]:
                draftTarget[effectKeys.STARS_OF_GENESIS] + starGain,
            resources: {
                ...draftTarget.resources,
                [effectKeys.MOTES_OF_CREATION]: remainingMote,
            },
        };
    }

    // Heavenly Choir
    if (draftTarget.states[effectKeys.ASCENDENCE_OF_SPIRIT]) {
        post = replaceEntity(post, draftTarget, targetKey);
        post = advanceChoir(post, targetKey);
        draftTarget = extractEntity(post, targetKey);
    }

    // Burden of Stigma
    if (draftTarget[effectKeys.BURDEN_OF_STIGMA] > 0) {
        draftTarget = {
            ...draftTarget,
            [effectKeys.BURDEN_OF_STIGMA]:
                draftTarget[effectKeys.BURDEN_OF_STIGMA] - 1,
        };
    }

    // Laser used
    draftTarget = {
        ...draftTarget,
        lasersUsedThisTurn: 0,
        virtuesUsedThisTurn: 0,
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
            [effectKeys.IMMACULATE]: false,
            [effectKeys.PIOUS]: false,
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

    // Sacred Flames
    if (draftCurrActor.resources[effectKeys.SACRED_FLAMES] > 0) {
        draftCurrActor = gainSin(
            draftCurrActor,
            draftCurrActor.resources[effectKeys.SACRED_FLAMES] *
                constants.BASE_SIN_GAIN,
        );

        draftCurrActor = restoreResources(
            draftCurrActor,
            draftCurrActor.resources[effectKeys.SACRED_FLAMES],
        );
    }

    // Inspiration
    if (draftCurrActor.resources[effectKeys.INSPIRATION] > 0) {
        const insp = draftCurrActor.resources[effectKeys.INSPIRATION];

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.INSPIRATION]: 0,
            },
        };

        post = replaceEntity(post, draftCurrActor, currActorKey);
        post = raiseProvidence(post, insp);
        draftCurrActor = extractEntity(post, currActorKey);
    }

    // Marthyr
    if (draftCurrActor.resources[effectKeys.MARTHYR] > 0) {
        const sinGained =
            draftCurrActor.resources[effectKeys.MARTHYR] *
            constants.BASE_SIN_GAIN;
        const provGained =
            draftCurrActor.resources[effectKeys.MARTHYR] *
            constants.BASE_PROV_GAIN;

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.MARTHYR]: 0,
            },
        };

        draftCurrActor = gainSin(draftCurrActor, sinGained);
        post = replaceEntity(post, draftCurrActor, currActorKey);

        post = raiseProvidence(post, provGained);
        draftCurrActor = extractEntity(post, currActorKey);
    }

    // Sacrilege
    if (draftCurrActor.resources[effectKeys.SACRILEGE] > 0) {
        const sinGained =
            draftCurrActor.resources[effectKeys.SACRILEGE] *
            constants.HIGH_SIN_GAIN;

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.SACRILEGE]: 0,
            },
        };

        draftCurrActor = gainSin(draftCurrActor, sinGained);
        post = replaceEntity(post, draftCurrActor, currActorKey);
    }

    // Penitence
    if (draftCurrActor.resources[effectKeys.PENITENCE] > 0) {
        const sinGained =
            draftCurrActor.resources[effectKeys.PENITENCE] *
            constants.BASE_SIN_GAIN;

        draftCurrActor = {
            ...draftCurrActor,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.PENITENCE]: 0,
            },
        };

        draftCurrActor = gainSin(draftCurrActor, sinGained);
        post = replaceEntity(post, draftCurrActor, currActorKey);
    }

    // Motes of Ruin
    if (
        draftCurrActor.resources[effectKeys.MOTES_OF_RUIN] >=
        constants.MOTE_CONVERSION
    ) {
        const starGain = Math.floor(
            draftCurrActor.resources[effectKeys.MOTES_OF_RUIN] /
                constants.MOTE_CONVERSION,
        );
        const remainingMote =
            draftCurrActor.resources[effectKeys.MOTES_OF_RUIN] %
            constants.MOTE_CONVERSION;

        draftCurrActor = {
            ...draftCurrActor,
            [effectKeys.STARS_OF_APOCALYPSE]:
                draftCurrActor[effectKeys.STARS_OF_APOCALYPSE] + starGain,
            resources: {
                ...draftCurrActor.resources,
                [effectKeys.MOTES_OF_RUIN]: remainingMote,
            },
        };
    }

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
        virtuesUsedThisTurn: 0,
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

    // Anointment
    const hasAnointed =
        p1.states[effectKeys.ANOINTED_PROXY] ||
        p2.states[effectKeys.ANOINTED_PROXY];
    const hasAbandoned =
        p1.states[effectKeys.ABANDONED_BY_GRACE] ||
        p2.states[effectKeys.ABANDONED_BY_GRACE];
    if (
        hasAbandoned &&
        !hasAnointed &&
        !newQueue.includes(roundPhases.ANOINTMENT)
    ) {
        newQueue.push(roundPhases.ANOINTMENT);
    }

    // Trial
    if (
        p1.states[effectKeys.ANOINTED_PROXY] &&
        !newQueue.includes(roundPhases.P1_TRIAL)
    ) {
        newQueue.push(roundPhases.P1_TRIAL);
    }

    if (
        p2.states[effectKeys.ANOINTED_PROXY] &&
        !newQueue.includes(roundPhases.P2_TRIAL)
    ) {
        newQueue.push(roundPhases.P2_TRIAL);
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

export function processExtraTurn(prev, agentKey, action) {
    let post = processDeathCheck(prev);

    if (post.status !== turnStatus.ONGOING) {
        return buildHistory(buildRoundQueue(post), null);
    }

    let isFreeAction = FREE_ACTIONS.includes(action);

    const isAbandoned =
        extractEntity(prev, entityKeys.PLAYER_ONE)[effectKeys.TARNISHED_SIN] >=
            constants.MAX_SIN ||
        extractEntity(prev, entityKeys.PLAYER_TWO)[effectKeys.TARNISHED_SIN] >=
            constants.MAX_SIN;

    const tempAgent = extractEntity(post, agentKey);
    if (
        !isFreeAction &&
        isEdictActive(tempAgent, edictKeys.VIRTUES) &&
        !isAbandoned
    ) {
        const provNecessary = getProvForVirtues(tempAgent);

        if (post.btt[effectKeys.PROVIDENCE] >= provNecessary) {
            post = loseProvidence(post, provNecessary);
            isFreeAction = true;

            let draftAgent = extractEntity(post, agentKey);
            draftAgent = {
                ...draftAgent,
                virtuesUsedThisTurn: draftAgent.virtuesUsedThisTurn + 1,
            };
            post = replaceEntity(post, draftAgent, agentKey);
        }
    }

    // Free actions do not end singularity
    const newStatus =
        isFreeAction && !isAbandoned
            ? turnStatus.ONGOING
            : turnStatus.ROUND_TRANSITION;

    return buildRoundQueue({
        ...post,
        status: newStatus,
    });
}

export function processPlan(prev, agentKey, action) {
    let post = processDeathCheck(prev);

    if (post.status !== turnStatus.ONGOING) {
        return buildHistory(buildRoundQueue(post), null);
    }

    let isFreeAction = FREE_ACTIONS.includes(action);

    const isAbandoned =
        extractEntity(prev, entityKeys.PLAYER_ONE)[effectKeys.TARNISHED_SIN] >=
            constants.MAX_SIN ||
        extractEntity(prev, entityKeys.PLAYER_TWO)[effectKeys.TARNISHED_SIN] >=
            constants.MAX_SIN;

    const tempAgent = extractEntity(post, agentKey);
    if (
        !isFreeAction &&
        isEdictActive(tempAgent, edictKeys.VIRTUES) &&
        !isAbandoned
    ) {
        const provNecessary = getProvForVirtues(tempAgent);

        if (post.btt[effectKeys.PROVIDENCE] >= provNecessary) {
            post = loseProvidence(post, provNecessary);
            isFreeAction = true;

            let draftAgent = extractEntity(post, agentKey);
            draftAgent = {
                ...draftAgent,
                virtuesUsedThisTurn: draftAgent.virtuesUsedThisTurn + 1,
            };
            post = replaceEntity(post, draftAgent, agentKey);
        }
    }

    // Free actions do not advance turn subphase
    const newQueue =
        isFreeAction && !isAbandoned
            ? post.playerQueue
            : post.playerQueue.slice(1);

    // Guarantes Commit executes without a round transition
    const newStatus =
        newQueue[0] === playerTurnPhases.COMMIT
            ? turnStatus.ONGOING
            : post.status;

    return buildRoundQueue({
        ...post,
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
        [tarnishTypes.PHYSICAL]: "Physical Tarnishment",
        [tarnishTypes.PIERCING]: "Piercing Tarnishment",
        [tarnishTypes.TRUE]: "True Tarnishment",
        [tarnishTypes.LUNIC]: "Lunic Tarnishment",
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

export function processReckoning(prev) {
    let post = {
        ...prev,
    };

    let eye = post.btt[effectKeys.EYE_OF_HEAVENS];
    // Disables the Eye
    if (
        !isChoirActive(
            extractEntity(post, entityKeys.PLAYER_ONE),
            choirKeys.NINTH,
        ) &&
        !isChoirActive(
            extractEntity(post, entityKeys.PLAYER_TWO),
            choirKeys.NINTH,
        )
    ) {
        eye = eyeKeys.DORMANT;
    }

    // Switch Eye
    if (eye === eyeKeys.OPEN) {
        eye = eyeKeys.CLOSED;
    } else if (eye === eyeKeys.CLOSED) {
        eye = eyeKeys.OPEN;
    }

    return processDeathCheck({
        ...post,
        status: turnStatus.ROUND_TRANSITION,
        btt: {
            ...post.btt,
            [effectKeys.EYE_OF_HEAVENS]: eye,
        },
    });
}

export function processAnointment(prev) {
    let post = {
        ...prev,
    };

    let p1 = extractEntity(post, entityKeys.PLAYER_ONE);
    let p2 = extractEntity(post, entityKeys.PLAYER_TWO);

    if (p1.states[effectKeys.ABANDONED_BY_GRACE]) {
        if (p2.states[effectKeys.ABANDONED_BY_GRACE]) {
            p1 = deleteCondition(p1);
            p2 = deleteCondition(p2);
        } else {
            p2 = {
                ...p2,
                states: {
                    ...p2.states,
                    [effectKeys.ANOINTED_PROXY]: true,
                },
            };
        }
    } else if (p2.states[effectKeys.ABANDONED_BY_GRACE]) {
        p1 = {
            ...p1,
            states: {
                ...p1.states,
                [effectKeys.ANOINTED_PROXY]: true,
            },
        };
    } else {
        console.error("Invalid Anointment");

        return processDeathCheck({
            ...post,
            status: turnStatus.ROUND_TRANSITION,
        });
    }

    post = replaceEntity(post, p1, entityKeys.PLAYER_ONE);
    post = replaceEntity(post, p2, entityKeys.PLAYER_TWO);

    return processDeathCheck({
        ...post,
        status: turnStatus.ROUND_TRANSITION,
        btt: {
            ...post.btt,
            [effectKeys.EYE_OF_HEAVENS]: eyeKeys.OPEN,
        },
    });
}
