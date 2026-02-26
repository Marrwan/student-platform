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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus,
  Users,
  BookOpen,
  Mail,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Settings,
  GraduationCap,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ExternalLink,
  BarChart3,
  CalendarDays,
  Video,
  MapPin,
  Link,
  FileText,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Class {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  maxStudents: number;
  studentCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  instructorId: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  enrollmentCode: string;
  assignments?: Assignment[];
  enrollments?: Enrollment[];
  schedule?: ClassSchedule[];
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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending';
  progress: number;
  averageScore: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive?: boolean;
}

export default function ClassesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ClassesManagement />
    </ProtectedRoute>
  );
}

function ClassesManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showClassDetailsModal, setShowClassDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'beginner' as const,
    maxStudents: 30,
    startDate: '',
    endDate: '',
    instructorId: ''
  });

  const [scheduleData, setScheduleData] = useState({
    dayOfWeek: 'monday',
    startTime: '',
    endTime: '',
    type: 'virtual' as const,
    location: '',
    meetingLink: ''
  });

  const [inviteData, setInviteData] = useState({
    emails: '',
    message: '',
    selectedUsers: [] as string[],
    outsiderEmails: [] as string[]
  });

  useEffect(() => {
    loadClasses();
    loadAllUsers();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAdminClasses();
      setClasses(response.classes);
    } catch (err: any) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await api.getAdminUsers();
      setAllUsers(response.users.filter((u: any) => u.role === 'student' && u.isActive === true));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadClassStudents = async (classId: string) => {
    try {
      const response = await api.getAdminClassStudents(classId);
      setStudents(response.students);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClass(formData);
      toast.success('Class created successfully!');
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        level: 'beginner',
        maxStudents: 30,
        startDate: '',
        endDate: '',
        instructorId: ''
      });
      loadClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      await api.updateClass(selectedClass.id, formData);
      toast.success('Class updated successfully!');
      setShowEditModal(false);
      loadClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update class');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        await api.deleteClass(classId);
        toast.success('Class deleted successfully!');
        loadClasses();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete class');
      }
    }
  };

  const handleSendInvitations = async () => {
    if (!selectedClass) return;

    try {
      const validEmails = inviteData.outsiderEmails.filter(email => email.trim());
      if (validEmails.length === 0 && inviteData.selectedUsers.length === 0) {
        toast.error('Please select users or add email addresses');
        return;
      }

      await api.inviteStudents(selectedClass.id, {
        emails: validEmails,
        message: inviteData.message
      });

      toast.success('Invitations sent successfully!');
      setShowInviteModal(false);
      setInviteData({
        emails: '',
        message: '',
        selectedUsers: [],
        outsiderEmails: []
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitations');
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      await api.createClassSchedule({
        ...scheduleData,
        classId: selectedClass.id
      });
      toast.success('Schedule added successfully!');
      setShowScheduleModal(false);
      setScheduleData({
        dayOfWeek: 'monday',
        startTime: '',
        endTime: '',
        type: 'virtual',
        location: '',
        meetingLink: ''
      });
      loadClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add schedule');
    }
  };

  const handleAddOutsiderEmail = () => {
    if (inviteData.emails.trim()) {
      setInviteData({
        ...inviteData,
        outsiderEmails: [...inviteData.outsiderEmails, inviteData.emails.trim()],
        emails: ''
      });
    }
  };

  const handleRemoveOutsiderEmail = (index: number) => {
    setInviteData({
      ...inviteData,
      outsiderEmails: inviteData.outsiderEmails.filter((_, i) => i !== index)
    });
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    setInviteData({
      ...inviteData,
      selectedUsers: checked
        ? [...inviteData.selectedUsers, userId]
        : inviteData.selectedUsers.filter(id => id !== userId)
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20';
      case 'intermediate':
        return 'bg-neon-amber/10 text-neon-amber border-neon-amber/20';
      case 'advanced':
        return 'bg-neon-pink/10 text-neon-pink border-neon-pink/20';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20';
      case 'inactive':
        return 'bg-neon-pink/10 text-neon-pink border-neon-pink/20';
      case 'pending':
        return 'bg-neon-amber/10 text-neon-amber border-neon-amber/20';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  // Filter classes based on search and filters
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === 'all' || cls.level === levelFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && cls.isActive) ||
      (statusFilter === 'inactive' && !cls.isActive);

    return matchesSearch && matchesLevel && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-destructive">Classes Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadClasses} variant="outline" className="border-white/10">Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neon-cyan/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Class Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage classes, invite students, and track progress
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-background border-white/10 focus-visible:ring-neon-cyan"
                />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Classes Grid */}
            {filteredClasses.length === 0 ? (
              <Card className="border-dashed border-white/20 bg-background/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-center text-foreground">No classes found</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    {searchTerm || levelFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your search or filters to find what you are looking for.'
                      : 'Create your first class to get started adding students and assignments.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {filteredClasses.map((classItem) => (
                  <Card key={classItem.id} className="hover:shadow-2xl transition-all duration-300 hover:border-white/10 hover:-translate-y-1 bg-card/60 backdrop-blur-md">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold tracking-tight line-clamp-1">
                            {classItem.name}
                          </CardTitle>
                          <CardDescription className="mt-1.5 line-clamp-2 text-sm leading-relaxed">
                            {classItem.description}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={getLevelColor(classItem.level || 'beginner')}>
                          {(classItem.level || 'beginner').charAt(0).toUpperCase() + (classItem.level || 'beginner').slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm border-t border-white/5 pt-4 mt-2">
                        <div>
                          <span className="text-muted-foreground/70 text-xs uppercase tracking-wider block mb-1">Students</span>
                          <p className="font-medium text-foreground">{classItem.studentCount || 0}/{classItem.maxStudents}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground/70 text-xs uppercase tracking-wider block mb-1">Assignments</span>
                          <p className="font-medium text-foreground">{classItem.assignments?.length || 0}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground/70 text-xs uppercase tracking-wider block mb-1">Completion</span>
                          <p className="font-medium text-neon-emerald">{classItem.completionRate || 0}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground/70 text-xs uppercase tracking-wider block mb-1">Avg Score</span>
                          <p className="font-medium text-neon-cyan">{classItem.averageScore || 0}%</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Class Progress</span>
                          <span className="text-foreground">{classItem.completionRate || 0}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-neon-cyan h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                            style={{ width: `${classItem.completionRate || 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedClass(classItem);
                            setShowClassDetailsModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                        </Button>

                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedClass(classItem);
                            setShowInviteModal(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Invite</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl lg:text-2xl font-bold">All Students</h2>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Students
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-center py-8">
                  Student management features will be implemented here.
                  You can view and manage all students across classes.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-bold">Class Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                      {classes.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Classes</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-green-600">
                      {classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-purple-600">
                      {classes.reduce((sum, cls) => sum + (cls.assignments?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Assignments</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-orange-600">
                      {classes.filter(cls => cls.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600">Active Classes</div>
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
        </Tabs>
      </main>

      {/* Create Class Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Create a new class and generate an enrollment code for students.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter class name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter class description"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                  min="1"
                  max="200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClass}>
              Create Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Details Modal */}
      <Dialog open={showClassDetailsModal} onOpenChange={setShowClassDetailsModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClass?.name}</DialogTitle>
            <DialogDescription>
              Detailed class information and management options
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Class Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="text-sm">{selectedClass.description}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">Instructor</Label>
                      <p className="font-medium">
                        {selectedClass.instructor?.firstName} {selectedClass.instructor?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedClass.instructor?.email}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">Enrollment</Label>
                      <p className="font-medium">{selectedClass.studentCount} / {selectedClass.maxStudents} students</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600">Enrollment Code</Label>
                      <p className="font-mono bg-gray-100 p-2 rounded text-sm break-all">
                        {selectedClass.enrollmentCode}
                      </p>
                    </div>
                  </CardContent>
                </Card>

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
                          {selectedClass.assignments?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Assignments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedClass.completionRate || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Completion</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedClass.averageScore || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" />
                      Class Schedule
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowClassDetailsModal(false);
                        setShowScheduleModal(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Schedule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedClass.schedule && selectedClass.schedule.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedClass.schedule.map((schedule) => (
                        <div key={schedule.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {schedule.type === 'virtual' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                            <span className="font-medium">{schedule.dayOfWeek}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>{schedule.startTime} - {schedule.endTime}</div>
                            {schedule.type === 'virtual' ? (
                              <div className="mt-1">
                                {schedule.meetingLink ? (
                                  <a href={schedule.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Join Meeting
                                  </a>
                                ) : (
                                  <span className="text-gray-500">No link provided</span>
                                )}
                              </div>
                            ) : (
                              <div className="mt-1">{schedule.location || 'No location set'}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No schedule set for this class</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowClassDetailsModal(false);
                    setShowInviteModal(true);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Students
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowClassDetailsModal(false);
                    setShowEditModal(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Class
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowClassDetailsModal(false);
                    router.push(`/classes/${selectedClass.id}`);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowClassDetailsModal(false);
                    handleDeleteClass(selectedClass.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Class
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClassDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Students Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invite Students to {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              Send invitations to students to join this class.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Existing Students</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-4 mt-2">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id={user.id}
                      checked={inviteData.selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                    />
                    <Label htmlFor={user.id} className="text-sm">
                      {user.firstName} {user.lastName} ({user.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>External Email Addresses</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={inviteData.emails}
                  onChange={(e) => setInviteData(prev => ({ ...prev, emails: e.target.value }))}
                  placeholder="student@example.com"
                  type="email"
                />
                <Button type="button" variant="outline" onClick={handleAddOutsiderEmail}>
                  Add
                </Button>
              </div>

              {inviteData.outsiderEmails.length > 0 && (
                <div className="mt-2 space-y-2">
                  {inviteData.outsiderEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{email}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOutsiderEmail(index)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal message to the invitation..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvitations}>
              Send Invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Class Schedule</DialogTitle>
            <DialogDescription>
              Add a new schedule entry for {selectedClass?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select value={scheduleData.dayOfWeek} onValueChange={(value) => setScheduleData(prev => ({ ...prev, dayOfWeek: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={scheduleData.type} onValueChange={(value: any) => setScheduleData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={scheduleData.startTime}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={scheduleData.endTime}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            {scheduleData.type === 'virtual' ? (
              <div>
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  type="url"
                  value={scheduleData.meetingLink}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={scheduleData.location}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Room 101, Building A"
                />
              </div>
            )}
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSchedule}>
              Add Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update class information and settings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditClass} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Class Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter class name"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter class description"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-level">Level</Label>
                <Select value={formData.level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-maxStudents">Max Students</Label>
                <Input
                  id="edit-maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                  min="1"
                  max="200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditClass}>
              Update Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 