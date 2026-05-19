import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { GlucoseReading, GlucoseStatus, GlucoseState } from '../types';
import { isToday, isWithinInterval, startOfDay, endOfDay, isWithinInterval as isInRange, subDays, parseISO } from 'date-fns';

const determineStatus = (value: number): GlucoseStatus => {
  if (value < 70) return 'low';
  if (value > 180) return 'high';
  return 'normal';
};

export const useGlucoseStore = create<GlucoseState>()(
  persist(
    (set, get) => ({
      readings: [],

      addReading: (reading) => {
        const newReading: GlucoseReading = {
          ...reading,
          id: uuidv4(),
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          readings: [...state.readings, newReading],
        }));
      },

      updateReading: (id, updates) => {
        set((state) => ({
          readings: state.readings.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      deleteReading: (id) => {
        set((state) => ({
          readings: state.readings.filter((r) => r.id !== id),
        }));
      },

      getReadings: () => get().readings,

      getTodayReadings: () => {
        const today = new Date();
        return get().readings.filter((r) => isToday(parseISO(r.reading_time)));
      },

      getReadingsByDateRange: (startDate, endDate) => {
        return get().readings.filter((r) => {
          const readingDate = parseISO(r.reading_time);
          return isInRange(readingDate, { start: startDate, end: endDate });
        });
      },

      getLatestReading: () => {
        const readings = get().readings;
        return readings.length > 0 ? readings[readings.length - 1] : undefined;
      },

      getTodayAverage: () => {
        const todayReadings = get().getTodayReadings();
        if (todayReadings.length === 0) return 0;
        const sum = todayReadings.reduce((acc, r) => acc + r.value, 0);
        return Math.round(sum / todayReadings.length);
      },

      getWeeklyAverage: () => {
        const today = new Date();
        const weekAgo = subDays(today, 7);
        const weekReadings = get().getReadingsByDateRange(weekAgo, today);
        if (weekReadings.length === 0) return 0;
        const sum = weekReadings.reduce((acc, r) => acc + r.value, 0);
        return Math.round(sum / weekReadings.length);
      },

      getMonthlyAverage: () => {
        const today = new Date();
        const monthAgo = subDays(today, 30);
        const monthReadings = get().getReadingsByDateRange(monthAgo, today);
        if (monthReadings.length === 0) return 0;
        const sum = monthReadings.reduce((acc, r) => acc + r.value, 0);
        return Math.round(sum / monthReadings.length);
      },
    }),
    {
      name: 'glucose-store',
      version: 1,
    }
  )
);
