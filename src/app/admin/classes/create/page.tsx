'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateClassPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateClassForm />
    </ProtectedRoute>
  );
}

function CreateClassForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxStudents: 30,
    startDate: '',
    endDate: '',
    settings: {
      latePenalty: 10,
      maxLateHours: 24,
      requireApproval: false,
      allowStudentInvites: false,
      allowLateSubmissions: true,
      notificationSettings: {
        push: true,
        email: true
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createAdminClass(formData);
      toast.success('Class created successfully!');
      router.push('/admin/classes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
            <h1 className="text-3xl font-bold">Create New Class</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create a new class for students to enroll in
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Class Details
              </CardTitle>
              <CardDescription>
                Fill in the details for the new class. Students will be able to join using the enrollment code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter class name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Maximum Students</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxStudents}
                      onChange={(e) => handleChange('maxStudents', parseInt(e.target.value))}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe what this class is about..."
                    rows={4}
                    required
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Class Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Class Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latePenalty">Late Penalty (%)</Label>
                      <Input
                        id="latePenalty"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.settings.latePenalty}
                        onChange={(e) => handleChange('settings.latePenalty', parseInt(e.target.value))}
                        placeholder="10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxLateHours">Maximum Late Hours</Label>
                      <Input
                        id="maxLateHours"
                        type="number"
                        min="0"
                        value={formData.settings.maxLateHours}
                        onChange={(e) => handleChange('settings.maxLateHours', parseInt(e.target.value))}
                        placeholder="24"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowLateSubmissions}
                        onChange={(e) => handleChange('settings.allowLateSubmissions', e.target.checked)}
                        className="rounded"
                      />
                      Allow Late Submissions
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.requireApproval}
                        onChange={(e) => handleChange('settings.requireApproval', e.target.checked)}
                        className="rounded"
                      />
                      Require Approval for Submissions
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowStudentInvites}
                        onChange={(e) => handleChange('settings.allowStudentInvites', e.target.checked)}
                        className="rounded"
                      />
                      Allow Students to Invite Others
                    </Label>
                  </div>
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
                    {loading ? 'Creating...' : 'Create Class'}
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