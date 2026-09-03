/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import {
    canUseCombatInteractions,
    createBaseEntity,
    distributePoints,
    expungeBlas,
    extractEntity,
    getCurrActivePlayer,
    getOtherEntity,
    getTotalEnlit,
    isEdictUnlocked,
    isElementActive,
    newDealDmg,
    processDeathCheck,
    processHealth,
    replaceEntity,
    resetPlayerEntity,
    restoreResources,
} from "../utils/entities";
import {
    aiKeys,
    blasphemyKeys,
    commandKeys,
    effectKeys,
    elementalKeys,
    entityKeys,
    eventKeys,
    playerTurnPhases,
    roundPhases,
    sdmKeys,
    speedKeys,
    starfallPhases,
    tarnishTypes,
    turnStatus,
    whoStartsKeys,
} from "../utils/enums";
import {
    CHECKPOINT_STATES,
    gameSpeeds,
    INITIAL_GAME_STATE,
    playerMap,
    presetAi,
} from "../utils/constants";
import {
    buildHistory,
    buildRoundQueue,
    commitTurn,
    processActionUse,
    processMoonPhase,
    processPlan,
    processExtraTurn,
    processStarfallTurn,
    processUpkeep,
    processAnointment,
} from "../utils/turnManagement";
import { centralAIManagement } from "../utils/aiControllers";
import { GameContext } from "./GameContext";
import { simulateFullStarfall } from "../utils/starfall";

// Auxiliary Functions
function resetGameState(prev) {
    const playerOne = resetPlayerEntity(prev, entityKeys.PLAYER_ONE);
    const playerTwo = resetPlayerEntity(prev, entityKeys.PLAYER_TWO);

    return {
        ...prev,
        status: turnStatus.SETUP,
        nextStatus: null,
        lastPlayerTurn: null,
        roundCount: 0,
        starQueue: null,
        playerQueue: null,
        roundQueue: null,
        roundIndex: 0,
        history: [],
        simGame: null,
        paused: false,
        undoPile: [],
        redoPile: [],
        aiQueue: [],

        entities: {
            [entityKeys.PLAYER_ONE]: playerOne,
            [entityKeys.PLAYER_TWO]: playerTwo,
        },
        btt: {
            ...INITIAL_GAME_STATE.btt,
        },
    };
}

function loadProgress() {
    try {
        const savedProgress = localStorage.getItem("gameProgression");
        if (savedProgress) {
            return {
                ...INITIAL_GAME_STATE.progressStatus,
                ...JSON.parse(savedProgress),
            };
        }
    } catch (error) {
        console.error("Failed to load progression:", error);
    }
    return INITIAL_GAME_STATE.progressStatus;
}

