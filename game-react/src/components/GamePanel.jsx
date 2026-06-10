import HpBar from "./HpBar.jsx";
import ManaBar from "./ManaBar.jsx";
import AttrLine from "./AttrLine.jsx";
import StackCounter from "./StackCounter.jsx";

import { constants } from "../utils/constants.js";

import "./GamePanel.css";

const stackCounters = [
    ["Blood Sacrifice", "bloodSacrifice", "#ff4d4d", "rgba(255, 77, 77, 0.1)"],
    ["Radiance", "radiance", "#ffc107", "rgba(255, 193, 7, 0.15)"],
    ["Poison", "poison", "#32cd32", "rgba(50, 205, 50, 0.1)"],
    ["Shackled Mana", "shackledMana", "#3f51b5", "rgba(63, 81, 181, 0.15)"],
    ["Shadowflame", "shadowflame", "#ff1493", "rgba(255, 20, 147, 0.15)"],
    ["Lingering Ember", "lingeringEmber", "#e998fd", "rgba(245, 208, 254, 0.12)"],
    ["Cinders", "cinders", "#a9a9a9", "rgba(169, 169, 169, 0.15)"],
    [
        "Unrelenting Shadows",
        "unrelentingShadows",
        "#9370db",
        "rgba(147, 112, 219, 0.1)",
    ],
    ["Overheat", "overheat", "#ff8c00", "rgba(255, 140, 0, 0.15)"],
];

function GamePanel({ game, updateStatsPoints }) {
    const battleState = game.status;
    const distributionMode = game.statDistributionMode;

    const entities = [game.entities.player, game.entities.enemy];

    return (
        <div className="game-panel-container">
            {entities.map((entity) => (
                <div className="entity-panel" key={entity.key}>
                    <HpBar entity={entity} label="Player" />
                    <ManaBar entity={entity} label="Player" />

                    {stackCounters.map(
                        ([label, field, color, backgroundColor]) => (
                            <StackCounter
                                key={field}
                                label={label}
                                value={entity[field]}
                                color={color}
                                backgroundColor={backgroundColor}
                            />
                        ),
                    )}

                    <div className="attributes-wrapper">
                        {constants.ATTRIBUTE_NAMES.map((attr) => (
                            <AttrLine
                                key={attr + entity.key}
                                battleState={battleState}
                                handleStatusChange={updateStatsPoints}
                                entity={entity}
                                entityKey={
                                    entity.key === "_player"
                                        ? "player"
                                        : "enemy"
                                }
                                attr={attr}
                                modifiable={
                                    distributionMode === "Custom" ||
                                    (distributionMode === "Randomize Player" &&
                                        entity.key === "_enemy") ||
                                    (distributionMode === "Randomize Enemy" &&
                                        entity.key === "_player")
                                }
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default GamePanel;
