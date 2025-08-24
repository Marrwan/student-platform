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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is already logged in, redirect them immediately
  if (user) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    router.push(redirectPath);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Learning Platform</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join the Platform</h1>
          <p className="text-gray-600 dark:text-gray-300">Create your account and start your learning journey</p>
        </div>

        {/* Invitation Banner */}
        {invitationData && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg text-blue-900">You're Invited!</CardTitle>
              </div>
              <CardDescription className="text-blue-700">
                You've been invited to join a class. Create your account to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-blue-800">
                <p><strong>Class ID:</strong> {invitationData.classId}</p>
                {invitationData.message && (
                  <p className="mt-2"><strong>Message:</strong> {invitationData.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        <RegisterForm invitationData={invitationData} />

        {/* Demo Credentials */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Demo Credentials</CardTitle>
            <CardDescription>
              Try the platform with these demo accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-left">
              <strong>Admin:</strong> admin@javascriptchallenge.com / admin123
            </div>
            <div className="text-left">
              <strong>Student:</strong> Register a new account to get started
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-xl">Loading...</CardTitle>
              <CardDescription>
                Please wait while we load the registration page
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
} 