export default function GameProvider({ children }) {
    // Declare Game State
    const [game, setGame] = useState(() => {
        const playerProgress = loadProgress();

        // try getting saved data
        try {
            const savedData = localStorage.getItem("gameCheckpoint");
            if (savedData) {
                let savedGame = {
                    ...INITIAL_GAME_STATE,
                    ...JSON.parse(savedData),
                    progressStatus: playerProgress,
                };

                const toBeResetStatus = [
                    turnStatus.VICTORY,
                    turnStatus.DRAW,
                    turnStatus.DEFEAT,
                ];

                // Reset game if it's finished
                if (toBeResetStatus.includes(savedGame.status)) {
                    savedGame = resetGameState(savedGame);
                } else {
                    savedGame = {
                        ...savedGame,
                        paused: true,
                    };
                }

                console.log("Saved Data Found!");
                return savedGame;
            }
        } catch (error) {
            console.error("Failed to load saved game data:", error);
        }

        // Fallback if load fails
        return {
            ...INITIAL_GAME_STATE,
            progressStatus: playerProgress,
        };
    });

    // === Handles ===
    function handleAction(action, agentKey, nonAgentKey) {
        console.log(`${agentKey} Used: ${action}`);
        setGame((prev) => {
            const currPhase =
                prev.roundQueue && prev.roundQueue[prev.roundIndex];
            const isExtraTurn = playerMap[agentKey].extra.includes(currPhase);

            let post = {
                ...processActionUse(prev, agentKey, nonAgentKey, action),
                simGame: null,
            };

            post = isExtraTurn
                ? processExtraTurn(post, agentKey, action)
                : processPlan(post, agentKey, action);

            if (canUseCombatInteractions(post, agentKey)) {
                post = {
                    ...post,
                    undoPile: [
                        ...post.undoPile,
                        { ...prev, undoPile: [], redoPile: [], simGame: null },
                    ].slice(-10), // Max of 10 actions saved
                    redoPile: [],
                };
            } else {
                post = {
                    ...post,
                    undoPile: [],
                    redoPile: [],
                };
            }

            return {
                ...post,
                paused: false,
            };
        });
    }

    function handleUndo() {
        setGame((prev) => {
            if (!prev?.undoPile || prev.undoPile.length <= 0) {
                return prev;
            }

            const newGame = prev.undoPile[prev.undoPile.length - 1];

            return {
                ...newGame,
                undoPile: prev.undoPile.slice(0, -1),
                redoPile: [
                    ...prev.redoPile,
                    { ...prev, undoPile: [], redoPile: [], simGame: null },
                ],
                simSpecs: prev.simSpecs
                    ? {
                          ...prev.simSpecs,
                          action: null,
                      }
                    : null,
                speed: prev.speed,
                paused: prev.paused,
            };
        });
    }

    function handleRedo() {
        setGame((prev) => {
            if (!prev?.redoPile || prev.redoPile.length <= 0) {
                return prev;
            }

            const newGame = prev.redoPile[prev.redoPile.length - 1];

            return {
                ...newGame,
                redoPile: prev.redoPile.slice(0, -1),
                undoPile: [
                    ...prev.undoPile,
                    { ...prev, undoPile: [], redoPile: [], simGame: null },
                ],
                simSpecs: prev.simSpecs
                    ? {
                          ...prev.simSpecs,
                          action: null,
                      }
                    : null,
                speed: prev.speed,
                paused: prev.paused,
            };
        });
    }

    function handleDistributionModeChange(newMode, entityKey) {
        setGame((prev) => ({
            ...prev,
            entities: {
                ...prev.entities,
                [entityKey]: {
                    ...distributePoints(
                        { ...prev.entities[entityKey] },
                        newMode,
                        presetAi[prev.entities[entityKey].controller].best,
                    ),
                    controller: prev.entities[entityKey].controller,
                    statDistributionMode: newMode,
                },
            },
        }));
    }

    const handleAiChange = (controllerKey, entityKey) => {
        setGame((prev) => {
            const currentMode = prev.entities[entityKey].statDistributionMode;

            let updatedEntity = {
                ...prev.entities[entityKey],
                controller: controllerKey,
            };

            if (currentMode === sdmKeys.BEST) {
                if (controllerKey === aiKeys.HUMAN) {
                    updatedEntity = {
                        ...updatedEntity,
                        ...distributePoints(
                            updatedEntity,
                            sdmKeys.CUSTOM,
                            presetAi[controllerKey].best,
                        ),
                        statDistributionMode: sdmKeys.CUSTOM,
                    };
                } else {
                    updatedEntity = {
                        ...updatedEntity,
                        ...distributePoints(
                            updatedEntity,
                            currentMode,
                            presetAi[controllerKey].best,
                        ),
                    };
                }
            }

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [entityKey]: updatedEntity,
                },
            };
        });
    };

    function handleResetGame() {
        setGame((prev) => {
            return resetGameState(prev);
        });
    }

    function handleHardResetGame() {
        localStorage.removeItem("gameProgression");
        localStorage.removeItem("gameCheckpoint");
        setGame({ ...INITIAL_GAME_STATE });
    }

    function handleStart() {
        setGame((prev) => {
            const startingPlayer =
                prev.whoStarts === whoStartsKeys.PLAYER_ONE ||
                (Math.random() < 0.5 && prev.whoStarts === whoStartsKeys.RANDOM)
                    ? entityKeys.PLAYER_ONE
                    : entityKeys.PLAYER_TWO;

            return buildHistory(
                {
                    ...prev,
                    paused: false,
                    status: turnStatus.ONGOING,
                    startingPlayer: startingPlayer,
                    undoPile: [],
                    redoPile: [],
                    aiQueue: [],
                },
                eventKeys.BATTLE_START,
            );
        });
    }

    function handleWhoStartsChange(value) {
        setGame((prev) => ({
            ...prev,
            whoStarts: value,
        }));
    }

    function handleStarChange(targetKey, starKey, value) {
        setGame((prev) => {
            const currWhite =
                prev.entities[targetKey].stars[effectKeys.WHITE_STAR];
            const currColor = prev.entities[targetKey].stars[starKey];

            const spent = Math.min(currWhite, Math.max(-currColor, value));

            const newWhite = currWhite - spent;
            const newColor = currColor + spent;

            const newGame = {
                ...prev,
                entities: {
                    ...prev.entities,
                    [targetKey]: {
                        ...prev.entities[targetKey],
                        stars: {
                            ...prev.entities[targetKey].stars,
                            [effectKeys.WHITE_STAR]: newWhite,
                            [starKey]: newColor,
                        },
                    },
                },
            };

            return buildRoundQueue(newGame);
        });
    }

    function handleProgressToggle() {
        setGame((prev) => {
            if (prev.status !== turnStatus.SETUP) {
                return prev;
            }

            if (prev.progressMode) {
                return {
                    ...prev,
                    progressMode: false,
                };
            } else {
                return {
                    ...prev,
                    progressMode: true,
                    whoStarts: whoStartsKeys.PLAYER_TWO,
                    entities: {
                        ...prev.entities,
                        [entityKeys.PLAYER_ONE]: {
                            ...prev.entities[entityKeys.PLAYER_ONE],
                            controller: aiKeys.HUMAN,
                            statDistributionMode:
                                prev.entities[entityKeys.PLAYER_ONE]
                                    .statDistributionMode === sdmKeys.BEST
                                    ? sdmKeys.CUSTOM
                                    : prev.entities[entityKeys.PLAYER_ONE]
                                          .statDistributionMode,
                        },
                        [entityKeys.PLAYER_TWO]: {
                            ...distributePoints(
                                createBaseEntity(),
                                sdmKeys.BEST,
                                presetAi[aiKeys.SIMPLE].best,
                            ),
                            controller: aiKeys.SIMPLE,
                            statDistributionMode: sdmKeys.BEST,
                        },
                    },
                };
            }
        });
    }

    function handleRandomizeStats(entityKey) {
        setGame((prev) => {
            let draftEntity = prev.entities[entityKey];

            draftEntity = distributePoints(
                draftEntity,
                draftEntity.statDistributionMode,
                presetAi[draftEntity.controller].best,
                true,
            );

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [entityKey]: {
                        ...draftEntity,
                    },
                },
            };
        });
    }

    function handleElementChange(entityKey, element) {
        setGame((prev) => {
            const currElements =
                prev.entities[entityKey][effectKeys.ELEMENTAL_CRYSTALS];

            let newElements = [...currElements];
            let draftEntity = {
                ...prev.entities[entityKey],
            };

            // Early return on shattered
            if (isElementActive(draftEntity, elementalKeys.SHATTERED)) {
                return prev;
            }

            // Process element change
            if (!newElements.includes(element)) {
                newElements.push(element);
            } else {
                newElements = newElements.filter((item) => {
                    return item !== element;
                });
            }

            // Process Health after possible Max Health alterations
            draftEntity = processHealth({
                ...draftEntity,
                [effectKeys.ELEMENTAL_CRYSTALS]: newElements,
            });

            return buildHistory(
                {
                    ...prev,
                    entities: {
                        ...prev.entities,
                        [entityKey]: {
                            ...draftEntity,
                        },
                    },
                },
                eventKeys.SET_ELEMENT,
                { player: entityKey },
            );
        });
    }

    function handleUpdateStatsPoints(targetKey, statusKey, value) {
        setGame((prev) => {
            const currUnspent = prev.entities[targetKey].unspentPoints;
            const currAttPoints =
                prev.entities[targetKey].attributes[statusKey].points;

            const spentPoints = Math.min(
                currUnspent,
                Math.max(-currAttPoints, value),
            );
            const newPoints = currUnspent - spentPoints;
            const newAttributePoints = currAttPoints + spentPoints;

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [targetKey]: {
                        ...prev.entities[targetKey],
                        unspentPoints: newPoints,
                        attributes: {
                            ...prev.entities[targetKey].attributes,
                            [statusKey]: {
                                ...prev.entities[targetKey].attributes[
                                    statusKey
                                ],
                                value: newAttributePoints,
                                points: newAttributePoints,
                            },
                        },
                    },
                },
            };
        });
    }

    function handleConstellation(entityKey, constellation) {
        setGame((prev) => {
            let draftEntity = {
                ...prev.entities[entityKey],
            };

            switch (constellation) {
                case effectKeys.AZURE_CONSTELLATION: {
                    // If already Azure, convert all into normal
                    if (draftEntity[effectKeys.AZURE_CONSTELLATION] > 0) {
                        draftEntity = {
                            ...draftEntity,
                            [effectKeys.CONSTELLATION]:
                                draftEntity[effectKeys.CONSTELLATION] +
                                draftEntity[effectKeys.AZURE_CONSTELLATION] +
                                draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                            [effectKeys.AZURE_CONSTELLATION]: 0,
                            [effectKeys.CRIMSON_CONSTELLATION]: 0,
                        };
                    }
                    // if not, convert all into azure
                    else {
                        draftEntity = {
                            ...draftEntity,
                            [effectKeys.CONSTELLATION]: 0,
                            [effectKeys.AZURE_CONSTELLATION]:
                                draftEntity[effectKeys.CONSTELLATION] +
                                draftEntity[effectKeys.AZURE_CONSTELLATION] +
                                draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                            [effectKeys.CRIMSON_CONSTELLATION]: 0,
                        };
                    }
                    break;
                }

                case effectKeys.CRIMSON_CONSTELLATION: {
                    // If already Crimson, convert all into normal
                    if (draftEntity[effectKeys.CRIMSON_CONSTELLATION] > 0) {
                        draftEntity = {
                            ...draftEntity,
                            [effectKeys.CONSTELLATION]:
                                draftEntity[effectKeys.CONSTELLATION] +
                                draftEntity[effectKeys.AZURE_CONSTELLATION] +
                                draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                            [effectKeys.AZURE_CONSTELLATION]: 0,
                            [effectKeys.CRIMSON_CONSTELLATION]: 0,
                        };
                    }
                    // if not, convert all into crimson
                    else {
                        draftEntity = {
                            ...draftEntity,
                            [effectKeys.CONSTELLATION]: 0,
                            [effectKeys.AZURE_CONSTELLATION]: 0,
                            [effectKeys.CRIMSON_CONSTELLATION]:
                                draftEntity[effectKeys.CONSTELLATION] +
                                draftEntity[effectKeys.AZURE_CONSTELLATION] +
                                draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                        };
                    }
                    break;
                }
                // by default, convert all into normal
                default: {
                    draftEntity = {
                        ...draftEntity,
                        [effectKeys.CONSTELLATION]:
                            draftEntity[effectKeys.CONSTELLATION] +
                            draftEntity[effectKeys.AZURE_CONSTELLATION] +
                            draftEntity[effectKeys.CRIMSON_CONSTELLATION],
                        [effectKeys.AZURE_CONSTELLATION]: 0,
                        [effectKeys.CRIMSON_CONSTELLATION]: 0,
                    };
                }
            }

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [entityKey]: {
                        ...draftEntity,
                    },
                },
            };
        });
    }

    function handlePause() {
        setGame((prev) => {
            return {
                ...prev,
                paused: !prev?.paused,
            };
        });
    }

    function handleSpeed(value) {
        setGame((prev) => {
            const currSpeed = prev.speed;
            const keys = Object.keys(gameSpeeds);
            const index = keys.indexOf(currSpeed);

            // Fallback
            if (index === -1) {
                return {
                    ...prev,
                    speed: keys[0],
                };
            }

            let nextIndex = (index + value) % keys.length;

            if (nextIndex < 0) {
                nextIndex += keys.length;
            }

            return {
                ...prev,
                speed: keys[nextIndex],
            };
        });
    }

    function handleSpeedAbs(key) {
        setGame((prev) => {
            if (!Object.values(speedKeys).includes(key)) {
                return prev;
            }

            return {
                ...prev,
                speed: key,
            };
        });
    }

    function handleCelestialStars(entityKey, amount, starKey) {
        setGame((prev) => {
            let post = {
                ...prev,
            };

            let draftEntity = extractEntity(post, entityKey);

            let starsUsed = Math.min(amount, draftEntity?.[starKey] ?? 0);
            if (starKey === effectKeys.STARS_OF_APOCALYPSE) {
                starsUsed = Math.max(
                    0,
                    Math.min(starsUsed, getTotalEnlit(draftEntity) - 1),
                );
            }

            if (starsUsed <= 0) {
                return prev;
            }

            draftEntity = {
                ...draftEntity,
                [starKey]: draftEntity[starKey] - starsUsed,
            };

            post = replaceEntity(post, draftEntity, entityKey);

            if (starKey === effectKeys.STARS_OF_APOCALYPSE) {
                post = newDealDmg(
                    post,
                    starsUsed,
                    [entityKeys.PLAYER_ONE, entityKeys.PLAYER_TWO],
                    tarnishTypes.TRUE,
                );
            } else if (starKey === effectKeys.STARS_OF_GENESIS) {
                let p1 = restoreResources(
                    extractEntity(post, entityKeys.PLAYER_ONE),
                    starsUsed,
                );
                post = replaceEntity(post, p1, entityKeys.PLAYER_ONE);

                let p2 = restoreResources(
                    extractEntity(post, entityKeys.PLAYER_TWO),
                    starsUsed,
                );
                post = replaceEntity(post, p2, entityKeys.PLAYER_TWO);
            } else {
                return post;
            }

            return processDeathCheck(post);
        });
    }

    function handleBlasphemy(agentKey, nonAgentKey, index) {
        setGame((prev) => {
            let post = {
                ...prev,
            };
            let draftEntity = extractEntity(post, agentKey);

            const oldCodex = draftEntity?.[effectKeys.CODEX_OF_BLASPHEMY] || [];
            const blas = oldCodex[index];

            if (!blas || blas === blasphemyKeys.NONE) {
                return post;
            }

            const remaining = oldCodex.filter(
                (item, i) => i !== index && item !== blasphemyKeys.NONE,
            );

            const newCodex = [
                remaining[2] || blasphemyKeys.NONE,
                remaining[1] || blasphemyKeys.NONE,
                remaining[0] || blasphemyKeys.NONE,
            ];

            draftEntity = {
                ...draftEntity,
                [effectKeys.CODEX_OF_BLASPHEMY]: newCodex,
            };

            post = replaceEntity(post, draftEntity, agentKey);
            post = expungeBlas(post, agentKey, nonAgentKey, blas);

            return post;
        });
    }

    function handleEdict(agentKey, edict) {
        setGame((prev) => {
            let draftAgent = extractEntity(prev, agentKey);

            if (!isEdictUnlocked(draftAgent, edict)) {
                return prev;
            }

            draftAgent = {
                ...draftAgent,
                edicts: {
                    ...draftAgent.edicts,
                    [edict]: !draftAgent.edicts[edict],
                },
            };

            return replaceEntity(prev, draftAgent, agentKey);
        });
    }

    // === Efeitos ===
    // Turn Management
    useEffect(() => {
        if (game.paused) {
            return;
        }

        if (game.status === turnStatus.ONGOING) {
            // Rebuilds the queue
            let gameState = {
                ...game,
                roundIndex: game.roundIndex ? game.roundIndex : 0,
            };
            gameState = buildRoundQueue(gameState);

            // Grab current phase
            const currPhase = gameState.roundQueue[gameState.roundIndex];
            let targetKey = null;
            let nonTargetKey = null;
            let nextState = null;
            let delayAmount = 0;
            let historyKey = null;

            switch (currPhase) {
                case roundPhases.ROUND_START: {
                    nextState = {
                        ...gameState,
                        roundCount: gameState.roundCount + 1,
                        roundIndex: gameState.roundIndex + 1,
                    };
                    delayAmount =
                        gameState.roundCount > 0
                            ? 600 * gameSpeeds[game.speed].mod
                            : 0;
                    historyKey = eventKeys.ROUND_START;
                    break;
                }

                case roundPhases.MOON_TURN: {
                    nextState = processMoonPhase(gameState);
                    delayAmount = 800 * gameSpeeds[game.speed].mod;
                    historyKey = eventKeys.MOON_PHASE;
                    break;
                }

                case roundPhases.ANOINTMENT: {
                    nextState = processAnointment(gameState);
                    delayAmount = 800 * gameSpeeds[game.speed].mod;
                    historyKey = eventKeys.ANOINTMENT;
                    break;
                }

                case roundPhases.P1_STARS_TURN: {
                    targetKey = entityKeys.PLAYER_ONE;
                    nonTargetKey = entityKeys.PLAYER_TWO;
                    historyKey = null;
                    break;
                }

                case roundPhases.P2_STARS_TURN: {
                    targetKey = entityKeys.PLAYER_TWO;
                    nonTargetKey = entityKeys.PLAYER_ONE;
                    historyKey = null;
                    break;
                }

                case roundPhases.PLAYER_ONE_TURN: {
                    targetKey = entityKeys.PLAYER_ONE;
                    nonTargetKey = entityKeys.PLAYER_TWO;
                    historyKey = null;
                    break;
                }

                case roundPhases.PLAYER_TWO_TURN: {
                    targetKey = entityKeys.PLAYER_TWO;
                    nonTargetKey = entityKeys.PLAYER_ONE;
                    historyKey = null;
                    break;
                }

                case roundPhases.P1_SINGULARITY: {
                    targetKey = entityKeys.PLAYER_ONE;
                    nonTargetKey = entityKeys.PLAYER_TWO;
                    historyKey = eventKeys.SINGULARITY;
                    break;
                }

                case roundPhases.P2_SINGULARITY: {
                    targetKey = entityKeys.PLAYER_TWO;
                    nonTargetKey = entityKeys.PLAYER_ONE;
                    historyKey = eventKeys.SINGULARITY;
                    break;
                }

                case roundPhases.ROUND_END: {
                    nextState = {
                        ...gameState,
                        roundIndex: 0,
                    };
                    delayAmount = 600 * gameSpeeds[game.speed].mod;
                    historyKey = null;
                    break;
                }
            }

            // starfall
            if (
                !nextState &&
                (currPhase === roundPhases.P1_STARS_TURN ||
                    currPhase === roundPhases.P2_STARS_TURN)
            ) {
                if (!gameState.starQueue) {
                    const newQueue = Object.values(starfallPhases);
                    nextState = {
                        ...gameState,
                        starQueue: newQueue,
                    };
                    historyKey = eventKeys.STARFALL_START;
                } else {
                    nextState = processStarfallTurn(
                        gameState,
                        targetKey,
                        nonTargetKey,
                    );
                }
            }

            // player turn
            if (
                !nextState &&
                (currPhase === roundPhases.PLAYER_ONE_TURN ||
                    currPhase === roundPhases.PLAYER_TWO_TURN)
            ) {
                if (
                    !gameState.playerQueue ||
                    gameState.playerQueue.length === 0
                ) {
                    nextState = {
                        ...gameState,
                        playerQueue: Object.values(playerTurnPhases),
                    };
                    historyKey = eventKeys.PLAYER_TURN_START;
                } else {
                    const currPlayerPhase = gameState.playerQueue[0];

                    if (currPlayerPhase === playerTurnPhases.UPKEEP) {
                        nextState = processUpkeep(
                            gameState,
                            targetKey,
                            nonTargetKey,
                        );
                        delayAmount = 0;
                    }

                    if (currPlayerPhase === playerTurnPhases.COMMIT) {
                        const currEntity = game?.entities?.[targetKey];
                        const willTriggerRevelevantTurnEndEffects =
                            currEntity &&
                            (currEntity.resources[effectKeys.RADIANCE] > 0 ||
                                currEntity.resources[effectKeys.MOONSHINE] >
                                    0 ||
                                currEntity.resources[effectKeys.MANA_OVERFLOW] >
                                    0 ||
                                currEntity.resources[effectKeys.SACRED_FLAMES] >
                                    0 ||
                                currEntity.resources[effectKeys.SACRILEGE] >
                                    0 ||
                                currEntity.resources[effectKeys.COVENANT] > 0 ||
                                currEntity.resources[effectKeys.MARTHYR] > 0 ||
                                currEntity[effectKeys.BAD_OMEN] > 0);

                        nextState = commitTurn(
                            gameState,
                            targetKey,
                            nonTargetKey,
                        );
                        delayAmount = willTriggerRevelevantTurnEndEffects
                            ? 800 * gameSpeeds[game.speed].mod
                            : 0;
                    }
                }
            }

            // Fallback
            if (!nextState) {
                nextState = game;
            }

            // History
            nextState = buildHistory(buildRoundQueue(nextState), historyKey, {
                player: targetKey,
            });

            // Clear Sim
            nextState = {
                ...nextState,
                simGame: null,
            };

            const timer = setTimeout(() => {
                setGame(nextState);
            }, delayAmount);

            return () => {
                if (timer) {
                    clearTimeout(timer);
                }
            };
        }
    }, [
        game.status,
        game.roundIndex,
        game.playerQueue,
        game.starQueue,
        game.paused,
    ]);

    // AI Controller
    useEffect(() => {
        if (game.paused || !getCurrActivePlayer(game)) {
            return;
        }

        const targetKey = getCurrActivePlayer(game);
        const nonTargetKey = getOtherEntity(targetKey);
        const activePlayer = game.entities[targetKey];

        if (
            canUseCombatInteractions(game, targetKey, true, false) &&
            activePlayer.controller !== aiKeys.HUMAN
        ) {
            let delay = 0;
            const command = game?.aiQueue?.[0];

            switch (command?.type) {
                case commandKeys.USE_ACTION:
                case commandKeys.USE_CELESTIAL_STARS:
                case commandKeys.EXPUNGE_BLAS: {
                    delay = 1200;
                    break;
                }
                case commandKeys.SET_CONSTELLATION:
                case commandKeys.SET_EDICTS:
                case commandKeys.SET_ELEMENT:
                case commandKeys.ASSIGN_STARS: {
                    delay = 900;
                    break;
                }
                default:
                    break;
            }

            const aiTimer = setTimeout(async () => {
                // Await the async result first so setGame receives clean state object, not a Promise
                const updatedGame = await centralAIManagement(
                    game,
                    targetKey,
                    nonTargetKey,
                );
                setGame(updatedGame);
            }, delay * gameSpeeds[game.speed].mod);

            return () => {
                clearTimeout(aiTimer);
            };
        }
    }, [
        game.status,
        game.roundIndex,
        game.paused,
        game.aiQueue?.length,
        game.playerQueue?.length,
        game.entities,
        game.roundQueue?.length,
        getCurrActivePlayer(game),
    ]);

    // Round Transition
    useEffect(() => {
        if (game.paused) {
            return;
        }

        if (game.status === turnStatus.ROUND_TRANSITION) {
            const timer = setTimeout(() => {
                setGame((prev) => ({
                    ...prev,
                    status: turnStatus.ONGOING,
                    roundIndex: prev.roundIndex + 1,
                }));
            }, 900 * gameSpeeds[game.speed].mod);

            return () => clearTimeout(timer);
        }
    }, [game.status, game.paused]);

    // Starfall Transition
    useEffect(() => {
        if (game.paused) {
            return;
        }

        if (game.status === turnStatus.STARFALL_TRANSITION) {
            const timer = setTimeout(() => {
                setGame((prev) => ({
                    ...prev,
                    status: turnStatus.ONGOING,
                }));
            }, 700 * gameSpeeds[game.speed].mod);

            return () => clearTimeout(timer);
        }
    }, [game.status, game.paused]);

    // Save Game
    useEffect(() => {
        if (game.paused) {
            return;
        }

        // Progression Data
        if (game.progressStatus) {
            try {
                localStorage.setItem(
                    "gameProgression",
                    JSON.stringify(game.progressStatus),
                );
            } catch (error) {
                console.error("Failed to save progression:", error);
            }
        }

        // Match Data
        if (CHECKPOINT_STATES.includes(game.status)) {
            try {
                localStorage.setItem(
                    "gameCheckpoint",
                    JSON.stringify({ ...game, simGame: null }),
                );
                console.log("Game Saved!");
            } catch (error) {
                console.error("Failed to save game checkpoint:", error);
            }
        }
    }, [game]);

    // Update simulation
    const simGame = useMemo(() => {
        let sim = null;

        const agentKey = getCurrActivePlayer(game);
        const nonAgentKey = !agentKey
            ? null
            : agentKey === entityKeys.PLAYER_ONE
              ? entityKeys.PLAYER_TWO
              : entityKeys.PLAYER_ONE;

        const currPhase = game.roundQueue && game.roundQueue[game.roundIndex];

        if (
            !agentKey ||
            !nonAgentKey ||
            !(
                game?.entities?.[agentKey]?.[effectKeys.CONTROLLER] ===
                aiKeys.HUMAN
            ) ||
            (!game?.playerQueue?.[0] === playerTurnPhases.PLAN &&
                !playerMap?.[agentKey]?.extra?.includes(currPhase))
        ) {
            return null;
        }

        if (game?.simSpecs?.blasphemy) {
            sim = processDeathCheck(
                buildRoundQueue(
                    expungeBlas(
                        sim ? sim : game,
                        agentKey,
                        nonAgentKey,
                        game.simSpecs.blasphemy,
                    ),
                ),
            );
        }

        if (game?.simSpecs?.action) {
            sim = processDeathCheck(
                buildRoundQueue(
                    processActionUse(
                        sim ? sim : game,
                        agentKey,
                        nonAgentKey,
                        game.simSpecs.action,
                    ),
                ),
            );

            const isExtraTurn = playerMap[agentKey].extra.includes(currPhase);

            sim = isExtraTurn
                ? processExtraTurn(sim, agentKey, game.simSpecs.action)
                : processPlan(sim, agentKey, game.simSpecs.action);
        }

        if (game?.simSpecs?.commit) {
            sim = buildRoundQueue(
                commitTurn(sim ? sim : game, agentKey, nonAgentKey),
            );
        }

        if (game?.simSpecs?.starfall) {
            sim = buildRoundQueue(
                simulateFullStarfall(sim ? sim : game, agentKey, nonAgentKey),
            );
        }

        return sim;
    }, [game]);

    // Create Context
    const contextValue = useMemo(
        () => ({
            game: {
                ...game,
                simGame,
            },
            setGame,
            handleAction,
            handleAiChange,
            handleConstellation,
            handleDistributionModeChange,
            handleElementChange,
            handleHardResetGame,
            handleProgressToggle,
            handleRandomizeStats,
            handleResetGame,
            handleStarChange,
            handleStart,
            handleUpdateStatsPoints,
            handleWhoStartsChange,
            handlePause,
            handleSpeed,
            handleSpeedAbs,
            handleUndo,
            handleRedo,
            handleCelestialStars,
            handleBlasphemy,
            handleEdict,
        }),
        [game, simGame],
    );

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
}
