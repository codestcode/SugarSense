'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlucoseReading } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { getGlucoseStatusColor } from '@/lib/utils';
import { Trash2, Edit2 } from 'lucide-react';

interface GlucoseCardProps {
  reading: GlucoseReading;
  onEdit?: (reading: GlucoseReading) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const getMealRelationLabel = (relation: string, t: any): string => {
  const labelMap: { [key: string]: string } = {
    before_breakfast: t('glucose.beforeBreakfast'),
    after_breakfast: t('glucose.afterBreakfast'),
    before_lunch: t('glucose.beforeLunch'),
    after_lunch: t('glucose.afterLunch'),
    before_dinner: t('glucose.beforeDinner'),
    after_dinner: t('glucose.afterDinner'),
    before_sleep: t('glucose.beforeSleep'),
    random: t('glucose.random'),
  };
  return labelMap[relation] || relation;
};

const getStatusLabel = (status: string, t: any): string => {
  const labelMap: { [key: string]: string } = {
    low: t('glucose.status.low'),
    normal: t('glucose.status.normal'),
    high: t('glucose.status.high'),
  };
  return labelMap[status] || status;
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'low':
      return 'border border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200';
    case 'high':
      return 'border border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-200';
    case 'normal':
    default:
      return 'border border-green-200 bg-green-100 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-200';
  }
};

export const GlucoseCard: React.FC<GlucoseCardProps> = ({
  reading,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`glass3d p-4 rounded-xl border ${getGlucoseStatusColor(reading.status)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{reading.value}</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">mg/dL</span>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(reading.status)}`}>
          {getStatusLabel(reading.status, t)}
        </span>
      </div>

      <div className="space-y-1 text-sm mb-3">
        <p className="text-gray-700 dark:text-gray-200">
          <span className="font-medium">{t('glucose.mealRelation')}:</span> {getMealRelationLabel(reading.meal_relation, t)}
        </p>
        <p className="text-gray-600 dark:text-gray-300">{formatDateTime(reading.reading_time)}</p>
        {reading.notes && (
          <p className="break-words overflow-hidden italic text-gray-700 dark:text-gray-200 [overflow-wrap:anywhere]">
            "{reading.notes}"
          </p>
        )}
      </div>

      {showActions && (onEdit || onDelete) && (
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(reading)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <Edit2 size={16} />
              {t('history.edit')}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(reading.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
            >
              <Trash2 size={16} />
              {t('history.delete')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
