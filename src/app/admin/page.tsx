'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  Shield,
  ClipboardList,
  BarChart3,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  Code,
  CheckCircle2,
} from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import env from '@/config/env';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    total_users: 8,
    active_users: 7,
    suspended_users: 1,
    total_courses: 4,
    total_topics: 28,
    total_submissions: 142,
    active_roles: 8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('summayyah');
      const res = await axios.get(`${env.API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: 'TOTAL USERS',
      value: stats.total_users || 0,
      subtext: `${stats.active_users || 0} active • ${stats.suspended_users || 0} suspended`,
      icon: Users,
      color: 'text-neon-cyan',
      border: 'border-neon-cyan/20',
      bg: 'bg-neon-cyan/5',
    },
    {
      title: 'COURSES & MODULES',
      value: stats.total_courses || 0,
      subtext: `${stats.total_topics || 0} lessons & test suites`,
      icon: BookOpen,
      color: 'text-neon-violet',
      border: 'border-neon-violet/20',
      bg: 'bg-neon-violet/5',
    },
    {
      title: 'CODE SUBMISSIONS',
      value: stats.total_submissions || 0,
      subtext: 'Automated test suite executions',
      icon: Code,
      color: 'text-neon-amber',
      border: 'border-neon-amber/20',
      bg: 'bg-neon-amber/5',
    },
    {
      title: 'ACTIVE ROLES',
      value: stats.active_roles || 0,
      subtext: 'Spatie RBAC scope rules',
      icon: Shield,
      color: 'text-neon-emerald',
      border: 'border-neon-emerald/20',
      bg: 'bg-neon-emerald/5',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Admin Control Studio</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Global management of courses, curriculum, users, and RBAC permissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            asChild
            className="bg-neon-violet text-white hover:bg-neon-violet/90 font-bold text-xs rounded-xl shadow-lg shadow-neon-violet/25"
          >
            <Link href="/admin/courses/create">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create Course</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5 text-xs font-bold rounded-xl"
          >
            <Link href="/admin/users">
              <Users className="w-4 h-4 mr-1.5" />
              <span>User Directory</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`bg-card/40 backdrop-blur-xl border ${card.border} rounded-3xl p-6 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-3xl font-black text-white mt-4 tracking-tight">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Studio Card */}
        <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-neon-violet" />
                <span>Course & Curriculum Builder</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Author courses, structure modular chapters, and embed automated test suites.
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-neon-violet/10 text-neon-violet hover:bg-neon-violet/20 border border-neon-violet/30 text-xs font-bold rounded-xl"
            >
              <Link href="/admin/courses">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin/courses/create"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Create New Course</p>
                  <p className="text-[10px] text-muted-foreground">Add title, description, category, and difficulty</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              href="/admin/courses"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-neon-violet/10 flex items-center justify-center text-neon-violet">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Interactive Module Builder</p>
                  <p className="text-[10px] text-muted-foreground">Add lessons, starter code, and test cases</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </Card>

        {/* User & RBAC Management Card */}
        <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Shield className="w-5 h-5 text-neon-cyan" />
                <span>User Directory & Permissions</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Assign granular Spatie roles, manage staff IDs, departments, and system access.
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 border border-neon-cyan/30 text-xs font-bold rounded-xl"
            >
              <Link href="/admin/users">
                <span>View Directory</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Manage User Roles (Directory)</p>
                  <p className="text-[10px] text-muted-foreground">Assign Lecturer, Supervisor, Admin, or Student</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            <Link
              href="/admin/roles"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-neon-emerald/10 flex items-center justify-center text-neon-emerald">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Roles & Permissions Matrix</p>
                  <p className="text-[10px] text-muted-foreground">Configure access scopes and custom permission sets</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}