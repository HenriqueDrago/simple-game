import './StackCounter.css';

function StackCounter({ label, value, color, backgroundColor }) {
    // If the stack is 0 or less, render nothing
    if (value <= 0) return null;

    return (
        <div 
            className="stack-counter-container"
            style={{
                color: color,
                borderColor: color,
                backgroundColor: backgroundColor
            }}
        >
            <span>{label}</span>
            <span className="stack-value">{value}</span>
        </div>
    );
}

export default StackCounter;