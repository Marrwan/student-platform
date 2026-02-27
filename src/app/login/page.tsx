'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react'; // Added missing import for React

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
      </div>
    );
  }

  // If user is already logged in, redirect them immediately
  if (user) {
    // Redirect immediately without useEffect
    let redirectPath = '/dashboard';
    if (user.role === 'admin') {
      redirectPath = '/admin';
    } else if (user.role === 'staff' || user.role === 'instructor' || user.role === 'partial_admin') {
      redirectPath = '/hrms/dashboard';
    } else if (user.role === 'student') {
      redirectPath = '/dashboard';
    }

    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="h-6 w-6 text-neon-cyan animate-spin" />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mono-font animate-pulse">
            REDIRECTING_TO_SESSION_ROOT
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-neon-violet/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors absolute top-4 left-4 sm:static"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
        </div>

        {/* Logo */}
        <div className="text-center mb-10 mt-8 sm:mt-0">
          <div className="flex items-center justify-center space-x-3 mb-6 group">
            <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-neon-cyan/50 hover-glow-cyan transition-all duration-500 transform group-hover:rotate-6">
              <Code className="h-7 w-7 text-neon-cyan" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neon-cyan mb-3 mono-font">
            <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
            AUTH_TERMINAL_VSEC
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-2 uppercase">Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet">Systems</span></h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">Secure access for verified developers</p>
        </div>

        {/* Login Form */}
        <Card className="bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"></div>
          <CardHeader className="pt-8 pb-4">
            <CardTitle className="text-xl mono-font font-bold">SESSION_LOGIN</CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-tight mono-font">
              Enter valid credentials to initiate auth_handshake
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <LoginForm />

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                  onClick={() => router.push('/register')}
                >
                  Create one here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 