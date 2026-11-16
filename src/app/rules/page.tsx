'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Trophy,
  Award,
  Zap,
  Code2,
  CheckCircle2,
  Lock,
  Sparkles,
  Heart,
} from 'lucide-react';

export default function RulesPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center space-x-3">
            {user ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs font-mono transition"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs font-mono transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Code of Conduct & Guidelines</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Learning Platform Standard & Guidelines
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Everything you need to know about course progression, live code execution, student recognition, deadlines, and certificates.
          </p>
        </div>

        {/* CORE RULES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rule 1: Sequential Progression */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-indigo-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">1. Sequential Topic Progression</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              To build mastery, topics and modules follow a sequential learning path. Completing Topic A automatically unlocks Topic B. You cannot skip core prerequisites.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 font-mono">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant unlock upon completing topic exercises</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sequential module locking & prerequisites</span>
              </li>
            </ul>
          </div>

          {/* Rule 2: Live Code Playground & Runner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-cyan-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">2. Automated Test Execution</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Coding topics and assessments are evaluated automatically against predefined test cases.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 font-mono">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Real-time terminal output & error feedback</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Visible & hidden test case assertion matching</span>
              </li>
            </ul>
          </div>

          {/* Rule 3: Deadlines & Paystack Unlock */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">3. Module Deadlines & Paystack Unlocking</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Each module has a target completion timeline. If a deadline passes, the module locks to keep you accountable.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 font-mono">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Overdue modules unlock instantly via Paystack payment</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Maintains learning discipline and pace</span>
              </li>
            </ul>
          </div>

          {/* Rule 4: Student Recognition Engine */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-purple-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">4. Student of the Week & Month Rankings</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Rankings are calculated automatically every week and month using our transparent 5-vector formula:
            </p>
            <ul className="text-xs text-slate-400 space-y-1 font-mono">
              <li className="flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Accuracy & Pass Rate (35%)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Punctuality & Zero Overdues (25%)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Activity Streak (20%)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Community Q&A Upvotes (10%)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-pink-400" />
                <span>Capstone Project Scores (10%)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CERTIFICATES & SHOWCASE SECTION */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-cyan-900/30 border border-indigo-500/30 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Verified Certificates & Capstone Showcase</h2>
              <p className="text-xs text-slate-400 mt-1">
                Earn shareable credentials and build your public developer portfolio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Course Completion Certificate</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                When you complete all topics in a course, Laravel automatically generates an official PDF certificate with a public verification UUID that anyone can verify online.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Public Project Showcase Gallery</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Submit capstone projects with live preview URLs or GitHub code to feature in the public community gallery and earn upvotes from peers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}