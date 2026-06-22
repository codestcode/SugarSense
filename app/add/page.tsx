'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlucoseForm } from '@/components/glucose/GlucoseForm';
import { InsulinForm } from '@/components/insulin/InsulinForm';
import { FoodAnalyzer } from '@/components/meal/FoodAnalyzer';
import { MealForm } from '@/components/meal/MealForm';
import { WellnessForm } from '@/components/wellness/WellnessForm';
import { useToast } from '@/components/common/Toast';
import { useMealStore } from '@/lib/store/mealStore';
import { Camera, Droplet, HeartPulse, Salad, Syringe } from 'lucide-react';

export default function AddPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'glucose' | 'insulin' | 'meal' | 'wellness'>('glucose');
  const [mealMode, setMealMode] = useState<'manual' | 'scan'>('manual');
  const { showToast } = useToast();
  const { addMeal } = useMealStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'scan') {
      setActiveTab('meal');
      setMealMode('scan');
    }
  }, []);

  const handleGlucoseSuccess = () => {
    showToast(t('glucose.added'), 'success');
  };

  const handleInsulinSuccess = () => {
    showToast(t('insulin.added'), 'success');
  };

  const handleMealSuccess = () => {
    showToast('Meal added successfully', 'success');
  };

  const handleWellnessSuccess = () => {
    showToast('Wellness entry added successfully', 'success');
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{t('nav.add')}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t('app.subtitle')}</p>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
        <button
          onClick={() => setActiveTab('glucose')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'glucose'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          <Droplet size={20} />
          {t('glucose.title')}
        </button>
        <button
          onClick={() => setActiveTab('insulin')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'insulin'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          <Syringe size={20} />
          {t('insulin.title')}
        </button>
        <button
          onClick={() => setActiveTab('meal')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'meal'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          <Salad size={20} />
          Meals
        </button>
        <button
          onClick={() => setActiveTab('wellness')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'wellness'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          <HeartPulse size={20} />
          Wellness
        </button>
      </div>

      {/* Tab Content */}
      <div className="glass3d rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
        {activeTab === 'glucose' ? <GlucoseForm onSuccess={handleGlucoseSuccess} /> : null}
        {activeTab === 'insulin' ? <InsulinForm onSuccess={handleInsulinSuccess} /> : null}
        {activeTab === 'meal' ? (
          <div className="space-y-4">
            <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-white/10">
              <button
                type="button"
                onClick={() => setMealMode('manual')}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  mealMode === 'manual'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                onClick={() => setMealMode('scan')}
                className={`flex items-center justify-center gap-1.5 flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  mealMode === 'scan'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-zinc-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <Camera size={16} />
                Scan food
              </button>
            </div>

            {mealMode === 'manual' ? (
              <MealForm onSuccess={handleMealSuccess} />
            ) : (
              <FoodAnalyzer
                onSaveMeal={(title, description, carbs) => {
                  addMeal({
                    title,
                    description,
                    tag: 'snack',
                    carbs_estimate: carbs,
                    meal_time: new Date().toISOString(),
                  });
                  showToast('Meal added from scan', 'success');
                }}
              />
            )}
          </div>
        ) : null}
        {activeTab === 'wellness' ? <WellnessForm onSuccess={handleWellnessSuccess} /> : null}
      </div>
    </main>
  );
}
