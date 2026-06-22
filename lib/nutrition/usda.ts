import { FoodNutrition } from '@/lib/types';

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

function getApiKey(): string {
  return process.env.USDA_API_KEY || '';
}

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: { nutrientId: number; value: number; nutrientName?: string }[];
}

interface USDAResponse {
  foods: USDAFood[];
  totalHits: number;
}

const CARB_NUTRIENT_ID = 1005;

export async function lookupFood(query: string): Promise<FoodNutrition | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const url = `${USDA_BASE}/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=1&dataType=Foundation,SR Legacy,Branded`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!res.ok) return null;

    const data: USDAResponse = await res.json();
    if (!data.foods?.length) return null;

    const best = data.foods[0];
    const carbNutrient = best.foodNutrients.find((n) => n.nutrientId === CARB_NUTRIENT_ID);

    if (!carbNutrient || typeof carbNutrient.value !== 'number') return null;

    const carbsPer100g = Math.round(carbNutrient.value * 10) / 10;

    return {
      carbs_per_100g: carbsPer100g,
      carbs_total: 0,
      source: `USDA: ${best.description}`,
    };
  } catch {
    return null;
  }
}

export function calculateCarbs(grams: number, carbsPer100g: number): number {
  return Math.round((grams / 100) * carbsPer100g * 10) / 10;
}

export async function lookupAllFoods(foods: { name: string; estimated_grams: number }[]): Promise<Map<string, FoodNutrition>> {
  const results = new Map<string, FoodNutrition>();

  const entries = await Promise.allSettled(
    foods.map((food) => lookupFood(food.name))
  );

  for (let i = 0; i < foods.length; i++) {
    const result = entries[i];
    if (result.status === 'fulfilled' && result.value) {
      const nutrition = result.value;
      nutrition.carbs_total = calculateCarbs(foods[i].estimated_grams, nutrition.carbs_per_100g);
      results.set(foods[i].name, nutrition);
    }
  }

  return results;
}
