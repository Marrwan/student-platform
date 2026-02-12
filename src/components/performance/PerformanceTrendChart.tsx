'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface PerformanceSnapshot {
    weekNumber: number;
    year: number;
    overallScore: number;
    attendanceScore: number;
    projectCompletionRate: number;
    challengeScore: number;
}

interface PerformanceTrendChartProps {
    history: PerformanceSnapshot[];
}

export default function PerformanceTrendChart({ history }: PerformanceTrendChartProps) {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Performance Trends (Last 12 Weeks)',
            },
        },
        scales: {
            y: {
                min: 0,
                max: 100,
            }
        }
    };

    const labels = history.map(h => `Week ${h.weekNumber}`);

    const data = {
        labels,
        datasets: [
            {
                label: 'Overall Score',
                data: history.map(h => h.overallScore),
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.5)',
                tension: 0.3,
            },
            {
                label: 'Attendance',
                data: history.map(h => h.attendanceScore),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.3,
                hidden: true,
            },
            {
                label: 'Projects',
                data: history.map(h => h.projectCompletionRate),
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                tension: 0.3,
                hidden: true,
            },
        ],
    };

    return <Line options={options} data={data} />;
}
