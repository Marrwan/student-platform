'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';

export default function StandupDashboard() {
    const { user } = useAuth();
    const [standups, setStandups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed'>('all');

    useEffect(() => {
        fetchStandups();
    }, [page, filter]);

    const fetchStandups = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const data = await api.getStandups(page, 10, filter === 'all' ? undefined : filter);
            setStandups(data.standups);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch standups:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            scheduled: 'bg-neon-cyan/5 text-neon-cyan border-neon-cyan/20 shadow-glow-cyan/10',
            in_progress: 'bg-neon-amber/5 text-neon-amber border-neon-amber/20 shadow-glow-amber/10',
            completed: 'bg-neon-emerald/5 text-neon-emerald border-neon-emerald/20 shadow-glow-emerald/10'
        };
        const dotColors = {
            scheduled: 'bg-neon-cyan',
            in_progress: 'bg-neon-amber animate-pulse',
            completed: 'bg-neon-emerald'
        };
        return {
            className: `${styles[status as keyof typeof styles] || 'bg-white/5 text-muted-foreground border-white/10'} inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest mono-font`,
            dot: dotColors[status as keyof typeof dotColors] || 'bg-muted-foreground'
        };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).toUpperCase();
    };

    if (loading && standups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-2 border-neon-cyan/20 rounded-full"></div>
                    <div className="absolute inset-0 border-t-2 border-neon-cyan rounded-full animate-spin shadow-glow-cyan"></div>
                </div>
                <p className="text-[10px] text-muted-foreground mono-font animate-pulse uppercase tracking-[0.3em]">SYNCHRONIZING_STANDUP_STREAM...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/10 text-[8px] uppercase tracking-[0.2em] text-neon-cyan mb-2 mono-font">
                        <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
                        MODULE: STANDUP_CYCLES_V2.1
                    </div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tight mono-font">Proto <span className="text-muted-foreground">Conference</span></h1>
                </div>
                {user?.role === 'admin' && (
                    <Link
                        href="/standups/create"
                        className="bg-neon-cyan text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest mono-font shadow-glow-cyan hover:scale-105 transition-all"
                    >
                        INIT_STANDUP_SEQUENCE
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                {['all', 'scheduled', 'in_progress', 'completed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status as any)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mono-font transition-all border ${filter === status
                            ? 'bg-neon-cyan text-black border-neon-cyan shadow-glow-cyan'
                            : 'bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        {status.replace('_', '.')}
                    </button>
                ))}
            </div>

            {/* Standups List */}
            <div className="grid gap-6">
                {standups.length === 0 ? (
                    <div className="bg-card/40 backdrop-blur-xl p-20 rounded-3xl border border-white/10 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 bg-black/40 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tight mono-font">ZERO_CONFERENCE_DATA</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mb-8">No active synchronization detected in current cycle</p>
                    </div>
                ) : (
                    standups.map((standup) => {
                        const badge = getStatusBadge(standup.status);
                        return (
                            <Link
                                key={standup.id}
                                href={`/standups/${standup.id}`}
                                className="bg-card/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-neon-cyan/30 shadow-2xl transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 blur-[100px] pointer-events-none group-hover:bg-neon-cyan/10 transition-colors"></div>
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <h3 className="text-xl font-black text-foreground group-hover:text-neon-cyan transition-colors mono-font uppercase tracking-tighter">
                                                {standup.title}
                                            </h3>
                                            <span className={badge.className}>
                                                <span className={`w-1 h-1 rounded-full ${badge.dot}`}></span>
                                                {standup.status.replace('_', '.')}
                                            </span>
                                        </div>
                                        {standup.description && (
                                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mono-font mb-6 leading-relaxed max-w-2xl opacity-70 group-hover:opacity-100 transition-opacity">
                                                {standup.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mono-font font-black tracking-widest">
                                                <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-neon-cyan">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                {formatDate(standup.scheduledFor)}
                                            </div>
                                            {standup.team && (
                                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mono-font font-black tracking-widest">
                                                    <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-neon-violet">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                    </div>
                                                    {standup.team.name.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-neon-cyan group-hover:bg-white/10 transition-all">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-12 pb-12">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="px-6 h-12 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-[10px] font-black mono-font uppercase tracking-widest text-muted-foreground">
                        PAGE <span className="text-foreground mx-2">{page}</span> OF <span className="text-foreground ml-2">{totalPages}</span>
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}
