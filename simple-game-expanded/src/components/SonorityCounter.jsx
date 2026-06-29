import { constants } from "../utils/constants";
import "./SonorityCounter.css";

function SonorityCounter({ sonority }) {
    const disNonFill = Math.max(0, (Math.min(sonority, 0) - constants.SONORITY_LOWER_LIMIT) * 10);
    const disFill = 100 - disNonFill;

    const harFill = Math.max(0, Math.min(sonority, constants.SONORITY_HIGHER_LIMIT) * 10);
    const harNonFill = 100 - harFill;

    console.log(disNonFill, disFill, harNonFill, harFill);

    return (
        <div className="sonority-counter-container">
            <div className="sonority-counter-upper-labels">
                <span>{"Sonority: " + sonority}</span>
            </div>
            <div className="sonority-bar-container">
                <div
                    className="dissonance-non-fill"
                    style={{
                        width: `${disNonFill}%`,
                    }}
                ></div>
                <div
                    className="dissonance-fill"
                    style={{
                        width: `${disFill}%`,
                    }}
                ></div>
                <div
                    className="harmony-fill"
                    style={{
                        width: `${harFill}%`,
                    }}
                ></div>
                <div
                    className="harmony-non-fill"
                    style={{
                        width: `${harNonFill}%`,
                    }}
                ></div>
            </div>
            <div className="sonority-counter-lower-labels">
                <span>{constants.SONORITY_LOWER_LIMIT}</span>
                <span>0</span>
                <span>{constants.SONORITY_HIGHER_LIMIT}</span>
            </div>
        </div>
    );
}

export default SonorityCounter;
