import { useGame } from "../contexts/GameContext";
import { ATTRIBUTE_NAMES } from "../utils/constants";
import { canUseCombatInteractions, isEntityDead } from "../utils/entities";

import AttrLine from "./AttrLine";
import ConstellationTracker from "./ConstellationTracker";
import CyborgTracker from "./CyborgTracker";
import DivineBar from "./DivineBar";
import HpBar from "./HpBar";
import ManaBar from "./ManaBar";
import ModifiersTracker from "./ModifiersTracker";
import RunicArray from "./RunicArray";
import SelenianTracker from "./SelenianTracker";
import SonorityCounter from "./SonorityCounter";
import StateBadges from "./StateBadges";
import "./RightPanel.css";

export default function RightPanel({ entityKey }) {
    const { game } = useGame();

    const entity = game.entities[entityKey];
    const simEntity = game?.simGame?.entities?.[entityKey];

    const showWarning =
        canUseCombatInteractions(game, entityKey) && isEntityDead(entity);

    return (
        <div className="player-panel-right">
            <SelenianTracker entityKey={entityKey} />
            <StateBadges entityKey={entityKey} />
            <DivineBar entityKey={entityKey} />

            <HpBar entity={entity} simEntity={simEntity} />
            <ManaBar entity={entity} simEntity={simEntity} />

            <ModifiersTracker entityKey={entityKey} />

            <CyborgTracker entityKey={entityKey} />
            <ConstellationTracker entityKey={entityKey} />
            <RunicArray entity={entity} simEntity={simEntity} />

            <div className="attributes-wrapper">
                {ATTRIBUTE_NAMES.map((attr) => (
                    <AttrLine key={attr} entityKey={entityKey} attr={attr} />
                ))}
            </div>

            <SonorityCounter entityKey={entityKey} />

            {showWarning && (
                <div className="stats-panel-warning">
                    Warning: You will die upon selecting an action!
                </div>
            )}
        </div>
    );
}
