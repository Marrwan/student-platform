'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  ClipboardList,
  Code,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  UserCheck,
  Users,
  X,
  ArrowLeftRight,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, switchRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Courses & Curriculum', href: '/admin/courses', icon: BookOpen },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
    { label: 'Submissions & Grading', href: '/admin/submissions', icon: ClipboardList },
  ];

  const userRoles = [
    ...(user?.roles || []),
    user?.role || '',
  ].map((r) => String(r).toLowerCase().trim());
  const hasStudentRole = userRoles.includes('student');

  return (
    <div className="min-h-screen bg-black text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-card/60 backdrop-blur-2xl border-r border-white/10 z-50 flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-violet to-neon-cyan p-0.5 shadow-lg shadow-neon-violet/25">
                <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                  <Shield className="h-5 w-5 text-neon-violet" />
                </div>
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block">Strangedev</span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-neon-violet block -mt-1 font-bold">
                  ADMIN STUDIO
                </span>
              </div>
            </Link>
            <button className="md:hidden text-muted-foreground" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-neon-violet/15 text-neon-violet border border-neon-violet/30 shadow-lg shadow-neon-violet/10'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & Perspective Switcher */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Switch to Student View - Only if user has student role */}
          {hasStudentRole && (
            <Button
              onClick={() => switchRole('student')}
              variant="outline"
              size="sm"
              className="w-full justify-start border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 text-xs font-bold"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 mr-2" />
              <span>Switch to Student View</span>
            </Button>
          )}

          {/* User Details */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-violet to-neon-cyan flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-black">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-neon-violet font-semibold uppercase">Administrator</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Log Out"
              className="text-muted-foreground hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-card/60 backdrop-blur-xl sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-1">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm text-white">Admin Studio</span>
          {hasStudentRole && (
            <Button size="sm" variant="ghost" onClick={() => switchRole('student')} className="text-xs text-neon-cyan">
              Student View
            </Button>
          )}
        </div>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
