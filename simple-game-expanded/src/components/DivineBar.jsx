import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { constants } from "../utils/constants";
import { canUseAction, canUseCombatInteractions } from "../utils/entities";
import { actionKeys, effectKeys, entityKeys } from "../utils/enums";
import "./DivineBar.css";
import GradientBar from "./GradientBar";

export default function DivineBar({ entityKey }) {
    const { game, handleAction } = useGame();
    const { handleSpawnTooltip, handleClearTooltip } = useUI();

    const entity = game.entities[entityKey];
    const otherEntityKey =
        entityKey === entityKeys.PLAYER_ONE
            ? entityKeys.PLAYER_TWO
            : entityKeys.PLAYER_ONE;

    if (entity[effectKeys.DIVINE_SPARK] <= 0) {
        return null;
    }

    const canUseAscend = canUseAction(game, entityKey, actionKeys.ASCEND);

    return (
        <div className="divine-bar">
            <div
                onMouseDown={(e) =>
                    handleSpawnTooltip(e, effectKeys.DIVINE_SPARK)
                }
            >
                <GradientBar
                    label={"Divine Spark"}
                    resourceKey={effectKeys.DIVINE_SPARK}
                    maxResource={constants.MAX_DIVINE_SPARK}
                    entityKey={entityKey}
                    trackStyle={{
                        backgroundImage: `linear-gradient(
                                            90deg,
                                            #fff9d4 0%,
                                            #ffd93b 25%,
                                            #ffe87c 50%,
                                            #ffd93b 75%,
                                            #fff9d4 100%
                                        )`,
                    }}
                    showPercent={true}
                    isAlwaysActive={true}
                />
            </div>
            <button
                className={`${canUseAscend ? "ascend-enabled" : ""}`}
                onClick={() => {
                    handleClearTooltip();
                    handleAction(actionKeys.ASCEND, entityKey, otherEntityKey);
                }}
                onMouseDown={(e) => handleSpawnTooltip(e, actionKeys.ASCEND)}
                disabled={
                    !canUseAscend ||
                    !canUseCombatInteractions(game, entityKey, true, true)
                }
            >
                Ascend
            </button>
        </div>
    );
}
