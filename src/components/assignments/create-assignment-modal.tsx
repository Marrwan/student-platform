'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Link, 
  Code, 
  Eye, 
  Calendar, 
  Clock, 
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface CreateAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onSuccess: () => void;
}

interface AssignmentFormData {
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  maxScore: number;
  requirements: string;
  submissionMode: 'code' | 'link' | 'both';
  sampleOutputType: 'url' | 'code' | 'none';
  sampleOutputUrl: string;
  sampleOutputCode: {
    html: string;
    css: string;
    javascript: string;
  };
  paymentRequired: boolean;
  paymentAmount: number;
  allowLateSubmission: boolean;
  latePenalty: number;
}

export function CreateAssignmentModal({ open, onOpenChange, classId, onSuccess }: CreateAssignmentModalProps) {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    startDate: '',
    deadline: '',
    maxScore: 100,
    requirements: '',
    submissionMode: 'both',
    sampleOutputType: 'none',
    sampleOutputUrl: '',
    sampleOutputCode: {
      html: '',
      css: '',
      javascript: ''
    },
    paymentRequired: false,
    paymentAmount: 500,
    allowLateSubmission: true,
    latePenalty: 10
  });

  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        classId,
        startDate: formData.startDate,
        deadline: formData.deadline,
        maxScore: formData.maxScore,
        requirements: formData.requirements,
        submissionMode: formData.submissionMode,
        sampleOutputUrl: formData.sampleOutputType === 'url' ? formData.sampleOutputUrl : undefined,
        sampleOutputCode: formData.sampleOutputType === 'code' ? formData.sampleOutputCode : undefined,
        paymentRequired: formData.paymentRequired,
        paymentAmount: formData.paymentAmount,
        allowLateSubmission: formData.allowLateSubmission,
        latePenalty: formData.latePenalty
      };

      await api.createAssignment(assignmentData);
      toast.success('Assignment created successfully!');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        startDate: '',
        deadline: '',
        maxScore: 100,
        requirements: '',
        submissionMode: 'both',
        sampleOutputType: 'none',
        sampleOutputUrl: '',
        sampleOutputCode: {
          html: '',
          css: '',
          javascript: ''
        },
        paymentRequired: false,
        paymentAmount: 500,
        allowLateSubmission: true,
        latePenalty: 10
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (formData.sampleOutputType === 'url' && formData.sampleOutputUrl) {
      return (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-4 h-4" />
            <span className="font-medium">Sample Output URL</span>
          </div>
          <a 
            href={formData.sampleOutputUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neon-cyan hover:underline break-all"
          >
            {formData.sampleOutputUrl}
          </a>
        </div>
      );
    }

    if (formData.sampleOutputType === 'code') {
      return (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4" />
            <span className="font-medium">Sample Output Preview</span>
          </div>
          <div className="bg-background rounded p-4 min-h-[200px]">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <style>${formData.sampleOutputCode.css}</style>
                </head>
                <body>
                  ${formData.sampleOutputCode.html}
                  <script>${formData.sampleOutputCode.javascript}</script>
                </body>
                </html>
              `}
              className="w-full h-64 border rounded"
              title="Sample Output Preview"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="text-center text-muted-foreground py-8">
        <Eye className="w-8 h-8 mx-auto mb-2" />
        <p>No sample output configured</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Create a new assignment with enhanced features including sample output, submission modes, and payment requirements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="submission">Submission</TabsTrigger>
              <TabsTrigger value="sample">Sample Output</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter assignment description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxScore">Maximum Score</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                    min="1"
                    max="1000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="latePenalty">Late Penalty (%)</Label>
                  <Input
                    id="latePenalty"
                    type="number"
                    value={formData.latePenalty}
                    onChange={(e) => setFormData(prev => ({ ...prev, latePenalty: parseInt(e.target.value) }))}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Enter assignment requirements"
                  rows={4}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="submission" className="space-y-4">
              <div>
                <Label htmlFor="submissionMode">Submission Mode</Label>
                <Select 
                  value={formData.submissionMode} 
                  onValueChange={(value: 'code' | 'link' | 'both') => setFormData(prev => ({ ...prev, submissionMode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Code or Link</SelectItem>
                    <SelectItem value="code">Code Only</SelectItem>
                    <SelectItem value="link">Link Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowLateSubmission"
                  checked={formData.allowLateSubmission}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowLateSubmission: checked as boolean }))}
                />
                <Label htmlFor="allowLateSubmission">Allow Late Submissions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="paymentRequired"
                  checked={formData.paymentRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, paymentRequired: checked as boolean }))}
                />
                <Label htmlFor="paymentRequired">Require Payment for Late Submissions</Label>
              </div>

              {formData.paymentRequired && (
                <div>
                  <Label htmlFor="paymentAmount">Payment Amount (₦)</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: parseInt(e.target.value) }))}
                    min="100"
                    step="100"
                    required
                  />
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>When enabled, students who submit after the deadline will be required to pay ₦{formData.paymentAmount} to regain access to the platform.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sample" className="space-y-4">
              <div>
                <Label htmlFor="sampleOutputType">Sample Output Type</Label>
                <Select 
                  value={formData.sampleOutputType} 
                  onValueChange={(value: 'url' | 'code' | 'none') => setFormData(prev => ({ ...prev, sampleOutputType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sample Output</SelectItem>
                    <SelectItem value="url">Website URL</SelectItem>
                    <SelectItem value="code">HTML/CSS/JS Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.sampleOutputType === 'url' && (
                <div>
                  <Label htmlFor="sampleOutputUrl">Sample Output URL</Label>
                  <Input
                    id="sampleOutputUrl"
                    type="url"
                    value={formData.sampleOutputUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, sampleOutputUrl: e.target.value }))}
                    placeholder="https://example.com/sample-output"
                  />
                </div>
              )}

              {formData.sampleOutputType === 'code' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="html">HTML Code</Label>
                    <Textarea
                      id="html"
                      value={formData.sampleOutputCode.html}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        sampleOutputCode: { ...prev.sampleOutputCode, html: e.target.value }
                      }))}
                      placeholder="<div>Sample HTML</div>"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="css">CSS Code</Label>
                    <Textarea
                      id="css"
                      value={formData.sampleOutputCode.css}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        sampleOutputCode: { ...prev.sampleOutputCode, css: e.target.value }
                      }))}
                      placeholder="body { color: blue; }"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="javascript">JavaScript Code</Label>
                    <Textarea
                      id="javascript"
                      value={formData.sampleOutputCode.javascript}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        sampleOutputCode: { ...prev.sampleOutputCode, javascript: e.target.value }
                      }))}
                      placeholder="console.log('Hello World');"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Assignment Preview</h3>
                <Badge variant="outline">
                  {formData.submissionMode === 'both' ? 'Code or Link' : 
                   formData.submissionMode === 'code' ? 'Code Only' : 'Link Only'}
                </Badge>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{formData.title || 'Assignment Title'}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {formData.deadline ? new Date(formData.deadline).toLocaleString() : 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Score: {formData.maxScore} points</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90 mb-4">{formData.description || 'No description provided'}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Requirements:</h4>
                    <p className="text-sm text-muted-foreground">{formData.requirements || 'No requirements specified'}</p>
                  </div>

                  {formData.paymentRequired && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">Payment Required for Late Submissions</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Students must pay ₦{formData.paymentAmount} to regain access after deadline.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <h4 className="font-medium mb-2">Sample Output</h4>
                {renderPreview()}
              </div>
            </TabsContent>
          </Tabs>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
