'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { buildHealthSummary } from '@/lib/ai/summary';
import { useGlucoseStore } from '@/lib/store/glucoseStore';
import { useInsulinStore } from '@/lib/store/insulinStore';
import { useMealStore } from '@/lib/store/mealStore';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useAIStore } from '@/lib/store/aiStore';
import { AIInsightFeature } from '@/lib/types';
import { AIInsightCard } from '@/components/ai/AIInsightCard';

type InsightResponse = {
  title: string;
  insights: string[];
  summary: string;
};

const featureCards: Array<{ feature: AIInsightFeature; title: string; accentClassName: string }> = [
  { feature: 'pattern_detection', title: 'Pattern Detection', accentClassName: 'border-violet-200 dark:border-violet-500/20' },
  { feature: 'food_impact', title: 'Food Impact Analysis', accentClassName: 'border-emerald-200 dark:border-emerald-500/20' },
  { feature: 'predictive_alerts', title: 'Predictive Alerts', accentClassName: 'border-amber-200 dark:border-amber-500/20' },
  { feature: 'mood_correlation', title: 'Mood Correlation', accentClassName: 'border-rose-200 dark:border-rose-500/20' },
];

export const AIInsightsSection: React.FC<{ sectionId?: string }> = ({ sectionId }) => {
  const { readings } = useGlucoseStore();
  const { doses } = useInsulinStore();
  const { meals } = useMealStore();
  const { entries } = useWellnessStore();
  const { settings } = useSettingsStore();
  const { addInsightRecord } = useAIStore();

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

  const [responses, setResponses] = useState<Partial<Record<AIInsightFeature, InsightResponse>>>({});
  const [loadingState, setLoadingState] = useState<Partial<Record<AIInsightFeature, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<AIInsightFeature, string | null>>>({});

  const getFeatureSummary = (feature: AIInsightFeature) => {
    const shared = {
      weekly_average: summary.weekly_average,
      previous_week_average: summary.previous_week_average,
      highest: summary.highest,
      lowest: summary.lowest,
      time_in_range: summary.time_in_range,
      insulin_consistency_days: summary.insulin_consistency_days,
      meal_logging_days: summary.meal_logging_days,
      reading_count: summary.reading_count,
    };

    switch (feature) {
      case 'pattern_detection':
        return {
          ...shared,
          repeated_high_contexts: summary.repeated_high_contexts,
          repeated_low_contexts: summary.repeated_low_contexts,
          daily_stability: summary.daily_stability.slice(-5),
          recent_glucose_points: summary.recent_glucose_points.slice(-8),
          safety_rules: summary.safety_rules,
        };
      case 'food_impact':
        return {
          ...shared,
          meal_patterns: summary.meal_patterns,
          food_impact: summary.food_impact.slice(-6),
          safety_rules: summary.safety_rules,
        };
      case 'predictive_alerts':
        return {
          ...shared,
          repeated_high_contexts: summary.repeated_high_contexts,
          daily_stability: summary.daily_stability.slice(-4),
          recent_glucose_points: summary.recent_glucose_points.slice(-10),
          safety_rules: summary.safety_rules,
        };
      case 'mood_correlation':
        return {
          ...shared,
          stress_days: summary.stress_days,
          low_sleep_days: summary.low_sleep_days,
          mood_distribution: summary.mood_distribution,
          symptoms_frequency: summary.symptoms_frequency,
          daily_stability: summary.daily_stability.slice(-5),
          safety_rules: summary.safety_rules,
        };
      default:
        return summary;
    }
  };

  const runFeature = async (feature: AIInsightFeature) => {
    setLoadingState((state) => ({ ...state, [feature]: true }));
    setErrors((state) => ({ ...state, [feature]: null }));

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, summary: getFeatureSummary(feature) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate AI insight.');
      }

      setResponses((state) => ({ ...state, [feature]: data }));
      addInsightRecord({
        feature,
        content: JSON.stringify(data.insights),
        summary: data.summary,
      });
    } catch (error) {
      setErrors((state) => ({
        ...state,
        [feature]: error instanceof Error ? error.message : 'Unable to generate AI insight.',
      }));
    } finally {
      setLoadingState((state) => ({ ...state, [feature]: false }));
    }
  };

  useEffect(() => {
    if (summary.reading_count === 0) return;
    let cancelled = false;

    const runSequentially = async () => {
      for (const { feature } of featureCards) {
        if (cancelled) return;
        await runFeature(feature);
      }
    };

    void runSequentially();

    return () => {
      cancelled = true;
    };
  }, [summary.reading_count, summary.weekly_average, summary.time_in_range]);

  return (
    <div id={sectionId} className="space-y-5 scroll-mt-28">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700 dark:text-sky-300">AI Insights</p>
        <h2 className="text-2xl font-semibold text-gray-950 dark:text-white">Supportive pattern summaries</h2>
        <p className="max-w-xl text-sm text-gray-600 dark:text-gray-300">
          Observational, non-medical insights based on your tracked glucose, insulin, meals, mood, sleep, stress, and symptoms.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {featureCards.map(({ feature, title, accentClassName }) => (
          <AIInsightCard
            key={feature}
            title={title}
            accentClassName={accentClassName}
            insights={responses[feature]?.insights || []}
            summary={responses[feature]?.summary}
            isLoading={loadingState[feature]}
            error={errors[feature] || null}
            onRefresh={() => void runFeature(feature)}
          />
        ))}
      </div>
    </div>
  );
};
