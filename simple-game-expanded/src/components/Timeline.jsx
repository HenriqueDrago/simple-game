import { roundPhasesMap } from "../utils/constants";
import { spawnTooltip } from "../utils/dictionary";
import { turnStatus } from "../utils/enums";
import "./Timeline.css";

export default function Timeline({ status, phases, currIndex, handleSetTooltip }) {
    if (status === turnStatus.SETUP || !phases) {
        return null;
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
                    <div key={p} className={`timeline-item-container ${specialClass}` } onMouseDown={(e) =>
                                            spawnTooltip(
                                                e,
                                                handleSetTooltip,
                                                roundPhasesMap[p].descKey,
                                            )
                                        }>
                        <span>{roundPhasesMap[p].name}</span>
                    </div>
                );
            })}
        </div>
    );
}
