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

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');

      if (token) {
        const { user } = await api.getProfile();
        setUser(user);
        Cookies.set('user_role', user.role, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('token');
        Cookies.remove('user_role');
        api.clearCache();
      }
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

      Cookies.set('token', response.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      Cookies.set('user_role', response.user.role, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      setUser(response.user);
      toast.success('Login successful!');

      // Role-based redirect using centralized mapping
      const roleRedirects: Record<string, string> = {
        admin: '/admin',
        instructor: '/hrms/dashboard',
        staff: '/hrms/dashboard',
        student: '/dashboard',
      };
      const redirectPath = roleRedirects[response.user.role] || '/dashboard';

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

      // Store token securely
      Cookies.set('token', response.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' // lax so cookie is sent when user returns from external redirect (e.g. Paystack checkout)
      });

      setUser(response.user);
      Cookies.set('user_role', response.user.role, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' // lax so cookie is sent when user returns from external redirect (e.g. Paystack checkout)
      });

      toast.success('Email verified successfully!');

      // Redirect based on role
      const roleRedirects: Record<string, string> = {
        admin: '/admin',
        instructor: '/hrms/dashboard',
        staff: '/hrms/dashboard',
        student: '/dashboard',
      };
      const redirectPath = roleRedirects[response.user.role] || '/dashboard';
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
    Cookies.remove('token');
    Cookies.remove('user_role');
    api.clearCache();
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    Cookies.set('user_role', userData.role, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' // lax so cookie is sent when user returns from external redirect (e.g. Paystack checkout)
    });
  };

  const value = {
    user,
    loading,
    rehydrated,
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