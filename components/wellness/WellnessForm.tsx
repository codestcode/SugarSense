'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { MoodLevel, SleepQuality, WellnessEntry } from '@/lib/types';
import { useWellnessStore } from '@/lib/store/wellnessStore';

interface WellnessFormProps {
  onSuccess?: () => void;
  initialData?: WellnessEntry;
}

const moods: MoodLevel[] = ['low', 'neutral', 'good', 'stressed', 'calm'];
const sleepQualities: SleepQuality[] = ['poor', 'fair', 'good'];

export const WellnessForm: React.FC<WellnessFormProps> = ({ onSuccess, initialData }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      mood: initialData?.mood || 'neutral',
      stress_level: initialData?.stress_level || 3,
      sleep_quality: initialData?.sleep_quality || 'fair',
      symptoms: initialData?.symptoms.join(', ') || '',
      notes: initialData?.notes || '',
      date: initialData ? format(new Date(initialData.recorded_at), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: initialData ? format(new Date(initialData.recorded_at), 'HH:mm') : format(new Date(), 'HH:mm'),
    },
  });

  const { addEntry, updateEntry } = useWellnessStore();

  const onSubmit = (data: any) => {
    const payload = {
      mood: data.mood,
      stress_level: parseInt(data.stress_level, 10),
      sleep_quality: data.sleep_quality,
      symptoms: data.symptoms
        ? data.symptoms
            .split(',')
            .map((value: string) => value.trim())
            .filter(Boolean)
        : [],
      notes: data.notes,
      recorded_at: new Date(`${data.date}T${data.time}`).toISOString(),
    };

    if (initialData) {
      updateEntry(initialData.id, payload);
    } else {
      addEntry(payload);
    }

    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Mood</label>
        <select
          {...register('mood')}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          {moods.map((mood) => (
            <option key={mood} value={mood}>
              {mood}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Stress level (1-5)</label>
        <input
          type="number"
          min="1"
          max="5"
          {...register('stress_level')}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Sleep quality</label>
        <select
          {...register('sleep_quality')}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          {sleepQualities.map((quality) => (
            <option key={quality} value={quality}>
              {quality}
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
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Time</label>
          <input
            type="time"
            {...register('time')}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Symptoms</label>
        <input
          {...register('symptoms')}
          placeholder="Headache, shaky, tired"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Slept late and felt stressed at work"
          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <button type="submit" className="w-full rounded-lg bg-rose-600 py-3 text-lg font-medium text-white transition-colors hover:bg-rose-700">
        {initialData ? 'Save wellness entry' : 'Add wellness entry'}
      </button>
    </form>
  );
};
