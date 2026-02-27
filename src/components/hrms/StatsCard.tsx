import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string; // e.g., 'bg-blue-600', 'bg-green-600'
}

export default function StatsCard({ title, value, icon, colorClass }: StatsCardProps) {
    // Extract color for glow
    const isBlue = colorClass.includes('blue');
    const isPurple = colorClass.includes('purple');
    const isGreen = colorClass.includes('green');
    const isOrange = colorClass.includes('orange');

    let glowClass = 'shadow-glow-cyan';
    let iconBg = 'bg-neon-cyan/10';
    let iconText = 'text-neon-cyan';

    if (isPurple) { glowClass = 'shadow-glow-violet'; iconBg = 'bg-neon-violet/10'; iconText = 'text-neon-violet'; }
    if (isGreen) { glowClass = 'shadow-glow-emerald'; iconBg = 'bg-neon-emerald/10'; iconText = 'text-neon-emerald'; }
    if (isOrange) { glowClass = 'shadow-glow-amber'; iconBg = 'bg-neon-amber/10'; iconText = 'text-neon-amber'; }

    return (
        <div className={`bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-between h-40 transition-all hover:scale-[1.02] group ${glowClass}/5 hover:${glowClass}/20`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 ${iconBg} ${iconText} transition-all group-hover:scale-110`}>
                {icon}
            </div>
            <div>
                <div className="text-3xl font-black text-foreground tracking-tighter mono-font">{value}</div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest mono-font font-bold">{title}</div>
            </div>
        </div>
    );
}
