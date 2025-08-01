'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
}

interface RecentSubmission {
  id: string;
  projectTitle: string;
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
  const { user } = useAuth();
  
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
  const [todayProject, setTodayProject] = useState<TodayProject | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalProjects: 0,
    completedProjects: 0,
    missedProjects: 0,
    pendingProjects: 0,
    averageScore: 0,
    currentStreak: 0,
    totalScore: 0,
    rank: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      api.getNotifications().then(res => setRecentNotifications(res.notifications?.slice(0, 5) || []));
      api.getPaymentHistory().then(res => setRecentPayments(res.data?.slice(0, 3) || []));
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load today's project
      const projectResponse = await api.getTodayProject();
      setTodayProject(projectResponse.project || null);

      // Load recent submissions
      const submissionsResponse = await api.getRecentSubmissions();
      setRecentSubmissions(submissionsResponse.submissions || []);

      // Load progress stats
      const statsResponse = await api.getProgressStats();
      setProgressStats(statsResponse.stats || {
        totalProjects: 0,
        completedProjects: 0,
        missedProjects: 0,
        pendingProjects: 0,
        averageScore: 0,
        currentStreak: 0,
        totalScore: 0,
        rank: 0,
        totalStudents: 0
      });
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      // Don't set error for 200 responses with empty data
      if (err.response?.status === 200) {
        setTodayProject(null);
        setRecentSubmissions([]);
        setProgressStats({
          totalProjects: 0,
          completedProjects: 0,
          missedProjects: 0,
          pendingProjects: 0,
          averageScore: 0,
          currentStreak: 0,
          totalScore: 0,
          rank: 0,
          totalStudents: 0
        });
      } else {
        setError(err.message || 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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
  };

  const getDifficultyColor = (difficulty: string) => {
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
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Dashboard Error</h1><p>{error}</p><button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={loadDashboardData}>Retry</button></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Continue your learning journey
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressStats.totalScore}</div>
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
              <div className="text-2xl font-bold">{progressStats.currentStreak} days</div>
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
              <div className="text-2xl font-bold">
                {Math.round((progressStats.completedProjects / progressStats.totalProjects) * 100)}%
              </div>
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
              <div className="text-2xl font-bold">{progressStats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                Excellent performance!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Recent Notifications</h2>
          <div className="space-y-2">
            {recentNotifications.length === 0 && <div className="text-gray-500">No notifications</div>}
            {recentNotifications.map(n => (
              <div key={n.id} className={`p-3 rounded border ${!n.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                <div className="font-medium">{n.title}</div>
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
            {recentPayments.length === 0 && <div className="text-gray-500">No recent payments</div>}
            {recentPayments.map(p => (
              <div key={p.id} className={`p-3 rounded border ${p.status === 'success' ? 'bg-green-50 border-green-200' : p.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                <div className="font-medium">{p.type === 'late_fee' ? 'Late Fee' : p.type}</div>
                <div className="text-sm text-gray-600">Amount: ₦{p.amount}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(p.createdAt).toLocaleString()} - {p.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Project */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Today's Project
                    </CardTitle>
                    <CardDescription>
                      {todayProject ? 'Your current assignment' : 'No project assigned for today'}
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
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{todayProject.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {todayProject.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Time Remaining</span>
                        </div>
                        <div className={`text-lg font-bold ${todayProject.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                          {todayProject.timeRemaining}
                        </div>
                        {todayProject.isOverdue && (
                          <p className="text-xs text-red-600">Project is overdue!</p>
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
                      <h4 className="font-medium">Requirements:</h4>
                      <ul className="space-y-2">
                        {todayProject.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Project
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Work
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Project Today
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Check back tomorrow for your next assignment
                    </p>
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
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/projects')}>
                  <Code className="h-4 w-4 mr-2" />
                  View All Projects
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/leaderboard')}>
                  <Trophy className="h-4 w-4 mr-2" />
                  View Leaderboard
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/progress')}>
                  <Activity className="h-4 w-4 mr-2" />
                  Track Progress
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/rules')}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Rules
                </Button>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{Math.round((progressStats.completedProjects / progressStats.totalProjects) * 100)}%</span>
                  </div>
                  <Progress value={(progressStats.completedProjects / progressStats.totalProjects) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{progressStats.completedProjects}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{progressStats.pendingProjects}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{progressStats.missedProjects}</div>
                    <div className="text-muted-foreground">Missed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{progressStats.averageScore}%</div>
                    <div className="text-muted-foreground">Avg Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                Your latest project submissions and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{submission.projectTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          Submitted {formatDate(submission.submittedAt)}
                        </p>
                        {submission.feedback && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {submission.feedback}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                        {submission.score && (
                          <Badge variant="secondary">{submission.score}/100</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Submissions Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Start working on your first project to see submissions here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievement & Streak */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {progressStats.currentStreak} days
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Keep it up! You're on fire! 🔥
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="outline">+10 bonus points</Badge>
                  <Badge variant="outline">7-day streak</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Leaderboard Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  #{progressStats.rank}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Out of {progressStats.totalStudents} students
                </p>
                <div className="flex justify-center space-x-2">
                  <Badge variant="outline">Top 1%</Badge>
                  <Badge variant="outline">Elite</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Rules & Penalties</h2>
          <div className="text-gray-600 mb-2">All tasks are time-bound. Late = deduction. Missed = 0. Repeat plagiarism = flagged/disqualified. See full rules for details.</div>
          <a href="/rules" className="text-blue-600 underline">View Full Rules</a>
        </div>
      </main>
    </div>
  );
} 