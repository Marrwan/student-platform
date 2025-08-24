"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  UserPlus, 
  Mail, 
  Loader2, 
  MapPin, 
  Link, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Settings,
  BarChart3,
  CalendarDays,
  Video,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ClassDetails {
  id: string;
  name: string;
  description: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  enrollmentCode: string;
  maxStudents: number;
  studentCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  isEnrolled?: boolean;
  assignments?: Assignment[];
  enrollments?: Enrollment[];
  schedule?: ClassSchedule[];
  location?: string;
  meetingLink?: string;
  isVirtual?: boolean;
  level?: string;
  completionRate?: number;
  averageScore?: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  isUnlocked: boolean;
  submissionCount?: number;
  totalStudents?: number;
}

interface Enrollment {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  enrolledAt: string;
  progress?: number;
  averageScore?: number;
}

interface ClassSchedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: 'virtual' | 'physical';
  location?: string;
  meetingLink?: string;
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const classId = params.id as string;
  
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = user?.role === 'admin' || user?.role === 'partial_admin';
  const isInstructor = classDetails?.instructor?.id === user?.id;

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const classData = await api.getClass(classId);
      setClassDetails(classData);
    } catch (error) {
      console.error('Error fetching class details:', error);
      toast.error('Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Class not found or you don't have access to it.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{classDetails.name}</h1>
            <p className="text-gray-600 mt-1">
              {classDetails.description || 'No description provided'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {(isAdmin || isInstructor) && (
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Class
            </Button>
          )}
        </div>
      </div>

      {/* Class Status Badge */}
      <div className="mb-6">
        <Badge variant={classDetails.isActive ? "default" : "secondary"} className="text-sm">
          {classDetails.isActive ? 'Active' : 'Inactive'}
        </Badge>
        {classDetails.isEnrolled && (
          <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
            Enrolled
          </Badge>
        )}
        {classDetails.level && (
          <Badge variant="outline" className="ml-2">
            {classDetails.level.charAt(0).toUpperCase() + classDetails.level.slice(1)}
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          {(isAdmin || isInstructor) && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Class Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Class Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Instructor</Label>
                  <p className="font-medium">
                    {classDetails.instructor.firstName} {classDetails.instructor.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{classDetails.instructor.email}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Enrollment</Label>
                  <p className="font-medium">{classDetails.studentCount} / {classDetails.maxStudents} students</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Duration</Label>
                  <p className="font-medium">
                    {classDetails.startDate ? new Date(classDetails.startDate).toLocaleDateString() : 'Not set'}
                    {classDetails.endDate && ` - ${new Date(classDetails.endDate).toLocaleDateString()}`}
                  </p>
                </div>
                
                {isAdmin && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Enrollment Code</Label>
                    <p className="font-mono bg-gray-100 p-2 rounded text-sm">{classDetails.enrollmentCode}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location & Meeting Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {classDetails.isVirtual ? <Link className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  {classDetails.isVirtual ? 'Virtual Meeting' : 'Location'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {classDetails.isVirtual ? (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Meeting Link</Label>
                    {classDetails.meetingLink ? (
                      <a 
                        href={classDetails.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {classDetails.meetingLink}
                      </a>
                    ) : (
                      <p className="text-gray-500">No meeting link set</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p>{classDetails.location || 'No location set'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {classDetails.assignments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Assignments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {classDetails.completionRate || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Completion</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {classDetails.averageScore || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Assignments</h2>
            {(isAdmin || isInstructor) && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            )}
          </div>
          
          {classDetails.assignments && classDetails.assignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classDetails.assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant={assignment.isUnlocked ? "default" : "secondary"}>
                        {assignment.isUnlocked ? 'Active' : 'Locked'}
                      </Badge>
                    </div>
                    <CardDescription>{assignment.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    
                    {assignment.submissionCount !== undefined && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{assignment.submissionCount} / {assignment.totalStudents} submissions</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                <p className="text-gray-600 text-center mb-4">
                  {isAdmin || isInstructor 
                    ? 'Create your first assignment to get started'
                    : 'No assignments have been created for this class yet'
                  }
                </p>
                {(isAdmin || isInstructor) && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Students</h2>
            {(isAdmin || isInstructor) && (
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Students
              </Button>
            )}
          </div>
          
          {classDetails.enrollments && classDetails.enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classDetails.enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">
                          {enrollment.student.firstName} {enrollment.student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{enrollment.student.email}</p>
                      </div>
                      <Badge variant={enrollment.status === 'active' ? "default" : "secondary"}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">{enrollment.progress || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Score:</span>
                        <span className="font-medium">{enrollment.averageScore || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enrolled:</span>
                        <span className="font-medium">
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
                <p className="text-gray-600 text-center">
                  No students have enrolled in this class yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Class Schedule</h2>
            {(isAdmin || isInstructor) && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            )}
          </div>
          
          {classDetails.schedule && classDetails.schedule.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classDetails.schedule.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {schedule.type === 'virtual' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                      {schedule.dayOfWeek}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                    
                    {schedule.type === 'virtual' ? (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Meeting Link</Label>
                        {schedule.meetingLink ? (
                          <a 
                            href={schedule.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm break-all"
                          >
                            Join Meeting
                          </a>
                        ) : (
                          <p className="text-gray-500 text-sm">No link provided</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Location</Label>
                        <p className="text-sm">{schedule.location || 'No location set'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarDays className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schedule set</h3>
                <p className="text-gray-600 text-center mb-4">
                  {isAdmin || isInstructor 
                    ? 'Add a class schedule to help students know when to attend'
                    : 'No class schedule has been set yet'
                  }
                </p>
                {(isAdmin || isInstructor) && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Schedule
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab (Admin/Instructor Only) */}
        {(isAdmin || isInstructor) && (
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Class Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{classDetails.studentCount}</div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {classDetails.assignments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Assignments</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {classDetails.completionRate || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {classDetails.averageScore || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard will be implemented here with charts and detailed metrics.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
