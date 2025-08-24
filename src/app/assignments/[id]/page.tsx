'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Code, 
  Link, 
  Upload, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Eye
} from 'lucide-react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { DeleteAssignmentModal } from '@/components/assignments/delete-assignment-modal';

interface Assignment {
  id: string;
  title: string;
  description: string;
  requirements: string;
  maxScore: number;
  startDate: string;
  deadline: string;
  submissionMode: 'code' | 'link' | 'both';
  sampleOutputUrl?: string;
  sampleOutputCode?: {
    html: string;
    css: string;
    javascript: string;
  };
  paymentRequired: boolean;
  paymentAmount: number;
  allowLateSubmission: boolean;
  latePenalty: number;
  classId: string;
  class: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  submissionType: 'code' | 'link' | 'zip';
  submissionLink?: string;
  codeSubmission?: {
    html: string;
    css: string;
    javascript: string;
  };
  score?: number;
  feedback?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);

  // Submission form data
  const [submissionData, setSubmissionData] = useState({
    submissionType: 'code' as 'code' | 'link' | 'zip',
    submissionLink: '',
    codeSubmission: {
      html: '',
      css: '',
      javascript: ''
    },
    zipFile: null as File | null
  });

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
      loadSubmission();
      loadCurrentUser();
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      const data = await api.getAssignment(assignmentId);
      console.log('Assignment data:', data); // Debug log
      setAssignment(data);
      
      // Load submission count for admin
      if (isAdmin()) {
        await loadSubmissionCount();
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      toast.error('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmission = async () => {
    try {
      // This would be implemented in the API
      // const data = await api.getMySubmission(assignmentId);
      // setSubmission(data);
    } catch (error) {
      console.error('Error loading submission:', error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const { user } = await api.getProfile();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadSubmissionCount = async () => {
    try {
      const submissions = await api.getAssignmentSubmissions(assignmentId);
      setSubmissionCount(submissions.data?.length || 0);
    } catch (error) {
      console.error('Error loading submission count:', error);
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      await api.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      router.push('/admin/assignments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = {
        ...submissionData,
        zipFile: submissionData.zipFile || undefined
      };
      await api.submitAssignment(assignmentId, submitData);
      toast.success('Assignment submitted successfully!');
      loadSubmission();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const isDeadlinePassed = () => {
    if (!assignment) return false;
    return new Date() > new Date(assignment.deadline);
  };

  const canSubmit = () => {
    if (!assignment) return false;
    if (isDeadlinePassed() && !assignment.allowLateSubmission) return false;
    return true;
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'partial_admin';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>Assignment not found or you don't have access to it.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8 gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {assignment.title}
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                {assignment.class.name}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            {submission && getStatusBadge(submission.status)}
            {isDeadlinePassed() && (
              <Badge variant="destructive">
                Deadline Passed
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full h-auto lg:h-10 ${isAdmin() ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="details" className="text-xs lg:text-sm">Details</TabsTrigger>
            <TabsTrigger value="sample" className="text-xs lg:text-sm">Sample Output</TabsTrigger>
            {!isAdmin() && (
              <TabsTrigger value="submit" className="text-xs lg:text-sm">Submit</TabsTrigger>
            )}
            {isAdmin() && (
              <TabsTrigger value="submissions" className="text-xs lg:text-sm">Submissions</TabsTrigger>
            )}
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{assignment.requirements}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                                          <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Start: {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Deadline: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Max Score: {assignment.maxScore} points
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Submission: {assignment.submissionMode}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {assignment.paymentRequired && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Late Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">
                        Late submissions require payment of ₦{assignment.paymentAmount}
                      </p>
                      <Badge variant="outline">Payment Required</Badge>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Sample Output Tab */}
          <TabsContent value="sample" className="space-y-6">
            {assignment.sampleOutputUrl && assignment.sampleOutputUrl.trim() !== '' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sample Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <ExternalLink className="w-4 h-4" />
                    <span className="font-medium">Sample Output URL</span>
                  </div>
                  <a 
                    href={assignment.sampleOutputUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {assignment.sampleOutputUrl}
                  </a>
                </CardContent>
              </Card>
            ) : assignment.sampleOutputCode && (
              assignment.sampleOutputCode.html || 
              assignment.sampleOutputCode.css || 
              assignment.sampleOutputCode.javascript
            ) ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sample Output Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <style>${assignment.sampleOutputCode.css || ''}</style>
                        </head>
                        <body>
                          ${assignment.sampleOutputCode.html || ''}
                          <script>${assignment.sampleOutputCode.javascript || ''}</script>
                        </body>
                        </html>
                      `}
                      className="w-full h-full min-h-[350px] border rounded"
                      title="Sample Output Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Eye className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Sample Output</h3>
                  <p className="text-gray-600 text-center">
                    No sample output has been provided for this assignment.
                  </p>
                  {isAdmin() && (
                    <div className="mt-4">
                      <Button 
                        onClick={() => router.push(`/admin/assignments/${assignmentId}/edit`)}
                        variant="outline"
                      >
                        Edit Assignment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submit Tab */}
          <TabsContent value="submit" className="space-y-6">
            {submission ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Submission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    {getStatusBadge(submission.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Submitted</span>
                    <span className="text-sm">{new Date(submission.submittedAt).toLocaleString()}</span>
                  </div>
                  {submission.score && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="text-sm font-medium">{submission.score}/{assignment.maxScore}</span>
                    </div>
                  )}
                  {submission.feedback && (
                    <div>
                      <span className="text-sm text-gray-600">Feedback</span>
                      <p className="text-sm mt-1">{submission.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  {!canSubmit() ? (
                    <Alert>
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        {isDeadlinePassed() 
                          ? 'The deadline has passed and late submissions are not allowed.'
                          : 'You cannot submit this assignment at this time.'
                        }
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="submissionType">Submission Type</Label>
                        <select
                          id="submissionType"
                          value={submissionData.submissionType}
                          onChange={(e) => setSubmissionData(prev => ({ 
                            ...prev, 
                            submissionType: e.target.value as 'code' | 'link' | 'zip' 
                          }))}
                          className="w-full p-2 border rounded-md"
                        >
                          {assignment.submissionMode === 'both' && (
                            <>
                              <option value="code">Code Submission</option>
                              <option value="link">Link Submission</option>
                              <option value="zip">File Upload</option>
                            </>
                          )}
                          {assignment.submissionMode === 'code' && (
                            <option value="code">Code Submission</option>
                          )}
                          {assignment.submissionMode === 'link' && (
                            <option value="link">Link Submission</option>
                          )}
                        </select>
                      </div>

                      {submissionData.submissionType === 'link' && (
                        <div>
                          <Label htmlFor="submissionLink">Submission Link</Label>
                          <Input
                            id="submissionLink"
                            type="url"
                            value={submissionData.submissionLink}
                            onChange={(e) => setSubmissionData(prev => ({ 
                              ...prev, 
                              submissionLink: e.target.value 
                            }))}
                            placeholder="https://github.com/your-repo or https://your-demo.com"
                            required
                          />
                        </div>
                      )}

                      {submissionData.submissionType === 'code' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="html">HTML</Label>
                            <Textarea
                              id="html"
                              value={submissionData.codeSubmission.html}
                              onChange={(e) => setSubmissionData(prev => ({ 
                                ...prev, 
                                codeSubmission: { 
                                  ...prev.codeSubmission, 
                                  html: e.target.value 
                                } 
                              }))}
                              placeholder="Enter your HTML code"
                              rows={6}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="css">CSS</Label>
                            <Textarea
                              id="css"
                              value={submissionData.codeSubmission.css}
                              onChange={(e) => setSubmissionData(prev => ({ 
                                ...prev, 
                                codeSubmission: { 
                                  ...prev.codeSubmission, 
                                  css: e.target.value 
                                } 
                              }))}
                              placeholder="Enter your CSS code"
                              rows={6}
                            />
                          </div>
                          <div>
                            <Label htmlFor="javascript">JavaScript</Label>
                            <Textarea
                              id="javascript"
                              value={submissionData.codeSubmission.javascript}
                              onChange={(e) => setSubmissionData(prev => ({ 
                                ...prev, 
                                codeSubmission: { 
                                  ...prev.codeSubmission, 
                                  javascript: e.target.value 
                                } 
                              }))}
                              placeholder="Enter your JavaScript code"
                              rows={6}
                            />
                          </div>
                        </div>
                      )}

                      {submissionData.submissionType === 'zip' && (
                        <div>
                          <Label htmlFor="zipFile">Upload File</Label>
                          <Input
                            id="zipFile"
                            type="file"
                            accept=".zip"
                            onChange={(e) => setSubmissionData(prev => ({ 
                              ...prev, 
                              zipFile: e.target.files?.[0] || null 
                            }))}
                            required
                          />
                        </div>
                      )}

                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Submitting...' : 'Submit Assignment'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submissions Tab (Admin Only) */}
          {isAdmin() && (
            <TabsContent value="submissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-6 border rounded-lg">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Submissions</h3>
                      <p className="text-gray-600 mb-4">
                        View and manage all student submissions for this assignment.
                      </p>
                      <Button 
                        onClick={() => router.push(`/admin/assignments/${assignmentId}/submissions`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View Submissions
                      </Button>
                    </div>
                    
                    <div className="text-center p-6 border rounded-lg">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Edit Assignment</h3>
                      <p className="text-gray-600 mb-4">
                        Modify assignment details, requirements, and settings.
                      </p>
                      <Button 
                        onClick={() => router.push(`/admin/assignments/${assignmentId}/edit`)}
                        variant="outline"
                      >
                        Edit Assignment
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
                      <p className="text-gray-600 mb-4">
                        Permanently delete this assignment and all related data.
                      </p>
                      <Button 
                        onClick={() => setShowDeleteModal(true)}
                        variant="destructive"
                      >
                        Delete Assignment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Delete Assignment Modal */}
      <DeleteAssignmentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAssignment}
        assignmentTitle={assignment?.title || ''}
        submissionCount={submissionCount}
      />
    </div>
  );
}
