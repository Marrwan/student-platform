'use client';

import React from 'react';

interface LeaderboardEntry {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    badgeCount: number;
}

interface LeaderboardProps {
    entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
    if (!entries || entries.length === 0) {
        return <div className="text-gray-500 text-center py-4">No data yet. Start earning badges!</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="text-2xl mr-2">🏎️</span> Badge Leaderboard
                </h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {entries.map((user, index) => (
                    <li key={user.id} className="px-6 py-3 flex items-center hover:bg-gray-50">
                        <div className={`flex-shrink-0 w-8 text-center font-bold text-lg ${index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' :
                                    index === 2 ? 'text-orange-400' : 'text-gray-500'
                            }`}>
                            #{index + 1}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            {user.profilePicture ? (
                                <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" src={user.profilePicture} alt="" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold border-2 border-white shadow-sm">
                                    {user.firstName[0]}
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex-1">
                            <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {user.badgeCount} Badges
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
