/* global process */
import { centralAIManagement } from "./aiControllers";
import { ATTRIBUTE_NAMES, constants, INITIAL_GAME_STATE, playerMap } from "./constants";
import {
    canUseCombatInteractions,
    extractEntity,
    getCurrActivePlayer,
    getOtherEntity,
    replaceEntity,
} from "./entities";
import {
    aiKeys,
    effectKeys,
    entityKeys,
    playerTurnPhases,
    roundPhases,
    starfallPhases,
    turnStatus,
    whoStartsKeys,
} from "./enums";
import {
    buildRoundQueue,
    commitTurn,
    processAnointment,
    processExtraTurn,
    processMoonPhase,
    processPlan,
    processReckoning,
    processStarfallTurn,
    processUpkeep,
    startGame,
} from "./turnManagement";
import fs from "node:fs";

const ATTR_DIST = [
    {
        name: "full-str",
        [effectKeys.STR]: 10,
        [effectKeys.DEF]: 0,
    },
    {
        name: "full-def",
        [effectKeys.STR]: 0,
        [effectKeys.DEF]: 10,
    },
    {
        name: "balanced",
        [effectKeys.STR]: 5,
        [effectKeys.DEF]: 5,
    },
];

const AI_LIST = [
    aiKeys.WARLOCK,
    aiKeys.BLOODKNIGHT,
    aiKeys.PALADIN,
    aiKeys.SHADOW_SORCERER,
    aiKeys.CYBORG,
    aiKeys.MAESTRO,
    aiKeys.AUGUR,
    aiKeys.VOYAGER,
    aiKeys.LUNATIC,
    aiKeys.SERAPH,
];

function generateMatchConfigs() {
    let matches = [];

    for (let p1Controller of AI_LIST) {
        for (let p2Controller of AI_LIST) {
            for (let p1AttrDist of ATTR_DIST) {
                for (let p2AttrDist of ATTR_DIST) {
                    matches = [
                        ...matches,
                        {
                            p1Controller: p1Controller,
                            p2Controller: p2Controller,
                            p1AttrDist: {
                                ...p1AttrDist,
                            },
                            p2AttrDist: {
                                ...p2AttrDist,
                            },
                            whoStarts: whoStartsKeys.PLAYER_ONE,
                        },
                    ];
                }
            }
        }
    }

    return matches;
}

const MAX_MATCH_LENGTH_MS = 30000;
const MAX_MATCH_LENGTH_ROUNDS = 50;
const MAX_STALLED_TICKS = 3;

// Synchronous port of the "Turn Management" effect in GameProvider.
// Returns the next state, or null if nothing should happen
function advanceTurnManagement(game) {
    let gameState = {
        ...game,
        roundIndex: game.roundIndex ? game.roundIndex : 0,
    };
    gameState = buildRoundQueue(gameState);

    const currPhase = gameState.roundQueue[gameState.roundIndex];
    let targetKey = null;
    let nonTargetKey = null;
    let nextState = null;

    switch (currPhase) {
        case roundPhases.ROUND_START:
            nextState = {
                ...gameState,
                roundCount: gameState.roundCount + 1,
                roundIndex: gameState.roundIndex + 1,
            };
            break;

        case roundPhases.MOON_TURN:
            nextState = processMoonPhase(gameState);
            break;

        case roundPhases.ANOINTMENT:
            nextState = processAnointment(gameState);
            break;

        case roundPhases.RECKONING:
            nextState = processReckoning(gameState);
            break;

        case roundPhases.ROUND_END:
            nextState = { ...gameState, roundIndex: 0 };
            break;

        case roundPhases.P1_STARS_TURN:
        case roundPhases.PLAYER_ONE_TURN:
            targetKey = entityKeys.PLAYER_ONE;
            nonTargetKey = entityKeys.PLAYER_TWO;
            break;

        case roundPhases.P2_STARS_TURN:
        case roundPhases.PLAYER_TWO_TURN:
            targetKey = entityKeys.PLAYER_TWO;
            nonTargetKey = entityKeys.PLAYER_ONE;
            break;

        // Singularity phases are driven entirely by the AI command queue
        default:
            break;
    }

    // Starfall
    if (
        !nextState &&
        (currPhase === roundPhases.P1_STARS_TURN ||
            currPhase === roundPhases.P2_STARS_TURN)
    ) {
        if (!gameState.starQueue) {
            nextState = {
                ...gameState,
                starQueue: Object.values(starfallPhases),
            };
        } else {
            nextState = processStarfallTurn(gameState, targetKey, nonTargetKey);
        }
    }

    // Player turn
    if (
        !nextState &&
        (currPhase === roundPhases.PLAYER_ONE_TURN ||
            currPhase === roundPhases.PLAYER_TWO_TURN)
    ) {
        if (!gameState.playerQueue || gameState.playerQueue.length === 0) {
            nextState = {
                ...gameState,
                playerQueue: Object.values(playerTurnPhases),
            };
        } else {
            const currPlayerPhase = gameState.playerQueue[0];

            if (currPlayerPhase === playerTurnPhases.UPKEEP) {
                nextState = processUpkeep(gameState, targetKey, nonTargetKey);
            } else if (currPlayerPhase === playerTurnPhases.COMMIT) {
                nextState = commitTurn(gameState, targetKey, nonTargetKey);
            }
        }
    }

    // if a player is blocked
    const actvPlayer = getCurrActivePlayer(gameState);
    if (
        !nextState &&
        actvPlayer &&
        !canUseCombatInteractions(gameState, actvPlayer, true, false)
    ) {
        // Turn
        const currPlayerPhase = gameState?.playerQueue?.[0];
        if (
            [roundPhases.PLAYER_ONE_TURN, roundPhases.PLAYER_TWO_TURN].includes(
                currPhase,
            ) &&
            currPlayerPhase === playerTurnPhases.PLAN
        ) {
            nextState = processPlan(gameState, actvPlayer, null);
        }

        // Extra Turn
        if (playerMap[actvPlayer].extra.includes(currPhase)) {
            nextState = processExtraTurn(gameState, actvPlayer, null);
        }
    }

    if (!nextState) {
        return null;
    }

    nextState = buildRoundQueue(nextState);

    return { ...nextState, simGame: null };
}

