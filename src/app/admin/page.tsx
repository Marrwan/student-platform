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
import { RichTextEditor } from '@/components/ui/rich-text-editor';

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
  gradient,
  className
}: {
  onClick: () => void;
  icon: any;
  label: string;
  gradient: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative flex flex-col items-center justify-center h-28 w-full rounded-2xl p-0.5 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400',
        className
      )}
      style={{ background: gradient }}
      tabIndex={0}
      aria-label={label}
    >
      <div className="flex flex-col items-center justify-center h-full w-full bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 transition-all group-hover:bg-white/80 group-active:scale-95">
        <Icon className="h-8 w-8 mb-2 text-blue-700 group-hover:text-blue-900 transition-colors" />
        <span className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-900 tracking-tight">
          {label}
        </span>
      </div>
      <span className="absolute inset-0 rounded-2xl pointer-events-none group-hover:shadow-2xl group-hover:scale-105 transition-all" />
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
  const [notifContentMd, setNotifContentMd] = useState('');
  const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

  useEffect(() => {
    loadDashboardData();
    api.getNotifications().then(res => setRecentNotifications(res.notifications.slice(0, 5)));
    api.getAdminPayments({ limit: 5 }).then(res => setRecentPayments(res.data));
  }, []);

  useEffect(() => {
    // Fetch all users and classes for notification modal
            api.getAdminUsers({ limit: 1000 }).then(res => setAllUsers(res.users || []));
    api.getAdminClasses().then(res => setAllClasses(res.classes || []));
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <NotificationCenter />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome back, {user?.firstName} {user?.lastName}
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
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                        gradient="linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/projects')}
                        icon={Code}
                        label="Add Project"
                        gradient="linear-gradient(135deg, #FDE68A 0%, #F59E42 100%)"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/submissions')}
                        icon={FileText}
                        label="Review Submissions"
                        gradient="linear-gradient(135deg, #FCA5A5 0%, #F43F5E 100%)"
                      />
                      <DashboardActionButton
                        onClick={() => setShowNotificationModal(true)}
                        icon={Bell}
                        label="Send Notifications"
                        gradient="linear-gradient(135deg, #A5B4FC 0%, #6366F1 100%)"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/classes')}
                        icon={Settings}
                        label="Manage Classes"
                        gradient="linear-gradient(135deg, #FBC2EB 0%, #A6C1EE 100%)"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/analytics')}
                        icon={BarChart3}
                        label="View Analytics"
                        gradient="linear-gradient(135deg, #FDE68A 0%, #F59E42 100%)"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/users')}
                        icon={UserCheck}
                        label="Manage Users"
                        gradient="linear-gradient(135deg, #C7D2FE 0%, #818CF8 100%)"
                      />
                      <DashboardActionButton
                        onClick={() => router.push('/admin/leaderboard')}
                        icon={Trophy}
                        label="Leaderboard"
                        gradient="linear-gradient(135deg, #FDE68A 0%, #F59E42 100%)"
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
                      {/* Mock class cards */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">JavaScript Fundamentals</CardTitle>
                          <CardDescription>25 students • 12 projects</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>78%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Users className="h-4 w-4 mr-1" />
                                Students
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                      {/* Mock project cards */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Day 1: Calculator</CardTitle>
                          <CardDescription>JavaScript Fundamentals</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Submissions</span>
                              <span>45/50</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Avg Score</span>
                              <span>82%</span>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                      {/* Mock user cards */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">John Doe</h4>
                            <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">Student</Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
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

          {/* Add links or cards for class management, assignment management, student analytics, and progress overview */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/admin/classes" className="block p-4 bg-white rounded shadow hover:bg-blue-50">
              <div className="font-bold text-lg mb-1">Class Management</div>
              <div className="text-gray-600">Create, edit, and manage classes and enrollments</div>
            </a>
            <a href="/admin/assignments" className="block p-4 bg-white rounded shadow hover:bg-blue-50">
              <div className="font-bold text-lg mb-1">Assignment Management</div>
              <div className="text-gray-600">Create, edit, and manage assignments</div>
            </a>
            <a href="/admin/submissions" className="block p-4 bg-white rounded shadow hover:bg-blue-50">
              <div className="font-bold text-lg mb-1">Submission Review</div>
              <div className="text-gray-600">Review, score, and provide feedback on submissions</div>
            </a>
            <a href="/admin/leaderboard" className="block p-4 bg-white rounded shadow hover:bg-blue-50">
              <div className="font-bold text-lg mb-1">Leaderboard & Analytics</div>
              <div className="text-gray-600">View leaderboard, analytics, and student progress</div>
            </a>
          </div>

          {/* Below the header, show recent notifications */}
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

          {/* Below notifications, show recent payments */}
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

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Rules & Penalties</h2>
            <div className="text-gray-600 mb-2">All tasks are time-bound. Late = deduction. Missed = 0. Repeat plagiarism = flagged/disqualified. See full rules for details.</div>
            <a href="/rules" className="text-blue-600 underline">View Full Rules</a>
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