'use client';

import HRMSSidebar from '@/components/hrms/HRMSSidebar';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/components/providers/auth-provider';

import { SupervisorViewProvider } from '@/components/hrms/SupervisorViewContext';
import SupervisorToggle from '@/components/hrms/SupervisorToggle';

export default function HRMSLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    return (
        <ProtectedRoute allowedRoles={['admin', 'partial_admin']}>
            <SupervisorViewProvider>
                <div className="flex min-h-screen bg-gray-50">
                    <HRMSSidebar />
                    <div className="ml-64 flex-1">
                        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-50">
                            <div className="flex items-center gap-4 text-gray-500 text-sm">
                                {/* Breadcrumbs or Title could go here */}
                                <span className="font-medium text-gray-900">Human Resource System</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <SupervisorToggle />
                                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                                {/* Notification & Profile Icons */}
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                                        <div className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</div>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                </div>
                            </div>
                        </header>
                        <main className="p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </SupervisorViewProvider>
        </ProtectedRoute>
    );
}
