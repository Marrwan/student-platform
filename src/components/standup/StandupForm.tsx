'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface StandupFormProps {
    standupId: string;
    onSubmit?: () => void;
    existingResponse?: {
        whatDidYouDo: string;
        whatWillYouDo: string;
        blockers: string;
        attendanceStatus: 'present' | 'absent' | 'late';
    };
}

export default function StandupForm({ standupId, onSubmit, existingResponse }: StandupFormProps) {
    const [formData, setFormData] = useState({
        whatDidYouDo: existingResponse?.whatDidYouDo || '',
        whatWillYouDo: existingResponse?.whatWillYouDo || '',
        blockers: existingResponse?.blockers || '',
        attendanceStatus: existingResponse?.attendanceStatus || 'present' as 'present' | 'absent' | 'late'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // @ts-ignore
            await api.submitStandupResponse(standupId, formData);
            setSuccess(true);
            if (onSubmit) onSubmit();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit standup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Weekly Standup</h3>
                <select
                    value={formData.attendanceStatus}
                    onChange={(e) => setFormData({ ...formData, attendanceStatus: e.target.value as any })}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="present">✅ Present</option>
                    <option value="late">⏰ Late</option>
                    <option value="absent">❌ Absent</option>
                </select>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
                    ✅ Standup submitted successfully!
                </div>
            )}

            {/* Question 1 */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    What did you do this week? 🚀
                </label>
                <textarea
                    value={formData.whatDidYouDo}
                    onChange={(e) => setFormData({ ...formData, whatDidYouDo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Share your accomplishments, tasks completed, or progress made..."
                    required
                />
                <p className="text-xs text-gray-500 mt-1">Be specific: projects worked on, bugs fixed, features shipped</p>
            </div>

            {/* Question 2 */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    What will you do next week? 📅
                </label>
                <textarea
                    value={formData.whatWillYouDo}
                    onChange={(e) => setFormData({ ...formData, whatWillYouDo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Your plans, goals, or upcoming tasks..."
                    required
                />
                <p className="text-xs text-gray-500 mt-1">Set clear, actionable goals for the coming week</p>
            </div>

            {/* Question 3 */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Any blockers or challenges? 🚧 <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                    value={formData.blockers}
                    onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Anything slowing you down or help you need..."
                />
                <p className="text-xs text-gray-500 mt-1">Don't hesitate to ask for help!</p>
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Submitting...' : existingResponse ? 'Update Response' : 'Submit Standup'}
                </button>
                {existingResponse && (
                    <button
                        type="button"
                        onClick={() => setFormData({
                            whatDidYouDo: existingResponse.whatDidYouDo,
                            whatWillYouDo: existingResponse.whatWillYouDo,
                            blockers: existingResponse.blockers,
                            attendanceStatus: existingResponse.attendanceStatus
                        })}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>
        </form>
    );
}
