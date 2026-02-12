'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import StandupForm from '@/components/standup/StandupForm';
import ActionItemsList from '@/components/standup/ActionItemsList';
import { useAuth } from '@/components/providers/auth-provider';

export default function StandupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const standupId = params?.id as string;

    const [standup, setStandup] = useState<any>(null);
    const [attendance, setAttendance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'submit' | 'responses' | 'attendance' | 'actions'>('submit');

    useEffect(() => {
        if (standupId) {
            fetchStandupDetails();
        }
    }, [standupId]);

    const fetchStandupDetails = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const [standupData, attendanceData] = await Promise.all([
                api.getStandupById(standupId),
                api.getStandupAttendance(standupId)
            ]);
            setStandup(standupData);
            setAttendance(attendanceData);
        } catch (error) {
            console.error('Failed to fetch standup:', error);
        } finally {
            setLoading(false);
        }
    };

    const userResponse = standup?.responses?.find((r: any) => r.userId === user?.id);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!standup) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Standup not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Standups
                </button>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{standup.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📅 {new Date(standup.scheduledFor).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {standup.team && <span>👥 {standup.team.name}</span>}
                </div>
                {standup.description && (
                    <p className="text-gray-600 mt-2">{standup.description}</p>
                )}
            </div>

            {/* Stats */}
            {attendance && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-500">Total Responses</p>
                        <p className="text-2xl font-bold text-gray-900">{attendance.total}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-sm text-green-600">Present</p>
                        <p className="text-2xl font-bold text-green-700">{attendance.present}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <p className="text-sm text-yellow-600">Late</p>
                        <p className="text-2xl font-bold text-yellow-700">{attendance.late}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-sm text-red-600">Absent</p>
                        <p className="text-2xl font-bold text-red-700">{attendance.absent}</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-6">
                    {['submit', 'responses', 'attendance', 'actions'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-3 px-1 border-b-2 font-medium capitalize transition-colors ${activeTab === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'submit' ? 'My Response' : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'submit' && (
                    <StandupForm
                        standupId={standupId}
                        existingResponse={userResponse}
                        onSubmit={fetchStandupDetails}
                    />
                )}

                {activeTab === 'responses' && (
                    <div className="space-y-4">
                        {standup.responses?.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
                                <p className="text-gray-500">No responses submitted yet</p>
                            </div>
                        ) : (
                            standup.responses?.map((response: any) => (
                                <div key={response.id} className="bg-white p-6 rounded-xl border border-gray-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-bold text-gray-900">
                                                {response.user?.firstName} {response.user?.lastName}
                                            </h4>
                                            <p className="text-sm text-gray-500">{response.user?.email}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${response.attendanceStatus === 'present' ? 'bg-green-100 text-green-700' :
                                            response.attendanceStatus === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {response.attendanceStatus}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">What did you do? 🚀</p>
                                            <p className="text-gray-600">{response.whatDidYouDo || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">What will you do? 📅</p>
                                            <p className="text-gray-600">{response.whatWillYouDo || 'N/A'}</p>
                                        </div>
                                        {response.blockers && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">Blockers 🚧</p>
                                                <p className="text-gray-600">{response.blockers}</p>
                                            </div>
                                        )}
                                    </div>
                                    {response.submittedAt && (
                                        <p className="text-xs text-gray-400 mt-4">
                                            Submitted {new Date(response.submittedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'attendance' && attendance && (
                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <div className="grid gap-3">
                            {attendance.responses.map((response: any) => (
                                <div key={response.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {response.user?.firstName?.[0]}{response.user?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {response.user?.firstName} {response.user?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">{response.user?.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${response.attendanceStatus === 'present' ? 'bg-green-100 text-green-700' :
                                        response.attendanceStatus === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {response.attendanceStatus === 'present' ? '✅ Present' :
                                            response.attendanceStatus === 'late' ? '⏰ Late' :
                                                '❌ Absent'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <ActionItemsList standupId={standupId} />
                    </div>
                )}
            </div>
        </div>
    );
}
