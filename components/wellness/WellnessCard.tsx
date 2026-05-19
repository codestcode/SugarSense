'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { WellnessEntry } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface WellnessCardProps {
  entry: WellnessEntry;
  showActions?: boolean;
  onEdit?: (entry: WellnessEntry) => void;
  onDelete?: (id: string) => void;
}

export const WellnessCard: React.FC<WellnessCardProps> = ({ entry, showActions = false, onEdit, onDelete }) => (
  <div className="glass3d rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
    <div className="mb-3 flex items-start justify-between">
      <div>
        <p className="text-lg font-semibold text-rose-950 dark:text-rose-100 capitalize">{entry.mood}</p>
        <p className="text-sm text-rose-700 dark:text-rose-200">Stress {entry.stress_level}/5 • Sleep {entry.sleep_quality}</p>
      </div>
      {entry.symptoms.length ? (
        <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
          {entry.symptoms.length} symptoms
        </span>
      ) : null}
    </div>

    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
      <p>{formatDateTime(entry.recorded_at)}</p>
      {entry.symptoms.length ? <p>{entry.symptoms.join(', ')}</p> : null}
      {entry.notes ? <p className="italic">"{entry.notes}"</p> : null}
    </div>

    {showActions && (onEdit || onDelete) ? (
      <div className="mt-3 flex gap-2">
        {onEdit ? (
          <button onClick={() => onEdit(entry)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600">
            <Edit2 size={16} />
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button onClick={() => onDelete(entry.id)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">
            <Trash2 size={16} />
            Delete
          </button>
        ) : null}
      </div>
    ) : null}
  </div>
);
