'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Trophy, Users, Clock, ArrowRight, Star, Zap, Target, BookOpen, Award, MessageSquare, Calendar, LogOut, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-neon-cyan/20 selection:text-neon-cyan">
      {/* Ambient glowing orbs */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[40rem] h-[40rem] bg-neon-violet/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4 sm:py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                <Code className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                Nexus
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" onClick={() => handleNavigation('/login')} className="text-muted-foreground hover:text-foreground hover:bg-white/5 text-sm sm:text-base">
                Sign In
              </Button>
              <Button onClick={() => handleNavigation('/register')} className="bg-neon-cyan text-black hover:bg-neon-cyan/90 border-0 shadow-[0_0_20px_rgba(0,255,255,0.2)] text-sm sm:text-base hidden sm:inline-flex">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 px-4">
        {/* Hero Section */}
        <section className="container mx-auto text-center max-w-5xl mb-24 sm:mb-32 relative z-10 pt-8 sm:pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm md:text-base text-neon-cyan mb-8 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Welcome to the next generation of learning</span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 sm:mb-8 text-foreground leading-[1.1]">
            Master Programming with
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-emerald to-neon-violet">
              Structured Learning
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Join our comprehensive learning platform designed for students. Complete assignments, track progress, and develop real-world skills with expert guidance and automated feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={() => handleNavigation('/register')} className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 h-14 px-8 text-base shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform duration-300">
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleNavigation('/rules')} className="w-full sm:w-auto h-14 px-8 text-base border-white/10 hover:bg-white/5 backdrop-blur-sm text-foreground hover:scale-105 transition-transform duration-300">
              View Rules & Guidelines
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto max-w-6xl mb-24 sm:mb-32 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 rounded-3xl bg-card/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="text-center p-4">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-emerald mb-2">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-widest">Structured Learning</div>
            </div>
            <div className="text-center p-4 border-l border-white/5">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-violet to-neon-pink mb-2">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-widest">Platform Access</div>
            </div>
            <div className="text-center p-4 md:border-l border-white/5 border-t md:border-t-0">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-amber to-neon-pink mb-2">₦500</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-widest">Late Fee System</div>
            </div>
            <div className="text-center p-4 border-l border-white/5 border-t md:border-t-0">
              <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">Real-time</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-widest">Progress Tracking</div>
            </div>
          </div>
        </section>

        {/* Bento Box Features */}
        <section className="container mx-auto max-w-6xl mb-24 sm:mb-32 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-16">
            Everything you need to <span className="text-neon-cyan">excel</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 relative overflow-hidden group hover:border-neon-cyan/50 transition-colors duration-500 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[80px] group-hover:bg-neon-cyan/10 transition-colors duration-500"></div>
              <BookOpen className="h-10 w-10 text-neon-cyan mb-8" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">Structured Classes</h3>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                Join organized classes with a clear curriculum. Follow progressive learning paths specifically designed to take you from beginner to advanced.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-bl from-card/80 to-card/40 backdrop-blur-xl border border-white/10 relative overflow-hidden group hover:border-neon-violet/50 transition-colors duration-500 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-violet/10 rounded-full blur-[40px] group-hover:bg-neon-violet/20 transition-colors duration-500"></div>
              <Target className="h-10 w-10 text-neon-violet mb-8" />
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Daily Assignments</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Complete time-bound tasks in various formats including GitHub links, zipped files, or direct code paste.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-tr from-card/80 to-card/40 backdrop-blur-xl border border-white/10 relative overflow-hidden group hover:border-neon-emerald/50 transition-colors duration-500 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-emerald/10 rounded-full blur-[40px] group-hover:bg-neon-emerald/20 transition-colors duration-500"></div>
              <MessageSquare className="h-10 w-10 text-neon-emerald mb-8" />
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Expert Feedback</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Receive detailed line-by-line feedback and guidance from seasoned instructors.
              </p>
            </div>

            <div className="md:col-span-2 p-8 sm:p-10 rounded-3xl bg-gradient-to-tl from-card/80 to-card/40 backdrop-blur-xl border border-white/10 relative overflow-hidden group hover:border-neon-pink/50 transition-colors duration-500 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/5 rounded-full blur-[80px] group-hover:bg-neon-pink/10 transition-colors duration-500"></div>
              <Award className="h-10 w-10 text-neon-pink mb-8" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">Progress Tracking</h3>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                Monitor your entire learning journey with detailed analytics. Verify your standing on competitive leaderboards and earn achievements as you master new skills.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="p-10 sm:p-16 rounded-[2rem] bg-gradient-to-b from-card/80 to-background backdrop-blur-xl border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-6 relative z-10 leading-tight">
              Ready to accelerate<br />your career?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto relative z-10 font-light">
              Join hundreds of students who are already mastering programming with our structured approach.
            </p>
            <Button size="lg" onClick={() => handleNavigation('/register')} className="bg-foreground text-background hover:bg-foreground/90 h-14 px-10 text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10 hover:scale-105 transition-transform duration-300">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background/80 backdrop-blur-xl mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center">
              <Code className="h-3 w-3 text-black" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">Nexus Learning</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Learning Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 