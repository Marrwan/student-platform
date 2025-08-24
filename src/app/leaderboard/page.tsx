'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Target,
  Star,
  Users,
  Calendar,
  Clock,
  Award,
  Activity,
  Filter,
  Search,
  BookOpen,
  Code,
  Eye,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Timer,
  Brain,
  Lightbulb
} from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  totalScore: number;
  completedProjects: number;
  streakCount: number;
  averageScore: number;
  lastSubmissionAt: string;
  bonusPoints: number;
  penaltyPoints: number;
  finalScore: number;
  completionRate: number;
  qualityScore: number;
  totalSubmissions: number;
  isCurrentUser: boolean;
}

interface ClassLeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  attendanceScore: number;
  assignmentScore: number;
  finalScore: number;
  completedProjects: number;
  totalSubmissions: number;
  completionRate: number;
  lateSubmissions: number;
  enrolledAt: string;
  isCurrentUser: boolean;
}

interface ProjectLeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  submissionId: string;
  baseScore: number;
  bonusPoints: number;
  deductions: number;
  finalScore: number;
  intelligentScore: number;
  timeBonus: number;
  qualityBonus: number;
  latePenalty: number;
  hoursToSubmit: number;
  isLate: boolean;
  status: string;
  submittedAt: string;
  reviewedAt: string;
  adminFeedback: string;
  isCurrentUser: boolean;
}

interface LeaderboardStats {
  totalParticipants: number;
  averageScore: number;
  topScore: number;
  activeStreaks: number;
  completionRate: number;
  totalClasses: number;
  activeClasses: number;
}

interface Class {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface Project {
  id: string;
  title: string;
  day: number;
  difficulty: string;
  isUnlocked: boolean;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [classLeaderboardData, setClassLeaderboardData] = useState<ClassLeaderboardEntry[]>([]);
  const [projectLeaderboardData, setProjectLeaderboardData] = useState<ProjectLeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats>({
    totalParticipants: 0,
    averageScore: 0,
    topScore: 0,
    activeStreaks: 0,
    completionRate: 0,
    totalClasses: 0,
    activeClasses: 0
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overall');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all-time');

  useEffect(() => {
    loadLeaderboardData();
    loadClasses();
    loadProjects();
  }, [activeTab, selectedClass, selectedProject, timeFilter]);

  const loadLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'overall') {
        const response = await api.getLeaderboard({ filter: timeFilter, projectId: selectedProject });
        setLeaderboardData(response.data);
      } else if (activeTab === 'class' && selectedClass !== 'all') {
        const response = await api.getClassLeaderboard(selectedClass);
        setClassLeaderboardData(response.data);
      } else if (activeTab === 'project' && selectedProject !== 'all') {
        const response = await api.getProjectLeaderboard(selectedProject);
        setProjectLeaderboardData(response.data);
      }
      
      const statsResponse = await api.getLeaderboardStats();
      setStats(statsResponse.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await api.getClasses();
      setClasses(response.classes.filter((c: Class) => c.isActive));
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await api.getProjects();
      setProjects(response.projects.filter((p: Project) => p.isUnlocked));
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800">
        <h1 className="text-2xl font-bold mb-4">Leaderboard Error</h1>
        <p>{error}</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={loadLeaderboardData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Leaderboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your progress and compete with other learners
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                Active learners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageScore)}%</div>
              <p className="text-xs text-muted-foreground">
                Across all submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topScore}</div>
              <p className="text-xs text-muted-foreground">
                Highest achieved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeClasses}</div>
              <p className="text-xs text-muted-foreground">
                Out of {stats.totalClasses} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="class">Class Rankings</TabsTrigger>
            <TabsTrigger value="project">Project Rankings</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
          </TabsList>

          {/* Overall Leaderboard */}
          <TabsContent value="overall" className="space-y-6">
            <div className="flex gap-4">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Time Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="daily">Today</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      Day {project.day}: {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Overall Rankings</CardTitle>
                <CardDescription>
                  Rankings based on intelligent scoring system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboardData.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        entry.isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(entry.rank)}`}>
                          {getRankIcon(entry.rank)}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {entry.firstName} {entry.lastName}
                            {entry.isCurrentUser && <Badge className="ml-2">You</Badge>}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{entry.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getScoreColor(entry.finalScore)}`}>
                            {entry.finalScore}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Final Score</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium">{entry.completedProjects}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Completed</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium">{Math.round(entry.completionRate)}%</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Success Rate</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {entry.bonusPoints > 0 && (
                            <Badge className="bg-green-100 text-green-800">
                              <Zap className="h-3 w-3 mr-1" />
                              +{entry.bonusPoints}
                            </Badge>
                          )}
                          {entry.penaltyPoints > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              -{entry.penaltyPoints}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Rankings */}
          <TabsContent value="class" className="space-y-6">
            <div className="flex gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select a class to view rankings</SelectItem>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClass === 'all' ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Class
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose a class from the dropdown to view class-specific rankings
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Class Rankings</CardTitle>
                  <CardDescription>
                    Rankings based on 30% attendance + 70% assignment scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classLeaderboardData.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          entry.isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(entry.rank)}`}>
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {entry.firstName} {entry.lastName}
                              {entry.isCurrentUser && <Badge className="ml-2">You</Badge>}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{entry.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getScoreColor(entry.finalScore)}`}>
                              {Math.round(entry.finalScore)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Final Score</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">{Math.round(entry.attendanceScore)}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Attendance</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">{entry.assignmentScore}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Assignments</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">{Math.round(entry.completionRate)}%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Completion</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Project Rankings */}
          <TabsContent value="project" className="space-y-6">
            <div className="flex gap-4">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select a project to view rankings</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      Day {project.day}: {project.title} ({project.difficulty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProject === 'all' ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Project
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose a project from the dropdown to view project-specific rankings
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Project Rankings</CardTitle>
                  <CardDescription>
                    Intelligent scoring with time bonuses, quality bonuses, and penalties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectLeaderboardData.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          entry.isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(entry.rank)}`}>
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {entry.firstName} {entry.lastName}
                              {entry.isCurrentUser && <Badge className="ml-2">You</Badge>}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{entry.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getScoreColor(entry.intelligentScore)}`}>
                              {entry.intelligentScore}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Intelligent Score</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">{entry.baseScore}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">Base Score</div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {entry.timeBonus > 0 && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <Timer className="h-3 w-3 mr-1" />
                                +{entry.timeBonus}
                              </Badge>
                            )}
                            {entry.qualityBonus > 0 && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <Brain className="h-3 w-3 mr-1" />
                                +{entry.qualityBonus}
                              </Badge>
                            )}
                            {entry.latePenalty > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                -{entry.latePenalty}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Streaks */}
          <TabsContent value="streaks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Streaks</CardTitle>
                <CardDescription>
                  Users with the longest consecutive days of activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Streak Feature Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Track consecutive days of activity and submissions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 