'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGlucoseStore } from '@/lib/store/glucoseStore';
import { MealRelation, GlucoseReading } from '@/lib/types';
import { format } from 'date-fns';

interface GlucoseFormProps {
  onSuccess?: () => void;
  initialData?: GlucoseReading;
}

const mealRelations: { value: MealRelation; labelKey: string }[] = [
  { value: 'before_breakfast', labelKey: 'glucose.beforeBreakfast' },
  { value: 'after_breakfast', labelKey: 'glucose.afterBreakfast' },
  { value: 'before_lunch', labelKey: 'glucose.beforeLunch' },
  { value: 'after_lunch', labelKey: 'glucose.afterLunch' },
  { value: 'before_dinner', labelKey: 'glucose.beforeDinner' },
  { value: 'after_dinner', labelKey: 'glucose.afterDinner' },
  { value: 'before_sleep', labelKey: 'glucose.beforeSleep' },
  { value: 'random', labelKey: 'glucose.random' },
];

export const GlucoseForm: React.FC<GlucoseFormProps> = ({ onSuccess, initialData }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      value: initialData?.value || '',
      meal_relation: initialData?.meal_relation || 'random',
      date: initialData ? format(new Date(initialData.reading_time), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: initialData ? format(new Date(initialData.reading_time), 'HH:mm') : format(new Date(), 'HH:mm'),
      notes: initialData?.notes || '',
    },
  });

  const { addReading, updateReading } = useGlucoseStore();

  const onSubmit = (data: any) => {
    const dateTime = new Date(`${data.date}T${data.time}`);
    
    if (initialData) {
      updateReading(initialData.id, {
        value: parseInt(data.value),
        meal_relation: data.meal_relation,
        reading_time: dateTime.toISOString(),
        notes: data.notes,
      });
    } else {
      addReading({
        value: parseInt(data.value),
        meal_relation: data.meal_relation,
        reading_time: dateTime.toISOString(),
        notes: data.notes,
        status: parseInt(data.value) < 70 ? 'low' : parseInt(data.value) > 180 ? 'high' : 'normal',
      });
    }
    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('glucose.value')}
        </label>
        <input
          type="number"
          placeholder="e.g., 120"
          min="20"
          max="600"
          {...register('value', {
            required: t('common.required'),
            pattern: { value: /^\d+$/, message: t('common.invalidNumber') },
          })}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
        {errors.value && (
          <span className="text-red-500 text-sm mt-1">{errors.value.message}</span>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('glucose.mealRelation')}
        </label>
        <select
          {...register('meal_relation')}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          {mealRelations.map(({ value, labelKey }) => (
            <option key={value} value={value}>
              {t(labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('glucose.date')}
          </label>
          <input
            type="date"
            {...register('date')}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('glucose.time')}
          </label>
          <input
            type="time"
            {...register('time')}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('glucose.notes')}
        </label>
        <textarea
          placeholder="Add any notes..."
          {...register('notes')}
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
      >
        {initialData ? t('common.save') : t('common.add')}
      </button>
    </form>
  );
};
