'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy,
  Target,
  TrendingUp,
  CalendarDays,
  Award,
  Star,
  Activity,
  BarChart3,
  Eye
} from 'lucide-react';
import { api } from '@/lib/api';

interface ProjectStatus {
  id: string;
  day: number;
  title: string;
  description: string;
  status: 'completed' | 'missed' | 'pending' | 'locked';
  score?: number;
  submittedAt?: string;
  deadline: string;
  isOverdue: boolean;
  difficulty: string;
  requirements: string[];
  feedback?: string;
  isLate: boolean;
  latePenalty: number;
}

interface ProgressStats {
  totalProjects: number;
  completedProjects: number;
  missedProjects: number;
  pendingProjects: number;
  lockedProjects: number;
  averageScore: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  onTimeRate: number;
}

interface ProgressTrackerProps {
  userId: string;
  totalProjects?: number;
}

export function ProgressTracker({ userId, totalProjects = 30 }: ProgressTrackerProps) {
  const [projects, setProjects] = useState<ProjectStatus[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalProjects: 0,
    completedProjects: 0,
    missedProjects: 0,
    pendingProjects: 0,
    lockedProjects: 0,
    averageScore: 0,
    totalScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
    onTimeRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'stats'>('calendar');
  const [selectedProject, setSelectedProject] = useState<ProjectStatus | null>(null);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getProgress(userId);
      setProjects(response.projects);
      setStats(response.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'missed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'missed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
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
    return <div className="min-h-32 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }
  if (error) {
    return <div className="bg-red-50 text-red-800 p-4 rounded"><h2 className="font-bold mb-2">Progress Error</h2><p>{error}</p><button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={loadProgress}>Retry</button></div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
          <CardDescription>
            Your journey through the {totalProjects}-day challenge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingProjects}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.missedProjects}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Missed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.averageScore}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Avg Score</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round((stats.completedProjects / stats.totalProjects) * 100)}%</span>
            </div>
            <Progress value={(stats.completedProjects / stats.totalProjects) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.completedProjects} of {stats.totalProjects} projects</span>
              <span>{stats.totalProjects - stats.completedProjects} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalScore}</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.onTimeRate}%</div>
              <div className="text-sm text-muted-foreground">On-Time Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-center">
        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <CalendarDays className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Activity className="h-4 w-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Calendar</CardTitle>
                <CardDescription>
                  Visual representation of your project completion status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                      {day}
                    </div>
                  ))}
                  
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className={`
                        aspect-square border rounded-lg p-2 cursor-pointer transition-colors
                        ${project.status === 'completed' ? 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700' :
                          project.status === 'missed' ? 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700' :
                          project.status === 'pending' ? 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700' :
                          'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600'}
                        ${project.isOverdue ? 'ring-2 ring-red-500' : ''}
                      `}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="text-xs font-medium mb-1">{project.day}</div>
                      <div className="text-xs opacity-75">{project.score || '-'}</div>
                      {project.isOverdue && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>
                      )}
                      {project.isLate && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full mx-auto mt-1"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-4 space-x-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-xs">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-xs">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-xs">Missed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    <span className="text-xs">Locked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Detailed timeline of your project submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div key={project.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${project.status === 'completed' ? 'bg-green-500' :
                            project.status === 'missed' ? 'bg-red-500' :
                            project.status === 'pending' ? 'bg-yellow-500' :
                            'bg-gray-300 dark:bg-gray-600'}
                        `}>
                          {getStatusIcon(project.status)}
                        </div>
                        {index < projects.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-2"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">Day {project.day}: {project.title}</h4>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </Badge>
                            <Badge className={getDifficultyColor(project.difficulty)}>
                              {project.difficulty}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          {project.status === 'completed' && (
                            <>
                              <div>Score: {project.score}/100</div>
                              <div>Submitted: {formatDate(project.submittedAt!)}</div>
                              {project.isLate && (
                                <div className="text-orange-600">Late (-{project.latePenalty}pts)</div>
                              )}
                            </>
                          )}
                          {project.status === 'pending' && (
                            <div>Deadline: {formatDate(project.deadline)}</div>
                          )}
                          {project.isOverdue && (
                            <div className="text-red-600 font-medium">Overdue</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Streak Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.currentStreak} days</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Current streak
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">{stats.longestStreak} days</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Longest streak
                      </p>
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Badge variant="outline">+10 bonus points</Badge>
                      <Badge variant="outline">{stats.currentStreak}-day streak</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Completion Rate</span>
                        <span>{stats.completionRate}%</span>
                      </div>
                      <Progress value={stats.completionRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>On-Time Rate</span>
                        <span>{stats.onTimeRate}%</span>
                      </div>
                      <Progress value={stats.onTimeRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Score</span>
                        <span>{stats.averageScore}%</span>
                      </div>
                      <Progress value={stats.averageScore} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Day {selectedProject.day}: {selectedProject.title}</CardTitle>
                  <CardDescription>{selectedProject.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(selectedProject.status)}>
                    {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                  </Badge>
                  <Badge className={getDifficultyColor(selectedProject.difficulty)}>
                    {selectedProject.difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Deadline:</span>
                  <p className="font-medium">{formatDate(selectedProject.deadline)}</p>
                </div>
                {selectedProject.submittedAt && (
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <p className="font-medium">{formatDate(selectedProject.submittedAt)}</p>
                  </div>
                )}
                {selectedProject.score && (
                  <div>
                    <span className="text-muted-foreground">Score:</span>
                    <p className="font-medium">{selectedProject.score}/100</p>
                  </div>
                )}
                {selectedProject.isLate && (
                  <div>
                    <span className="text-muted-foreground">Late Penalty:</span>
                    <p className="font-medium text-red-600">-{selectedProject.latePenalty} points</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Requirements:</h4>
                <ul className="space-y-1">
                  {selectedProject.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedProject.feedback && (
                <div>
                  <h4 className="font-medium mb-2">Feedback:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProject.feedback}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Project
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 