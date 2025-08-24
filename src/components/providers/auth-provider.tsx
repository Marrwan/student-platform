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
  resendVerification: (email: string) => Promise<void>;
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
      console.log('🔍 Checking auth...');
      const token = Cookies.get('token');
      console.log('🎫 Token found:', !!token);
      
      if (token) {
        console.log('📞 Calling getProfile...');
        const { user } = await api.getProfile();
        console.log('👤 Profile response:', user);
        setUser(user);
        console.log('✅ User state set successfully');
      } else {
        console.log('❌ No token found');
      }
    } catch (error: any) {
      console.error('❌ Auth check failed:', error);
      // Only remove token if it's an auth error
      if (error.response?.status === 401) {
        Cookies.remove('token');
        console.log('🗑️ Token removed due to 401 error');
      }
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
      setRehydrated(true);
    }
  };

  const login = async (email: string, password: string, verificationOtp?: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const loginData: any = { email, password };
      if (verificationOtp) {
        loginData.verificationOtp = verificationOtp;
      }
      
      const response = await api.login(loginData);
      console.log('✅ Login response:', response);
      
      // Store token securely
      Cookies.set('token', response.token, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      console.log('💾 Token stored in cookies');
      
      // Update user state
      setUser(response.user);
      console.log('👤 User state updated:', response.user);
      
      toast.success('Login successful!');
      
      console.log('🎯 User role:', response.user.role);
      const redirectPath = response.user.role === 'admin' ? '/admin' : '/dashboard';
      console.log('🚀 Redirecting to:', redirectPath);
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        console.log('🔄 Executing redirect to:', redirectPath);
        window.location.href = redirectPath;
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Handle specific error cases
      if (error.response?.data?.needsVerification) {
        // Don't redirect to verify-email, let the form handle it
        throw error; // Re-throw to let the form handle the verification flow
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
        sameSite: 'strict'
      });
      
      // Update user state
      setUser(response.user);
      
      toast.success('Email verified successfully!');
      
      // Redirect based on role
      const redirectPath = response.user.role === 'admin' ? '/admin' : '/dashboard';
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
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
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