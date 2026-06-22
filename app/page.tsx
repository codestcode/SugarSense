"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlucoseStore } from "@/lib/store/glucoseStore";
import { useInsulinStore } from "@/lib/store/insulinStore";
import { useMealStore } from "@/lib/store/mealStore";
import { useWellnessStore } from "@/lib/store/wellnessStore";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { GlucoseCard } from "@/components/glucose/GlucoseCard";
import { AIInsightsSection } from "@/components/ai/AIInsightsSection";
import { FloatingAIChat } from "@/components/ai/FloatingAIChat";
import { useAIChat } from "@/components/ai/useAIChat";
import { buildHealthSummary } from "@/lib/ai/summary";
import { formatDateTime } from "@/lib/utils";
import {
  TrendingUp,
  Droplet,
  Syringe,
  Camera,
  AlertCircle,
  Bell,
  X,
} from "lucide-react";
import Link from "next/link";
import { Sora } from "next/font/google";

const displayFont = Sora({
  subsets: ["latin"],
  weight: ["700", "800"],
});

export default function DashboardPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    readings,
    getTodayReadings,
    getLatestReading,
    getTodayAverage,
    getWeeklyAverage,
  } = useGlucoseStore();
  const { doses, getTodayDoses } = useInsulinStore();
  const { meals } = useMealStore();
  const { entries } = useWellnessStore();
  const { settings } = useSettingsStore();
  const isRTL = settings.language === "ar";

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayReadings = getTodayReadings();
  const latestReading = getLatestReading();
  const latestDose = getTodayDoses()[getTodayDoses().length - 1];
  const todayAverage = getTodayAverage();
  const weeklyAverage = getWeeklyAverage();

  const lowReadings = readings.filter((r) => r.status === "low").length;
  const highReadings = readings.filter((r) => r.status === "high").length;
  const notificationCount = lowReadings + highReadings;
  const notifications = [
    ...(highReadings > 0
      ? [
          {
            id: "high-readings",
            tone: "amber" as const,
            title: `${highReadings} high glucose reading${highReadings !== 1 ? "s" : ""}`,
            detail:
              "Recent readings included elevated glucose values. Review the timeline for context.",
          },
        ]
      : []),
    ...(lowReadings > 0
      ? [
          {
            id: "low-readings",
            tone: "red" as const,
            title: `${lowReadings} low glucose reading${lowReadings !== 1 ? "s" : ""}`,
            detail:
              "Recent readings included lower glucose values. Check the latest entries and notes.",
          },
        ]
      : []),
  ];
  const homeChatSummary = buildHealthSummary({
    readings,
    doses,
    meals,
    wellnessEntries: entries,
    targetLow: settings.targetRangeLow,
    targetHigh: settings.targetRangeHigh,
  });
  const compactSummary = {
    weekly_average: homeChatSummary.weekly_average,
    previous_week_average: homeChatSummary.previous_week_average,
    highest: homeChatSummary.highest,
    lowest: homeChatSummary.lowest,
    time_in_range: homeChatSummary.time_in_range,
    repeated_high_contexts: homeChatSummary.repeated_high_contexts,
    repeated_low_contexts: homeChatSummary.repeated_low_contexts,
    meal_patterns: homeChatSummary.meal_patterns,
    stress_days: homeChatSummary.stress_days,
    low_sleep_days: homeChatSummary.low_sleep_days,
    mood_distribution: homeChatSummary.mood_distribution,
    daily_stability: homeChatSummary.daily_stability.slice(-5),
    recent_glucose_points: homeChatSummary.recent_glucose_points.slice(-8),
    safety_rules: homeChatSummary.safety_rules,
  };
  const { chatHistory, isLoading, error, clearChatHistory, send } =
    useAIChat(compactSummary);

  if (!mounted) return null;

  return (
    <main className="max-w-2xl mx-auto px-4 pt-6">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`${displayFont.className} text-xs font-bold uppercase tracking-[0.35em] text-blue-600 mb-3`}
            >
              SugarSense
            </p>
            <h1
              className={`${displayFont.className} text-4xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight`}
            >
              {t("dashboard.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <a
              href="#ai-patterns"
              className="mt-4 inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              Scroll to show your patterns
            </a>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="glass3d inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-700 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-200"
              aria-label="Open notifications"
            >
              <Bell size={20} />
            </button>
            {notificationCount > 0 ? (
              <span
                className={`absolute -top-1.5 z-20 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm dark:border-slate-950 ${isRTL ? "-left-1.5" : "-right-1.5"}`}
              >
                {notificationCount}
              </span>
            ) : null}

            {notificationsOpen ? (
              <div
                className={`glass3d absolute top-14 z-30 w-[min(88vw,22rem)] rounded-[28px] border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-zinc-900 ${isRTL ? "left-0" : "right-0"}`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recent glucose alerts
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="rounded-full p-2 text-gray-500 transition-colors hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5"
                    aria-label="Close notifications"
                  >
                    <X size={16} />
                  </button>
                </div>

                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-2xl border p-4 ${
                          notification.tone === "amber"
                            ? "border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"
                            : "border-red-200 bg-red-50/80 text-red-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100"
                        }`}
                      >
                        <p className="text-sm font-semibold">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 opacity-85">
                          {notification.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300">
                    No alert notifications right now.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <DashboardCard
          title={t("dashboard.averageGlucose")}
          value={todayAverage || "—"}
          subtitle={`${t("dashboard.today")}`}
          icon={<Droplet size={28} />}
          color="blue"
        />
        <DashboardCard
          title={t("dashboard.latestReading")}
          value={latestReading?.value || "—"}
          subtitle={
            latestReading
              ? formatDateTime(latestReading.reading_time)
              : t("dashboard.noReadings")
          }
          icon={<TrendingUp size={28} />}
          color="green"
        />
      </div>

      {/* Insulin Card */}
      {latestDose && (
        <div className="glass3d bg-white border border-purple-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                {t("insulin.latestDose")}
              </p>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {latestDose.units.toFixed(1)} units
              </p>
              <p className="text-sm text-gray-600">
                {latestDose.insulin_type.replace("_", " ").toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(latestDose.dose_context || "random")
                  .replace("_", " ")
                  .toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(latestDose.dose_time)}
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-100/80 text-purple-600 dark:bg-purple-500/10">
              <Syringe size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {(lowReadings > 0 || highReadings > 0) && (
        <div className="glass3d bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex gap-3">
            <AlertCircle
              className="text-yellow-600 dark:text-amber-300 flex-shrink-0"
              size={24}
            />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-amber-100 mb-2">
                {t("dashboard.alerts")}
              </h3>
              {lowReadings > 0 && (
                <p className="text-sm text-yellow-800 dark:text-amber-200 mb-1">
                  🔴 {lowReadings} low glucose reading
                  {lowReadings !== 1 ? "s" : ""}
                </p>
              )}
              {highReadings > 0 && (
                <p className="text-sm text-yellow-800 dark:text-amber-200">
                  🟠 {highReadings} high glucose reading
                  {highReadings !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Latest Readings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("dashboard.trend")}
          </h2>
          <Link
            href="/history"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {t("history.title")} →
          </Link>
        </div>

        {todayReadings.length > 0 ? (
          <div className="space-y-3">
            {todayReadings
              .slice(-3)
              .reverse()
              .map((reading) => (
                <GlucoseCard key={reading.id} reading={reading} />
              ))}
          </div>
        ) : (
          <div className="glass3d text-center py-8 bg-gray-50 rounded-xl">
            <Droplet size={40} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">{t("dashboard.noReadings")}</p>
            <Link
              href="/add"
              className="text-blue-600 hover:text-blue-700 font-medium mt-3 inline-block"
            >
              {t("common.add")} {t("glucose.title")} →
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Link
          href="/add"
          className="flex min-h-[100px] flex-col items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/16">
            <Droplet size={20} />
          </span>
          <span className="text-xs">{t("glucose.title")}</span>
        </Link>
        <Link
          href="/add?mode=scan"
          className="flex min-h-[100px] flex-col items-center justify-center gap-2 bg-cyan-600 text-white py-4 rounded-xl font-semibold hover:bg-cyan-700 transition-colors text-center"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/16">
            <Camera size={20} />
          </span>
          <span className="text-xs">Scan food</span>
        </Link>
        <Link
          href="/add"
          className="flex min-h-[100px] flex-col items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors text-center"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/16">
            <Syringe size={20} />
          </span>
          <span className="text-xs">{t("insulin.title")}</span>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass3d text-center p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {todayReadings.length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {t("dashboard.today")} {t("history.glucose")}
          </p>
        </div>
        <div className="glass3d text-center p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {getTodayDoses().length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {t("dashboard.today")} {t("history.insulin")}
          </p>
        </div>
        <div className="glass3d text-center p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {weeklyAverage || "—"}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            7-{t("dashboard.today")}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <AIInsightsSection sectionId="ai-patterns" />
      </div>

      <FloatingAIChat
        messages={chatHistory}
        isLoading={isLoading}
        error={error}
        onSend={send}
        onClear={clearChatHistory}
      />
    </main>
  );
}
