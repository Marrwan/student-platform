'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  User, 
  LogOut, 
  Settings, 
  Trophy, 
  Calendar, 
  BookOpen, 
  Users, 
  BarChart3,
  Menu,
  X,
  FileText,
  GraduationCap,
  ClipboardList,
  Award,
  Cog,
  Shield
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

  const isAdmin = user?.role === 'admin' || user?.role === 'partial_admin';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Learning Platform</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {isAdmin ? (
                  // Admin Navigation
                  <>
                    <Link 
                      href="/admin" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      href="/admin/classes" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Classes</span>
                    </Link>
                    <Link 
                      href="/admin/assignments" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Assignments</span>
                    </Link>
                    <Link 
                      href="/admin/submissions" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>Submissions</span>
                    </Link>
                    <Link 
                      href="/admin/users" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <Users className="w-4 h-4" />
                      <span>Users</span>
                    </Link>
                    <Link 
                      href="/admin/analytics" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Analytics</span>
                    </Link>
                  </>
                ) : (
                  // Student Navigation
                  <>
                    <Link 
                      href="/dashboard" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/projects" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Projects
                    </Link>
                    <Link 
                      href="/leaderboard" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Leaderboard
                    </Link>
                    <Link 
                      href="/progress" 
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Progress
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link 
                  href="/rules" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Rules
                </Link>
              </>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    {isAdmin && (
                      <span className="text-xs text-blue-600 font-medium">
                        Administrator
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="p-2 h-10 w-10"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {user ? (
              <>
                {isAdmin ? (
                  // Admin Mobile Navigation
                  <>
                    <Link 
                      href="/admin" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                    <Link 
                      href="/admin/classes" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span>Classes</span>
                    </Link>
                    <Link 
                      href="/admin/assignments" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Assignments</span>
                    </Link>
                    <Link 
                      href="/admin/submissions" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ClipboardList className="w-5 h-5" />
                      <span>Submissions</span>
                    </Link>
                    <Link 
                      href="/admin/users" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users className="w-5 h-5" />
                      <span>Users</span>
                    </Link>
                    <Link 
                      href="/admin/analytics" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>Analytics</span>
                    </Link>
                  </>
                ) : (
                  // Student Mobile Navigation
                  <>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      href="/projects" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>Projects</span>
                    </Link>
                    <Link 
                      href="/leaderboard" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Trophy className="w-5 h-5" />
                      <span>Leaderboard</span>
                    </Link>
                    <Link 
                      href="/progress" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Progress</span>
                    </Link>
                  </>
                )}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 flex items-center justify-center space-x-2"
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
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link 
                  href="/rules" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-base font-medium transition-colors min-h-[44px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Rules</span>
                </Link>
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 