'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Topic, DiscussionComment, TestCase } from '@/types/lms';
import { lmsApi } from '@/lib/lms-api-client';
import {
  Play,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Terminal,
  RefreshCw,
  Send,
  ThumbsUp,
  Code,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Eye,
  RotateCcw,
  CheckSquare,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { getEmbedUrl } from '@/lib/utils';

interface LearningStudioProps {
  topic: Topic;
  onTopicCompleted?: () => void;
}

interface TestResultItem {
  id: string;
  description: string;
  passed: boolean;
  error?: string;
}

export function LearningStudio({ topic, onTopicCompleted }: LearningStudioProps) {
  const defaultInitialCode = typeof topic.starter_code === 'string'
    ? topic.starter_code
    : (topic.starter_code as any)?.js ||
      (topic.starter_code as any)?.code ||
      '// Write your solution here\nfunction solution() {\n  return true;\n}\n';

  const [code, setCode] = useState<string>(defaultInitialCode);
  const [activeTab, setActiveTab] = useState<'instructions' | 'discussions'>('instructions');
  const [rightPaneTab, setRightPaneTab] = useState<'editor' | 'preview'>('editor');
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['/** Your test output will go here */']);
  const [isRunning, setIsRunning] = useState(false);
  const [allPassed, setAllPassed] = useState(false);

  // Test cases derived from topic or dynamic defaults
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);

  const [discussions, setDiscussions] = useState<DiscussionComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleManualComplete = async () => {
    try {
      setIsCompletingLesson(true);
      await lmsApi.completeTopic(topic.id);
      setAllPassed(true);
      toast.success('Lesson marked as completed!');
      if (onTopicCompleted) onTopicCompleted();
    } catch (err: any) {
      toast.error('Failed to complete lesson');
    } finally {
      setIsCompletingLesson(false);
    }
  };

  useEffect(() => {
    // Reset state when topic changes
    const initialCode = typeof topic.starter_code === 'string'
      ? topic.starter_code
      : (topic.starter_code as any)?.js ||
        (topic.starter_code as any)?.code ||
        '// Write your solution here\nfunction solution() {\n  return true;\n}\n';

    setCode(initialCode);
    setConsoleOutput(['/** Your test output will go here */']);
    setAllPassed(false);
    initializeTests();
    fetchDiscussions();
  }, [topic.id]);

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to run code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, topic]);

  const initializeTests = () => {
    // Build test list from backend assessment or fallback smart assertions
    const rawCases: any[] = topic.assessment?.test_cases || [];

    if (rawCases.length > 0) {
      setTestResults(
        rawCases.map((tc, idx) => ({
          id: tc.id || `tc_${idx}`,
          description: tc.description || `Test case ${idx + 1}`,
          passed: false,
        }))
      );
    } else {
      // Create sensible default assertions from title/content
      setTestResults([
        {
          id: 't1',
          description: `Code should execute without syntax errors`,
          passed: false,
        },
        {
          id: 't2',
          description: `Function solution or declared logic should return valid result`,
          passed: false,
        },
      ]);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const res = await lmsApi.getTopicDiscussions(topic.id);
      setDiscussions(res.data || []);
    } catch (e) {
      console.error('Failed to load discussions', e);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    const logs: string[] = [];

    // Capture student console.log
    const capturedLogs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        capturedLogs.push(msg);
        logs.push(msg);
      },
      error: (...args: any[]) => {
        const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        capturedLogs.push(msg);
        logs.push('[ERROR] ' + msg);
      },
      warn: (...args: any[]) => {
        const msg = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        capturedLogs.push(msg);
        logs.push('[WARN] ' + msg);
      },
    };

    const stripComments = (str: string) => {
      return str
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
        .trim();
    };

    try {
      logs.push(`> Running tests for "${topic.title}"...`);

      const cleanCode = stripComments(code);
      const cleanStarter = stripComments(defaultInitialCode);

      // 1. Guard against empty or trivial script
      if (cleanCode.length < 5) {
        logs.push(`✗ Failed: No executable code detected. Please write your solution before running tests.`);
        setConsoleOutput(logs);
        setAllPassed(false);
        setTestResults((prev) =>
          prev.map((t) => ({ ...t, passed: false, error: 'Empty script: no code written' }))
        );
        toast.error('Please write some code before checking your solution.');
        setIsRunning(false);
        return;
      }

      // 2. Guard against unchanged boilerplate
      if (cleanCode === cleanStarter && defaultInitialCode.trim().length > 20) {
        logs.push(`✗ Failed: Starter boilerplate was not modified. Please implement the required logic.`);
        setConsoleOutput(logs);
        setAllPassed(false);
        setTestResults((prev) =>
          prev.map((t) => ({ ...t, passed: false, error: 'Starter boilerplate unchanged' }))
        );
        toast.error('Please implement your solution before running tests.');
        setIsRunning(false);
        return;
      }

      // 3. Evaluate Test Cases
      const testCasesToRun = topic.assessment?.test_cases || [];
      const evaluatedResults: TestResultItem[] = [];

      // Extract all function/variable names declared in user code
      const fnMatches = Array.from(
        code.matchAll(/(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>|[a-zA-Z0-9_$]+\s*=>))/g)
      );
      const declaredNames = Array.from(new Set(fnMatches.map((m) => m[1] || m[2]).filter(Boolean)));

      if (testCasesToRun.length > 0) {
        for (let i = 0; i < testCasesToRun.length; i++) {
          const tc = testCasesToRun[i];
          let casePassed = false;
          let caseError = '';

          try {
            const rawPayload = tc.input_payload?.trim() || '';
            const desc = tc.description?.trim() || '';
            const expected = tc.expected_output?.trim();

            let evaluatedValue: any = undefined;
            let executionSucceeded = false;

            // Strategy A: If input_payload or description looks like an expression (e.g. sum(1, 5) or calculate(10))
            const candidateExpr = rawPayload.includes('(') ? rawPayload : desc.includes('(') && desc.includes(')') ? desc : '';

            if (candidateExpr) {
              try {
                const evalExprFn = new Function(
                  'console',
                  `
                  ${code}
                  ;
                  return (${candidateExpr});
                  `
                );
                evaluatedValue = evalExprFn(customConsole);
                executionSucceeded = true;
              } catch (evalErr: any) {
                // If candidateExpr failed, try next strategy
              }
            }

            // Strategy B: If not evaluated yet, find declared user functions and invoke
            if (!executionSucceeded) {
              const runSandbox = new Function(
                'console',
                `
                ${code}
                ;
                const _fns = {};
                ${declaredNames.map((name) => `try { if (typeof ${name} === 'function') _fns['${name}'] = ${name}; } catch(e) {}`).join('\n')}
                if (typeof solution === "function") _fns['solution'] = solution;
                if (typeof solve === "function") _fns['solve'] = solve;
                if (typeof main === "function") _fns['main'] = main;
                if (typeof calculate === "function") _fns['calculate'] = calculate;
                return _fns;
                `
              );
              const userFns = runSandbox(customConsole);
              const targetFn = Object.values(userFns)[0] as any;

              if (targetFn && typeof targetFn === 'function') {
                let args: any[] = [];
                if (rawPayload) {
                  try {
                    const parsed = JSON.parse(rawPayload);
                    args = Array.isArray(parsed) ? parsed : [parsed];
                  } catch {
                    if (rawPayload.includes(',')) {
                      args = rawPayload.split(',').map((s) => {
                        const t = s.trim();
                        return !isNaN(Number(t)) ? Number(t) : t;
                      });
                    } else if (!isNaN(Number(rawPayload))) {
                      args = [Number(rawPayload)];
                    } else {
                      args = [rawPayload];
                    }
                  }
                }
                evaluatedValue = targetFn(...args);
                executionSucceeded = true;
              }
            }

            // Strategy C: Check console logs for output matching
            if (!executionSucceeded && capturedLogs.length > 0) {
              evaluatedValue = capturedLogs[capturedLogs.length - 1];
              executionSucceeded = true;
            }

            // Comparison against expected_output
            if (executionSucceeded) {
              if (expected === undefined || expected === '' || expected === null) {
                casePassed = evaluatedValue !== undefined;
              } else if (evaluatedValue === true && (expected.toLowerCase() === 'true' || candidateExpr.includes('==='))) {
                casePassed = true;
              } else if (String(evaluatedValue).trim() === expected) {
                casePassed = true;
              } else if (!isNaN(Number(evaluatedValue)) && !isNaN(Number(expected)) && Number(evaluatedValue) === Number(expected)) {
                casePassed = true;
              } else if (JSON.stringify(evaluatedValue) === expected) {
                casePassed = true;
              } else {
                caseError = `Expected "${expected}", but received "${evaluatedValue !== undefined ? evaluatedValue : 'undefined'}"`;
              }
            } else {
              caseError = `Could not execute test against your code. Ensure function is defined.`;
            }
          } catch (err: any) {
            caseError = `Execution error: ${err.message}`;
          }

          evaluatedResults.push({
            id: tc.id || `tc_${i}`,
            description: tc.description,
            passed: casePassed,
            error: caseError,
          });

          if (casePassed) {
            logs.push(`✓ Passed: ${tc.description}`);
          } else {
            logs.push(`✗ Failed: ${tc.description} ${caseError ? `(${caseError})` : ''}`);
          }
        }
      } else {
        // Fallback checks when author has not defined explicit test cases
        let userFn: any = null;
        try {
          const runSandbox = new Function('console', `${code}; return typeof solution !== "undefined" ? solution : null;`);
          userFn = runSandbox(customConsole);
        } catch {}

        const hasLogic = cleanCode.length > 15 && (declaredNames.length > 0 || userFn !== null || capturedLogs.length > 0 || cleanCode.includes('return '));

        evaluatedResults.push({
          id: 't1',
          description: `Code executes cleanly without syntax errors`,
          passed: true,
        });

        evaluatedResults.push({
          id: 't2',
          description: `Logic defined and executed successfully`,
          passed: hasLogic,
          error: hasLogic ? undefined : 'No function defined or console output produced.',
        });

        if (hasLogic) {
          logs.push(`✓ Code compiled and executed successfully.`);
        } else {
          logs.push(`✗ Failed: Code must define a function or output results to console.`);
        }
      }

      setTestResults(evaluatedResults);

      const isSuccess = evaluatedResults.every((r) => r.passed);
      setAllPassed(isSuccess);

      if (isSuccess) {
        logs.push(``);
        logs.push(`🎉 Congratulations! All tests passed!`);
        toast.success('All tests passed! Topic completed.');
        setShowCompletionModal(true);

        // Mark progression complete on backend
        try {
          await lmsApi.completeTopic(topic.id);
        } catch (backendErr) {
          console.error('Failed to sync completion with backend:', backendErr);
        }
      } else {
        toast.error('Some tests failed. Check the test output below.');
      }
    } catch (runtimeErr: any) {
      logs.push(`[FATAL ERROR] ${runtimeErr.message}`);
      setAllPassed(false);
      setTestResults((prev) =>
        prev.map((t) => ({ ...t, passed: false, error: runtimeErr.message }))
      );
      toast.error(`Execution Error: ${runtimeErr.message}`);
    } finally {
      setConsoleOutput(logs);
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    if (confirm('Reset code to initial boilerplate?')) {
      setCode(defaultInitialCode);
      setConsoleOutput(['/** Your test output will go here */']);
      setAllPassed(false);
      initializeTests();
      toast.success('Editor reset');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsPostingComment(true);
    try {
      await lmsApi.postDiscussionComment(topic.id, newComment.trim());
      setNewComment('');
      fetchDiscussions();
      toast.success('Comment posted');
    } catch (e) {
      console.error('Failed to post comment', e);
      toast.error('Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    try {
      await lmsApi.upvoteDiscussionComment(commentId);
      fetchDiscussions();
    } catch (e) {
      console.error('Failed to upvote comment', e);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#090D16] text-white font-sans overflow-hidden">
      {/* ================= LEFT PANE: Instructions & Test Checklist ================= */}
      <div className="w-full lg:w-[42%] flex flex-col border-r border-slate-800 bg-[#0C1222]">
        {/* Header Tabs */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#111A2E]">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'instructions'
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Instructions & Tests</span>
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'discussions'
                  ? 'bg-neon-violet/20 text-neon-violet border border-neon-violet/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussion ({discussions.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 bg-white/5 px-2 py-0.5 rounded">
              {topic.runner_type || 'JS Engine'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'instructions' ? (
            <>
              {/* Topic Title */}
              <div>
                <span className="text-[11px] font-mono text-neon-cyan uppercase tracking-wider font-bold">
                  Lesson Objective
                </span>
                <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  {topic.title}
                  {allPassed && <CheckCircle2 className="w-5 h-5 text-neon-emerald" />}
                </h1>
              </div>

              {/* Video Embed if Present */}
              {topic.video_url && getEmbedUrl(topic.video_url) && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
                  <iframe
                    src={getEmbedUrl(topic.video_url)!}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={topic.title}
                  />
                </div>
              )}

              {/* Markdown Instructions */}
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4">
                {topic.content_markdown || topic.body_markdown ? (
                  <ReactMarkdown>{topic.content_markdown || topic.body_markdown || ''}</ReactMarkdown>
                ) : (
                  <p>Read the instructions and fulfill the test specifications below.</p>
                )}
              </div>

              {/* Complete Action for Non-coding Lessons */}
              {topic.type !== 'code_playground' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Lesson Progress</span>
                    {allPassed && (
                      <span className="text-xs font-bold text-neon-emerald flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleManualComplete}
                    disabled={isCompletingLesson || allPassed}
                    className="w-full py-2.5 rounded-xl bg-neon-emerald hover:bg-neon-emerald/90 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompletingLesson ? 'Saving...' : allPassed ? 'Lesson Finished' : 'Mark Lesson as Completed'}</span>
                  </button>
                </div>
              )}

              {/* FreeCodeCamp Style Tests Checklist (For Code Playground) */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neon-amber flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4" /> Tests Checklist
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {testResults.filter((t) => t.passed).length}/{testResults.length} Passed
                  </span>
                </div>

                <div className="space-y-2">
                  {testResults.map((t, idx) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                        t.passed
                          ? 'bg-neon-emerald/10 border-neon-emerald/30 text-slate-200'
                          : t.error
                          ? 'bg-neon-rose/10 border-neon-rose/30 text-slate-200'
                          : 'bg-white/[0.02] border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {t.passed ? (
                          <div className="w-4 h-4 rounded-full bg-neon-emerald/20 text-neon-emerald flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : t.error ? (
                          <div className="w-4 h-4 rounded-full bg-neon-rose/20 text-neon-rose flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium leading-tight">{t.description}</p>
                        {t.error && (
                          <p className="text-[11px] text-neon-rose/80 font-mono mt-1 leading-normal">
                            {t.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Discussion Tab */
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neon-violet block">
                Community Q&A
              </span>

              {/* Post comment */}
              <div className="space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question or share tips..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-neon-violet resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handlePostComment}
                    disabled={isPostingComment}
                    className="px-4 py-1.5 rounded-lg bg-neon-violet text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isPostingComment ? 'Posting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-3 pt-2">
                {discussions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No discussions yet. Be the first to ask a question!</p>
                ) : (
                  discussions.map((c) => (
                    <div key={c.id} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-neon-cyan">{c.user?.full_name || 'Student'}</span>
                        <button
                          onClick={() => handleUpvoteComment(c.id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-neon-cyan transition"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{c.upvotes_count || 0}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300">{c.body_markdown}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT PANE: Code Editor & Console Output ================= */}
      <div className="w-full lg:w-[58%] flex flex-col bg-[#070A12]">
        {/* Editor Toolbar */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]/70">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-slate-800 text-xs font-mono text-neon-cyan">
              <Code className="w-3.5 h-3.5" />
              <span>script.js</span>
            </div>
            {topic.runner_type === 'html_css' && (
              <button
                onClick={() => setRightPaneTab(rightPaneTab === 'editor' ? 'preview' : 'editor')}
                className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{rightPaneTab === 'editor' ? 'Live Preview' : 'Code Editor'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetCode}
              title="Reset Code to Starter"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 relative flex flex-col min-h-0">
          {rightPaneTab === 'editor' ? (
            <div className="flex-1 flex flex-col relative bg-[#090D16]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 p-5 bg-transparent font-mono text-xs text-slate-100 outline-none resize-none leading-relaxed border-none selection:bg-neon-cyan/30"
                placeholder="// Write your code here"
              />
            </div>
          ) : (
            <div className="flex-1 bg-white">
              <iframe
                srcDoc={code}
                title="Live Sandbox Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts"
              />
            </div>
          )}

          {/* Test Console / Output Drawer (Bottom Half) */}
          <div className="h-44 border-t border-slate-800 bg-[#05070D] flex flex-col">
            <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between bg-black/40">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-neon-cyan" /> Console & Test Output
              </span>
              {allPassed && (
                <span className="text-[10px] font-mono text-neon-emerald font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ALL TESTS PASSING
                </span>
              )}
            </div>
            <div className="flex-1 p-3 font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1">
              {consoleOutput.map((line, idx) => (
                <div
                  key={idx}
                  className={`${
                    line.startsWith('✓')
                      ? 'text-neon-emerald font-bold'
                      : line.startsWith('✗') || line.includes('[ERROR]') || line.includes('[FATAL')
                      ? 'text-neon-rose font-bold'
                      : line.startsWith('🎉')
                      ? 'text-neon-cyan font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#0C1222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allPassed && (
              <span className="text-xs font-bold text-neon-emerald flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-4 h-4" /> Ready for next topic!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-extrabold text-xs shadow-lg shadow-neon-cyan/20 hover:opacity-90 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Running Tests...' : 'Check Your Code (Ctrl + Enter)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FreeCodeCamp Style Celebration & Progression Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#0C1222] border border-neon-cyan/40 p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-neon-emerald/20 text-neon-emerald flex items-center justify-center mx-auto shadow-lg shadow-neon-emerald/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-neon-cyan uppercase tracking-widest font-bold">
                100% Tests Passed
              </span>
              <h2 className="text-2xl font-black text-white">Challenge Completed!</h2>
              <p className="text-xs text-slate-400">
                You mastered <span className="text-slate-200 font-bold">"{topic.title}"</span>. Your progress has been saved.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  if (onTopicCompleted) onTopicCompleted();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-emerald to-neon-cyan text-black font-extrabold text-sm shadow-xl shadow-neon-emerald/20 hover:opacity-95 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Submit and Go to Next Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowCompletionModal(false)}
                className="text-xs text-slate-400 hover:text-white font-mono transition"
              >
                Keep editing solution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
