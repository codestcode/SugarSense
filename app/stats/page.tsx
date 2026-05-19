'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlucoseStore } from '@/lib/store/glucoseStore';
import { useInsulinStore } from '@/lib/store/insulinStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { GlucoseTrendChart } from '@/components/charts/GlucoseTrendChart';
import { WeeklyAverageChart } from '@/components/charts/WeeklyAverageChart';
import { MonthlyAverageChart } from '@/components/charts/MonthlyAverageChart';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { calculateTimeInRange } from '@/lib/utils';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function StatsPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const { readings, getTodayReadings, getWeeklyAverage, getMonthlyAverage } = useGlucoseStore();
  const { doses } = useInsulinStore();
  const { settings } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const todayReadings = getTodayReadings();
  const weeklyAverage = getWeeklyAverage();
  const monthlyAverage = getMonthlyAverage();
  const timeInRange = calculateTimeInRange(readings, settings.targetRangeLow, settings.targetRangeHigh);

  const lowCount = readings.filter(r => r.status === 'low').length;
  const normalCount = readings.filter(r => r.status === 'normal').length;
  const highCount = readings.filter(r => r.status === 'high').length;

  const totalInsulin = doses.reduce((sum, d) => sum + d.units, 0);
  const averageInsulin = doses.length > 0 ? Math.round(totalInsulin / doses.length) : 0;

  return (
    <main className="max-w-2xl mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('stats.title')}</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <DashboardCard
          title={t('stats.dailyTrend')}
          value={todayReadings.length}
          subtitle={`${t('dashboard.today')}`}
          icon={<BarChart3 size={28} />}
          color="blue"
        />
        <DashboardCard
          title={t('stats.timeInRange')}
          value={`${timeInRange}%`}
          subtitle={`${settings.targetRangeLow}-${settings.targetRangeHigh}`}
          icon={<TrendingUp size={28} />}
          color="green"
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Daily Trend Chart */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('stats.dailyTrend')}</h2>
          <GlucoseTrendChart 
            readings={todayReadings}
            targetLow={settings.targetRangeLow}
            targetHigh={settings.targetRangeHigh}
          />
        </div>

        {/* Weekly Average Chart */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('stats.weeklyAverage')}</h2>
          <WeeklyAverageChart readings={readings} />
          <div className="mt-4 flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{weeklyAverage}</p>
              <p className="text-xs text-gray-600 mt-1">{t('stats.weeklyAverage')}</p>
            </div>
          </div>
        </div>

        {/* Monthly Average Chart */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('stats.monthlyAverage')}</h2>
          <MonthlyAverageChart readings={readings} />
          <div className="mt-4 flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{monthlyAverage}</p>
              <p className="text-xs text-gray-600 mt-1">{t('stats.monthlyAverage')}</p>
            </div>
          </div>
        </div>

        {/* Glucose Status Distribution */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Glucose Status Distribution</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="glass3d text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-2xl font-bold text-red-600">{lowCount}</p>
              <p className="text-sm text-red-700 mt-1">{t('stats.low')}</p>
              <p className="text-xs text-red-600 mt-1">{readings.length > 0 ? Math.round((lowCount / readings.length) * 100) : 0}%</p>
            </div>
            <div className="glass3d text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-2xl font-bold text-green-600">{normalCount}</p>
              <p className="text-sm text-green-700 mt-1">{t('stats.normal')}</p>
              <p className="text-xs text-green-600 mt-1">{readings.length > 0 ? Math.round((normalCount / readings.length) * 100) : 0}%</p>
            </div>
            <div className="glass3d text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <p className="text-2xl font-bold text-orange-600">{highCount}</p>
              <p className="text-sm text-orange-700 mt-1">{t('stats.high')}</p>
              <p className="text-xs text-orange-600 mt-1">{readings.length > 0 ? Math.round((highCount / readings.length) * 100) : 0}%</p>
            </div>
          </div>
        </div>

        {/* Insulin Statistics */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('stats.insulinUsage')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass3d p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">{totalInsulin.toFixed(1)}</p>
              <p className="text-sm text-purple-700 mt-1">Total Units</p>
              <p className="text-xs text-purple-600 mt-1">{doses.length} doses</p>
            </div>
            <div className="glass3d p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">{averageInsulin}</p>
              <p className="text-sm text-purple-700 mt-1">Average Per Dose</p>
              <p className="text-xs text-purple-600 mt-1">{t('insulin.units')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
