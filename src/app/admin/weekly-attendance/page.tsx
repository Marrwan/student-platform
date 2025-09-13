'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Activity,
  Eye,
  Edit,
  Save,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Class {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  enrollmentCode: string;
  maxStudents: number;
}

interface Week {
  weekStart: string;
  weekEnd: string;
  label: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface WeeklyAttendance {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  totalDaysPresent: number;
  totalDaysInWeek: number;
  attendancePercentage: number;
  score: number;
  notes: string;
  markedAt: string;
  user: Student;
}

export default function WeeklyAttendancePage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <WeeklyAttendanceDashboard />
    </ProtectedRoute>
  );
}

function WeeklyAttendanceDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<WeeklyAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadWeeks();
      loadStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedWeek) {
      loadAttendance();
    }
  }, [selectedClass, selectedWeek]);

  const loadClasses = async () => {
    try {
      const response = await api.getClasses();
      setClasses(response.classes);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const loadWeeks = async () => {
    try {
      const response = await api.getWeeklyAttendanceWeeks(selectedClass);
      setWeeks(response.weeks);
      if (response.weeks.length > 0) {
        setSelectedWeek(response.weeks[0].weekStart);
      }
    } catch (error) {
      console.error('Error loading weeks:', error);
      toast.error('Failed to load weeks');
    }
  };

  const loadStudents = async () => {
    try {
      const response = await api.getWeeklyAttendanceStudents(selectedClass);
      setStudents(response.students);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.getWeeklyAttendance(selectedClass, selectedWeek);
      
      // If no attendance data exists, create initial data for all students
      if (response.attendance.length === 0 && students.length > 0) {
        const initialAttendanceData = students.map(student => ({
          id: `temp-${student.id}`,
          userId: student.id,
          weekStartDate: selectedWeek,
          weekEndDate: new Date(new Date(selectedWeek).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
          totalDaysPresent: 0,
          totalDaysInWeek: 5, // Assuming 5-day week
          attendancePercentage: 0,
          score: 0,
          notes: '',
          markedAt: new Date().toISOString(),
          user: student
        }));
        setAttendanceData(initialAttendanceData);
      } else {
        setAttendanceData(response.attendance);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast.error('Failed to load attendance');
      
      // If error occurs, create initial data for all students
      if (students.length > 0) {
        const initialAttendanceData = students.map(student => ({
          id: `temp-${student.id}`,
          userId: student.id,
          weekStartDate: selectedWeek,
          weekEndDate: new Date(new Date(selectedWeek).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
          totalDaysPresent: 0,
          totalDaysInWeek: 5,
          attendancePercentage: 0,
          score: 0,
          notes: '',
          markedAt: new Date().toISOString(),
          user: student
        }));
        setAttendanceData(initialAttendanceData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, day: string, value: boolean) => {
    setAttendanceData(prev => prev.map(att => {
      if (att.userId === studentId) {
        const updatedAtt = { ...att, [day]: value };
        
        // Calculate total days present
        const daysPresent = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          .filter(d => updatedAtt[d as keyof typeof updatedAtt] === true).length;
        
        // Calculate attendance percentage
        const percentage = updatedAtt.totalDaysInWeek > 0 ? (daysPresent / updatedAtt.totalDaysInWeek) * 100 : 0;
        
        return {
          ...updatedAtt,
          totalDaysPresent: daysPresent,
          attendancePercentage: percentage
        };
      }
      return att;
    }));
  };

  const handleScoreChange = (studentId: string, score: number) => {
    setAttendanceData(prev => prev.map(att => {
      if (att.userId === studentId) {
        return { ...att, score };
      }
      return att;
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData(prev => prev.map(att => {
      if (att.userId === studentId) {
        return { ...att, notes };
      }
      return att;
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const attendanceDataToSave = attendanceData.map(att => ({
        userId: att.userId,
        attendance: {
          monday: att.monday,
          tuesday: att.tuesday,
          wednesday: att.wednesday,
          thursday: att.thursday,
          friday: att.friday,
          saturday: att.saturday,
          sunday: att.sunday,
          totalDaysInWeek: att.totalDaysInWeek,
          score: att.score,
          notes: att.notes
        }
      }));

      await api.markWeeklyAttendanceBulk(selectedClass, {
        weekStartDate: selectedWeek,
        attendanceData: attendanceDataToSave
      });

      toast.success('Attendance saved successfully!');
      await loadAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const refreshAttendanceScores = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/weekly-attendance/classes/${selectedClass}/attendance/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh attendance scores');
      }

      const result = await response.json();
      toast.success(result.message || 'Leaderboard refreshed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to refresh leaderboard');
    } finally {
      setSaving(false);
    }
  };

  const getDayIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  if (classes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Classes Found</h2>
          <p className="text-gray-600">There are no classes available for attendance marking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Attendance Management</h1>
          <p className="text-gray-600">Mark and manage weekly attendance for all classes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Class and Week Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="class">Select Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedClass && (
                    <div>
                      <Label htmlFor="week">Select Week</Label>
                      <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a week" />
                        </SelectTrigger>
                        <SelectContent>
                          {weeks.map((week) => (
                            <SelectItem key={week.weekStart} value={week.weekStart}>
                              {week.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedClass && selectedWeek && (
                    <div className="pt-4 space-y-2">
                      <Button 
                        onClick={saveAttendance} 
                        disabled={saving}
                        className="w-full"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Attendance
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        onClick={refreshAttendanceScores} 
                        disabled={saving}
                        variant="outline"
                        className="w-full"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Leaderboard
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedClass && (
              <Card>
                <CardHeader>
                  <CardTitle>Class Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">
                        {new Date(classes.find(c => c.id === selectedClass)?.startDate || '').toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">
                        {new Date(classes.find(c => c.id === selectedClass)?.endDate || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Attendance Table */}
          <div className="lg:col-span-3">
            {selectedClass && selectedWeek ? (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Attendance</CardTitle>
                  <CardDescription>
                    Week of {new Date(selectedWeek).toLocaleDateString()} - {new Date(selectedWeek).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Loading attendance data...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Student</th>
                            <th className="text-center py-3 px-2 font-medium">Mon</th>
                            <th className="text-center py-3 px-2 font-medium">Tue</th>
                            <th className="text-center py-3 px-2 font-medium">Wed</th>
                            <th className="text-center py-3 px-2 font-medium">Thu</th>
                            <th className="text-center py-3 px-2 font-medium">Fri</th>
                            <th className="text-center py-3 px-2 font-medium">Sat</th>
                            <th className="text-center py-3 px-2 font-medium">Sun</th>
                            <th className="text-center py-3 px-2 font-medium">Present</th>
                            <th className="text-center py-3 px-2 font-medium">%</th>
                            <th className="text-center py-3 px-2 font-medium">Score</th>
                            <th className="text-center py-3 px-2 font-medium">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceData.map((att) => (
                            <tr key={att.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2">
                                <div>
                                  <div className="font-medium">{att.user.firstName} {att.user.lastName}</div>
                                  <div className="text-sm text-gray-500">{att.user.email}</div>
                                </div>
                              </td>
                              <td className="text-center py-3 px-2">
                                <Checkbox
                                  checked={att.monday}
                                  onCheckedChange={(checked) => handleAttendanceChange(att.userId, 'monday', checked as boolean)}
                                />
                              </td>
                              <td className="text-center py-3 px-2">
                                <Checkbox
                                  checked={att.tuesday}
                                  onCheckedChange={(checked) => handleAttendanceChange(att.userId, 'tuesday', checked as boolean)}
                                />
                              </td>
                              <td className="text-center py-3 px-2">
                                <Checkbox
                                  checked={att.wednesday}
                                  onCheckedChange={(checked) => handleAttendanceChange(att.userId, 'wednesday', checked as boolean)}
                                />
                              </td>
                              <td className="text-center py-3 px-2">
                                <Checkbox
                                  checked={att.thursday}
                                  onCheckedChange={(checked) => handleAttendanceChange(att.userId, 'thursday', checked as boolean)}
                                />
                              </td>
                              <td className="text-center py-3 px-2">
                                <Checkbox
                                  checked={att.friday}
                                  onCheckedChange={(checked) => handleAttendanceChange(att.userId, 'friday', checked as boolean)}
                                />
                              </td>
                              <td className="text-center py-3 px-2">
                                <Checkbox
                                  checked={att.saturday}
                                  onCheckedChange={(checked) => handleAttendanceChange(att.userId, 'saturday', checked as boolean)}
                                />
                              </td>
                              <td className="text-center py-3 px-2">
                                <Checkbox
                                  checked={att.sunday}
                                  onCheckedChange={(checked) => handleAttendanceChange(att.userId, 'sunday', checked as boolean)}
                                />
                              </td>
                              <td className="text-center py-3 px-2 font-medium">
                                {att.totalDaysPresent}/{att.totalDaysInWeek}
                              </td>
                              <td className="text-center py-3 px-2">
                                <Badge variant={att.attendancePercentage >= 80 ? 'default' : att.attendancePercentage >= 60 ? 'secondary' : 'destructive'}>
                                  {att.attendancePercentage.toFixed(1)}%
                                </Badge>
                              </td>
                              <td className="text-center py-3 px-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={att.score}
                                  onChange={(e) => handleScoreChange(att.userId, parseFloat(e.target.value) || 0)}
                                  className="w-20 text-center"
                                />
                              </td>
                              <td className="py-3 px-2">
                                <Textarea
                                  value={att.notes}
                                  onChange={(e) => handleNotesChange(att.userId, e.target.value)}
                                  placeholder="Add notes..."
                                  className="w-32 text-sm"
                                  rows={2}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Class and Week</h3>
                  <p className="text-gray-600">Choose a class and week to start marking attendance</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
