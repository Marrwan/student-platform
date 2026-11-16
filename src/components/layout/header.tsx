'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  LogOut,
  BookOpen,
  Menu,
  X,
  FileText,
  Award,
  Shield,
  Trophy,
  Code,
  Check,
  ChevronDown,
  User as UserIcon,
  Settings,
  GraduationCap,
} from 'lucide-react';

export default function Header() {
  const { user, logout, activeRole, availableRoles, switchRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const currentRole = (activeRole || user?.role || 'student').toLowerCase();
  const isFullAdmin = currentRole === 'admin';
  const isStaff = currentRole === 'staff' || currentRole === 'instructor';

  // Normalize roles: map 'super admin' and 'partial_admin' to 'admin', deduplicate
  const rawRoles = [
    ...(availableRoles || []),
    ...(user?.roles || []),
    user?.role || 'student',
  ].map((r) => String(r).toLowerCase().trim());

  const userRolesList = Array.from(
    new Set(
      rawRoles.map((r) => {
        if (r === 'super admin' || r === 'partial_admin') return 'admin';
        return r;
      })
    )
  ).filter(Boolean);

  const navLinkClass =
    'text-muted-foreground hover:text-foreground px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 hover:bg-white/[0.04]';
  const mobileNavLinkClass =
    'flex items-center space-x-3 text-muted-foreground hover:text-foreground px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200 min-h-[44px] hover:bg-white/[0.04]';

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo & Core Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link
              href={user ? (isFullAdmin ? '/admin' : isStaff ? '/hrms/dashboard' : '/dashboard') : '/'}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-violet to-neon-amber p-0.5 shadow-lg shadow-neon-cyan/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                  <Code className="h-5 w-5 text-neon-cyan" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-neon-cyan transition-colors">
                  Strangedev
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {user ? (
                <>
                  <Link
                    href={isFullAdmin ? '/admin' : '/dashboard'}
                    className={navLinkClass}
                  >
                    {isFullAdmin ? (
                      <Shield className="w-4 h-4 text-neon-violet" />
                    ) : (
                      <Home className="w-4 h-4 text-neon-cyan" />
                    )}
                    <span>{isFullAdmin ? 'Admin Studio' : 'Dashboard'}</span>
                  </Link>
                  <Link href="/courses" className={navLinkClass}>
                    <BookOpen className="w-4 h-4 text-neon-violet" />
                    <span>Courses</span>
                  </Link>
                  <Link href="/projects/showcase" className={navLinkClass}>
                    <Code className="w-4 h-4 text-neon-amber" />
                    <span>Showcase</span>
                  </Link>
                  <Link href="/leaderboard" className={navLinkClass}>
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>Leaderboard</span>
                  </Link>
                  <Link href="/rules" className={navLinkClass}>
                    <FileText className="w-4 h-4" />
                    <span>Rules</span>
                  </Link>
                </>
              ) : (
                <Link href="/rules" className={navLinkClass}>
                  <FileText className="w-4 h-4" />
                  <span>Rules & Guidelines</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right: Role Badges + User Dropdown / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Admin Quick Link */}
                {isFullAdmin && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-neon-violet/40 bg-neon-violet/10 text-neon-violet hover:bg-neon-violet/20 text-xs font-semibold h-8 px-3 rounded-full"
                  >
                    <Link href="/admin">
                      <Shield className="w-3.5 h-3.5 mr-1.5" />
                      Admin Panel
                    </Link>
                  </Button>
                )}

                {/* Udemy-Style User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all outline-none focus:ring-2 focus:ring-neon-cyan/40">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center shadow-md shadow-neon-cyan/20 ring-1 ring-white/20">
                        <span className="text-background text-xs font-black">
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-card/95 backdrop-blur-2xl border-white/10 rounded-2xl p-2 shadow-2xl space-y-1"
                  >
                    {/* User Profile Header */}
                    <div className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/5 mb-1">
                      <p className="text-sm font-bold text-foreground leading-tight">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                      {userRolesList.length > 1 && (
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                          {currentRole} view
                        </div>
                      )}
                    </div>

                    {/* Udemy-style Perspective Switcher */}
                    {userRolesList.length > 1 && (
                      <>
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 pt-2">
                          Switch View
                        </DropdownMenuLabel>
                        {userRolesList.map((r) => {
                          const isActive = r === currentRole;
                          const label =
                            r === 'instructor' || r === 'staff'
                              ? 'Instructor View'
                              : r === 'admin'
                              ? 'Admin View'
                              : 'Student View';
                          return (
                            <DropdownMenuItem
                              key={r}
                              onClick={() => switchRole(r)}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium ${
                                isActive
                                  ? 'bg-neon-cyan/15 text-neon-cyan font-bold'
                                  : 'text-foreground hover:bg-white/5'
                              }`}
                            >
                              <span>{label}</span>
                              {isActive && <Check className="w-4 h-4 text-neon-cyan" />}
                            </DropdownMenuItem>
                          );
                        })}
                        <DropdownMenuSeparator className="bg-white/10 my-1" />
                      </>
                    )}

                    {/* Navigation Items */}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer text-xs text-foreground hover:bg-white/5"
                      >
                        <Home className="w-4 h-4 text-muted-foreground" />
                        <span>My Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/projects"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer text-xs text-foreground hover:bg-white/5"
                      >
                        <Code className="w-4 h-4 text-muted-foreground" />
                        <span>My Capstones</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/certificates"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer text-xs text-foreground hover:bg-white/5"
                      >
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span>My Certificates</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer text-xs text-foreground hover:bg-white/5"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/10 my-1" />

                    {/* Logout Button */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-semibold">Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-neon-cyan/25 text-sm px-4"
                >
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
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

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="px-4 pt-4 pb-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {user ? (
              <>
                {/* Mobile User Header */}
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-full flex items-center justify-center">
                    <span className="text-background text-sm font-bold">
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                {/* Mobile Perspective Switcher */}
                {userRolesList.length > 1 && (
                  <div className="p-3 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl space-y-2 mb-3">
                    <p className="text-xs text-muted-foreground font-medium">Switch View</p>
                    <div className="flex flex-wrap gap-2">
                      {userRolesList.map((r) => {
                        const isActive = r === currentRole;
                        const label =
                          r === 'instructor' || r === 'staff'
                            ? 'Instructor'
                            : r === 'admin'
                            ? 'Admin'
                            : 'Student';
                        return (
                          <Button
                            key={r}
                            onClick={() => {
                              switchRole(r);
                              setIsMobileMenuOpen(false);
                            }}
                            size="sm"
                            variant={isActive ? 'default' : 'outline'}
                            className={
                              isActive
                                ? 'bg-neon-cyan text-background font-bold text-xs'
                                : 'text-xs border-neon-cyan/30 text-neon-cyan'
                            }
                          >
                            {label} View {isActive && '✓'}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mobile Links */}
                {isFullAdmin && (
                  <Link
                    href="/admin"
                    className={`${mobileNavLinkClass} text-neon-violet font-semibold bg-neon-violet/5`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5 text-neon-cyan" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/courses"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen className="w-5 h-5 text-neon-violet" />
                  <span>Courses</span>
                </Link>
                <Link
                  href="/projects"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Code className="w-5 h-5" />
                  <span>My Capstones</span>
                </Link>
                <Link
                  href="/projects/showcase"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Code className="w-5 h-5 text-neon-amber" />
                  <span>Showcase Gallery</span>
                </Link>
                <Link
                  href="/leaderboard"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>Leaderboard</span>
                </Link>
                <Link
                  href="/rules"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="w-5 h-5" />
                  <span>Rules</span>
                </Link>

                <div className="border-t border-border/50 pt-4 mt-4">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center space-x-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/rules"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="w-5 h-5" />
                  <span>Rules & Guidelines</span>
                </Link>
                <div className="border-t border-border/50 pt-4 mt-4 space-y-2 px-1">
                  <Button asChild variant="outline" size="sm" className="w-full border-border/50">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold"
                  >
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
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