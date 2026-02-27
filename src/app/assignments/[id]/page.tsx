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
  Lock,
  Trash2
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
        return <Badge className="bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20">Active</Badge>;
      case 'not_started':
        return <Badge className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20">Not Started</Badge>;
      case 'overdue':
        return <Badge className="bg-neon-pink/10 text-neon-pink border-neon-pink/20">Overdue</Badge>;
      case 'locked':
        return <Badge className="bg-card/40 backdrop-blur-xl/10 text-foreground border-white/20">Locked</Badge>;
      case 'inactive':
        return <Badge className="bg-neon-amber/10 text-neon-amber border-neon-amber/20">Inactive</Badge>;
      default:
        return <Badge className="bg-card/40 backdrop-blur-xl/10 text-foreground border-white/20">Unknown</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-neon-amber/10 text-neon-amber border-neon-amber/20">Pending Review</Badge>;
      case 'reviewed':
        return <Badge className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20">Reviewed</Badge>;
      case 'accepted':
        return <Badge className="bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20">Accepted</Badge>;
      default:
        return <Badge className="bg-card/40 backdrop-blur-xl/10 text-foreground border-white/20">Unknown</Badge>;
    }
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'instructor' || currentUser?.role === 'staff';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md border-white/10 bg-black/40 backdrop-blur-md">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Assignment not found or you don't have access to it.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neon-cyan/30">
      <div className="container mx-auto px-4 py-6 lg:py-10 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col space-y-6 mb-8 lg:mb-12">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="shrink-0 h-10 w-10 p-0 sm:h-9 sm:w-auto sm:px-4 border-white/10 hover:bg-card/40 backdrop-blur-xl/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground truncate">
                {assignment.title}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm lg:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan/50"></span>
                {assignment.class.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {submission && getSubmissionStatusBadge(submission.status)}
            {isDeadlinePassed() && (
              <Badge variant="destructive" className="bg-neon-pink/10 text-neon-pink border-neon-pink/20">
                Deadline Passed
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-card/50 backdrop-blur-sm border border-white/5 p-1 text-muted-foreground w-full sm:w-auto">
            <TabsTrigger value="details" className="text-sm px-6">Details</TabsTrigger>
            <TabsTrigger value="sample" className="text-sm px-6">Sample Output</TabsTrigger>
            {!isAdmin() && (
              <TabsTrigger value="submit" className="text-sm px-6">Submit</TabsTrigger>
            )}
            {isAdmin() && (
              <TabsTrigger value="submissions" className="text-sm px-6">Submissions</TabsTrigger>
            )}
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                    <FileText className="w-5 h-5 text-neon-cyan" />
                    Description
                  </h2>
                  <div className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base leading-relaxed p-4 bg-card/40 backdrop-blur-xl/[0.02] rounded-xl border border-white/5">
                    {assignment.description}
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                    <CheckCircle className="w-5 h-5 text-neon-emerald" />
                    Requirements
                  </h2>
                  <div className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base leading-relaxed p-4 bg-card/40 backdrop-blur-xl/[0.02] rounded-xl border border-white/5">
                    {assignment.requirements}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-2xl">
                  <CardHeader className="pb-4 border-b border-white/5">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-neon-violet" />
                      Assignment Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">Start Date</span>
                      <div className="flex items-center gap-2 text-foreground font-medium bg-card/40 backdrop-blur-xl/5 p-2.5 rounded-md border border-white/5">
                        <Calendar className="w-4 h-4 text-neon-cyan shrink-0" />
                        {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'Not set'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">Deadline</span>
                      <div className="flex items-center gap-2 text-foreground font-medium bg-card/40 backdrop-blur-xl/5 p-2.5 rounded-md border border-white/5">
                        <Clock className="w-4 h-4 text-neon-pink shrink-0" />
                        {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'Not set'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">Max Score</span>
                      <div className="flex items-center gap-2 text-foreground font-medium bg-card/40 backdrop-blur-xl/5 p-2.5 rounded-md border border-white/5">
                        <FileText className="w-4 h-4 text-neon-emerald shrink-0" />
                        {assignment.maxScore} points
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">Submission Type</span>
                      <div className="flex items-center gap-2 text-foreground font-medium bg-card/40 backdrop-blur-xl/5 p-2.5 rounded-md border border-white/5 capitalize">
                        <Upload className="w-4 h-4 text-neon-amber shrink-0" />
                        {assignment.submissionMode}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {assignment.paymentRequired && (
                  <Card className="bg-card/60 backdrop-blur-md border-neon-pink/20 shadow-[0_0_15px_rgba(255,42,109,0.1)]">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2 text-neon-pink">
                        <AlertTriangle className="w-5 h-5" />
                        Late Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Late submissions require payment of <strong className="text-foreground">₦{assignment.paymentAmount}</strong>
                      </p>
                      <Badge variant="outline" className="bg-neon-pink/10 text-neon-pink border-neon-pink/20 w-full justify-center py-1.5">Payment Required</Badge>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Sample Output Tab */}
          <TabsContent value="sample" className="space-y-6">
            {assignment.sampleOutputUrl && assignment.sampleOutputUrl.trim() !== '' ? (
              <Card className="bg-card/60 backdrop-blur-md border-white/5 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-neon-cyan" />
                    Sample Output
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <span className="font-medium">URL:</span>
                  </div>
                  <a
                    href={assignment.sampleOutputUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-cyan hover:text-neon-cyan/80 hover:underline break-all text-sm sm:text-base inline-flex items-center gap-2 bg-card/40 backdrop-blur-xl/5 p-3 rounded-lg border border-white/10 w-full transition-colors"
                  >
                    {assignment.sampleOutputUrl}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </CardContent>
              </Card>
            ) : assignment.sampleOutputCode && (
              assignment.sampleOutputCode.html ||
              assignment.sampleOutputCode.css ||
              assignment.sampleOutputCode.javascript
            ) ? (
              <Card className="bg-card/60 backdrop-blur-md border-white/5 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5 text-neon-violet" />
                    Sample Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-card/40 backdrop-blur-xl/5 rounded-xl p-2 sm:p-4 min-h-[300px] sm:min-h-[400px] border border-white/10 relative group">
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="outline" className="bg-black/50 backdrop-blur text-white border-white/10">HTML/CSS/JS</Badge>
                    </div>
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
                      className="w-full h-full min-h-[250px] sm:min-h-[350px] border-0 rounded bg-card/40 backdrop-blur-xl"
                      title="Sample Output Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/30 border-dashed border-white/20">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-card/40 backdrop-blur-xl/5 flex items-center justify-center mb-6">
                    <Eye className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Sample Output</h3>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-sm">
                    No visual sample or code has been provided for this assignment yet.
                  </p>
                  {isAdmin() && (
                    <div className="mt-8">
                      <Button
                        onClick={() => router.push(`/admin/assignments/${assignmentId}/edit`)}
                        variant="outline"
                        size="sm"
                        className="border-white/10 hover:bg-card/40 backdrop-blur-xl/5"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Add Sample
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
              <Card className="bg-card/60 backdrop-blur-md border-white/5 shadow-xl">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-neon-emerald" />
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-white/5 bg-card/40 backdrop-blur-xl/[0.02] p-4 rounded-xl">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
                      <div>{getSubmissionStatusBadge(submission.status)}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Submitted</span>
                      <span className="text-sm font-medium">{new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                    {submission.score !== undefined && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Score</span>
                        <span className="text-sm font-medium text-neon-cyan">{submission.score}/{assignment.maxScore}</span>
                      </div>
                    )}
                  </div>

                  {submission.feedback && (
                    <div className="p-4 bg-card/40 backdrop-blur-xl/5 border border-white/10 rounded-xl">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Instructor Feedback</span>
                      <p className="text-sm text-foreground/90">{submission.feedback}</p>
                    </div>
                  )}

                  {/* Submission Preview */}
                  {submission.submissionType === 'code' && submission.codeSubmission && (
                    <div className="border border-white/10 rounded-xl overflow-hidden shadow-lg">
                      <div className="bg-black/60 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Code className="w-4 h-4 text-neon-violet" />
                          Code Result
                        </span>
                      </div>
                      <div className="bg-card/40 backdrop-blur-xl p-0 relative">
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
                          className="w-full h-64 border-0 rounded-b-xl"
                          title="Submission Preview"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  )}

                  {submission.submissionType === 'link' && submission.submissionLink && (
                    <div className="border border-white/10 rounded-xl overflow-hidden shadow-lg">
                      <div className="bg-black/60 px-4 py-3 border-b border-white/5 flex items-center gap-2">
                        <Link className="w-4 h-4 text-neon-cyan" />
                        <span className="text-sm font-medium text-foreground">Deployed Site Preview</span>
                      </div>
                      <div className="bg-card/40 backdrop-blur-xl p-0">
                        <iframe
                          key={`submission-link-${submission.id}`}
                          src={submission.submissionLink}
                          className="w-full h-64 border-0 rounded-b-xl"
                          title="Link Preview"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        />
                      </div>
                    </div>
                  )}

                  {/* Delete Submission Section */}
                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteSubmissionModal(true)}
                      className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Submission
                    </Button>
                  </div>

                  {/* Edit Submission Info */}
                  <div className="pt-6 border-t border-white/5">
                    {canEdit ? (
                      <div className="flex items-start gap-4 p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm text-neon-cyan font-medium block mb-1">Editing is unlocked</span>
                          <p className="text-sm text-muted-foreground/80">
                            You may update your submission using the form below. Changes take effect immediately.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <Lock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm text-red-500 font-medium block mb-1">Editing is locked</span>
                          <p className="text-sm text-muted-foreground/80">
                            {editReason || 'You cannot edit this submission at this time.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submission Form - Show for new submissions or when can edit existing */}
            {isDeadlinePassed() && assignment?.paymentRequired && !hasPaid && !submission ? (
              <Card className="bg-card/60 backdrop-blur-md border-neon-pink/20 shadow-[0_0_15px_rgba(255,42,109,0.1)]">
                <CardHeader className="border-b border-neon-pink/10">
                  <CardTitle className="flex items-center gap-2 text-neon-pink">
                    <Lock className="w-5 h-5" />
                    Late Submission Fee
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <Alert variant="destructive" className="bg-neon-pink/10 text-neon-pink border-neon-pink/20">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      The standard deadline has passed. To submit, please clear the required late fee.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center justify-center p-8 bg-card/40 backdrop-blur-xl/[0.02] rounded-xl border border-white/5 text-center">
                    <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-2">Required Amount</p>
                    <p className="text-4xl font-bold text-foreground mb-8">₦{assignment.paymentAmount?.toLocaleString()}</p>

                    <Button
                      onClick={handleLateFeePayment}
                      disabled={paymentLoading}
                      className="w-full sm:w-auto min-w-[200px] h-12 bg-neon-emerald hover:bg-neon-emerald/90 text-black font-bold"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-5 h-5 mr-2" />
                          Pay Now
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      The form unlocks automatically after successful payment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (canSubmit() || canEdit) ? (
              <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-xl overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"></div>
                <CardHeader className="border-b border-white/5">
                  <CardTitle className="text-xl">{submission ? 'Edit Submission' : 'Submit Assignment'}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {!canSubmit() && !submission ? (
                    <Alert className="bg-card/40 backdrop-blur-xl/5 text-foreground border-white/10">
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        {getSubmissionMessage()}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {submission && (
                        <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl p-4 mb-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                          <div className="flex items-center gap-2 mb-2">
                            <Edit className="w-5 h-5 text-neon-cyan shrink-0" />
                            <span className="font-semibold text-foreground tracking-tight">Updating Submission</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            You are modifying your previous entry. Existing progress has been loaded.
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Label htmlFor="submissionType" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">Submission Format</Label>
                        <select
                          id="submissionType"
                          value={submissionData.submissionType}
                          onChange={(e) => setSubmissionData(prev => ({
                            ...prev,
                            submissionType: e.target.value as 'code' | 'link' | 'zip'
                          }))}
                          className="w-full p-3.5 bg-background border border-white/10 rounded-xl text-foreground focus:ring-2 focus:ring-neon-cyan focus:outline-none transition-shadow appearance-none"
                        >
                          {assignment.submissionMode === 'both' && (
                            <>
                              <option value="code">Raw Code (HTML/CSS/JS)</option>
                              <option value="link">Deployed Link / Repository</option>
                              <option value="zip">Archive Upload (.zip)</option>
                            </>
                          )}
                          {assignment.submissionMode === 'code' && (
                            <option value="code">Raw Code (HTML/CSS/JS)</option>
                          )}
                          {assignment.submissionMode === 'link' && (
                            <option value="link">Deployed Link / Repository</option>
                          )}
                        </select>
                      </div>

                      {submissionData.submissionType === 'code' && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="html" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80 flex items-center justify-between">
                              <span>HTML</span>
                              <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">Required</Badge>
                            </Label>
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
                              placeholder="<!-- Enter your HTML code here -->"
                              rows={6}
                              className="font-mono text-sm bg-black/50 border-white/10 focus-visible:ring-neon-cyan"
                              required
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="css" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">CSS</Label>
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
                              placeholder="/* Enter your CSS code here */"
                              rows={6}
                              className="font-mono text-sm bg-black/50 border-white/10 focus-visible:ring-neon-cyan"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="javascript" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">JavaScript</Label>
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
                              placeholder="// Enter your JavaScript code here"
                              rows={6}
                              className="font-mono text-sm bg-black/50 border-white/10 focus-visible:ring-neon-cyan"
                            />
                          </div>

                          {/* Live Preview for Code */}
                          <div className="border border-white/10 rounded-xl overflow-hidden mt-8 shadow-2xl">
                            <div className="bg-card/40 backdrop-blur-xl/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                              <Label className="text-sm font-medium text-foreground m-0 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-neon-cyan" />
                                Live Preview
                              </Label>
                            </div>
                            <div className="bg-card/40 backdrop-blur-xl relative">
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
                                className="w-full h-64 border-0 rounded-b-xl"
                                title="Code Preview"
                                sandbox="allow-scripts allow-same-origin"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {submissionData.submissionType === 'link' && (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="submissionLink" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">Project URL</Label>
                            <Input
                              id="submissionLink"
                              type="url"
                              value={submissionData.submissionLink}
                              onChange={(e) => setSubmissionData(prev => ({
                                ...prev,
                                submissionLink: e.target.value
                              }))}
                              placeholder="https://github.com/..."
                              className="h-12 bg-black/30 border-white/10 focus-visible:ring-neon-cyan"
                              required
                            />
                          </div>

                          {/* Live Preview for Link */}
                          {submissionData.submissionLink && (
                            <div className="border border-white/10 rounded-xl overflow-hidden mt-4 shadow-2xl">
                              <div className="bg-card/40 backdrop-blur-xl/5 px-4 py-3 border-b border-white/5 flex items-center gap-2">
                                <Link className="w-4 h-4 text-neon-cyan" />
                                <Label className="text-sm font-medium text-foreground m-0">URL Preview</Label>
                              </div>
                              <div className="bg-card/40 backdrop-blur-xl relative">
                                <iframe
                                  key={`link-preview-${submissionData.submissionLink}`}
                                  src={submissionData.submissionLink}
                                  className="w-full h-64 border-0 rounded-b-xl"
                                  title="Link Preview"
                                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {submissionData.submissionType === 'zip' && (
                        <div className="space-y-3">
                          <Label htmlFor="zipFile" className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">Archive Upload</Label>
                          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-card/40 backdrop-blur-xl/[0.01] hover:bg-card/40 backdrop-blur-xl/[0.02] transition-colors relative group">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3 group-hover:text-neon-cyan transition-colors" />
                            <p className="text-sm text-foreground mb-1">Click to browse or drag and drop</p>
                            <p className="text-xs text-muted-foreground">Supported formats: .zip, .rar</p>
                            <Input
                              id="zipFile"
                              type="file"
                              accept=".zip,.rar"
                              onChange={(e) => setSubmissionData(prev => ({
                                ...prev,
                                zipFile: e.target.files?.[0] || null
                              }))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              required
                            />
                          </div>
                          {submissionData.zipFile && (
                            <div className="flex items-center gap-2 p-3 bg-card/40 backdrop-blur-xl/5 rounded-lg border border-white/10 mt-2">
                              <FileText className="w-4 h-4 text-neon-cyan" />
                              <span className="text-sm flex-1 truncate">{submissionData.zipFile.name}</span>
                              <span className="text-xs text-muted-foreground pr-2">{(submissionData.zipFile.size / 1024).toFixed(1)} KB</span>
                            </div>
                          )}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={submitting || !canEdit}
                        className="w-full h-12 text-base font-semibold tracking-wide bg-foreground text-background hover:bg-foreground/90 transition-all rounded-xl"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                            Processing...
                          </span>
                        ) : (
                          submission && canEdit ? 'Save Changes' : 'Submit Initial Work'
                        )}
                      </Button>

                      {!canEdit && (
                        <p className="text-sm text-red-500 mt-4 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                          {editReason}
                        </p>
                      )}
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/30 border-dashed border-white/20 text-center py-16">
                <CardContent>
                  <div className="w-16 h-16 rounded-full bg-card/40 backdrop-blur-xl/5 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Unavailable</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    {getSubmissionMessage()}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submissions Tab (Admin Only) */}
          {isAdmin() && (
            <TabsContent value="submissions" className="space-y-6">
              <Card className="bg-card/60 backdrop-blur-md border-white/5 shadow-xl">
                <CardHeader className="border-b border-white/5">
                  <CardTitle>Management Tools</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 border border-white/10 rounded-xl bg-card/40 backdrop-blur-xl/[0.02] hover:bg-card/40 backdrop-blur-xl/[0.04] transition-colors flex flex-col items-center text-center group cursor-pointer" onClick={() => router.push(`/admin/assignments/${assignmentId}/submissions`)}>
                      <div className="w-12 h-12 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-4 group-hover:bg-neon-cyan/20 transition-colors">
                        <FileText className="w-6 h-6 text-neon-cyan" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Review Submissions</h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-1">
                        View, grade, and add feedback to all student entries for this task.
                      </p>
                      <Button className="w-full" variant="outline" size="sm">
                        Open Viewer
                      </Button>
                    </div>

                    <div className="p-6 border border-white/10 rounded-xl bg-card/40 backdrop-blur-xl/[0.02] hover:bg-card/40 backdrop-blur-xl/[0.04] transition-colors flex flex-col items-center text-center group cursor-pointer" onClick={() => router.push(`/admin/assignments/${assignmentId}/edit`)}>
                      <div className="w-12 h-12 rounded-full bg-neon-amber/10 flex items-center justify-center mb-4 group-hover:bg-neon-amber/20 transition-colors">
                        <Edit className="w-6 h-6 text-neon-amber" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Modify Assignment</h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-1">
                        Edit details, change deadlines, update score weights or parameters.
                      </p>
                      <Button className="w-full" variant="outline" size="sm">
                        Edit Config
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-red-500/20 bg-red-500/5 rounded-xl">
                      <div>
                        <h3 className="text-base font-medium text-red-500 mb-1">Destructive Action</h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete. This will erase all connected submissions and grades.
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowDeleteModal(true)}
                        variant="destructive"
                        className="shrink-0 bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400 border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
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
