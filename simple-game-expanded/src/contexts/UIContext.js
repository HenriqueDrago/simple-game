import { createContext, useContext } from "react";

export const UIContext = createContext(null);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        console.error("useUI must be used within a UIProvider.");
    }
    return context;
};