// One tick of the simulation (replaces all the effects + timers)
async function stepSimulation(sim) {
    // Transitions (the timer-only effects)
    if (sim.status === turnStatus.ROUND_TRANSITION) {
        return {
            ...sim,
            status: turnStatus.ONGOING,
            roundIndex: sim.roundIndex + 1,
        };
    }

    if (sim.status === turnStatus.STARFALL_TRANSITION) {
        return { ...sim, status: turnStatus.ONGOING };
    }

    if (sim.status !== turnStatus.ONGOING) {
        return sim;
    }

    // AI controller (same gate as the AI effect)
    const targetKey = getCurrActivePlayer(sim);
    if (
        targetKey &&
        canUseCombatInteractions(sim, targetKey, true, false) &&
        sim.entities[targetKey].controller !== aiKeys.HUMAN
    ) {
        return await centralAIManagement(
            sim,
            targetKey,
            getOtherEntity(targetKey),
        );
    }

    // Otherwise, the game advances on its own
    return advanceTurnManagement(sim);
}

async function simulateMatch(matchInit) {
    const t0 = Date.now();
    let t1 = t0;

    const endMatch = (sim) => {
        return (
            !sim?.status ||
            [turnStatus.DRAW, turnStatus.DEFEAT, turnStatus.VICTORY].includes(
                sim?.status,
            ) ||
            t1 - t0 > MAX_MATCH_LENGTH_MS ||
            (sim?.roundCount ?? MAX_MATCH_LENGTH_ROUNDS + 1) >
                MAX_MATCH_LENGTH_ROUNDS
        );
    };

    let sim = startGame(matchInit);
    let stalledTicks = 0;

    while (!endMatch(sim)) {
        t1 = Date.now();

        const next = await stepSimulation(sim);

        // Guard against waiting forever on a command that never comes
        if (!next || next === sim) {
            stalledTicks++;
            if (stalledTicks >= MAX_STALLED_TICKS) {
                console.warn("Match stalled:", {
                    p1: sim?.entities?.[entityKeys.PLAYER_ONE]?.controller,
                    p2: sim?.entities?.[entityKeys.PLAYER_TWO]?.controller,
                    round: sim?.roundCount,
                    phase: sim?.roundQueue?.[sim?.roundIndex],
                    ms: Date.now() - t0,
                });
                break;
            }
            continue;
        }

        stalledTicks = 0;
        sim = next;
    }

    return sim;
}

function configureMatch(matchConfig) {
    let sim = {
        ...INITIAL_GAME_STATE,
        whoStarts: matchConfig.whoStarts,
    };

    // P1 Attributes & Controller
    let p1 = extractEntity(sim, entityKeys.PLAYER_ONE);
    p1 = {
        ...p1,
        controller: matchConfig.p1Controller,
        attributes: {},
        unspentPoints: constants.INITIAL_POINTS_AVAILABLE,
    };

    for (let attr of ATTRIBUTE_NAMES) {
        const points = Math.min(
            matchConfig?.p1AttrDist?.[attr] ?? 0,
            p1.unspentPoints,
        );

        p1 = {
            ...p1,
            attributes: {
                ...p1.attributes,
                [attr]: {
                    ...p1.attributes[attr],
                    points: points,
                    value: points,
                },
            },
            unspentPoints: p1.unspentPoints - matchConfig.p1AttrDist[attr],
        };
    }

    sim = replaceEntity(sim, p1, entityKeys.PLAYER_ONE);

    // P2 Attributes & Controller
    let p2 = extractEntity(sim, entityKeys.PLAYER_TWO);
    p2 = {
        ...p2,
        controller: matchConfig.p2Controller,
        attributes: {},
        unspentPoints: constants.INITIAL_POINTS_AVAILABLE,
    };

    for (let attr of ATTRIBUTE_NAMES) {
        const points = Math.min(
            matchConfig?.p2AttrDist?.[attr] ?? 0,
            p2.unspentPoints,
        );

        p2 = {
            ...p2,
            attributes: {
                ...p2.attributes,
                [attr]: {
                    ...p2.attributes[attr],
                    points: points,
                    value: points,
                },
            },
            unspentPoints: p2.unspentPoints - matchConfig.p2AttrDist[attr],
        };
    }

    sim = replaceEntity(sim, p2, entityKeys.PLAYER_TWO);

    return sim;
}

