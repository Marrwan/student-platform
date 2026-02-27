'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';

export default function SupervisorAppraisalList() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('reviewer');
    const [showCycleDropdown, setShowCycleDropdown] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState('Q3 2025 Appraisal test Cycle');
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchAppraisals = async () => {
            try {
                // @ts-ignore
                const data = await api.getSupervisorAppraisals();
                setEmployees(data);
            } catch (error) {
                console.error("Failed to fetch appraisals", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppraisals();
    }, []);

    const getStatusColor = (status: string) => {
        if (status === 'Pending reviewer\'s evaluation') return 'bg-yellow-50 text-foreground/90 hover:bg-yellow-100';
        if (status === 'Yet to start') return 'bg-red-50 text-red-700 hover:bg-red-100';
        return 'bg-background text-foreground/90';
    };

    const getStatusDot = (status: string) => {
        if (status === 'Pending reviewer\'s evaluation') return 'bg-yellow-400';
        if (status === 'Yet to start') return 'bg-red-400';
        return 'bg-gray-400';
    };

    return (
        <div className="bg-card/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl min-h-[600px] overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"></div>
            <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/10 text-[8px] uppercase tracking-[0.2em] text-neon-cyan mb-2 mono-font">
                            <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
                            EVAL_NODE_SET: PRIMARY
                        </div>
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mono-font">Personnel <span className="text-muted-foreground">Evaluation</span></h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mt-1">Personnel under current oversight</p>
                    </div>
                    <div className="flex gap-4 relative">
                        <button
                            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-cyan/30 text-neon-cyan px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest mono-font flex items-center gap-2"
                            onClick={() => setShowCycleDropdown(!showCycleDropdown)}
                        >
                            {selectedCycle.toUpperCase()}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {showCycleDropdown && (
                            <div className="absolute top-full right-0 mt-3 w-72 bg-card/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                <button onClick={() => { setSelectedCycle('Q3 2025 Appraisal test Cycle'); setShowCycleDropdown(false); }} className="block w-full text-left px-5 py-3 text-[10px] mono-font uppercase tracking-widest text-foreground hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors">Q3 2025 Appraisal test Cycle</button>
                                <button onClick={() => { setSelectedCycle('Latest Testing Cycle'); setShowCycleDropdown(false); }} className="block w-full text-left px-5 py-3 text-[10px] mono-font uppercase tracking-widest text-foreground hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors">Latest Testing Cycle</button>
                                <button onClick={() => { setSelectedCycle('Q2 2025 Test for Appraisal'); setShowCycleDropdown(false); }} className="block w-full text-left px-5 py-3 text-[10px] mono-font uppercase tracking-widest text-foreground hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors">Q2 2025 Test for Appraisal</button>
                            </div>
                        )}

                        <button className="w-10 h-10 flex items-center justify-center border border-white/10 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-neon-cyan transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 mb-8 gap-10">
                    <button
                        className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative mono-font ${activeTab === 'reviewer' ? 'text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('reviewer')}
                    >
                        AS_REVIEWER
                        <span className="ml-3 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px]">36</span>
                        {activeTab === 'reviewer' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan shadow-glow-cyan"></div>}
                    </button>
                    <button
                        className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative mono-font ${activeTab === 'countersigning' ? 'text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('countersigning')}
                    >
                        AS_COUNTERSIGNING
                        <span className="ml-3 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px]">19</span>
                        {activeTab === 'countersigning' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan shadow-glow-cyan"></div>}
                    </button>
                    <button
                        className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative mono-font ${activeTab === '360' ? 'text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setActiveTab('360')}
                    >
                        FEEDBACK_CIRCUIT
                        <span className="ml-3 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px]">01</span>
                        {activeTab === '360' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan shadow-glow-cyan"></div>}
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-neon-cyan"></div>
                        <span className="text-[10px] mono-font uppercase tracking-widest text-muted-foreground">EVAL_STREAM: ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group/search">
                            <input
                                type="text"
                                placeholder="SEARCH_STAFF_ID..."
                                className="pl-4 pr-10 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] w-64 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all mono-font uppercase tracking-widest text-foreground"
                            />
                            <svg className="w-4 h-4 text-muted-foreground absolute right-4 top-2.5 group-focus-within/search:text-neon-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <table className="w-full text-left text-[11px] mono-font uppercase tracking-widest">
                    <thead className="bg-white/[0.02] text-muted-foreground border-y border-white/5">
                        <tr>
                            <th className="px-8 py-5 font-black">ENTITY_IDENTIFIER</th>
                            <th className="px-8 py-5 font-black">LIFECYCLE_STATUS</th>
                            <th className="px-8 py-5 font-black">NODE_ROLE</th>
                            <th className="px-8 py-5 font-black">VAL_INDEX</th>
                            <th className="px-8 py-5 font-black">MGMT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-12 text-muted-foreground animate-pulse">STREAMING_PERSONNEL_DATA...</td></tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-white/[0.03] transition-colors group/row cursor-pointer" onClick={() => router.push(`/hrms/appraisal/${emp.id}/report`)}>
                                    <td className="px-8 py-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-neon-cyan group-hover/row:border-neon-cyan/50 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <div>
                                            <div className="font-black text-foreground group-hover/row:text-neon-cyan transition-colors">{emp.name}</div>
                                            <div className="text-[9px] text-muted-foreground opacity-70">{emp.department}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border ${emp.status.includes('Pending') ? 'bg-neon-amber/5 text-neon-amber border-neon-amber/20 shadow-glow-amber/10' : emp.status.includes('Yet') ? 'bg-red-500/5 text-red-500 border-red-500/20 shadow-glow-red/10' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                                            <span className={`w-1 h-1 rounded-full ${emp.status.includes('Pending') ? 'bg-neon-amber animate-pulse' : emp.status.includes('Yet') ? 'bg-red-500' : 'bg-muted-foreground'}`}></span>
                                            {emp.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-muted-foreground">{emp.box}</td>
                                    <td className="px-8 py-5 font-black text-foreground">{emp.score}</td>
                                    <td className="px-8 py-5">
                                        <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:bg-white/10 transition-all">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="p-8 border-t border-white/5 flex justify-between items-center text-[10px] mono-font uppercase tracking-widest text-muted-foreground">
                    <div>DATA_NODES: {employees.length} OF 36</div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-neon-cyan text-black font-black">01</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-foreground">02</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
