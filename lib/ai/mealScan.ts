import { ScannedFoodItem, MealScanResult, SugarImpact } from '@/lib/types';

const MIN_CONFIDENCE = 0.15;
const MAX_FOOD_ITEMS = 15;
const MIN_GRAMS = 5;
const MAX_GRAMS = 2000;

export function extractJson(text: string): string {
  const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlock) return jsonBlock[1].trim();

  const braceStart = text.indexOf('{');
  const braceEnd = text.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd > braceStart) {
    return text.slice(braceStart, braceEnd + 1);
  }

  return text.trim();
}

export function hashImage(base64: string): string {
  let hash = 0;
  const str = base64.slice(0, 10000);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function validateAndNormalize(raw: unknown): MealScanResult {
  const fallback: MealScanResult = {
    foods: [],
    meal_summary: 'Could not analyze image',
    overall_confidence: 0,
    notes: ['AI response was not valid'],
    scanned_at: new Date().toISOString(),
  };

  if (!raw || typeof raw !== 'object') return fallback;

  const data = raw as Record<string, unknown>;

  const foods = normalizeFoods(data.foods);
  const meal_summary = typeof data.meal_summary === 'string' ? data.meal_summary.trim() : fallback.meal_summary;
  const overall_confidence = clampConfidence(data.overall_confidence);
  const notes = normalizeNotes(data.notes);

  if (foods.length === 0) {
    notes.push('No identifiable foods found');
  }

  return { foods, meal_summary, overall_confidence, notes, scanned_at: new Date().toISOString() };
}

function normalizeFoods(raw: unknown): ScannedFoodItem[] {
  if (!Array.isArray(raw)) return [];

  const items: ScannedFoodItem[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;

    const f = item as Record<string, unknown>;
    const name = typeof f.name === 'string' ? f.name.trim() : '';
    const portion_description = typeof f.portion_description === 'string' ? f.portion_description.trim() : '';
    const estimated_grams = clampGrams(f.estimated_grams);
    const confidence = clampConfidence(f.confidence);

    if (!name) continue;
    if (confidence < MIN_CONFIDENCE) continue;

    items.push({ name, portion_description, estimated_grams, confidence });

    if (items.length >= MAX_FOOD_ITEMS) break;
  }

  return items;
}

function normalizeNotes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((n): n is string => typeof n === 'string').slice(0, 10);
}

function clampConfidence(value: unknown): number {
  if (typeof value !== 'number') return 0;
  return Math.max(0, Math.min(1, value));
}

function clampGrams(value: unknown): number {
  if (typeof value !== 'number') return 0;
  return Math.max(MIN_GRAMS, Math.min(MAX_GRAMS, Math.round(value)));
}

export function computeSugarImpact(foods: { name: string; nutrition?: { carbs_total?: number } }[]): SugarImpact {
  const foodCount = foods.filter((f) => f.nutrition?.carbs_total != null).length;
  const totalCarbs = Math.round(
    foods.reduce((sum, f) => sum + (f.nutrition?.carbs_total ?? 0), 0)
  );

  let level: 'minimal' | 'moderate' | 'significant' | 'high';
  let description: string;

  if (totalCarbs <= 0) {
    level = 'minimal';
    description = 'No carbohydrate data available for this meal.';
  } else if (totalCarbs < 20) {
    level = 'minimal';
    description = `Low-carb meal (~${totalCarbs}g). Minimal impact on blood sugar.`;
  } else if (totalCarbs < 50) {
    level = 'moderate';
    description = `Moderate-carb meal (~${totalCarbs}g). Blood sugar may rise moderately.`;
  } else if (totalCarbs < 80) {
    level = 'significant';
    description = `Higher-carb meal (~${totalCarbs}g). This may significantly raise blood sugar. Consider adjusting insulin or portion sizes.`;
  } else {
    level = 'high';
    description = `High-carb meal (~${totalCarbs}g). This could spike blood sugar. Monitor closely and consider insulin adjustment.`;
  }

  return { level, description, total_carbs: totalCarbs, food_count: foodCount };
}

export function buildFallbackResult(error: string): MealScanResult {
  return {
    foods: [],
    meal_summary: 'Analysis failed',
    overall_confidence: 0,
    notes: [error],
    scanned_at: new Date().toISOString(),
    total_carbs: 0,
    sugar_impact: { level: 'minimal', description: 'Analysis failed', total_carbs: 0, food_count: 0 },
  };
}
