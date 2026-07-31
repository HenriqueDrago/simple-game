import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import GameProvider from "./contexts/GameProvider.jsx";
import UIProvider from "./contexts/UIProvider.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <GameProvider>
            <UIProvider>
                <App />
            </UIProvider>
        </GameProvider>
    </StrictMode>,
);
