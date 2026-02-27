'use client';

import HRMSSidebar from '@/components/hrms/HRMSSidebar';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/components/providers/auth-provider';

import { SupervisorViewProvider } from '@/components/hrms/SupervisorViewContext';
import SupervisorToggle from '@/components/hrms/SupervisorToggle';

export default function HRMSLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    return (
        <ProtectedRoute allowedRoles={['admin', 'instructor', 'staff']}>
            <SupervisorViewProvider>
                <div className="flex min-h-screen bg-background text-foreground">
                    <HRMSSidebar />
                    <div className="ml-64 flex-1 flex flex-col">
                        <header className="bg-background/40 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-8 sticky top-0 z-50">
                            <div className="flex items-center gap-4 text-muted-foreground text-[10px] uppercase tracking-widest mono-font">
                                <span className="text-neon-cyan/50">&gt;</span>
                                <span className="font-bold text-foreground">HR_SYSTEM_ROOT</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <SupervisorToggle />
                                <div className="h-4 w-px bg-white/10 mx-2"></div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[11px] font-bold text-foreground mono-font uppercase tracking-tight">
                                            {user?.firstName?.toUpperCase()}_{user?.lastName?.toUpperCase()}
                                        </div>
                                        <div className="text-[9px] text-neon-violet font-bold mono-font uppercase tracking-widest opacity-80">
                                            {user?.role?.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-neon-cyan font-bold mono-font text-xs hover-glow-cyan transition-all">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                </div>
                            </div>
                        </header>
                        <main className="p-8 flex-1 bg-gradient-to-b from-black/20 to-transparent">
                            {children}
                        </main>
                    </div>
                </div>
            </SupervisorViewProvider>
        </ProtectedRoute>
    );
}
