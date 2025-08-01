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
import { Calendar, Clock, FileText, Code, Github, Download, Plus, Search, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'html' | 'css' | 'javascript' | 'fullstack' | 'other';
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  maxScore: number;
  startDate: string;
  deadline: string;
  isUnlocked: boolean;
  isActive: boolean;
  requirements: string;
  sampleOutput?: string;
  starterCode?: {
    html: string;
    css: string;
    javascript: string;
  };
  hints?: string;
  submissionTypes: string[];
  latePenalty: number;
  allowLateSubmission: boolean;
  maxLateHours: number;
  requirePayment: boolean;
  lateFeeAmount: number;
  class: {
    id: string;
    name: string;
    enrollmentCode: string;
  };
  submissionStatus?: 'not_submitted' | 'pending' | 'reviewed' | 'accepted' | 'rejected';
  submissionScore?: number;
  isOverdue?: boolean;
  timeRemaining?: number;
  canSubmit?: boolean;
}

interface CreateAssignmentData {
  title: string;
  description: string;
  classId: string;
  type: string;
  difficulty: string;
  maxScore: number;
  startDate: string;
  deadline: string;
  requirements: string;
  sampleOutput: string;
  submissionTypes: string[];
  latePenalty: number;
  allowLateSubmission: boolean;
  maxLateHours: number;
  requirePayment: boolean;
  lateFeeAmount: number;
}

