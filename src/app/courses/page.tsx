'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { lmsApi } from '@/lib/lms-api-client';
import { Course, Module, Topic } from '@/types/lms';
import {
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Code,
  BookOpen,
  Layers,
  ArrowRight,
  Play,
  FileText,
  Video,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Accordion state: openCourseIds & openModuleIds
  const [openCourseIds, setOpenCourseIds] = useState<Record<string, boolean>>({});
  const [openModuleIds, setOpenModuleIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await lmsApi.getCourses();
      const list = res.data || [];
      setCourses(list);

      // Default first course open
      if (list.length > 0) {
        setOpenCourseIds({ [list[0].id]: true });
        if (list[0].modules && list[0].modules.length > 0) {
          setOpenModuleIds({ [list[0].modules[0].id]: true });
        }
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load curriculum.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    setOpenCourseIds((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const toggleModule = (moduleId: string) => {
    setOpenModuleIds((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const getCourseLogo = (title: string, category?: string) => {
    const t = (title + ' ' + (category || '')).toLowerCase();
    if (t.includes('javascript') || t.includes('js') || t.includes('react') || t.includes('node')) {
      return 'JS';
    }
    if (t.includes('python') || t.includes('django') || t.includes('fastapi')) {
      return 'PY';
    }
    if (t.includes('html') || t.includes('css') || t.includes('web')) {
      return '</>';
    }
    if (t.includes('php') || t.includes('laravel')) {
      return 'PHP';
    }
    return '{ }';
  };

  // Filter courses, modules, and topics by search query
  const filteredCourses = courses.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchesCourse = c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
    const matchesModule = c.modules?.some((m) =>
      m.title.toLowerCase().includes(q) || m.topics?.some((t) => t.title.toLowerCase().includes(q))
    );
    return matchesCourse || matchesModule;
  });

  return (
    <div className="min-h-screen bg-[#070A12] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Centered Page Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans">
            Courses
          </h1>
          <p className="text-xs text-slate-400">
            Interactive, test-driven curriculum designed for real engineering mastery.
          </p>
        </div>

        {/* FreeCodeCamp Centered Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons in the curriculum"
            className="w-full bg-[#0D1527] border border-slate-700/80 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-400 outline-none focus:border-neon-cyan transition-colors shadow-xl"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4 max-w-2xl mx-auto pt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-[#0D1527] border border-dashed border-slate-700 max-w-2xl mx-auto">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-300 font-bold">No courses or lessons matching your query.</p>
          </div>
        ) : (
          /* FreeCodeCamp Nested Curriculum List */
          <div className="space-y-4 max-w-2xl mx-auto">
            {filteredCourses.map((course) => {
              const isCourseOpen = openCourseIds[course.id] ?? false;
              const logo = getCourseLogo(course.title, course.category);
              const modulesList = course.modules || [];
              
              const totalCourseSteps = course.total_topics_count || modulesList.flatMap((m) => m.topics || []).length;
              const completedCourseSteps = course.completed_topics_count || modulesList.flatMap((m) => m.topics || []).filter((t) => t.user_progress?.status === 'completed').length;
              const isCourseComplete = totalCourseSteps > 0 && completedCourseSteps === totalCourseSteps;

              return (
                <div
                  key={course.id}
                  className="rounded-xl border border-slate-800 bg-[#0C1222] overflow-hidden shadow-2xl transition-all"
                >
                  {/* Level 1: Course Main Header */}
                  <div
                    onClick={() => toggleCourse(course.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-transparent group select-none"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {/* Status Circle */}
                      <div className="shrink-0">
                        {isCourseComplete ? (
                          <div className="w-5 h-5 rounded-full bg-neon-emerald/20 text-neon-emerald flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-500 flex items-center justify-center text-[10px] text-slate-400 font-mono" />
                        )}
                      </div>

                      {/* Tech Icon Box */}
                      <div className="px-2.5 py-1 rounded bg-[#162035] border border-slate-700 text-xs font-black font-mono text-neon-cyan shrink-0">
                        {logo}
                      </div>

                      {/* Title */}
                      <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-neon-cyan transition-colors truncate">
                        {course.title}
                      </h2>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0 pl-2">
                      <span className="text-xs font-mono text-slate-400">
                        {completedCourseSteps} of {totalCourseSteps} steps complete
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isCourseOpen ? 'rotate-180 text-neon-cyan' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Level 2 & 3: Modules and Lessons when Course is Open */}
                  {isCourseOpen && (
                    <div className="border-t border-slate-800/80 divide-y divide-slate-800/50 bg-[#080D1A]">
                      {modulesList.length === 0 ? (
                        <div className="p-4 text-xs text-slate-500 italic text-center">
                          Curriculum modules are being published.
                        </div>
                      ) : (
                        modulesList.map((mod, modIdx) => {
                          const isModOpen = openModuleIds[mod.id] ?? false;
                          const topicsList = mod.topics || [];
                          const modTotal = topicsList.length;
                          const modCompleted = topicsList.filter((t) => t.user_progress?.status === 'completed').length;
                          const isModComplete = modTotal > 0 && modCompleted === modTotal;

                          return (
                            <div key={mod.id} className="transition-colors">
                              {/* Level 2: Module Section Row */}
                              <div
                                onClick={() => toggleModule(mod.id)}
                                className={`p-3.5 sm:px-5 flex items-center justify-between cursor-pointer transition-colors select-none ${
                                  isModOpen ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                                }`}
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <ChevronRight
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                      isModOpen ? 'rotate-90 text-neon-cyan' : ''
                                    }`}
                                  />
                                  
                                  {/* Module Status Circle */}
                                  <div className="shrink-0">
                                    {isModComplete ? (
                                      <CheckCircle2 className="w-4 h-4 text-neon-emerald" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border border-slate-600" />
                                    )}
                                  </div>

                                  <span className="text-sm font-semibold text-slate-200 truncate">
                                    {mod.title}
                                  </span>
                                </div>

                                <span className="text-xs font-mono text-slate-400 shrink-0 pl-2">
                                  {modCompleted} of {modTotal} steps complete
                                </span>
                              </div>

                              {/* Level 3: Nested Lessons inside Module */}
                              {isModOpen && (
                                <div className="pl-9 sm:pl-11 pr-4 py-2 space-y-1 bg-[#050914] border-t border-slate-800/40">
                                  {topicsList.length === 0 ? (
                                    <div className="py-2 text-xs text-slate-500 italic">
                                      No lessons in this section.
                                    </div>
                                  ) : (
                                    topicsList.map((topic, topIdx) => {
                                      const isTopicDone = topic.user_progress?.status === 'completed';
                                      const isLab = topic.type === 'code_playground';
                                      const isTheory = topic.type === 'written';
                                      const isVideo = topic.type === 'video_embed' || topic.type === 'video_link';

                                      return (
                                        <Link
                                          key={topic.id}
                                          href={`/courses/${course.slug}/topics/${topic.id}`}
                                          className="py-2 px-2.5 rounded-lg flex items-center justify-between hover:bg-white/[0.05] transition-colors group cursor-pointer"
                                        >
                                          <div className="flex items-center space-x-3 min-w-0">
                                            {/* Step Status Icon */}
                                            <div className="shrink-0">
                                              {isTopicDone ? (
                                                <div className="w-4 h-4 rounded-full bg-neon-emerald/20 text-neon-emerald flex items-center justify-center">
                                                  <CheckCircle2 className="w-3.5 h-3.5 text-neon-emerald" />
                                                </div>
                                              ) : (
                                                <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-slate-400" />
                                              )}
                                            </div>

                                            {/* Lesson Title */}
                                            <span
                                              className={`text-xs sm:text-sm transition-colors truncate ${
                                                isTopicDone
                                                  ? 'text-slate-300 font-medium'
                                                  : 'text-slate-200 group-hover:text-white font-medium group-hover:underline'
                                              }`}
                                            >
                                              {topic.title}
                                            </span>

                                            {/* freeCodeCamp Style Badges: [Lab] or [Theory] or [Video] */}
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

                                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-neon-cyan transition-all shrink-0 ml-2" />
                                        </Link>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
