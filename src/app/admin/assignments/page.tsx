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
import {
  Plus,
  Code,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  FileText,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Bell
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  type: 'html' | 'css' | 'js' | 'full-stack';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  startDate: string;
  deadline: string;
  isLocked: boolean;
  isActive: boolean;
  maxScore: number;
  lateFee: number;
  submissions: number;
  averageScore: number;
  completionRate: number;
  sampleOutput?: string;
  requirements: string[];
  learningObjectives: string[];
}

interface Class {
  id: string;
  name: string;
  level: string;
  currentStudents: number;
}

export default function AssignmentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AssignmentsManagement />
    </ProtectedRoute>
  );
}

function AssignmentsManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(null);
  const [resendingNotification, setResendingNotification] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    type: 'full-stack' as const,
    difficulty: 'beginner' as const,
    startDate: '',
    deadline: '',
    maxScore: 100,
    lateFee: 500,
    requirements: [''],
    learningObjectives: [''],
    sampleOutput: ''
  });

  useEffect(() => {
    loadAssignments();
    loadClasses();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAdminAssignments();
      setAssignments(response.assignments);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingAssignment(assignmentId);
      await api.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully!');
      loadAssignments(); // Reload the list
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setDeletingAssignment(null);
    }
  };

  const handleResendNotification = async (assignmentId: string) => {
    try {
      setResendingNotification(assignmentId);
      const result = await api.resendAssignmentNotification(assignmentId);
      toast.success(result.message || 'Notification resent successfully!');
    } catch (error: any) {
      console.error('Error resending notification:', error);
      toast.error(error.response?.data?.message || 'Failed to resend notification');
    } finally {
      setResendingNotification(null);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await api.getAdminClasses();
      setClasses(response.classes);
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses([]); // Set empty array instead of mock data
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminAssignment(formData);
      toast.success('Assignment created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        classId: '',
        type: 'full-stack',
        difficulty: 'beginner',
        startDate: '',
        deadline: '',
        maxScore: 100,
        lateFee: 500,
        requirements: [''],
        learningObjectives: [''],
        sampleOutput: ''
      });
      loadAssignments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({
      ...formData,
      requirements: newRequirements
    });
  };

  const addLearningObjective = () => {
    setFormData({
      ...formData,
      learningObjectives: [...formData.learningObjectives, '']
    });
  };

  const removeLearningObjective = (index: number) => {
    setFormData({
      ...formData,
      learningObjectives: formData.learningObjectives.filter((_, i) => i !== index)
    });
  };

  const updateLearningObjective = (index: number, value: string) => {
    const newObjectives = [...formData.learningObjectives];
    newObjectives[index] = value;
    setFormData({
      ...formData,
      learningObjectives: newObjectives
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'html':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'css':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'js':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'full-stack':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Assignments Error</h1><p>{error}</p><button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={loadAssignments}>Retry</button></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Assignment Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Create and manage assignments for your classes
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <Input placeholder="Search assignments..." className="flex-1" />
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="js">JavaScript</SelectItem>
                  <SelectItem value="full-stack">Full Stack</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
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
                  <SelectItem value="locked">Locked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {assignment.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getTypeColor(assignment.type)}>
                          {assignment.type.toUpperCase()}
                        </Badge>
                        <Badge className={getDifficultyColor(assignment.difficulty)}>
                          {assignment.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Class</span>
                        <p className="font-medium">{assignment.className}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submissions</span>
                        <p className="font-medium">{assignment.submissions}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Score</span>
                        <p className="font-medium">{assignment.averageScore}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completion</span>
                        <p className="font-medium">{assignment.completionRate}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{assignment.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${assignment.completionRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date</span>
                        <span>{formatDate(assignment.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deadline</span>
                        <span>{formatDate(assignment.deadline)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Late Fee</span>
                        <span>₦{assignment.lateFee}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/assignments/${assignment.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        disabled={deletingAssignment === assignment.id}
                      >
                        {deletingAssignment === assignment.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendNotification(assignment.id)}
                        disabled={resendingNotification === assignment.id}
                        title="Resend Notification"
                      >
                        {resendingNotification === assignment.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Templates</CardTitle>
                <CardDescription>
                  Pre-built assignment templates for quick creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">Calculator</CardTitle>
                      <CardDescription>Basic JavaScript calculator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge variant="outline">JavaScript</Badge>
                        <Badge variant="outline">Beginner</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">Todo List</CardTitle>
                      <CardDescription>CRUD operations with React</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge variant="outline">React</Badge>
                        <Badge variant="outline">Intermediate</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base">Portfolio</CardTitle>
                      <CardDescription>Responsive portfolio website</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge variant="outline">Full Stack</Badge>
                        <Badge variant="outline">Advanced</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {assignments.filter(a => a.isActive).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {assignments.reduce((sum, a) => sum + a.submissions, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all assignments
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
                    {Math.round(assignments.reduce((sum, a) => sum + a.completionRate, 0) / assignments.length)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all assignments
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
                    {Math.round(assignments.reduce((sum, a) => sum + a.averageScore, 0) / assignments.length)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all assignments
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Assignment</CardTitle>
              <CardDescription>
                Set up a new assignment with requirements and learning objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAssignment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classId">Class</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) => setFormData({ ...formData, classId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="css">CSS</SelectItem>
                        <SelectItem value="js">JavaScript</SelectItem>
                        <SelectItem value="full-stack">Full Stack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
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
                    <Label htmlFor="maxScore">Max Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      value={formData.maxScore}
                      onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lateFee">Late Fee (₦)</Label>
                    <Input
                      id="lateFee"
                      type="number"
                      value={formData.lateFee}
                      onChange={(e) => setFormData({ ...formData, lateFee: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampleOutput">Sample Output URL (Optional)</Label>
                  <Input
                    id="sampleOutput"
                    type="url"
                    placeholder="https://example.com/sample-output"
                    value={formData.sampleOutput}
                    onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Requirements</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addRequirement}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder="Enter requirement"
                        required
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeRequirement(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Learning Objectives</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addLearningObjective}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {formData.learningObjectives.map((obj, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={obj}
                        onChange={(e) => updateLearningObjective(index, e.target.value)}
                        placeholder="Enter learning objective"
                        required
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeLearningObjective(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Create Assignment
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
    </div>
  );
} 