function extractMatchInfo(simMatch, matchConfig, time) {
    return {
        p1Controller: matchConfig.p1Controller,
        p2Controller: matchConfig.p2Controller,
        p1AttrDist: matchConfig.p1AttrDist.name,
        p2AttrDist: matchConfig.p2AttrDist.name,
        status: simMatch.status,
        rounds: simMatch.roundCount,
        ms: time,
    };
}

// ---------- Runner ----------

const CSV_COLUMNS = [
    "p1Controller",
    "p2Controller",
    "p1AttrDist",
    "p2AttrDist",
    "status",
    "rounds",
    "ms",
];

function toCsv(rows) {
    const escape = (value) => {
        const s = value === null || value === undefined ? "" : String(value);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    return (
        [
            CSV_COLUMNS.join(","),
            ...rows.map((row) =>
                CSV_COLUMNS.map((col) => escape(row[col])).join(","),
            ),
        ].join("\n") + "\n"
    );
}

function formatDuration(ms) {
    const totalSeconds = Math.round(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function renderProgress(done, total, startedAt) {
    const width = 30;
    const ratio = total > 0 ? done / total : 1;
    const filled = Math.round(width * ratio);
    const bar = "█".repeat(filled) + "░".repeat(width - filled);
    const elapsed = Date.now() - startedAt;
    const eta = done > 0 ? (elapsed / done) * (total - done) : 0;

    process.stdout.write(
        `\r${bar} ${done}/${total} (${(ratio * 100).toFixed(1)}%)` +
            ` | elapsed ${formatDuration(elapsed)} | ETA ${formatDuration(eta)}   `,
    );
}

// Pushes into `results` as it goes so partial data survives Ctrl+C
async function simAllMatches({ results = [], onProgress = () => {} } = {}) {
    const matchesConfig = generateMatchConfigs();
    const errors = [];

    for (let i = 0; i < matchesConfig.length; i++) {
        const matchConfig = matchesConfig[i];

        try {
            const matchInit = configureMatch(matchConfig);
            const t0 = Date.now();
            const simMatch = await simulateMatch(matchInit);
            const t1 = Date.now();
            results.push(extractMatchInfo(simMatch, matchConfig, t1 - t0));
        } catch (error) {
            errors.push({ matchConfig, error });
            results.push({
                p1Controller: matchConfig.p1Controller,
                p2Controller: matchConfig.p2Controller,
                p1AttrDist: matchConfig.p1AttrDist.name,
                p2AttrDist: matchConfig.p2AttrDist.name,
                status: "",
                rounds: "",
            });
        }

        onProgress(i + 1, matchesConfig.length);

        // Yield to the event loop so the bar renders and Ctrl+C is handled
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return { results, errors };
}

async function main() {
    const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
    const outPath = process.argv[2] ?? `data/sim-results-${stamp}.csv`;

    const results = [];
    const startedAt = Date.now();

    process.on("SIGINT", () => {
        process.stdout.write("\n");
        fs.writeFileSync(outPath, toCsv(results));
        console.log(
            `Interrupted. Saved ${results.length} partial results to ${outPath}`,
        );
        process.exit(130);
    });

    console.log("Simulating matches...");
    renderProgress(0, generateMatchConfigs().length, startedAt);

    const { errors } = await simAllMatches({
        results,
        onProgress: (done, total) => renderProgress(done, total, startedAt),
    });

    fs.writeFileSync(outPath, toCsv(results));

    const elapsed = Date.now() - startedAt;
    const unfinished = results.filter((r) => ![turnStatus.DEFEAT, turnStatus.VICTORY].includes(r.status)).length;

    process.stdout.write("\n\n");
    console.log(
        `Done: ${results.length} matches in ${formatDuration(elapsed)}`,
    );
    console.log(
        `Avg per match: ${(elapsed / Math.max(results.length, 1)).toFixed(0)} ms`,
    );
    console.log(`Draw/Unfinished (stalled/timeout): ${unfinished}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Saved to ${outPath}`);

    if (errors.length > 0) {
        const { matchConfig, error } = errors[0];
        console.error(
            `\nFirst error (${matchConfig.p1Controller} vs ${matchConfig.p2Controller}):`,
        );
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
