'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student' | 'partial_admin'; // Deprecated in favor of allowedRoles
  allowedRoles?: ('admin' | 'student' | 'partial_admin')[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRole, allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading, rehydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && rehydrated) {
      if (!user) {
        router.replace(redirectTo);
        return;
      }

      // Check requiredRole (legacy/single)
      if (requiredRole && user.role !== requiredRole) {
        router.replace(redirectTo);
        return;
      }

      // Check allowedRoles (array)
      if (allowedRoles && !allowedRoles.includes(user.role as any)) {
        router.replace(redirectTo);
        return;
      }
    }
  }, [user, loading, rehydrated, requiredRole, allowedRoles, redirectTo, router]);

  // Show loading while checking auth or not rehydrated
  if (loading || !rehydrated) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }

  // Render check
  if (!user) return null;
  if (requiredRole && user.role !== requiredRole) return null;
  if (allowedRoles && !allowedRoles.includes(user.role as any)) return null;

  return <>{children}</>;
} 