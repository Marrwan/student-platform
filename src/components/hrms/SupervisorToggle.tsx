'use client';

import React from 'react';
import { useSupervisorView } from './SupervisorViewContext';

export default function SupervisorToggle() {
    const { isSupervisorView, toggleView } = useSupervisorView();

    return (
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span className={`text-sm font-medium ${isSupervisorView ? 'text-blue-700' : 'text-muted-foreground'}`}>
                Supervisor View
            </span>
            <button
                onClick={toggleView}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSupervisorView ? 'bg-blue-600' : 'bg-white/10'
                    }`}
                role="switch"
                aria-checked={isSupervisorView}
            >
                <span className="sr-only">Enable Supervisor View</span>
                <span
                    className={`${isSupervisorView ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-card/40 backdrop-blur-xl transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
}
