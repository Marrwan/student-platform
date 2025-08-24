'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, AlertCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  verificationOtp: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const watchedEmail = watch('email');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.verificationOtp);
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.data?.needsVerification) {
        setNeedsVerification(true);
        setEmail(data.email);
        toast.success('Account found! Please verify your email address to continue.');
      } else if (error.response?.data?.message?.includes('verify your email') || 
                 error.response?.data?.message?.includes('verification')) {
        setNeedsVerification(true);
        setEmail(data.email);
        toast.error('Please verify your email address. Enter the 6-digit verification code below.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    
    setResendLoading(true);
    try {
      const { resendVerification } = useAuth();
      await resendVerification(email);
      toast.success('Verification code sent successfully! Check your email for the new code.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
        
        <div className="text-right">
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
            onClick={() => window.location.href = '/forgot-password'}
          >
            Forgot your password?
          </Button>
        </div>
      </div>

      {needsVerification && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-900 mb-1">
                Account Found! Email Verification Required
              </h3>
              <p className="text-sm text-green-800 mb-2">
                We found your account! A 6-digit verification code has been sent to <strong>{email}</strong>. 
                Please check your email and enter the code below to continue.
              </p>
              <p className="text-xs text-green-700">
                Can't find the email? Check your spam folder or request a new code below.
              </p>
            </div>
          </div>
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Email Verification Required
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                We've sent a 6-digit verification code to <strong>{email}</strong>. 
                Please check your email and enter the code below to continue.
              </p>
              <p className="text-xs text-blue-700">
                Can't find the email? Check your spam folder or request a new code.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="verificationOtp">6-Digit Verification Code</Label>
            <Input
              id="verificationOtp"
              type="text"
              placeholder="Enter 6-digit code from email"
              maxLength={6}
              className={`text-center text-lg font-mono tracking-widest ${errors.verificationOtp ? 'border-red-500' : ''}`}
              {...register('verificationOtp')}
            />
            {errors.verificationOtp && (
              <p className="text-sm text-red-500">{errors.verificationOtp.message}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="flex-1"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Code
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setNeedsVerification(false)}
            >
              Back to Login
            </Button>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Having trouble? Contact support or try a different email address.
            </p>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="text-xs"
              >
                Didn't receive the email? Resend
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {needsVerification ? 'Verifying...' : 'Signing in...'}
          </>
        ) : (
          needsVerification ? 'Verify & Sign In' : 'Sign In'
        )}
      </Button>
    </form>
  );
} 