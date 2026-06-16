import { useState } from "react";
import "./ActionPanel.css";

import { ACTION_DESCRIPTIONS, EFFECT_DESCRIPTIONS } from "../utils/descriptors";
import { entityKeys, turnStatus, aiKeys, actionKeys } from "../utils/enums";
import { constants, presetAi } from "../utils/constants";
import { laserCost } from "../utils/entities";

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

const getNormalActions = (
    arrayActive,
    currEntity,
    canUseSpAtk,
    canUseLaser,
    canUseDeploy,
) => {
    if (currEntity.states.thermalOverload) {
        return [
            {
                key: actionKeys.MELTDOWN,
                label: "Meltdown",
                hoverKeys: [actionKeys.MELTDOWN],
                isMeltdown: true,
            },
        ];
    }

    return [
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
            disabled: !canUseSpAtk,
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
        currEntity.states.aligned
            ? {
                  key: actionKeys.HALT,
                  label: "Halt",
                  hoverKeys: [actionKeys.HALT],
              }
            : {
                  key: actionKeys.ALIGN,
                  label: "Align",
                  hoverKeys: [actionKeys.ALIGN],
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
        currEntity.states.weaponsDeployed
            ? {
                  key: actionKeys.LASER,
                  label: "Laser",
                  hoverKeys: [actionKeys.LASER],
                  disabled: !canUseLaser,
              }
            : {
                  key: actionKeys.DEPLOY,
                  label: "Deploy",
                  hoverKeys: [actionKeys.DEPLOY],
                  disabled: !canUseDeploy,
              },
        {
            key: actionKeys.SUMMON,
            label: "Summon",
            hoverKeys: [],
            disabled: true,
        },
    ];
};

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

    const canUseSpAtk =
        currEntity.currMana + currEntity.resources.manaOverflow >=
        constants.SP_ATTACK_COST;
    const canUseLaser =
        currEntity.currMana + currEntity.resources.manaOverflow >=
        laserCost(currEntity);
    const canUseDeploy = !currEntity.states.venting;

    const enemyLabel =
        enemyController === aiKeys.HUMAN && playerController !== aiKeys.HUMAN
            ? "Player Turn"
            : enemyController === aiKeys.HUMAN &&
                playerController === aiKeys.HUMAN
              ? "Player Two Turn"
              : playerController === enemyController
                ? `${presetAi[enemyController].name} + " Two"`
                : presetAi[enemyController].name;

    const playerLabel =
        playerController === aiKeys.HUMAN && enemyController !== aiKeys.HUMAN
            ? "Player Turn"
            : playerController === aiKeys.HUMAN &&
                enemyController === aiKeys.HUMAN
              ? "Player One Turn"
              : playerController === enemyController
                ? `${presetAi[playerController].name} + " One"`
                : presetAi[playerController].name;

    const arrayLabel = "Array Turn";
    const wheelLabel = "Wheel Turn";

    const waitLabel =
        battleState === turnStatus.PLAYER_TWO_TURN &&
        enemyController !== aiKeys.HUMAN
            ? enemyLabel
            : battleState === turnStatus.PLAYER_ONE_TURN &&
                playerController !== aiKeys.HUMAN
              ? playerLabel
              : battleState === turnStatus.WHEEL_TURN
                ? wheelLabel
                : battleState === turnStatus.ARRAY_TURN
                  ? arrayLabel
                  : null;

    const showWait = waitLabel !== null;

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
        : getNormalActions(
              arrayActive,
              currEntity,
              canUseSpAtk,
              canUseLaser,
              canUseDeploy,
          );

    // Determine the container class based on state
    let containerClass = "button-grid";
    if (currEntity.states.thermalOverload) {
        containerClass = "meltdown-container";
    } else if (showUmbralButtons) {
        containerClass = "shadow-button-grid";
    }

    return (
        <div className="action-panel-container">
            {showButtons && (
                <div className={containerClass}>
                    {currentActions.map((action) => (
                        <button
                            key={action.key}
                            onMouseEnter={() =>
                                setHoveredAction(action.hoverKeys)
                            }
                            onClick={() => handleActionButton(action.key)}
                            disabled={action.disabled}
                            className={
                                action.isMeltdown ? "meltdown-button" : ""
                            }
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {showWait && <span className="enemy-wait">{waitLabel}</span>}

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
