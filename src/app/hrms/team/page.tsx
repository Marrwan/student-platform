'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import TeamMembersTable from '@/components/hrms/TeamMembersTable';

export default function TeamManagementPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('members');

    const [squads, setSquads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchSquads = async () => {
            try {
                // @ts-ignore
                const data = await api.getTeams();
                setSquads(data);
            } catch (error) {
                console.error("Failed to fetch teams", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSquads();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Unit Name</div>
                        <div className="font-bold text-gray-900 text-lg">Innovation & Technology</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Unit Head</div>
                        <div className="font-bold text-blue-600 text-lg">{user?.firstName} {user?.lastName}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Total Members</div>
                        <div className="font-bold text-gray-900 text-lg">
                            {squads.reduce((acc, s) => acc + (parseInt(s.staffCount) || 0), 0) || '...'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Average appraisal score</div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-lg">0</span>
                            <select className="text-xs border-gray-200 rounded text-gray-500">
                                <option>Change appraisal cycle</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm min-h-[600px]">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Squads</h2>
                            <p className="text-gray-500">Manage your team</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <button className="p-2 border border-gray-200 rounded hover:bg-gray-50">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'squads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('squads')}
                        >
                            Squads <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded ml-2">3</span>
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'units' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('units')}
                        >
                            Units
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('members')}
                        >
                            Members <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded ml-2">
                                {squads.reduce((acc, s) => acc + (parseInt(s.staffCount) || 0), 0) || '...'}
                            </span>
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reportees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('reportees')}
                        >
                            Reportees <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded ml-2">36</span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'members' && (
                        <TeamMembersTable />
                    )}

                    {activeTab === 'squads' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name"
                                        className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-blue-50 text-xs uppercase text-gray-700 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">S/N</th>
                                        <th className="px-6 py-4">Team Name</th>
                                        <th className="px-6 py-4">Team Lead</th>
                                        <th className="px-6 py-4">Parent team</th>
                                        <th className="px-6 py-4">No.of Staff</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {squads.map((squad, index) => (
                                        <tr key={squad.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{index + 1}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{squad.name}</td>
                                            <td className="px-6 py-4">{squad.lead}</td>
                                            <td className="px-6 py-4">{squad.parentTeam}</td>
                                            <td className="px-6 py-4">{squad.staffCount}</td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 mt-4">
                                <div>Showing 1 to {squads.length} of {squads.length} entries</div>
                                <div className="flex gap-1">
                                    <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white">1</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Placeholders for other tabs */}
                    {(activeTab === 'units' || activeTab === 'reportees') && (
                        <div className="text-center py-12 text-gray-500">
                            No data available for this view yet.
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
