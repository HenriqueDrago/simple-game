import { effectKeys, runeKeys } from "../utils/enums";
import { Diamond } from "lucide-react";
import "./RunicArray.css";

import othala from "../assets/Runic_letter_othalan.svg";
import jera from "../assets/Runic_letter_jeran.svg";
import naudiz from "../assets/Runic_letter_naudiz.svg";
import { spawnTooltip } from "../utils/dictionary";

const runeMap = {
    [runeKeys.EMPTY]: <Diamond className="empty-rune-icon" />,
    [runeKeys.URD]: (
        <img src={othala} alt="Rune of Urd" className="rune-icon" />
    ),
    [runeKeys.VERDANDI]: (
        <img src={jera} alt="Rune of Verdandi" className="rune-icon" />
    ),
    [runeKeys.SKULD]: (
        <img src={naudiz} alt="Rune of Skuld" className="rune-icon" />
    ),
};

const runeClassMap = {
    [runeKeys.URD]: "rune-urd",
    [runeKeys.VERDANDI]: "rune-verdandi",
    [runeKeys.SKULD]: "rune-skuld",
};

export default function RunicArray({ entity, handleSetTooltip }) {
    if (!entity.states[effectKeys.VISIONARY]) {
        return null;
    }

    const rawRunes = entity[effectKeys.RUNIC_ARRAY] || [];
    const slots = [
        rawRunes[0] || runeKeys.EMPTY,
        rawRunes[1] || runeKeys.EMPTY,
        rawRunes[2] || runeKeys.EMPTY,
    ].reverse();

    return (
        <div className="runic-array-container">
            {slots.map((rune, index) => (
                <div
                    key={index}
                    className={`rune-slot ${rune === runeKeys.EMPTY ? "empty" : "active"} ${runeClassMap[rune] || ""}`}
                    onMouseDown={(e) =>
                        spawnTooltip(
                            e,
                            handleSetTooltip,
                            rune !== runeKeys.EMPTY
                                ? rune
                                : effectKeys.RUNIC_ARRAY,
                        )
                    }
                >
                    {runeMap[rune]}
                </div>
            ))}
        </div>
    );
}
