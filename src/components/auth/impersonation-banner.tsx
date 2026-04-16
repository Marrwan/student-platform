'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import { UserCheck, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export function ImpersonationBanner() {
  const { updateUser } = useAuth();
  const [impersonatedBy, setImpersonatedBy] = useState<{ firstName: string; lastName: string } | null>(null);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    const data = Cookies.get('impersonation_meta');
    if (data) {
      try {
        setImpersonatedBy(JSON.parse(data));
      } catch {
        // ignore
      }
    }
  }, []);

  if (!impersonatedBy) return null;

  const handleStop = async () => {
    const restoreToken = Cookies.get('restore_token');
    if (!restoreToken) {
      toast.error('Restore token missing. Please log in again.');
      return;
    }

    setStopping(true);
    try {
      const result = await api.stopImpersonation(restoreToken);

      // Restore admin session
      Cookies.set('token', result.token, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      Cookies.set('user_role', result.user.role, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      Cookies.remove('restore_token');
      Cookies.remove('impersonation_meta');

      api.clearCache();
      updateUser(result.user as any);
      toast.success('Impersonation ended. Welcome back!');
      window.location.href = '/admin/users';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to stop impersonation');
      setStopping(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neon-amber text-black px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <UserCheck className="h-4 w-4" />
        <span>
          You are impersonating a user — acting as admin{' '}
          <strong>{impersonatedBy.firstName} {impersonatedBy.lastName}</strong>
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="border-black text-black hover:bg-black/10 font-semibold"
        onClick={handleStop}
        disabled={stopping}
      >
        <LogOut className="h-4 w-4 mr-1" />
        {stopping ? 'Restoring...' : 'Stop Impersonating'}
      </Button>
    </div>
  );
}
