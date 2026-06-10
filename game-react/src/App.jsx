/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import ControlPanel from "./components/ControlPanel.jsx";
import GamePanel from "./components/GamePanel.jsx";
import ActionPanel from "./components/ActionPanel.jsx";
import {
    simpleAI,
    bloodknightAI,
    paladinAI,
    hexerAI,
    warlockAI,
    adaptativeAI,
    shadowSorcererAI,
} from "./utils/aiControllers.js";
import { constants } from "./utils/constants.js";
import { processUpkeep, commitTurn } from "./utils/turnManagement.js";
import {
    applyStats,
    distribute_points,
    createBaseEntity,
    generateEntitiesForMode,
} from "./utils/entity.js";
import { simulators } from "./utils/simulators.js";

import "./App.css";

/*
Notes for self:
Effect activation order on turn start:
    1. Shackled Mana Distribution (if Array unactive)
    2. Shackled Mana Passive Increase (if Array active)
    2. Unrelenting Shadows resource restoration
    2. Shadowflame Resource Burn (if not in Dark Embrace and not in Dimming Darkness)
    3. Lingering Ember Passive Conversion
    2. Poison Damage (if not in Dimming Darkness)
    3. Mana Bleed (if not in Dimming Darkness)
Effect activation order on turn end:
    1. Shackle Mana conversion
    2. Mana Overflow Damage (if not in Dimming Darkness)
*/

