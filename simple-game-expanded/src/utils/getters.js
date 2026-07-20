export const getSonorityColor = (sonority) => {
    const colors = {
        "-50": "#ff0000",
        "-45": "#ff0d00",
        "-40": "#ff1b00",
        "-35": "#ff2900",
        "-30": "#ff3700",
        "-25": "#ff4500",
        "-20": "#ff6a33",
        "-15": "#ff8f66",
        "-10": "#ffb499",
        "-5": "#ffdacc",
        0: "#ffffff",
        5: "#ccf2ff",
        10: "#99e5ff",
        15: "#66d9ff",
        20: "#33ccff",
        25: "#00bfff",
        30: "#00a6ff",
        35: "#008cff",
        40: "#0073ff",
        45: "#0059ff",
        50: "#0040ff",
    };
    return colors[sonority] || "#ffffff";
};
