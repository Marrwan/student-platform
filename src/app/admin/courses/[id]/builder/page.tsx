'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import env from '@/config/env';
import { Course, Module, Topic, TestCase } from '@/types/lms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Layers,
  Code,
  FileText,
  Save,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Video,
  Play,
  CheckSquare,
  Eye,
  Edit3,
  X,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { getEmbedUrl } from '@/lib/utils';

export default function CourseBuilderPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  // Module modal states
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingModule, setAddingModule] = useState(false);

  // Topic modal state
  const [addingTopicToModuleId, setAddingTopicToModuleId] = useState<string | null>(null);
  const [newTopicForm, setNewTopicForm] = useState({
    title: '',
    type: 'code_playground' as 'code_playground' | 'written' | 'video_embed',
    runner_type: 'browser_js' as 'browser_js' | 'html_css' | 'python',
    estimated_minutes: 15,
  });

  // Selected topic for editing
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<'content' | 'starter_code' | 'solution' | 'tests' | 'preview'>('content');
  const [savingTopic, setSavingTopic] = useState(false);

  // Test cases for selected topic
  const [testCases, setTestCases] = useState<any[]>([]);
  const [newTestCase, setNewTestCase] = useState({
    description: '',
    input_payload: '',
    expected_output: '',
    points: 10,
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('summayyah');
      const res = await axios.get(`${env.API_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const courseData = res.data?.data || res.data?.course || res.data;
      setCourse(courseData);

      const mods = courseData?.modules || [];
      setModules(mods);

      if (mods.length > 0 && mods[0].topics?.length > 0) {
        if (!selectedTopic) {
          selectTopicForEdit(mods[0].topics[0]);
        } else {
          // Keep current selection refreshed
          const found = mods.flatMap((m: any) => m.topics || []).find((t: any) => t.id === selectedTopic.id);
          if (found) selectTopicForEdit(found);
        }
      }
    } catch (e) {
      console.error('Failed to load course:', e);
      toast.error('Failed to load course curriculum.');
    } finally {
      setLoading(false);
    }
  };

  const selectTopicForEdit = (topic: any) => {
    const starter = typeof topic.starter_code === 'string'
      ? topic.starter_code
      : (topic.starter_code?.code || topic.starter_code?.js || '// Write your solution here\nfunction solution() {\n  return true;\n}\n');

    const content = topic.content_markdown || topic.body_markdown || `# ${topic.title}\n\nLesson explanation and guide here.`;

    setSelectedTopic({
      ...topic,
      content_markdown: content,
      starter_code: starter,
      solution_code: topic.solution_code || '',
      type: topic.type || 'code_playground',
      runner_type: topic.runner_type || 'browser_js',
      video_url: topic.video_url || '',
      estimated_minutes: topic.estimated_minutes || 15,
    });

    if (topic.assessment?.test_cases) {
      setTestCases(topic.assessment.test_cases);
    } else {
      setTestCases([]);
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;

    try {
      const token = Cookies.get('summayyah');
      await axios.post(
        `${env.API_URL}/modules`,
        {
          course_id: courseId,
          title: newModuleTitle.trim(),
          order_index: modules.length + 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Module created successfully!');
      setNewModuleTitle('');
      setAddingModule(false);
      fetchCourseData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;

    try {
      const token = Cookies.get('');
      await axios.delete(`${env.API_URL}/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Module deleted');
      if (selectedTopic?.module_id === moduleId) {
        setSelectedTopic(null);
      }
      fetchCourseData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete module');
    }
  };

  const handleCreateTopic = async () => {
    if (!addingTopicToModuleId || !newTopicForm.title.trim()) return;

    try {
      const token = Cookies.get('');
      const defaultStarter = newTopicForm.type === 'code_playground'
        ? `// Challenge: ${newTopicForm.title}\nfunction solve(input) {\n  // Write your code here\n  return input;\n}\n`
        : '';

      const res = await axios.post(
        `${env.API_URL}/topics`,
        {
          module_id: addingTopicToModuleId,
          title: newTopicForm.title.trim(),
          type: newTopicForm.type,
          runner_type: newTopicForm.runner_type,
          content_markdown: `# ${newTopicForm.title}\n\n### Overview\nExplain the concept here.\n\n### Instructions\nProvide step-by-step guidance.`,
          starter_code: { code: defaultStarter, js: defaultStarter },
          solution_code: `// Solution\nfunction solve(input) {\n  return input;\n}\n`,
          estimated_minutes: newTopicForm.estimated_minutes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Lesson created!');
      setAddingTopicToModuleId(null);
      setNewTopicForm({
        title: '',
        type: 'code_playground',
        runner_type: 'browser_js',
        estimated_minutes: 15,
      });

      await fetchCourseData();
      if (res.data?.data) {
        selectTopicForEdit(res.data.data);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Failed to create lesson');
    }
  };

  const handleSaveTopic = async () => {
    if (!selectedTopic) return;

    try {
      setSavingTopic(true);
      const token = Cookies.get('');
      await axios.put(
        `${env.API_URL}/topics/${selectedTopic.id}`,
        {
          title: selectedTopic.title,
          type: selectedTopic.type,
          runner_type: selectedTopic.runner_type,
          content_markdown: selectedTopic.content_markdown,
          starter_code: selectedTopic.starter_code,
          solution_code: selectedTopic.solution_code,
          test_cases: testCases,
          video_url: selectedTopic.video_url || null,
          estimated_minutes: parseInt(selectedTopic.estimated_minutes) || 15,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Lesson updated successfully!');
      fetchCourseData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update lesson');
    } finally {
      setSavingTopic(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const token = Cookies.get('');
      await axios.delete(`${env.API_URL}/topics/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Lesson deleted');
      if (selectedTopic?.id === topicId) {
        setSelectedTopic(null);
      }
      fetchCourseData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const handleAddTestCase = () => {
    if (!newTestCase.description.trim() || !newTestCase.expected_output.trim()) {
      toast.error('Please enter description and expected output.');
      return;
    }

    const updated = [
      ...testCases,
      {
        id: 'tc_' + Date.now(),
        ...newTestCase,
      },
    ];
    setTestCases(updated);
    setNewTestCase({
      description: '',
      input_payload: '',
      expected_output: '',
      points: 10,
    });
    toast.success('Test assertion rule added (saved with lesson)');
  };

  const handleDeleteTestCase = (idx: number) => {
    setTestCases(testCases.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-violet" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-white text-xs">
            <Link href="/admin/courses">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Courses</span>
            </Link>
          </Button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div>
            <h1 className="text-lg font-bold text-white truncate">{course?.title}</h1>
            <p className="text-xs text-muted-foreground font-mono">Curriculum & Topic Authoring Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 text-xs font-bold"
          >
            <Link href={`/courses/${course?.slug}`} target="_blank">
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Preview Student View
            </Link>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Builder Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px]">
        {/* Left Column: Modules & Topics Tree */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-neon-violet" /> Course Modules ({modules.length})
            </span>
            <Button
              onClick={() => setAddingModule(true)}
              size="sm"
              variant="outline"
              className="border-neon-violet/30 text-neon-violet hover:bg-neon-violet/10 text-xs font-bold h-7 px-2.5 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Module
            </Button>
          </div>

          {/* Add Module Input Box */}
          {addingModule && (
            <div className="p-3 bg-card/60 backdrop-blur-xl border border-neon-violet/40 rounded-xl space-y-2 shadow-lg shadow-neon-violet/10">
              <span className="text-xs font-bold text-white">Create New Module</span>
              <Input
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Module title (e.g. Chapter 1: Fundamentals)"
                className="bg-black/50 border-white/10 text-xs rounded-lg h-8"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setAddingModule(false)} className="h-7 text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddModule}
                  className="h-7 text-xs bg-neon-violet text-white font-bold"
                >
                  Create Module
                </Button>
              </div>
            </div>
          )}

          {/* Modules List */}
          <div className="space-y-3">
            {modules.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center">
                <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-semibold">No modules yet.</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Click "Add Module" to start structuring your course.</p>
              </div>
            ) : (
              modules.map((mod, idx) => (
                <Card key={mod.id} className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">
                      {idx + 1}. {mod.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setAddingTopicToModuleId(mod.id)}
                        className="text-[11px] text-neon-cyan hover:bg-neon-cyan/10 px-2 py-0.5 rounded font-bold flex items-center transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-0.5" /> Lesson
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        title="Delete Module"
                        className="text-muted-foreground hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Topic Items in Module */}
                  <div className="space-y-1.5 pl-2 border-l border-white/10">
                    {mod.topics && mod.topics.length > 0 ? (
                      mod.topics.map((t) => {
                        const isSelected = selectedTopic?.id === t.id;
                        return (
                          <div
                            key={t.id}
                            className={`w-full rounded-lg text-xs font-medium transition-all flex items-center justify-between group ${
                              isSelected
                                ? 'bg-neon-violet/20 text-neon-violet font-bold border border-neon-violet/30'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <button
                              onClick={() => selectTopicForEdit(t)}
                              className="flex-1 text-left px-3 py-2 flex items-center gap-2 truncate"
                            >
                              {t.type === 'video_embed' ? (
                                <Video className="w-3.5 h-3.5 text-neon-amber shrink-0" />
                              ) : t.type === 'written' ? (
                                <FileText className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                              ) : (
                                <Code className="w-3.5 h-3.5 text-neon-violet shrink-0" />
                              )}
                              <span className="truncate">{t.title}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTopic(t.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-400 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[11px] text-muted-foreground/50 italic py-1">No lessons in this chapter.</p>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Topic Lesson Editor & Starter Code */}
        <div className="lg:col-span-8">
          {selectedTopic ? (
            <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1 block">
                    Lesson Title
                  </label>
                  <Input
                    value={selectedTopic.title || ''}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, title: e.target.value })}
                    placeholder="Lesson Title"
                    className="bg-black/50 border-white/10 text-base font-bold text-white rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleSaveTopic}
                  disabled={savingTopic}
                  className="bg-gradient-to-r from-neon-violet to-neon-cyan text-white hover:opacity-90 font-bold text-xs px-6 py-5 rounded-xl shadow-lg shadow-neon-violet/25 shrink-0"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>{savingTopic ? 'Saving...' : 'Save Lesson'}</span>
                </Button>
              </div>

              {/* Lesson Settings Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1 block">
                    Lesson Type
                  </label>
                  <select
                    value={selectedTopic.type || 'code_playground'}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, type: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan"
                  >
                    <option value="code_playground">Interactive Code Playground</option>
                    <option value="written">Written / Article Lesson</option>
                    <option value="video_embed">Video Embed (YouTube / Loom)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1 block">
                    Runner Engine
                  </label>
                  <select
                    value={selectedTopic.runner_type || 'browser_js'}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, runner_type: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan"
                  >
                    <option value="browser_js">Browser JavaScript</option>
                    <option value="html_css">HTML / CSS Web Sandbox</option>
                    <option value="python">Python Pyodide Engine</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1 block">
                    Estimated Minutes
                  </label>
                  <Input
                    type="number"
                    value={selectedTopic.estimated_minutes || 15}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, estimated_minutes: parseInt(e.target.value) || 15 })}
                    className="bg-black/50 border-white/10 text-xs text-white rounded-xl"
                  />
                </div>
              </div>

              {/* Video URL if type is video */}
              {selectedTopic.type === 'video_embed' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-neon-amber block">
                      Video URL (YouTube, Vimeo, Loom, or Embed Link)
                    </label>
                    <span className="text-[10px] text-muted-foreground">Automatically converted to embed format</span>
                  </div>
                  <Input
                    value={selectedTopic.video_url || ''}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="bg-black/50 border-white/10 text-xs text-white rounded-xl"
                  />
                  {selectedTopic.video_url && getEmbedUrl(selectedTopic.video_url) && (
                    <div className="aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-white/10 bg-black mt-2">
                      <iframe
                        src={getEmbedUrl(selectedTopic.video_url)!}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title="Preview"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab Navigation for Content & Code */}
              <div className="flex border-b border-white/10 gap-2">
                <button
                  onClick={() => setActiveEditorTab('content')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
                    activeEditorTab === 'content'
                      ? 'bg-white/10 text-neon-cyan border-b-2 border-neon-cyan'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lesson Instructions</span>
                </button>
                <button
                  onClick={() => setActiveEditorTab('preview')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
                    activeEditorTab === 'preview'
                      ? 'bg-white/10 text-neon-cyan border-b-2 border-neon-cyan'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Markdown Preview</span>
                </button>
                <button
                  onClick={() => setActiveEditorTab('starter_code')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
                    activeEditorTab === 'starter_code'
                      ? 'bg-white/10 text-neon-violet border-b-2 border-neon-violet'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Starter Code</span>
                </button>
                <button
                  onClick={() => setActiveEditorTab('solution')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
                    activeEditorTab === 'solution'
                      ? 'bg-white/10 text-neon-emerald border-b-2 border-neon-emerald'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Solution Code</span>
                </button>
                <button
                  onClick={() => setActiveEditorTab('tests')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 ${
                    activeEditorTab === 'tests'
                      ? 'bg-white/10 text-neon-amber border-b-2 border-neon-amber'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Test Assertions ({testCases.length})</span>
                </button>
              </div>

              {/* Tab 1: Lesson Instructions Markdown */}
              {activeEditorTab === 'content' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Lesson Markdown Content</span>
                    <span className="text-[11px] text-muted-foreground font-mono">Supports GitHub Flavored Markdown</span>
                  </div>
                  <Textarea
                    value={selectedTopic.content_markdown || ''}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, content_markdown: e.target.value })}
                    rows={12}
                    className="bg-black/50 border-white/10 font-mono text-xs text-white rounded-xl resize-y"
                    placeholder="# Lesson Title&#10;&#10;Explain the problem and instructions here..."
                  />
                </div>
              )}

              {/* Tab 2: Markdown Live Preview */}
              {activeEditorTab === 'preview' && (
                <div className="p-6 bg-black/40 border border-white/10 rounded-2xl min-h-[300px] max-h-[500px] overflow-y-auto prose prose-invert max-w-none text-sm leading-relaxed">
                  <ReactMarkdown>{selectedTopic.content_markdown || '*No content written yet.*'}</ReactMarkdown>
                </div>
              )}

              {/* Tab 3: Starter Code */}
              {activeEditorTab === 'starter_code' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neon-violet">Student Initial Starter Code</span>
                    <span className="text-[11px] text-muted-foreground font-mono">Boilerplate displayed in student editor</span>
                  </div>
                  <Textarea
                    value={selectedTopic.starter_code || ''}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, starter_code: e.target.value })}
                    rows={12}
                    className="bg-black/50 border-white/10 font-mono text-xs text-neon-cyan rounded-xl resize-y"
                    placeholder="// Provide student boilerplate code here"
                  />
                </div>
              )}

              {/* Tab 4: Solution Code */}
              {activeEditorTab === 'solution' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neon-emerald">Model Solution Code</span>
                    <span className="text-[11px] text-muted-foreground font-mono">Reference solution for automated verification</span>
                  </div>
                  <Textarea
                    value={selectedTopic.solution_code || ''}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, solution_code: e.target.value })}
                    rows={12}
                    className="bg-black/50 border-white/10 font-mono text-xs text-neon-emerald rounded-xl resize-y"
                    placeholder="// Model solution code"
                  />
                </div>
              )}

              {/* Tab 5: Test Assertions */}
              {activeEditorTab === 'tests' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-neon-amber block">Automated Test Assertions</span>
                      <span className="text-[11px] text-muted-foreground">Each rule will be verified when student clicks "Check Your Code"</span>
                    </div>
                  </div>

                  {/* Add New Test Form */}
                  <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-white">Add Assertion Rule</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1 block">
                          Rule Description (Shown to Student)
                        </label>
                        <Input
                          value={newTestCase.description}
                          onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                          placeholder="e.g. reverseString('hello') should return 'olleh'"
                          className="bg-black/60 border-white/10 text-xs rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1 block">
                          Expected Output / Assertion Match
                        </label>
                        <Input
                          value={newTestCase.expected_output}
                          onChange={(e) => setNewTestCase({ ...newTestCase, expected_output: e.target.value })}
                          placeholder="e.g. olleh"
                          className="bg-black/60 border-white/10 text-xs rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddTestCase}
                        size="sm"
                        className="bg-neon-amber text-black font-bold text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Rule
                      </Button>
                    </div>
                  </div>

                  {/* Existing Tests List */}
                  <div className="space-y-2">
                    {testCases.map((tc, idx) => (
                      <div
                        key={tc.id || idx}
                        className="p-3 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neon-cyan">{idx + 1}.</span>
                          <span className="text-white font-medium">{tc.description}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                            Expects: {tc.expected_output}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteTestCase(idx)}
                          className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border border-dashed border-white/10 rounded-3xl text-center space-y-3">
              <div>
                <Code className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-white">Select a lesson from the left to edit content</p>
                <p className="text-xs text-muted-foreground mt-1">Or click "+ Lesson" on any module to create one.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Topic Dialog */}
      {addingTopicToModuleId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-white text-base">Add New Lesson</span>
              <button
                onClick={() => setAddingTopicToModuleId(null)}
                className="text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Lesson Title</label>
                <Input
                  value={newTopicForm.title}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, title: e.target.value })}
                  placeholder="e.g. Build a String Inverter"
                  className="bg-black/50 border-white/10 text-xs rounded-xl"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Lesson Format</label>
                <select
                  value={newTopicForm.type}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, type: e.target.value as any })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan"
                >
                  <option value="code_playground">Interactive Code Playground</option>
                  <option value="written">Written / Article Lesson</option>
                  <option value="video_embed">Video Embed Lesson</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Execution Engine</label>
                <select
                  value={newTopicForm.runner_type}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, runner_type: e.target.value as any })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan"
                >
                  <option value="browser_js">Browser JavaScript</option>
                  <option value="html_css">HTML / CSS Web Sandbox</option>
                  <option value="python">Python Pyodide Engine</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Estimated Minutes</label>
                <Input
                  type="number"
                  value={newTopicForm.estimated_minutes}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, estimated_minutes: parseInt(e.target.value) || 15 })}
                  className="bg-black/50 border-white/10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setAddingTopicToModuleId(null)}
                className="text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTopic}
                className="bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-bold text-xs px-5 rounded-xl shadow-lg shadow-neon-cyan/20"
              >
                Create Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
