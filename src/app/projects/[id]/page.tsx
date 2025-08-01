'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Code, 
  Eye, 
  Upload, 
  Github, 
  Clock, 
  CheckCircle, 
  XCircle,
  Play,
  Download,
  Copy,
  ExternalLink,
  Target
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Project } from '@/types';

interface Submission {
  id: string;
  projectId: string;
  userId: string;
  githubLink: string;
  codeSubmission?: string;
  zipFile?: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  score?: number;
  feedback?: string;
  isLate: boolean;
}

export default function ProjectViewerPage() {
  return (
    <ProtectedRoute>
      <ProjectViewer />
    </ProtectedRoute>
  );
}

function ProjectViewer() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [githubLink, setGithubLink] = useState('');
  const [codeSubmission, setCodeSubmission] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);

  // Add state for plagiarism warning and payment required
  const [plagiarismWarning, setPlagiarismWarning] = useState<string | null>(null);
  const [lateFeeRequired, setLateFeeRequired] = useState<boolean>(false);
  const [paystackUrl, setPaystackUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProject();
      loadSubmission();
    }
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getProject(id as string);
      setProject(response.project);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmission = async () => {
    try {
      // This would be implemented in the API
      // const response = await api.getMySubmission(id as string);
      // setSubmission(response.submission);
    } catch (error) {
      console.error('Error loading submission:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!githubLink.trim()) {
      toast.error('GitHub link is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitProject({
        projectId: id as string,
        githubLink,
        codeSubmission,
        zipFile: zipFile || undefined,
      });
      setPlagiarismWarning(null);
      setLateFeeRequired(false);
      setPaystackUrl(null);
      toast.success('Project submitted successfully!');
      loadSubmission(); // Reload submission data
    } catch (err: any) {
      if (err.response?.status === 400 && err.response.data.message?.includes('Plagiarism')) {
        setPlagiarismWarning(err.response.data.message);
        toast.error('Plagiarism detected. Please revise your code.');
      } else if (err.response?.status === 402) {
        setLateFeeRequired(true);
        toast.error('Late fee payment required before submitting.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit project');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setZipFile(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }
  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Project Error</h1><p>{error}</p><button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={loadProject}>Retry</button></div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <Button onClick={() => router.push('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/projects')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Day {id} • {project.difficulty} difficulty
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={!!project.isLocked ? "destructive" : "default"}>
                {!!project.isLocked ? "Locked" : "Unlocked"}
              </Badge>
              {!!project.isOverdue && (
                <Badge variant="destructive">Overdue</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Details */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Deadline</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{project.deadline}</span>
                  </div>
                </div>
                
                {project.timeRemaining && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Time Remaining</span>
                    <Badge variant={!!project.isOverdue ? "destructive" : "default"}>
                      {project.timeRemaining}
                    </Badge>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Requirements</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {Array.isArray(project.requirements) ? project.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    )) : (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {project.requirements || 'No requirements specified'}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Learning Objectives</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {Array.isArray(project.learningObjectives) ? project.learningObjectives.map((obj, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {obj}
                      </li>
                    )) : (
                      <li className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {project.learningObjectives || 'No learning objectives specified'}
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Code Preview */}
            {(project.htmlCode || project.cssCode || project.jsCode) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Starter Code
                  </CardTitle>
                  <CardDescription>
                    Review the starter code for this project
                  </CardDescription>
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(project.htmlCode || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{project.htmlCode || '<!-- No HTML code provided -->'}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="css" className="mt-4">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(project.cssCode || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{project.cssCode || '/* No CSS code provided */'}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="js" className="mt-4">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(project.jsCode || '')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{project.jsCode || '// No JavaScript code provided'}</code>
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Submission Form */}
            {!project.isLocked && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Work</CardTitle>
                  <CardDescription>
                    Submit your completed project for review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {plagiarismWarning && (
                      <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
                        <strong>Plagiarism Warning:</strong> {plagiarismWarning}
                      </div>
                    )}
                    {lateFeeRequired && (
                      <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 flex items-center gap-4">
                        <span>Late fee payment required to submit this project.</span>
                        <button
                          className="bg-green-600 text-white px-4 py-2 rounded"
                          onClick={async () => {
                            try {
                              const res = await api.initializeLateFeePayment({ submissionId: '', amount: 500 });
                              setPaystackUrl(res.paystack.data.authorization_url);
                              toast.success('Redirecting to Paystack...');
                              window.open(res.paystack.data.authorization_url, '_blank');
                            } catch {
                              toast.error('Failed to initialize payment.');
                            }
                          }}
                        >
                          Pay ₦500 Late Fee
                        </button>
                      </div>
                    )}
                    {paystackUrl && (
                      <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
                        <strong>Payment Initialized:</strong> <a href={paystackUrl} target="_blank" rel="noopener noreferrer" className="underline">View Paystack Payment</a>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="githubLink">
                        GitHub Repository URL <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="githubLink"
                        type="url"
                        placeholder="https://github.com/username/repository"
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="codeSubmission">Code Snippet (Optional)</Label>
                      <Textarea
                        id="codeSubmission"
                        placeholder="Paste your code here..."
                        value={codeSubmission}
                        onChange={(e) => setCodeSubmission(e.target.value)}
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipFile">ZIP File (Optional)</Label>
                      <Input
                        id="zipFile"
                        type="file"
                        accept=".zip"
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-gray-500">
                        Maximum file size: 10MB
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Project
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Live Preview & Submission Status */}
          <div className="space-y-6">
            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  See how your project should look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                        Preview
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-4 min-h-[400px]">
                    {project.sampleOutput ? (
                      <img 
                        src={project.sampleOutput} 
                        alt="Sample output" 
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No preview available</p>
                          <p className="text-sm">Complete the project to see the result</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Status */}
            {submission && (
              <Card>
                <CardHeader>
                  <CardTitle>Submission Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge 
                      variant={
                        submission.status === 'accepted' ? 'default' :
                        submission.status === 'rejected' ? 'destructive' :
                        submission.status === 'reviewed' ? 'secondary' : 'outline'
                      }
                    >
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </Badge>
                  </div>

                  {submission.score !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Score</span>
                      <Badge variant="secondary">{submission.score}/100</Badge>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Feedback</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {submission.feedback}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Submitted</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {submission.isLate && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Submitted late</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(submission.githubLink, '_blank')}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      View Repository
                    </Button>
                    {submission.zipFile && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download ZIP
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 