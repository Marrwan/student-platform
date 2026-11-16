'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Code,
  Trophy,
  Users,
  ArrowRight,
  Sparkles,
  Award,
  Terminal,
  Activity,
  Heart,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      const userRoles = [
        ...(user.roles || []),
        user.role || '',
      ].map((r) => String(r).toLowerCase().trim());

      const isAdmin = userRoles.includes('admin') || userRoles.includes('super admin');
      const redirectPath = isAdmin ? '/admin' : '/dashboard';
      router.replace(redirectPath);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white relative overflow-hidden font-sans">
      {/* Glowing Ambient Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[40rem] h-[40rem] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-[#090D16]/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Code className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white font-mono">
              Strangedev <span className="text-cyan-400">LMS</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <button
              onClick={() => router.push('/rules')}
              className="hidden sm:inline-block px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition"
            >
              Rules
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-3.5 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-mono text-xs font-bold transition shadow-lg shadow-neon-cyan/20 hover:opacity-90"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="pt-32 pb-20 px-6">
        {/* HERO SECTION */}
        <section className="container mx-auto text-center max-w-5xl mb-24 pt-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-cyan-400 mb-8 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Interactive Hands-On Learning & Engineering Ecosystem</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 text-white leading-tight">
            Master Software Development with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
              Interactive Code Playgrounds
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Build real software with sequential topic roadmaps, automated test case evaluation, 365-day contribution heatmaps, automated PDF certificate generation, and public capstone project showcases.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => router.push('/register')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white h-14 px-8 text-sm font-mono font-bold shadow-xl shadow-indigo-600/30 transition hover:scale-105"
            >
              Start Learning Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/rules')}
              className="w-full sm:w-auto h-14 px-8 text-sm font-mono border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Platform Guidelines & Rules
            </Button>
          </div>
        </section>

        {/* STATS HIGHLIGHTS */}
        <section className="container mx-auto max-w-6xl mb-28">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="text-center p-4">
              <div className="text-4xl font-extrabold text-cyan-400 font-mono mb-1">100%</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">Dynamic Roadmaps</div>
            </div>
            <div className="text-center p-4 border-l border-slate-800">
              <div className="text-4xl font-extrabold text-emerald-400 font-mono mb-1">0ms</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">Instant Test Execution</div>
            </div>
            <div className="text-center p-4 md:border-l border-slate-800 border-t md:border-t-0">
              <div className="text-4xl font-extrabold text-amber-400 font-mono mb-1">365d</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">Contribution Heatmap</div>
            </div>
            <div className="text-center p-4 border-l border-slate-800 border-t md:border-t-0">
              <div className="text-4xl font-extrabold text-indigo-400 font-mono mb-1">Verified</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">PDF Certificates</div>
            </div>
          </div>
        </section>

        {/* BENTO BOX PLATFORM FEATURES */}
        <section className="container mx-auto max-w-6xl mb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Built for Serious <span className="text-cyan-400">Developers</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Everything you need to practice, build, and showcase your skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Split-Pane Code Editor & Terminal</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Code directly inside your browser. Run your code against defined test case suites with real-time pass/fail assertions and terminal error feedback.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/50 transition shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Automated Gamification</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Compete on the weekly & monthly Leaderboard evaluated by accuracy (35%), punctuality (25%), streak (20%), Q&A upvotes (10%), and capstone scores (10%).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">GitHub Contribution Heatmap</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Track your study habits over 365 days with active daily streak monitoring and lifetime contribution counts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Verified PDF Certificates & Public Showcase</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Earn verifiable PDF certificates with QR codes upon 100% course completion. Feature your capstone projects in the public gallery with live iframe previews and peer upvoting.
              </p>
            </div>
          </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="container mx-auto max-w-4xl text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to start your learning journey?
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Join our platform today to access interactive courses, live playgrounds, and automated certificates.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/register')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 text-sm font-mono font-bold shadow-xl shadow-indigo-600/30 transition hover:scale-105"
            >
              Get Started Free Now
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090D16] py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4 text-cyan-400" />
            <span className="font-mono font-bold text-slate-200">Strangedev LMS</span>
          </div>
          <p className="mt-4 sm:mt-0 font-mono">
            &copy; {new Date().getFullYear()} Strangedev Learning Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}