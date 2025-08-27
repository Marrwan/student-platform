'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  TrendingUp,
  Target,
  Upload,
  Eye,
  BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  class: {
    name: string;
  };
  type: string;
  difficulty: string;
  maxScore: number;
  startDate: string;
  deadline: string;
  requirements: string;
  isActive: boolean;
  isUnlocked: boolean;
  canSubmit?: boolean;
  getStatus?: string;
  isOverdue?: boolean;
  timeRemaining?: number;
  submissionStatus?: string;
  submissionScore?: number;
  hasSubmission?: boolean;
  submission?: {
    id: string;
    status: string;
    score?: number;
    submittedAt: string;
  };
}

export default function AssignmentsPage() {
  return (
    <ProtectedRoute>
      <AssignmentsList />
    </ProtectedRoute>
  );
}

function AssignmentsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    fetchAssignments();
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

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && assignment.isActive) ||
                         (statusFilter === 'submitted' && assignment.submission) ||
                         (statusFilter === 'pending' && !assignment.submission);
    const matchesClass = classFilter === 'all' || assignment.classId === classFilter;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  const getStatusColor = (assignment: Assignment) => {
    // Use backend status if available
    if (assignment.getStatus) {
      switch (assignment.getStatus) {
        case 'active':
          return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
        case 'not_started':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
        case 'overdue':
          return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
        case 'locked':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
        case 'inactive':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      }
    }
    
    // Fallback to submission status
    switch (assignment.submissionStatus) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'graded':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'late':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getStatusText = (assignment: Assignment) => {
    // Use backend status if available
    if (assignment.getStatus) {
      switch (assignment.getStatus) {
        case 'active':
          return 'Active';
        case 'not_started':
          return 'Not Started';
        case 'overdue':
          return 'Overdue';
        case 'locked':
          return 'Locked';
        case 'inactive':
          return 'Inactive';
        default:
          return 'Active';
      }
    }
    
    // Fallback to submission status
    return assignment.submissionStatus || 'Pending';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const formatDate = (dateString: string) => {
    if (!dateString || !isValidDate(dateString)) {
      return 'No deadline set';
    }
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (deadline: string) => {
    if (!deadline || !isValidDate(deadline)) return false;
    return new Date() > new Date(deadline);
  };

  const getTimeRemaining = (deadline: string) => {
    if (!deadline || !isValidDate(deadline)) {
      return 'No deadline';
    }
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Class Assignments</h1>
              <p className="text-gray-600 dark:text-gray-300">
                View and submit your class assignments
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <main className="container mx-auto px-4 py-8">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No assignments found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Join a class to see assignments'}
            </p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/classes')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Join a Class
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <Card 
                key={assignment.id} 
                className={`transition-all hover:shadow-lg ${
                  isOverdue(assignment.deadline) ? 'border-red-300 dark:border-red-700' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {assignment.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {assignment.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(assignment.difficulty)}>
                      {assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(assignment)}>
                      {getStatusText(assignment)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Class</span>
                    <span className="font-medium">{assignment.class?.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Max Score</span>
                    <span className="font-medium">{assignment.maxScore} points</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Deadline</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(assignment.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Time Left</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className={isOverdue(assignment.deadline) ? 'text-red-600 font-medium' : ''}>
                        {getTimeRemaining(assignment.deadline)}
                      </span>
                    </div>
                  </div>

                  {assignment.submissionScore && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Your Score</span>
                      <span className="font-medium text-green-600">{assignment.submissionScore}/{assignment.maxScore}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/assignments/${assignment.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {!assignment.hasSubmission && assignment.canSubmit && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit
                      </Button>
                    )}
                    
                    {assignment.hasSubmission && (
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        View Submission
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 