export default function DonutChart({
    percentage,
    color = '#3B82F6',
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
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e5e7eb"
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
                    strokeLinecap="round"
                />
            </svg>
            {(label || sublabel) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {label && <span className="text-2xl font-bold text-gray-900">{label}</span>}
                    {sublabel && <span className="text-xs text-gray-500">{sublabel}</span>}
                </div>
            )}
        </div>
    );
}
