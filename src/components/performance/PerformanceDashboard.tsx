'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PerformanceTrendChart from './PerformanceTrendChart';
import { useAuth } from '@/components/providers/auth-provider';

interface PerformanceDashboardProps {
    userId?: string; // Optional: if viewing another user
}

export default function PerformanceDashboard({ userId }: PerformanceDashboardProps) {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const targetId = userId || user?.id;
                if (targetId) {
                    const result = await api.getUserPerformance(targetId);
                    setData(result);
                }
            } catch (error) {
                console.error('Error fetching performance:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, userId]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading performance data...</div>;
    if (!data) return <div className="p-8 text-center text-gray-500">No performance data available yet.</div>;

    const { current, history } = data;

    const MetricCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className={`mt-1 text-3xl font-semibold text-${color}-600`}>
                            {value?.toFixed(0) || 0}%
                        </dd>
                    </div>
                </div>
            </div>
            <div className={`bg-${color}-50 px-5 py-3`}>
                <div className="text-sm">
                    <span className={`font-medium text-${color}-700`}>
                        {value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <h2 className="text-2xl font-bold text-gray-900">Performance Overview (Week {current?.weekNumber})</h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-indigo-500">
                    <div className="p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Overall Score</dt>
                        <dd className="mt-1 text-4xl font-bold text-indigo-900">
                            {current?.overallScore?.toFixed(1) || 0}%
                        </dd>
                    </div>
                </div>

                <MetricCard title="Attendance" value={current?.attendanceScore} color="green" />
                <MetricCard title="Projects" value={current?.projectCompletionRate} color="blue" />
                <MetricCard title="Appraisals" value={current?.appraisalScore} color="purple" />
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
                <PerformanceTrendChart history={history || []} />
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Detailed Metrics</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Breakdown of current performance scores.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        {[
                            { label: 'Attendance Score', value: current?.attendanceScore, desc: 'Based on standup participation' },
                            { label: 'Project Completion', value: current?.projectCompletionRate, desc: 'Based on assignment submissions' },
                            { label: 'Challenge Score', value: current?.challengeScore, desc: 'Normalized from leaderboard points' },
                            { label: 'Appraisal Score', value: current?.appraisalScore, desc: 'Average of supervisor appraisals' },
                            { label: 'Peer Feedback', value: current?.peerFeedbackScore, desc: 'Average rating from peer reviews' },
                        ].map((item, idx) => (
                            <div key={idx} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center gap-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs">
                                        <div
                                            className="bg-indigo-600 h-2.5 rounded-full"
                                            style={{ width: `${Math.min(item.value || 0, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-medium w-12 text-right">{(item.value || 0).toFixed(0)}%</span>
                                    <span className="text-gray-400 text-xs ml-2">{item.desc}</span>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}
