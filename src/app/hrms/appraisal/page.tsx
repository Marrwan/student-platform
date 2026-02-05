'use client';

import DonutChart from '@/components/hrms/DonutChart';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AppraisalPage() {
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

    if (loading) return <div>Loading...</div>;

    const currentAppraisal = appraisals.length > 0 ? appraisals[0] : null;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Appraisal Cycle</h1>
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white">
                    {cycles.map((cycle: any) => (
                        <option key={cycle.id}>{cycle.name}</option>
                    ))}
                    {cycles.length === 0 && <option>No Active Cycle</option>}
                </select>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Key Results</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {/* Calculate total key results across objectives - simplified for now */}
                            0
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Custom Appraisal</p>
                        <p className="text-2xl font-bold text-gray-900">{appraisals.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">360 Appraisal</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 bg-white p-8 rounded-xl border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Appraisal History</h2>
                    <div className="flex gap-12 items-center mb-12">
                        <DonutChart percentage={currentAppraisal?.totalScore || 0} label={`${currentAppraisal?.totalScore || 0}%`} />
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Appraisal Started On</p>
                                <p className="text-blue-600 font-bold">
                                    {currentAppraisal?.createdAt ? new Date(currentAppraisal.createdAt).toDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-200 rounded-lg">
                        <div className="w-64 h-32 bg-gray-50 mb-4 rounded-lg animate-pulse"></div>
                        <h3 className="text-lg font-bold text-blue-600 mb-2">No Objectives Created Yet</h3>
                        <Link href="/hrms/appraisal/create" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                            Create Objective
                        </Link>
                    </div>
                </div>

                <div className="col-span-4 bg-blue-600 text-white p-8 rounded-xl">
                    {/* Reviewer info would come from currentAppraisal.reviewer */}
                    <div className="space-y-6 mb-8 mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="font-bold">?</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm">Reviewer</p>
                                <p className="text-xs opacity-80">Pending Assignment</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
