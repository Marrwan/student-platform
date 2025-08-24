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
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  maxStudents: number;
  currentStudents: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  instructorId: string;
  instructorName: string;
  assignments: number;
  completionRate: number;
  averageScore: number;
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
  isActive: boolean;
}

export default function ClassesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ClassesManagement />
    </ProtectedRoute>
  );
}

function ClassesManagement() {
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
      setAllUsers(response.users.filter((u: User) => u.role === 'student' && u.isActive));
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
      await api.createAdminClass(formData);
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

  const handleInviteStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedClass?.id) {
        toast.error('No class selected');
        return;
      }

      // Combine selected users and outsider emails
      const allEmails = [
        ...inviteData.selectedUsers.map(userId => {
          const user = allUsers.find(u => u.id === userId);
          return user?.email;
        }).filter(Boolean),
        ...inviteData.outsiderEmails
      ];

      if (allEmails.length === 0) {
        toast.error('Please select users or enter email addresses');
        return;
      }

      await api.inviteAdminClassStudents(selectedClass.id, { 
        emails: allEmails, 
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
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Classes Error</h1><p>{error}</p><button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={loadClasses}>Retry</button></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Class Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
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
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <Input placeholder="Search classes..." className="flex-1" />
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{classItem.name}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-3">
                          {classItem.description}
                        </CardDescription>
                      </div>
                      <Badge className={getLevelColor(classItem.level || 'beginner')}>
                        {(classItem.level || 'beginner').charAt(0).toUpperCase() + (classItem.level || 'beginner').slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Students</span>
                        <p className="font-medium">{classItem.currentStudents || 0}/{classItem.maxStudents}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assignments</span>
                        <p className="font-medium">{classItem.assignments || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completion</span>
                        <p className="font-medium">{classItem.completionRate || 0}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Score</span>
                        <p className="font-medium">{classItem.averageScore || 0}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{classItem.completionRate || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${classItem.completionRate || 0}%` }}
                        ></div>
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
                        View Details
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
                        Invite
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Students</CardTitle>
                <CardDescription>
                  Manage students across all classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No students found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Select a class to view its students
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{student.firstName} {student.lastName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm font-medium">{student.progress}%</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Progress</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {classes.filter(c => c.isActive).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all classes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + (c.completionRate || 0), 0) / classes.length) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all classes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + (c.averageScore || 0), 0) / classes.length) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all classes
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create New Class</CardTitle>
              <CardDescription>
                Set up a new class with students and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the class content, objectives, and what students will learn..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                    >
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

                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Create Class
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Invite Students Modal */}
      {showInviteModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Invite Students to {selectedClass.name}</CardTitle>
              <CardDescription>
                Invite existing users or send invitations to new users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteStudents} className="space-y-6">
                {/* Existing Users Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Invite Existing Users</h3>
                  </div>
                  
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    {allUsers.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No available users found</p>
                    ) : (
                      <div className="space-y-2">
                        {allUsers.map((user) => (
                          <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              id={user.id}
                              checked={inviteData.selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={user.id} className="font-medium cursor-pointer">
                                {user.firstName} {user.lastName}
                              </Label>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Outsider Invitations Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Invite New Users</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter email address"
                        value={inviteData.emails}
                        onChange={(e) => setInviteData({ ...inviteData, emails: e.target.value })}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddOutsiderEmail}
                        disabled={!inviteData.emails.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {inviteData.outsiderEmails.length > 0 && (
                      <div className="space-y-2">
                        <Label>Emails to invite:</Label>
                        <div className="space-y-1">
                          {inviteData.outsiderEmails.map((email, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{email}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveOutsiderEmail(index)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message to the invitation..."
                    value={inviteData.message}
                    onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Send Invitations
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Class Details Modal */}
      {showClassDetailsModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedClass.name}</CardTitle>
              <CardDescription>
                Class details and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Class Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedClass.description}</p>
                </div>
              </div>

              {/* Class Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Level</Label>
                  <Badge className={getLevelColor(selectedClass.level)}>
                    {selectedClass.level}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={selectedClass.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedClass.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Students</Label>
                  <p className="text-lg font-medium">{selectedClass.currentStudents}/{selectedClass.maxStudents}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assignments</Label>
                  <p className="text-lg font-medium">{selectedClass.assignments}</p>
                </div>
              </div>

              {/* Progress and Scores */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Completion Rate</Label>
                    <span>{selectedClass.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${selectedClass.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Average Score</Label>
                    <span>{selectedClass.averageScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${selectedClass.averageScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date</Label>
                  <p className="text-sm">{new Date(selectedClass.startDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date</Label>
                  <p className="text-sm">{new Date(selectedClass.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setShowClassDetailsModal(false);
                    setShowInviteModal(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Students
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowClassDetailsModal(false)}
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