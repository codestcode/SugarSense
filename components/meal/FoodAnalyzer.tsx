'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Apple, Camera, ImageUp, Info, Loader2, Pencil, Salad, Scan, X } from 'lucide-react';
import { ScannedFoodWithNutrition, MealScanResult } from '@/lib/types';

interface FoodAnalyzerProps {
  onSaveMeal?: (title: string, description: string, carbs?: number) => void;
}

export const FoodAnalyzer: React.FC<FoodAnalyzerProps> = ({ onSaveMeal }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MealScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editFoods, setEditFoods] = useState<ScannedFoodWithNutrition[]>([]);
  const [editSummary, setEditSummary] = useState('');
  const [rateLimited, setRateLimited] = useState(false);

  const resetAll = useCallback(() => {
    setImage(null);
    setRawImage(null);
    setResult(null);
    setError(null);
    setEditing(false);
    setRateLimited(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setResult(null);
    setEditing(false);
    setRawImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!rawImage || !image) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setRateLimited(false);

    try {
      const formData = new FormData();
      formData.append('image', rawImage, 'food.jpg');

      const res = await fetch('/api/meal-scan', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.status === 429) {
        setRateLimited(true);
        setError(data.error || 'Too many requests. Please wait.');
        setIsAnalyzing(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Analysis failed');
        setIsAnalyzing(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  }, [rawImage, image]);

  const startEditing = () => {
    if (!result) return;
    setEditFoods(result.foods.map((f) => ({ ...f })));
    setEditSummary(result.meal_summary);
    setEditing(true);
  };

  const updateFood = (index: number, field: keyof ScannedFoodItem, value: string | number) => {
    setEditFoods((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  const removeFood = (index: number) => {
    setEditFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const saveEdits = () => {
    if (!result) return;
    const updated: MealScanResult = {
      ...result,
      foods: editFoods,
      meal_summary: editSummary,
    };
    setResult(updated);
    setEditing(false);
  };

  const handleSaveAsMeal = () => {
    if (!result || !onSaveMeal) return;
    const foods = editing ? editFoods : result.foods;
    const summary = editing ? editSummary : result.meal_summary;
    const title = foods.map((f) => f.name).join(', ') || summary;
    const description = foods
      .map((f) => `${f.name} (${f.portion_description}, ${f.estimated_grams}g)`)
      .join('\n');
    onSaveMeal(title, description, result.total_carbs);
  };

  const confidenceColor = (v: number) => {
    if (v >= 0.7) return 'text-emerald-600 dark:text-emerald-400';
    if (v >= 0.4) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 py-8 text-white transition-opacity hover:opacity-90"
          >
            <Camera size={32} />
            <span className="text-lg font-semibold">Take a photo</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-white py-6 text-gray-600 transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-emerald-400"
          >
            <ImageUp size={24} />
            <span className="font-medium">Upload from gallery</span>
          </button>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Food to analyze"
              className="max-h-80 w-full object-contain bg-black/5 dark:bg-white/5"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Scan size={20} />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze food'}
            </button>

            <button
              type="button"
              onClick={resetAll}
              disabled={isAnalyzing}
              className="rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
            >
              Retake
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              <p className="font-medium">{rateLimited ? 'Rate limit reached' : 'Analysis failed'}</p>
              <p className="mt-1 opacity-80">{error}</p>
              {rateLimited && (
                <button
                  type="button"
                  onClick={analyzeImage}
                  className="mt-2 rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {result && !editing && (
            <div className="space-y-3">
              {/* Each food as a card */}
              {result.foods.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-gray-500 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-gray-400">
                  <p className="font-medium text-amber-800 dark:text-amber-200">No foods identified</p>
                  {result.notes.map((n, i) => (
                    <p key={i} className="mt-1 text-xs text-amber-600 dark:text-amber-400">{n}</p>
                  ))}
                </div>
              ) : (
                <>
                  {result.foods.map((food, i) => {
                    const hasCarbs = food.nutrition?.carbs_total != null;
                    return (
                      <div
                        key={i}
                        className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-800/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              <Salad size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-medium text-gray-900 dark:text-white">
                                  {food.name}
                                </p>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none ${confidenceColor(food.confidence)}`}>
                                  {Math.round(food.confidence * 100)}%
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {food.portion_description} · {food.estimated_grams}g
                              </p>
                            </div>
                          </div>
                          {hasCarbs && (
                            <div className="shrink-0 text-right">
                              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                                {food.nutrition!.carbs_total}g
                              </p>
                              <p className="text-[10px] text-gray-400">carbs</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Total Carbs Card */}
                  {result.total_carbs != null && result.total_carbs > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm dark:border-amber-500/20 dark:from-amber-900/20 dark:to-orange-900/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Apple size={20} className="text-amber-700 dark:text-amber-300" />
                          <span className="font-semibold text-amber-900 dark:text-amber-100">
                            Total Carbohydrates
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                          {result.total_carbs}g
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-amber-700/70 dark:text-amber-300/70">
                        Based on {result.sugar_impact?.food_count ?? result.foods.length} food items via USDA database
                      </p>
                    </div>
                  )}

                  {/* Sugar Impact Card */}
                  {result.sugar_impact && (
                    <div
                      className={`rounded-xl border p-4 shadow-sm ${
                        result.sugar_impact.level === 'minimal'
                          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-900/10'
                          : result.sugar_impact.level === 'moderate'
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-900/10'
                          : result.sugar_impact.level === 'significant'
                          ? 'border-orange-200 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-900/10'
                          : 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-900/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            result.sugar_impact.level === 'minimal'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : result.sugar_impact.level === 'moderate'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                              : result.sugar_impact.level === 'significant'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          <Info size={16} />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              result.sugar_impact.level === 'minimal'
                                ? 'text-emerald-900 dark:text-emerald-100'
                                : result.sugar_impact.level === 'moderate'
                                ? 'text-amber-900 dark:text-amber-100'
                                : result.sugar_impact.level === 'significant'
                                ? 'text-orange-900 dark:text-orange-100'
                                : 'text-red-900 dark:text-red-100'
                            }`}
                          >
                            {result.sugar_impact.level === 'minimal'
                              ? 'Minimal impact'
                              : result.sugar_impact.level === 'moderate'
                              ? 'Moderate impact'
                              : result.sugar_impact.level === 'significant'
                              ? 'Significant impact'
                              : 'High impact'}
                          </p>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {result.sugar_impact.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {result.notes.filter((n) => !n.includes('AI response was not valid')).length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                      {result.notes
                        .filter((n) => !n.includes('AI response was not valid'))
                        .map((note, i) => (
                          <p key={i} className="text-xs text-gray-500 dark:text-gray-400">· {note}</p>
                        ))}
                    </div>
                  )}
                </>
              )}

              {onSaveMeal && result.foods.length > 0 && (
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/20 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAsMeal}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    <Salad size={20} />
                    Save as meal
                  </button>
                </div>
              )}
            </div>
          )}

          {result && editing && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="mb-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                  <Pencil size={18} />
                  <span className="font-semibold">Edit foods</span>
                </div>

                <div className="space-y-3">
                  {editFoods.map((food, i) => (
                    <div key={i} className="rounded-lg bg-white/70 p-3 dark:bg-white/10">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <input
                          type="text"
                          value={food.name}
                          onChange={(e) => updateFood(i, 'name', e.target.value)}
                          className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/20 dark:bg-black/20 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeFood(i)}
                          className="rounded-full p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={food.portion_description}
                          onChange={(e) => updateFood(i, 'portion_description', e.target.value)}
                          placeholder="Portion"
                          className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/20 dark:bg-black/20 dark:text-white"
                        />
                        <input
                          type="number"
                          value={food.estimated_grams}
                          onChange={(e) => updateFood(i, 'estimated_grams', parseInt(e.target.value) || 0)}
                          className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/20 dark:bg-black/20 dark:text-white"
                        />
                        <span className="self-center text-xs text-gray-500">g</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Meal summary</label>
                  <input
                    type="text"
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-white/20 dark:bg-black/20 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={saveEdits}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <Salad size={20} />
                  Save edits
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl bg-gray-100 px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
