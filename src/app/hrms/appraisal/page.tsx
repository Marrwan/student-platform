'use client';

import DonutChart from '@/components/hrms/DonutChart';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSupervisorView } from '@/components/hrms/SupervisorViewContext';
import SupervisorAppraisalList from '@/components/hrms/SupervisorAppraisalList';

export default function AppraisalPage() {
    const { isSupervisorView } = useSupervisorView();
    const [cycles, setCycles] = useState<any[]>([]);
    const [appraisals, setAppraisals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // @ts-ignore
                const cyclesData = await api.getAppraisalCycles();
                // @ts-ignore
                const appraisalsData = await api.getMyAppraisals();
                setCycles(cyclesData);
                setAppraisals(appraisalsData);
            } catch (error) {
                console.error("Failed to fetch appraisal data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isSupervisorView) {
        return <SupervisorAppraisalList />;
    }

    if (loading) return <div>Loading...</div>;

    const currentAppraisal = appraisals.length > 0 ? appraisals[0] : null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end relative">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-neon-cyan/5 blur-[100px] pointer-events-none"></div>
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neon-cyan mb-3 mono-font">
                        <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
                        PERF_EVAL_CYCLE_V2.1
                    </div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Appraisal <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet">Cycle</span></h1>
                    <p className="text-xs text-muted-foreground mono-font mt-2 uppercase tracking-widest">Accessing performance evaluation nodes.</p>
                </div>
                <div className="relative group">
                    <select className="border border-white/10 rounded-xl px-5 py-2.5 text-[10px] uppercase tracking-widest mono-font bg-black/40 text-foreground hover:bg-white/10 transition-all appearance-none cursor-pointer pr-10">
                        {cycles.map((cycle: any) => (
                            <option key={cycle.id} className="bg-background">{cycle.name}</option>
                        ))}
                        {cycles.length === 0 && <option className="bg-background text-muted-foreground">ZERO_ACTIVE_CYCLES</option>}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-neon-cyan transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-5 group hover:border-neon-cyan/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font font-bold mb-1">KEY_RESULTS</p>
                        <p className="text-2xl font-black text-foreground tracking-tighter mono-font group-hover:text-neon-cyan transition-colors">0</p>
                    </div>
                </div>
                <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-5 group hover:border-neon-violet/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-neon-violet/10 border border-neon-violet/20 flex items-center justify-center text-neon-violet group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font font-bold mb-1">CUSTOM_NODES</p>
                        <p className="text-2xl font-black text-foreground tracking-tighter mono-font group-hover:text-neon-violet transition-colors">{appraisals.length}</p>
                    </div>
                </div>
                <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-5 group hover:border-neon-pink/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center text-neon-pink group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font font-bold mb-1">360_FEEDBACK</p>
                        <p className="text-2xl font-black text-foreground tracking-tighter mono-font group-hover:text-neon-pink transition-colors">0</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-8 bg-card/40 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 blur-[120px] pointer-events-none group-hover:bg-neon-cyan/10 transition-colors"></div>
                        <div className="flex items-center gap-3 mb-8">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight mono-font">Evaluated <span className="text-muted-foreground">Telemetry</span></h2>
                            <div className="px-2 py-0.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/10 text-[8px] mono-font text-neon-cyan animate-pulse uppercase tracking-[0.2em]">STREAMING_VACT</div>
                        </div>

                        <div className="flex gap-16 items-center mb-16">
                            <div className="relative group/chart">
                                <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl opacity-0 group-hover/chart:opacity-100 transition-opacity"></div>
                                <DonutChart percentage={currentAppraisal?.totalScore || 0} label={`${currentAppraisal?.totalScore || 0}%`} />
                            </div>
                            <div className="space-y-8">
                                <div className="border-l-2 border-neon-cyan pl-6">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black mono-font mb-2">LAST_HANDSHAKE</p>
                                    <p className="text-2xl font-black text-neon-cyan mono-font tracking-tighter">
                                        {currentAppraisal?.createdAt ? new Date(currentAppraisal.createdAt).toDateString().toUpperCase() : 'N/A_SESSION'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-black/20 hover:border-neon-cyan/30 transition-all group/empty relative overflow-hidden">
                            <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover/empty:opacity-100 transition-opacity"></div>
                            <div className="w-80 h-40 bg-white/5 mb-8 rounded-2xl relative overflow-hidden group-hover:bg-white/10 transition-colors">
                                <div className="absolute top-0 left-0 w-full h-full flex flex-col gap-3 p-6">
                                    <div className="w-3/4 h-2 bg-white/10 rounded-full animate-pulse"></div>
                                    <div className="w-1/2 h-2 bg-white/10 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2/3 h-2 bg-white/10 rounded-full animate-pulse delay-150"></div>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tight mono-font">ZERO_OBJECTIVES_SYNCED</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mb-8">Baseline directives not detected in local buffer</p>
                            <Link href="/hrms/appraisal/create" className="px-10 py-3 bg-neon-cyan text-black rounded-xl hover:bg-neon-cyan/90 text-xs font-black transition-all uppercase tracking-widest mono-font shadow-glow-cyan hover:scale-105">
                                INIT_OBJECTIVE_SEQUENCE
                            </Link>
                        </div>
                    </div>

                    <div className="col-span-4 bg-gradient-to-br from-neon-violet to-neon-pink p-10 rounded-3xl relative overflow-hidden shadow-2xl group shadow-neon-violet/20">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl pointer-events-none group-hover:bg-white/30 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[8px] uppercase tracking-widest text-white mb-8 mono-font font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                AUTH_REVIEWER_NODE
                            </div>

                            <div className="space-y-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform">
                                        <span className="text-2xl font-black text-white">?</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-sm uppercase tracking-tighter mono-font mb-1 italic">PENDING_ASSIGNMENT</p>
                                        <p className="text-[10px] text-white/70 mono-font uppercase tracking-widest">SYS_CONTROLLER</p>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[9px] uppercase tracking-widest text-white/80 mono-font">NODE_PRIORITY</span>
                                        <span className="text-[10px] uppercase tracking-widest text-white font-black mono-font">CRITICAL</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-[85%] h-full bg-white animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
