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
  allowLateSubmission?: boolean;
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
        case 'inactive':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
        default:
          return 'bg-white/5 text-foreground dark:bg-gray-900/20 dark:text-gray-200';
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
        return 'bg-white/5 text-foreground dark:bg-gray-900/20 dark:text-gray-200';
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
        case 'inactive':
          return 'Inactive';
        default:
          return 'Active';
      }
    }

    // Fallback to submission status
    return assignment.submissionStatus || 'Pending';
  };

  const canSubmitAssignment = (assignment: Assignment) => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const deadline = new Date(assignment.deadline);

    // Cannot submit before start time
    if (now < startDate) return false;

    // If late submissions are allowed, can submit anytime after start
    if (assignment.allowLateSubmission) {
      return true;
    }

    // If late submissions are not allowed, can only submit before deadline
    return now <= deadline;
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
        return 'bg-white/5 text-foreground dark:bg-gray-900/20 dark:text-gray-200';
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
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-violet/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 pt-24 pb-12 border-b border-white/5 bg-background/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-neon-cyan mb-4 mono-font">
                <Target className="h-3 w-3" />
                <span>Mission Pipeline</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">
                Curriculum <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet">Assignments</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Execute your learning objectives and track your progress through the technical curriculum.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-white/5 backdrop-blur-md">
              <div className="text-center px-4 py-2 border-r border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">Active</div>
                <div className="text-xl font-bold mono-font text-neon-cyan">{assignments.filter(a => a.isActive).length}</div>
              </div>
              <div className="text-center px-4 py-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">Completed</div>
                <div className="text-xl font-bold mono-font text-neon-emerald">{assignments.filter(a => a.submissionStatus === 'graded' || a.submissionStatus === 'accepted').length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Control Center / Filters */}
      <div className="relative z-10 border-b border-white/5 bg-black/10 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md group">
              <div className="absolute inset-0 bg-neon-cyan/5 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-md"></div>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
              <Input
                placeholder="SEARCH_OBJECTIVES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-white/10 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 transition-all mono-font text-xs tracking-wider relative z-10"
              />
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-background/50 border-white/10 mono-font text-[10px] tracking-widest uppercase h-10">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="all">ALL_STATUS</SelectItem>
                  <SelectItem value="active">ACTIVE_ONLY</SelectItem>
                  <SelectItem value="submitted">SUBMITTED</SelectItem>
                  <SelectItem value="pending">PENDING_EXEC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Pipeline */}
      <main className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-24 glass-card border-dashed">
            <div className="p-4 bg-white/5 inline-flex rounded-full mb-6">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              ZERO_MATCHES_FOUND
            </h3>
            <p className="text-muted-foreground mono-font text-sm mb-8">
              Adjust your filtration criteria or synchronize your workspace.
            </p>
            <Button
              className="bg-neon-cyan text-black hover:bg-neon-cyan/90 shadow-[0_0_20px_rgba(0,255,255,0.2)] mono-font text-xs tracking-widest"
              onClick={() => router.push('/classes')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              BROWSE_CLASSES
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {/* Structural Connecting Line for large screens (simulated) */}
            <div className="hidden lg:block absolute top-0 left-1/2 bottom-0 w-[1px] bg-gradient-to-b from-white/10 to-transparent -z-10 transform -translate-x-1/2"></div>

            {filteredAssignments.map((assignment, index) => (
              <div
                key={assignment.id}
                className={`flex flex-col group`}
              >
                {/* Assignment Step Connector Animation */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-black flex items-center justify-center mono-font text-[10px] text-neon-cyan group-hover:border-neon-cyan/50 group-hover:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-neon-cyan/30 transition-all"></div>
                </div>

                <div className={`glass-card p-6 flex-1 flex flex-col transition-all duration-500 hover-glow-cyan ${isOverdue(assignment.deadline) ? 'border-neon-rose/40 hover-glow-amber' : ''
                  }`}>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2 mono-font">
                          {assignment.class?.name || 'GEN_CLASS'}
                        </div>
                        <h3 className="text-xl font-bold leading-tight group-hover:text-neon-cyan transition-colors line-clamp-2">
                          {assignment.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed">
                      {assignment.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest mono-font mb-1">Status</div>
                        <Badge className={`${getStatusColor(assignment)} mono-font text-[9px] tracking-widest uppercase border-0 px-1.5 h-auto py-0.5`}>
                          {getStatusText(assignment)}
                        </Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest mono-font mb-1">Severity</div>
                        <Badge className={`${getDifficultyColor(assignment.difficulty)} mono-font text-[9px] tracking-widest uppercase border-0 px-1.5 h-auto py-0.5`}>
                          {assignment.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-between text-[11px] mono-font">
                        <span className="text-muted-foreground uppercase tracking-tighter">Deadline</span>
                        <span className={`font-medium ${isOverdue(assignment.deadline) ? 'text-neon-rose' : 'text-foreground'}`}>
                          {formatDate(assignment.deadline)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mono-font">
                        <span className="text-muted-foreground uppercase tracking-tighter">Time_Rem</span>
                        <span className={`font-medium ${isOverdue(assignment.deadline) ? 'text-neon-rose' : 'text-neon-cyan'}`}>
                          {getTimeRemaining(assignment.deadline)}
                        </span>
                      </div>
                      {assignment.submissionScore && (
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] mono-font">
                          <span className="text-neon-emerald uppercase tracking-tighter font-bold">Grade_Out</span>
                          <span className="font-bold text-neon-emerald">{assignment.submissionScore} / {assignment.maxScore}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all mono-font text-[10px] tracking-widest h-10 px-0"
                      onClick={() => router.push(`/assignments/${assignment.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-2 text-neon-cyan" />
                      VIEW_DATA
                    </Button>

                    {!assignment.hasSubmission && canSubmitAssignment(assignment) && (
                      <Button
                        className="flex-1 bg-neon-cyan text-black hover:bg-neon-cyan/90 shadow-[0_0_15px_rgba(0,255,255,0.2)] mono-font text-[10px] tracking-widest h-10 px-0"
                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                      >
                        <Upload className="h-3 w-3 mr-2" />
                        EXEC_UP
                      </Button>
                    )}

                    {assignment.hasSubmission && (
                      <Button
                        variant="outline"
                        className="flex-1 border-neon-emerald/30 text-neon-emerald hover:bg-neon-emerald/10 mono-font text-[10px] tracking-widest h-10 px-0"
                        onClick={() => router.push(`/assignments/${assignment.id}`)}
                      >
                        <CheckCircle className="h-3 w-3 mr-2" />
                        SUB_SENT
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 