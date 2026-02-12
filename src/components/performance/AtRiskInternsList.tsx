'use client';

import React from 'react';
import Link from 'next/link';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
}

interface AtRiskSnapshot {
    overallScore: number;
    weekNumber: number;
    user: User;
}

interface AtRiskInternsListProps {
    interns: AtRiskSnapshot[];
}

export default function AtRiskInternsList({ interns }: AtRiskInternsListProps) {
    if (!interns || interns.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No interns currently flagged as at-risk. Great job team! 🎉
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                <h3 className="text-lg font-medium text-red-800">⚠️ At-Risk Interns (Score &lt; 60%)</h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {interns.map((snapshot) => (
                    <li key={snapshot.user.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                                {snapshot.user.profilePicture ? (
                                    <img className="h-10 w-10 rounded-full object-cover" src={snapshot.user.profilePicture} alt="" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        {snapshot.user.firstName[0]}
                                    </div>
                                )}
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {snapshot.user.firstName} {snapshot.user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{snapshot.user.email}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-red-600">
                                {snapshot.overallScore.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Week {snapshot.weekNumber} Score</div>
                        </div>
                        <div>
                            <Link
                                href={`/performance/${snapshot.user.id}`}
                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                                View Details
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