function App() {
    // Declare states
    const [game, setGame] = useState({
        status: "setup",
        nextStatus: null,
        shacklingCurse: 0,
        statDistributionMode: "Random",
        entities: {
            player: {
                ...distribute_points(createBaseEntity()),
                controller: "human",
                key: "_player",
            },
            enemy: {
                ...distribute_points(createBaseEntity()),
                controller: "simple",
                key: "_enemy",
            },
        },
    });

    const actionHandles = {
        handleAttack,
        handleHeal,
        handleGuard,
        handleSpecialAttack,
        handleSacrifice,
        handleCurse,
        handleAegis,
        handleArray,
        handleShadowPact,
        handleShadowMantle,
        handleRitualOfAsh,
        handleDarkPromise,
        handleBlackMayhem,
        handleLaser,
    };

    // Handles
    function handleAttack(attackerKey, defenderKey) {
        console.log("Used: Atk");
        setGame((prev) => {
            const arrayActive = prev.remainingArray > 0;

            const attacker = prev.entities[attackerKey];
            const defender = prev.entities[defenderKey];

            const draftEntities = simulators.simulateAttack(
                attacker,
                attackerKey,
                defender,
                defenderKey,
                arrayActive,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "atk",
            );
        });
    }

    function handleSpecialAttack(attackerKey, defenderKey) {
        console.log("Used: SpAtk");
        setGame((prev) => {
            const attacker = prev.entities[attackerKey];
            const defender = prev.entities[defenderKey];

            const draftEntities = simulators.simulateSpecialAttack(
                attacker,
                attackerKey,
                defender,
                defenderKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "spAtk",
            );
        });
    }

    function handleHeal(targetKey, nonTargetKey) {
        console.log("Used: Heal");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            const draftEntities = simulators.simulateHeal(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "heal",
            );
        });
    }

    function handleGuard(targetKey, nonTargetKey) {
        console.log("Used: Guard");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            const draftEntities = simulators.simulateGuard(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "guard",
            );
        });
    }

    function handleSacrifice(targetKey, nonTargetKey) {
        console.log("Used: Sacrifice");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            const draftEntities = simulators.simulateSacrifice(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "sacrifice",
            );
        });
    }

    function handleCurse(targetKey, nonTargetKey) {
        console.log("Used: Curse");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            let draftEntities = simulators.simulateCurse(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "curse",
            );
        });
    }

    function handleAegis(targetKey, nonTargetKey) {
        console.log("Used: Aegis");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            const draftEntities = simulators.simulateAegis(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "aegis",
            );
        });
    }

    function handleArray(targetKey, nonTargetKey) {
        console.log("Used: Array");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            let draftEntities = simulators.simulateArray(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "array",
            );
        });
    }

    function handleShadowPact(targetKey, nonTargetKey) {
        console.log("Used: Shadow Pact");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            console.log(target);

            let draftEntities = simulators.simulateShadowPact(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            console.log(draftEntities);

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "shadowPact",
            );
        });
    }

    function handleShadowMantle(targetKey, nonTargetKey) {
        console.log("Used: Shadow Mantle");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            let draftEntities = simulators.simulateShadowMantle(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "shadowMantle",
            );
        });
    }

    function handleRitualOfAsh(targetKey, nonTargetKey) {
        console.log("Used: Ritual of Ash");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            let draftEntities = simulators.simulateRitualOfAsh(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "ritualOfAsh",
            );
        });
    }

    function handleBlackMayhem(targetKey, nonTargetKey) {
        console.log("Used: Black Mayhem");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            let draftEntities = simulators.simulateBlackMayhem(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "blackMayhem",
            );
        });
    }

    function handleDarkPromise(targetKey, nonTargetKey) {
        console.log("Used: Dark Promise");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            let draftEntities = simulators.simulateDarkPromise(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "darkPromise",
            );
        });
    }

    function handleLaser(targetKey, nonTargetKey) {
        console.log("Used: Laser");
        setGame((prev) => {
            const target = prev.entities[targetKey];
            const nonTarget = prev.entities[nonTargetKey];

            let draftEntities = simulators.simulateLaser(
                target,
                targetKey,
                nonTarget,
                nonTargetKey,
            );

            const nextActorKey =
                prev.status === "playerturn" ? "enemy" : "player";
            const currActorKey =
                prev.status === "playerturn" ? "player" : "enemy";
            return commitTurn(
                prev,
                draftEntities,
                nextActorKey,
                currActorKey,
                "laser",
            );
        });
    }

    function handleDistributionModeChange(newMode) {
        setGame((prev) => ({
            ...prev,
            statDistributionMode: newMode,
            entities: generateEntitiesForMode(
                newMode,
                prev.entities.player.controller,
                prev.entities.enemy.controller,
            ),
        }));
    }

    function handleReset() {
        setGame((prev) => ({
            ...prev,
            status: "setup",
            remainingArray: 0,
            nextStatus: null,
            entities: generateEntitiesForMode(
                prev.statDistributionMode,
                prev.entities.player.controller,
                prev.entities.enemy.controller,
            ),
        }));
    }

    function handleStart() {
        const playerStats = applyStats(game.entities.player.attributes);
        const enemyStats = applyStats(game.entities.enemy.attributes);

        const firstTurn = "playerturn";

        setGame((prev) => ({
            ...prev,
            status: firstTurn,
            remainingArray: 0,
            entities: {
                player: {
                    ...prev.entities.player,
                    attributes: playerStats,
                },
                enemy: {
                    ...prev.entities.enemy,
                    attributes: enemyStats,
                },
            },
        }));
    }

    function handleAutoTurn(targetKey, nonTargetKey, personality) {
        console.log(personality);
        const target = game.entities[targetKey];
        const nonTarget = game.entities[nonTargetKey];
        const arrayActive = game.remainingArray > 0;
        const totalMana = target.currMana + target.manaOverflow;
        const hasManaForSpecial = totalMana >= constants.SP_ATTACK_COST;

        // Pack everything the AIs might need into a single object
        const context = {
            target,
            nonTarget,
            targetKey,
            nonTargetKey,
            arrayActive,
            totalMana,
            hasManaForSpecial,
            actions: actionHandles,
        };

        // Dispatcher
        const aiMap = {
            simple: simpleAI,
            bloodknight: bloodknightAI,
            paladin: paladinAI,
            hexer: hexerAI,
            warlock: warlockAI,
            adaptative: adaptativeAI,
            shadowSorcerer: shadowSorcererAI,
        };

        // Execute the matching AI, or default to simple if not found
        const executeAI = aiMap[personality] || simpleAI;
        console.log(executeAI);
        executeAI(context);
    }

    // Simulations

    // Other Auxiliary Functions

    function updateStatsPoints(targetKey, StatusKey, value) {
        setGame((prev) => {
            const currSpent = prev.entities[targetKey].unspentPoints;
            const currAttPoints =
                prev.entities[targetKey].attributes[StatusKey].points;

            const trueSpentPoints = Math.min(
                currSpent,
                Math.max(-currAttPoints, value),
            );
            const newPoints = currSpent - trueSpentPoints;
            const newAttributePoints = currAttPoints + trueSpentPoints;

            return {
                ...prev,
                entities: {
                    ...prev.entities,
                    [targetKey]: {
                        ...prev.entities[targetKey],
                        unspentPoints: newPoints,
                        attributes: {
                            ...prev.entities[targetKey].attributes,
                            [StatusKey]: {
                                ...prev.entities[targetKey].attributes[
                                    StatusKey
                                ],
                                valuePreview:
                                    constants.BASE_STATS[StatusKey] +
                                    newAttributePoints *
                                        constants.STAT_MULTIPLIERS[StatusKey],
                                points: newAttributePoints,
                            },
                        },
                    },
                },
            };
        });
    }

    // Efeitos
    useEffect(() => {
        const activeKey =
            game.status === "playerturn"
                ? "player"
                : game.status === "enemyturn"
                  ? "enemy"
                  : null;

        if (activeKey) {
            const activeEntity = game.entities[activeKey];
            const targetKey = activeKey === "player" ? "enemy" : "player";

            if (activeEntity.controller !== "human") {
                const timer = setTimeout(() => {
                    handleAutoTurn(
                        activeKey,
                        targetKey,
                        activeEntity.controller,
                    );
                }, 1000);

                return () => clearTimeout(timer);
            }
        }
    }, [game.status, game.entities]);

    useEffect(() => {
        if (game.status === "transition") {
            const timer = setTimeout(() => {
                setGame((prev) => ({ ...prev, status: prev.nextStatus }));
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [game.status]);

    // Turn Start effects
    useEffect(() => {
        if (game.status === "upkeep_player" || game.status === "upkeep_enemy") {
            setGame(processUpkeep);
        }
    }, [game.status]);

    return (
        <div className="app-container">
            <Header battleState={game.status} />
            <ControlPanel
                handleStart={handleStart}
                handleReset={handleReset}
                battleState={game.status}
                game={game}
                setGame={setGame}
                handleDistributionModeChange={handleDistributionModeChange}
            />
            <GamePanel updateStatsPoints={updateStatsPoints} game={game} />
            <ActionPanel
                handleAttack={handleAttack}
                handleHeal={handleHeal}
                handleGuard={handleGuard}
                handleSpecialAttack={handleSpecialAttack}
                handleSacrifice={handleSacrifice}
                handleCurse={handleCurse}
                handleAegis={handleAegis}
                handleArray={handleArray}
                handleShadowPact={handleShadowPact}
                handleShadowMantle={handleShadowMantle}
                handleRitualOfAsh={handleRitualOfAsh}
                handleDarkPromise={handleDarkPromise}
                handleBlackMayhem={handleBlackMayhem}
                handleLaser={handleLaser}
                playerController={game.entities.player.controller}
                enemyController={game.entities.enemy.controller}
                game={game}
            />
        </div>
    );
}

export default App;
