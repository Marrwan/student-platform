'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
    { name: 'Analyst 2', value: 10, color: '#F3F4F6' },
    { name: 'Manager 2', value: 6, color: '#E5E7EB' },
    { name: 'Professional Intern 2', value: 6, color: '#D1D5DB' },
    { name: 'Trainee Analyst', value: 6, color: '#9CA3AF' },
    { name: 'Others', value: 71, color: '#7C3AED' }, // Main purple color
];

export default function GradeBandChart() {
    return (
        <div className="bg-card/40 backdrop-blur-xl p-6 rounded-xl border border-white/5 shadow-sm h-full">
            <h3 className="text-foreground font-semibold mb-4">Grade Band</h3>
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
