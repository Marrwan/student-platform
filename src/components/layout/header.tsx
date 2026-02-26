'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Home,
  LogOut,
  BookOpen,
  Users,
  BarChart3,
  Menu,
  X,
  FileText,
  GraduationCap,
  ClipboardList,
  Award,
  Shield,
  Trophy,
  Calendar,
} from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'instructor' || user?.role === 'staff';
  const isFullAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'instructor';

  const navLinkClass =
    'text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5';
  const mobileNavLinkClass =
    'flex items-center space-x-3 text-muted-foreground hover:text-foreground px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200 min-h-[44px] hover:bg-white/[0.04]';

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-lg flex items-center justify-center shadow-lg shadow-neon-cyan/20 group-hover:shadow-neon-cyan/40 transition-shadow duration-300">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">
                Learning<span className="text-gradient">Platform</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {isFullAdmin ? (
                  <>
                    <Link href="/admin" className={navLinkClass}>
                      <Shield className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/classes" className={navLinkClass}>
                      <GraduationCap className="w-4 h-4" />
                      <span>Classes</span>
                    </Link>
                    <Link href="/admin/assignments" className={navLinkClass}>
                      <FileText className="w-4 h-4" />
                      <span>Assignments</span>
                    </Link>
                    <Link href="/admin/submissions" className={navLinkClass}>
                      <ClipboardList className="w-4 h-4" />
                      <span>Submissions</span>
                    </Link>
                    <Link href="/admin/users" className={navLinkClass}>
                      <Users className="w-4 h-4" />
                      <span>Users</span>
                    </Link>
                    <Link href="/admin/analytics" className={navLinkClass}>
                      <BarChart3 className="w-4 h-4" />
                      <span>Analytics</span>
                    </Link>
                  </>
                ) : (
                  <>
                    {isStaff && (
                      <Link
                        href="/hrms/dashboard"
                        className="text-neon-cyan hover:text-neon-cyan/80 bg-neon-cyan/10 hover:bg-neon-cyan/15 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5"
                      >
                        <Shield className="w-4 h-4" />
                        <span>HRMS</span>
                      </Link>
                    )}
                    <Link href="/dashboard" className={navLinkClass}>
                      <Home className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href="/projects" className={navLinkClass}>
                      <BookOpen className="w-4 h-4" />
                      <span>Projects</span>
                    </Link>
                    <Link href="/leaderboard" className={navLinkClass}>
                      <Trophy className="w-4 h-4" />
                      <span>Leaderboard</span>
                    </Link>
                    <Link href="/progress" className={navLinkClass}>
                      <Calendar className="w-4 h-4" />
                      <span>Progress</span>
                    </Link>
                    <Link href="/gamification" className={navLinkClass}>
                      <Award className="w-4 h-4" />
                      <span>Achievements</span>
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/" className={navLinkClass}>Home</Link>
                <Link href="/rules" className={navLinkClass}>Rules</Link>
              </>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-full flex items-center justify-center ring-2 ring-neon-cyan/20">
                    <span className="text-background text-xs font-bold">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground font-medium leading-tight">
                      {user.firstName} {user.lastName}
                    </span>
                    {isAdmin && (
                      <span className="text-xs text-neon-cyan font-medium capitalize leading-tight">
                        {user.role === 'admin' ? 'Administrator' : user.role}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1.5 border-border/50 hover:border-destructive/50 hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-neon-cyan/25">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="p-2 h-10 w-10 text-muted-foreground hover:text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="px-3 pt-3 pb-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {user ? (
              <>
                {isFullAdmin ? (
                  <>
                    <Link href="/admin" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <Shield className="w-5 h-5" /><span>Admin Dashboard</span>
                    </Link>
                    <Link href="/admin/classes" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <GraduationCap className="w-5 h-5" /><span>Classes</span>
                    </Link>
                    <Link href="/admin/assignments" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <FileText className="w-5 h-5" /><span>Assignments</span>
                    </Link>
                    <Link href="/admin/submissions" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <ClipboardList className="w-5 h-5" /><span>Submissions</span>
                    </Link>
                    <Link href="/admin/users" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <Users className="w-5 h-5" /><span>Users</span>
                    </Link>
                    <Link href="/admin/analytics" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <BarChart3 className="w-5 h-5" /><span>Analytics</span>
                    </Link>
                  </>
                ) : (
                  <>
                    {isStaff && (
                      <Link href="/hrms/dashboard" className={`${mobileNavLinkClass} !text-neon-cyan bg-neon-cyan/5`} onClick={() => setIsMobileMenuOpen(false)}>
                        <Shield className="w-5 h-5" /><span>HRMS Dashboard</span>
                      </Link>
                    )}
                    <Link href="/dashboard" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <Home className="w-5 h-5" /><span>Dashboard</span>
                    </Link>
                    <Link href="/projects" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <BookOpen className="w-5 h-5" /><span>Projects</span>
                    </Link>
                    <Link href="/leaderboard" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <Trophy className="w-5 h-5" /><span>Leaderboard</span>
                    </Link>
                    <Link href="/progress" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <Calendar className="w-5 h-5" /><span>Progress</span>
                    </Link>
                    <Link href="/gamification" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <Award className="w-5 h-5" /><span>Achievements</span>
                    </Link>
                  </>
                )}
                <div className="border-t border-border/50 pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-full flex items-center justify-center">
                      <span className="text-background text-sm font-bold">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 flex items-center justify-center space-x-2 border-border/50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <Home className="w-5 h-5" /><span>Home</span>
                </Link>
                <Link href="/rules" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
                  <BookOpen className="w-5 h-5" /><span>Rules</span>
                </Link>
                <div className="border-t border-border/50 pt-4 mt-4 space-y-2 px-1">
                  <Button asChild variant="outline" size="sm" className="w-full border-border/50">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold">
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}