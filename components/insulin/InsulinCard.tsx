'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { InsulinDose } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Trash2, Edit2 } from 'lucide-react';

interface InsulinCardProps {
  dose: InsulinDose;
  onEdit?: (dose: InsulinDose) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const getInsulinTypeLabel = (type: string, t: any): string => {
  const labelMap: { [key: string]: string } = {
    rapid_acting: t('insulin.rapidActing'),
    long_acting: t('insulin.longActing'),
    mixed: t('insulin.mixed'),
  };
  return labelMap[type] || type;
};

const getInsulinContextLabel = (context: string | undefined, t: any): string => {
  const labelMap: { [key: string]: string } = {
    before_breakfast: t('glucose.beforeBreakfast'),
    after_breakfast: t('glucose.afterBreakfast'),
    before_lunch: t('glucose.beforeLunch'),
    after_lunch: t('glucose.afterLunch'),
    before_dinner: t('glucose.beforeDinner'),
    after_dinner: t('glucose.afterDinner'),
    before_sleep: t('glucose.beforeSleep'),
    random: t('glucose.random'),
    extra_correction: t('insulin.extraCorrection'),
  };
  return context ? labelMap[context] || context : t('glucose.random');
};

export const InsulinCard: React.FC<InsulinCardProps> = ({
  dose,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="glass3d rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/20 dark:bg-purple-500/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">{dose.units}</span>
          <span className="text-sm text-purple-700 dark:text-purple-200">{t('insulin.units')}</span>
        </div>
        <span className="inline-block rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold text-white dark:bg-purple-500/80">
          {getInsulinTypeLabel(dose.insulin_type, t)}
        </span>
      </div>

      <div className="space-y-1 text-sm mb-3">
        <p className="text-gray-700 dark:text-gray-200">
          {getInsulinTypeLabel(dose.insulin_type, t)} • {getInsulinContextLabel(dose.dose_context, t)}
        </p>
        <p className="text-gray-700 dark:text-gray-200">{formatDateTime(dose.dose_time)}</p>
        {dose.notes && (
          <p className="break-words overflow-hidden italic text-gray-700 dark:text-gray-200 [overflow-wrap:anywhere]">
            "{dose.notes}"
          </p>
        )}
      </div>

      {showActions && (onEdit || onDelete) && (
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(dose)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <Edit2 size={16} />
              {t('history.edit')}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(dose.id)}
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
