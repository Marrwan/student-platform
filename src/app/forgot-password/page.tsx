'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      await api.forgotPassword(data.email);
      setEmailSent(true);
      setSentEmail(data.email);
      toast.success('Password reset email sent successfully!');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-neon-violet/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Back to login */}
          <div className="mb-6 flex justify-start">
            <button
              onClick={() => router.push('/login')}
              className="group flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-neon-cyan transition-all mono-font"
            >
              <span className="text-neon-cyan transition-transform group-hover:-translate-x-1">&lt;</span>
              RETURN_TO_AUTH
            </button>
          </div>

          <Card className="bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-emerald via-neon-cyan to-neon-violet"></div>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-emerald/10 border border-neon-emerald/20 shadow-glow-emerald">
                <CheckCircle className="h-7 w-7 text-neon-emerald" />
              </div>
              <CardTitle className="text-xl mono-font font-black tracking-tight uppercase">TELEMETRY_SENT</CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font pt-2">
                Recovery handshake dispatched to secondary node
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  We sent a password reset link to:
                </p>
                <p className="font-medium text-foreground">
                  {sentEmail}
                </p>
              </div>

              <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg p-4">
                <h4 className="font-medium text-neon-cyan mb-2">
                  What's next?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the "Reset Password" link in the email</li>
                  <li>• Create a new password</li>
                  <li>• Sign in with your new password</li>
                </ul>
              </div>

              <div className="text-center space-y-2 pt-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                  className="w-full border-white/10 hover:bg-white/5"
                >
                  Try again
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
        <div className="mb-8 flex justify-start">
          <button
            onClick={() => router.push('/login')}
            className="group flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-neon-cyan transition-all mono-font"
          >
            <span className="text-neon-cyan transition-transform group-hover:-translate-x-1">&lt;</span>
            SYS_EXIT_RECOVERY
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10 mt-8 sm:mt-0">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/40 border border-white/10 hover:border-neon-cyan/50 hover-glow-cyan transition-all duration-500">
            <Mail className="h-7 w-7 text-neon-cyan" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neon-cyan mb-3 mono-font">
            <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
            RECOVERY_PROTOCOL_V4
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-2 uppercase">Reset <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet">Access</span></h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">Initiate credential restoration sequence</p>
        </div>

        {/* Form */}
        <Card className="bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"></div>
          <CardHeader className="pt-8 pb-4">
            <CardTitle className="text-xl mono-font font-black tracking-tight uppercase">PROTOCOL_INIT</CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font pt-2">
              Provide account telemetry to receive hash link
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register('email')}
                  className={`bg-black/50 border-white/10 focus-visible:ring-neon-cyan text-foreground ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6 bg-neon-cyan text-black hover:bg-neon-cyan/90 border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
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
