'use client';

import React from 'react';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
}

interface UserBadge {
    id: string;
    earnedAt: string;
    badge: Badge;
}

interface BadgeListProps {
    userBadges: UserBadge[];
}

export default function BadgeList({ userBadges }: BadgeListProps) {
    if (!userBadges || userBadges.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                No badges earned yet. Keep up the good work!
            </div>
        );
    }

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userBadges.map((ub) => (
                <div key={ub.id} className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-16 w-16 mb-2 flex items-center justify-center text-3xl">
                        {/* Placeholder for icon rendering logic - using emoji/text if icon is not a URL */}
                        {ub.badge.icon.startsWith('http') ? (
                            <img src={ub.badge.icon} alt={ub.badge.name} className="h-full w-full object-contain" />
                        ) : (
                            <span>{ub.badge.icon}</span>
                        )}
                    </div>
                    <h4 className="text-sm font-bold text-center text-gray-900">{ub.badge.name}</h4>
                    <span className={`mt-1 px-2 py-0.5 text-xs rounded-full border ${getRarityColor(ub.badge.rarity)}`}>
                        {ub.badge.rarity}
                    </span>
                    <p className="mt-2 text-xs text-center text-gray-500 line-clamp-2" title={ub.badge.description}>
                        {ub.badge.description}
                    </p>
                    <span className="mt-2 text-xs text-gray-400">
                        {new Date(ub.earnedAt).toLocaleDateString()}
                    </span>
                </div>
            ))}
        </div>
    );
}
