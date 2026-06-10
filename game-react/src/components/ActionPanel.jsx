import { useState } from "react";
import "./ActionPanel.css";

import { ACTION_DESCRIPTIONS, MECHANIC_DESCRIPTIONS } from "../utils/descriptors";

function ActionPanel({
    handleAttack,
    game,
    handleHeal,
    handleGuard,
    handleSpecialAttack,
    handleSacrifice,
    handleCurse,
    handleArray,
    handleAegis,
    handleShadowPact,
    handleShadowMantle,
    handleRitualOfAsh,
    handleDarkPromise,
    handleBlackMayhem,
    handleLaser,
    playerController,
    enemyController,
}) {
    const battleState = game.status;
    const arrayActive = game.remainingArray > 0;
    const descriptions = { ...ACTION_DESCRIPTIONS, ...MECHANIC_DESCRIPTIONS };

    const [hoveredAction, setHoveredAction] = useState(null);

    const showButtons =
        (playerController === "human" && battleState === "playerturn") ||
        (enemyController === "human" && battleState === "enemyturn");

    const showUmbralButtons =
        (playerController === "human" &&
            battleState === "playerturn" &&
            game.entities.player.umbralCore) ||
        (enemyController === "human" &&
            battleState === "enemyturn" &&
            game.entities.enemy.umbralCore);

    const showEnemyWait =
        battleState === "enemyturn" && enemyController !== "human";
    const showPlayerWait =
        battleState === "playerturn" && playerController !== "human";

    return (
        <div className="action-panel-container">
            {showButtons &&
                (showUmbralButtons ? (
                    <div className="shadow-button-grid">
                        <button
                            onMouseEnter={() =>
                                setHoveredAction([
                                    "blackMayhem",
                                    "resources",
                                    "shadowflame",
                                    "lingeringEmber",
                                    "cinders",
                                ])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleBlackMayhem("player", "enemy")
                                    : handleBlackMayhem("enemy", "player");
                            }}
                        >
                            Black Mayhem
                        </button>
                        <button
                            onMouseEnter={() =>
                                setHoveredAction([
                                    "shadowMantle",
                                    "darkEmbrace",
                                    "shadowflame",
                                    "resources",
                                ])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleShadowMantle("player", "enemy")
                                    : handleShadowMantle("enemy", "player");
                            }}
                        >
                            Shadow Mantle
                        </button>
                        <button
                            onMouseEnter={() =>
                                setHoveredAction([
                                    "ritualOfAsh",
                                    "shadowflame",
                                    "lingeringEmber",
                                    "cinders",
                                ])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleRitualOfAsh("player", "enemy")
                                    : handleRitualOfAsh("enemy", "player");
                            }}
                        >
                            Ritual Of Ash
                        </button>
                        <button
                            onMouseEnter={() =>
                                setHoveredAction([
                                    "darkPromise",
                                    "umbralCore",
                                    "dimmingDarkness",
                                    "shadowflame",
                                    "lingeringEmber",
                                    "cinders",
                                    "resources",
                                ])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleDarkPromise("player", "enemy")
                                    : handleDarkPromise("enemy", "player");
                            }}
                        >
                            Dark Promise
                        </button>
                    </div>
                ) : (
                    <div className="button-grid">
                        <button
                            onMouseEnter={() => setHoveredAction(["attack"])}
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleAttack("player", "enemy")
                                    : handleAttack("enemy", "player");
                            }}
                        >
                            Attack
                        </button>
                        <button
                            onMouseEnter={() =>
                                setHoveredAction(["guard", "guardingState"])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleGuard("player", "enemy")
                                    : handleGuard("enemy", "player");
                            }}
                        >
                            Guard
                        </button>
                        <button
                            onMouseEnter={() =>
                                setHoveredAction(["heal", "poison"])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleHeal("player", "enemy")
                                    : handleHeal("enemy", "player");
                            }}
                        >
                            Heal
                        </button>

                        <button
                            onMouseEnter={() =>
                                setHoveredAction([
                                    "spAtk",
                                    "manaImbalance",
                                    "manaOverflow",
                                ])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleSpecialAttack("player", "enemy")
                                    : handleSpecialAttack("enemy", "player");
                            }}
                        >
                            Special Attack
                        </button>
                        {arrayActive ? (
                            <button
                                onMouseEnter={() =>
                                    setHoveredAction([
                                        "curse",
                                        "shackledMana",
                                        "poison",
                                    ])
                                }
                                onClick={() => {
                                    setHoveredAction(null);
                                    battleState === "playerturn"
                                        ? handleCurse("player", "enemy")
                                        : handleCurse("enemy", "player");
                                }}
                            >
                                Curse
                            </button>
                        ) : (
                            <button
                                onMouseEnter={() =>
                                    setHoveredAction([
                                        "array",
                                        "shackledMana",
                                        "thornedShackles",
                                        "manaOverflow",
                                    ])
                                }
                                onClick={() => {
                                    setHoveredAction(null);
                                    battleState === "playerturn"
                                        ? handleArray("player", "enemy")
                                        : handleArray("enemy", "player");
                                }}
                            >
                                Array
                            </button>
                        )}

                        <button
                            onMouseEnter={() =>
                                setHoveredAction([
                                    "sacrifice",
                                    "bloodSacrifice",
                                    "sacrificialState",
                                    "manaBleed",
                                ])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleSacrifice("player", "enemy")
                                    : handleSacrifice("enemy", "player");
                            }}
                        >
                            Self Sacrifice
                        </button>
                        <button
                            onMouseEnter={() =>
                                setHoveredAction([
                                    "aegis",
                                    "radiance",
                                    "holyProtection",
                                ])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleAegis("player", "enemy")
                                    : handleAegis("enemy", "player");
                            }}
                        >
                            Aegis
                        </button>
                        <button
                            onMouseEnter={() =>
                                setHoveredAction([
                                    "shadowPact",
                                    "umbralCore",
                                    "resources",
                                    "shadowflame",
                                ])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleShadowPact("player", "enemy")
                                    : handleShadowPact("enemy", "player");
                            }}
                        >
                            Shadow Pact
                        </button>

                        <button
                            onMouseEnter={() =>
                                setHoveredAction([
                                    "laser",
                                    "overheat"
                                ])
                            }
                            onClick={() => {
                                setHoveredAction(null);
                                battleState === "playerturn"
                                    ? handleLaser("player", "enemy")
                                    : handleLaser("enemy", "player");
                            }}
                        >
                            Laser
                        </button>
                    </div>
                ))}

            {showEnemyWait && <span className="enemy-wait">Enemy Turn</span>}
            {showPlayerWait && <span className="enemy-wait">Player Turn</span>}

            {showButtons && (
                <div className="action-description-box">
                    {hoveredAction
                        ? hoveredAction.map((key, i) => {
                              return (
                                  <div key={key} className="description-item">
                                      {descriptions[key]}
                                      {i < hoveredAction.length - 1 ? (
                                          <hr />
                                      ) : null}
                                  </div>
                              );
                          })
                        : "Hover over an action to see its details."}
                </div>
            )}
        </div>
    );
}

export default ActionPanel;
