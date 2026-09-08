import "./Backdrop.css";

export default function Backdrop({ children, onClick, zIndex = 9990 }) {
    return (
        <div
            className="backdrop"
            style={{ zIndex }}
            onClick={onClick}
            onContextMenu={(e) => {
                e.preventDefault();
                if (onClick) onClick(e);
            }}
        >
            {children}
        </div>
    );
}