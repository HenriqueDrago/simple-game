import { toRoman } from "../utils/general";
import "./SpecialCounter.css";

export default function SpecialCounter({ roman = false, value, style, label }) {
    return (
        <div className="special-counter-container" style={style}>
            <span>{`${label}: ${roman ? toRoman(value) : value}`}</span>
        </div>
    );
}
