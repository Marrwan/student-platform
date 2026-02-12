'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SupervisorViewContextType {
    isSupervisorView: boolean;
    toggleView: () => void;
}

const SupervisorViewContext = createContext<SupervisorViewContextType | undefined>(undefined);

export function SupervisorViewProvider({ children }: { children: ReactNode }) {
    const [isSupervisorView, setIsSupervisorView] = useState(false);

    const toggleView = () => {
        setIsSupervisorView((prev) => !prev);
    };

    return (
        <SupervisorViewContext.Provider value={{ isSupervisorView, toggleView }}>
            {children}
        </SupervisorViewContext.Provider>
    );
}

export function useSupervisorView() {
    const context = useContext(SupervisorViewContext);
    if (context === undefined) {
        throw new Error('useSupervisorView must be used within a SupervisorViewProvider');
    }
    return context;
}
