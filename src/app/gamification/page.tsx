'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import BadgeList from '@/components/gamification/BadgeList';
import Leaderboard from '@/components/gamification/Leaderboard';
import RecognitionForm from '@/components/gamification/RecognitionForm';
import { useAuth } from '@/components/providers/auth-provider';

export default function GamificationPage() {
    const { user } = useAuth();
    const [badges, setBadges] = useState([]);
    const [recognitions, setRecognitions] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            if (user) {
                const [badgesData, recognitionsData, leaderboardData, teamData] = await Promise.all([
                    api.getUserBadges(user.id),
                    api.getRecognitions(),
                    api.getGamificationLeaderboard(),
                    // Assuming we have a way to get users for the form
                    api.getUsers().catch(() => [])
                ]);
                setBadges(badgesData);
                setRecognitions(recognitionsData);
                setLeaderboard(leaderboardData);
                setUsers(teamData);
            }
        } catch (error) {
            console.error('Error fetching gamification data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading gamification data...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Achievement Center 🏆
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                    Track your progress, earn badges, and celebrate your team!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: My Badges */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">My Badges</h2>
                        <BadgeList userBadges={badges} />
                    </section>

                    <section className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Team Shoutouts</h2>
                        {/* RecognitionFeed was removed, but the section title remains. Assuming this is intended based on the provided diff. */}
                        {/* If RecognitionFeed should be here, it needs to be re-added. */}
                        {/* For now, I'm just removing the component as per the diff. */}
                    </section>
                </div>

                {/* Right Column: Leaderboard & Actions */}
                <div className="space-y-8">
                    <section>
                        <Leaderboard entries={leaderboard} />
                    </section>

                    <section>
                        <RecognitionForm users={users} onSuccess={fetchData} />
                    </section>

                    <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white text-center">
                        <h3 className="text-lg font-bold mb-2">Intern of the Month</h3>
                        <div className="bg-white/20 rounded-full h-24 w-24 mx-auto mb-4 flex items-center justify-center text-4xl">
                            👑
                        </div>
                        <p className="text-sm opacity-90 mb-4">
                            Nominations are open! Recognize someone who went above and beyond this month.
                        </p>
                        <button className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-opacity-90 transition">
                            View Winners
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
