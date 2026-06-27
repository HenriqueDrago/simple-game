function StarIcon({ 
    size, 
    fill, 
    stroke, 
    strokeWidth,
    opacity,
    glowing,
    className
}) {
    const glowFilter = glowing 
        ? `drop-shadow(0 0 4px ${fill}) drop-shadow(0 0 12px ${fill})` 
        : 'none';

    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            style={{ 
                opacity: opacity,
                filter: glowFilter,
                transition: "filter 0.3s ease-in-out"
            }}
        >
            <path
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"
            />
        </svg>
    );
}

export default StarIcon;