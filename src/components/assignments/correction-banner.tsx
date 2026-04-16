'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCorrectionsNeeded } from '@/lib/hooks';
import { AlertTriangle, X, ArrowRight, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CorrectionBanner() {
  const { data, isLoading } = useCorrectionsNeeded();
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (isLoading || dismissed) return null;

  const corrections: any[] = data?.corrections || [];
  if (corrections.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-4 py-2 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="bg-neon-amber/10 border border-neon-amber/40 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 shadow-[0_0_20px_rgba(255,170,0,0.15)] backdrop-blur-md">
          {/* Icon + message */}
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="shrink-0 p-1.5 bg-neon-amber/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-neon-amber" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neon-amber mono-font uppercase tracking-wider">
                {corrections.length === 1
                  ? 'Correction Required'
                  : `${corrections.length} Corrections Required`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {corrections.length === 1
                  ? `"${corrections[0].assignmentTitle}" — your instructor has requested changes.`
                  : `You have ${corrections.length} assignments that need to be corrected and resubmitted.`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {corrections.length === 1 ? (
              <Button
                size="sm"
                className="bg-neon-amber text-black hover:bg-neon-amber/90 mono-font text-xs tracking-wider h-8 shadow-[0_0_10px_rgba(255,170,0,0.3)]"
                onClick={() => router.push(`/assignments/${corrections[0].assignmentId}`)}
              >
                <Edit className="h-3 w-3 mr-1.5" />
                Fix Now
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-neon-amber text-black hover:bg-neon-amber/90 mono-font text-xs tracking-wider h-8 shadow-[0_0_10px_rgba(255,170,0,0.3)]"
                onClick={() => router.push('/assignments')}
              >
                <ArrowRight className="h-3 w-3 mr-1.5" />
                View All
              </Button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
