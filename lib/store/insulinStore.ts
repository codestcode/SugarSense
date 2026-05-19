import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { InsulinDose, InsulinState } from '../types';
import { isToday, isWithinInterval, subDays, parseISO } from 'date-fns';

export const useInsulinStore = create<InsulinState>()(
  persist(
    (set, get) => ({
      doses: [],

      addDose: (dose) => {
        const newDose: InsulinDose = {
          ...dose,
          id: uuidv4(),
          created_at: new Date().toISOString(),
        };
        set((state) => ({
          doses: [...state.doses, newDose],
        }));
      },

      updateDose: (id, updates) => {
        set((state) => ({
          doses: state.doses.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
      },

      deleteDose: (id) => {
        set((state) => ({
          doses: state.doses.filter((d) => d.id !== id),
        }));
      },

      getDoses: () => get().doses,

      getTodayDoses: () => {
        return get().doses.filter((d) => isToday(parseISO(d.dose_time)));
      },

      getDosesByDateRange: (startDate, endDate) => {
        return get().doses.filter((d) => {
          const doseDate = parseISO(d.dose_time);
          return isWithinInterval(doseDate, { start: startDate, end: endDate });
        });
      },

      getTotalTodayUnits: () => {
        const todayDoses = get().getTodayDoses();
        return todayDoses.reduce((acc, d) => acc + d.units, 0);
      },
    }),
    {
      name: 'insulin-store',
      version: 1,
    }
  )
);
