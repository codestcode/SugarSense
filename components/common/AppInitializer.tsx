'use client';

import { useEffect } from 'react';
import { initializeSampleData } from '@/lib/sampleData';

export const AppInitializer: React.FC = () => {
  useEffect(() => {
    // Initialize sample data only in development or on first load
    const hasInitialized = localStorage.getItem('app-initialized');
    if (!hasInitialized) {
      initializeSampleData();
      localStorage.setItem('app-initialized', 'true');
    }
  }, []);

  return null;
};
