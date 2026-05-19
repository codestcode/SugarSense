import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, SettingsState } from '../types';

const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'light',
  targetRangeLow: 70,
  targetRangeHigh: 180,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      getSettings: () => get().settings,
    }),
    {
      name: 'settings-store',
      version: 1,
    }
  )
);
