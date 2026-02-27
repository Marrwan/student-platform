'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function TeamMembersTable() {
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            try {
                // @ts-ignore
                const data = await api.getTeamMembers(1, 10, searchTerm);
                setMembers(data.members);
                setTotal(data.totalMembers);
            } catch (error) {
                console.error("Failed to fetch team members", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchMembers();
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <div className="bg-card/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl mt-12 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"></div>
            <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/10 text-[8px] uppercase tracking-[0.2em] text-neon-cyan mb-2 mono-font">
                        <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
                        DATA_NODE_SET: PERS_DB
                    </div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight mono-font">Personnel <span className="text-muted-foreground">Registry</span></h3>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] mono-font text-neon-cyan">{total} UNITS</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group/search">
                        <input
                            type="text"
                            placeholder="SEARCH_TELEMETRY..."
                            className="pl-4 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs w-72 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all mono-font uppercase tracking-widest text-foreground"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="w-4 h-4 text-muted-foreground absolute right-4 top-3 group-focus-within/search:text-neon-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-cyan/30 text-muted-foreground hover:text-neon-cyan px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest mono-font">
                        BROWSE_ALL
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] mono-font uppercase tracking-widest">
                    <thead className="bg-white/[0.02] text-muted-foreground border-y border-white/5">
                        <tr>
                            <th className="px-8 py-5 font-black">ENTITY_IDENTIFIER</th>
                            <th className="px-8 py-5 font-black">COMM_CHANNEL</th>
                            <th className="px-8 py-5 font-black">NODE_ROLE</th>
                            <th className="px-8 py-5 font-black">LOC_COORDS</th>
                            <th className="px-8 py-5 font-black">SYS_STATUS</th>
                            <th className="px-8 py-5 font-black">MGMT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-12 text-muted-foreground animate-pulse">SYNCHRONIZING_DATABASE...</td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">ZERO_RECORDS_AVAILABLE</td></tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} className="hover:bg-white/[0.03] transition-colors group/row">
                                    <td className="px-8 py-5 flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-neon-cyan group-hover/row:border-neon-cyan/50 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <span className="font-black text-foreground group-hover/row:text-neon-cyan transition-colors">{member.name}</span>
                                    </td>
                                    <td className="px-8 py-5 text-muted-foreground lowercase">{member.email}</td>
                                    <td className="px-8 py-5 text-muted-foreground">{member.designation}</td>
                                    <td className="px-8 py-5 text-muted-foreground">{member.location}</td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border ${member.status === 'Active' ? 'bg-neon-emerald/5 text-neon-emerald border-neon-emerald/20 shadow-glow-emerald/10' : 'bg-neon-amber/5 text-neon-amber border-neon-amber/20'}`}>
                                            <span className={`w-1 h-1 rounded-full ${member.status === 'Active' ? 'bg-neon-emerald animate-pulse' : 'bg-neon-amber'}`}></span>
                                            {member.status === 'Active' ? 'OPERATIONAL' : 'SUSPENDED'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:bg-white/10 transition-all">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-muted-foreground">
                <div>Showing {members.length} of {total} entries</div>
                {/* Pagination logic would go here */}
            </div>
        </div>
    );
}
