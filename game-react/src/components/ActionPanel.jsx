import { useState } from "react";
import "./ActionPanel.css";

import { ACTION_DESCRIPTIONS, EFFECT_DESCRIPTIONS } from "../utils/descriptors";
import { entityKeys, turnStatus, aiKeys } from "../utils/enums";
import {
    constants,
    presetAi,
    ANGEL_ACTIONS,
    UMBRAL_ACTIONS,
    getNormalActions,
} from "../utils/constants";

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

    const showAngelButtons =
        (playerController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_ONE_TURN &&
            game.entities[entityKeys.PLAYER_ONE].states.cutoffWings) ||
        (enemyController === aiKeys.HUMAN &&
            battleState === turnStatus.PLAYER_TWO_TURN &&
            game.entities[entityKeys.PLAYER_TWO].states.cutoffWings);

    const canUseSpAtk =
        currEntity.currMana + currEntity.resources.manaOverflow >=
        constants.SP_ATTACK_COST;
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

    const currActorLabel =
        battleState === turnStatus.PLAYER_ONE_TURN ? playerLabel : enemyLabel;

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

    const currentActions = showAngelButtons
        ? ANGEL_ACTIONS
        : showUmbralButtons
          ? UMBRAL_ACTIONS
          : getNormalActions(
                arrayActive,
                currEntity,
                canUseSpAtk,
                canUseDeploy,
            );

    // Determine the container class based on state
    let containerClass = "button-grid";
    if (currEntity.states.thermalOverload) {
        containerClass = "meltdown-container";
    } else if (showAngelButtons) {
        containerClass = "angel-button-grid";
    } else if (showUmbralButtons) {
        containerClass = "shadow-button-grid";
    }

    return (
        <div className="action-panel-container">
            {showButtons && (
                <div className="action-panel-turn-announcer">
                    <span>{currActorLabel}</span>
                </div>
            )}

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
