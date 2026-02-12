'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', value: 30 },
    { name: 'Feb', value: 40 },
    { name: 'Mar', value: 35 },
    { name: 'Apr', value: 50 },
    { name: 'May', value: 45 },
    { name: 'Jun', value: 60 },
    { name: 'Jul', value: 55 },
    { name: 'Aug', value: 70 },
    { name: 'Sep', value: 65 },
    { name: 'Oct', value: 80 },
    { name: 'Nov', value: 75 },
    { name: 'Dec', value: 85 },
];

export default function AppraisalTrendChart() {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-900 font-semibold">Overall Appraisal performance trend</h3>
                <select className="text-sm border-gray-200 rounded-md text-gray-500">
                    <option>Filter by year</option>
                    <option>2025</option>
                    <option>2024</option>
                </select>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
