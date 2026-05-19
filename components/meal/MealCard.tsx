'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { MealLog } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface MealCardProps {
  meal: MealLog;
  showActions?: boolean;
  onEdit?: (meal: MealLog) => void;
  onDelete?: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, showActions = false, onEdit, onDelete }) => (
  <div className="glass3d rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <p className="text-lg font-semibold text-emerald-950 dark:text-emerald-100">{meal.title}</p>
        <p className="text-sm capitalize text-emerald-700 dark:text-emerald-200">{meal.tag.replace('_', ' ')}</p>
      </div>
      {meal.carbs_estimate ? (
        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
          {meal.carbs_estimate}g carbs
        </span>
      ) : null}
    </div>

    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
      <p>{formatDateTime(meal.meal_time)}</p>
      {meal.description ? <p className="italic">"{meal.description}"</p> : null}
    </div>

    {showActions && (onEdit || onDelete) ? (
      <div className="mt-3 flex gap-2">
        {onEdit ? (
          <button onClick={() => onEdit(meal)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">
            <Edit2 size={16} />
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button onClick={() => onDelete(meal.id)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">
            <Trash2 size={16} />
            Delete
          </button>
        ) : null}
      </div>
    ) : null}
  </div>
);
