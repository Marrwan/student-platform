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
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded border border-gray-200 text-gray-400">
                        Team Performance Chart would go here
                    </div>
                </div>
            </div>
        </div>
    );
}
