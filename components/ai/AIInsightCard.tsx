'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AIResponseContent } from '@/components/ai/AIResponseContent';

interface AIInsightCardProps {
  title: string;
  accentClassName: string;
  insights: string[];
  summary?: string;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  accentClassName,
  insights,
  summary,
  isLoading,
  error,
  onRefresh,
}) => (
  <section className={`glass3d overflow-hidden rounded-[28px] border bg-white dark:bg-zinc-900 ${accentClassName}`}>
    <div className="border-b border-black/5 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.8),_transparent_50%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.72))] p-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(24,24,27,0.96),rgba(24,24,27,0.84))]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-black/5 p-3 dark:bg-white/10">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-950 dark:text-white">{title}</h3>
            <p className="text-xs uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">AI Insight</p>
          </div>
        </div>
        {onRefresh ? (
          <button onClick={onRefresh} className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5">
            Refresh
          </button>
        ) : null}
      </div>
    </div>

    <div className="space-y-3 p-5">
      {isLoading ? <p className="text-sm text-gray-500 dark:text-gray-400">Generating supportive insight...</p> : null}
      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</p> : null}
      {!isLoading && !error && insights.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Add more data to generate insights.</p> : null}
      {insights.map((insight, index) => (
        <div key={`${title}-${index}`} className="rounded-2xl border border-white/60 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="mb-2 flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
              {index + 1}
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Insight</p>
          </div>
          <AIResponseContent content={insight} compact />
        </div>
      ))}
      {summary ? <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-950">{summary}</div> : null}
    </div>
  </section>
);
