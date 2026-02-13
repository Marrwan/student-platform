'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AtRiskInternsList from '@/components/performance/AtRiskInternsList';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';

export default function PerformanceAnalyticsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [atRiskInterns, setAtRiskInterns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && !['admin', 'manager', 'mentor'].includes(user.role)) {
            router.push('/performance');
            return;
        }

        const fetchData = async () => {
            try {
                const result = await api.getAtRiskInterns();
                setAtRiskInterns(result);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, router]);

    if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Performance Analytics
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Overview of team performance and support needs.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Attention Required</h3>
                    <AtRiskInternsList interns={atRiskInterns} />
                </div>

                {/* Placeholder for future Team overview chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Team Distribution</h3>
                    <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded border border-gray-200 text-gray-400 gap-2 font-inter">
                        <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <p className="text-sm font-medium">No performance data yet</p>
                        <p className="text-xs">Charts will appear as interns complete assignments</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
