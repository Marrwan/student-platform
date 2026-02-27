export default function DonutChart({
    percentage,
    color = 'var(--neon-cyan)',
    size = 120,
    strokeWidth = 10,
    label,
    sublabel
}: {
    percentage: number;
    color?: string;
    size?: number;
    strokeWidth?: number;
    label?: string;
    sublabel?: string;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="square"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            {(label || sublabel) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {label && <span className="text-3xl font-black text-foreground tracking-tighter mono-font">{label}</span>}
                    {sublabel && <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mono-font mt-1">{sublabel}</span>}
                </div>
            )}
        </div>
    );
}
