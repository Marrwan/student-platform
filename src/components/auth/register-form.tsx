'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Please enter the 6-digit verification code'),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

const OTP_LOCAL_KEY = 'pending_registration_otp';

interface RegisterFormProps {
  invitationData?: {
    token: string;
    classId: string;
    email?: string;
    message?: string;
  } | null;
}

export function RegisterForm({ invitationData }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const { register: registerUser, login } = useAuth();

  // Restore OTP state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pending = localStorage.getItem(OTP_LOCAL_KEY);
      if (pending) {
        try {
          const { email, password } = JSON.parse(pending);
          setUserEmail(email);
          setUserPassword(password);
          setShowOtpInput(true);
        } catch { }
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Pre-fill email if provided in invitation
  useEffect(() => {
    if (invitationData?.email) {
      setValue('email', invitationData.email);
    }
  }, [invitationData, setValue]);

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password, data.firstName, data.lastName);
      setUserEmail(data.email);
      setUserPassword(data.password);
      setShowOtpInput(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(OTP_LOCAL_KEY, JSON.stringify({ email: data.email, password: data.password }));
      }
      toast.success('Registration successful! Please check your email for the verification code.');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      await login(userEmail, userPassword, data.otp);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(OTP_LOCAL_KEY);
      }
      toast.success('Email verified and login successful!');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { resendVerification } = useAuth();
      await resendVerification(userEmail);
      toast.success('Verification code sent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    }
  };

  const handleBackToRegistration = () => {
    setShowOtpInput(false);
    setUserEmail('');
    setUserPassword('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(OTP_LOCAL_KEY);
    }
  };

  if (showOtpInput) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold leading-none tracking-tight mb-2 text-foreground">Verify Your Email</h2>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to <strong className="text-foreground">{userEmail}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 bg-neon-emerald/10 border border-neon-emerald/20 rounded-lg mb-6">
          <CheckCircle className="h-4 w-4 text-neon-emerald" />
          <p className="text-sm text-foreground/80">
            Registration successful! Please check your email for the verification code.
          </p>
        </div>

        <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-foreground">6-Digit Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              maxLength={6}
              {...registerOtp('otp')}
              className={`bg-black/50 border-white/10 focus-visible:ring-neon-cyan text-foreground text-center text-lg font-mono tracking-widest ${otpErrors.otp ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {otpErrors.otp && (
              <p className="text-sm text-red-500">{otpErrors.otp.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-neon-cyan text-black hover:bg-neon-cyan/90 border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Sign In'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="border-white/10 hover:bg-white/5"
            >
              Resend Code
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <Button
            variant="link"
            className="p-0 h-auto font-semibold text-muted-foreground hover:text-foreground"
            onClick={handleBackToRegistration}
          >
            Back to Registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold leading-none tracking-tight mb-2 text-foreground">Create Account</h2>
        <p className="text-sm text-muted-foreground">
          Join the JavaScript Learning Platform and start your coding journey
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                {...register('firstName')}
                className={`bg-black/50 border-white/10 focus-visible:ring-neon-cyan text-foreground ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                {...register('lastName')}
                className={`bg-black/50 border-white/10 focus-visible:ring-neon-cyan text-foreground ${errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              className={`bg-black/50 border-white/10 focus-visible:ring-neon-cyan text-foreground ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className={`bg-black/50 border-white/10 focus-visible:ring-neon-cyan text-foreground pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                className={`bg-black/50 border-white/10 focus-visible:ring-neon-cyan text-foreground pr-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-6 bg-neon-cyan text-black hover:bg-neon-cyan/90 border-0" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-neon-cyan hover:text-neon-cyan/80 transition-colors"
              onClick={() => window.location.href = '/login'}
            >
              Sign in here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
} 