interface Class {
  id: string;
  name: string;
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createData, setCreateData] = useState<CreateAssignmentData>({
    title: '',
    description: '',
    classId: '',
    type: 'fullstack',
    difficulty: 'easy',
    maxScore: 100,
    startDate: '',
    deadline: '',
    requirements: '',
    sampleOutput: '',
    submissionTypes: ['github', 'code', 'zip'],
    latePenalty: 10,
    allowLateSubmission: true,
    maxLateHours: 24,
    requirePayment: false,
    lateFeeAmount: 500
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'partial_admin';

  useEffect(() => {
    fetchAssignments();
    if (isAdmin) {
      fetchClasses();
    }
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.getAssignments();
      setAssignments(response.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.getClasses();
      setClasses(response.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      await api.createAssignment(createData);
      toast.success('Assignment created successfully');
      setShowCreateDialog(false);
      setCreateData({
        title: '',
        description: '',
        classId: '',
        type: 'fullstack',
        difficulty: 'easy',
        maxScore: 100,
        startDate: '',
        deadline: '',
        requirements: '',
        sampleOutput: '',
        submissionTypes: ['github', 'code', 'zip'],
        latePenalty: 10,
        allowLateSubmission: true,
        maxLateHours: 24,
        requirePayment: false,
        lateFeeAmount: 500
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleUnlockAssignment = async (assignmentId: string) => {
    try {
      await api.unlockAssignment(assignmentId);
      toast.success('Assignment unlocked successfully');
      fetchAssignments();
    } catch (error) {
      console.error('Error unlocking assignment:', error);
      toast.error('Failed to unlock assignment');
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submissionStatus === 'accepted') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
    } else if (assignment.submissionStatus === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    } else if (assignment.submissionStatus === 'pending') {
      return <Badge variant="secondary">Pending Review</Badge>;
    } else if (assignment.submissionStatus === 'reviewed') {
      return <Badge variant="outline">Reviewed</Badge>;
    } else if (assignment.isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (assignment.canSubmit) {
      return <Badge variant="default">Available</Badge>;
    } else {
      return <Badge variant="secondary">Locked</Badge>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining <= 0) return 'Overdue';
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && assignment.isActive) ||
                         (statusFilter === 'unlocked' && assignment.isUnlocked) ||
                         (statusFilter === 'overdue' && assignment.isOverdue) ||
                         (statusFilter === 'submitted' && assignment.submissionStatus && assignment.submissionStatus !== 'not_submitted');
    const matchesClass = classFilter === 'all' || assignment.class.id === classFilter;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-2">
            {isAdmin ? 'Manage assignments and track submissions' : 'View and submit your assignments'}
          </p>
        </div>
        
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search assignments..."
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
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="unlocked">Unlocked Only</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
          </SelectContent>
        </Select>
        
        {isAdmin && (
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600 text-center">
              {isAdmin 
                ? 'Create your first assignment to get started'
                : 'No assignments are currently available'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {assignment.description}
                    </CardDescription>
                  </div>
                  {getStatusBadge(assignment)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(assignment.difficulty)}>
                      {assignment.difficulty}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {assignment.maxScore} points
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Due {new Date(assignment.deadline).toLocaleDateString()}</span>
                  </div>
                  
                  {assignment.timeRemaining !== undefined && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatTimeRemaining(assignment.timeRemaining)}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <strong>Class:</strong> {assignment.class.name}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <strong>Type:</strong> {assignment.type}
                  </div>
                  
                  {assignment.submissionScore !== undefined && (
                    <div className="text-sm text-gray-600">
                      <strong>Score:</strong> {assignment.submissionScore}/{assignment.maxScore}
                    </div>
                  )}
                  
                  {assignment.requirePayment && assignment.isOverdue && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Late fee: ₦{assignment.lateFeeAmount}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  
                  {isAdmin && !assignment.isUnlocked && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnlockAssignment(assignment.id)}
                    >
                      Unlock
                    </Button>
                  )}
                  
                  {assignment.canSubmit && !assignment.submissionStatus && (
                    <Button size="sm" className="flex-1">
                      Submit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for your class with detailed requirements and settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Assignment Title</Label>
              <Input
                id="title"
                value={createData.title}
                onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createData.description}
                onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter assignment description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="classId">Class</Label>
                <Select value={createData.classId} onValueChange={(value) => setCreateData(prev => ({ ...prev, classId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={createData.type} onValueChange={(value) => setCreateData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="fullstack">Full Stack</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={createData.difficulty} onValueChange={(value) => setCreateData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="maxScore">Max Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={createData.maxScore}
                  onChange={(e) => setCreateData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                  min="1"
                  max="1000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={createData.startDate}
                  onChange={(e) => setCreateData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={createData.deadline}
                  onChange={(e) => setCreateData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={createData.requirements}
                onChange={(e) => setCreateData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="Enter detailed requirements"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="sampleOutput">Sample Output (Optional)</Label>
              <Textarea
                id="sampleOutput"
                value={createData.sampleOutput}
                onChange={(e) => setCreateData(prev => ({ ...prev, sampleOutput: e.target.value }))}
                placeholder="Describe expected output or provide examples"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latePenalty">Late Penalty (%)</Label>
                <Input
                  id="latePenalty"
                  type="number"
                  value={createData.latePenalty}
                  onChange={(e) => setCreateData(prev => ({ ...prev, latePenalty: parseFloat(e.target.value) }))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              
              <div>
                <Label htmlFor="maxLateHours">Max Late Hours</Label>
                <Input
                  id="maxLateHours"
                  type="number"
                  value={createData.maxLateHours}
                  onChange={(e) => setCreateData(prev => ({ ...prev, maxLateHours: parseInt(e.target.value) }))}
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowLateSubmission"
                checked={createData.allowLateSubmission}
                onChange={(e) => setCreateData(prev => ({ ...prev, allowLateSubmission: e.target.checked }))}
              />
              <Label htmlFor="allowLateSubmission">Allow Late Submissions</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requirePayment"
                checked={createData.requirePayment}
                onChange={(e) => setCreateData(prev => ({ ...prev, requirePayment: e.target.checked }))}
              />
              <Label htmlFor="requirePayment">Require Payment for Late Submissions</Label>
            </div>
            
            {createData.requirePayment && (
              <div>
                <Label htmlFor="lateFeeAmount">Late Fee Amount (₦)</Label>
                <Input
                  id="lateFeeAmount"
                  type="number"
                  value={createData.lateFeeAmount}
                  onChange={(e) => setCreateData(prev => ({ ...prev, lateFeeAmount: parseFloat(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAssignment}>
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 