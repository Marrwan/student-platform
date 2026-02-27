import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string; // e.g., 'bg-blue-600', 'bg-green-600'
}

export default function StatsCard({ title, value, icon, colorClass }: StatsCardProps) {
    return (
        <div className="bg-card/40 backdrop-blur-xl p-6 rounded-xl border border-white/5 shadow-sm flex flex-col justify-between h-40">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${colorClass}`}>
                {icon}
            </div>
            <div>
                <div className="text-3xl font-bold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{title}</div>
            </div>
        </div>
    );
}
