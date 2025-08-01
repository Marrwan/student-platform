'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error' | 'resending'>('idle');
  const [message, setMessage] = useState('');
  const { verifyEmail, resendVerification } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      handleVerifyEmail(tokenFromUrl);
    }
  }, [searchParams]);

  const handleVerifyEmail = async (verificationToken: string) => {
    setStatus('verifying');
    try {
      await verifyEmail(verificationToken);
      setStatus('success');
      setMessage('Email verified successfully! You can now log in to your account.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Email verification failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    
    setStatus('resending');
    try {
      await resendVerification(email);
      setStatus('success');
      setMessage('Verification email sent successfully! Please check your inbox.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to send verification email. Please try again.');
    }
  };

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

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Email Verification</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please verify your email address to complete your registration
          </p>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 dark:text-green-200">{message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 dark:text-red-200">{message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Token Verification */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verify with Token</CardTitle>
            <CardDescription>
              If you received a verification token, enter it here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="token">Verification Token</Label>
              <Input
                id="token"
                type="text"
                placeholder="Enter your verification token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={status === 'verifying'}
              />
            </div>
            <Button 
              onClick={() => handleVerifyEmail(token)}
              disabled={!token || status === 'verifying'}
              className="w-full"
            >
              {status === 'verifying' ? 'Verifying...' : 'Verify Email'}
            </Button>
          </CardContent>
        </Card>

        {/* Resend Verification */}
        <Card>
          <CardHeader>
            <CardTitle>Resend Verification Email</CardTitle>
            <CardDescription>
              Didn't receive the email? Enter your email address to resend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'resending'}
              />
            </div>
            <Button 
              onClick={handleResendVerification}
              disabled={!email || status === 'resending'}
              variant="outline"
              className="w-full"
            >
              {status === 'resending' ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Need help?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold"
              onClick={() => router.push('/login')}
            >
              Contact support
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
} 