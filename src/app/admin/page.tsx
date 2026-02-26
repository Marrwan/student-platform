'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Code,
  Trophy,
  BarChart3,
  Settings,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  Bell,
  BookOpen,
  GraduationCap,
  Target,
  Award,
  Activity,
  DollarSign,
  UserCheck,
  Star
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { ErrorBoundary } from 'react-error-boundary';
import Header from '@/components/layout/header';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Select, { MultiValue } from 'react-select';
const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor').then((mod) => mod.RichTextEditor), { ssr: false });

interface DashboardStats {
  totalUsers: number;
  totalClasses: number;
  totalProjects: number;
  pendingSubmissions: number;
  completionRate: number;
  activeChallenges: number;
  totalRevenue: number;
  averageScore: number;
}

interface RecentActivity {
  id: string;
  type: 'submission' | 'registration' | 'project_unlock' | 'score_update' | 'class_created';
  message: string;
  timestamp: string;
  user?: string;
  project?: string;
}

interface QuickSubmission {
  id: string;
  projectTitle: string;
  studentName: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  score?: number;
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}

function DashboardActionButton({
  onClick,
  icon: Icon,
  label,
  className
}: {
  onClick: () => void;
  icon: any;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative flex flex-col items-center justify-center h-28 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] hover:-translate-y-1',
        className
      )}
      tabIndex={0}
      aria-label={label}
    >
      <Icon className="h-7 w-7 mb-3 text-muted-foreground group-hover:text-neon-cyan transition-colors duration-300" />
      <span className="text-sm font-medium text-foreground tracking-wide group-hover:text-white transition-colors">
        {label}
      </span>
    </button>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalClasses: 0,
    totalProjects: 0,
    pendingSubmissions: 0,
    completionRate: 0,
    activeChallenges: 0,
    totalRevenue: 0,
    averageScore: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [quickSubmissions, setQuickSubmissions] = useState<QuickSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifTargetUserId, setNotifTargetUserId] = useState('');
  const [notifTargetUsers, setNotifTargetUsers] = useState<MultiValue<{ value: string; label: string }>>([]);
  const [notifTargetClasses, setNotifTargetClasses] = useState<MultiValue<{ value: string; label: string }>>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [notifContentMd, setNotifContentMd] = useState('');


  useEffect(() => {
    loadDashboardData();
    api.getNotifications().then(res => setRecentNotifications(res.notifications.slice(0, 5)));
    api.getAdminPayments({ limit: 5 }).then(res => setRecentPayments(res.data));
  }, []);

  useEffect(() => {
    // Fetch all users, classes, and projects for notification modal
    api.getAdminUsers({ limit: 1000 }).then(res => setAllUsers(res.users || []));
    api.getAdminClasses().then(res => setAllClasses(res.classes || []));
    api.getAdminProjects().then(res => setAllProjects(res.projects || []));
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load dashboard statistics
      const statsResponse = await api.getAdminStats();
      setStats(statsResponse.stats);

      // Load recent activity
      const activityResponse = await api.getAdminRecentActivity();
      setRecentActivity(activityResponse.activity);

      // Load quick submissions
      const submissionsResponse = await api.getAdminQuickSubmissions();
      setQuickSubmissions(submissionsResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'registration':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'project_unlock':
        return <Code className="h-4 w-4 text-yellow-500" />;
      case 'score_update':
        return <Trophy className="h-4 w-4 text-purple-500" />;
      case 'class_created':
        return <BookOpen className="h-4 w-4 text-indigo-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
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

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For now, send to the first selected user or class (backend only supports one)
      const targetUserId = notifTargetUsers[0]?.value || '';
      const targetClassId = notifTargetClasses[0]?.value || '';
      await api.createNotification({
        type: 'info',
        title: notifTitle,
        content: notifContentMd,
        targetUserId,
        metadata: targetClassId ? { targetClassId } : undefined
      });
      toast.success('Notification sent!');
      setShowNotificationModal(false);
      setNotifTitle('');
      setNotifContentMd('');
      setNotifTargetUsers([]);
      setNotifTargetClasses([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Admin Dashboard Error</h1><p>{error}</p><button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={loadDashboardData}>Retry</button></div>;
  }

  return (
    <ErrorBoundary fallback={<div className="bg-red-100 text-red-800 p-4 rounded">Something went wrong. Please refresh or contact support.</div>}>
      <div className="min-h-screen bg-background text-foreground selection:bg-neon-cyan/30">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
              <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
              <NotificationCenter />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Welcome back, <span className="text-foreground tracking-tight">{user?.firstName} {user?.lastName}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4">
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
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.totalUsers || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Registered students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClasses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active learning groups
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingSubmissions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Submissions awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.completionRate || 0).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Average project completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.averageScore || 0).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Across all submissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{(stats.totalRevenue || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  From late fees and penalties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all challenges
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue & Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{(stats.totalRevenue || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  From late fees and penalties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all challenges
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest submissions and user activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.project && `${activity.project} • `}
                              {activity.user && `${activity.user} • `}
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <DashboardActionButton
                        onClick={() => router.push('/admin/classes')}
                        icon={Users}
                        label="Create Class"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/projects')}
                        icon={Code}
                        label="Add Project"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/submissions')}
                        icon={FileText}
                        label="Review Submissions"
                      />
                      <DashboardActionButton
                        onClick={() => setShowNotificationModal(true)}
                        icon={Bell}
                        label="Send Notifications"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/classes')}
                        icon={Settings}
                        label="Manage Classes"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/analytics')}
                        icon={BarChart3}
                        label="View Analytics"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/users')}
                        icon={UserCheck}
                        label="Manage Users"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/leaderboard')}
                        icon={Trophy}
                        label="Leaderboard"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/weekly-attendance')}
                        icon={Calendar}
                        label="Weekly Attendance"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/hrms/dashboard')}
                        icon={Users}
                        label="HRMS Dashboard"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Submissions
                  </CardTitle>
                  <CardDescription>
                    Latest submissions requiring review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quickSubmissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{submission.projectTitle}</h4>
                          <p className="text-sm text-muted-foreground">
                            {submission.studentName} • {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                          {submission.score && (
                            <Badge variant="secondary">{submission.score}/100</Badge>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Class Management</CardTitle>
                      <CardDescription>
                        Create and manage classes, invite students, and track progress
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Class
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Input placeholder="Search classes..." className="flex-1" />
                      <UISelect>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </UISelect>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allClasses.length === 0 ? (
                        <div className="col-span-3 text-center py-8">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No classes found
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            Create your first class to get started
                          </p>
                        </div>
                      ) : (
                        allClasses.slice(0, 6).map((classItem) => (
                          <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <CardTitle className="text-lg">{classItem.name}</CardTitle>
                              <CardDescription>
                                {classItem.currentStudents || 0} students • {classItem.assignments || 0} projects
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{classItem.completionRate || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${classItem.completionRate || 0}%` }}
                                  ></div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.push('/admin/classes')}
                                  >
                                    <Users className="h-4 w-4 mr-1" />
                                    Students
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.push('/admin/classes')}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Project Management</CardTitle>
                      <CardDescription>
                        Create, edit, and manage projects and assignments
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Input placeholder="Search projects..." className="flex-1" />
                      <UISelect>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="locked">Locked</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </UISelect>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allProjects.length === 0 ? (
                        <div className="col-span-3 text-center py-8">
                          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No projects found
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            Create your first project to get started
                          </p>
                        </div>
                      ) : (
                        allProjects.slice(0, 6).map((project) => (
                          <Card key={project.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <CardTitle className="text-lg">Day {project.day}: {project.title}</CardTitle>
                              <CardDescription>{project.difficulty} • {project.submissionType}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Status</span>
                                  <Badge className={project.isUnlocked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {project.isUnlocked ? 'Unlocked' : 'Locked'}
                                  </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Max Score</span>
                                  <span>{project.maxScore} points</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.push(`/admin/projects/${project.id}`)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.push(`/admin/projects/${project.id}/edit`)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Reviews</CardTitle>
                  <CardDescription>
                    Review and grade student submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Input placeholder="Search submissions..." className="flex-1" />
                      <UISelect>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </UISelect>
                    </div>

                    <div className="space-y-4">
                      {quickSubmissions.map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{submission.projectTitle}</h4>
                            <p className="text-sm text-muted-foreground">
                              {submission.studentName} • {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(submission.status)}>
                              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </Badge>
                            {submission.score && (
                              <Badge variant="secondary">{submission.score}/100</Badge>
                            )}
                            <Button size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>
                        Manage user accounts and permissions
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Invite User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Input placeholder="Search users..." className="flex-1" />
                      <UISelect>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="instructor">Instructor</SelectItem>
                        </SelectContent>
                      </UISelect>
                    </div>

                    <div className="space-y-4">
                      {allUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No users found.
                        </div>
                      ) : (
                        allUsers.slice(0, 5).map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{u.firstName} {u.lastName}</h4>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                              <Button size="sm" variant="outline" onClick={() => router.push('/admin/users')}>
                                <Edit className="h-4 w-4 mr-2" />
                                Manage
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                      {allUsers.length > 5 && (
                        <Button variant="ghost" className="w-full text-blue-600" onClick={() => router.push('/admin/users')}>
                          View All Users
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics & Reports</CardTitle>
                  <CardDescription>
                    Comprehensive analytics and performance reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Performance Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Average Completion Rate</span>
                          <span className="font-medium">{stats.completionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Score</span>
                          <span className="font-medium">{stats.averageScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Students</span>
                          <span className="font-medium">{Math.round(stats.totalUsers * 0.85)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Revenue Analytics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Revenue</span>
                          <span className="font-medium">₦{(stats.totalRevenue || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Late Fees Collected</span>
                          <span className="font-medium">₦{((stats.totalRevenue || 0) * 0.8).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Penalties</span>
                          <span className="font-medium">₦{((stats.totalRevenue || 0) * 0.2).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Links */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/admin/classes" className="block p-5 rounded-xl border border-white/5 bg-card/60 backdrop-blur-md transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg">
              <div className="font-semibold text-lg text-foreground mb-1 flex items-center gap-2"><BookOpen className="h-5 w-5 text-neon-cyan" /> Class Management</div>
              <div className="text-sm text-muted-foreground">Create, edit, and manage classes and enrollments</div>
            </a>
            <a href="/admin/assignments" className="block p-5 rounded-xl border border-white/5 bg-card/60 backdrop-blur-md transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg">
              <div className="font-semibold text-lg text-foreground mb-1 flex items-center gap-2"><FileText className="h-5 w-5 text-neon-violet" /> Assignment Management</div>
              <div className="text-sm text-muted-foreground">Create, edit, and manage assignments</div>
            </a>
            <a href="/admin/submissions" className="block p-5 rounded-xl border border-white/5 bg-card/60 backdrop-blur-md transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg">
              <div className="font-semibold text-lg text-foreground mb-1 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-neon-emerald" /> Submission Review</div>
              <div className="text-sm text-muted-foreground">Review, score, and provide feedback on submissions</div>
            </a>
            <a href="/admin/leaderboard" className="block p-5 rounded-xl border border-white/5 bg-card/60 backdrop-blur-md transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-lg">
              <div className="font-semibold text-lg text-foreground mb-1 flex items-center gap-2"><Trophy className="h-5 w-5 text-neon-amber" /> Leaderboard & Analytics</div>
              <div className="text-sm text-muted-foreground">View leaderboard, analytics, and student progress</div>
            </a>
          </div>

          {/* Below the header, show recent notifications and payments in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" /> Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentNotifications.length === 0 && <div className="text-muted-foreground text-sm">No notifications</div>}
                  {recentNotifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-lg border transition-colors ${!n.isRead ? 'bg-primary/5 border-primary/20' : 'bg-background/50 border-border'}`}>
                      <div className="font-medium text-foreground">{n.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.content}</div>
                      <div className="text-xs text-muted-foreground/60 mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5" /> Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentPayments.length === 0 && <div className="text-muted-foreground text-sm">No recent payments</div>}
                    {recentPayments.map(p => (
                      <div key={p.id} className={`p-4 rounded-lg border flex justify-between items-center ${p.status === 'success' ? 'bg-green-500/5 border-green-500/20' : p.status === 'pending' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div>
                          <div className="font-medium text-foreground">{p.type === 'late_fee' ? 'Late Fee' : p.type}</div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(p.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">₦{p.amount?.toLocaleString()}</div>
                          <Badge variant="outline" className={`mt-1 capitalize text-[10px] ${p.status === 'success' ? 'text-green-500 border-green-500/30' : p.status === 'pending' ? 'text-yellow-500 border-yellow-500/30' : 'text-red-500 border-red-500/30'}`}>
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neon-cyan/20 bg-neon-cyan/5">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-2 text-foreground flex items-center gap-2"><AlertCircle className="h-5 w-5 text-neon-cyan" /> Rules & Penalties</h2>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">All tasks are time-bound. Late = deduction. Missed = 0. Repeat plagiarism = flagged/disqualified. See full rules for details.</p>
                  <Button variant="outline" size="sm" asChild className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan">
                    <a href="/rules">View Full Rules</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-4">Send Notification</h2>
            <form onSubmit={handleSendNotification}>
              <label className="block mb-2">Title</label>
              <input type="text" className="w-full mb-2 p-2 border rounded" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} required />
              <label className="block mb-2">Content</label>
              <div className="mb-2">
                <RichTextEditor
                  value={notifContentMd}
                  onChange={setNotifContentMd}
                  height={200}
                  placeholder="Enter notification content..."
                />
              </div>
              <label className="block mb-2">Target Users</label>
              <Select
                isMulti
                options={allUsers.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.email})` }))}
                value={notifTargetUsers as MultiValue<{ value: string; label: string }>}
                onChange={(newValue) => setNotifTargetUsers(newValue)}
                className="mb-2"
                placeholder="Select users..."
              />
              <label className="block mb-2">Target Classes/Groups</label>
              <Select
                isMulti
                options={allClasses.map(c => ({ value: c.id, label: c.name }))}
                value={notifTargetClasses as MultiValue<{ value: string; label: string }>}
                onChange={(newValue) => setNotifTargetClasses(newValue)}
                className="mb-4"
                placeholder="Select classes/groups..."
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowNotificationModal(false)}>Cancel</Button>
                <Button type="submit">Send</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
} 