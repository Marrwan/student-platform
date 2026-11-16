'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-neon-rose/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full text-center relative z-10 glass-card p-8 sm:p-10 border-neon-rose/20 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-neon-rose/10 border border-neon-rose/20 flex items-center justify-center mx-auto mb-6 text-neon-rose shadow-lg shadow-neon-rose/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="inline-block text-[11px] uppercase font-mono tracking-widest text-neon-rose bg-neon-rose/10 border border-neon-rose/20 px-3 py-1 rounded-full font-bold mb-3">
          Runtime Exception
        </span>

        <h1 className="text-2xl font-extrabold tracking-tight mb-2">Something Went Wrong</h1>
        <p className="text-muted-foreground text-xs font-mono bg-white/[0.03] p-3 rounded-lg border border-white/5 mb-8 line-clamp-3">
          {error.message || 'An unexpected operational error occurred.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-neon-cyan text-background hover:bg-neon-cyan/90 font-bold text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground text-xs font-bold"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}