import { useState, useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { aiKeys } from "../utils/enums";
import { applyProgressUnlock } from "../utils/entities";
import { useUI } from "../contexts/UIContext";
import Backdrop from "./Backdrop";
import "./InsertCode.css";

const progressUnlockMap = Object.freeze({
    ["WARLOCK"]: aiKeys.WARLOCK,
    ["BLOODKNIGHT"]: aiKeys.BLOODKNIGHT,
    ["PALADIN"]: aiKeys.PALADIN,
    ["AUGUR"]: aiKeys.AUGUR,
    ["SHADOW SORCERER"]: aiKeys.SHADOW_SORCERER,
    ["CYBORG"]: aiKeys.CYBORG,
    ["MAESTRO"]: aiKeys.MAESTRO,
    ["LUNATIC"]: aiKeys.LUNATIC,
    ["VOYAGER"]: aiKeys.VOYAGER,
    ["SERAPH"]: aiKeys.SERAPH,
})

export default function InsertCode() {
    const { setGame } = useGame();
    const { UIElements, setUIElements } = useUI();
    const [codeValue, setCodeValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleClose = () => {
        setErrorMessage("");
        setCodeValue("");
        setUIElements((prev) => ({
            ...prev,
            insertCode: false,
        }));
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };

        if (UIElements?.insertCode) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [UIElements?.insertCode]);

    if (!UIElements?.insertCode) {
        return null;
    }

    const handleCodeChange = (e) => {
        setCodeValue(e.target.value.toUpperCase());
        if (errorMessage) {
            setErrorMessage("");
        }
    };

    const handleCodeString = () => {
        const normalizedCode = codeValue.toUpperCase();

        if (Object.keys(progressUnlockMap).includes(normalizedCode)) {
            setGame((prev) => applyProgressUnlock(prev, progressUnlockMap[normalizedCode]));
            setCodeValue("");
            setErrorMessage("");
            handleClose();
        } else {
            setErrorMessage("INVALID CODE");
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            e.stopPropagation();
            handleCodeString();
        }
    };

    return (
        <Backdrop onClick={handleClose}>
            <div
                className="insert-code-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="insert-code-wrapper">
                    <div className="insert-code-input-row">
                        <input
                            type="text"
                            className={`insert-code-input ${
                                errorMessage ? "error" : ""
                            }`}
                            value={codeValue}
                            onChange={handleCodeChange}
                            onKeyDown={handleInputKeyDown}
                            placeholder="ENTER CODE..."
                        />
                        <button
                            className="insert-code-button"
                            onClick={handleCodeString}
                        >
                            Submit
                        </button>
                    </div>
                    {errorMessage && (
                        <span className="insert-code-error">
                            {errorMessage}
                        </span>
                    )}
                </div>
            </div>
        </Backdrop>
    );
}
