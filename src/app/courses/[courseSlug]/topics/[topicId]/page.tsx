'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LearningStudio } from '@/components/studio/LearningStudio';
import { lmsApi } from '@/lib/lms-api-client';
import { Topic } from '@/types/lms';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code } from 'lucide-react';
import Link from 'next/link';

export default function TopicStudioPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params?.courseSlug as string;
  const topicId = params?.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topicId) {
      fetchTopic();
    }
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await lmsApi.getTopic(topicId);
      setTopic(res.data);
    } catch (err: any) {
      console.error('Failed to load topic:', err);
      setError(err?.response?.data?.message || 'Failed to load this topic. It may be locked or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextTopic = () => {
    router.push(`/courses/${courseSlug}`);
  };

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan" />
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Loading Interactive Studio...</span>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-[#0C1222] shadow-2xl space-y-5">
          <div className="w-12 h-12 rounded-full bg-neon-rose/20 text-neon-rose flex items-center justify-center mx-auto">
            <Code className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Lesson Unavailable</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || 'The requested lesson could not be loaded.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              asChild
              className="w-full bg-neon-cyan hover:bg-neon-cyan/90 text-black font-bold text-xs"
            >
              <Link href={`/courses/${courseSlug}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Course Syllabus
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={fetchTopic}
              className="w-full border-white/10 text-slate-300 hover:text-white text-xs"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-foreground flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <div className="h-14 border-b border-white/10 bg-card/60 backdrop-blur-xl px-4 flex items-center justify-between z-30">
        <div className="flex items-center space-x-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-white text-xs"
          >
            <Link href={`/courses/${courseSlug}`}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Syllabus</span>
            </Link>
          </Button>
          <div className="h-4 w-[1px] bg-white/10" />
          <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
            {topic.title}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded-full border border-neon-cyan/20">
            Interactive Studio
          </span>
        </div>
      </div>

      {/* Main Split-Pane Learning Studio */}
      <div className="flex-1 min-h-0">
        <LearningStudio topic={topic} onTopicCompleted={handleNextTopic} />
      </div>
    </div>
  );
}
