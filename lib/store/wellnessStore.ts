import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { WellnessEntry, WellnessState } from '../types';

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => {
        const newEntry: WellnessEntry = {
          ...entry,
          id: uuidv4(),
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          entries: [...state.entries, newEntry],
        }));
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      getEntries: () => get().entries,
    }),
    {
      name: 'wellness-store',
      version: 1,
    }
  )
);
