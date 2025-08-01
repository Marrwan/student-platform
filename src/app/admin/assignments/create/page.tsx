'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  enrollmentCode: string;
}

export default function CreateAssignmentPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateAssignmentForm />
    </ProtectedRoute>
  );
}

function CreateAssignmentForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    type: 'fullstack',
    difficulty: 'easy',
    maxScore: 100,
    startDate: '',
    deadline: '',
    requirements: '',
    sampleOutput: '',
    hints: '',
    submissionTypes: ['github', 'code', 'zip'],
    latePenalty: 10,
    allowLateSubmission: true,
    maxLateHours: 24,
    requirePayment: false,
    lateFeeAmount: 500
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await api.getAdminClasses();
      setClasses(response.classes || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createAdminAssignment(formData);
      toast.success('Assignment created successfully!');
      router.push('/admin/assignments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Assignment</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create a new assignment for a class
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Assignment Details
              </CardTitle>
              <CardDescription>
                Fill in the details for the new assignment. Students in the selected class will be able to see and submit this assignment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Enter assignment title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classId">Class *</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) => handleChange('classId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.enrollmentCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe what this assignment is about..."
                    rows={4}
                    required
                  />
                </div>

                {/* Assignment Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Assignment Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="css">CSS</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="fullstack">Full Stack</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => handleChange('difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxScore">Maximum Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.maxScore}
                      onChange={(e) => handleChange('maxScore', parseInt(e.target.value))}
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline *</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    placeholder="List the requirements for this assignment..."
                    rows={6}
                    required
                  />
                </div>

                {/* Sample Output */}
                <div className="space-y-2">
                  <Label htmlFor="sampleOutput">Sample Output (Optional)</Label>
                  <Textarea
                    id="sampleOutput"
                    value={formData.sampleOutput}
                    onChange={(e) => handleChange('sampleOutput', e.target.value)}
                    placeholder="Provide a sample of what the output should look like..."
                    rows={4}
                  />
                </div>

                {/* Hints */}
                <div className="space-y-2">
                  <Label htmlFor="hints">Hints (Optional)</Label>
                  <Textarea
                    id="hints"
                    value={formData.hints}
                    onChange={(e) => handleChange('hints', e.target.value)}
                    placeholder="Provide helpful hints for students..."
                    rows={3}
                  />
                </div>

                {/* Late Submission Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Late Submission Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latePenalty">Late Penalty (%)</Label>
                      <Input
                        id="latePenalty"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.latePenalty}
                        onChange={(e) => handleChange('latePenalty', parseInt(e.target.value))}
                        placeholder="10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxLateHours">Maximum Late Hours</Label>
                      <Input
                        id="maxLateHours"
                        type="number"
                        min="0"
                        value={formData.maxLateHours}
                        onChange={(e) => handleChange('maxLateHours', parseInt(e.target.value))}
                        placeholder="24"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.allowLateSubmission}
                        onChange={(e) => handleChange('allowLateSubmission', e.target.checked)}
                        className="rounded"
                      />
                      Allow Late Submissions
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.requirePayment}
                        onChange={(e) => handleChange('requirePayment', e.target.checked)}
                        className="rounded"
                      />
                      Require Payment for Late Submissions
                    </Label>
                  </div>

                  {formData.requirePayment && (
                    <div className="space-y-2">
                      <Label htmlFor="lateFeeAmount">Late Fee Amount (₦)</Label>
                      <Input
                        id="lateFeeAmount"
                        type="number"
                        min="0"
                        value={formData.lateFeeAmount}
                        onChange={(e) => handleChange('lateFeeAmount', parseInt(e.target.value))}
                        placeholder="500"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Creating...' : 'Create Assignment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 