'use client';

import React, { useMemo } from 'react';
import { Bot, ShieldAlert } from 'lucide-react';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { AIInsightsSection } from '@/components/ai/AIInsightsSection';
import { buildHealthSummary } from '@/lib/ai/summary';
import { useGlucoseStore } from '@/lib/store/glucoseStore';
import { useInsulinStore } from '@/lib/store/insulinStore';
import { useMealStore } from '@/lib/store/mealStore';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useAIChat } from '@/components/ai/useAIChat';

export default function AIPage() {
  const { readings } = useGlucoseStore();
  const { doses } = useInsulinStore();
  const { meals } = useMealStore();
  const { entries } = useWellnessStore();
  const { settings } = useSettingsStore();
  const summary = useMemo(
    () =>
      buildHealthSummary({
        readings,
        doses,
        meals,
        wellnessEntries: entries,
        targetLow: settings.targetRangeLow,
        targetHigh: settings.targetRangeHigh,
      }),
    [doses, entries, meals, readings, settings.targetRangeHigh, settings.targetRangeLow]
  );

  const chatSummary = useMemo(
    () => ({
      weekly_average: summary.weekly_average,
      previous_week_average: summary.previous_week_average,
      highest: summary.highest,
      lowest: summary.lowest,
      time_in_range: summary.time_in_range,
      repeated_high_contexts: summary.repeated_high_contexts,
      repeated_low_contexts: summary.repeated_low_contexts,
      meal_patterns: summary.meal_patterns,
      stress_days: summary.stress_days,
      low_sleep_days: summary.low_sleep_days,
      mood_distribution: summary.mood_distribution,
      daily_stability: summary.daily_stability.slice(-5),
      recent_glucose_points: summary.recent_glucose_points.slice(-8),
      safety_rules: summary.safety_rules,
    }),
    [summary]
  );
  const { chatHistory, isLoading, error, clearChatHistory, send } = useAIChat(chatSummary);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-8 pt-6">
      <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.95fr)]">
        <div className="glass3d overflow-hidden rounded-[32px] border border-sky-200 bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_35%),radial-gradient(circle_at_bottom_right,#dcfce7,transparent_30%),linear-gradient(145deg,#ffffff,#f8fafc)] p-6 dark:border-sky-500/20 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(22,101,52,0.22),transparent_30%),linear-gradient(145deg,#09090b,#111827)]">
          <div className="mb-4 inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-800 dark:bg-white/10 dark:text-sky-200">
            Supportive AI
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight text-gray-950 dark:text-white">Insights and chat for your diabetes tracker</h1>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Personalized pattern summaries, meal impact observations, predictive alerts, and mood correlation insights using your stored tracking data.
              </p>
            </div>
            <div className="glass3d rounded-3xl border border-white/60 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-100">
                <Bot size={20} />
                <span className="text-sm font-medium">Observational only</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass3d rounded-[32px] border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="mb-4 inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-900 dark:bg-amber-500/15 dark:text-amber-100">
            Safety guardrails
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <ShieldAlert size={22} />
            </div>
            <div className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
              <p className="font-semibold">What the AI will not do</p>
              <p className="leading-6">
                The AI does not diagnose, replace doctors, prescribe insulin doses, or provide dangerous medical instructions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <AIChatPanel
          messages={chatHistory}
          isLoading={isLoading}
          error={error}
          onSend={send}
          onClear={clearChatHistory}
        />
      </div>

      <AIInsightsSection />
    </main>
  );
}
