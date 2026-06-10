import { useState } from "react";
import "./ActionPanel.css";

import {
    ACTION_DESCRIPTIONS,
    MECHANIC_DESCRIPTIONS,
} from "../utils/descriptors";
import { entityKeys, turnStatus, aiKeys } from "../utils/enums";

const UMBRAL_ACTIONS = [
    {
        name: "BlackMayhem",
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
        name: "ShadowMantle",
        label: "Shadow Mantle",
        hoverKeys: ["shadowMantle", "darkEmbrace", "shadowflame", "resources"],
    },
    {
        name: "RitualOfAsh",
        label: "Ritual Of Ash",
        hoverKeys: ["ritualOfAsh", "shadowflame", "lingeringEmber", "cinders"],
    },
    {
        name: "DarkPromise",
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

const getNormalActions = (arrayActive) => [
    { name: "Attack", label: "Attack", hoverKeys: ["attack"] },
    { name: "Guard", label: "Guard", hoverKeys: ["guard", "guardingState"] },
    { name: "Heal", label: "Heal", hoverKeys: ["heal", "poison"] },
    {
        name: "SpecialAttack",
        label: "Special Attack",
        hoverKeys: ["spAtk", "manaImbalance", "manaOverflow"],
    },
    arrayActive
        ? {
              name: "Curse",
              label: "Curse",
              hoverKeys: ["curse", "shackledMana", "poison"],
          }
        : {
              name: "Array",
              label: "Array",
              hoverKeys: [
                  "array",
                  "shackledMana",
                  "thornedShackles",
                  "manaOverflow",
              ],
          },
    {
        name: "Sacrifice",
        label: "Self Sacrifice",
        hoverKeys: [
            "sacrifice",
            "bloodSacrifice",
            "sacrificialState",
            "manaBleed",
        ],
    },
    {
        name: "Aegis",
        label: "Aegis",
        hoverKeys: ["aegis", "radiance", "holyProtection"],
    },
    {
        name: "ShadowPact",
        label: "Shadow Pact",
        hoverKeys: ["shadowPact", "umbralCore", "resources", "shadowflame"],
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
    const descriptions = { ...ACTION_DESCRIPTIONS, ...MECHANIC_DESCRIPTIONS };

    const [hoveredAction, setHoveredAction] = useState(null);

    const showButtons =
        (playerController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_ONE_TURN) ||
        (enemyController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_TWO_TURN);

    const showUmbralButtons =
        (playerController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_ONE_TURN &&
            game.entities[entityKeys.PLAYER_ONE].umbralCore) ||
        (enemyController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_TWO_TURN &&
            game.entities[entityKeys.PLAYER_TWO].umbralCore);

    const showEnemyWait =
        battleState === turnStatus.PLAYER_TWO_TURN &&
        enemyController !== aiKeys.HUMAN;
    const showPlayerWait =
        battleState === turnStatus.PLAYER_ONE_TURN &&
        playerController !== aiKeys.HUMAN;

    // Centralized action handler
    const handleActionButton = (actionName) => {
        setHoveredAction(null);
        const isPlayerOne = battleState === turnStatus.PLAYER_ONE_TURN;

        handleAction(
            actionName,
            isPlayerOne ? entityKeys.PLAYER_ONE : entityKeys.PLAYER_TWO,
            isPlayerOne ? entityKeys.PLAYER_TWO : entityKeys.PLAYER_ONE,
        );
    };

    const currentActions = showUmbralButtons
        ? UMBRAL_ACTIONS
        : getNormalActions(arrayActive);

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
                            key={action.name}
                            onMouseEnter={() =>
                                setHoveredAction(action.hoverKeys)
                            }
                            onClick={() => handleActionButton(action.name)}
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
