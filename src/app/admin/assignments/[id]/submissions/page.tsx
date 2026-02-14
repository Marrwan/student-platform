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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Download,
  Eye,
  Copy,
  Globe,
  FileCode,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Submission {
  id: string;
  userId: string;
  assignmentId: string;
  submissionType: 'github' | 'code' | 'link' | 'zip';
  githubLink?: string;
  submissionLink?: string;
  codeSubmission?: {
    html: string;
    css: string;
    javascript: string;
  };
  zipFileUrl?: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'reviewed' | 'accepted';
  submittedAt: string;
  reviewedAt?: string;
  requestCorrection?: boolean;
  correctionComments?: string;
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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [markData, setMarkData] = useState({
    score: '',
    feedback: '',
    status: 'reviewed',
    requestCorrection: false,
    correctionComments: ''
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

      // Prepare the data to send
      const submissionData: any = {
        feedback: markData.feedback || undefined,
        status: markData.status,
        requestCorrection: markData.requestCorrection,
        correctionComments: markData.correctionComments || undefined
      };

      // Only include score if it's provided and valid
      if (markData.score && markData.score.trim() !== '' && !isNaN(parseFloat(markData.score))) {
        submissionData.score = parseFloat(markData.score);
      }

      await api.markSubmission(assignmentId, selectedSubmission.id, submissionData);

      toast.success('Submission marked successfully');
      setMarkDialogOpen(false);
      setSelectedSubmission(null);
      setMarkData({ score: '', feedback: '', status: 'reviewed', requestCorrection: false, correctionComments: '' });
      loadSubmissions(); // Reload to get updated data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark submission');
    } finally {
      setMarkingSubmission(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;

    try {
      await api.deleteAssignmentSubmission(assignmentId, submissionId);
      toast.success('Submission deleted successfully');

      // Close dialogs if open
      setDetailDialogOpen(false);
      setMarkDialogOpen(false);
      setSelectedSubmission(null);

      // Reload submissions
      loadSubmissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete submission');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
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
        return <Code className="w-4 h-4 text-purple-500" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-blue-500" />;
      case 'link':
        return <Globe className="w-4 h-4 text-green-500" />;
      case 'zip':
        return <Download className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('File downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download file');
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
                          status: submission.status,
                          requestCorrection: submission.requestCorrection || false,
                          correctionComments: submission.correctionComments || ''
                        });
                        setMarkDialogOpen(true);
                      }}
                    >
                      {submission.status === 'pending' ? 'Mark' : 'Update'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setDetailDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>

                    {submission.submissionLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(submission.submissionLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open Link
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSubmission(submission.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                  disabled={markData.status !== 'accepted'}
                />
                {markData.status !== 'accepted' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Score can only be set when marking as accepted
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={markData.status}
                  onValueChange={(value) => {
                    setMarkData(prev => ({
                      ...prev,
                      status: value,
                      // Clear score if status is not 'accepted'
                      score: value !== 'accepted' ? '' : prev.score
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requestCorrection">Request Correction</Label>
                <Select
                  value={markData.requestCorrection ? 'true' : 'false'}
                  onValueChange={(value) => setMarkData(prev => ({ ...prev, requestCorrection: value === 'true' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {markData.requestCorrection && (
                <div>
                  <Label htmlFor="correctionComments">Correction Comments</Label>
                  <Textarea
                    id="correctionComments"
                    value={markData.correctionComments}
                    onChange={(e) => setMarkData(prev => ({ ...prev, correctionComments: e.target.value }))}
                    placeholder="Provide comments for the student..."
                    rows={4}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={markData.feedback}
                  onChange={(e) => setMarkData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Provide feedback for the student..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleMarkSubmission}
                  disabled={markingSubmission}
                  className="flex-1"
                >
                  {markingSubmission ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMarkDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detailed Submission View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Submission Details - {selectedSubmission?.user.firstName} {selectedSubmission?.user.lastName}
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Submission Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-600">Student:</span>
                  <p className="text-sm">{selectedSubmission.user.firstName} {selectedSubmission.user.lastName}</p>
                  <p className="text-xs text-gray-500">{selectedSubmission.user.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Submitted:</span>
                  <p className="text-sm">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <div className="flex items-center gap-2">
                    {getSubmissionTypeIcon(selectedSubmission.submissionType)}
                    <span className="text-sm capitalize">{selectedSubmission.submissionType}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                </div>
              </div>

              {/* Submission Content */}
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  {selectedSubmission.submissionType === 'link' && selectedSubmission.submissionLink && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Submission URL</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedSubmission.submissionLink!)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy URL
                        </Button>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <a
                          href={selectedSubmission.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {selectedSubmission.submissionLink}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedSubmission.submissionType === 'github' && selectedSubmission.githubLink && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">GitHub Repository</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedSubmission.githubLink!)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy URL
                        </Button>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <a
                          href={selectedSubmission.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {selectedSubmission.githubLink}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedSubmission.submissionType === 'zip' && selectedSubmission.zipFileUrl && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Uploaded File</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">
                            {selectedSubmission.zipFileUrl.split('/').pop() || 'Downloaded file'}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => downloadFile(selectedSubmission.zipFileUrl!, selectedSubmission.zipFileUrl!.split('/').pop() || 'submission.zip')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  {selectedSubmission.submissionType === 'code' && selectedSubmission.codeSubmission && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Code Preview</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const fullCode = `
<!DOCTYPE html>
<html>
<head>
  <style>${selectedSubmission.codeSubmission?.css || ''}</style>
</head>
<body>
  ${selectedSubmission.codeSubmission?.html || ''}
  <script>${selectedSubmission.codeSubmission?.javascript || ''}</script>
</body>
</html>`;
                            copyToClipboard(fullCode);
                          }}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Full Code
                        </Button>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                            <head>
                              <style>${selectedSubmission.codeSubmission?.css || ''}</style>
                            </head>
                            <body>
                              ${selectedSubmission.codeSubmission?.html || ''}
                              <script>${selectedSubmission.codeSubmission?.javascript || ''}</script>
                            </body>
                            </html>
                          `}
                          className="w-full h-96 border-0"
                          title="Code Preview"
                        />
                      </div>
                    </div>
                  )}

                  {selectedSubmission.submissionType === 'link' && selectedSubmission.submissionLink && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Website Preview</Label>
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          src={selectedSubmission.submissionLink}
                          className="w-full h-96 border-0"
                          title="Website Preview"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="code" className="space-y-4">
                  {selectedSubmission.submissionType === 'code' && selectedSubmission.codeSubmission && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">HTML</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(selectedSubmission.codeSubmission?.html || '')}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <Textarea
                            value={selectedSubmission.codeSubmission?.html || ''}
                            readOnly
                            className="h-32 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">CSS</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(selectedSubmission.codeSubmission?.css || '')}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <Textarea
                            value={selectedSubmission.codeSubmission?.css || ''}
                            readOnly
                            className="h-32 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">JavaScript</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(selectedSubmission.codeSubmission?.javascript || '')}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <Textarea
                            value={selectedSubmission.codeSubmission?.javascript || ''}
                            readOnly
                            className="h-32 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => {
                        setDetailDialogOpen(false);
                        setMarkData({
                          score: selectedSubmission.score?.toString() || '',
                          feedback: selectedSubmission.feedback || '',
                          status: selectedSubmission.status,
                          requestCorrection: selectedSubmission.requestCorrection || false,
                          correctionComments: selectedSubmission.correctionComments || ''
                        });
                        setMarkDialogOpen(true);
                      }}
                      className="w-full"
                    >
                      Mark Submission
                    </Button>

                    {selectedSubmission.submissionLink && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedSubmission.submissionLink, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => {
                        const fullCode = `
<!DOCTYPE html>
<html>
<head>
  <style>${selectedSubmission.codeSubmission?.css || ''}</style>
</head>
<body>
  ${selectedSubmission.codeSubmission?.html || ''}
  <script>${selectedSubmission.codeSubmission?.javascript || ''}</script>
</body>
</html>`;
                        const blob = new Blob([fullCode], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `submission-${selectedSubmission.user.firstName}-${selectedSubmission.user.lastName}.html`;
                        link.click();
                        URL.revokeObjectURL(url);
                        toast.success('Code downloaded as HTML file!');
                      }}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download as HTML
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                      className="w-full col-span-2"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Submission
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
