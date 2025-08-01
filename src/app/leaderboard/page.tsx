'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { api } from '@/lib/api';

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
  isCurrentUser: boolean;
}

interface LeaderboardStats {
  totalParticipants: number;
  averageScore: number;
  topScore: number;
  activeStreaks: number;
  completionRate: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats>({
    totalParticipants: 0,
    averageScore: 0,
    topScore: 0,
    activeStreaks: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all-time');
  const [selectedProject, setSelectedProject] = useState('all');

  useEffect(() => {
    loadLeaderboardData();
  }, [activeTab, selectedProject]);

  const loadLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getLeaderboard({ filter: activeTab, projectId: selectedProject });
      setLeaderboardData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      case 3:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
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
    return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Leaderboard Error</h1><p>{error}</p><button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={loadLeaderboardData}>Retry</button></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Active learners
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
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                Across all participants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStreaks}</div>
              <p className="text-xs text-muted-foreground">
                Current streaks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Overall completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList>
              <TabsTrigger value="all-time">All Time</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="calculator">Calculator</SelectItem>
              <SelectItem value="todo">Todo List</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>
              {activeTab === 'all-time' ? 'All-time leaderboard' : 
               activeTab === 'daily' ? 'Today\'s top performers' :
               activeTab === 'weekly' ? 'This week\'s leaders' : 'This month\'s champions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardData.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    entry.isCurrentUser 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                      <div className="text-center">
                        <div className={`text-lg font-bold ${entry.rank <= 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                          #{entry.rank}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {entry.firstName.charAt(0)}{entry.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {entry.firstName} {entry.lastName}
                          {entry.isCurrentUser && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">Score</div>
                      <div className="text-lg font-bold text-green-600">{entry.finalScore}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">Projects</div>
                      <div className="text-sm">{entry.completedProjects}/30</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">Streak</div>
                      <div className="text-sm text-orange-600 font-medium">{entry.streakCount} days</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">Avg Score</div>
                      <div className="text-sm">{entry.averageScore}%</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">Last Active</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(entry.lastSubmissionAt)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {entry.bonusPoints > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          +{entry.bonusPoints}
                        </Badge>
                      )}
                      {entry.penaltyPoints > 0 && (
                        <Badge variant="outline" className="text-red-600">
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

        {/* Your Performance */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Performance</CardTitle>
              <CardDescription>
                How you're doing compared to others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    #{leaderboardData.find(e => e.isCurrentUser)?.rank || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Rank</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {leaderboardData.find(e => e.isCurrentUser)?.finalScore || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {leaderboardData.find(e => e.isCurrentUser)?.streakCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Keep Going!</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You're in the top 1% of participants. Maintain your streak and complete more projects to climb higher!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 