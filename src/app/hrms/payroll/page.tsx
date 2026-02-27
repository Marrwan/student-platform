'use client';

import DonutChart from '@/components/hrms/DonutChart';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PayrollPage() {
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        totalDeductions: 0,
        netPay: 0,
        lastPaymentDate: 'N/A'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // @ts-ignore
                const data = await api.getMyPayrollHistory();
                setPayrolls(data);

                // Calculate stats
                const totalEarnings = data.reduce((acc: number, curr: any) => acc + parseFloat(curr.grossPay), 0);
                const totalDeductions = data.reduce((acc: number, curr: any) => acc + parseFloat(curr.totalDeductions), 0);
                const netPay = data.reduce((acc: number, curr: any) => acc + parseFloat(curr.netPay), 0);
                const lastPayment = data.length > 0 ? new Date(data[0].paymentDate).toDateString() : 'N/A';

                setStats({
                    totalEarnings,
                    totalDeductions,
                    netPay,
                    lastPaymentDate: lastPayment
                });
            } catch (error) {
                console.error("Failed to fetch payroll history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/10 text-[8px] uppercase tracking-[0.2em] text-neon-cyan mb-2 mono-font">
                        <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
                        MODULE: PAYROLL_ENGINE_V4.2
                    </div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tight mono-font">Financial <span className="text-muted-foreground">Ledger</span></h1>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest mono-font hover:bg-white/10 transition-all text-muted-foreground hover:text-foreground">
                        EXPORT_LOGS
                    </button>
                    <button className="px-6 py-2.5 bg-neon-cyan text-black rounded-xl text-[10px] font-black uppercase tracking-widest mono-font shadow-glow-cyan hover:scale-105 transition-all">
                        DISBURSE_BATCH
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-8">
                <div className="bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 p-8 rounded-3xl border border-white/10 relative overflow-hidden group shadow-2xl">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-cyan/10 blur-3xl group-hover:bg-neon-cyan/20 transition-colors"></div>
                    <div className="w-12 h-12 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center mb-6 text-neon-cyan">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mb-2">LAST_HANDSHAKE</p>
                    <p className="text-xl font-black text-foreground mono-font uppercase">{stats.lastPaymentDate}</p>
                </div>

                <div className="bg-card/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 text-muted-foreground group-hover:text-neon-emerald transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mb-2">AGGREGATE_EARNINGS</p>
                    <p className="text-xl font-black text-neon-emerald mono-font">₦ {stats.totalEarnings.toLocaleString()}</p>
                </div>

                <div className="bg-card/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 text-muted-foreground group-hover:text-red-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mb-2">SYSTEM_DEDUCTIONS</p>
                    <p className="text-xl font-black text-red-500 mono-font">₦ {stats.totalDeductions.toLocaleString()}</p>
                </div>

                <div className="bg-card/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 text-muted-foreground group-hover:text-neon-cyan transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mb-2">NET_ALLOCATION</p>
                    <p className="text-xl font-black text-neon-cyan mono-font">₦ {stats.netPay.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-8 bg-card/40 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-violet/5 blur-[120px] pointer-events-none group-hover:bg-neon-violet/10 transition-colors"></div>
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight mono-font">Visual <span className="text-muted-foreground">Telementry</span></h2>
                        <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] mono-font text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-neon-violet animate-ping"></span>
                            LIVE_CALCULATION
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="relative group/chart translate-x-12">
                            <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl opacity-0 group-hover/chart:opacity-100 transition-opacity"></div>
                            <DonutChart
                                percentage={75}
                                size={280}
                                strokeWidth={24}
                                color="var(--neon-violet)"
                                label={`${(stats.netPay / 1000).toFixed(1)}K`}
                                sublabel="NET_PAY_BUFFER"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-16 mt-16 w-full max-w-md">
                            <div className="border-l-2 border-neon-cyan pl-6">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-black mono-font mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-neon-cyan"></span>
                                    GROSS_CACHE
                                </p>
                                <p className="text-2xl font-black text-foreground mono-font tracking-tighter">₦ {stats.totalEarnings.toLocaleString()}</p>
                            </div>
                            <div className="border-l-2 border-neon-violet pl-6">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-black mono-font mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-neon-violet"></span>
                                    LEAK_INDEX
                                </p>
                                <p className="text-2xl font-black text-foreground mono-font tracking-tighter">₦ {stats.totalDeductions.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-4 space-y-8">
                    <div className="bg-card/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-sm font-black text-foreground uppercase tracking-widest mono-font">Sync <span className="text-muted-foreground">History</span></h2>
                            <Link href="#" className="text-[10px] text-neon-cyan mono-font uppercase tracking-widest hover:underline">RECOVER_ALL</Link>
                        </div>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {payrolls.map((payroll) => (
                                <Link key={payroll.id} href={`/hrms/payroll/${payroll.id}`} className="block p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-neon-cyan/30 transition-all group/item">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-neon-cyan group-hover/item:text-white transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <span className="text-xs font-black text-foreground mono-font uppercase tracking-tighter">{payroll.month} {payroll.year}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mono-font opacity-60 group-hover/item:opacity-100">{new Date(payroll.paymentDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-neon-cyan w-full opacity-30"></div>
                                    </div>
                                </Link>
                            ))}
                            {payrolls.length === 0 && (
                                <div className="text-center py-10">
                                    <div className="text-muted-foreground mono-font text-[10px] uppercase animate-pulse">ZERO_RECORDS_SYNCED</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative group">
                <div className="p-10 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight mono-font">Transaction <span className="text-muted-foreground">Archive</span></h2>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mono-font mt-1">Immutable ledger entries</p>
                    </div>
                    <div className="relative group/search">
                        <input
                            type="text"
                            placeholder="QUERY_LEDGER_ID..."
                            className="pl-10 pr-6 py-2.5 bg-black/40 border border-white/10 rounded-xl text-[10px] w-80 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all mono-font uppercase tracking-widest text-foreground"
                        />
                        <svg className="w-4 h-4 text-muted-foreground absolute left-4 top-3 group-focus-within/search:text-neon-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] mono-font uppercase tracking-widest">
                        <thead className="bg-white/[0.02] text-muted-foreground border-b border-white/5">
                            <tr>
                                <th className="px-10 py-6 font-black">LEDGER_TITLE</th>
                                <th className="px-10 py-6 font-black">SYNC_DATE</th>
                                <th className="px-10 py-6 font-black">GROSS_VAL</th>
                                <th className="px-10 py-6 font-black">DEDUCTIONS</th>
                                <th className="px-10 py-6 font-black">NET_FLUX</th>
                                <th className="px-10 py-6 font-black">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {payrolls.map((payroll) => (
                                <tr key={payroll.id} className="hover:bg-white/[0.03] transition-colors group/row">
                                    <td className="px-10 py-6 font-black text-foreground group-hover:text-neon-cyan transition-colors">{payroll.month} {payroll.year} PAYROLL</td>
                                    <td className="px-10 py-6 text-muted-foreground">
                                        {new Date(payroll.paymentDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-6 text-foreground font-black">₦ {parseFloat(payroll.grossPay).toLocaleString()}</td>
                                    <td className="px-10 py-6 text-red-500/80 font-black">₦ {parseFloat(payroll.totalDeductions).toLocaleString()}</td>
                                    <td className="px-10 py-6 text-neon-cyan font-black">₦ {parseFloat(payroll.netPay).toLocaleString()}</td>
                                    <td className="px-10 py-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border ${payroll.status === 'paid' ? 'bg-neon-emerald/5 text-neon-emerald border-neon-emerald/20 shadow-glow-emerald/10' :
                                                payroll.status === 'processing' ? 'bg-neon-amber/5 text-neon-amber border-neon-amber/20 shadow-glow-amber/10' :
                                                    'bg-red-500/5 text-red-500 border-red-500/20'
                                            }`}>
                                            <span className={`w-1 h-1 rounded-full ${payroll.status === 'paid' ? 'bg-neon-emerald animate-pulse' : payroll.status === 'processing' ? 'bg-neon-amber animate-pulse' : 'bg-red-500'}`}></span>
                                            {payroll.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
