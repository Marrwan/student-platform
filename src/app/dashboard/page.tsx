'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { usePermissions } from '@/lib/permissions';
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
import { lmsApi } from '@/lib/lms-api-client';
import { Course } from '@/types/lms';
import {
  useTodayProject,
  useRecentSubmissions,
  useProgressStats,
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
  const { user, loading, rehydrated } = useAuth();
  const { hasRole, isSuperAdmin } = usePermissions();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  // Permission-based redirect: admin-level users go to /admin, instructors go elsewhere
  useEffect(() => {
    if (!user || loading || !rehydrated) return;

    // Check if user has admin-level permissions → redirect to admin dashboard
    if (isSuperAdmin || hasRole('admin') || hasRole('super admin')) {
      setRedirecting(true);
      router.replace('/admin');
      return;
    }

    // Instructors/staff could have their own dashboard in the future
    if (hasRole('instructor') || hasRole('staff')) {
      // For now, stay on student dashboard (instructors can also be learners)
      // When instructor dashboard is built, redirect there
    }
  }, [user, loading, rehydrated, isSuperAdmin, hasRole, router]);

  if (loading || !rehydrated || redirecting) {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <StudentDashboard />;
}

function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Only use hooks that map to real backend endpoints:
  // - useTodayProject → GET /dashboard/today-project ✅
  // - useRecentSubmissions → GET /dashboard/recent-submissions ✅
  // - useProgressStats → GET /dashboard/progress-stats ✅
  // - usePendingAssignments → GET /dashboard/pending-assignments ✅
  // 
  // REMOVED (no backend endpoint):
  // - useNotifications → GET /notifications ❌ 404
  // - useLeaderboard → GET /leaderboard?limit=N ❌ wrong format
  // - useUserBadges → GET /gamification/badges/user/{id} ❌ 404
  // - usePaymentHistory → stays removed (not relevant for dashboard)
  const { data: todayProjectData, isLoading: todayProjectLoading } = useTodayProject();
  const { data: recentSubmissionsData, isLoading: submissionsLoading } = useRecentSubmissions();
  const { data: progressStatsData, isLoading: statsLoading } = useProgressStats();
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
  const pendingAssignments = useMemo(() => (pendingAssignmentsData as any)?.assignments || [], [pendingAssignmentsData]);

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await lmsApi.getCourses();
        const enrolled = (res.data || []).filter((c: any) => c.is_enrolled);
        setEnrolledCourses(enrolled);
      } catch (e) {
        console.error('Failed to load courses on dashboard', e);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchEnrolledCourses();
  }, []);

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
                <span>Learning Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet">{user?.firstName}</span>!
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Continue your learning journey and view your latest upcoming tasks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => router.push('/courses')} className="glass-card hover:bg-white/5 border-white/10 text-muted-foreground hover:text-foreground">
                <BookOpen className="h-4 w-4 mr-2 text-neon-emerald" />
                Courses
              </Button>
              <Button variant="outline" onClick={() => router.push('/leaderboard')} className="glass-card hover:bg-white/5 border-white/10 text-muted-foreground hover:text-foreground">
                <Trophy className="h-4 w-4 mr-2 text-neon-amber" />
                Leaderboard
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
                  {progressStats.completedProjects} / {progressStats.totalProjects} COMPLETED
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
          {/* Enrolled Courses & Progress Section (freeCodeCamp style) */}
          {enrolledCourses.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-neon-cyan" />
                  <h2 className="text-xl font-bold text-white tracking-tight">Your Enrolled Courses</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/courses')} className="text-xs text-neon-cyan hover:text-white">
                  Browse All Courses &rarr;
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/courses/${c.slug || c.id}`)}
                    className="glass-card p-6 rounded-2xl border border-white/10 hover:border-neon-cyan/40 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan text-[10px] font-mono mb-2">
                          {c.difficulty || 'Beginner'}
                        </Badge>
                        <h3 className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
                          {c.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {c.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Progress</span>
                        <span className="font-bold text-neon-emerald">
                          {c.progress_percentage ?? 0}% ({c.completed_topics_count ?? 0}/{c.total_topics_count ?? 0} Lessons)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-emerald rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(c.progress_percentage ?? 0, 3)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <span className="text-xs font-bold text-neon-cyan flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Continue Learning</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">

            {/* Main Center Column */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 sm:space-y-8">

              {/* Active Tasks — pending items */}
              <div className="glass-card p-6 sm:p-8 hover-glow-cyan transition-colors duration-500 relative overflow-hidden group">
                <div className="absolute top-0 -right-20 w-80 h-80 bg-neon-cyan/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-neon-cyan/15 transition-colors duration-700"></div>
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-neon-violet/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-neon-violet/10 transition-colors duration-700"></div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 relative z-10">
                  <div>
                    <h2 className="text-sm tracking-widest uppercase font-bold text-neon-cyan mb-2 flex items-center gap-2 mono-font">
                      <Zap className="h-4 w-4" />
                      Active Tasks
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {pendingAssignments.length > 0
                        ? `${pendingAssignments.length} task${pendingAssignments.length > 1 ? 's' : ''} pending completion`
                        : 'All caught up — no pending tasks.'}
                    </p>
                  </div>
                  {pendingAssignments.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/courses')}
                      className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground mono-font text-xs tracking-wider shrink-0"
                    >
                      View Courses
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
                        onClick={() => router.push(`/courses`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-foreground group-hover/item:text-neon-cyan transition-colors text-sm truncate">
                                {assignment.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-xs mono-font">
                              <span className={`flex items-center gap-1 font-medium ${assignment.isOverdue ? 'text-neon-rose' : 'text-neon-cyan'}`}>
                                <Clock className="h-3 w-3" />
                                {assignment.timeRemaining}
                              </span>
                              <span className="text-muted-foreground">
                                Max: {assignment.maxScore} pts
                              </span>
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
                      {(todayProjectData as TodayProjectResponse)?.message || 'No pending tasks. Browse courses to get started.'}
                    </p>
                    <Button onClick={() => router.push('/courses')} variant="outline" className="border-white/10 hover:bg-white/5 text-foreground">
                      Browse Courses
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
                    Recent Submissions
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
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Code className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No recent submissions.</p>
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
                  Quick Navigation
                </h2>
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" className="justify-start hover:bg-white/5 text-muted-foreground hover:text-foreground font-normal" onClick={() => router.push('/courses')}>
                    <BookOpen className="h-4 w-4 mr-3 text-neon-cyan" />
                    Browse Courses
                  </Button>
                  <Button variant="ghost" className="justify-start hover:bg-white/5 text-muted-foreground hover:text-foreground font-normal" onClick={() => router.push('/leaderboard')}>
                    <Trophy className="h-4 w-4 mr-3 text-neon-amber" />
                    Leaderboard Rankings
                  </Button>
                  <Button variant="ghost" className="justify-start hover:bg-white/5 text-muted-foreground hover:text-foreground font-normal" onClick={() => router.push('/progress')}>
                    <TrendingUp className="h-4 w-4 mr-3 text-neon-emerald" />
                    Track Full Progress
                  </Button>
                  <Button variant="ghost" className="justify-start hover:bg-white/5 text-muted-foreground hover:text-foreground font-normal" onClick={() => router.push('/certificates')}>
                    <Award className="h-4 w-4 mr-3 text-neon-violet" />
                    My Certificates
                  </Button>
                  <Button variant="ghost" className="justify-start hover:bg-neon-cyan/10 hover:text-neon-cyan text-muted-foreground font-normal transition-colors" onClick={() => router.push('/rules')}>
                    <Info className="h-4 w-4 mr-3" />
                    Platform Rules
                  </Button>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="glass-card p-6 border-neon-emerald/20 hover-glow-emerald transition-all duration-500 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-emerald/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-neon-emerald/10 transition-colors duration-500"></div>
                <h2 className="text-sm tracking-widest uppercase font-bold mb-5 text-neon-emerald mono-font flex items-center gap-2 relative z-10">
                  <Target className="h-4 w-4" />
                  Progress
                </h2>
                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex justify-between text-xs tracking-wider uppercase mb-2 mono-font">
                      <span className="text-muted-foreground font-medium">Completion</span>
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