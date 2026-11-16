'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { lmsApi } from '@/lib/lms-api-client';
import { Course } from '@/types/lms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Layers, Code, Settings, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await lmsApi.getCourses();
      setCourses(res.data || []);
    } catch (e) {
      console.error('Failed to load courses:', e);
      setCourses([
        {
          id: '1',
          title: 'Full-Stack JavaScript Mastery',
          slug: 'full-stack-javascript',
          description: 'Comprehensive modern JavaScript curriculum with automated test suites.',
          difficulty: 'intermediate',
          category: 'Web Development',
          modules_count: 8,
          topics_count: 42,
        } as any,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Courses & Curriculum</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Build and manage courses, modules, lessons, and automated test cases.
          </p>
        </div>

        <Button
          asChild
          className="bg-neon-violet text-white hover:bg-neon-violet/90 font-bold text-xs rounded-xl shadow-lg shadow-neon-violet/25"
        >
          <Link href="/admin/courses/create">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create New Course</span>
          </Link>
        </Button>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-card/20 border border-dashed border-white/10 space-y-4">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h3 className="text-lg font-bold text-white">No courses created yet</h3>
          <p className="text-xs text-muted-foreground">Click below to create your first curriculum.</p>
          <Button asChild className="bg-neon-violet text-white text-xs font-bold rounded-xl mt-2">
            <Link href="/admin/courses/create">Create Course</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-neon-violet/40 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-neon-violet/30 text-neon-violet bg-neon-violet/10 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {course.category || 'General'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-muted-foreground"
                  >
                    {course.difficulty || 'All Levels'}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-neon-violet transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/5 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-neon-cyan" />
                    <span>{course.modules_count || 0} Modules</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-neon-violet" />
                    <span>{course.topics_count || 0} Lessons</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-2">
                <Button
                  asChild
                  className="flex-1 bg-neon-violet text-white hover:bg-neon-violet/90 font-bold text-xs py-5 rounded-xl shadow-lg shadow-neon-violet/20"
                >
                  <Link href={`/admin/courses/${course.id}/builder`}>
                    <Layers className="w-3.5 h-3.5 mr-1.5" />
                    <span>Open Builder</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="border-white/10 hover:bg-white/5 rounded-xl h-10 w-10 shrink-0"
                >
                  <Link href={`/courses/${course.slug}`} target="_blank" title="Preview Student View">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
