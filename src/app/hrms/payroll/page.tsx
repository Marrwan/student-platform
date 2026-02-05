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
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>

            <div className="grid grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-sm opacity-80 mb-1">Last Payment</p>
                    <p className="text-xl font-bold">{stats.lastPaymentDate}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">All-Time Earnings</p>
                    <p className="text-xl font-bold text-gray-900">₦ {stats.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Deductions</p>
                    <p className="text-xl font-bold text-gray-900">₦ {stats.totalDeductions.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Net Pay</p>
                    <p className="text-xl font-bold text-gray-900">₦ {stats.netPay.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 bg-blue-50/50 p-8 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-bold text-gray-900">Payroll Summary</h2>
                        <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm font-medium">Filter</button>
                    </div>

                    <div className="flex flex-col items-center">
                        <DonutChart
                            percentage={75}
                            size={200}
                            strokeWidth={20}
                            color="#8b5cf6"
                            label={`${(stats.netPay / 1000).toFixed(1)}K`}
                            sublabel="Net Pay"
                        />
                        <div className="flex gap-8 mt-8">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                <span className="text-sm text-purple-600 font-medium">Gross Pay</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-sm text-blue-600 font-medium">Deductions</span>
                            </div>
                        </div>
                        <div className="flex gap-12 mt-2">
                            <p className="font-bold text-gray-900">₦ {stats.totalEarnings.toLocaleString()}</p>
                            <p className="font-bold text-gray-900">₦ {stats.totalDeductions.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Payslip History</h2>
                        <Link href="#" className="text-sm text-blue-600 font-medium hover:underline">See All</Link>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {payrolls.map((payroll) => (
                            <Link key={payroll.id} href={`/hrms/payroll/${payroll.id}`} className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-blue-50 p-2 rounded text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <span className="font-medium text-gray-900">{payroll.month} {payroll.year} Payroll</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span>{new Date(payroll.paymentDate).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                        {payrolls.length === 0 && <p className="text-gray-500 text-center py-4">No payroll history found.</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
                    <div className="relative">
                        <input type="text" placeholder="Search Title" className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64" />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-blue-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Gross Pay</th>
                            <th className="px-6 py-4">Deductions</th>
                            <th className="px-6 py-4">Net Pay</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payrolls.map((payroll) => (
                            <tr key={payroll.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{payroll.month} {payroll.year} Payroll</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(payroll.paymentDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-gray-900">₦ {parseFloat(payroll.grossPay).toLocaleString()}</td>
                                <td className="px-6 py-4 text-gray-900">₦ {parseFloat(payroll.totalDeductions).toLocaleString()}</td>
                                <td className="px-6 py-4 text-gray-900">₦ {parseFloat(payroll.netPay).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${payroll.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            payroll.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {payroll.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
