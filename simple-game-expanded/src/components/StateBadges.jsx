import { effectKeys } from "../utils/enums";
import "./StateBadges.css";

const STATE_MAPPINGS = [
    { key: "umbralCore", label: "Umbral Core" },
    { key: "resonant", label: "Resonant" },
    { key: "deployment", label: "Deployment" },
    { key: "weaponsDeployed", label: "Weapons Deployed" },
    { key: "thermalOverload", label: "Thermal Overload" },
    { key: "venting", label: "Venting" },
    { key: "guarding", label: "Guarding" },
    { key: "sacrificial", label: "Sacrificial" },
    { key: "radiant", label: "Radiant" },
    { key: "darkEmbrace", label: "Dark Embrace" },
    { key: "dimmingDarkness", label: "Dimming Darkness" },

    { key: "cutoffWings", label: "Cutoff Wings" },

    { key: "ascendenceOfSpirit", label: "Ascendence of Spirit" },
    { key: "stargazer", label: "Stargazer" },
    { key: "zenithOfMortality", label: "Zenith of Mortality" },
    { key: effectKeys.ABANDONED_BY_GRACE, label: "Abandoned by Grace" },
    { key: effectKeys.ANOINTED_PROXY, label: "Annointed Proxy" },

    { key: effectKeys.SELENIAN, label: "Selenian" },
];

function StateBadges({ states }) {
    const activeBadges = STATE_MAPPINGS.filter(
        (mapping) => states[mapping.key],
    );

    if (activeBadges.length === 0) return null;

    return (
        <div className="state-badges-container">
            {activeBadges.map((mapping) => (
                <span key={mapping.key} className="state-badge">
                    {mapping.label}
                </span>
            ))}
        </div>
    );
}

export default StateBadges;
