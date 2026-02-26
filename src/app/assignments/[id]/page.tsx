'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Eye,
  Edit,
  DollarSign,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { DeleteAssignmentModal } from '@/components/assignments/delete-assignment-modal';
import { DeleteSubmissionAlertDialog } from '@/components/assignments/delete-submission-alert-dialog';

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
  // Backend model methods
  canSubmit?: boolean;
  getStatus?: string;
  isOverdue?: boolean;
  timeRemaining?: number;
  isAvailable?: boolean;
  // Submission info
  submissionStatus?: string;
  submissionScore?: number;
  hasSubmission?: boolean;
}

interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  submissionType: 'code' | 'link' | 'zip';
  githubLink?: string;
  submissionLink?: string;
  codeSubmission?: {
    html: string;
    css: string;
    javascript: string;
  };
  score?: number;
  feedback?: string;
  status: 'pending' | 'reviewed' | 'accepted';
  submittedAt: string;
  reviewedAt?: string;
  requestCorrection?: boolean;
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = params.id as string;
  const paymentReturnHandled = useRef(false);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSubmissionModal, setShowDeleteSubmissionModal] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [canEdit, setCanEdit] = useState(false);
  const [editReason, setEditReason] = useState('');

  const [previewKey, setPreviewKey] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Submission form data
  const [submissionData, setSubmissionData] = useState({
    submissionType: 'code' as 'github' | 'code' | 'link' | 'zip',
    githubLink: '',
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

  // Handle return from Paystack redirect: verify payment when ?reference= or ?trxref= is present (Paystack uses trxref)
  useEffect(() => {
    const reference = searchParams.get('reference') ?? searchParams.get('trxref');
    if (!reference || paymentReturnHandled.current) return;

    paymentReturnHandled.current = true;

    const verifyAndUnlock = async () => {
      try {
        const result = await api.verifyPayment(reference);
        if (result.success) {
          toast.success('Payment successful! You can now submit your assignment.');
          setHasPaid(true);
          await loadSubmission();
        } else {
          toast.error(result.message || 'Payment verification failed.');
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to verify payment');
      } finally {
        // Clean URL so refreshing doesn't re-trigger verify
        const url = new URL(window.location.href);
        url.searchParams.delete('reference');
        url.searchParams.delete('trxref');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    };

    verifyAndUnlock();
  }, [searchParams, assignmentId]);

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
      const response = await api.getMySubmission(assignmentId);
      const canEditResponse = await api.canEditSubmission(assignmentId);

      console.log('Submission response:', response);
      console.log('Can edit response:', canEditResponse);

      if (response && response.submission) {
        // Parse codeSubmission if it's a string
        if (typeof response.submission.codeSubmission === 'string') {
          try {
            response.submission.codeSubmission = JSON.parse(response.submission.codeSubmission);
          } catch (e) {
            console.error('Error parsing codeSubmission:', e);
          }
        }
        setSubmission(response.submission);
      } else {
        // No submission exists yet - this is normal for new students
        setSubmission(null);
      }

      // Update hasPaid state from response
      if (response && response.hasPaid) {
        setHasPaid(true);
      }

      setCanEdit(canEditResponse.canEdit);
      setEditReason(canEditResponse.reason);

      console.log('Final state - submission:', response?.submission || null);
      console.log('Final state - canEdit:', canEditResponse.canEdit);
      console.log('Final state - canSubmit():', canSubmit());
    } catch (error: any) {
      console.error('Error loading submission:', error);
      // If there's a real error, still allow submission if deadline hasn't passed
      setSubmission(null);
      setHasPaid(false);
      setCanEdit(true);
      setEditReason('No submission found - you can submit');
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

  const handleDeleteSubmission = async () => {
    if (!submission) return;
    try {
      await api.deleteAssignmentSubmission(assignmentId, submission.id);
      toast.success('Submission deleted successfully');
      setSubmission(null);
      setSubmissionData({
        submissionType: 'code',
        githubLink: '',
        submissionLink: '',
        codeSubmission: { html: '', css: '', javascript: '' },
        zipFile: null
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete submission');
    }
  };

  const handleLateFeePayment = async () => {
    if (!currentUser || !assignment) return;

    try {
      setPaymentLoading(true);

      // 1. Initialize payment on backend (returns authorization_url and sets callback_url for return)
      const initResponse = await api.initializeLateFeePayment({
        assignmentId: assignmentId,
        amount: assignment.paymentAmount,
      });

      const authorizationUrl = initResponse.paystack?.data?.authorization_url;
      if (!authorizationUrl) {
        toast.error('Payment could not be started. Please try again.');
        setPaymentLoading(false);
        return;
      }

      // 2. Redirect to Paystack checkout (no inline/popup script needed; avoids invalid_Key and form errors)
      window.location.href = authorizationUrl;
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
      setPaymentLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log('Starting submission with data:', submissionData);

      // Validate form data
      if (!submissionData.submissionType) {
        toast.error('Please select a submission type');
        setSubmitting(false);
        return;
      }

      // Validate based on submission type
      if (submissionData.submissionType === 'code') {
        if (!submissionData.codeSubmission.html.trim()) {
          toast.error('HTML code is required for code submissions');
          setSubmitting(false);
          return;
        }
      } else if (submissionData.submissionType === 'link') {
        if (!submissionData.submissionLink?.trim()) {
          toast.error('Submission link is required for link submissions');
          setSubmitting(false);
          return;
        }
      } else if (submissionData.submissionType === 'github') {
        if (!submissionData.githubLink?.trim()) {
          toast.error('GitHub link is required for GitHub submissions');
          setSubmitting(false);
          return;
        }
      } else if (submissionData.submissionType === 'zip') {
        if (!submissionData.zipFile) {
          toast.error('ZIP file is required for file uploads');
          setSubmitting(false);
          return;
        }
      }

      // Prepare submit data based on submission type
      let submitData: any = {
        submissionType: submissionData.submissionType
      };

      // Add fields based on submission type
      if (submissionData.submissionType === 'code') {
        submitData.codeSubmission = submissionData.codeSubmission;
      } else if (submissionData.submissionType === 'link') {
        submitData.submissionLink = submissionData.submissionLink;
      } else if (submissionData.submissionType === 'github') {
        submitData.githubLink = submissionData.githubLink;
      } else if (submissionData.submissionType === 'zip') {
        submitData.zipFile = submissionData.zipFile || undefined;
      }

      console.log('Prepared submit data:', submitData);

      if (submission && canEdit) {
        // Update existing submission
        console.log('Updating existing submission...');
        const result = await api.updateSubmission(assignmentId, submitData);
        console.log('Update result:', result);
        toast.success('Assignment updated successfully!');
      } else {
        // Submit new submission
        console.log('Submitting new submission...');
        const result = await api.submitAssignment(assignmentId, submitData);
        console.log('Submit result:', result);
        toast.success('Assignment submitted successfully!');
      }

      // Clear cache and reload submission
      api.clearCache(`my-submission:${assignmentId}`);
      await loadSubmission();
    } catch (error: any) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit assignment';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const isDeadlinePassed = () => {
    if (!assignment) return false;
    return assignment.isOverdue || new Date() > new Date(assignment.deadline);
  };

  const canSubmit = () => {
    if (!assignment) return false;

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

  const getSubmissionMessage = () => {
    if (!assignment) return '';

    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const deadline = new Date(assignment.deadline);

    if (now < startDate) {
      return `Assignment has not started yet. Start time: ${startDate.toLocaleString()}`;
    } else if (now > deadline && !assignment.allowLateSubmission) {
      return 'Assignment deadline has passed and late submissions are not allowed';
    } else if (now > deadline && assignment.allowLateSubmission) {
      return 'Assignment deadline has passed. Late submission is allowed but may require payment.';
    }

    return '';
  };

  const getAssignmentStatus = () => {
    if (!assignment) return 'unknown';
    return assignment.getStatus || 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'not_started':
        return <Badge className="bg-blue-100 text-blue-800">Not Started</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'locked':
        return <Badge className="bg-gray-100 text-gray-800">Locked</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800">Reviewed</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'instructor' || currentUser?.role === 'staff';
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
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="shrink-0 h-10 w-10 p-0 sm:h-9 sm:w-auto sm:px-3"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {assignment.title}
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                {assignment.class.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {submission && getSubmissionStatusBadge(submission.status)}
            {isDeadlinePassed() && (
              <Badge variant="destructive">
                Deadline Passed
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full h-auto ${isAdmin() ? 'grid-cols-4' : 'grid-cols-3'} gap-1 p-1`}>
            <TabsTrigger value="details" className="text-xs sm:text-sm py-2">Details</TabsTrigger>
            <TabsTrigger value="sample" className="text-xs sm:text-sm py-2">Sample Output</TabsTrigger>
            {!isAdmin() && (
              <TabsTrigger value="submit" className="text-xs sm:text-sm py-2">Submit</TabsTrigger>
            )}
            {isAdmin() && (
              <TabsTrigger value="submissions" className="text-xs sm:text-sm py-2">Submissions</TabsTrigger>
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
                    <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{assignment.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{assignment.requirements}</p>
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
                      <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-sm text-gray-600">
                        Start: {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-sm text-gray-600">
                        Deadline: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-sm text-gray-600">
                        Max Score: {assignment.maxScore} points
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-gray-500 shrink-0" />
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
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span className="font-medium">Sample Output URL</span>
                  </div>
                  <a
                    href={assignment.sampleOutputUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all text-sm sm:text-base"
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
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-4 min-h-[300px] sm:min-h-[400px]">
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1">
                          <style>${assignment.sampleOutputCode.css || ''}</style>
                        </head>
                        <body>
                          ${assignment.sampleOutputCode.html || ''}
                          <script>${assignment.sampleOutputCode.javascript || ''}</script>
                        </body>
                        </html>
                      `}
                      className="w-full h-full min-h-[250px] sm:min-h-[350px] border rounded"
                      title="Sample Output Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <Eye className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">No Sample Output</h3>
                  <p className="text-gray-600 text-center text-sm sm:text-base">
                    No sample output has been provided for this assignment.
                  </p>
                  {isAdmin() && (
                    <div className="mt-4">
                      <Button
                        onClick={() => router.push(`/admin/assignments/${assignmentId}/edit`)}
                        variant="outline"
                        size="sm"
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
            {submission && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Submission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-sm text-gray-600">Status</span>
                    {getSubmissionStatusBadge(submission.status)}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-sm text-gray-600">Submitted</span>
                    <span className="text-sm">{new Date(submission.submittedAt).toLocaleString()}</span>
                  </div>
                  {submission.score && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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

                  {/* Submission Preview */}
                  {submission.submissionType === 'code' && submission.codeSubmission && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-3 sm:px-4 py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Your Code Output</span>
                      </div>
                      <div className="bg-white p-2 sm:p-4">
                        <iframe
                          key={`submission-preview-${submission.id}`}
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <style>${submission.codeSubmission.css || ''}</style>
                              </head>
                              <body>
                                ${submission.codeSubmission.html || ''}
                                <script>${submission.codeSubmission.javascript || ''}</script>
                              </body>
                            </html>
                          `}
                          className="w-full h-48 sm:h-64 border-0 rounded"
                          title="Submission Preview"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  )}

                  {submission.submissionType === 'link' && submission.submissionLink && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-3 sm:px-4 py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">Your Deployed Site</span>
                      </div>
                      <div className="bg-white p-2 sm:p-4">
                        <iframe
                          key={`submission-link-${submission.id}`}
                          src={submission.submissionLink}
                          className="w-full h-48 sm:h-64 border-0 rounded"
                          title="Link Preview"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        />
                      </div>
                    </div>
                  )}

                  {/* Delete Submission Section */}
                  <div className="pt-4 border-t flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteSubmissionModal(true)}
                    >
                      Delete Submission
                    </Button>
                  </div>
                  {/* Edit Submission Section */}
                  <div className="pt-4 border-t">
                    {canEdit ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-sm text-green-700 font-medium">You can edit your submission</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Use the form below to update your submission. Your changes will be saved when you click "Update Submission".
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span className="text-sm text-red-700 font-medium">Editing not allowed</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {editReason || 'You cannot edit this submission at this time.'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submission Form - Show for new submissions or when can edit existing */}
            {isDeadlinePassed() && assignment?.paymentRequired && !hasPaid && !submission ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    Late Submission Fee Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      The deadline for this assignment has passed. To submit your work, you are required to pay a late fee.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-medium text-gray-700 mb-2">Late Fee Amount</p>
                    <p className="text-3xl font-bold text-green-600 mb-6">₦{assignment.paymentAmount?.toLocaleString()}</p>

                    <Button
                      onClick={handleLateFeePayment}
                      disabled={paymentLoading}
                      className="w-full sm:w-auto min-w-[200px] bg-green-600 hover:bg-green-700"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Pay Now
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      After successful payment, the submission form will be unlocked immediately.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (canSubmit() || canEdit) ? (
              <Card>
                <CardHeader>
                  <CardTitle>{submission ? 'Edit Submission' : 'Submit Assignment'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!canSubmit() && !submission ? (
                    <Alert>
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        {getSubmissionMessage()}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {submission && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Edit className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="text-sm font-medium text-blue-800">Edit Your Submission</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            You have already submitted this assignment. You can modify your submission below and click "Update Submission" to save your changes.
                          </p>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="submissionType" className="text-sm sm:text-base">Submission Type</Label>
                        <select
                          id="submissionType"
                          value={submissionData.submissionType}
                          onChange={(e) => setSubmissionData(prev => ({
                            ...prev,
                            submissionType: e.target.value as 'code' | 'link' | 'zip'
                          }))}
                          className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base"
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

                      {submissionData.submissionType === 'code' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="html" className="text-sm sm:text-base">HTML</Label>
                            <Textarea
                              id="html"
                              value={submissionData.codeSubmission.html}
                              onChange={(e) => {
                                setSubmissionData(prev => ({
                                  ...prev,
                                  codeSubmission: {
                                    ...prev.codeSubmission,
                                    html: e.target.value
                                  }
                                }));
                                setPreviewKey(prev => prev + 1);
                              }}
                              placeholder="Enter your HTML code"
                              rows={6}
                              className="text-sm sm:text-base"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="css" className="text-sm sm:text-base">CSS</Label>
                            <Textarea
                              id="css"
                              value={submissionData.codeSubmission.css}
                              onChange={(e) => {
                                setSubmissionData(prev => ({
                                  ...prev,
                                  codeSubmission: {
                                    ...prev.codeSubmission,
                                    css: e.target.value
                                  }
                                }));
                                setPreviewKey(prev => prev + 1);
                              }}
                              placeholder="Enter your CSS code"
                              rows={6}
                              className="text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <Label htmlFor="javascript" className="text-sm sm:text-base">JavaScript</Label>
                            <Textarea
                              id="javascript"
                              value={submissionData.codeSubmission.javascript}
                              onChange={(e) => {
                                setSubmissionData(prev => ({
                                  ...prev,
                                  codeSubmission: {
                                    ...prev.codeSubmission,
                                    javascript: e.target.value
                                  }
                                }));
                                setPreviewKey(prev => prev + 1);
                              }}
                              placeholder="Enter your JavaScript code"
                              rows={6}
                              className="text-sm sm:text-base"
                            />
                          </div>

                          {/* Live Preview for Code */}
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-3 sm:px-4 py-2 border-b">
                              <Label className="text-sm font-medium text-gray-700">Live Preview</Label>
                            </div>
                            <div className="bg-white p-2 sm:p-4">
                              <iframe
                                key={`preview-${previewKey}`}
                                srcDoc={`
                                  <!DOCTYPE html>
                                  <html>
                                    <head>
                                      <meta charset="utf-8">
                                      <meta name="viewport" content="width=device-width, initial-scale=1">
                                      <style>${submissionData.codeSubmission.css}</style>
                                    </head>
                                    <body>
                                      ${submissionData.codeSubmission.html}
                                      <script>${submissionData.codeSubmission.javascript}</script>
                                    </body>
                                  </html>
                                `}
                                className="w-full h-48 sm:h-64 border-0 rounded"
                                title="Code Preview"
                                sandbox="allow-scripts allow-same-origin"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {submissionData.submissionType === 'link' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="submissionLink" className="text-sm sm:text-base">Submission Link</Label>
                            <Input
                              id="submissionLink"
                              type="url"
                              value={submissionData.submissionLink}
                              onChange={(e) => setSubmissionData(prev => ({
                                ...prev,
                                submissionLink: e.target.value
                              }))}
                              placeholder="https://github.com/your-repo or https://your-demo.com"
                              className="text-sm sm:text-base"
                              required
                            />
                          </div>

                          {/* Live Preview for Link */}
                          {submissionData.submissionLink && (
                            <div className="border rounded-lg overflow-hidden">
                              <div className="bg-gray-100 px-3 sm:px-4 py-2 border-b">
                                <Label className="text-sm font-medium text-gray-700">Live Preview</Label>
                              </div>
                              <div className="bg-white p-2 sm:p-4">
                                <iframe
                                  key={`link-preview-${submissionData.submissionLink}`}
                                  src={submissionData.submissionLink}
                                  className="w-full h-48 sm:h-64 border-0 rounded"
                                  title="Link Preview"
                                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {submissionData.submissionType === 'zip' && (
                        <div>
                          <Label htmlFor="zipFile" className="text-sm sm:text-base">Upload File</Label>
                          <Input
                            id="zipFile"
                            type="file"
                            accept=".zip,.html,.js,.css,.txt,.md"
                            onChange={(e) => setSubmissionData(prev => ({
                              ...prev,
                              zipFile: e.target.files?.[0] || null
                            }))}
                            className="text-sm sm:text-base"
                            required
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={submitting || !canEdit}
                        className="w-full h-11 sm:h-10"
                      >
                        {submitting ? 'Submitting...' :
                          submission && canEdit ? 'Update Submission' : 'Submit Assignment'}
                      </Button>

                      {!canEdit && (
                        <p className="text-sm text-red-600 mt-2 text-center">
                          {editReason}
                        </p>
                      )}
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <XCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">Cannot Submit</h3>
                  <p className="text-gray-600 text-center text-sm sm:text-base">
                    {getSubmissionMessage()}
                  </p>
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
                    <div className="text-center p-4 sm:p-6 border rounded-lg">
                      <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Submissions</h3>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        View and manage all student submissions for this assignment.
                      </p>
                      <Button
                        onClick={() => router.push(`/admin/assignments/${assignmentId}/submissions`)}
                        className="bg-blue-600 hover:bg-blue-700 w-full"
                        size="sm"
                      >
                        View Submissions
                      </Button>
                    </div>

                    <div className="text-center p-4 sm:p-6 border rounded-lg">
                      <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Edit Assignment</h3>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        Modify assignment details, requirements, and settings.
                      </p>
                      <Button
                        onClick={() => router.push(`/admin/assignments/${assignmentId}/edit`)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Edit Assignment
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="text-center">
                      <h3 className="text-base sm:text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        Permanently delete this assignment and all related data.
                      </p>
                      <Button
                        onClick={() => setShowDeleteModal(true)}
                        variant="destructive"
                        size="sm"
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

      {/* Delete Submission Alert Dialog */}
      <DeleteSubmissionAlertDialog
        isOpen={showDeleteSubmissionModal}
        onClose={() => setShowDeleteSubmissionModal(false)}
        onConfirm={handleDeleteSubmission}
      />
    </div>
  );
}
