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
    { key: "thornedShackles", label: "Thorned Shackles" },
    { key: "cutoffWings", label: "Cutoff Wings" },
    { key: "aligned", label: "Aligned" },
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
