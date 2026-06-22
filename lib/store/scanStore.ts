import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { MealScanResult, MealScanRecord, ScanState } from '@/lib/types';

const MAX_CACHE_ENTRIES = 50;
const MAX_SCAN_HISTORY = 20;

export const useScanStore = create<ScanState>()(
  persist(
    (set, get) => ({
      recentScans: [],
      cache: {},

      addScan: (record: MealScanRecord) => {
        set((state) => {
          const updatedCache = { ...state.cache, [record.image_hash]: record.result };
          const keys = Object.keys(updatedCache);
          if (keys.length > MAX_CACHE_ENTRIES) {
            const oldest = keys.slice(0, keys.length - MAX_CACHE_ENTRIES);
            oldest.forEach((k) => delete updatedCache[k]);
          }

          return {
            cache: updatedCache,
            recentScans: [record, ...state.recentScans].slice(0, MAX_SCAN_HISTORY),
          };
        });
      },

      getCached: (hash: string) => {
        return get().cache[hash];
      },

      clearCache: () => {
        set({ cache: {}, recentScans: [] });
      },
    }),
    {
      name: 'scan-store',
      version: 1,
    }
  )
);
