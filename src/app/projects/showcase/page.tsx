'use client';

import React, { useState, useEffect } from 'react';
import { lmsApi } from '@/lib/lms-api-client';
import { ProjectShowcase } from '@/types/lms';
import { Heart, ExternalLink, Github, Eye, Sparkles, Filter, Code } from 'lucide-react';

export default function PublicShowcasePage() {
  const [submissions, setSubmissions] = useState<ProjectShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState<ProjectShowcase | null>(null);

  useEffect(() => {
    fetchShowcase();
  }, []);

  const fetchShowcase = async () => {
    setLoading(true);
    try {
      const res = await lmsApi.getShowcaseFeed();
      setSubmissions(res.data || []);
    } catch (e) {
      console.error('Failed to load showcase feed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (submissionId: string) => {
    try {
      const res = await lmsApi.toggleProjectLike(submissionId);
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId ? { ...sub, likes_count: res.likes_count } : sub
        )
      );
    } catch (e) {
      console.error('Failed to toggle like', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Public Student Project Showcase Gallery</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Capstone Showcase Gallery
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Explore live interactive web apps and capstone projects built by our students.
            </p>
          </div>
        </div>

        {/* GALLERY GRID */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-sm">
            Loading showcase gallery...
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-sm border border-slate-800 rounded-2xl bg-slate-900/40">
            No project submissions featured in the gallery yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-xl transition group flex flex-col justify-between"
              >
                {/* Header Badge & Author */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      By <strong className="text-slate-200">{sub.user?.full_name || 'Student'}</strong>
                    </span>
                    {sub.is_featured && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition">
                    {sub.project?.title || 'Capstone Project'}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {sub.project?.description}
                  </p>
                </div>

                {/* Actions & Upvotes */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleLike(sub.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40 transition font-mono font-bold"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{sub.likes_count} Likes</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {sub.github_url && (
                      <a
                        href={sub.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                        title="GitHub Code"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}

                    {sub.live_url && (
                      <button
                        onClick={() => setSelectedPreview(sub)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIVE IFRAME PREVIEW MODAL */}
        {selectedPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-[#0F172A] border border-slate-800 w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-cyan-400">Live Preview:</span>
                  <span className="font-bold text-slate-100">{selectedPreview.project?.title}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <a
                    href={selectedPreview.live_url!}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-xs font-mono text-indigo-400 hover:underline"
                  >
                    <span>Open in Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setSelectedPreview(null)}
                    className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1"
                  >
                    Close ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-white">
                <iframe
                  src={selectedPreview.live_url!}
                  className="w-full h-full border-none"
                  title="Live Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
