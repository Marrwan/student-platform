'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { lmsApi } from '@/lib/lms-api-client';
import { Course, Module, Topic } from '@/types/lms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  Code,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Award,
  Layers,
  Video,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseSlug = params?.courseSlug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openModuleIds, setOpenModuleIds] = useState<Record<string, boolean>>({});
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (courseSlug) {
      fetchCourseData();
    }
  }, [courseSlug, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const res = await lmsApi.getCourse(courseSlug);
      const courseData: any = (res as any).data?.data || res.data;

      if (!courseData) {
        toast.error('Course not found.');
        return;
      }

      setCourse(courseData);
      setIsEnrolled(Boolean(courseData.is_enrolled));

      const rawModules: Module[] = courseData.modules || [];
      setModules(rawModules);

      // Open all modules by default
      const openMap: Record<string, boolean> = {};
      rawModules.forEach((m) => {
        openMap[m.id] = true;
      });
      setOpenModuleIds(openMap);
    } catch (error) {
      console.error('Failed to load course details from server:', error);
      toast.error('Failed to load course details from server.');
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!course) return;

    try {
      setEnrolling(true);
      await lmsApi.enrollCourse(course.id);
      setIsEnrolled(true);
      toast.success(`Successfully enrolled in ${course.title}!`);
      await fetchCourseData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (id: string) => {
    setOpenModuleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const findFirstAvailableTopic = (): { topicId: string; title: string } | null => {
    for (const mod of modules) {
      if (mod.topics && mod.topics.length > 0) {
        return { topicId: mod.topics[0].id, title: mod.topics[0].title };
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan" />
      </div>
    );
  }

  const firstLesson = findFirstAvailableTopic();

  return (
    <div className="min-h-screen bg-black text-foreground py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Course Header Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-card/40 backdrop-blur-xl border border-white/10 relative overflow-hidden space-y-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-neon-cyan/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-neon-violet/10 blur-[100px] pointer-events-none" />

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10 text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full font-mono"
            >
              {course?.category || 'Software Engineering'}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/5 text-muted-foreground text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full font-mono"
            >
              {course?.difficulty || 'Beginner'}
            </Badge>
            {isEnrolled && (
              <Badge
                className="bg-neon-emerald/15 text-neon-emerald border border-neon-emerald/30 text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full font-mono flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Enrolled • In Progress</span>
              </Badge>
            )}
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {course?.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed max-w-3xl">
              {course?.description ||
                'Sequential modular roadmap with interactive browser test execution, code challenges, and automated certificate generation.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/5 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-neon-cyan" />
              <span>{modules.length} Modules</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-neon-violet" />
              <span>Interactive Code Studio</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-neon-amber" />
              <span>Verified Certificate</span>
            </div>
          </div>

          {/* Course Progress Bar (freeCodeCamp style) */}
          {isEnrolled && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300 font-bold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
                  Course Progress
                </span>
                <span className="font-mono font-black text-neon-emerald">
                  {course?.progress_percentage ?? 0}% Completed ({course?.completed_topics_count ?? 0}/{course?.total_topics_count ?? 0} Lessons)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-neon-cyan via-neon-emerald to-neon-violet transition-all duration-500 rounded-full shadow-lg shadow-neon-emerald/20"
                  style={{ width: `${Math.max(course?.progress_percentage ?? 0, 2)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            {isEnrolled ? (
              firstLesson ? (
                <Button
                  asChild
                  className="bg-gradient-to-r from-neon-emerald to-neon-cyan text-black font-extrabold text-sm px-8 py-6 rounded-xl shadow-lg shadow-neon-emerald/25 hover:opacity-90 transition-opacity"
                >
                  <Link href={`/courses/${courseSlug}/topics/${firstLesson.topicId}`}>
                    <span>Continue Learning</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <div className="text-xs text-neon-emerald font-mono bg-neon-emerald/10 border border-neon-emerald/20 px-4 py-2 rounded-xl">
                  Enrolled! Lessons are being prepared by instructor.
                </div>
              )
            ) : (
              <Button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-gradient-to-r from-neon-cyan to-neon-violet text-black font-black text-sm px-8 py-6 rounded-xl shadow-lg shadow-neon-cyan/25 hover:opacity-90 transition-opacity"
              >
                <span>{enrolling ? 'Enrolling...' : 'Enroll in Course (Instant Free Access)'}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Course Syllabus / Modules Tree */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
              <BookOpen className="w-5 h-5 text-neon-cyan" />
              <span>Curriculum & Lessons</span>
            </h2>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Sequential Progression</span>
          </div>

          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-semibold">No modules published yet for this course.</p>
              </div>
            ) : (
              modules.map((mod, idx) => {
                const isOpen = openModuleIds[mod.id] ?? true;
                const topicsList = mod.topics || [];
                const modTotal = topicsList.length;
                const modCompleted = topicsList.filter((t) => t.user_progress?.status === 'completed').length;
                const isModComplete = modTotal > 0 && modCompleted === modTotal;

                return (
                  <div
                    key={mod.id}
                    className="rounded-2xl border border-slate-800 bg-[#0C1222] overflow-hidden shadow-xl"
                  >
                    {/* Section Accordion Header */}
                    <div
                      onClick={() => toggleModule(mod.id)}
                      className="p-4 sm:p-5 cursor-pointer hover:bg-white/[0.03] transition-colors flex items-center justify-between select-none"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-90 text-neon-cyan' : ''
                          }`}
                        />
                        
                        {/* Status Circle */}
                        <div className="shrink-0">
                          {isModComplete ? (
                            <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-600" />
                          )}
                        </div>

                        <span className="text-base font-bold text-white truncate">{mod.title}</span>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 pl-2">
                        <span className="text-xs font-mono text-slate-400">
                          {modCompleted} of {modTotal} steps complete
                        </span>
                      </div>
                    </div>

                    {/* Section Lessons List */}
                    {isOpen && (
                      <div className="border-t border-slate-800/80 divide-y divide-slate-800/40 bg-[#070B16] pl-6 sm:pl-10 pr-4 py-2">
                        {modTotal > 0 ? (
                          topicsList.map((topic) => {
                            const isTopicDone = topic.user_progress?.status === 'completed';
                            const isLab = topic.type === 'code_playground';
                            const isTheory = topic.type === 'written';
                            const isVideo = topic.type === 'video_embed' || topic.type === 'video_link';

                            return (
                              <div
                                key={topic.id}
                                className="py-3 px-2 rounded-xl flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  {/* Step Circle */}
                                  <div className="shrink-0">
                                    {isTopicDone ? (
                                      <div className="w-4 h-4 rounded-full bg-neon-emerald/20 text-neon-emerald flex items-center justify-center">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-neon-emerald" />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-slate-400" />
                                    )}
                                  </div>

                                  <Link
                                    href={`/courses/${courseSlug}/topics/${topic.id}`}
                                    className={`text-xs sm:text-sm font-medium transition-colors truncate ${
                                      isTopicDone
                                        ? 'text-slate-300'
                                        : 'text-slate-200 group-hover:text-white group-hover:underline'
                                    }`}
                                  >
                                    {topic.title}
                                  </Link>

                                  {/* freeCodeCamp Style Badges */}
                                  {isLab && (
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-lime-500/40 text-lime-400 bg-lime-500/10 shrink-0">
                                      Lab
                                    </span>
                                  )}
                                  {isTheory && (
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-400 bg-amber-500/10 shrink-0">
                                      Theory
                                    </span>
                                  )}
                                  {isVideo && (
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10 shrink-0">
                                      Video
                                    </span>
                                  )}
                                </div>

                                <Button
                                  asChild
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-slate-400 hover:text-neon-cyan hover:bg-white/5 h-8 px-3 rounded-lg"
                                >
                                  <Link href={`/courses/${courseSlug}/topics/${topic.id}`}>
                                    <span>{isTopicDone ? 'Review' : 'Start'}</span>
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </Link>
                                </Button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-500 italic p-4">No lessons in this module yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
