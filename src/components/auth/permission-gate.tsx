'use client';

import { usePermissions } from '@/lib/permissions';
import { ReactNode } from 'react';

interface PermissionGateProps {
  /** Single permission to check */
  permission?: string;
  /** Multiple permissions — user needs ANY of them */
  permissions?: string[];
  /** Require ALL permissions instead of ANY */
  requireAll?: boolean;
  /** Role-based check (e.g. 'admin', 'instructor') */
  role?: string;
  /** Multiple roles — user needs ANY of them */
  roles?: string[];
  /** Content to show when permission check passes */
  children: ReactNode;
  /** Optional fallback content when permission check fails */
  fallback?: ReactNode;
}

/**
 * PermissionGate — Conditionally renders children based on permissions/roles.
 * 
 * Usage:
 *   <PermissionGate permission="course.create:all">
 *     <CreateCourseButton />
 *   </PermissionGate>
 * 
 *   <PermissionGate roles={['admin', 'instructor']} fallback={<NoAccess />}>
 *     <AdminContent />
 *   </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAny, hasRole, isSuperAdmin } = usePermissions();

  // Super admins always pass
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Single permission check
  if (permission) {
    if (!can(permission)) return <>{fallback}</>;
  }

  // Multiple permissions check
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      if (!permissions.every((p) => can(p))) return <>{fallback}</>;
    } else {
      if (!canAny(permissions)) return <>{fallback}</>;
    }
  }

  // Single role check
  if (role) {
    if (!hasRole(role)) return <>{fallback}</>;
  }

  // Multiple roles check (any)
  if (roles && roles.length > 0) {
    if (!roles.some((r) => hasRole(r))) return <>{fallback}</>;
  }

  return <>{children}</>;
}
