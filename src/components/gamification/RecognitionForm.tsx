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
        <div className="glass-card p-6 sm:p-8 rounded-xl border border-white/5 relative overflow-hidden group">
            <h3 className="text-lg font-medium tracking-tight mb-4 text-foreground flex items-center gap-2">
                Give a Shoutout 📢
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground">Who do you want to recognize?</label>
                    <select
                        value={toUserId}
                        onChange={(e) => setToUserId(e.target.value)}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-background/50 border border-white/10 text-foreground focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan sm:text-sm rounded-md"
                    >
                        <option value="" className="bg-background text-foreground">Select a peer...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id} className="bg-background text-foreground">{u.firstName} {u.lastName}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground">Category</label>
                    <div className="mt-2 flex gap-2">
                        {['helpful', 'innovative', 'teamwork', 'leadership'].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition-colors ${category === cat
                                    ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20'
                                    : 'bg-background/50 text-muted-foreground border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={3}
                        placeholder="Why are you recognizing them?"
                        className="mt-1 block w-full bg-background/50 border border-white/10 text-foreground shadow-sm focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan sm:text-sm rounded-md placeholder-muted-foreground"
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-neon-cyan/50 text-sm font-medium rounded-md shadow-[0_0_15px_rgba(0,255,255,0.3)] text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-neon-cyan disabled:opacity-50 transition-all duration-300"
                    >
                        {loading ? 'Sending...' : 'Send Shoutout'}
                    </button>
                </div>
            </form>
        </div>
    );
}
