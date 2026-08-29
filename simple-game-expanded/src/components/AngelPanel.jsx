import { useGame } from "../contexts/GameContext";
import { canUseCombatInteractions, isEntityDead } from "../utils/entities";

import StateBadges from "./StateBadges";
import "./AngelPanel.css";
import EnlightenmentBar from "./EnlightenmentBar";
import OrdinancesTracker from "./OrdinancesTracker";
import AngelAttr from "./AngelAttr";
import ChoirTracker from "./ChoirTracker";
import HallowedEchoesBar from "./HallowedEchoesBar";

export default function AngelPanel({ entityKey }) {
    const { game } = useGame();

    const entity = game.entities[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    const showWarning =
        canUseCombatInteractions(game, entityKey) && isEntityDead(entity);

    return (
        <div className="angel-panel-container">
            <StateBadges entityKey={entityKey} />

            <EnlightenmentBar entity={entity} simEntity={simEntity} />

            <OrdinancesTracker entityKey={entityKey} />

            <AngelAttr entityKey={entityKey} />

            <HallowedEchoesBar entityKey={entityKey} />

            <ChoirTracker entityKey={entityKey} />

            {showWarning && (
                <div className="stats-panel-warning">
                    Warning: You will die upon selecting an action!
                </div>
            )}
        </div>
    );
}
