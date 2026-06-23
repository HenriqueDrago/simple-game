import "./ActionPanel.css";

import {
    ACTION_DESCRIPTIONS,
    EFFECT_DESCRIPTIONS,
} from "../utils/descriptions";
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
    handleSetTooltip,
    handleClearTooltip,
}) {
    const battleState = game.status;
    const arrayActive = game.remainingArray > 0;

    const isPlayerOneTurn = battleState === turnStatus.PLAYER_ONE_TURN;
    const isPlayerTwoTurn = battleState === turnStatus.PLAYER_TWO_TURN;

    const playerOne = game.entities[entityKeys.PLAYER_ONE];
    const playerTwo = game.entities[entityKeys.PLAYER_TWO];

    const currEntity = isPlayerOneTurn ? playerOne : playerTwo;

    const descriptions = { ...ACTION_DESCRIPTIONS, ...EFFECT_DESCRIPTIONS };

    // Turn and Button Visibility Logic
    const isHumanTurn =
        (isPlayerOneTurn && playerController === aiKeys.HUMAN) ||
        (isPlayerTwoTurn && enemyController === aiKeys.HUMAN);

    const showButtons = isHumanTurn && !currEntity.states.burdenOfStigma;
    const showUmbralButtons = showButtons && currEntity.states.umbralCore;
    const showAngelButtons =
        showButtons && currEntity.states.ascendenceOfSpirit;

    const canUseSpAtk =
        currEntity.currMana + currEntity.resources.manaOverflow >=
        constants.SP_ATTACK_COST;
    const canUseDeploy = !currEntity.states.venting;

    // Label Generation Helpers
    const getActorLabel = (controller, isPlayerOne, isSealed) => {
        if (controller === aiKeys.HUMAN) {
            if (
                playerController === aiKeys.HUMAN &&
                enemyController === aiKeys.HUMAN
            ) {
                return `${isPlayerOne ? "Player One Turn" : "Player Two Turn"} ${isSealed ? "(Skipped)" : ""}`;
            }
            return `Player Turn ${isSealed ? "(Skipped)" : ""}`;
        }
        if (playerController === enemyController) {
            return `${presetAi[controller].name} ${isPlayerOne ? "One" : "Two"} ${isSealed ? "(Skipped)" : ""}`;
        }
        return `${presetAi[controller].name} ${isSealed ? "(Skipped)" : ""}`;
    };

    const playerLabel = getActorLabel(
        playerController,
        true,
        playerOne.states.burdenOfStigma,
    );
    const enemyLabel = getActorLabel(
        enemyController,
        false,
        playerTwo.states.burdenOfStigma,
    );
    const currActorLabel = isPlayerOneTurn ? playerLabel : enemyLabel;

    let waitLabel = null;
    if (currEntity.states.burdenOfStigma) {
        waitLabel = currActorLabel;
    } else if (isPlayerTwoTurn && enemyController !== aiKeys.HUMAN) {
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
        handleAction(
            actionKey,
            isPlayerOneTurn ? entityKeys.PLAYER_ONE : entityKeys.PLAYER_TWO,
            isPlayerOneTurn ? entityKeys.PLAYER_TWO : entityKeys.PLAYER_ONE,
        );
    };

    // Determine Available Actions
    let currentActions = [];
    if (currEntity.states.burdenOfStigma) {
        currentActions = [];
    } else if (showAngelButtons) {
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
    if (currEntity.states.thermalOverload) {
        containerClass = "meltdown-container";
    } else if (showAngelButtons) {
        containerClass =
            game.eyeOfHeavens === eyeKeys.OPEN
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
                            onClick={() => {
                                // LEFT CLICK = Execute Action
                                handleClearTooltip();
                                handleActionButton(action.key);
                            }}
                            onMouseDown={(e) => {
                                // MIDDLE CLICK (Mousewheel) = Open Tooltip
                                if (e.button === 1) {
                                    e.preventDefault(); // Prevents the browser's auto-scroll icon from popping up
                                    const entry = descriptions[action.key];
                                    if (entry) {
                                        handleSetTooltip({
                                            keyword: entry.name,
                                            type: entry.type,
                                            description: entry.description,
                                            x: e.clientX,
                                            y: e.clientY - 30, // Spawns the box slightly above the cursor
                                        });
                                    }
                                }
                            }}
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
        </div>
    );
}

export default ActionPanel;
