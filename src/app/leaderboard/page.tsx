'use client';

import { useState, useEffect } from 'react';
import { lmsApi } from '@/lib/lms-api-client';
import { StudentMetric, ActivityHeatmap } from '@/types/lms';
import { Trophy, Crown, Medal, Flame, Calendar, Activity, Zap, CheckCircle2 } from 'lucide-react';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [metrics, setMetrics] = useState<StudentMetric[]>([]);
  const [myRank, setMyRank] = useState<{ weekly: StudentMetric | null; monthly: StudentMetric | null }>({
    weekly: null,
    monthly: null,
  });
  const [heatmapData, setHeatmapData] = useState<ActivityHeatmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const [leaderboardRes, rankRes, heatmapRes] = await Promise.all([
        period === 'weekly' ? lmsApi.getWeeklyLeaderboard() : lmsApi.getMonthlyLeaderboard(),
        lmsApi.getMyRank(),
        lmsApi.getActivityHeatmap(),
      ]);

      setMetrics(leaderboardRes.data || []);
      setMyRank(rankRes || { weekly: null, monthly: null });
      setHeatmapData(heatmapRes.metrics || null);
    } catch (e) {
      console.error('Failed to load leaderboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="font-mono text-slate-400 font-bold">#{rank}</span>;
    }
  };

  const currentMyMetric = period === 'weekly' ? myRank.weekly : myRank.monthly;

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Student of the Week & Month Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Community Leaderboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Automated multi-factored rankings (Accuracy 35%, Punctuality 25%, Streak 20%, Community 10%, Projects 10%)
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition ${
                period === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly Leaderboard
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition ${
                period === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Leaderboard
            </button>
          </div>
        </div>

        {/* CURRENT USER STATUS CARD */}
        {currentMyMetric && (
          <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-cyan-900/30 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center font-mono text-xl font-bold text-cyan-400 shadow-inner">
                #{currentMyMetric.rank}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
                  Your Current Rank ({period})
                </span>
                <h2 className="text-xl font-bold text-white">{currentMyMetric.user.full_name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total Rank Score: <span className="text-emerald-400 font-mono font-bold">{currentMyMetric.total_rank_score} pts</span>
                </p>
              </div>
            </div>

            {/* Score Breakdown Pills */}
            <div className="grid grid-cols-5 gap-3 text-center text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-mono">Accuracy</span>
                <span className="font-mono font-bold text-indigo-400">{currentMyMetric.score_breakdown.accuracy}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-mono">Punctuality</span>
                <span className="font-mono font-bold text-cyan-400">{currentMyMetric.score_breakdown.punctuality}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-mono">Streak</span>
                <span className="font-mono font-bold text-amber-400">{currentMyMetric.score_breakdown.streak}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-mono">Community</span>
                <span className="font-mono font-bold text-purple-400">{currentMyMetric.score_breakdown.community}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-mono">Project</span>
                <span className="font-mono font-bold text-emerald-400">{currentMyMetric.score_breakdown.project}</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTRIBUTION HEATMAP GRID */}
        {heatmapData && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>365-Day Contribution Heatmap</span>
              </div>
              <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                <span>Current Streak: <strong className="text-amber-400">{heatmapData.current_streak} days</strong></span>
                <span>Longest Streak: <strong className="text-emerald-400">{heatmapData.longest_streak} days</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-900">
              {heatmapData.heatmap.map((day, idx) => {
                let colorClass = 'bg-slate-900 border-slate-800';
                if (day.level === 1) colorClass = 'bg-emerald-950 border-emerald-900';
                if (day.level === 2) colorClass = 'bg-emerald-800 border-emerald-700';
                if (day.level === 3) colorClass = 'bg-emerald-600 border-emerald-500';
                if (day.level === 4) colorClass = 'bg-emerald-400 border-emerald-300 shadow-glow-emerald';

                return (
                  <div
                    key={idx}
                    title={`${day.date}: ${day.count} activities`}
                    className={`w-3 h-3 rounded-sm border ${colorClass} transition hover:scale-125`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* LEADERBOARD TABLE */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Rank & Student</span>
            <span>Total Score</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">Loading leaderboard metrics...</div>
            ) : metrics.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                No metrics computed yet for this period.
              </div>
            ) : (
              metrics.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {getRankBadge(item.rank)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm flex items-center space-x-2">
                        <span>{item.user.full_name}</span>
                        {item.user.streak_count > 0 && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                            🔥 {item.user.streak_count}d
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-emerald-400">{item.total_rank_score} pts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}