'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  rehydrated: boolean;
  activeRole: string;
  availableRoles: string[];
  switchRole: (newRole: string) => void;
  login: (email: string, password: string, verificationOtp?: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<{ message: string }>;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rehydrated, setRehydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const normalizeUser = (rawUser: any): User | null => {
    if (!rawUser) return null;
    const rawRoles = Array.isArray(rawUser.roles)
      ? rawUser.roles.map((r: any) => (typeof r === 'string' ? r.toLowerCase() : String(r).toLowerCase()))
      : [];

    const hasAdmin = rawRoles.includes('admin') || rawRoles.includes('super admin') || String(rawUser.role).toLowerCase() === 'admin' || String(rawUser.role).toLowerCase() === 'super admin';
    const fallbackRole = hasAdmin ? 'admin' : (rawUser.role ? String(rawUser.role).toLowerCase() : (rawRoles[0] || 'student'));

    const savedRole = Cookies.get('active_role') || Cookies.get('user_role');
    const activeRole = (savedRole && (rawRoles.includes(savedRole.toLowerCase()) || savedRole.toLowerCase() === fallbackRole))
      ? savedRole.toLowerCase()
      : fallbackRole;

    const cleanRolesList = Array.from(
      new Set(
        [...rawRoles, fallbackRole, activeRole].map((r) => {
          if (r === 'super admin' || r === 'partial_admin') return 'admin';
          return r;
        })
      )
    );

    const primaryRole = cleanRolesList.includes('admin') ? 'admin' : activeRole;

    return {
      ...rawUser,
      role: primaryRole as any,
      roles: cleanRolesList,
    };
  };

  const switchRole = (newRole: string) => {
    if (!user) return;
    const targetRole = newRole.toLowerCase();
    const rolesList = user.roles || [user.role];
    if (!rolesList.map(r => r.toLowerCase()).includes(targetRole)) {
      toast.error(`You do not have permission for ${newRole} view.`);
      return;
    }

    const updatedUser = { ...user, role: targetRole as any };
    setUser(updatedUser);
    Cookies.set('user_role', targetRole, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    Cookies.set('active_role', targetRole, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

    toast.success(`Switched to ${targetRole.toUpperCase()} view`);

    const roleRedirects: Record<string, string> = {
      admin: '/admin',
      instructor: '/hrms/dashboard',
      staff: '/hrms/dashboard',
      student: '/dashboard',
    };
    const redirectPath = roleRedirects[targetRole] || '/dashboard';
    window.location.href = redirectPath;
  };

  const checkAuth = async () => {
    try {
      const token = Cookies.get('summayyah') || Cookies.get('token');

      if (token) {
        // Sync both cookie names
        Cookies.set('summayyah', token, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

        const { user } = await api.getProfile();
        const normalized = normalizeUser(user);
        setUser(normalized);
        if (normalized?.role) {
          Cookies.set('user_role', normalized.role, {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          Cookies.set('active_role', normalized.role, {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        }
      }
    } catch (error: any) {
      Cookies.remove('summayyah', { path: '/' });
      Cookies.remove('token', { path: '/' });
      Cookies.remove('user_role', { path: '/' });
      Cookies.remove('active_role', { path: '/' });
      Cookies.remove('restore_token', { path: '/' });
      Cookies.remove('impersonation_meta', { path: '/' });
      api.clearCache();
      setUser(null);
    } finally {
      setLoading(false);
      setRehydrated(true);
    }
  };

  const login = async (email: string, password: string, verificationOtp?: string) => {
    try {
      const loginData: any = { email, password };
      if (verificationOtp) {
        loginData.verificationOtp = verificationOtp;
      }

      const response = await api.login(loginData);
      const normalized = normalizeUser(response.user)!;

      Cookies.set('summayyah', response.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      Cookies.set('token', response.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      Cookies.set('user_role', normalized.role, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      Cookies.set('active_role', normalized.role, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      setUser(normalized);
      toast.success('Login successful!');

      // Role-based redirect using centralized mapping
      const roleRedirects: Record<string, string> = {
        admin: '/admin',
        instructor: '/hrms/dashboard',
        staff: '/hrms/dashboard',
        student: '/dashboard',
      };
      const redirectPath = roleRedirects[normalized.role] || '/dashboard';

      // Use window.location for a full page reload to ensure middleware runs
      window.location.href = redirectPath;

    } catch (error: any) {
      if (error.response?.data?.needsVerification) {
        throw error;
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
        throw error;
      }
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await api.register({ email, password, firstName, lastName });
      toast.success('Registration successful! Please check your email to verify your account.');
      // Don't automatically log in after registration - user needs to verify email first
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.verifyEmail(token);
      const normalized = normalizeUser(response.user)!;

      // Store token securely in both keys
      Cookies.set('summayyah', response.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      Cookies.set('token', response.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      setUser(normalized);
      Cookies.set('user_role', normalized.role, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      Cookies.set('active_role', normalized.role, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      toast.success('Email verified successfully!');

      // Redirect based on role
      const roleRedirects: Record<string, string> = {
        admin: '/admin',
        instructor: '/hrms/dashboard',
        staff: '/hrms/dashboard',
        student: '/dashboard',
      };
      const redirectPath = roleRedirects[normalized.role] || '/dashboard';
      router.push(redirectPath);

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Email verification failed');
      throw error;
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const response = await api.resendVerification(email);
      return response; // Return the response so the component can handle it
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const logout = () => {
    Cookies.remove('summayyah', { path: '/' });
    Cookies.remove('token', { path: '/' });
    Cookies.remove('user_role', { path: '/' });
    Cookies.remove('active_role', { path: '/' });
    Cookies.remove('restore_token', { path: '/' });
    Cookies.remove('impersonation_meta', { path: '/' });
    api.clearCache();
    setUser(null);
    toast.success('Logged out successfully');
    window.location.replace('/');
  };

  const updateUser = (userData: User) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    if (normalized?.role) {
      Cookies.set('user_role', normalized.role, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
  };

  const activeRole = user?.role || 'student';
  const availableRoles = user?.roles && user.roles.length > 0 ? user.roles : [activeRole];

  const value = {
    user,
    loading,
    rehydrated,
    activeRole,
    availableRoles,
    switchRole,
    login,
    register,
    verifyEmail,
    resendVerification,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 