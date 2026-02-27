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
      setProjects(response.data.filter((p: Project) => p.isUnlocked));
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
    <div className="min-h-screen bg-black/95 text-foreground relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-neon-pink/5 blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="bg-white/[0.02] backdrop-blur-md border-b border-white/5 relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/10 text-[8px] uppercase tracking-[0.2em] text-neon-cyan mb-2 mono-font">
                <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
                MODULE: RANK_HIERARCHY_V4.2
              </div>
              <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mono-font">
                System <span className="text-muted-foreground">Hierarchy</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mono-font mt-2">
                Real-time synchronization of relative technical efficiency
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <NotificationCenter />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl group relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] mono-font text-muted-foreground">TOTAL_NODES</CardTitle>
              <Users className="h-4 w-4 text-neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground mono-font tracking-tighter">{stats.totalParticipants}</div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-2 mono-font italic">Verified active telemetry</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl group relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-violet/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] mono-font text-muted-foreground">AGGR_EFFICIENCY</CardTitle>
              <Target className="h-4 w-4 text-neon-violet" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground mono-font tracking-tighter">{Math.round(stats.averageScore)}%</div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-2 mono-font italic">System-wide success rate</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl group relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-pink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] mono-font text-muted-foreground">PEAK_VALUE</CardTitle>
              <Trophy className="h-4 w-4 text-neon-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground mono-font tracking-tighter shadow-glow-pink/10">{stats.topScore}</div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-2 mono-font italic">Max recorded potential</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl group relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] mono-font text-muted-foreground">ACTIVE_STREAMS</CardTitle>
              <BookOpen className="h-4 w-4 text-neon-emerald" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground mono-font tracking-tighter">{stats.activeClasses}</div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-2 mono-font italic">Concurrent sub-sectors</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 p-1.5 rounded-2xl h-16">
            <TabsTrigger value="overall" className="rounded-xl data-[state=active]:bg-neon-cyan data-[state=active]:text-black text-[10px] font-black uppercase tracking-widest mono-font transition-all">OVERALL</TabsTrigger>
            <TabsTrigger value="class" className="rounded-xl data-[state=active]:bg-neon-violet data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest mono-font transition-all">SECTOR_RANK</TabsTrigger>
            <TabsTrigger value="project" className="rounded-xl data-[state=active]:bg-neon-pink data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest mono-font transition-all">TASK_RANK</TabsTrigger>
            <TabsTrigger value="streaks" className="rounded-xl data-[state=active]:bg-neon-emerald data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest mono-font transition-all">MOMENTUM</TabsTrigger>
          </TabsList>

          {/* Overall Leaderboard */}
          <TabsContent value="overall" className="space-y-8">
            <div className="flex gap-6">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-56 bg-black/40 border-white/10 rounded-xl mono-font uppercase text-[10px] tracking-widest h-12 focus:ring-neon-cyan/50">
                  <SelectValue placeholder="TIME_INTERVAL" />
                </SelectTrigger>
                <SelectContent className="bg-card/90 backdrop-blur-2xl border-white/10 rounded-xl">
                  <SelectItem value="all-time" className="mono-font text-[10px] uppercase">ARCHIVE_TOTAL</SelectItem>
                  <SelectItem value="monthly" className="mono-font text-[10px] uppercase">CURRENT_MONTH</SelectItem>
                  <SelectItem value="weekly" className="mono-font text-[10px] uppercase">CURRENT_WEEK</SelectItem>
                  <SelectItem value="daily" className="mono-font text-[10px] uppercase">ACTIVE_24H</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64 bg-black/40 border-white/10 rounded-xl mono-font uppercase text-[10px] tracking-widest h-12 focus:ring-neon-cyan/50">
                  <SelectValue placeholder="NODAL_POINT" />
                </SelectTrigger>
                <SelectContent className="bg-card/90 backdrop-blur-2xl border-white/10 rounded-xl">
                  <SelectItem value="all" className="mono-font text-[10px] uppercase">GLOBAL_VIEW</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="mono-font text-[10px] uppercase">
                      0X{project.day}: {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-6 border-b border-white/5">
                <CardTitle className="text-xl font-black text-foreground mono-font uppercase tracking-tighter">NODE_RANKINGS</CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mt-2">
                  Relative efficiency based on multi-vector intelligent scoring
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {leaderboardData.map((entry) => (
                    <div
                      key={entry.id}
                      className={`group flex items-center justify-between p-6 rounded-2xl border transition-all hover:bg-white/5 ${entry.isCurrentUser
                          ? 'bg-neon-cyan/5 border-neon-cyan/30 shadow-glow-cyan/5'
                          : 'border-white/5 bg-black/20'
                        }`}
                    >
                      <div className="flex items-center space-x-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-black mono-font text-lg relative ${entry.rank <= 3 ? 'shadow-glow-cyan/20' : ''
                          }`}>
                          <div className="absolute inset-0 opacity-10 blur-md pointer-events-none group-hover:opacity-30 transition-opacity"></div>
                          {entry.rank}
                        </div>
                        <div>
                          <h3 className="font-black text-foreground uppercase tracking-tight mono-font flex items-center gap-3">
                            {entry.firstName} {entry.lastName}
                            {entry.isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-md bg-neon-cyan text-black text-[8px] font-black uppercase tracking-widest shadow-glow-cyan/50">SELF_ENTITY</span>
                            )}
                          </h3>
                          <p className="text-[10px] text-muted-foreground mono-font uppercase tracking-widest mt-1 italic">{entry.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-12">
                        <div className="text-right">
                          <div className={`text-2xl font-black mono-font tracking-tighter ${getScoreColor(entry.finalScore)}`}>
                            {entry.finalScore}
                          </div>
                          <div className="text-[8px] text-muted-foreground uppercase tracking-widest mono-font font-bold">FINAL_VAL</div>
                        </div>

                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-black text-foreground mono-font">{entry.completedProjects}</div>
                          <div className="text-[8px] text-muted-foreground uppercase tracking-widest mono-font font-bold">SYMBOLS_SYNC</div>
                        </div>

                        <div className="text-right hidden md:block">
                          <div className="text-sm font-black text-foreground mono-font">{Math.round(entry.completionRate)}%</div>
                          <div className="text-[8px] text-muted-foreground uppercase tracking-widest mono-font font-bold">SUCCESS_RATE</div>
                        </div>

                        <div className="flex items-center space-x-3 w-32 justify-end">
                          {entry.bonusPoints > 0 && (
                            <div className="px-2 py-1 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald text-[8px] font-black mono-font flex items-center gap-1 shadow-glow-emerald/10 animate-pulse">
                              <Zap className="h-2.5 w-2.5" />
                              +{entry.bonusPoints}
                            </div>
                          )}
                          {entry.penaltyPoints > 0 && (
                            <div className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black mono-font flex items-center gap-1">
                              <TrendingDown className="h-2.5 w-2.5" />
                              -{entry.penaltyPoints}
                            </div>
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
          <TabsContent value="class" className="space-y-8">
            <div className="flex gap-6">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-96 bg-black/40 border-white/10 rounded-xl mono-font uppercase text-[10px] tracking-widest h-12 focus:ring-neon-violet/50">
                  <SelectValue placeholder="SELECT_SECTOR" />
                </SelectTrigger>
                <SelectContent className="bg-card/90 backdrop-blur-2xl border-white/10 rounded-xl">
                  <SelectItem value="all" className="mono-font text-[10px] uppercase">SELECTION_PENDING</SelectItem>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id} className="mono-font text-[10px] uppercase italic">
                      {classItem.name.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClass === 'all' ? (
              <div className="flex flex-col items-center justify-center py-32 bg-card/20 rounded-3xl border border-dashed border-white/10 group">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tight mono-font">
                  SECTOR_QUERY_REQUIRED
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font italic">
                  Initialize sector selection to retrieve relative rankings
                </p>
              </div>
            ) : (
              <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="p-10 pb-6 border-b border-white/5">
                  <CardTitle className="text-xl font-black text-foreground mono-font uppercase tracking-tighter">SECTOR_PROTO_RANKINGS</CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mt-2">
                    Rankings calculated via 30% participation + 70% task efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {classLeaderboardData.map((entry) => (
                      <div
                        key={entry.id}
                        className={`group flex items-center justify-between p-6 rounded-2xl border transition-all hover:bg-white/5 ${entry.isCurrentUser
                            ? 'bg-neon-violet/5 border-neon-violet/30 shadow-glow-violet/5'
                            : 'border-white/5 bg-black/20'
                          }`}
                      >
                        <div className="flex items-center space-x-6">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 font-black mono-font text-lg text-neon-violet bg-black/40">
                            {entry.rank}
                          </div>
                          <div>
                            <h3 className="font-black text-foreground uppercase tracking-tight mono-font">
                              {entry.firstName} {entry.lastName}
                              {entry.isCurrentUser && <span className="ml-3 px-2 py-0.5 rounded-md bg-neon-violet text-white text-[8px] font-black uppercase tracking-widest shadow-glow-violet/50">SELF</span>}
                            </h3>
                            <p className="text-[10px] text-muted-foreground mono-font uppercase tracking-widest mt-1 italic">{entry.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-12">
                          <div className="text-right">
                            <div className={`text-2xl font-black mono-font tracking-tighter ${getScoreColor(entry.finalScore)}`}>
                              {Math.round(entry.finalScore)}
                            </div>
                            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mono-font font-bold">AGGR_EFF</div>
                          </div>

                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-black text-foreground mono-font">{Math.round(entry.attendanceScore)}%</div>
                            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mono-font font-bold">PARTICIPATION</div>
                          </div>

                          <div className="text-right hidden md:block">
                            <div className="text-sm font-black text-foreground mono-font">{entry.assignmentScore}</div>
                            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mono-font font-bold">TASK_YIELD</div>
                          </div>

                          <div className="text-right hidden lg:block">
                            <div className="text-sm font-black text-foreground mono-font">{Math.round(entry.completionRate)}%</div>
                            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mono-font font-bold">SYNC_COMPLETE</div>
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
          <TabsContent value="project" className="space-y-8">
            <div className="flex gap-6">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-96 bg-black/40 border-white/10 rounded-xl mono-font uppercase text-[10px] tracking-widest h-12 focus:ring-neon-pink/50">
                  <SelectValue placeholder="LOCATE_TASK_NODE" />
                </SelectTrigger>
                <SelectContent className="bg-card/90 backdrop-blur-2xl border-white/10 rounded-xl">
                  <SelectItem value="all" className="mono-font text-[10px] uppercase">PROJECT_BUFFER_NULL</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="mono-font text-[10px] uppercase italic">
                      0X{project.day}: {project.title.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProject === 'all' ? (
              <div className="flex flex-col items-center justify-center py-32 bg-card/20 rounded-3xl border border-dashed border-white/10 group">
                <Code className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tight mono-font">
                  TASK_INIT_REQUIRED
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font italic">
                  Select task node from the system directory to view efficiency rankings
                </p>
              </div>
            ) : (
              <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="p-10 pb-6 border-b border-white/5">
                  <CardTitle className="text-xl font-black text-foreground mono-font uppercase tracking-tighter">PROJECT_UNIT_HIERARCHY</CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mt-2">
                    Multi-dimensional scoring with temporal bonuses and quality overrides
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {projectLeaderboardData.map((entry) => (
                      <div
                        key={entry.id}
                        className={`group flex items-center justify-between p-6 rounded-2xl border transition-all hover:bg-white/5 ${entry.isCurrentUser
                            ? 'bg-neon-pink/5 border-neon-pink/30 shadow-glow-pink/5'
                            : 'border-white/5 bg-black/20'
                          }`}
                      >
                        <div className="flex items-center space-x-6">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 font-black mono-font text-lg text-neon-pink bg-black/40">
                            {entry.rank}
                          </div>
                          <div>
                            <h3 className="font-black text-foreground uppercase tracking-tight mono-font">
                              {entry.firstName} {entry.lastName}
                              {entry.isCurrentUser && <span className="ml-3 px-2 py-0.5 rounded-md bg-neon-pink text-white text-[8px] font-black uppercase tracking-widest shadow-glow-pink/50">ENTITY</span>}
                            </h3>
                            <p className="text-[10px] text-muted-foreground mono-font uppercase tracking-widest mt-1 italic">{entry.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-12">
                          <div className="text-right">
                            <div className={`text-2xl font-black mono-font tracking-tighter ${getScoreColor(entry.intelligentScore)}`}>
                              {entry.intelligentScore}
                            </div>
                            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mono-font font-bold">INTELLIGENT_VAL</div>
                          </div>

                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-black text-foreground mono-font">{entry.baseScore}</div>
                            <div className="text-[8px] text-muted-foreground uppercase tracking-widest mono-font font-bold">BASE_SYNC</div>
                          </div>

                          <div className="flex items-center space-x-3 w-48 justify-center">
                            {entry.timeBonus > 0 && (
                              <div className="px-2 py-1 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[8px] font-black mono-font flex items-center gap-1 shadow-glow-cyan/5 animate-pulse">
                                <Timer className="h-2.5 w-2.5" />
                                +{entry.timeBonus}
                              </div>
                            )}
                            {entry.qualityBonus > 0 && (
                              <div className="px-2 py-1 rounded-lg bg-neon-violet/10 border border-neon-violet/20 text-neon-violet text-[8px] font-black mono-font flex items-center gap-1">
                                <Brain className="h-2.5 w-2.5" />
                                +{entry.qualityBonus}
                              </div>
                            )}
                            {entry.latePenalty > 0 && (
                              <div className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black mono-font flex items-center gap-1">
                                <AlertCircle className="h-2.5 w-2.5" />
                                -{entry.latePenalty}
                              </div>
                            )}
                          </div>

                          <div className="text-right w-24">
                            <Badge className={`${getStatusColor(entry.status)} border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mono-font`}>
                              {entry.status.toUpperCase()}
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
          <TabsContent value="streaks" className="space-y-8">
            <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-emerald/50 to-transparent"></div>
              <CardHeader className="p-10 pb-6 border-b border-white/5">
                <CardTitle className="text-xl font-black text-foreground mono-font uppercase tracking-tighter">MOMENTUM_STREAKS</CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font mt-2">
                  Users with maximal consecutive active temporal segments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-neon-emerald/5 border border-neon-emerald/20 flex items-center justify-center text-neon-emerald mb-8 shadow-glow-emerald/10 relative group-hover:scale-110 transition-transform">
                    <div className="absolute inset-0 bg-neon-emerald/10 blur-2xl opacity-50"></div>
                    <Activity className="h-10 w-10 relative z-10" />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tight mono-font">
                    STREAK_ENGINE_INITIALIZING
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font max-w-xs leading-relaxed italic">
                    Momentum tracking algorithms are currently in the calibration phase. Real-time streak telemetry coming in next update.
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