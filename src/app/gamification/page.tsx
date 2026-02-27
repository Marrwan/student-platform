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
        <div className="container mx-auto px-6 py-12">
            <div className="mb-12 text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-cyan/10 blur-[100px] pointer-events-none"></div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neon-cyan mb-4 mono-font">
                    <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
                    SYSTEM_ACHIEVEMENTS_V1.0
                </div>
                <h1 className="text-4xl font-black text-foreground sm:text-5xl uppercase tracking-tighter mb-4">
                    Achievement <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet">Center</span>
                </h1>
                <p className="max-w-xl mx-auto text-muted-foreground mono-font text-xs uppercase tracking-widest leading-relaxed">
                    Quantifying technical excellence and team collaboration through verified milestones.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass-card p-8 relative overflow-hidden group hover-glow-cyan transition-all duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-5 mono-font text-[60px] font-black select-none pointer-events-none">
                            BADGES
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-8 border-b border-white/5 pb-4 mono-font flex items-center gap-3">
                            <span className="text-neon-cyan text-xl">#</span> USER_BADGE_LIST
                        </h2>
                        <BadgeList userBadges={badges} />
                    </section>

                    <section className="glass-card p-8 relative group hover-glow-violet transition-all duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-5 mono-font text-[60px] font-black select-none pointer-events-none">
                            SHOUTS
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-4 border-b border-white/5 pb-4 mono-font flex items-center gap-3">
                            <span className="text-neon-violet text-xl">#</span> TEAM_RECOGNITION_STREAM
                        </h2>
                        <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                            <p className="text-muted-foreground mono-font text-[10px] uppercase tracking-widest">
                                Pending new telemetry feeds...
                            </p>
                        </div>
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

                    <section className="bg-gradient-to-br from-neon-violet/20 via-background to-background rounded-2xl border border-neon-violet/30 shadow-2xl p-8 text-white relative overflow-hidden group">
                        <div className="scan-line opacity-20"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <h3 className="text-xs font-bold mb-6 text-neon-violet uppercase tracking-[0.3em] mono-font">System Objective : MVP_MONTH</h3>
                            <div className="w-24 h-24 rounded-full bg-neon-violet/10 border border-neon-violet/30 flex items-center justify-center text-4xl mb-6 shadow-glow-violet group-hover:scale-110 transition-transform duration-500">
                                👑
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase mono-font tracking-widest mb-6 leading-relaxed">
                                Nominations open for session 0x24. Identify colleagues demonstrating exceptional core competencies.
                            </p>
                            <button className="w-full py-3 bg-neon-violet text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-neon-violet/80 transition-all mono-font shadow-glow-violet">
                                LAUNCH_NOMINATION_TERMINAL
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
