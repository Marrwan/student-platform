'use client';

import React from 'react';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
}

interface Recognition {
    id: string;
    message: string;
    category: string;
    createdAt: string;
    sender: User;
    receiver: User;
}

interface RecognitionFeedProps {
    recognitions: Recognition[];
}

export default function RecognitionFeed({ recognitions }: RecognitionFeedProps) {
    if (!recognitions || recognitions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No recognitions yet. Be the first to give a shoutout!
            </div>
        );
    }

    const getCategoryEmoji = (category: string) => {
        switch (category) {
            case 'helpful': return '🤝';
            case 'innovative': return '💡';
            case 'teamwork': return '🙌';
            case 'leadership': return '⭐';
            default: return '👏';
        }
    };

    return (
        <ul className="space-y-4">
            {recognitions.map((recognition) => (
                <li key={recognition.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
                            {getCategoryEmoji(recognition.category)}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                            <span className="text-indigo-600 font-bold">{recognition.sender?.firstName}</span> gave a shoutout to{' '}
                            <span className="text-indigo-600 font-bold">{recognition.receiver?.firstName}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            "{recognition.message}"
                        </p>
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                            <span className="capitalize bg-gray-100 px-2 py-0.5 rounded mr-2 text-gray-600">
                                {recognition.category}
                            </span>
                            <span>{new Date(recognition.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
