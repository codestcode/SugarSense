'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useInsulinStore } from '@/lib/store/insulinStore';
import { InsulinContext, InsulinType, InsulinDose } from '@/lib/types';
import { format } from 'date-fns';

interface InsulinFormProps {
  onSuccess?: () => void;
  initialData?: InsulinDose;
}

const insulinTypes: { value: InsulinType; labelKey: string }[] = [
  { value: 'rapid_acting', labelKey: 'insulin.rapidActing' },
  { value: 'long_acting', labelKey: 'insulin.longActing' },
  { value: 'mixed', labelKey: 'insulin.mixed' },
];

const insulinContexts: { value: InsulinContext; labelKey: string }[] = [
  { value: 'before_breakfast', labelKey: 'glucose.beforeBreakfast' },
  { value: 'after_breakfast', labelKey: 'glucose.afterBreakfast' },
  { value: 'before_lunch', labelKey: 'glucose.beforeLunch' },
  { value: 'after_lunch', labelKey: 'glucose.afterLunch' },
  { value: 'before_dinner', labelKey: 'glucose.beforeDinner' },
  { value: 'after_dinner', labelKey: 'glucose.afterDinner' },
  { value: 'before_sleep', labelKey: 'glucose.beforeSleep' },
  { value: 'random', labelKey: 'glucose.random' },
  { value: 'extra_correction', labelKey: 'insulin.extraCorrection' },
];

export const InsulinForm: React.FC<InsulinFormProps> = ({ onSuccess, initialData }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      insulin_type: initialData?.insulin_type || 'rapid_acting',
      dose_context: initialData?.dose_context || 'before_breakfast',
      units: initialData?.units || '',
      date: initialData ? format(new Date(initialData.dose_time), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: initialData ? format(new Date(initialData.dose_time), 'HH:mm') : format(new Date(), 'HH:mm'),
      notes: initialData?.notes || '',
    },
  });

  const { addDose, updateDose } = useInsulinStore();

  const onSubmit = (data: any) => {
    const dateTime = new Date(`${data.date}T${data.time}`);
    
    if (initialData) {
      updateDose(initialData.id, {
        insulin_type: data.insulin_type,
        dose_context: data.dose_context,
        units: parseFloat(data.units),
        dose_time: dateTime.toISOString(),
        notes: data.notes,
      });
    } else {
      addDose({
        insulin_type: data.insulin_type,
        dose_context: data.dose_context,
        units: parseFloat(data.units),
        dose_time: dateTime.toISOString(),
        notes: data.notes,
      });
    }
    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('insulin.type')}
        </label>
        <select
          {...register('insulin_type')}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          {insulinTypes.map(({ value, labelKey }) => (
            <option key={value} value={value}>
              {t(labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('insulin.context')}
        </label>
        <select
          {...register('dose_context')}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          {insulinContexts.map(({ value, labelKey }) => (
            <option key={value} value={value}>
              {t(labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t('insulin.units')}
        </label>
        <input
          type="number"
          placeholder="e.g., 10"
          min="0"
          max="100"
          step="0.5"
          {...register('units', {
            required: t('common.required'),
            pattern: { value: /^\d+(\.\d{1,2})?$/, message: t('common.invalidNumber') },
          })}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
        {errors.units && (
          <span className="text-red-500 text-sm mt-1">{errors.units.message}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('insulin.date')}
          </label>
          <input
            type="date"
            {...register('date')}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('insulin.time')}
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
          {t('insulin.notes')}
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
