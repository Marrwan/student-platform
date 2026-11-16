import { useAuth } from '@/components/providers/auth-provider';
import { useMemo } from 'react';

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    if (Array.isArray(user.permissions)) {
      return user.permissions;
    }
    return [];
  }, [user]);

  const roles = useMemo(() => {
    if (!user) return [];
    const roleList = Array.isArray(user.roles) ? user.roles : [user.role];
    return roleList.map((r) => String(r).toLowerCase());
  }, [user]);

  const isSuperAdmin = useMemo(() => {
    return roles.includes('super admin') || roles.includes('admin');
  }, [roles]);

  const can = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  const canAny = (permissionList: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissionList.some((p) => permissions.includes(p));
  };

  const hasRole = (roleName: string): boolean => {
    return roles.includes(roleName.toLowerCase());
  };

  return {
    permissions,
    roles,
    isSuperAdmin,
    can,
    canAny,
    hasRole,
  };
}
