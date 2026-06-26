import { useEffect } from "react";
import "./Modal.css";

function Modal({
    isConfirmOnly = true,
    mainText,
    subText = null,
    confirmText = "Ok",
    rejectText,
    confirmAction = null,
    rejectAction,
}) {
    // Executes on mount
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                if (isConfirmOnly) {
                    confirmAction(event);
                } else {
                    rejectAction(event);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // the return function is only executed on unmount
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isConfirmOnly, confirmAction, rejectAction]);

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-text-container">
                    <span className="modal-main-text">{mainText}</span>
                    <span className="modal-sub-text">{subText}</span>
                </div>
                <div className="modal-button-container">
                    <button onClick={confirmAction} className="modal-confirm">
                        {confirmText}
                    </button>
                    {!isConfirmOnly && (
                        <button onClick={rejectAction} className="modal-reject">
                            {rejectText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Modal;
