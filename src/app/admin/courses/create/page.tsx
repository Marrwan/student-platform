'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import env from '@/config/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateCoursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    difficulty: 'beginner',
    category: 'Software Engineering',
  });

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, title: val, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      toast.error('Title and Slug are required.');
      return;
    }

    try {
      setSubmitting(true);
      const token = Cookies.get('summayyah');
      const res = await axios.post(`${env.API_URL}/courses`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Course created successfully!');
      const createdId = res.data?.data?.id || res.data?.course?.id;
      if (createdId) {
        router.push(`/admin/courses/${createdId}/builder`);
      } else {
        router.push('/admin/courses');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back button */}
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-white text-xs">
        <Link href="/admin/courses">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Courses</span>
        </Link>
      </Button>

      {/* Form Card */}
      <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
        <CardHeader className="p-0 pb-6 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-violet/10 border border-neon-violet/20 text-neon-violet text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Course Authoring Studio</span>
          </div>
          <CardTitle className="text-2xl font-black text-white">Create New Course</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Set up course basics. You will be able to add modules, topics, and code assessments next.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Title</label>
            <Input
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Distributed Systems & Microservices in Go"
              className="bg-black/50 border-white/10 rounded-xl text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL Slug</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. distributed-systems-in-go"
              className="bg-black/50 border-white/10 rounded-xl text-sm font-mono text-neon-cyan"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty Level</label>
              <Select
                value={formData.difficulty}
                onValueChange={(val) => setFormData({ ...formData, difficulty: val })}
              >
                <SelectTrigger className="bg-black/50 border-white/10 rounded-xl text-xs">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 border-white/10">
                  <SelectItem value="beginner" className="text-xs">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="text-xs">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="text-xs">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Backend Development, DevOps, AI"
                className="bg-black/50 border-white/10 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description & Overview</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will students learn and build in this curriculum?"
              rows={4}
              className="bg-black/50 border-white/10 rounded-xl text-sm resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <Button
              type="button"
              asChild
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-xs font-bold rounded-xl"
            >
              <Link href="/admin/courses">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-neon-violet text-white hover:bg-neon-violet/90 text-xs font-bold rounded-xl px-6 py-5 shadow-lg shadow-neon-violet/20"
            >
              <Save className="w-4 h-4 mr-2" />
              <span>{submitting ? 'Creating...' : 'Save & Open Builder →'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
