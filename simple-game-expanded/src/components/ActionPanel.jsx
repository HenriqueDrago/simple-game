import "./ActionPanel.css";

import { entityKeys, turnStatus, aiKeys, eyeKeys } from "../utils/enums";
import { constants, presetAi } from "../utils/constants";

import {
    getUmbralActions,
    getNormalActions,
    getAngelActions,
} from "../utils/getters";
import { DESCRIPTIONS } from "../utils/descriptions";

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
        waitLabel = "Elemental Cycle";
    } else if (battleState === turnStatus.ARRAY_TURN) {
        waitLabel = "Runic Inscription";
    } else if (battleState === turnStatus.EMINENCE_TURN) {
        waitLabel = "Emanation";
    } else if (battleState === turnStatus.STARS_TURN) {
        waitLabel = "Starfall";
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
        currentActions = getAngelActions(game.eyeOfHeavens === eyeKeys.OPEN);
    } else if (showUmbralButtons) {
        currentActions = getUmbralActions();
    } else if (showButtons) {
        currentActions = getNormalActions(
            arrayActive,
            currEntity,
            canUseSpAtk,
            canUseDeploy,
            game.progressMode,
            game.progressStatus,
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
                <div className="actions-buttons-text-container">
                    <span className="actions-mouse-wheel-explainer">
                        Mouse wheel click to see action details...
                    </span>
                    <div className={containerClass}>
                        {currentActions.map((action) => (
                            <button
                                key={action.key}
                                onClick={() => {
                                    handleClearTooltip();
                                    handleActionButton(action.key);
                                }}
                                onMouseDown={(e) => {
                                    // Mouse wheel opens tooltip
                                    if (e.button === 1) {
                                        e.preventDefault(); // Prevents the browser's auto-scroll icon from popping up
                                        const entry = DESCRIPTIONS[action.key];
                                        if (entry) {
                                            handleSetTooltip({
                                                keyword: entry.name,
                                                type: entry.type,
                                                description: entry.description,
                                                x: e.clientX,
                                                y: e.clientY - 30,
                                            });
                                        }
                                    }
                                }}
                                disabled={action.disabled}
                                className={action.specialClass || ""}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showWait && <span className="enemy-wait">{waitLabel}</span>}
        </div>
    );
}

export default ActionPanel;
