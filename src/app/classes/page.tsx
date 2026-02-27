"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Eye,
  GraduationCap,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  description: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string; // Optional for students
  };
  enrollmentCode?: string; // Optional for students
  maxStudents: number;
  studentCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  isEnrolled?: boolean;
}

interface CreateClassData {
  name: string;
  description: string;
  maxStudents: number;
  startDate: string;
  endDate: string;
}

interface JoinClassData {
  enrollmentCode: string;
}

interface InviteData {
  emails: string[];
  message: string;
  createAccounts: boolean;
}

export default function ClassesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedClassDetails, setSelectedClassDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [createData, setCreateData] = useState<CreateClassData>({
    name: '',
    description: '',
    maxStudents: 50,
    startDate: '',
    endDate: ''
  });
  const [joinData, setJoinData] = useState<JoinClassData>({
    enrollmentCode: ''
  });
  const [inviteData, setInviteData] = useState<InviteData>({
    emails: [''],
    message: '',
    createAccounts: false
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'instructor' || user?.role === 'staff';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.getClasses();
      setClasses(response.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    try {
      await api.createClass(createData);
      toast.success('Class created successfully!');
      setShowCreateDialog(false);
      setCreateData({
        name: '',
        description: '',
        maxStudents: 50,
        startDate: '',
        endDate: ''
      });
      fetchClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleJoinClass = async () => {
    try {
      await api.joinClass(joinData.enrollmentCode);
      toast.success('Successfully joined the class!');
      setShowJoinDialog(false);
      setJoinData({ enrollmentCode: '' });
      fetchClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join class');
    }
  };

  const handleLeaveClass = async (classId: string) => {
    if (confirm('Are you sure you want to leave this class?')) {
      try {
        await api.leaveClass(classId);
        toast.success('Successfully left the class');
        fetchClasses();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to leave class');
      }
    }
  };

  const handleInviteStudents = async () => {
    try {
      const validEmails = inviteData.emails.filter(email => email.trim());
      if (validEmails.length === 0) {
        toast.error('Please enter at least one email address');
        return;
      }

      await api.inviteStudents(selectedClass!.id, {
        emails: validEmails,
        message: inviteData.message,
        createAccounts: inviteData.createAccounts
      });

      toast.success('Invitations sent successfully!');
      setShowInviteDialog(false);
      setInviteData({
        emails: [''],
        message: '',
        createAccounts: false
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitations');
    }
  };

  const addEmailField = () => {
    setInviteData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmailField = (index: number) => {
    setInviteData(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setInviteData(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  // Filter classes based on search and status
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && cls.isActive) ||
      (statusFilter === 'enrolled' && cls.isEnrolled);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative selection:bg-neon-cyan/20 selection:text-neon-cyan">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-neon-cyan/20 selection:text-neon-cyan">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-6 lg:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {isAdmin ? 'Class Management' : 'My Classes'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm lg:text-base">
              {isAdmin ? 'Manage all classes and enrollments' : 'View your enrolled classes and join new ones'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isStudent && (
              <Button
                onClick={() => setShowJoinDialog(true)}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Join Class</span>
                <span className="sm:hidden">Join</span>
              </Button>
            )}

            {isAdmin && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Class</span>
                <span className="sm:hidden">Create</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              {isStudent && <SelectItem value="enrolled">Enrolled Only</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2 text-center">No classes found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {isAdmin
                  ? 'Create your first class to get started'
                  : 'Join a class using an enrollment code or wait for an invitation'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base lg:text-lg line-clamp-2">
                        {cls.name}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-2 text-xs sm:text-sm">
                        {cls.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Badge variant={cls.isActive ? "default" : "secondary"} className="shrink-0 text-xs">
                      {cls.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2 shrink-0" />
                    <span>{cls.studentCount} / {cls.maxStudents} students</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">
                      {cls.startDate ? new Date(cls.startDate).toLocaleDateString() : 'No start date'}
                    </span>
                  </div>

                  {cls.endDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2 shrink-0" />
                      <span className="truncate">Ends {new Date(cls.endDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <strong>Instructor:</strong> {cls.instructor.firstName} {cls.instructor.lastName}
                  </div>

                  {isAdmin && cls.enrollmentCode && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Enrollment Code:</strong>
                      <span className="font-mono bg-white/5 px-2 py-1 rounded ml-1 text-xs">
                        {cls.enrollmentCode}
                      </span>
                    </div>
                  )}

                  {cls.isEnrolled && (
                    <Badge variant="outline" className="text-neon-emerald border-green-600 text-sm">
                      Enrolled
                    </Badge>
                  )}
                </CardContent>

                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/classes/${cls.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">View Details</span>
                    </Button>

                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClass(cls);
                          setShowInviteDialog(true);
                        }}
                        title="Invite Students"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}

                    {cls.isEnrolled && isStudent && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleLeaveClass(cls.id)}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Class Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Create a new class and generate an enrollment code for students.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  value={createData.name}
                  onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter class name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createData.description}
                  onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter class description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={createData.maxStudents}
                    onChange={(e) => setCreateData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                    min="1"
                    max="200"
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={createData.startDate}
                    onChange={(e) => setCreateData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={createData.endDate}
                  onChange={(e) => setCreateData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClass}>
                Create Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Join Class Dialog */}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Join a Class</DialogTitle>
              <DialogDescription>
                Enter the enrollment code provided by your instructor to join a class.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="enrollmentCode">Enrollment Code</Label>
                <Input
                  id="enrollmentCode"
                  value={joinData.enrollmentCode}
                  onChange={(e) => setJoinData(prev => ({ ...prev, enrollmentCode: e.target.value }))}
                  placeholder="Enter enrollment code"
                  className="font-mono text-center text-lg tracking-wider"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleJoinClass}>
                Join Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Students Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invite Students</DialogTitle>
              <DialogDescription>
                Send invitations to students to join {selectedClass?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Email Addresses</Label>
                {inviteData.emails.map((email, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder="student@example.com"
                      type="email"
                    />
                    {inviteData.emails.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmailField(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEmailField}
                  className="mt-2"
                >
                  Add Another Email
                </Button>
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
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteStudents}>
                Send Invitations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 