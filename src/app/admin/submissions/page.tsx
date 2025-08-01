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
  Eye,
  Download,
  Copy,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Code,
  Github,
  Upload,
  Send,
  Star,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Submission {
  id: string;
  projectId: string;
  projectTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  className: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  score?: number;
  maxScore: number;
  feedback?: string;
  isLate: boolean;
  latePenalty: number;
  githubLink?: string;
  codeSubmission?: string;
  zipFile?: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  reviewNotes?: string;
  bonusPoints: number;
  penaltyPoints: number;
  finalScore?: number;
  plagiarismScore?: number;
  isPlagiarized: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  sampleOutput?: string;
}

export default function SubmissionsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SubmissionsReview />
    </ProtectedRoute>
  );
}

function SubmissionsReview() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Review form state
  const [reviewData, setReviewData] = useState({
    score: 0,
    feedback: '',
    reviewNotes: '',
    bonusPoints: 0,
    penaltyPoints: 0,
    status: 'reviewed' as const
  });

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAdminSubmissions();
      setSubmissions(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      const response = await api.getAdminProject(projectId);
      setSelectedProject(response.project);
    } catch (error) {
      console.error('Error loading project:', error);
      setSelectedProject(null); // Set to null instead of mock data
    }
  };

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      const finalScore = Math.max(0, reviewData.score + reviewData.bonusPoints - reviewData.penaltyPoints);
      
      await api.reviewAdminSubmission(selectedSubmission.id, {
        ...reviewData,
        finalScore
      });
      
      toast.success('Submission reviewed successfully!');
      setShowReviewModal(false);
      setReviewData({
        score: 0,
        feedback: '',
        reviewNotes: '',
        bonusPoints: 0,
        penaltyPoints: 0,
        status: 'reviewed'
      });
      loadSubmissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to review submission');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'rejected':
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

  const filteredSubmissions = submissions.filter(sub => {
    if (activeTab === 'all') return true;
    return sub.status === activeTab;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Submissions Error</h1><p>{error}</p><button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={loadSubmissions}>Retry</button></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Submission Reviews
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Review and grade student submissions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submissions List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>
                  {filteredSubmissions.length} submissions found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-4 mb-6">
                  <Input placeholder="Search submissions..." />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="js-fundamentals">JavaScript Fundamentals</SelectItem>
                      <SelectItem value="react-advanced">Advanced React</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                    <TabsTrigger value="accepted">Accepted</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Submissions List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSubmission?.id === submission.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        setSelectedSubmission(submission);
                        loadProject(submission.projectId);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{submission.projectTitle}</h4>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {submission.studentName} • {submission.className}
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">
                          {formatDate(submission.submittedAt)}
                        </span>
                        {submission.score && (
                          <span className="font-medium">{submission.score}/{submission.maxScore}</span>
                        )}
                      </div>
                      {submission.isLate && (
                        <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          Late (-{submission.latePenalty}pts)
                        </div>
                      )}
                      {submission.plagiarismScore !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Plagiarism:</span>
                          <span className={`text-xs font-bold ${submission.plagiarismScore > 80 ? 'text-red-600' : 'text-green-600'}`}>{submission.plagiarismScore}%</span>
                          {submission.plagiarismScore > 80 && <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs ml-2">Flagged</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Details */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <div className="space-y-6">
                {/* Submission Header */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedSubmission.projectTitle}</CardTitle>
                        <CardDescription>
                          Submitted by {selectedSubmission.studentName} ({selectedSubmission.studentEmail})
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowReviewModal(true)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        {selectedSubmission.githubLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(selectedSubmission.githubLink, '_blank')}
                          >
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Class</span>
                        <p className="font-medium">{selectedSubmission.className}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted</span>
                        <p className="font-medium">{formatDate(selectedSubmission.submittedAt)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status</span>
                        <Badge className={getStatusColor(selectedSubmission.status)}>
                          {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Score</span>
                        <p className="font-medium">
                          {selectedSubmission.finalScore || selectedSubmission.score || 0}/{selectedSubmission.maxScore}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Code Review */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Code Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="html" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="css">CSS</TabsTrigger>
                        <TabsTrigger value="js">JavaScript</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="html" className="mt-4">
                        <div className="relative">
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(selectedSubmission.htmlCode || '')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadCode(selectedSubmission.htmlCode || '', 'index.html')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                            <code>{selectedSubmission.htmlCode || '<!-- No HTML code provided -->'}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="css" className="mt-4">
                        <div className="relative">
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(selectedSubmission.cssCode || '')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadCode(selectedSubmission.cssCode || '', 'styles.css')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                            <code>{selectedSubmission.cssCode || '/* No CSS code provided */'}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="js" className="mt-4">
                        <div className="relative">
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(selectedSubmission.jsCode || '')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadCode(selectedSubmission.jsCode || '', 'script.js')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-64">
                            <code>{selectedSubmission.jsCode || '// No JavaScript code provided'}</code>
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Project Requirements */}
                {selectedProject && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Array.isArray(selectedProject.requirements) ? selectedProject.requirements.map((req, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{req}</span>
                          </div>
                        )) : (
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{selectedProject.requirements || 'No requirements specified'}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Current Feedback */}
                {selectedSubmission.feedback && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedSubmission.score && (
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Score</span>
                            <Badge variant="secondary">
                              {selectedSubmission.finalScore || selectedSubmission.score}/{selectedSubmission.maxScore}
                            </Badge>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm font-medium">Feedback</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {selectedSubmission.feedback}
                          </p>
                        </div>
                        {selectedSubmission.reviewNotes && (
                          <div>
                            <Label className="text-sm font-medium">Review Notes</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {selectedSubmission.reviewNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Select a Submission
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Choose a submission from the list to review
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Review Submission</CardTitle>
              <CardDescription>
                Grade and provide feedback for {selectedSubmission.projectTitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReviewSubmission} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Score</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max={selectedSubmission.maxScore}
                      value={reviewData.score}
                      onChange={(e) => setReviewData({ ...reviewData, score: parseInt(e.target.value) })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Max score: {selectedSubmission.maxScore}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={reviewData.status} 
                      onValueChange={(value: any) => setReviewData({ ...reviewData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bonusPoints">Bonus Points</Label>
                    <Input
                      id="bonusPoints"
                      type="number"
                      min="0"
                      value={reviewData.bonusPoints}
                      onChange={(e) => setReviewData({ ...reviewData, bonusPoints: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="penaltyPoints">Penalty Points</Label>
                    <Input
                      id="penaltyPoints"
                      type="number"
                      min="0"
                      value={reviewData.penaltyPoints}
                      onChange={(e) => setReviewData({ ...reviewData, penaltyPoints: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback for Student</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide constructive feedback..."
                    value={reviewData.feedback}
                    onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewNotes">Internal Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    placeholder="Internal notes (not visible to student)..."
                    value={reviewData.reviewNotes}
                    onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Final Score Preview</span>
                    <span className="text-lg font-bold">
                      {Math.max(0, reviewData.score + reviewData.bonusPoints - reviewData.penaltyPoints)}/{selectedSubmission.maxScore}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Review
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowReviewModal(false)}
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