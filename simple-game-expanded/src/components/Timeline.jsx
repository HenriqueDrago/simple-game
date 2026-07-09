import { roundPhasesNameMap } from "../utils/constants";
import { turnStatus } from "../utils/enums";
import "./Timeline.css";

export default function Timeline({ status, phases, currIndex }) {
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
                    <div className={`timeline-item-container ${specialClass}`}>
                        <span>{roundPhasesNameMap[p]}</span>
                    </div>
                );
            })}
        </div>
    );
}
