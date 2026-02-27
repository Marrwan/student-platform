'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
    { name: '18-30', value: 16, color: '#F3F4F6' },
    { name: '31-40', value: 10, color: '#E5E7EB' },
    { name: '41-55', value: 22, color: '#D1D5DB' },
    { name: '56 and above', value: 6, color: '#C4B5FD' }, // Light purple
];

// Custom renderer to mimic the design more closely if needed, 
// but standard Legend with custom formatter is usually enough.

export default function AgeGroupChart() {
    return (
        <div className="bg-card/40 backdrop-blur-xl p-6 rounded-xl border border-white/5 shadow-sm h-full">
            <h3 className="text-foreground font-semibold mb-4">Age Group</h3>
            <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
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
