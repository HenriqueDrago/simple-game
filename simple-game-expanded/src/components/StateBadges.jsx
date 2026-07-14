import { spawnTooltip } from "../utils/dictionary";
import { effectKeys } from "../utils/enums";
import "./StateBadges.css";

const STATE_MAPPINGS = [
    { key: effectKeys.UMBRAL_CORE, label: "Umbral Core" },
    { key: effectKeys.RESONANT, label: "Resonant" },
    { key: effectKeys.DEPLOYMENT, label: "Deployment" },
    { key: effectKeys.WEAPONS_DEPLOYED, label: "Weapons Deployed" },
    { key: effectKeys.THERMAL_OVERLOAD, label: "Thermal Overload" },
    { key: effectKeys.VENTING, label: "Venting" },
    { key: effectKeys.GUARDING_STATE, label: "Guarding" },
    { key: effectKeys.SACRIFICIAL_STATE, label: "Sacrificial" },
    { key: effectKeys.RADIANT, label: "Radiant" },
    { key: effectKeys.DARK_EMBRACE, label: "Dark Embrace" },
    { key: effectKeys.DIMMING_DARKNESS, label: "Dimming Darkness" },
    { key: effectKeys.CUTOFF_WINGS, label: "Cutoff Wings" },
    { key: effectKeys.ASCENDENCE_OF_SPIRIT, label: "Ascendence of Spirit" },
    { key: effectKeys.STARGAZER, label: "Stargazer" },
    { key: effectKeys.ZENITH_OF_MORTALITY, label: "Zenith of Mortality" },
    { key: effectKeys.ABANDONED_BY_GRACE, label: "Abandoned by Grace" },
    { key: effectKeys.ANOINTED_PROXY, label: "Anointed Proxy" },
    { key: effectKeys.SELENIAN, label: "Selenian" },
    { key: effectKeys.GIBBOUS, label: "Gibbous" },
    { key: effectKeys.PRISMATIC, label: "Prismatic" },
    { key: effectKeys.BLEAK_DECEPTION, label: "Bleak Deception" },
    { key: effectKeys.MOON_DEW, label: "Moon Dew" },
];

function StateBadges({ states, handleSetTooltip }) {
    const activeBadges = STATE_MAPPINGS.filter(
        (mapping) => states[mapping.key],
    );

    if (activeBadges.length === 0) return null;

    return (
        <div className="state-badges-container">
            {activeBadges.map((mapping) => (
                <span
                    key={mapping.key}
                    className="state-badge"
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            mapping.key,
                        )
                    }
                >
                    {mapping.label}
                </span>
            ))}
        </div>
    );
}

export default StateBadges;