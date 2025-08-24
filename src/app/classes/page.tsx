"use client";

import { useState, useEffect } from 'react';
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
import { Calendar, Clock, Users, BookOpen, Plus, Search, Filter, UserPlus, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Class {
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

  const isAdmin = user?.role === 'admin' || user?.role === 'partial_admin';

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
      toast.success('Class created successfully');
      setShowCreateDialog(false);
      setCreateData({
        name: '',
        description: '',
        maxStudents: 50,
        startDate: '',
        endDate: ''
      });
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    }
  };

  const handleJoinClass = async () => {
    try {
      const result = await api.joinClass(joinData.enrollmentCode);
      
      if (result.alreadyEnrolled) {
        toast.success(`You are already enrolled in ${result.className}`);
        setShowJoinDialog(false);
        setJoinData({ enrollmentCode: '' });
        fetchClasses();
        // Optionally redirect to the class page
        // router.push(`/classes/${result.classId}`);
      } else {
        toast.success('Successfully joined class');
        setShowJoinDialog(false);
        setJoinData({ enrollmentCode: '' });
        fetchClasses();
      }
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error('Failed to join class');
    }
  };

  const handleLeaveClass = async (classId: string) => {
    try {
      await api.leaveClass(classId);
      toast.success('Successfully left class');
      fetchClasses();
    } catch (error) {
      console.error('Error leaving class:', error);
      toast.error('Failed to leave class');
    }
  };

  const handleViewDetails = async (classId: string) => {
    setLoadingDetails(true);
    try {
      const classData = await api.getClass(classId);
      setSelectedClassDetails(classData.class);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching class details:', error);
      toast.error('Failed to load class details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleInviteStudents = async () => {
    if (!selectedClass) return;
    
    try {
      await api.inviteStudents(selectedClass.id, inviteData);
      toast.success('Invitations sent successfully');
      setShowInviteDialog(false);
      setInviteData({ emails: [''], message: '', createAccounts: false });
      setSelectedClass(null);
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && cls.isActive) ||
                         (statusFilter === 'enrolled' && cls.isEnrolled);
    return matchesSearch && matchesStatus;
  });

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-2">
            {isAdmin ? 'Manage all classes and enrollments' : 'View your enrolled classes'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isAdmin && (
            <Button onClick={() => setShowJoinDialog(true)} variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Join Class
            </Button>
          )}
          
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            {!isAdmin && <SelectItem value="enrolled">Enrolled Only</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600 text-center">
              {isAdmin 
                ? 'Create your first class to get started'
                : 'Join a class using an enrollment code or wait for an invitation'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {cls.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge variant={cls.isActive ? "default" : "secondary"}>
                    {cls.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{cls.studentCount} / {cls.maxStudents} students</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {cls.startDate ? new Date(cls.startDate).toLocaleDateString() : 'No start date'}
                    </span>
                  </div>
                  
                  {cls.endDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Ends {new Date(cls.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <strong>Instructor:</strong> {cls.instructor.firstName} {cls.instructor.lastName}
                  </div>
                  
                  {isAdmin && (
                    <div className="text-sm text-gray-600">
                      <strong>Enrollment Code:</strong> {cls.enrollmentCode}
                    </div>
                  )}
                  
                  {cls.isEnrolled && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Enrolled
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(cls.id)}
                    disabled={loadingDetails}
                  >
                    {loadingDetails && selectedClassDetails?.id === cls.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'View Details'
                    )}
                  </Button>
                  
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedClass(cls);
                        setShowInviteDialog(true);
                      }}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {cls.isEnrolled && !isAdmin && (
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
        <DialogContent className="sm:max-w-[500px]">
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
            
            <div className="grid grid-cols-2 gap-4">
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
              Enter the enrollment code provided by your instructor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="enrollmentCode">Enrollment Code</Label>
              <Input
                id="enrollmentCode"
                value={joinData.enrollmentCode}
                onChange={(e) => setJoinData(prev => ({ ...prev, enrollmentCode: e.target.value }))}
                placeholder="Enter 8-character code"
                maxLength={8}
                className="uppercase"
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite Students</DialogTitle>
            <DialogDescription>
              Send invitations to students to join {selectedClass?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Student Emails</Label>
              {inviteData.emails.map((email, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="student@example.com"
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
                placeholder="Add a personal message to the invitation"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Invitation Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sendRegistrationLink"
                    name="invitationType"
                    checked={!inviteData.createAccounts}
                    onChange={() => setInviteData(prev => ({ ...prev, createAccounts: false }))}
                    className="text-blue-600"
                  />
                  <Label htmlFor="sendRegistrationLink" className="text-sm font-normal">
                    Send registration link (recommended for new users)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="createAccounts"
                    name="invitationType"
                    checked={inviteData.createAccounts}
                    onChange={() => setInviteData(prev => ({ ...prev, createAccounts: true }))}
                    className="text-blue-600"
                  />
                  <Label htmlFor="createAccounts" className="text-sm font-normal">
                    Create accounts automatically (sends login credentials)
                  </Label>
                </div>
              </div>
              
              {inviteData.createAccounts && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Accounts will be created with temporary passwords. 
                    Users will need to change their password on first login.
                  </p>
                </div>
              )}
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

      {/* Class Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedClassDetails?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClassDetails && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Class Name</Label>
                    <p className="text-lg font-medium">{selectedClassDetails.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge variant={selectedClassDetails.isActive ? "default" : "secondary"}>
                      {selectedClassDetails.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Instructor</Label>
                    <p>{selectedClassDetails.instructor?.firstName} {selectedClassDetails.instructor?.lastName}</p>
                    <p className="text-sm text-gray-600">{selectedClassDetails.instructor?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Enrollment</Label>
                    <p>{selectedClassDetails.studentCount || 0} / {selectedClassDetails.maxStudents} students</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                    <p>{selectedClassDetails.startDate ? new Date(selectedClassDetails.startDate).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">End Date</Label>
                    <p>{selectedClassDetails.endDate ? new Date(selectedClassDetails.endDate).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  {isAdmin && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Enrollment Code</Label>
                      <p className="font-mono bg-gray-100 p-2 rounded">{selectedClassDetails.enrollmentCode}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedClassDetails.description || 'No description provided'}</p>
                </div>
              </div>

              {/* Class Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Class Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedClassDetails.studentCount || 0}</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedClassDetails.assignments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Assignments</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedClassDetails.completionRate || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedClassDetails.averageScore || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDetailsDialog(false);
                        setSelectedClass(selectedClassDetails);
                        setShowInviteDialog(true);
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Invite Students
                    </Button>
                  )}
                  {selectedClassDetails.isEnrolled && !isAdmin && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowDetailsDialog(false);
                        handleLeaveClass(selectedClassDetails.id);
                      }}
                    >
                      Leave Class
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Navigate to assignments page for this class
                      window.location.href = `/assignments?classId=${selectedClassDetails.id}`;
                    }}
                  >
                    View Assignments
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 