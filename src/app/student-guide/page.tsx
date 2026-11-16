'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Code,
  FileText,
  Trophy,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Star,
  Target,
  Award,
  Zap,
  Lock,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentGuidePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background glow origins */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-neon-cyan/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[40rem] h-[40rem] bg-neon-violet/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-16 z-20">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-xs text-neon-cyan mb-2 font-mono">
                <Info className="h-3 w-3" />
                <span>Documentation & Handbook</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Student Guide</h1>
              <p className="text-muted-foreground text-sm">
                Master the curriculum progression, automated test suites, capstone reviews, and certificates.
              </p>
            </div>
            <Button
              onClick={() => router.push('/courses')}
              className="bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-bold text-xs shrink-0 shadow-lg shadow-neon-cyan/20 hover:opacity-90"
            >
              Explore Courses
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <Tabs defaultValue="getting-started" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/5 p-1 border border-white/10 rounded-2xl">
            <TabsTrigger value="getting-started" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-background font-bold text-xs rounded-xl">
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-background font-bold text-xs rounded-xl">
              Course Structure
            </TabsTrigger>
            <TabsTrigger value="testing" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-background font-bold text-xs rounded-xl">
              Code Studio & Tests
            </TabsTrigger>
            <TabsTrigger value="capstones" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-background font-bold text-xs rounded-xl">
              Capstones & Badges
            </TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-6">
            <div className="glass-card p-6 sm:p-8 border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Welcome to Strangedev Platform</h2>
                  <p className="text-muted-foreground text-xs font-mono">Modern Engineer Mastery System</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Our platform uses a mastery-based sequential curriculum. Each topic has interactive documentation, hands-on coding exercises, and automated test runners designed to build real-world software engineering competencies.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-background/50 border border-white/5 hover:border-neon-cyan/30 transition-colors">
                  <BookOpen className="h-6 w-6 text-neon-cyan mb-3" />
                  <h3 className="font-bold text-sm mb-1">Curated Courses</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enroll in comprehensive tracks covering modern web frameworks, architectures, and algorithms.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-background/50 border border-white/5 hover:border-neon-violet/30 transition-colors">
                  <Code className="h-6 w-6 text-neon-violet mb-3" />
                  <h3 className="font-bold text-sm mb-1">Interactive Studio</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Write code directly in the split-pane Learning Studio with real-time test execution.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-background/50 border border-white/5 hover:border-neon-amber/30 transition-colors">
                  <Trophy className="h-6 w-6 text-neon-amber mb-3" />
                  <h3 className="font-bold text-sm mb-1">Rankings & Showcase</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Compete on weekly/monthly leaderboards and showcase your capstone projects to peer developers.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Curriculum */}
          <TabsContent value="curriculum" className="space-y-6">
            <div className="glass-card p-6 sm:p-8 border-white/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-neon-emerald" />
                Sequential Topic Unlocks
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  To ensure solid conceptual foundations, course modules and topics unlock sequentially. When you complete a topic by passing all automated test suites, the next topic unlocks automatically.
                </p>
                <div className="p-4 rounded-xl bg-neon-amber/5 border border-neon-amber/20 flex items-start gap-3 text-xs">
                  <AlertCircle className="h-4 w-4 text-neon-amber shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neon-amber font-semibold block mb-1">Module Deadlines & Late Unlock</strong>
                    <span>
                      Each module has a deadline schedule. Submitting topics after deadlines may require resolving late fees before subsequent chapters unlock.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Testing */}
          <TabsContent value="testing" className="space-y-6">
            <div className="glass-card p-6 sm:p-8 border-white/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-neon-cyan" />
                Automated Test Execution
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Inside the Topic Studio, your code runs against a battery of unit tests. Once all assertions pass with 100% accuracy, topic completion is recorded to your activity heatmap and score metrics.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Capstones */}
          <TabsContent value="capstones" className="space-y-6">
            <div className="glass-card p-6 sm:p-8 border-white/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-neon-violet" />
                Capstone Projects & Certificates
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  At the end of each course, you build and submit a real-world Capstone Project with a GitHub repository and live deployment URL. Verified certificates with cryptographic UUIDs are automatically generated upon course completion.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}