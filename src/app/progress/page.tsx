"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Target, Award, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isPast, isFuture } from 'date-fns';
import toast from 'react-hot-toast';

interface ProgressData {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  missedAssignments: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  totalScore: number;
  rank: number;
  totalStudents: number;
}

interface Assignment {
  id: string;
  title: string;
  deadline: string;
  status: 'completed' | 'pending' | 'missed' | 'not_started';
  score?: number;
  maxScore: number;
  submittedAt?: string;
  isLate?: boolean;
}

interface CalendarDay {
  date: Date;
  assignments: Assignment[];
  status: 'completed' | 'pending' | 'missed' | 'empty';
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'calendar' | 'list' | 'stats'>('calendar');

  useEffect(() => {
    fetchProgressData();
  }, []);

  useEffect(() => {
    generateCalendarDays();
  }, [selectedMonth, assignments]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Fetch progress statistics
      const statsResponse = await api.getProgressStats();
      setProgressData(statsResponse.stats || {
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        missedAssignments: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalScore: 0,
        rank: 0,
        totalStudents: 0
      });

      // Fetch assignments
      try {
        const assignmentsResponse = await api.getAssignments({ status: 'all' });
        const formattedAssignments = (assignmentsResponse.assignments || []).map((assignment: any) => ({
          id: assignment.id,
          title: assignment.title,
          deadline: assignment.deadline,
          status: assignment.submissionStatus === 'accepted' ? 'completed' : 
                  assignment.submissionStatus === 'pending' ? 'pending' :
                  assignment.isOverdue ? 'missed' : 'not_started',
          score: assignment.submissionScore,
          maxScore: assignment.maxScore,
          submittedAt: assignment.submittedAt,
          isLate: assignment.isLate
        }));
        
        setAssignments(formattedAssignments);
      } catch (assignmentError) {
        console.error('Error fetching assignments:', assignmentError);
        setAssignments([]); // Set empty array instead of failing
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      // Set default data instead of showing error
      setProgressData({
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        missedAssignments: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalScore: 0,
        rank: 0,
        totalStudents: 0
      });
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    const calendarDays = days.map(date => {
      const dayAssignments = assignments.filter(assignment => 
        isSameDay(new Date(assignment.deadline), date)
      );

      let status: 'completed' | 'pending' | 'missed' | 'empty' = 'empty';
      
      if (dayAssignments.length > 0) {
        const hasCompleted = dayAssignments.some(a => a.status === 'completed');
        const hasPending = dayAssignments.some(a => a.status === 'pending');
        const hasMissed = dayAssignments.some(a => a.status === 'missed');

        if (hasCompleted) status = 'completed';
        else if (hasPending) status = 'pending';
        else if (hasMissed) status = 'missed';
      }

      return {
        date,
        assignments: dayAssignments,
        status
      };
    });

    setCalendarDays(calendarDays);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'missed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getCompletionRate = () => {
    if (!progressData) return 0;
    return progressData.totalAssignments > 0 
      ? Math.round((progressData.completedAssignments / progressData.totalAssignments) * 100)
      : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracker</h1>
        <p className="text-gray-600">Monitor your learning journey and track your achievements</p>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletionRate()}%</div>
            <p className="text-xs text-muted-foreground">
              {progressData?.completedAssignments} of {progressData?.totalAssignments} assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData?.averageScore || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Across all completed assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground">
              Longest: {progressData?.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{progressData?.rank || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {progressData?.totalStudents || 0} students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Assignment Calendar</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDate = new Date(selectedMonth);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedMonth(newDate);
                }}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                {format(selectedMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDate = new Date(selectedMonth);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedMonth(newDate);
                }}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[80px] p-2 border rounded-lg ${
                  isToday(day.date) ? 'ring-2 ring-blue-500' : ''
                } ${getStatusColor(day.status)}`}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day.date, 'd')}
                </div>
                {day.assignments.length > 0 && (
                  <div className="space-y-1">
                    {day.assignments.map(assignment => (
                      <div key={assignment.id} className="text-xs">
                        <div className="font-medium truncate">{assignment.title}</div>
                        {assignment.status === 'completed' && assignment.score !== undefined && (
                          <div className="text-green-700">
                            {assignment.score}/{assignment.maxScore}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Missed</span>
            </div>
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Assignment History</h2>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {assignments.map(assignment => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(assignment.status)}
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>
                          Due: {format(new Date(assignment.deadline), 'PPP')}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Score:</span>
                      <span className="ml-2">
                        {assignment.score !== undefined ? `${assignment.score}/${assignment.maxScore}` : 'Not graded'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>
                      <span className="ml-2">
                        {assignment.submittedAt ? format(new Date(assignment.submittedAt), 'PP') : 'Not submitted'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className="ml-2 capitalize">{assignment.status}</span>
                    </div>
                    <div>
                      <span className="font-medium">Late:</span>
                      <span className="ml-2">{assignment.isLate ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Statistics View */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your assignment performance breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Completed</span>
                  <span className="font-medium">{progressData?.completedAssignments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pending</span>
                  <span className="font-medium">{progressData?.pendingAssignments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Missed</span>
                  <span className="font-medium">{progressData?.missedAssignments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Score</span>
                  <span className="font-medium">{progressData?.totalScore || 0} points</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Streak Information</CardTitle>
                <CardDescription>Your consistency tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current Streak</span>
                  <span className="font-medium">{progressData?.currentStreak || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Longest Streak</span>
                  <span className="font-medium">{progressData?.longestStreak || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completion Rate</span>
                  <span className="font-medium">{getCompletionRate()}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Class Rank</span>
                  <span className="font-medium">#{progressData?.rank || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest assignment submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments
                  .filter(a => a.submittedAt)
                  .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
                  .slice(0, 5)
                  .map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{assignment.title}</div>
                        <div className="text-sm text-gray-500">
                          Submitted: {format(new Date(assignment.submittedAt!), 'PPp')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                        </Badge>
                        {assignment.score !== undefined && (
                          <span className="text-sm font-medium">
                            {assignment.score}/{assignment.maxScore}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 