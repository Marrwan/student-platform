'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Code, 
  Link, 
  Upload,
  Calendar,
  Clock,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  type: string;
  difficulty: string;
  maxScore: number;
  startDate: string;
  deadline: string;
  requirements?: string;
  sampleOutputUrl?: string;
  sampleOutputCode?: {
    html: string;
    css: string;
    javascript: string;
  };
  submissionMode: 'code' | 'link' | 'both';
  paymentRequired: boolean;
  paymentAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface Class {
  id: string;
  name: string;
  description: string;
}

export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'fullstack',
    difficulty: 'easy',
    maxScore: 100,
    startDate: '',
    deadline: '',
    requirements: '',
    submissionMode: 'both' as 'code' | 'link' | 'both',
    paymentRequired: false,
    paymentAmount: 500,
    sampleOutputUrl: '',
    sampleOutputCode: {
      html: '',
      css: '',
      javascript: ''
    }
  });

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const assignmentData = await api.getAssignment(assignmentId);
      setAssignment(assignmentData);
      
      // Load class data
      if (assignmentData.classId) {
        const classData = await api.getClass(assignmentData.classId);
        setClassData(classData);
      }

      // Populate form data
      setFormData({
        title: assignmentData.title || '',
        description: assignmentData.description || '',
        type: assignmentData.type || 'fullstack',
        difficulty: assignmentData.difficulty || 'easy',
        maxScore: assignmentData.maxScore || 100,
        startDate: assignmentData.startDate ? new Date(assignmentData.startDate).toISOString().split('T')[0] : '',
        deadline: assignmentData.deadline ? new Date(assignmentData.deadline).toISOString().split('T')[0] : '',
        requirements: assignmentData.requirements || '',
        submissionMode: assignmentData.submissionMode || 'both',
        paymentRequired: assignmentData.paymentRequired || false,
        paymentAmount: assignmentData.paymentAmount || 500,
        sampleOutputUrl: assignmentData.sampleOutputUrl || '',
        sampleOutputCode: assignmentData.sampleOutputCode || {
          html: '',
          css: '',
          javascript: ''
        }
      });
    } catch (error: any) {
      console.error('Error loading assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        deadline: new Date(formData.deadline).toISOString(),
        sampleOutputUrl: formData.sampleOutputUrl || undefined,
        sampleOutputCode: formData.sampleOutputCode.html || formData.sampleOutputCode.css || formData.sampleOutputCode.javascript 
          ? formData.sampleOutputCode 
          : undefined
      };

      await api.updateAssignment(assignmentId, updateData);
      toast.success('Assignment updated successfully!');
      router.push(`/admin/assignments/${assignmentId}/submissions`);
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSampleCodeChange = (field: 'html' | 'css' | 'javascript', value: string) => {
    setFormData(prev => ({
      ...prev,
      sampleOutputCode: {
        ...prev.sampleOutputCode,
        [field]: value
      }
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'frontend': return 'bg-blue-100 text-blue-800';
      case 'backend': return 'bg-purple-100 text-purple-800';
      case 'fullstack': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assignment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Assignment not found or you don't have access to it.</AlertDescription>
        </Alert>
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
            <h1 className="text-2xl font-bold">Edit Assignment</h1>
            <p className="text-gray-600">
              {classData?.name && `Class: ${classData.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getTypeColor(assignment.type)}>
            {assignment.type}
          </Badge>
          <Badge className={getDifficultyColor(assignment.difficulty)}>
            {assignment.difficulty}
          </Badge>
        </div>
      </div>

      {/* Assignment Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Start Date:</span>
              <span className="font-medium">
                {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Deadline:</span>
              <span className="font-medium">
                {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Max Score:</span>
              <span className="font-medium">{assignment.maxScore} points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="sample">Sample Output</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the assignment requirements"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="fullstack">Full Stack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxScore">Max Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      value={formData.maxScore}
                      onChange={(e) => handleInputChange('maxScore', parseInt(e.target.value))}
                      min="1"
                      max="1000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements (Optional)</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="Detailed requirements for the assignment"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sample Output Tab */}
          <TabsContent value="sample" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sample Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sampleOutputUrl">Sample Output URL (Optional)</Label>
                  <Input
                    id="sampleOutputUrl"
                    type="url"
                    value={formData.sampleOutputUrl}
                    onChange={(e) => handleInputChange('sampleOutputUrl', e.target.value)}
                    placeholder="https://example.com/sample-output"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Sample Output Code (Optional)</Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="html" className="text-sm">HTML</Label>
                    <Textarea
                      id="html"
                      value={formData.sampleOutputCode.html}
                      onChange={(e) => handleSampleCodeChange('html', e.target.value)}
                      placeholder="<div>Sample HTML code</div>"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="css" className="text-sm">CSS</Label>
                    <Textarea
                      id="css"
                      value={formData.sampleOutputCode.css}
                      onChange={(e) => handleSampleCodeChange('css', e.target.value)}
                      placeholder=".sample { color: blue; }"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="javascript" className="text-sm">JavaScript</Label>
                    <Textarea
                      id="javascript"
                      value={formData.sampleOutputCode.javascript}
                      onChange={(e) => handleSampleCodeChange('javascript', e.target.value)}
                      placeholder="console.log('Sample JavaScript');"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submission Tab */}
          <TabsContent value="submission" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="submissionMode">Submission Mode</Label>
                  <Select value={formData.submissionMode} onValueChange={(value: 'code' | 'link' | 'both') => handleInputChange('submissionMode', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code">Code Upload Only</SelectItem>
                      <SelectItem value="link">Link Submission Only</SelectItem>
                      <SelectItem value="both">Both Code and Link</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose how students can submit their assignments
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="paymentRequired"
                    checked={formData.paymentRequired}
                    onChange={(e) => handleInputChange('paymentRequired', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="paymentRequired">Require payment for late submissions</Label>
                </div>

                {formData.paymentRequired && (
                  <div>
                    <Label htmlFor="paymentAmount">Payment Amount (₦)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={formData.paymentAmount}
                      onChange={(e) => handleInputChange('paymentAmount', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      placeholder="500"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Amount students must pay if they miss the deadline
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
