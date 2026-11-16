'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Compass, ArrowLeft, Home, BookOpen, Shield } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || (user?.roles && user.roles.map(r => r.toLowerCase()).includes('admin'));

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-neon-cyan/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-neon-violet/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full text-center relative z-10 glass-card p-8 sm:p-10 border-white/10 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-neon-cyan shadow-lg shadow-neon-cyan/10">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <span className="inline-block text-[11px] uppercase font-mono tracking-widest text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-3 py-1 rounded-full font-bold mb-3">
          404 Error • Path Not Found
        </span>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Lost in the Matrix?</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          The page or resource you are looking for does not exist or has been relocated as part of our curriculum overhaul.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            asChild
            className="bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-bold text-xs shadow-lg shadow-neon-cyan/20 hover:opacity-90 transition-opacity"
          >
            <Link href={isAdmin ? '/admin' : (user ? '/dashboard' : '/courses')}>
              {isAdmin ? (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Studio
                </>
              ) : user ? (
                <>
                  <Home className="w-4 h-4 mr-2" />
                  My Dashboard
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Courses
                </>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}