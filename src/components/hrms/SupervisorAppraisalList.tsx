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
        if (status === 'Pending reviewer\'s evaluation') return 'bg-yellow-50 text-gray-700 hover:bg-yellow-100';
        if (status === 'Yet to start') return 'bg-red-50 text-red-700 hover:bg-red-100';
        return 'bg-gray-50 text-gray-700';
    };

    const getStatusDot = (status: string) => {
        if (status === 'Pending reviewer\'s evaluation') return 'bg-yellow-400';
        if (status === 'Yet to start') return 'bg-red-400';
        return 'bg-gray-400';
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm min-h-[600px]">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Employee List</h2>
                        <p className="text-gray-500">Your Appraisee Team</p>
                    </div>
                    <div className="flex gap-2 relative">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                            onClick={() => setShowCycleDropdown(!showCycleDropdown)}
                        >
                            {selectedCycle}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {showCycleDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                                <button onClick={() => { setSelectedCycle('Q3 2025 Appraisal test Cycle'); setShowCycleDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Q3 2025 Appraisal test Cycle</button>
                                <button onClick={() => { setSelectedCycle('Latest Testing Cycle'); setShowCycleDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Latest Testing Cycle</button>
                                <button onClick={() => { setSelectedCycle('Q2 2025 Test for Appraisal'); setShowCycleDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Q2 2025 Test for Appraisal</button>
                            </div>
                        )}

                        <button className="p-2 border border-gray-200 rounded hover:bg-gray-50">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button className="p-2 border border-gray-200 rounded hover:bg-gray-50">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6 gap-6">
                    <button
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reviewer' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('reviewer')}
                    >
                        As Reviewer <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">36</span>
                    </button>
                    <button
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'countersigning' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('countersigning')}
                    >
                        As Countersigning Officer <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">19</span>
                    </button>
                    <button
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === '360' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('360')}
                    >
                        360 Feedback <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">1</span>
                    </button>
                </div>

                <div className="flex justify-end mb-4 gap-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    </button>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Staff"
                            className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-[#f0f4ff] text-xs uppercase text-gray-700 font-medium">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">9-Box Position</th>
                            <th className="px-6 py-4">Score (%)</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/hrms/appraisal/${emp.id}/report`)}>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{emp.name}</div>
                                        <div className="text-xs text-gray-500">{emp.department}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(emp.status)}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(emp.status)}`}></span>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{emp.box}</td>
                                <td className="px-6 py-4">{emp.score}</td>
                                <td className="px-6 py-4">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <div>Showing 1 to 20 of 36 entries</div>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
