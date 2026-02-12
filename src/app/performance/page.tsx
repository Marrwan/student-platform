'use client';

import React from 'react';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';
import { useAuth } from '@/components/providers/auth-provider';

export default function PerformancePage() {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        My Performance Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Track your progress across projects, attendance, and skills.
                    </p>
                </div>
            </div>

            <PerformanceDashboard />
        </div>
    );
}
