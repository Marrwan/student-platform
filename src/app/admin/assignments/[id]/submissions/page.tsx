'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Code,
  Download
} from 'lucide-react';
import { api } from '@/lib/api';

interface Submission {
  id: string;
  userId: string;
  assignmentId: string;
  submissionType: 'github' | 'code' | 'link' | 'zip';
  submissionLink?: string;
  codeSubmission?: {
    html: string;
    css: string;
    javascript: string;
  };
  zipFileUrl?: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  maxScore: number;
  deadline: string;
}

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [markingSubmission, setMarkingSubmission] = useState(false);
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [markData, setMarkData] = useState({
    score: '',
    feedback: '',
    status: 'reviewed'
  });

  useEffect(() => {
    if (assignmentId) {
      loadSubmissions();
    }
  }, [assignmentId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await api.getAssignmentSubmissions(assignmentId);
      setSubmissions(data.submissions);
      setAssignment(data.assignment);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      setMarkingSubmission(true);
      await api.markSubmission(assignmentId, selectedSubmission.id, {
        score: markData.score ? parseFloat(markData.score) : undefined,
        feedback: markData.feedback || undefined,
        status: markData.status
      });
      
      toast.success('Submission marked successfully');
      setMarkDialogOpen(false);
      setSelectedSubmission(null);
      setMarkData({ score: '', feedback: '', status: 'reviewed' });
      loadSubmissions(); // Reload to get updated data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark submission');
    } finally {
      setMarkingSubmission(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800">Reviewed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <ExternalLink className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'zip':
        return <Download className="w-4 h-4" />;
      case 'link':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
            <h1 className="text-2xl font-bold text-gray-900">
              Assignment Submissions
            </h1>
            {assignment && (
              <p className="text-gray-600 mt-1">
                {assignment.title} • {submissions.length} submissions
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Info */}
      {assignment && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Max Score: {assignment.maxScore} points
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {submissions.length} submissions
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
            <p className="text-gray-600 text-center">
              Students haven't submitted any work for this assignment yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {submission.user.firstName} {submission.user.lastName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {submission.user.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        {getSubmissionTypeIcon(submission.submissionType)}
                        <span className="text-sm text-gray-600 capitalize">
                          {submission.submissionType} submission
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(submission.status)}
                      {submission.score !== undefined && (
                        <span className="text-sm font-medium">
                          Score: {submission.score}/{assignment?.maxScore}
                        </span>
                      )}
                    </div>

                    {submission.feedback && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Feedback:</strong> {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setMarkData({
                          score: submission.score?.toString() || '',
                          feedback: submission.feedback || '',
                          status: submission.status
                        });
                        setMarkDialogOpen(true);
                      }}
                    >
                      {submission.status === 'pending' ? 'Mark' : 'Update'}
                    </Button>
                    
                    {submission.submissionLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(submission.submissionLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mark Submission Dialog */}
      <Dialog open={markDialogOpen} onOpenChange={setMarkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Submission</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max={assignment?.maxScore}
                  value={markData.score}
                  onChange={(e) => setMarkData(prev => ({ ...prev, score: e.target.value }))}
                  placeholder={`0-${assignment?.maxScore}`}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={markData.status}
                  onValueChange={(value) => setMarkData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={markData.feedback}
                  onChange={(e) => setMarkData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Provide feedback to the student..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleMarkSubmission}
                  disabled={markingSubmission}
                  className="flex-1"
                >
                  {markingSubmission ? 'Marking...' : 'Mark Submission'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMarkDialogOpen(false)}
                  disabled={markingSubmission}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
