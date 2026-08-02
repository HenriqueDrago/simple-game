import { effectKeys, runeKeys } from "../utils/enums";
import { Diamond } from "lucide-react";
import "./RunicArray.css";

import othala from "../assets/Runic_letter_othalan.svg";
import jera from "../assets/Runic_letter_jeran.svg";
import naudiz from "../assets/Runic_letter_naudiz.svg";
import { useUI } from "../contexts/UIContext";

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

export default function RunicArray({ entity, simEntity }) {
    const { handleSpawnTooltip } = useUI();

    if (!entity?.states?.[effectKeys.VISIONARY]) {
        return null;
    }

    const realRunes = entity[effectKeys.RUNIC_ARRAY] || [];
    const simRunes = simEntity
        ? (simEntity[effectKeys.RUNIC_ARRAY] || realRunes)
        : realRunes;

    const realSlots = [
        realRunes[0] || runeKeys.EMPTY,
        realRunes[1] || runeKeys.EMPTY,
        realRunes[2] || runeKeys.EMPTY,
    ].reverse();

    const simSlots = [
        simRunes[0] || runeKeys.EMPTY,
        simRunes[1] || runeKeys.EMPTY,
        simRunes[2] || runeKeys.EMPTY,
    ].reverse();

    return (
        <div
            className="runic-array-container"
            onMouseDown={(e) => handleSpawnTooltip(e, effectKeys.RUNIC_ARRAY)}
        >
            {realSlots.map((realRune, index) => {
                const simRune = simSlots[index];
                const isNewRune =
                    realRune === runeKeys.EMPTY && simRune !== runeKeys.EMPTY;
                const isRuneChanged = simEntity && realRune !== simRune;
                const displayRune = simEntity ? simRune : realRune;

                return (
                    <div
                        key={index}
                        className={`rune-slot ${
                            displayRune === runeKeys.EMPTY ? "empty" : "active"
                        } ${runeClassMap[displayRune] || ""} ${
                            isNewRune
                                ? "is-new-preview"
                                : isRuneChanged
                                ? "is-preview"
                                : ""
                        }`}
                        onMouseDown={(e) =>
                            handleSpawnTooltip(
                                e,
                                displayRune !== runeKeys.EMPTY
                                    ? displayRune
                                    : effectKeys.RUNIC_ARRAY,
                            )
                        }
                    >
                        {runeMap[displayRune]}
                    </div>
                );
            })}
        </div>
    );
}