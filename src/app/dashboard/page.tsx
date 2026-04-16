'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Trophy, Target, TrendingUp, CheckCircle,
  XCircle, AlertCircle, BookOpen, Code, Eye, Upload, Github,
  Star, Award, Activity, Users, FileText, Bell, Settings, Info,
  Sparkles, ArrowRight, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useTodayProject,
  useRecentSubmissions,
  useProgressStats,
  useNotifications,
  usePaymentHistory,
  useLeaderboard,
  useUserBadges,
  usePendingAssignments
} from '@/lib/hooks';

interface TodayProject {
  id: string;
  title: string;
  description: string;
  deadline: string;
  timeRemaining: string;
  isOverdue: boolean;
  status: 'pending' | 'completed' | 'missed';
  difficulty: string;
  requirements: string[];
  class?: string;
}

interface TodayProjectResponse {
  project: TodayProject | null;
  message?: string;
}

interface RecentSubmission {
  id: string;
  projectTitle: string;
  class?: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  score?: number;
  feedback?: string;
}

interface ProgressStats {
  totalProjects: number;
  completedProjects: number;
  missedProjects: number;
  pendingProjects: number;
  averageScore: number;
  currentStreak: number;
  totalScore: number;
  rank: number;
  totalStudents: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen p-6 sm:p-8 pt-24 bg-background">
        <div className="container mx-auto max-w-7xl">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.role === 'admin') {
    router.replace('/admin');
    return null;
  }

  if (user.role === 'staff' || user.role === 'instructor' || user.role === 'partial_admin') {
    router.replace('/hrms/dashboard');
    return null;
  }

  // Final check: if user is logged in but has no valid role for student dashboard, redirect to login or error
  if (user.role !== 'student' && user.role !== 'admin' && user.role !== 'staff' && user.role !== 'instructor') {
    console.error('Invalid user role detected:', user.role);
    router.replace('/login');
    return null;
  }

  return (
    <ProtectedRoute requiredRole="student">
      <StudentDashboard />
    </ProtectedRoute>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: todayProjectData, isLoading: todayProjectLoading } = useTodayProject();
  const { data: recentSubmissionsData, isLoading: submissionsLoading } = useRecentSubmissions();
  const { data: progressStatsData, isLoading: statsLoading } = useProgressStats();
  const { data: notificationsData } = useNotifications();
  const { data: paymentsData } = usePaymentHistory({ limit: 3 });
  const { data: leaderboardData } = useLeaderboard({ limit: 3 });
  const { data: badgesData } = useUserBadges(user?.id);
  const { data: pendingAssignmentsData } = usePendingAssignments();

  const todayProject = useMemo(() => (todayProjectData as TodayProjectResponse)?.project || null, [todayProjectData]);
  const recentSubmissions = useMemo(() => recentSubmissionsData?.submissions || [], [recentSubmissionsData]);
  const progressStats = useMemo(() => progressStatsData?.stats || {
    totalProjects: 0,
    completedProjects: 0,
    missedProjects: 0,
    pendingProjects: 0,
    averageScore: 0,
    currentStreak: 0,
    totalScore: 0,
    rank: 0,
    totalStudents: 0
  }, [progressStatsData]);
  const recentNotifications = useMemo(() => notificationsData?.notifications?.slice(0, 5) || [], [notificationsData]);
  const recentPayments = useMemo(() => paymentsData?.data?.slice(0, 3) || [], [paymentsData]);
  const topStudents = useMemo(() => leaderboardData?.data || [], [leaderboardData]);
  const myBadges = useMemo(() => badgesData || [], [badgesData]);
  const pendingAssignments = useMemo(() => (pendingAssignmentsData as any)?.assignments || [], [pendingAssignmentsData]);

  const completionRate = useMemo(() => {
    return progressStats.totalProjects > 0
      ? Math.round((progressStats.completedProjects / progressStats.totalProjects) * 100)
      : 0;
  }, [progressStats]);

  const overallProgress = useMemo(() => {
    return progressStats.totalProjects > 0
      ? (progressStats.completedProjects / progressStats.totalProjects) * 100
      : 0;
  }, [progressStats]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-neon-amber/10 text-neon-amber border-neon-amber/20';
      case 'reviewed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'accepted':
        return 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20';
      case 'rejected':
        return 'bg-neon-rose/10 text-neon-rose border-neon-rose/20';
      default:
        return 'bg-white/5 text-gray-300 border-white/10';
    }
  }, []);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20';
      case 'intermediate':
        return 'bg-neon-amber/10 text-neon-amber border-neon-amber/20';
      case 'advanced':
        return 'bg-neon-rose/10 text-neon-rose border-neon-rose/20';
      default:
        return 'bg-white/5 text-gray-300 border-white/10';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const isLoading = todayProjectLoading || submissionsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 sm:p-8 pt-24 bg-background">
        <div className="container mx-auto max-w-7xl">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Ambient glowing origins */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[40rem] h-[40rem] bg-neon-violet/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl relative z-10">

        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neon-cyan mb-4 backdrop-blur-md">
                <Code className="h-3 w-3" />
                <span>Student Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet">{user?.firstName}</span>!
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Continue your learning journey and view your latest upcoming tasks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => router.push('/classes')} className="glass-card hover:bg-white/5 border-white/10 text-muted-foreground hover:text-foreground">
                <BookOpen className="h-4 w-4 mr-2 text-neon-emerald" />
                Classes
              </Button>
              <Button variant="outline" className="glass-card hover:bg-white/5 border-white/10 text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4 mr-2 text-neon-amber" />
                Alerts
              </Button>
            </div>
          </div>
        </motion.header>

        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="glass-card p-6 flex flex-col justify-between group hover-glow-cyan transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-cyan/10 transition-colors duration-500"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mono-font">Total Score</span>
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-neon-cyan/30 group-hover:bg-neon-cyan/10 transition-colors duration-300">
                  <Trophy className="h-4 w-4 text-neon-cyan" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-1 mono-font bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-white">{progressStats.totalScore}</div>
                <p className="text-xs text-muted-foreground truncate mono-font">
                  RANK #{progressStats.rank} / {progressStats.totalStudents}
                </p>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between group hover-glow-violet transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-violet/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-violet/10 transition-colors duration-500"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mono-font">Current Streak</span>
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-neon-violet/30 group-hover:bg-neon-violet/10 transition-colors duration-300">
                  <TrendingUp className="h-4 w-4 text-neon-violet" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-1 mono-font bg-clip-text text-transparent bg-gradient-to-r from-neon-violet to-white">{progressStats.currentStreak} <span className="text-xl">DAYS</span></div>
                <p className="text-xs text-neon-violet/80 mono-font">
                  KEEP IT UP! 🔥
                </p>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between group hover-glow-emerald transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-emerald/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-emerald/10 transition-colors duration-500"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mono-font">Completion Rate</span>
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-neon-emerald/30 group-hover:bg-neon-emerald/10 transition-colors duration-300">
                  <Target className="h-4 w-4 text-neon-emerald" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-1 mono-font bg-clip-text text-transparent bg-gradient-to-r from-neon-emerald to-white">{completionRate}%</div>
                <p className="text-xs text-muted-foreground mono-font">
                  {progressStats.completedProjects} / {progressStats.totalProjects} PRJs
                </p>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between group hover-glow-amber transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-amber/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-amber/10 transition-colors duration-500"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mono-font">Average Score</span>
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-neon-amber/30 group-hover:bg-neon-amber/10 transition-colors duration-300">
                  <Star className="h-4 w-4 text-neon-amber" />
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-1 mono-font bg-clip-text text-transparent bg-gradient-to-r from-neon-amber to-white">{progressStats.averageScore}%</div>
                <p className="text-xs text-muted-foreground mono-font">
                  EXCELLENT PERF
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">

            {/* Main Center Column */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 sm:space-y-8">

              {/* Active Assignments — all pending (unsubmitted) */}
              <div className="glass-card p-6 sm:p-8 hover-glow-cyan transition-colors duration-500 relative overflow-hidden group">
                <div className="absolute top-0 -right-20 w-80 h-80 bg-neon-cyan/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-neon-cyan/15 transition-colors duration-700"></div>
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-neon-violet/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-neon-violet/10 transition-colors duration-700"></div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 relative z-10">
                  <div>
                    <h2 className="text-sm tracking-widest uppercase font-bold text-neon-cyan mb-2 flex items-center gap-2 mono-font">
                      <Zap className="h-4 w-4" />
                      Active Assignments
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {pendingAssignments.length > 0
                        ? `${pendingAssignments.length} assignment${pendingAssignments.length > 1 ? 's' : ''} pending submission`
                        : 'All caught up — no pending assignments.'}
                    </p>
                  </div>
                  {pendingAssignments.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/assignments')}
                      className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground mono-font text-xs tracking-wider shrink-0"
                    >
                      View All
                      <ArrowRight className="h-3 w-3 ml-1.5" />
                    </Button>
                  )}
                </div>

                {pendingAssignments.length > 0 ? (
                  <div className="space-y-3 relative z-10">
                    {pendingAssignments.map((assignment: any) => (
                      <div
                        key={assignment.id}
                        className={`bg-background/40 backdrop-blur-md p-4 rounded-xl border transition-colors cursor-pointer group/item ${
                          assignment.isOverdue
                            ? 'border-neon-rose/30 hover:border-neon-rose/60'
                            : 'border-white/5 hover:border-neon-cyan/30'
                        }`}
                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-foreground group-hover/item:text-neon-cyan transition-colors text-sm truncate">
                                {assignment.title}
                              </h3>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/5 border border-white/10 rounded text-muted-foreground mono-font shrink-0">
                                {assignment.class}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs mono-font">
                              <span className={`flex items-center gap-1 font-medium ${assignment.isOverdue ? 'text-neon-rose' : 'text-neon-cyan'}`}>
                                <Clock className="h-3 w-3" />
                                {assignment.timeRemaining}
                              </span>
                              <span className="text-muted-foreground">
                                Max: {assignment.maxScore} pts
                              </span>
                              {assignment.paymentRequired && assignment.isOverdue && (
                                <span className="text-neon-amber flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Fee required
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {assignment.isOverdue ? (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-neon-rose/10 border border-neon-rose/30 rounded text-neon-rose mono-font">
                                Overdue
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-neon-emerald/10 border border-neon-emerald/30 rounded text-neon-emerald mono-font">
                                Active
                              </span>
                            )}
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/item:text-neon-cyan transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-secondary/10 rounded-xl border border-white/5 relative z-10">
                    <CheckCircle className="h-10 w-10 text-neon-emerald mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                      {(todayProjectData as TodayProjectResponse)?.message || 'No pending assignments. Join a class to get started.'}
                    </p>
                    <Button onClick={() => router.push('/classes')} variant="outline" className="border-white/10 hover:bg-white/5 text-foreground">
                      Browse Classes
                    </Button>
                  </div>
                )}
              </div>

              {/* Recent Submissions */}
              <div className="glass-card overflow-hidden group hover-glow-violet transition-colors duration-500 relative">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-neon-violet/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-neon-violet/15 transition-colors duration-700"></div>
                <div className="p-6 border-b border-white/5 relative z-10">
                  <h2 className="text-sm tracking-widest uppercase font-bold text-neon-violet flex items-center gap-2 mono-font">
                    <FileText className="h-4 w-4" />
                    Transmission Logs
                  </h2>
                </div>

                <div className="p-0">
                  {recentSubmissions.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {recentSubmissions.map((submission) => (
                        <div key={submission.id} className="p-6 hover:bg-white/5 transition-colors group/row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground group-hover/row:text-neon-cyan transition-colors">{submission.projectTitle}</h4>
                              {submission.class && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/5 border border-white/10 rounded text-muted-foreground mono-font">
                                  {submission.class}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 mono-font flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-neon-violet/50"></span>
                              {formatDate(submission.submittedAt)}
                            </p>
                            {submission.feedback && (
                              <p className="text-xs bg-background p-3 rounded-md border border-white/5 italic text-muted-foreground/80 mono-font">
                                &gt; {submission.feedback}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${getStatusColor(submission.status)} mono-font text-[10px] tracking-widest uppercase`}>
                                {submission.status}
                              </Badge>
                              {submission.score && (
                                <Badge variant="secondary" className="bg-background border border-white/10 font-mono text-neon-emerald mono-font">
                                  {submission.score} / 100
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full border-white/10 hover:border-neon-cyan hover:text-neon-cyan group-hover/row:border-neon-cyan/50 group-hover/row:text-neon-cyan transition-colors bg-background"
                              onClick={() => router.push(`/assignments/${submission.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Code className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No recent code submissions.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">

              {/* Quick Actions */}
              <div className="glass-card p-6 overflow-hidden relative group hover-glow-amber transition-all duration-500">
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-neon-amber/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-neon-amber/10 transition-colors duration-500"></div>
                <h2 className="text-sm tracking-widest uppercase font-bold mb-4 text-neon-amber flex items-center gap-2 mono-font relative z-10">
                  <Activity className="h-4 w-4" />
                  System Navigation
                </h2>
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" className="justify-start hover:bg-white/5 text-muted-foreground hover:text-foreground font-normal" onClick={() => router.push('/projects')}>
                    <Code className="h-4 w-4 mr-3 text-neon-cyan" />
                    Project Library
                  </Button>
                  <Button variant="ghost" className="justify-start hover:bg-white/5 text-muted-foreground hover:text-foreground font-normal" onClick={() => router.push('/leaderboard')}>
                    <Trophy className="h-4 w-4 mr-3 text-neon-amber" />
                    Leaderboard Rankings
                  </Button>
                  <Button variant="ghost" className="justify-start hover:bg-white/5 text-muted-foreground hover:text-foreground font-normal" onClick={() => router.push('/progress')}>
                    <TrendingUp className="h-4 w-4 mr-3 text-neon-emerald" />
                    Track Full Progress
                  </Button>
                  <Button variant="ghost" className="justify-start hover:bg-neon-cyan/10 hover:text-neon-cyan text-muted-foreground font-normal transition-colors" onClick={() => router.push('/student-guide')}>
                    <Info className="h-4 w-4 mr-3" />
                    Student Handbook
                  </Button>
                </div>
              </div>

              {/* Earned Badges */}
              <div className="glass-card p-6 border-neon-cyan/20 hover-glow-cyan transition-all duration-500 relative overflow-hidden group">
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon-cyan/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-cyan/10 transition-colors duration-500"></div>
                <h2 className="text-sm tracking-widest uppercase font-bold mb-5 text-neon-cyan mono-font flex items-center gap-2 relative z-10">
                  <Award className="h-4 w-4" />
                  Earned Badges
                </h2>
                <div className="flex flex-wrap gap-3 relative z-10">
                  {myBadges.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic px-2">No badges earned yet. Keep coding!</p>
                  ) : (
                    myBadges.map((userBadge: any) => (
                      <div key={userBadge.id} className="group relative">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-2xl hover:scale-110 transition-transform cursor-help">
                          {userBadge.badge?.icon || '🏅'}
                        </div>
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] sm:text-xs p-2 rounded border border-white/10 text-center z-50 shadow-xl">
                          <strong className="block text-neon-cyan mb-1">{userBadge.badge?.name || 'Badge'}</strong>
                          <span className="text-muted-foreground">{userBadge.badge?.description || 'Achievement unlocked'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top 3 Leaderboard */}
              <div className="glass-card p-6 border-neon-amber/20 hover-glow-amber transition-all duration-500 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-amber/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-amber/10 transition-colors duration-500"></div>
                <h2 className="text-sm tracking-widest uppercase font-bold mb-5 text-neon-amber mono-font flex items-center gap-2 relative z-10">
                  <Trophy className="h-4 w-4" />
                  Top Scholars
                </h2>
                <div className="space-y-3 relative z-10">
                  {topStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic px-2">No rankings available yet.</p>
                  ) : (
                    topStudents.map((student: any, i: number) => (
                      <div key={student.id} className={`flex items-center justify-between p-3 rounded-lg border ${student.isCurrentUser ? 'bg-neon-amber/10 border-neon-amber/30' : 'bg-background/50 border-white/5'} transition-colors`}>
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-gray-300/20 text-gray-300' : 'bg-amber-700/20 text-amber-600'}`}>
                            {i + 1}
                          </span>
                          <span className={`text-sm font-medium ${student.isCurrentUser ? 'text-neon-amber' : 'text-foreground'}`}>
                            {student.firstName} {student.lastName}
                            {student.isCurrentUser && <span className="ml-2 text-xs opacity-70">(You)</span>}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-neon-cyan">{student.totalScore} pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Progress Overview */}
              <div className="glass-card p-6 border-neon-emerald/20 hover-glow-emerald transition-all duration-500 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-emerald/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-emerald/10 transition-colors duration-500"></div>
                <h2 className="text-sm tracking-widest uppercase font-bold mb-5 text-neon-emerald mono-font flex items-center gap-2 relative z-10">
                  <Target className="h-4 w-4" />
                  Diagnostics
                </h2>
                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex justify-between text-xs tracking-wider uppercase mb-2 mono-font">
                      <span className="text-muted-foreground font-medium">Curriculum Path</span>
                      <span className="font-bold text-neon-emerald">{completionRate}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2 bg-white/5" indicatorClassName="bg-neon-emerald" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-background/50 rounded flex flex-col items-center justify-center p-3 border border-white/5">
                      <span className="text-lg font-bold text-neon-emerald mb-1">{progressStats.completedProjects}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Done</span>
                    </div>
                    <div className="bg-background/50 rounded flex flex-col items-center justify-center p-3 border border-white/5">
                      <span className="text-lg font-bold text-neon-amber mb-1">{progressStats.pendingProjects}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Wait</span>
                    </div>
                    <div className="bg-background/50 rounded flex flex-col items-center justify-center p-3 border border-white/5">
                      <span className="text-lg font-bold text-neon-rose mb-1">{progressStats.missedProjects}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Miss</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="glass-card p-6 hover-glow-violet transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-violet/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-violet/10 transition-colors duration-500"></div>
                <h2 className="text-sm tracking-widest uppercase font-bold mb-4 text-neon-violet flex items-center gap-2 mono-font relative z-10">
                  <Bell className="h-4 w-4" />
                  System Alerts
                </h2>
                <div className="flex flex-col gap-3 relative z-10">
                  {recentNotifications.length === 0 && <p className="text-sm text-muted-foreground italic px-2">No active alerts.</p>}
                  {recentNotifications.map(n => (
                    <div key={n.id} className="relative pl-4 border-l-2 border-white/10 py-1 hover:border-neon-violet transition-colors">
                      <div className="font-medium text-xs tracking-wider text-foreground mono-font uppercase">{n.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{n.content}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Rules Callout */}
              <div className="p-5 rounded-xl border border-neon-rose/20 bg-neon-rose/5">
                <p className="text-sm text-muted-foreground mb-3">
                  <strong className="text-neon-rose flex items-center gap-1 mb-1"><AlertCircle className="h-3 w-3" /> Note:</strong>
                  Late submissions incur penalties. Repeated plagiarism results in disqualification.
                </p>
                <a href="/rules" className="text-xs text-neon-cyan hover:underline hover:text-neon-cyan/80 transition-colors">Review full platform rules</a>
              </div>

            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}