'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    setToken(tokenParam);

    if (!tokenParam) {
      setTokenValid(false);
      toast.error('Invalid reset link. Please request a new password reset.');
    } else {
      setTokenValid(true);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword(token, data.password);
      setPasswordReset(true);
      toast.success('Password reset successfully!');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-neon-pink/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-neon-amber/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          <Card className="bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink to-neon-amber"></div>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon-pink/10 border border-neon-pink/20">
                <AlertCircle className="h-6 w-6 text-neon-pink" />
              </div>
              <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
              <CardDescription className="text-muted-foreground">
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Please request a new password reset link.
                </p>
                <Button
                  onClick={() => router.push('/forgot-password')}
                  className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/90 border-0"
                >
                  Request New Reset Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-neon-emerald/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          <Card className="bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-emerald to-neon-cyan"></div>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon-emerald/10 border border-neon-emerald/20">
                <CheckCircle className="h-6 w-6 text-neon-emerald" />
              </div>
              <CardTitle className="text-xl">Password Reset Successfully</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your password has been updated successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  You can now sign in with your new password.
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/90 border-0"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-neon-violet/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to login */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors absolute top-4 left-4 sm:static"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Login</span>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-10 mt-8 sm:mt-0">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
            <Lock className="h-6 w-6 text-neon-cyan" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Reset Your Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <Card className="bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"></div>
          <CardHeader className="pt-8 pb-4">
            <CardTitle className="text-xl">Create New Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    {...register('password')}
                    className={`bg-black/50 border-white/10 focus-visible:ring-neon-cyan text-foreground pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    {...register('confirmPassword')}
                    className={`bg-black/50 border-white/10 focus-visible:ring-neon-cyan text-foreground pr-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6 bg-neon-cyan text-black hover:bg-neon-cyan/90 border-0"
                disabled={isLoading || !tokenValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                  onClick={() => router.push('/login')}
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mb-4"></div>
        <p className="text-muted-foreground animate-pulse">Loading reset password page...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
