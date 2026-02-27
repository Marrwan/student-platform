'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
    { name: 'Ibadan', value: 44.9, color: '#C4B5FD' },
    { name: 'Abuja', value: 34.7, color: '#A78BFA' },
    { name: 'Oyo', value: 6.1, color: '#7C3AED' },
    { name: 'Eldoret', value: 4.1, color: '#5B21B6' },
    { name: 'Kampala', value: 10.2, color: '#4C1D95' },
];

export default function OfficeLocationChart() {
    return (
        <div className="bg-card/40 backdrop-blur-xl p-6 rounded-xl border border-white/5 shadow-sm h-full">
            <h3 className="text-foreground font-semibold mb-4">Office Location</h3>
            <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            formatter={(value, entry: any) => (
                                <span className="text-xs text-muted-foreground ml-2">{value} <span className="text-muted-foreground ml-2">{entry.payload.value}%</span></span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
