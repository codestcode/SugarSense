'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { MealLog, MealTag } from '@/lib/types';
import { useMealStore } from '@/lib/store/mealStore';

interface MealFormProps {
  onSuccess?: () => void;
  initialData?: MealLog;
}

const mealTags: MealTag[] = ['breakfast', 'lunch', 'dinner', 'snack', 'late_night'];

export const MealForm: React.FC<MealFormProps> = ({ onSuccess, initialData }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      tag: initialData?.tag || 'breakfast',
      carbs_estimate: initialData?.carbs_estimate || '',
      date: initialData ? format(new Date(initialData.meal_time), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: initialData ? format(new Date(initialData.meal_time), 'HH:mm') : format(new Date(), 'HH:mm'),
    },
  });

  const { addMeal, updateMeal } = useMealStore();

  const onSubmit = (data: any) => {
    const mealTime = new Date(`${data.date}T${data.time}`).toISOString();
    const payload = {
      title: data.title,
      description: data.description,
      tag: data.tag,
      carbs_estimate: data.carbs_estimate ? parseInt(data.carbs_estimate, 10) : undefined,
      meal_time: mealTime,
    };

    if (initialData) {
      updateMeal(initialData.id, payload);
    } else {
      addMeal(payload);
    }

    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Meal title</label>
        <input
          {...register('title', { required: 'Meal title is required' })}
          placeholder="Chicken rice bowl"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
        {errors.title && <span className="mt-1 text-sm text-red-500">{`${errors.title.message}`}</span>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Meal type</label>
        <select
          {...register('tag')}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          {mealTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Date</label>
          <input
            type="date"
            {...register('date')}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Time</label>
          <input
            type="time"
            {...register('time')}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Estimated carbs</label>
        <input
          type="number"
          min="0"
          {...register('carbs_estimate')}
          placeholder="Optional"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Rice, grilled chicken, yogurt"
          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <button type="submit" className="w-full rounded-lg bg-emerald-600 py-3 text-lg font-medium text-white transition-colors hover:bg-emerald-700">
        {initialData ? 'Save meal' : 'Add meal'}
      </button>
    </form>
  );
};
