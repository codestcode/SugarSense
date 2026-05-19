'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useGlucoseStore } from '@/lib/store/glucoseStore';
import { useInsulinStore } from '@/lib/store/insulinStore';
import { useMealStore } from '@/lib/store/mealStore';
import { useWellnessStore } from '@/lib/store/wellnessStore';
import { useToast } from '@/components/common/Toast';
import { Moon, Sun, Globe, Download, Upload, Trash2, FileText } from 'lucide-react';
import { exportToJSON } from '@/lib/utils';
import { generateGlucosePDF, generateInsulinPDF, generateComprehensiveReport } from '@/lib/pdfExport';
import { AppSettings, GlucoseReading, InsulinDose, MealLog, WellnessEntry } from '@/lib/types';

type BackupPayload = {
  glucose?: GlucoseReading[];
  insulin?: InsulinDose[];
  meals?: MealLog[];
  meal?: MealLog[];
  wellness?: WellnessEntry[];
  wellnessEntries?: WellnessEntry[];
  settings?: AppSettings;
  exportDate?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function persistStore<T>(key: string, field: string, value: T) {
  localStorage.setItem(
    key,
    JSON.stringify({
      state: {
        [field]: value,
      },
      version: 1,
    })
  );
}

function isValidGlucoseReading(item: unknown): item is GlucoseReading {
  return (
    isObject(item) &&
    typeof item.id === 'string' &&
    typeof item.value === 'number' &&
    typeof item.meal_relation === 'string' &&
    typeof item.notes === 'string' &&
    typeof item.reading_time === 'string' &&
    typeof item.status === 'string' &&
    typeof item.created_at === 'string'
  );
}

function isValidInsulinDose(item: unknown): item is InsulinDose {
  return (
    isObject(item) &&
    typeof item.id === 'string' &&
    typeof item.insulin_type === 'string' &&
    typeof item.units === 'number' &&
    typeof item.notes === 'string' &&
    typeof item.dose_time === 'string' &&
    typeof item.created_at === 'string'
  );
}

function isValidMealLog(item: unknown): item is MealLog {
  return (
    isObject(item) &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.tag === 'string' &&
    typeof item.meal_time === 'string' &&
    typeof item.created_at === 'string'
  );
}

function isValidWellnessEntry(item: unknown): item is WellnessEntry {
  return (
    isObject(item) &&
    typeof item.id === 'string' &&
    typeof item.mood === 'string' &&
    typeof item.stress_level === 'number' &&
    typeof item.sleep_quality === 'string' &&
    Array.isArray(item.symptoms) &&
    typeof item.notes === 'string' &&
    typeof item.recorded_at === 'string' &&
    typeof item.created_at === 'string'
  );
}

function isValidSettings(item: unknown): item is AppSettings {
  return (
    isObject(item) &&
    typeof item.language === 'string' &&
    typeof item.theme === 'string' &&
    typeof item.targetRangeLow === 'number' &&
    typeof item.targetRangeHigh === 'number'
  );
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const { settings, updateSettings } = useSettingsStore();
  const { readings } = useGlucoseStore();
  const { doses } = useInsulinStore();
  const { meals } = useMealStore();
  const { entries } = useWellnessStore();
  const { showToast } = useToast();
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      theme: settings.theme,
      language: settings.language,
      targetRangeLow: settings.targetRangeLow,
      targetRangeHigh: settings.targetRangeHigh,
    },
  });

  const theme = watch('theme');
  const language = watch('language');
  const targetLow = watch('targetRangeLow');
  const targetHigh = watch('targetRangeHigh');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      updateSettings({
        theme,
        language,
        targetRangeLow: parseInt(targetLow),
        targetRangeHigh: parseInt(targetHigh),
      });
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
    }
  }, [theme, language, targetLow, targetHigh, mounted]);

  if (!mounted) return null;

  const handleExport = () => {
    const data = {
      glucose: readings,
      insulin: doses,
      meals,
      wellness: entries,
      settings,
      exportDate: new Date().toISOString(),
    };
    exportToJSON(data, `diabetes-tracker-backup-${new Date().toLocaleDateString()}.json`);
    showToast(t('settings.export') + ' ' + t('common.success'), 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as BackupPayload;

          if (!isObject(data)) {
            throw new Error('Invalid backup file');
          }

          const glucose = Array.isArray(data.glucose) ? data.glucose : [];
          const insulin = Array.isArray(data.insulin) ? data.insulin : [];
          const importedMeals = Array.isArray(data.meals)
            ? data.meals
            : Array.isArray(data.meal)
              ? data.meal
              : [];
          const wellness = Array.isArray(data.wellness)
            ? data.wellness
            : Array.isArray(data.wellnessEntries)
              ? data.wellnessEntries
              : [];

          if (!glucose.every(isValidGlucoseReading)) {
            throw new Error('Invalid glucose data');
          }
          if (!insulin.every(isValidInsulinDose)) {
            throw new Error('Invalid insulin data');
          }
          if (!importedMeals.every(isValidMealLog)) {
            throw new Error('Invalid meal data');
          }
          if (!wellness.every(isValidWellnessEntry)) {
            throw new Error('Invalid wellness data');
          }
          if (data.settings && !isValidSettings(data.settings)) {
            throw new Error('Invalid settings data');
          }

          persistStore('glucose-store', 'readings', glucose);
          persistStore('insulin-store', 'doses', insulin);
          persistStore('meal-store', 'meals', importedMeals);
          persistStore('wellness-store', 'entries', wellness);

          if (data.settings) {
            localStorage.setItem(
              'settings-store',
              JSON.stringify({
                state: {
                  settings: data.settings,
                },
                version: 1,
              })
            );
            localStorage.setItem('language', data.settings.language);
          }

          localStorage.setItem('app-initialized', 'true');
          showToast('Data restored successfully', 'success');
          setTimeout(() => {
            location.reload();
          }, 600);
        } catch {
          showToast('Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    // This would reset all data - in production, add proper confirmation
    localStorage.removeItem('glucose-store');
    localStorage.removeItem('insulin-store');
    localStorage.removeItem('meal-store');
    localStorage.removeItem('wellness-store');
    localStorage.removeItem('ai-store');
    localStorage.removeItem('app-initialized');
    location.reload();
  };

  const handleExportGlucosePDF = async () => {
    try {
      await generateGlucosePDF(readings, `glucose-readings-${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Glucose readings exported successfully', 'success');
    } catch {
      showToast('Failed to export glucose readings', 'error');
    }
  };

  const handleExportInsulinPDF = async () => {
    try {
      await generateInsulinPDF(doses, `insulin-doses-${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Insulin doses exported successfully', 'success');
    } catch {
      showToast('Failed to export insulin doses', 'error');
    }
  };

  const handleExportComprehensive = async () => {
    try {
      await generateComprehensiveReport(readings, doses, `diabetes-report-${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Comprehensive report exported successfully', 'success');
    } catch {
      showToast('Failed to export comprehensive report', 'error');
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('settings.title')}</h1>
      </div>

      <form className="space-y-6">
        {/* Theme Setting */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100 dark:border-white/10 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.theme')}</label>
            <div className="flex gap-2">
              {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="light"
                {...register('theme')}
                className="w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-200">{t('settings.light')}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="dark"
                {...register('theme')}
                className="w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-200">{t('settings.dark')}</span>
            </label>
          </div>
        </div>

        {/* Language Setting */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100 dark:border-white/10 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.language')}</label>
            <Globe size={24} />
          </div>
          <select
            {...register('language')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        {/* Target Glucose Range */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100 dark:border-white/10 dark:bg-zinc-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('settings.targetRange')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('settings.targetRangeLow')}
              </label>
              <input
                type="number"
                {...register('targetRangeLow')}
                min="50"
                max="200"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('settings.targetRangeHigh')}
              </label>
              <input
                type="number"
                {...register('targetRangeHigh')}
                min="100"
                max="400"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100 dark:border-white/10 dark:bg-zinc-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
          <div className="space-y-3">
            {/* Backup & Restore */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Download size={18} />
                Backup
              </button>
              <label className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer text-sm">
                <Upload size={18} />
                Restore
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            {/* PDF/Report Exports */}
            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3 dark:text-gray-200">Export Reports</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleExportComprehensive}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                >
                  <FileText size={18} />
                  Full Report
                </button>
                <button
                  type="button"
                  onClick={handleExportGlucosePDF}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                >
                  <FileText size={18} />
                  Glucose Report
                </button>
                <button
                  type="button"
                  onClick={handleExportInsulinPDF}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                >
                  <FileText size={18} />
                  Insulin Report
                </button>
              </div>
            </div>

            {/* Reset */}
            <div className="border-t pt-4 mt-4">
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Trash2 size={20} />
                {t('settings.reset')}
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="glass3d bg-white p-6 rounded-2xl border border-gray-100 dark:border-white/10 dark:bg-zinc-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('settings.aboutTitle')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">{t('app.title')}</span>
              <span className="font-semibold text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <p className="text-sm text-gray-600 mt-4 dark:text-gray-300">
              A simple and easy-to-use diabetes tracking application for personal and family use.
            </p>
          </div>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      {confirmReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass3d bg-white rounded-2xl max-w-sm w-full p-6 dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('common.confirm')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{t('settings.reset')}</p>
            <p className="text-red-600 font-semibold mb-6">{t('settings.resetConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
