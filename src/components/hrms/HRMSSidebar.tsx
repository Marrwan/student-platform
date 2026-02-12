'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers/auth-provider';

export default function HRMSSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const hasPermission = (permission: string) => {
        if (!user) return false;
        // Legacy admin capability
        if (user.role === 'admin') return true;

        // Check permissions array
        if (user.permissions && Array.isArray(user.permissions)) {
            return user.permissions.includes(permission);
        }

        return false;
    };

    const allNavItems = [
        {
            name: 'Dashboard',
            href: '/hrms/dashboard',
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            permission: 'hrms.view_dashboard'
        },
        {
            name: 'Team Management',
            href: '/hrms/team',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            permission: 'hrms.view_dashboard' // Using basic permission for now, strictly should be supervisor or have reportees
        },
        {
            name: 'Appraisal',
            href: '/hrms/appraisal',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            permission: 'hrms.view_dashboard'
        },
        {
            name: 'Survey',
            href: '/hrms/survey',
            icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
            permission: 'hrms.view_dashboard'
        },
        {
            name: 'Leave Management',
            href: '/hrms/leave',
            icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
            permission: 'hrms.view_dashboard'
        },
        {
            name: 'Payroll',
            href: '/hrms/payroll',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            permission: 'hrms.manage_payroll'
        },
        {
            name: 'Announcements',
            href: '/hrms/announcements',
            icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
            permission: 'hrms.view_dashboard'
        },
    ];

    const navItems = allNavItems.filter(item => !item.permission || hasPermission(item.permission));

    return (
        <aside className="w-64 bg-[#1e1b4b] text-gray-300 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-white mb-8">STRANGEDEVLAB</h1>
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 space-y-2">
                <Link href="/hrms/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium">Profile</span>
                </Link>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-white/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
