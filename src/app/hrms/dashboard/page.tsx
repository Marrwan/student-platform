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
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.firstName}</h1>
                    <p className="text-gray-500">Welcome to your supervisor dashboard.</p>
                </div>

                {/* Team Overview Stats */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Team Overview - {stats.teamName}</h2>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 ml-auto">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export Report
                            </button>
                            <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none">
                                <option>All Teams</option>
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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName} 👋</h1>
                    <p className="text-gray-500">Here's what's happening today.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/hrms/appraisal" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                        View Appraisal
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/hrms/profile" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900">My Profile</h3>
                    <p className="text-sm text-gray-500 mt-1">View personal details</p>
                </Link>

                {/* Project Management Logic for Staff */}
                <Link href="/dashboard" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Projects</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage assigned projects</p>
                </Link>

                <Link href="/hrms/appraisal" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Appraisal</h3>
                    <p className="text-sm text-gray-500 mt-1">Track objects & reviews</p>
                </Link>
                <Link href="/hrms/payroll" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Payroll</h3>
                    <p className="text-sm text-gray-500 mt-1">Payslips & Tax info</p>
                </Link>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm opacity-60 cursor-not-allowed">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Leave (Coming Soon)</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage time off</p>
                </div>
            </div>
        </div>
    );
}
