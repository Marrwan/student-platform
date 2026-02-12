'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function AppraisalReportPage() {
    const router = useRouter();
    const params = useParams();
    const [objectivesExpanded, setObjectivesExpanded] = useState(true);
    const [customAppraisalExpanded, setCustomAppraisalExpanded] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Link href="/hrms/appraisal" className="hover:text-blue-600">Appraisal</Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <Link href="/hrms/appraisal" className="hover:text-blue-600">Appraisal Status</Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="text-gray-900 font-medium">Joshua Simire</span>
            </div>

            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Go Back
            </button>

            {/* Main Report Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-full opacity-10 bg-white/10 skew-x-12 transform translate-x-10"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-sm opacity-80 mb-1">Appraisal Report</h2>
                            <h1 className="text-2xl font-bold">12 Feb 2026</h1>
                        </div>
                        <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Decline Objectives
                        </button>
                    </div>
                </div>

                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-4 border-white shadow-sm">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Joshua Simire</h2>
                            <p className="text-gray-500 text-sm">A2021172</p>
                            <p className="text-gray-700 font-medium mt-1">Product Manager</p>

                            <div className="mt-4 flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Appraisal Cycle</span>
                                <span className="font-medium text-gray-900">Q3 2025 Appraisal test Cycle</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 text-white p-6 rounded-xl w-full md:w-80 shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="text-sm opacity-80 mb-1">Employee final score</div>
                            <div className="text-4xl font-bold mb-4">90.0%</div>
                            <div className="text-xs opacity-70">Period: <span className="font-bold">Q3 2025 Test Appraisal Period</span></div>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Objectives Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                    onClick={() => setObjectivesExpanded(!objectivesExpanded)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <h3 className="font-medium text-gray-700">Objectives and Key Results</h3>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full border border-blue-600 flex items-center justify-center text-[8px] text-blue-600">🎯</span> 1 Objective(s)</span>
                            <span className="flex items-center gap-1"><span className="w-4 h-4 flex items-center justify-center text-blue-600 text-[10px]">📊</span> 2 Key result(s)</span>
                        </div>
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Awaiting Supervisor Evaluation
                        </span>
                        <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${objectivesExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </button>

                {objectivesExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-gray-50/50">
                        <div className="bg-white rounded-lg border border-gray-100 p-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h4 className="font-medium text-gray-900">Objective test</h4>
                                </div>
                                <button className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Appraisal Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                    onClick={() => setCustomAppraisalExpanded(!customAppraisalExpanded)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <h3 className="font-medium text-gray-700">Custom Appraisal</h3>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            1 Assessment Criteria(s)
                        </span>
                        <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${customAppraisalExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </button>
            </div>
        </div>
    );
}
