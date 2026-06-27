import "./SonorityCounter.css";

function SonorityCounter({ sonority }) {
    const disNonFill = Math.max(0, (Math.min(sonority, 0) + 5) * 10);
    const disFill = 50 - disNonFill;

    const harFill = Math.max(0, Math.min(sonority, 5) * 10);
    const harNonFill = 50 - harFill;

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
                <span>-5</span>
                <span>0</span>
                <span>5</span>
            </div>
        </div>
    );
}

export default SonorityCounter;
