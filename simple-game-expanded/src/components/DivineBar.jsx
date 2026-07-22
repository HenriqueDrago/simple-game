import { constants } from "../utils/constants";
import { spawnTooltip } from "../utils/dictionary";
import { canUseAction } from "../utils/entities";
import { actionKeys, effectKeys, entityKeys } from "../utils/enums";
import "./DivineBar.css";
import GradientBar from "./GradientBar";

export default function DivineBar({
    handleSetTooltip,
    handleClearTooltip,
    handleAction,
    game,
    entityKey,
}) {
    const entity = game.entities[entityKey];
    const otherEntityKey =
        entityKey === entityKeys.PLAYER_ONE
            ? entityKeys.PLAYER_TWO
            : entityKeys.PLAYER_ONE;

    console.log(entity[effectKeys.DIVINE_SPARK]);

    if (entity[effectKeys.DIVINE_SPARK] <= 0) {
        return null;
    }

    return (
        <div className="divine-bar">
            <div
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, effectKeys.DIVINE_SPARK)
                }
            >
                <GradientBar
                    label={"Divine Spark"}
                    currResource={entity[effectKeys.DIVINE_SPARK]}
                    maxResource={constants.MAX_DIVINE_SPARK}
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
                />
            </div>
            <button
                onClick={() => {
                    handleClearTooltip();
                    handleAction(actionKeys.ASCEND, entityKey, otherEntityKey);
                }}
                onMouseDown={(e) =>
                    spawnTooltip(e, handleSetTooltip, actionKeys.ASCEND)
                }
                disabled={canUseAction(game, entityKey, actionKeys.ASCEND)}
            >
                Ascend
            </button>
        </div>
    );
}
