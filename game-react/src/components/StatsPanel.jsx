import HpBar from "./HpBar.jsx";
import ManaBar from "./ManaBar.jsx";
import AttrLine from "./AttrLine.jsx";
import StackCounter from "./StackCounter.jsx";

import { constants } from "../utils/constants.js";
import { entityKeys } from "../utils/enums.js";

import "./StatsPanel.css";

const stackCounters = [
    ["Blood Sacrifice", "bloodSacrifice", "#ff4d4d", "rgba(255, 77, 77, 0.1)"],
    ["Radiance", "radiance", "#ffc107", "rgba(255, 193, 7, 0.15)"],
    ["Poison", "poison", "#32cd32", "rgba(50, 205, 50, 0.1)"],
    ["Shackled Mana", "shackledMana", "#3f51b5", "rgba(63, 81, 181, 0.15)"],
    ["Shadowflame", "shadowflame", "#ff1493", "rgba(255, 20, 147, 0.15)"],
    [
        "Lingering Ember",
        "lingeringEmber",
        "#e998fd",
        "rgba(245, 208, 254, 0.12)",
    ],
    ["Cinders", "cinders", "#a9a9a9", "rgba(169, 169, 169, 0.15)"],
    [
        "Unrelenting Shadows",
        "unrelentingShadows",
        "#9370db",
        "rgba(147, 112, 219, 0.1)",
    ],
    ["Overheat", "overheat", "#ff8c00", "rgba(255, 140, 0, 0.15)"],
];

function StatsPanel({ game, updateStatsPoints }) {
    const battleState = game.status;
    const distributionMode = game.statDistributionMode;

    return (
        <div className="game-panel-container">
            <div className="entity-panel">
                <HpBar
                    entity={game.entities[entityKeys.PLAYER_ONE]}
                    label="Player One"
                />
                <ManaBar
                    entity={game.entities[entityKeys.PLAYER_ONE]}
                    label="Player One"
                />

                {stackCounters.map(([label, field, color, backgroundColor]) => (
                    <StackCounter
                        key={field}
                        label={label}
                        value={game.entities[entityKeys.PLAYER_ONE][field]}
                        color={color}
                        backgroundColor={backgroundColor}
                    />
                ))}

                <div className="attributes-wrapper">
                    {constants.ATTRIBUTE_NAMES.map((attr) => (
                        <AttrLine
                            key={attr}
                            battleState={battleState}
                            handleStatusChange={updateStatsPoints}
                            entity={game.entities[entityKeys.PLAYER_ONE]}
                            entityKey={entityKeys.PLAYER_ONE}
                            attr={attr}
                            modifiable={
                                distributionMode === "Custom" ||
                                distributionMode === "Randomize Enemy"
                            }
                        />
                    ))}
                </div>
            </div>

            <div className="entity-panel">
                <HpBar
                    entity={game.entities[entityKeys.PLAYER_TWO]}
                    label="Player Two"
                />
                <ManaBar
                    entity={game.entities[entityKeys.PLAYER_TWO]}
                    label="Player Two"
                />

                {stackCounters.map(([label, field, color, backgroundColor]) => (
                    <StackCounter
                        key={field}
                        label={label}
                        value={game.entities[entityKeys.PLAYER_TWO][field]}
                        color={color}
                        backgroundColor={backgroundColor}
                    />
                ))}

                <div className="attributes-wrapper">
                    {constants.ATTRIBUTE_NAMES.map((attr) => (
                        <AttrLine
                            key={attr}
                            battleState={battleState}
                            handleStatusChange={updateStatsPoints}
                            entity={game.entities[entityKeys.PLAYER_TWO]}
                            entityKey={entityKeys.PLAYER_TWO}
                            attr={attr}
                            modifiable={
                                distributionMode === "Custom" ||
                                distributionMode === "Randomize Player"
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StatsPanel;
