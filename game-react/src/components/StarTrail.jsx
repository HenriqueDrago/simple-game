function StarTrail({ size, color, glowing }) {
    const glowFilter = glowing 
        ? `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 12px ${color})` 
        : 'none';

    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="-6 0 30 24" 
            style={{
                filter: glowFilter,
                transition: "filter 0.3s ease-in-out"
            }}
        >
            {/* Furthest ghost */}
            <path
                fill={color}
                opacity="0.15"
                transform="translate(-6, 0)"
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"
            />
            {/* Middle ghost */}
            <path
                fill={color}
                opacity="0.4"
                transform="translate(-3, 0)"
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"
            />
            {/* Primary body (smaller to distinguish from standard star) */}
            <path
                fill={color}
                opacity="0.8"
                transform="scale(0.8)"
                style={{ transformOrigin: "center" }}
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"
            />
        </svg>
    );
}

export default StarTrail;