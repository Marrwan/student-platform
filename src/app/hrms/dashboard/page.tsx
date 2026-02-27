'use client';

import { useAuth } from '@/components/providers/auth-provider';
import Link from 'next/link';
import { useSupervisorView } from '@/components/hrms/SupervisorViewContext';
import StatsCard from '@/components/hrms/StatsCard';
import GradeBandChart from '@/components/hrms/charts/GradeBandChart';
import AgeGroupChart from '@/components/hrms/charts/AgeGroupChart';
import GenderRatioChart from '@/components/hrms/charts/GenderRatioChart';
import OfficeLocationChart from '@/components/hrms/charts/OfficeLocationChart';
import AppraisalTrendChart from '@/components/hrms/charts/AppraisalTrendChart';
import TeamMembersTable from '@/components/hrms/TeamMembersTable';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function HRMSDashboardPage() {
    const { user } = useAuth();
    const { isSupervisorView } = useSupervisorView();
    const [stats, setStats] = useState<any>({
        totalMembers: 0,
        onLeave: 0,
        onSuspension: 0,
        totalTeams: 0,
        teamName: 'Loading...'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isSupervisorView) {
            const fetchStats = async () => {
                try {
                    // @ts-ignore
                    const data = await api.getHRMSDashboardStats();
                    setStats(data);
                } catch (error) {
                    console.error("Failed to fetch dashboard stats", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStats();
        }
    }, [isSupervisorView]);

    if (isSupervisorView) {
        return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-neon-cyan/5 blur-[100px] pointer-events-none"></div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neon-cyan mb-3 mono-font">
                        <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
                        SUPERVISOR_COMMAND_CENTER_V1.2
                    </div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Personnel <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet">Overview</span></h1>
                    <p className="text-xs text-muted-foreground mono-font mt-2 uppercase tracking-widest">Hi, {user?.firstName}. Accessing team telemetry nodes.</p>
                </div>

                {/* Team Overview Stats */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tighter mono-font border-l-2 border-neon-cyan pl-4">
                            Node: {stats.teamName}
                        </h2>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-neon-cyan hover:bg-white/10 transition-all uppercase tracking-widest mono-font">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                EXPORT_TELEMETRY
                            </button>
                            <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-muted-foreground focus:outline-none uppercase tracking-widest mono-font appearance-none cursor-pointer hover:bg-white/10 transition-all">
                                <option className="bg-background">ALL_CLUSTERS</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <StatsCard
                                title="Overall Teams"
                                value={stats.totalTeams}
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                colorClass="bg-blue-600"
                            />
                            <StatsCard
                                title="Overall Team Members"
                                value={stats.totalMembers}
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                colorClass="bg-purple-700"
                            />
                            <StatsCard
                                title="Members on Leave"
                                value={stats.onLeave}
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>}
                                colorClass="bg-green-600"
                            />
                            <StatsCard
                                title="Members on suspension"
                                value={stats.onSuspension}
                                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                colorClass="bg-orange-600"
                            />
                        </div>

                        {/* Trend Chart */}
                        <div className="h-full min-h-[300px]">
                            <AppraisalTrendChart />
                        </div>
                    </div>
                </div>

                {/* Demographics Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GradeBandChart />
                    <AgeGroupChart />
                    <GenderRatioChart />
                    <OfficeLocationChart />
                </div>

                {/* Team Members */}
                <TeamMembersTable />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end relative">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-neon-cyan/5 blur-[100px] pointer-events-none"></div>
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neon-cyan mb-3 mono-font">
                        <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
                        USER_TERMINAL_ACTV
                    </div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Main <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet">Interface</span></h1>
                    <p className="text-xs text-muted-foreground mono-font mt-2 uppercase tracking-widest">Accessing personal directive nodes.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/hrms/appraisal" className="px-6 py-2 bg-neon-cyan text-black rounded-lg hover:bg-neon-cyan/90 text-xs font-bold transition-all uppercase tracking-widest mono-font shadow-glow-cyan">
                        GOTO_APPRAISAL
                    </Link>
                </div>
            </div>

            <Link href="/hrms/profile" className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl hover:border-neon-cyan/30 hover:shadow-neon-cyan/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-3xl pointer-events-none group-hover:bg-neon-cyan/20 transition-colors"></div>
                <div className="w-12 h-12 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl flex items-center justify-center text-neon-cyan mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-tighter mono-font mb-1 group-hover:text-neon-cyan transition-colors">IDENTITY_NODE</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">View core user parameters</p>
            </Link>

            <Link href="/dashboard" className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl hover:border-neon-violet/30 hover:shadow-neon-violet/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-violet/5 blur-3xl pointer-events-none group-hover:bg-neon-violet/20 transition-colors"></div>
                <div className="w-12 h-12 bg-neon-violet/10 border border-neon-violet/20 rounded-xl flex items-center justify-center text-neon-violet mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-tighter mono-font mb-1 group-hover:text-neon-violet transition-colors">PROJECT_CLUSTER</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">Manage assigned execution nodes</p>
            </Link>

            <Link href="/hrms/appraisal" className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl hover:border-neon-pink/30 hover:shadow-neon-pink/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 blur-3xl pointer-events-none group-hover:bg-neon-pink/20 transition-colors"></div>
                <div className="w-12 h-12 bg-neon-pink/10 border border-neon-pink/20 rounded-xl flex items-center justify-center text-neon-pink mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-tighter mono-font mb-1 group-hover:text-neon-pink transition-colors">APPRAISAL_LOG</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">Track performance telemetry</p>
            </Link>

            <Link href="/hrms/payroll" className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl hover:border-neon-emerald/30 hover:shadow-neon-emerald/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-emerald/5 blur-3xl pointer-events-none group-hover:bg-neon-emerald/20 transition-colors"></div>
                <div className="w-12 h-12 bg-neon-emerald/10 border border-neon-emerald/20 rounded-xl flex items-center justify-center text-neon-emerald mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-tighter mono-font mb-1 group-hover:text-neon-emerald transition-colors">FINANCIAL_NODE</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">Access fiscal distribution data</p>
            </Link>

            <div className="bg-card/20 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl opacity-40 cursor-not-allowed group relative overflow-hidden grayscale">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-muted-foreground mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-tighter mono-font mb-1">LEAVE_PROTOCOL</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">STATUS: OFFLINE</p>
            </div>
        </div>
    );
}
