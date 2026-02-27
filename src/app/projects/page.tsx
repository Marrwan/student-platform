'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Code,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Eye,
  Calendar,
  TrendingUp,
  Target,
  Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProjects, useDebounce } from '@/lib/hooks';
import type { Project } from '@/types';

type ProjectWithStatus = Project & { status: 'missed' | 'pending' | 'locked' };

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsList />
    </ProtectedRoute>
  );
}

function ProjectsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use optimized hook for projects data
  const { data: projectsData, isLoading, error } = useProjects({
    difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Memoize projects with status
  const projects = useMemo(() => {
    if (!projectsData?.data) return [];

    return projectsData.data.map((project: Project) => {
      let status: 'completed' | 'missed' | 'pending' | 'locked' = 'pending';
      if (!!project.isLocked) status = 'locked';
      else if (!!project.isOverdue) status = 'missed';
      // You can add more logic here for 'completed' if you have submission info
      return { ...project, status };
    });
  }, [projectsData]);

  // Memoize filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [projects, debouncedSearchTerm]);

  // Memoize status icon function
  const getStatusIcon = useCallback((status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'missed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Lock className="h-4 w-4 text-gray-400" />;
    }
  }, []);

  // Memoize status color function
  const getStatusColor = useCallback((status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'missed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  }, []);

  // Memoize difficulty color function
  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  }, []);

  // Memoize project statistics
  const projectStats = useMemo(() => {
    // const completed = projects.filter(p => p.status === 'completed').length;
    const pending = projects.filter(p => p.status === 'pending').length;
    const missed = projects.filter(p => p.status === 'missed').length;
    const locked = projects.filter(p => p.status === 'locked').length;
    // const progress = projects.length > 0 ? Math.round((completed / projects.length) * 100) : 0;
    // For now, progress is based on non-locked and non-missed
    const progress = projects.length > 0 ? Math.round(((projects.length - missed - locked) / projects.length) * 100) : 0;
    return { pending, missed, locked, progress };
  }, [projects]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800">
        <h1 className="text-2xl font-bold mb-4">Projects Error</h1>
        <p>{error.message || 'Failed to load projects'}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/95 text-foreground relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-neon-violet/5 blur-[120px]"></div>
      </div>

      {/* Filters */}
      <div className="bg-white/[0.02] backdrop-blur-md border-b border-white/5 relative z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative group/search">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within/search:text-neon-cyan transition-colors h-4 w-4" />
                <Input
                  placeholder="QUERY_DIRECTORY_STORE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-black/40 border-white/10 rounded-xl focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 mono-font uppercase text-[10px] tracking-widest h-11"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-48 bg-black/40 border-white/10 rounded-xl mono-font uppercase text-[10px] tracking-widest h-11 focus:ring-neon-cyan/50">
                  <SelectValue placeholder="DIFFICULTY_INDEX" />
                </SelectTrigger>
                <SelectContent className="bg-card/90 backdrop-blur-2xl border-white/10 rounded-xl">
                  <SelectItem value="all" className="mono-font text-[10px] uppercase">ALL_LEVELS</SelectItem>
                  <SelectItem value="beginner" className="mono-font text-[10px] uppercase">BEGINNER</SelectItem>
                  <SelectItem value="intermediate" className="mono-font text-[10px] uppercase">INTERMEDIATE</SelectItem>
                  <SelectItem value="advanced" className="mono-font text-[10px] uppercase text-red-500">ADVANCED</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-black/40 border-white/10 rounded-xl mono-font uppercase text-[10px] tracking-widest h-11 focus:ring-neon-cyan/50">
                  <SelectValue placeholder="SYNC_STATUS" />
                </SelectTrigger>
                <SelectContent className="bg-card/90 backdrop-blur-2xl border-white/10 rounded-xl">
                  <SelectItem value="all" className="mono-font text-[10px] uppercase">PROJECT_BUFFER</SelectItem>
                  <SelectItem value="completed" className="mono-font text-[10px] uppercase">COMPLETED</SelectItem>
                  <SelectItem value="pending" className="mono-font text-[10px] uppercase">PENDING</SelectItem>
                  <SelectItem value="missed" className="mono-font text-[10px] uppercase">MISSED</SelectItem>
                  <SelectItem value="locked" className="mono-font text-[10px] uppercase">LOCKED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-neon-cyan/5 border border-neon-cyan/10 text-[8px] uppercase tracking-[0.2em] text-neon-cyan mb-2 mono-font">
              <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse"></span>
              OBJECTIVE_LIST_V0.1
            </div>
            <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mono-font">Mission <span className="text-muted-foreground">Directives</span></h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mono-font mt-2">Browse and initialize programming sequences</p>
          </div>
          {user?.role === 'admin' && (
            <Button
              onClick={() => router.push('/admin/projects/create')}
              className="bg-neon-cyan text-black px-8 py-6 rounded-xl font-black text-[10px] uppercase tracking-widest mono-font shadow-glow-cyan hover:scale-105 transition-all"
            >
              <Code className="h-4 w-4 mr-2" />
              CREATE_NEW_VACT
            </Button>
          )}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-white/10">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h3 className="text-xl font-black text-foreground mb-3 uppercase tracking-tight mono-font">
              ZERO_MATCHES_FOUND
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">
              Adjust queries to locate remote technical nodes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className={`bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden cursor-pointer transition-all hover:border-neon-cyan/40 hover:shadow-2xl hover:shadow-neon-cyan/5 group relative ${!!project.isOverdue ? 'border-red-500/30' : ''
                  }`}
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-3xl pointer-events-none group-hover:bg-neon-cyan/10 transition-colors"></div>
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        {getStatusIcon(project.status)}
                        <span className="text-[10px] font-black text-muted-foreground mono-font tracking-[0.2em] uppercase">SEQUENCE_0X{project.day}</span>
                      </div>
                      <CardTitle className="text-xl font-black text-foreground group-hover:text-neon-cyan transition-colors mono-font uppercase tracking-tighter leading-tight">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="mt-4 text-[11px] leading-relaxed text-muted-foreground mono-font uppercase tracking-wide opacity-60 group-hover:opacity-90 transition-opacity line-clamp-3">
                        {project.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getDifficultyColor(project.difficulty)} border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg`}>
                      {project.difficulty}
                    </Badge>
                    <Badge className={`${getStatusColor(project.status)} border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg`}>
                      {project.status || 'LOCKED'}
                    </Badge>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    {typeof (project as any).score === 'number' && (
                      <div className="flex items-center justify-between text-[10px] mono-font uppercase tracking-widest">
                        <span className="text-muted-foreground">VAL_EFFICIENCY</span>
                        <span className="font-black text-neon-emerald">{(project as any).score}%</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] mono-font uppercase tracking-widest">
                      <span className="text-muted-foreground">DEADLINE_LOCK</span>
                      <div className="flex items-center gap-2 text-foreground font-black">
                        <Calendar className="h-3 w-3 text-neon-cyan" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {project.timeRemaining && (
                      <div className="flex items-center justify-between text-[10px] mono-font uppercase tracking-widest">
                        <span className="text-muted-foreground">REMAINING_BUFFER</span>
                        <div className="flex items-center gap-2 font-black">
                          <Clock className="h-3 w-3 text-neon-amber" />
                          <span className={!!project.isOverdue ? 'text-red-500 animate-pulse' : 'text-neon-amber'}>
                            {project.timeRemaining}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl py-6 text-[10px] font-black uppercase tracking-widest mono-font"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/projects/${project.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      PREVIEW
                    </Button>

                    {!project.isLocked && (
                      <Button
                        className="flex-1 bg-neon-cyan text-black hover:bg-neon-cyan/90 rounded-xl py-6 text-[10px] font-black uppercase tracking-widest mono-font shadow-glow-cyan"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/projects/${project.id}`);
                        }}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        BOOTLOAD
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-20">
          <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"></div>
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-xl font-black text-foreground flex items-center gap-3 mono-font uppercase tracking-tighter">
                <TrendingUp className="h-6 w-6 text-neon-cyan" />
                System <span className="text-muted-foreground">Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                <div className="border-l-2 border-neon-cyan pl-6">
                  <div className="text-3xl font-black text-foreground mono-font tracking-tighter mb-2">
                    {projectStats.pending}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">PENDING_NODES</div>
                </div>
                <div className="border-l-2 border-red-500 pl-6">
                  <div className="text-3xl font-black text-red-500 mono-font tracking-tighter mb-2">
                    {projectStats.missed}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">MISSED_FRAMES</div>
                </div>
                <div className="border-l-2 border-white/20 pl-6">
                  <div className="text-3xl font-black text-muted-foreground mono-font tracking-tighter mb-2">
                    {projectStats.locked}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">ENCRYPTED_DATA</div>
                </div>
                <div className="border-l-2 border-neon-emerald pl-6">
                  <div className="text-3xl font-black text-neon-emerald mono-font tracking-tighter mb-2 shadow-glow-emerald">
                    {projectStats.progress}%
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mono-font">SYNC_EFFICIENCY</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 