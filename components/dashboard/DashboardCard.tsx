'use client';

import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20',
  green: 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/20',
  orange: 'bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20',
  red: 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20',
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
}) => {
  return (
    <div className={`glass3d p-6 rounded-2xl border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/40 text-gray-400 dark:bg-white/5 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
