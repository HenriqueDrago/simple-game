import { elementalKeys } from "../utils/enums";
import "./ElementalCrystals.css";

function ElementalCrystals({activeElement, entityKey, handleElementChange}) {
    return (
        <div className="canvas-container">
            <button
                className={`box box-green ${activeElement === elementalKeys.NATURE ? "active" : ""}`}
                onClick={() => handleElementChange(entityKey, elementalKeys.NATURE)}
                aria-label="Nature Toggle"
            />
            <button
                className={`box box-cyan ${activeElement === elementalKeys.FROST ? "active" : ""}`}
                onClick={() => handleElementChange(entityKey, elementalKeys.FROST)}
                aria-label="Frost Toggle"
            />
            <button
                className={`box box-red ${activeElement === elementalKeys.SCORCH ? "active" : ""}`}
                onClick={() => handleElementChange(entityKey, elementalKeys.SCORCH)}
                aria-label="Scorch Toggle"
            />
        </div>
    );
}

export default ElementalCrystals;
