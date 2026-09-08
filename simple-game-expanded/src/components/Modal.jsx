import { useEffect } from "react";
import Backdrop from "./Backdrop";
import "./Modal.css";

function Modal({
    isConfirmOnly = true,
    mainText,
    subText = null,
    confirmText = "Ok",
    rejectText,
    confirmAction = () => {},
    rejectAction = () => {},
}) {
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

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isConfirmOnly, confirmAction, rejectAction]);

    const handleBackdropClick = (e) => {
        if (isConfirmOnly) {
            confirmAction(e);
        } else {
            rejectAction(e);
        }
    };

    return (
        <Backdrop onClick={handleBackdropClick} zIndex={9999}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-text-container">
                    <span className="modal-main-text">{mainText}</span>
                    {subText && <span className="modal-sub-text">{subText}</span>}
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
        </Backdrop>
    );
}

export default Modal;