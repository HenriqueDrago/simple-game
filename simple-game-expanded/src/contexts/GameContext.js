import { createContext, useContext } from "react";

export const GameContext = createContext(null);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        console.error("useGame must be used within a UIProvider.");
    }
    return context;
};
