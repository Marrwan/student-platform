'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Calendar, 
  Star, 
  UserCheck, 
  UserX,
  Award,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentId: string;
  attendanceScore?: number;
  totalAttendance?: number;
  lastAttendance?: string;
}

interface AttendanceManagerProps {
  classId: string;
  students: Student[];
  onAttendanceUpdated: () => void;
}

interface AttendanceFormData {
  userId: string;
  score: number;
  notes: string;
}

export function AttendanceManager({ classId, students, onAttendanceUpdated }: AttendanceManagerProps) {
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<AttendanceFormData>({
    userId: '',
    score: 100,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAwardAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.awardAttendanceScore(classId, formData);
      toast.success('Attendance score awarded successfully!');
      setShowAwardModal(false);
      onAttendanceUpdated();
      
      // Reset form
      setFormData({
        userId: '',
        score: 100,
        notes: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to award attendance score');
    } finally {
      setLoading(false);
    }
  };

  const openAwardModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      userId: student.id,
      score: 100,
      notes: ''
    });
    setShowAwardModal(true);
  };

  const getAttendanceStatus = (student: Student) => {
    if (!student.lastAttendance) {
      return { status: 'never', color: 'bg-gray-100 text-gray-800', icon: UserX };
    }

    const lastAttendance = new Date(student.lastAttendance);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastAttendance.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return { status: 'today', color: 'bg-green-100 text-green-800', icon: UserCheck };
    } else if (diffDays <= 7) {
      return { status: 'recent', color: 'bg-blue-100 text-blue-800', icon: Clock };
    } else {
      return { status: 'absent', color: 'bg-red-100 text-red-800', icon: UserX };
    }
  };

  const getAttendancePercentage = (student: Student) => {
    if (!student.totalAttendance) return 0;
    return Math.round((student.attendanceScore || 0) / student.totalAttendance * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Attendance Management</h3>
          <p className="text-sm text-gray-600">Award attendance scores to students</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {students.length} Students
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => {
          const attendanceStatus = getAttendanceStatus(student);
          const AttendanceIcon = attendanceStatus.icon;
          const attendancePercentage = getAttendancePercentage(student);

          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AttendanceIcon className="w-4 h-4" />
                    <Badge className={attendanceStatus.color}>
                      {attendanceStatus.status === 'today' ? 'Present Today' :
                       attendanceStatus.status === 'recent' ? 'Recent' :
                       attendanceStatus.status === 'absent' ? 'Absent' : 'Never'}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAwardModal(student)}
                  >
                    <Award className="w-4 h-4 mr-1" />
                    Award
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">
                    {student.firstName} {student.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Attendance Score:</span>
                    <p className="font-medium">{student.attendanceScore || 0} points</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Sessions:</span>
                    <p className="font-medium">{student.totalAttendance || 0}</p>
                  </div>
                </div>

                {student.totalAttendance && student.totalAttendance > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Attendance Rate</span>
                      <span>{attendancePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          attendancePercentage >= 80 ? 'bg-green-500' :
                          attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {student.lastAttendance && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Last: {new Date(student.lastAttendance).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Award Attendance Modal */}
      <Dialog open={showAwardModal} onOpenChange={setShowAwardModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Award Attendance Score</DialogTitle>
            <DialogDescription>
              Award attendance score to {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAwardAttendance} className="space-y-4">
            <div>
              <Label htmlFor="score">Attendance Score</Label>
              <Input
                id="score"
                type="number"
                value={formData.score}
                onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                min="0"
                max="100"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Score from 0 to 100 points
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about the attendance..."
                rows={3}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Star className="w-4 h-4" />
                <span className="font-medium">Attendance Information</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                This attendance score will be added to the student's total and will affect their position in the class leaderboard.
              </p>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAwardModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAwardAttendance} disabled={loading}>
              {loading ? 'Awarding...' : 'Award Score'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
