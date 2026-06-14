import { useState } from "react";
import "./ActionPanel.css";

import { ACTION_DESCRIPTIONS, EFFECT_DESCRIPTIONS } from "../utils/descriptors";
import { entityKeys, turnStatus, aiKeys, actionKeys } from "../utils/enums";

const UMBRAL_ACTIONS = [
    {
        key: actionKeys.BLACK_MAYHEM,
        label: "Black Mayhem",
        hoverKeys: [
            "blackMayhem",
            "resources",
            "shadowflame",
            "lingeringEmber",
            "cinders",
        ],
    },
    {
        key: actionKeys.SHADOW_MANTLE,
        label: "Shadow Mantle",
        hoverKeys: ["shadowMantle", "darkEmbrace", "shadowflame", "resources"],
    },
    {
        key: actionKeys.RITUAL_OF_ASH,
        label: "Ritual Of Ash",
        hoverKeys: ["ritualOfAsh", "shadowflame", "lingeringEmber", "cinders"],
    },
    {
        key: actionKeys.DARK_PROMISE,
        label: "Dark Promise",
        hoverKeys: [
            "darkPromise",
            "umbralCore",
            "dimmingDarkness",
            "shadowflame",
            "lingeringEmber",
            "cinders",
            "resources",
        ],
    },
];

const getNormalActions = (arrayActive, currEntity) => [
    { key: actionKeys.ATTACK, label: "Attack", hoverKeys: ["attack"] },
    {
        key: actionKeys.GUARD,
        label: "Guard",
        hoverKeys: ["guard", "guardingState"],
    },
    { key: actionKeys.HEAL, label: "Heal", hoverKeys: ["heal", "poison"] },
    {
        key: actionKeys.SPECIAL_ATTACK,
        label: "Special Attack",
        hoverKeys: ["spAtk", "manaImbalance", "manaOverflow"],
    },
    arrayActive
        ? {
              key: actionKeys.CURSE,
              label: "Curse",
              hoverKeys: ["curse", "shackledMana", "poison"],
          }
        : {
              key: actionKeys.ARRAY,
              label: "Array",
              hoverKeys: [
                  "array",
                  "shackledMana",
                  "thornedShackles",
                  "manaOverflow",
              ],
          },
    {
        key: actionKeys.SACRIFICE,
        label: "Self Sacrifice",
        hoverKeys: [
            "sacrifice",
            "bloodSacrifice",
            "sacrificialState",
            "manaBleed",
        ],
    },
    {
        key: actionKeys.AEGIS,
        label: "Aegis",
        hoverKeys: ["aegis", "radiance", "holyProtection"],
    },
    {
        key: actionKeys.SHADOW_PACT,
        label: "Shadow Pact",
        hoverKeys: ["shadowPact", "umbralCore", "resources", "shadowflame"],
    },
    {
        key: actionKeys.WHEEL,
        label: "Wheel",
        hoverKeys: [actionKeys.WHEEL],
    },
    !currEntity.states.resonant
        ? {
              key: actionKeys.ATTUNE,
              label: "Attune",
              hoverKeys: [actionKeys.ATTUNE],
          }
        : currEntity.sonority > 0
          ? {
                key: actionKeys.BABEL,
                label: "Babel",
                hoverKeys: [actionKeys.BABEL],
            }
          : currEntity.sonority < 0
            ? {
                  key: actionKeys.SOUND_OF_SILENCE,
                  label: "The Sound of Silence",
                  hoverKeys: [actionKeys.SOUND_OF_SILENCE],
              }
            : {
                  key: actionKeys.DA_CAPO,
                  label: "Da Capo",
                  hoverKeys: [actionKeys.DA_CAPO],
              },
];

function ActionPanel({
    handleAction,
    game,
    playerController,
    enemyController,
}) {
    const battleState = game.status;
    const arrayActive = game.remainingArray > 0;
    const currEntity =
        battleState === turnStatus.PLAYER_ONE_TURN
            ? game.entities[entityKeys.PLAYER_ONE]
            : game.entities[entityKeys.PLAYER_TWO];
    const descriptions = { ...ACTION_DESCRIPTIONS, ...EFFECT_DESCRIPTIONS };

    const [hoveredAction, setHoveredAction] = useState(null);

    const showButtons =
        (playerController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_ONE_TURN) ||
        (enemyController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_TWO_TURN);

    const showUmbralButtons =
        (playerController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_ONE_TURN &&
            game.entities[entityKeys.PLAYER_ONE].states.umbralCore) ||
        (enemyController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_TWO_TURN &&
            game.entities[entityKeys.PLAYER_TWO].states.umbralCore);

    const showEnemyWait =
        battleState === turnStatus.PLAYER_TWO_TURN &&
        enemyController !== aiKeys.HUMAN;
    const showPlayerWait =
        battleState === turnStatus.PLAYER_ONE_TURN &&
        playerController !== aiKeys.HUMAN;

    // Centralized action handler
    const handleActionButton = (actionKey) => {
        setHoveredAction(null);
        const isPlayerOne = battleState === turnStatus.PLAYER_ONE_TURN;

        handleAction(
            actionKey,
            isPlayerOne ? entityKeys.PLAYER_ONE : entityKeys.PLAYER_TWO,
            isPlayerOne ? entityKeys.PLAYER_TWO : entityKeys.PLAYER_ONE,
        );
    };

    const currentActions = showUmbralButtons
        ? UMBRAL_ACTIONS
        : getNormalActions(arrayActive, currEntity);

    return (
        <div className="action-panel-container">
            {showButtons && (
                <div
                    className={
                        showUmbralButtons ? "shadow-button-grid" : "button-grid"
                    }
                >
                    {currentActions.map((action) => (
                        <button
                            key={action.key}
                            onMouseEnter={() =>
                                setHoveredAction(action.hoverKeys)
                            }
                            onClick={() => handleActionButton(action.key)}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {showEnemyWait && <span className="enemy-wait">Enemy Turn</span>}
            {showPlayerWait && <span className="enemy-wait">Player Turn</span>}

            {showButtons && (
                <div className="action-description-box">
                    {hoveredAction
                        ? hoveredAction.map((key, i) => (
                              <div key={key} className="description-item">
                                  {descriptions[key]}
                                  {i < hoveredAction.length - 1 && <hr />}
                              </div>
                          ))
                        : "Hover over an action to see its details."}
                </div>
            )}
        </div>
    );
}

export default ActionPanel;
