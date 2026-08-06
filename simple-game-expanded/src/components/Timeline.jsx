import { useGame } from "../contexts/GameContext";
import { useUI } from "../contexts/UIContext";
import { roundPhasesMap } from "../utils/constants";
import { turnStatus } from "../utils/enums";
import "./Timeline.css";

export default function Timeline() {
    const { game } = useGame();
    const { handleSpawnTooltip } = useUI();

    const usedGame = game?.simGame ? game?.simGame : game;

    const phases = usedGame.roundQueue;
    const currIndex = usedGame.roundIndex;
    const status = usedGame.status;

    if (status === turnStatus.SETUP || !phases) {
        return <div className={`timeline-empty-box`}></div>;
    }

    return (
        <div className="timeline-container">
            {phases.map((p, i) => {
                const specialClass =
                    i < currIndex
                        ? "timeline-past-phase"
                        : i > currIndex
                          ? "timeline-future-phase"
                          : "timeline-curr-phase";

                return (
                    <div
                        key={p}
                        className={`timeline-item-container ${specialClass}`}
                        onMouseDown={(e) =>
                            handleSpawnTooltip(e, roundPhasesMap[p].descKey)
                        }
                    >
                        <span>{roundPhasesMap[p].name}</span>
                    </div>
                );
            })}
        </div>
    );
}
