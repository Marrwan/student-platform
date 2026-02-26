'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Code,
  Eye,
  Upload,
  Github,
  Star,
  Award,
  Activity,
  Users,
  FileText,
  Bell,
  Settings,
  Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useTodayProject,
  useRecentSubmissions,
  useProgressStats,
  useNotifications,
  usePaymentHistory
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
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  // Role-based redirection
  if (user.role === 'admin') {
    router.replace('/admin');
    return null;
  }

  if (user.role === 'staff' || user.role === 'instructor') {
    router.replace('/hrms/dashboard');
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

  // Use optimized hooks for data fetching
  const { data: todayProjectData, isLoading: todayProjectLoading } = useTodayProject();
  const { data: recentSubmissionsData, isLoading: submissionsLoading } = useRecentSubmissions();
  const { data: progressStatsData, isLoading: statsLoading } = useProgressStats();
  const { data: notificationsData } = useNotifications();
  const { data: paymentsData } = usePaymentHistory({ limit: 3 });

  // Memoize data to prevent unnecessary re-renders
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

  // Memoize computed values
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

  // Memoize status color functions
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  }, []);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
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

  // Loading state
  const isLoading = todayProjectLoading || submissionsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Student Dashboard
              </h1>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Continue your learning journey
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Button variant="outline" onClick={() => router.push('/classes')} size="sm" className="flex-1 sm:flex-none">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Join Class</span>
                <span className="sm:hidden">Classes</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{progressStats.totalScore}</div>
              <p className="text-xs text-muted-foreground">
                Rank #{progressStats.rank} of {progressStats.totalStudents}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{progressStats.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">
                Keep it up! 🔥
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {progressStats.completedProjects} of {progressStats.totalProjects} projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{progressStats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                Excellent performance!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/projects')}>
              <CardContent className="p-4 sm:p-6 text-center">
                <Code className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Programming Projects</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Complete daily coding challenges and improve your skills</p>
                <Button size="sm" className="w-full">View Projects</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/classes')}>
              <CardContent className="p-4 sm:p-6 text-center">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Join Classes</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Enroll in classes and participate in structured learning</p>
                <Button size="sm" className="w-full">Join Classes</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/assignments')}>
              <CardContent className="p-4 sm:p-6 text-center">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Class Assignments</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Submit assignments and track your academic progress</p>
                <Button size="sm" className="w-full">View Assignments</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Join Class Call-to-Action */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">Ready to Learn?</h3>
                  <p className="text-blue-700 mb-4 text-sm sm:text-base">Join a class to get structured learning, assignments, and instructor guidance.</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => router.push('/classes')} className="bg-blue-600 hover:bg-blue-700" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Classes
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/student-guide')} size="sm">
                      <Info className="h-4 w-4 mr-2" />
                      Learn How
                    </Button>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Recent Notifications</h2>
          <div className="space-y-2">
            {recentNotifications.length === 0 && <div className="text-gray-500 text-sm">No notifications</div>}
            {recentNotifications.map(n => (
              <div key={n.id} className={`p-3 rounded border ${!n.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                <div className="font-medium text-sm sm:text-base">{n.title}</div>
                <div className="text-sm text-gray-600">{n.content}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Recent Payments</h2>
          <div className="space-y-2">
            {recentPayments.length === 0 && <div className="text-gray-500 text-sm">No recent payments</div>}
            {recentPayments.map(p => (
              <div key={p.id} className={`p-3 rounded border ${p.status === 'successful' ? 'bg-green-50 border-green-200' : p.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                <div className="font-medium text-sm sm:text-base">{p.type === 'late_fee' ? 'Late Fee' : p.type}</div>
                <div className="text-sm text-gray-600">Amount: ₦{p.amount}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(p.createdAt).toLocaleString()} - {p.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Today's Project */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                      Current Assignment
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {todayProject ? 'Your current assignment' : 'No assignment available'}
                    </CardDescription>
                  </div>
                  {todayProject && (
                    <Badge className={getDifficultyColor(todayProject.difficulty)}>
                      {todayProject.difficulty}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {todayProject ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold">{todayProject.title}</h3>
                        {todayProject.class && (
                          <Badge variant="secondary" className="text-xs w-fit">
                            {todayProject.class}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                        {todayProject.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Time Remaining</span>
                        </div>
                        <div className={`text-base sm:text-lg font-bold ${todayProject.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                          {todayProject.timeRemaining}
                        </div>
                        {todayProject.isOverdue && (
                          <p className="text-xs text-red-600">Assignment is overdue!</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Requirements</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {todayProject.requirements.length} requirements
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm sm:text-base">Requirements:</h4>
                      <ul className="space-y-2">
                        {Array.isArray(todayProject.requirements) ? todayProject.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        )) : (
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {todayProject.requirements || 'No requirements specified'}
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        className="flex-1"
                        onClick={() => router.push(`/assignments/${todayProject.id}`)}
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Assignment
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/assignments/${todayProject.id}`)}
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Work
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Assignments Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                      {(todayProjectData as TodayProjectResponse)?.message || 'Join a class to see assignments'}
                    </p>
                    <Button onClick={() => router.push('/classes')} className="mt-2" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Classes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Progress */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/assignments')} size="sm">
                  <Code className="h-4 w-4 mr-2" />
                  View All Assignments
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/classes')} size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Classes
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/assignments')} size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Assignments
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/leaderboard')} size="sm">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Leaderboard
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/progress')} size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Track Progress
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/student-guide')} size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Student Guide
                </Button>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{completionRate}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-green-600">{progressStats.completedProjects}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-yellow-600">{progressStats.pendingProjects}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-red-600">{progressStats.missedProjects}</div>
                    <div className="text-muted-foreground">Missed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-blue-600">{progressStats.averageScore}%</div>
                    <div className="text-muted-foreground">Avg Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="mt-6 sm:mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Submissions</CardTitle>
              <CardDescription className="text-sm">
                Your latest project submissions and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm sm:text-base">{submission.projectTitle}</h4>
                          {submission.class && (
                            <Badge variant="outline" className="text-xs w-fit">
                              {submission.class}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted {formatDate(submission.submittedAt)}
                        </p>
                        {submission.feedback && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {submission.feedback}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                        {submission.score && (
                          <Badge variant="secondary">{submission.score}/100</Badge>
                        )}
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Submissions Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Start working on your first project to see submissions here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievement & Streak */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">
                  {progressStats.currentStreak} days
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Keep it up! You're on fire! 🔥
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-xs">+10 bonus points</Badge>
                  <Badge variant="outline" className="text-xs">7-day streak</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Leaderboard Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                  #{progressStats.rank}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Out of {progressStats.totalStudents} students
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-xs">Top 1%</Badge>
                  <Badge variant="outline" className="text-xs">Elite</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Rules & Penalties</h2>
          <div className="text-gray-600 mb-2 text-sm sm:text-base">All tasks are time-bound. Late = deduction. Missed = 0. Repeat plagiarism = flagged/disqualified. See full rules for details.</div>
          <a href="/rules" className="text-blue-600 underline text-sm sm:text-base">View Full Rules</a>
        </div>
      </main>
    </div>
  );
} 