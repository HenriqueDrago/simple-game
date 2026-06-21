import { useState } from "react";
import "./ActionPanel.css";

import { ACTION_DESCRIPTIONS, EFFECT_DESCRIPTIONS } from "../utils/descriptors";
import { entityKeys, turnStatus, aiKeys, eyeKeys } from "../utils/enums";
import { constants, presetAi } from "../utils/constants";

import {
    getUmbralActions,
    getNormalActions,
    getGoodAngelActions,
    getBadAngelActions,
} from "../utils/getters";

function ActionPanel({
    handleAction,
    game,
    playerController,
    enemyController,
}) {
    const battleState = game.status;
    const arrayActive = game.remainingArray > 0;

    const isPlayerOneTurn = battleState === turnStatus.PLAYER_ONE_TURN;
    const isPlayerTwoTurn = battleState === turnStatus.PLAYER_TWO_TURN;

    const currEntity = isPlayerOneTurn
        ? game.entities[entityKeys.PLAYER_ONE]
        : game.entities[entityKeys.PLAYER_TWO];

    const descriptions = { ...ACTION_DESCRIPTIONS, ...EFFECT_DESCRIPTIONS };

    const [hoveredAction, setHoveredAction] = useState(null);

    // Turn and Button Visibility Logic
    const isHumanTurn =
        (isPlayerOneTurn && playerController === aiKeys.HUMAN) ||
        (isPlayerTwoTurn && enemyController === aiKeys.HUMAN);

    const showButtons = isHumanTurn;
    const showUmbralButtons = showButtons && currEntity?.states?.umbralCore;
    const showAngelButtons =
        showButtons && currEntity?.states?.ascendenceOfSpirit;

    const canUseSpAtk =
        currEntity.currMana + currEntity.resources.manaOverflow >=
        constants.SP_ATTACK_COST;
    const canUseDeploy = !currEntity.states.venting;

    // Label Generation Helpers
    const getActorLabel = (controller, isPlayerOne) => {
        if (controller === aiKeys.HUMAN) {
            if (
                playerController === aiKeys.HUMAN &&
                enemyController === aiKeys.HUMAN
            ) {
                return isPlayerOne ? "Player One Turn" : "Player Two Turn";
            }
            return "Player Turn";
        }
        if (playerController === enemyController) {
            return `${presetAi[controller].name} ${isPlayerOne ? "One" : "Two"}`;
        }
        return presetAi[controller].name;
    };

    const playerLabel = getActorLabel(playerController, true);
    const enemyLabel = getActorLabel(enemyController, false);
    const currActorLabel = isPlayerOneTurn ? playerLabel : enemyLabel;

    let waitLabel = null;
    if (isPlayerTwoTurn && enemyController !== aiKeys.HUMAN) {
        waitLabel = enemyLabel;
    } else if (isPlayerOneTurn && playerController !== aiKeys.HUMAN) {
        waitLabel = playerLabel;
    } else if (battleState === turnStatus.WHEEL_TURN) {
        waitLabel = "Wheel Turn";
    } else if (battleState === turnStatus.ARRAY_TURN) {
        waitLabel = "Array Turn";
    } else if (battleState === turnStatus.EMINENCE_TURN) {
        waitLabel = "Eminence Turn";
    }

    const showWait = waitLabel !== null;

    // Action Handler
    const handleActionButton = (actionKey) => {
        setHoveredAction(null);
        handleAction(
            actionKey,
            isPlayerOneTurn ? entityKeys.PLAYER_ONE : entityKeys.PLAYER_TWO,
            isPlayerOneTurn ? entityKeys.PLAYER_TWO : entityKeys.PLAYER_ONE,
        );
    };

    // Determine Available Actions
    let currentActions = [];
    if (showAngelButtons) {
        if (game.eyeOfHeavens === eyeKeys.OPEN) {
            currentActions = getGoodAngelActions();
        } else if (game.eyeOfHeavens === eyeKeys.CLOSED) {
            currentActions = getBadAngelActions();
        }
    } else if (showUmbralButtons) {
        currentActions = getUmbralActions();
    } else if (showButtons) {
        currentActions = getNormalActions(
            arrayActive,
            currEntity,
            canUseSpAtk,
            canUseDeploy,
        );
    }

    // Determine Container Class for CSS styling
    let containerClass = "button-grid";
    if (currEntity?.states?.thermalOverload) {
        containerClass = "meltdown-container";
    } else if (showAngelButtons) {
        containerClass = game.eyeOfHeavens === eyeKeys.OPEN 
            ? "good-angel-button-grid" 
            : "bad-angel-button-grid";
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
