'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlucoseStore } from '@/lib/store/glucoseStore';
import { useInsulinStore } from '@/lib/store/insulinStore';
import { useToast } from '@/components/common/Toast';
import { GlucoseCard } from '@/components/glucose/GlucoseCard';
import { InsulinCard } from '@/components/insulin/InsulinCard';
import { MealCard } from '@/components/meal/MealCard';
import { WellnessCard } from '@/components/wellness/WellnessCard';
import { GlucoseForm } from '@/components/glucose/GlucoseForm';
import { InsulinForm } from '@/components/insulin/InsulinForm';
import { MealForm } from '@/components/meal/MealForm';
import { WellnessForm } from '@/components/wellness/WellnessForm';
import { Modal } from '@/components/common/Modal';
import { GlucoseReading, InsulinDose, MealLog, WellnessEntry } from '@/lib/types';
import { Search, Droplet, HeartPulse, Salad, Syringe } from 'lucide-react';
import { useMealStore } from '@/lib/store/mealStore';
import { useWellnessStore } from '@/lib/store/wellnessStore';

export default function HistoryPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'glucose' | 'insulin' | 'meal' | 'wellness'>('glucose');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'glucose' | 'insulin' | 'meal' | 'wellness' | null>(null);

  const { readings, deleteReading } = useGlucoseStore();
  const { doses, deleteDose } = useInsulinStore();
  const { meals, deleteMeal } = useMealStore();
  const { entries, deleteEntry } = useWellnessStore();
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sortedReadings = [...readings].sort((a, b) => new Date(b.reading_time).getTime() - new Date(a.reading_time).getTime());
  const sortedDoses = [...doses].sort((a, b) => new Date(b.dose_time).getTime() - new Date(a.dose_time).getTime());
  const sortedMeals = [...meals].sort((a, b) => new Date(b.meal_time).getTime() - new Date(a.meal_time).getTime());
  const sortedEntries = [...entries].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

  const filteredReadings = sortedReadings.filter((r) =>
    r.value.toString().includes(searchQuery) || r.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDoses = sortedDoses.filter((d) =>
    d.units.toString().includes(searchQuery) || d.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredMeals = sortedMeals.filter((meal) =>
    meal.title.toLowerCase().includes(searchQuery.toLowerCase()) || meal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredEntries = sortedEntries.filter((entry) =>
    entry.mood.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.symptoms.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const editingReading = editingId ? readings.find(r => r.id === editingId) : null;
  const editingDose = editingId ? doses.find(d => d.id === editingId) : null;
  const editingMeal = editingId ? meals.find(m => m.id === editingId) : null;
  const editingWellness = editingId ? entries.find(e => e.id === editingId) : null;

  const handleDeleteConfirm = () => {
    if (confirmDeleteId && deleteType) {
      if (deleteType === 'glucose') {
        deleteReading(confirmDeleteId);
        showToast(t('glucose.deleted'), 'success');
      } else if (deleteType === 'insulin') {
        deleteDose(confirmDeleteId);
        showToast(t('insulin.deleted'), 'success');
      } else if (deleteType === 'meal') {
        deleteMeal(confirmDeleteId);
        showToast('Meal deleted', 'success');
      } else {
        deleteEntry(confirmDeleteId);
        showToast('Wellness entry deleted', 'success');
      }
      setConfirmDeleteId(null);
      setDeleteType(null);
    }
  };

  const handleEditSuccess = () => {
    setEditingId(null);
    if (deleteType === 'glucose') {
      showToast(t('glucose.updated'), 'success');
    } else if (deleteType === 'insulin') {
      showToast(t('insulin.updated'), 'success');
    } else if (deleteType === 'meal') {
      showToast('Meal updated', 'success');
    } else {
      showToast('Wellness entry updated', 'success');
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pt-6 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('history.title')}</h1>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <button
          onClick={() => setActiveTab('glucose')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'glucose'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          <Droplet size={20} />
          {t('history.glucose')}
        </button>
        <button
          onClick={() => setActiveTab('insulin')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'insulin'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          <Syringe size={20} />
          {t('history.insulin')}
        </button>
        <button
          onClick={() => setActiveTab('meal')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'meal'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          <Salad size={20} />
          Meals
        </button>
        <button
          onClick={() => setActiveTab('wellness')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'wellness'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
          }`}
        >
          <HeartPulse size={20} />
          Wellness
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
        <input
          type="text"
          placeholder={t('history.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'glucose' ? (
          <>
            {filteredReadings.length > 0 ? (
              filteredReadings.map((reading) => (
                <GlucoseCard
                  key={reading.id}
                  reading={reading}
                  showActions
                  onEdit={() => {
                    setEditingId(reading.id);
                    setDeleteType('glucose');
                  }}
                  onDelete={(id) => {
                    setConfirmDeleteId(id);
                    setDeleteType('glucose');
                  }}
                />
              ))
            ) : (
              <div className="glass3d text-center py-8 bg-gray-50 rounded-xl">
                <Droplet size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">{t('history.noGlucose')}</p>
              </div>
            )}
          </>
        ) : null}

        {activeTab === 'insulin' ? (
          <>
            {filteredDoses.length > 0 ? (
              filteredDoses.map((dose) => (
                <InsulinCard
                  key={dose.id}
                  dose={dose}
                  showActions
                  onEdit={() => {
                    setEditingId(dose.id);
                    setDeleteType('insulin');
                  }}
                  onDelete={(id) => {
                    setConfirmDeleteId(id);
                    setDeleteType('insulin');
                  }}
                />
              ))
            ) : (
              <div className="glass3d text-center py-8 bg-gray-50 rounded-xl">
                <Syringe size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">{t('history.noInsulin')}</p>
              </div>
            )}
          </>
        ) : null}

        {activeTab === 'meal' ? (
          <>
            {filteredMeals.length > 0 ? (
              filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  showActions
                  onEdit={() => {
                    setEditingId(meal.id);
                    setDeleteType('meal');
                  }}
                  onDelete={(id) => {
                    setConfirmDeleteId(id);
                    setDeleteType('meal');
                  }}
                />
              ))
            ) : (
              <div className="glass3d text-center py-8 bg-gray-50 rounded-xl">
                <Salad size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No meals logged yet</p>
              </div>
            )}
          </>
        ) : null}

        {activeTab === 'wellness' ? (
          <>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <WellnessCard
                  key={entry.id}
                  entry={entry}
                  showActions
                  onEdit={() => {
                    setEditingId(entry.id);
                    setDeleteType('wellness');
                  }}
                  onDelete={(id) => {
                    setConfirmDeleteId(id);
                    setDeleteType('wellness');
                  }}
                />
              ))
            ) : (
              <div className="glass3d text-center py-8 bg-gray-50 rounded-xl">
                <HeartPulse size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No wellness entries yet</p>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Edit Modal */}
      {deleteType === 'glucose' && editingReading && (
        <Modal
          isOpen={editingId !== null}
          onClose={() => {
            setEditingId(null);
            setDeleteType(null);
          }}
          title={t('common.edit')}
        >
          <GlucoseForm
            initialData={editingReading}
            onSuccess={handleEditSuccess}
          />
        </Modal>
      )}

      {deleteType === 'insulin' && editingDose && (
        <Modal
          isOpen={editingId !== null}
          onClose={() => {
            setEditingId(null);
            setDeleteType(null);
          }}
          title={t('common.edit')}
        >
          <InsulinForm
            initialData={editingDose}
            onSuccess={handleEditSuccess}
          />
        </Modal>
      )}

      {deleteType === 'meal' && editingMeal && (
        <Modal
          isOpen={editingId !== null}
          onClose={() => {
            setEditingId(null);
            setDeleteType(null);
          }}
          title="Edit meal"
        >
          <MealForm initialData={editingMeal} onSuccess={handleEditSuccess} />
        </Modal>
      )}

      {deleteType === 'wellness' && editingWellness && (
        <Modal
          isOpen={editingId !== null}
          onClose={() => {
            setEditingId(null);
            setDeleteType(null);
          }}
          title="Edit wellness entry"
        >
          <WellnessForm initialData={editingWellness} onSuccess={handleEditSuccess} />
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass3d bg-white rounded-2xl max-w-sm w-full p-6 dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('common.confirm')}</h2>
            <p className="text-gray-600 mb-6">{t('history.confirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirmDeleteId(null);
                  setDeleteType(null);
                }}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
