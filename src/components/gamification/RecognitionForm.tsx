'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface RecognitionFormProps {
    users: Array<{ id: string, firstName: string, lastName: string }>;
    onSuccess: () => void;
}

export default function RecognitionForm({ users, onSuccess }: RecognitionFormProps) {
    const [toUserId, setToUserId] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('helpful');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!toUserId || !message) return;

        setLoading(true);
        try {
            await api.sendRecognition({
                toUserId,
                message,
                category,
                isPublic: true
            });
            setMessage('');
            setToUserId('');
            setCategory('helpful');
            onSuccess();
            alert('Recognition sent!');
        } catch (error) {
            console.error('Failed to send recognition:', error);
            alert('Failed to send recognition');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Give a Shoutout 📢</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Who do you want to recognize?</label>
                    <select
                        value={toUserId}
                        onChange={(e) => setToUserId(e.target.value)}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select a peer...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <div className="mt-2 flex gap-2">
                        {['helpful', 'innovative', 'teamwork', 'leadership'].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border ${category === cat
                                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={3}
                        placeholder="Why are you recognizing them?"
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Shoutout'}
                    </button>
                </div>
            </form>
        </div>
    );
}
