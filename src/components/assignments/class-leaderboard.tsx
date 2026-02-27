'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Users, 
  Star,
  Calendar,
  Target
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface LeaderboardEntry {
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

interface ClassLeaderboardProps {
  classId: string;
}

export function ClassLeaderboard({ classId }: ClassLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLeaderboard();
  }, [classId, currentPage]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.getClassLeaderboard(classId, { page: currentPage, limit: 20 });
      setLeaderboard(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Award className="w-5 h-5 text-neon-amber" />;
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-white/5 text-foreground border-white/10';
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getCompletionRate = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getAttendanceRate = (attended: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((attended / total) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Leaderboard Data</h3>
          <p className="text-muted-foreground text-center max-w-md">
            No students have completed assignments or received attendance scores yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Class Leaderboard</h3>
          <p className="text-sm text-muted-foreground">Student rankings based on assignments and attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await api.refreshClassLeaderboard(classId);
                toast.success('Leaderboard refreshed successfully!');
                loadLeaderboard();
              } catch (error) {
                toast.error('Failed to refresh leaderboard');
              }
            }}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {leaderboard?.length || 0} Students
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {leaderboard?.map((entry, index) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        {entry.firstName} {entry.lastName}
                      </h4>
                      <Badge className={getRankBadge(entry.rank)}>
                        #{entry.rank}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-neon-cyan">
                    {entry.finalScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-foreground/90">Assignments</span>
                  </div>
                  <div className="text-lg font-bold text-neon-cyan">
                    {entry.assignmentScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.completedProjects} projects completed
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${entry.completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-foreground/90">Attendance</span>
                  </div>
                  <div className="text-lg font-bold text-neon-emerald">
                    {entry.attendanceScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.attendanceScore}% attendance
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${entry.attendanceScore}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-foreground/90">Progress</span>
                  </div>
                  <div className="text-lg font-bold text-neon-violet">
                    {entry.completionRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Overall completion
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                    <div 
                      className="bg-purple-500 h-1 rounded-full"
                      style={{ width: `${entry.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Enrolled: {new Date(entry.enrolledAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2">
                  {entry.rank <= 3 && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      Top Performer
                    </Badge>
                  )}
                  {entry.completionRate === 100 && (
                    <Badge className="bg-green-100 text-green-800">
                      All Assignments Complete
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
