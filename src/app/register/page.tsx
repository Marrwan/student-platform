'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { RegisterForm } from '@/components/auth/register-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, ArrowLeft, Mail, Users, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';

function RegisterPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invitationData, setInvitationData] = useState<any>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(false);

  // Check for invitation token
  useEffect(() => {
    const token = searchParams.get('token');
    const classId = searchParams.get('classId');

    if (token && classId) {
      setLoadingInvitation(true);
      // Here you would validate the invitation token
      // For now, we'll just set some basic data
      setInvitationData({
        token,
        classId,
        email: searchParams.get('email') || '',
        message: searchParams.get('message') || ''
      });
      setLoadingInvitation(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mb-4"></div>
      </div>
    );
  }

  // If user is already logged in, redirect them immediately
  if (user) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-neon-pink/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-neon-emerald/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home */}
        <div className="mb-6">
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
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/20">
              <Code className="h-6 w-6 text-neon-cyan" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">Terminal Academy</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Join the Platform</h1>
          <p className="text-muted-foreground">Create your account and start your coding journey</p>
        </div>

        {/* Invitation Banner */}
        {invitationData && (
          <Card className="mb-6 border-neon-cyan/30 bg-neon-cyan/5 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-neon-cyan" />
                <CardTitle className="text-lg text-neon-cyan">You're Invited!</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                You've been invited to join a class. Create your account to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-foreground/80 space-y-2">
                <p><strong className="text-foreground font-semibold">Class ID:</strong> <span className="font-mono text-neon-cyan">{invitationData.classId}</span></p>
                {invitationData.message && (
                  <p><strong>Message:</strong> <span className="italic text-muted-foreground">{invitationData.message}</span></p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        <div className="bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-emerald to-neon-violet"></div>
          <RegisterForm invitationData={invitationData} />
        </div>

        {/* Demo Credentials */}
        <Card className="mt-8 bg-black/40 border-white/5 backdrop-blur-md hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5">
              <span><strong>Admin:</strong> admin@javascriptchallenge.com</span>
              <span className="font-mono text-xs bg-black/50 px-2 py-1 rounded">admin123</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mb-4"></div>
        <p className="text-muted-foreground animate-pulse">Loading registration...</p>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
} 