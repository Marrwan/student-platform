'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import StandupForm from '@/components/standup/StandupForm';
import ActionItemsList from '@/components/standup/ActionItemsList';
import { useAuth } from '@/components/providers/auth-provider';

export default function StandupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const standupId = params?.id as string;

    const [standup, setStandup] = useState<any>(null);
    const [attendance, setAttendance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'submit' | 'responses' | 'attendance' | 'actions'>('submit');

    useEffect(() => {
        if (standupId) {
            fetchStandupDetails();
        }
    }, [standupId]);

    const fetchStandupDetails = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const [standupData, attendanceData] = await Promise.all([
                api.getStandupById(standupId),
                api.getStandupAttendance(standupId)
            ]);
            setStandup(standupData);
            setAttendance(attendanceData);
        } catch (error) {
            console.error('Failed to fetch standup:', error);
        } finally {
            setLoading(false);
        }
    };

    const userResponse = standup?.responses?.find((r: any) => r.userId === user?.id);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mb-4">
                    <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] mono-font uppercase tracking-[0.2em] text-muted-foreground animate-pulse">FETCHING_STANDUP_LOGS</p>
            </div>
        );
    }

    if (!standup) {
        return (
            <div className="text-center py-24 glass-card border-dashed">
                <p className="text-[10px] mono-font uppercase tracking-widest text-muted-foreground">ERROR: OBJECT_NOT_FOUND_0x404</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="relative">
                <button
                    onClick={() => router.back()}
                    className="group mb-8 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-neon-cyan transition-colors mono-font"
                >
                    <span className="text-neon-cyan transition-transform group-hover:-translate-x-1">&lt;</span>
                    SYS_EXIT_DETAIL
                </button>
                <div className="flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neon-cyan w-fit mono-font">
                        <span className="w-1 h-1 rounded-full bg-neon-cyan"></span>
                        EVENT_TYPE: SYNC_STANDUP
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">{standup.title}</h1>
                </div>
                <div className="flex items-center gap-6 mt-6 text-[10px] uppercase tracking-widest text-muted-foreground mono-font border-y border-white/5 py-3">
                    <span className="flex items-center gap-2"><span className="text-neon-violet">TIME:</span> {new Date(standup.scheduledFor).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    {standup.team && <span className="flex items-center gap-2"><span className="text-neon-cyan">ORG:</span> {standup.team.name.toUpperCase()}</span>}
                </div>
                {standup.description && (
                    <p className="text-xs text-muted-foreground mt-4 leading-relaxed max-w-2xl border-l border-white/10 pl-4">{standup.description}</p>
                )}
            </div>

            {/* Stats */}
            {attendance && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-6 border-white/5 group hover-glow-cyan transition-all duration-300">
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 mono-font">Telemetry_Count</p>
                        <p className="text-3xl font-black text-foreground mono-font tracking-tighter">{attendance.total.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="glass-card p-6 border-neon-emerald/20 group hover-glow-emerald transition-all duration-300">
                        <p className="text-[9px] uppercase tracking-widest text-neon-emerald/70 mb-1 mono-font">Status_Online</p>
                        <p className="text-3xl font-black text-neon-emerald mono-font tracking-tighter">{attendance.present.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="glass-card p-6 border-neon-amber/20 group hover-glow-amber transition-all duration-300">
                        <p className="text-[9px] uppercase tracking-widest text-neon-amber/70 mb-1 mono-font">Status_Delayed</p>
                        <p className="text-3xl font-black text-neon-amber mono-font tracking-tighter">{attendance.late.toString().padStart(2, '0')}</p>
                    </div>
                    <div className="glass-card p-6 border-neon-rose/20 group hover-glow-rose transition-all duration-300">
                        <p className="text-[9px] uppercase tracking-widest text-neon-rose/70 mb-1 mono-font">Status_Offline</p>
                        <p className="text-3xl font-black text-neon-rose mono-font tracking-tighter">{attendance.absent.toString().padStart(2, '0')}</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-6">
                    {['submit', 'responses', 'attendance', 'actions'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-3 px-1 border-b-2 font-medium capitalize transition-colors ${activeTab === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'submit' ? 'My Response' : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'submit' && (
                    <StandupForm
                        standupId={standupId}
                        existingResponse={userResponse}
                        onSubmit={fetchStandupDetails}
                    />
                )}

                {activeTab === 'responses' && (
                    <div className="space-y-6">
                        {standup.responses?.length === 0 ? (
                            <div className="glass-card p-24 text-center border-dashed">
                                <p className="text-[10px] mono-font uppercase tracking-widest text-muted-foreground">LOG_EMPTY: NO_TELEMETRY_DATA</p>
                            </div>
                        ) : (
                            standup.responses?.map((response: any) => (
                                <div key={response.id} className="glass-card p-8 border-white/5 relative overflow-hidden group hover-glow-cyan transition-all duration-500">
                                    <div className="scan-line opacity-5 group-hover:opacity-10"></div>
                                    <div className="flex items-start justify-between mb-8 pb-4 border-b border-white/5 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neon-cyan font-black mono-font text-sm">
                                                {response.user?.firstName?.[0]}{response.user?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground text-sm flex items-center gap-2 mono-font">
                                                    {response.user?.firstName?.toUpperCase()}_{response.user?.lastName?.toUpperCase()}
                                                    <span className="text-[10px] text-muted-foreground opacity-50 font-normal">0x{response.id?.slice(-4)}</span>
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground mono-font tracking-tight">{response.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-widest font-black mono-font border ${response.attendanceStatus === 'present' ? 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20' :
                                                response.attendanceStatus === 'late' ? 'bg-neon-amber/10 text-neon-amber border-neon-amber/20' :
                                                    'bg-neon-rose/10 text-neon-rose border-neon-rose/20'
                                            }`}>
                                            STATUS::{response.attendanceStatus}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                        <div>
                                            <p className="text-[9px] uppercase tracking-widest font-bold text-neon-cyan mb-3 mono-font flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse"></span>
                                                TASK_HISTORY::POST
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-neon-cyan/20">{response.whatDidYouDo || 'NOT_SPECIFIED'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase tracking-widest font-bold text-neon-violet mb-3 mono-font flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-neon-violet rounded-full animate-pulse"></span>
                                                TARGET_OBJECTIVES::PRE
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-neon-violet/20">{response.whatWillYouDo || 'NOT_SPECIFIED'}</p>
                                        </div>
                                        {response.blockers && (
                                            <div className="md:col-span-2 bg-neon-rose/5 p-4 rounded-xl border border-neon-rose/10">
                                                <p className="text-[9px] uppercase tracking-widest font-black text-neon-rose mb-2 mono-font">PROCESS_BLOCKERS::CRITICAL</p>
                                                <p className="text-xs text-neon-rose/80 mono-font">{response.blockers}</p>
                                            </div>
                                        )}
                                    </div>
                                    {response.submittedAt && (
                                        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between opacity-50 grayscale hover:grayscale-0 transition-all">
                                            <p className="text-[9px] text-muted-foreground mono-font tracking-widest uppercase">
                                                TIMELOG: {new Date(response.submittedAt).toISOString().replace('T', '_').split('.')[0]}
                                            </p>
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-neon-cyan/30 rounded-full"></div>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'attendance' && attendance && (
                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <div className="grid gap-3">
                            {attendance.responses.map((response: any) => (
                                <div key={response.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {response.user?.firstName?.[0]}{response.user?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {response.user?.firstName} {response.user?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">{response.user?.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${response.attendanceStatus === 'present' ? 'bg-green-100 text-green-700' :
                                        response.attendanceStatus === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {response.attendanceStatus === 'present' ? '✅ Present' :
                                            response.attendanceStatus === 'late' ? '⏰ Late' :
                                                '❌ Absent'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <ActionItemsList standupId={standupId} />
                    </div>
                )}
            </div>
        </div>
    );
}
