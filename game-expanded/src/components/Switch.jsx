import "./Switch.css";

function Switch({ checked, handleToggle, disabled }) {
    return (
        <button
            checked={checked}
            disabled={disabled}
            className={`toggle-switch ${checked ? "checked" : ""}`}
            onClick={handleToggle}
        >
            <span className="toggle-thumb" />
        </button>
    );
}

export default Switch;
