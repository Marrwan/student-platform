'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRole, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading, rehydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && rehydrated) {
      if (!user) {
        router.replace(redirectTo);
      } else if (requiredRole && user.role !== requiredRole) {
        router.replace(redirectTo);
      }
    }
  }, [user, loading, rehydrated, requiredRole, redirectTo, router]);

  // Show loading while checking auth or not rehydrated
  if (loading || !rehydrated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
} 