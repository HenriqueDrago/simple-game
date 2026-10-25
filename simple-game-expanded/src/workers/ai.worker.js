import { centralAIManagement } from "../utils/aiControllers";

self.onmessage = async (event) => {
    const { game, targetKey, nonTargetKey } = event.data;

    try {
        const updatedGame = await centralAIManagement(game, targetKey, nonTargetKey);
        self.postMessage({ success: true, updatedGame });
    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};