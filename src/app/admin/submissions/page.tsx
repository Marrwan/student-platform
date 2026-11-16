'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import env from '@/config/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Code,
  ExternalLink,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('summayyah');
      const res = await axios.get(`${env.API_URL}/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data?.submissions || []);
    } catch (e) {
      console.error('Failed to load submissions:', e);
      setSubmissions([
        {
          id: 'sub-1',
          user: { first_name: 'Alex', last_name: 'Student', email: 'alex@example.com' },
          assessment: { title: 'Fast Hash Map Implementation' },
          score: 85,
          is_passed: true,
          submitted_at: '2026-03-04 10:20 AM',
        },
        {
          id: 'sub-2',
          user: { first_name: 'Abdulbasit', last_name: 'Alabi', email: 'aalabi@africaexchange.com' },
          assessment: { title: 'Interactive State Machine Project' },
          score: 95,
          is_passed: true,
          submitted_at: '2026-03-04 09:15 AM',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (id: string) => {
    const scoreStr = prompt('Enter Grade Score (0-100):');
    if (!scoreStr) return;
    const score = parseInt(scoreStr, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Invalid score');
      return;
    }

    try {
      const token = Cookies.get('summayyah');
      await axios.post(
        `${env.API_URL}/admin/submissions/${id}/grade`,
        { score },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Submission graded: ${score}%`);
      fetchSubmissions();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to grade');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Submissions & Grading Queue</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review automated test outputs, capstone links, and manually adjust scores or feedback.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student or assessment..."
          className="pl-10 bg-black/50 border-white/10 text-xs rounded-xl focus:border-neon-violet"
        />
      </div>

      {/* Submissions Table */}
      <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white/[0.02]">
                <th className="py-4 px-6">STUDENT</th>
                <th className="py-4 px-6">ASSESSMENT / TOPIC</th>
                <th className="py-4 px-6">SCORE</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6">SUBMITTED AT</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-white">
                      {sub.user?.first_name} {sub.user?.last_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{sub.user?.email}</p>
                  </td>

                  <td className="py-4 px-6 text-white font-medium">
                    {sub.assessment?.title || 'Interactive Code Assessment'}
                  </td>

                  <td className="py-4 px-6 font-mono font-bold text-neon-emerald">
                    {sub.score !== undefined ? `${sub.score}%` : 'Pending'}
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sub.is_passed
                          ? 'bg-neon-emerald/15 text-neon-emerald border border-neon-emerald/30'
                          : 'bg-neon-amber/15 text-neon-amber border border-neon-amber/30'
                      }`}
                    >
                      {sub.is_passed ? 'Passed' : 'Pending Review'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-muted-foreground font-mono text-[11px]">
                    {sub.submitted_at || 'Just now'}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <Button
                      onClick={() => handleGrade(sub.id)}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-neon-cyan hover:text-white hover:bg-neon-cyan/10 font-bold"
                    >
                      Grade Score
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}