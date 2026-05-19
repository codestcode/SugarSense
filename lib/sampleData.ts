import { GlucoseReading, InsulinDose, MealLog, WellnessEntry } from './types';
import { subDays, format } from 'date-fns';

const mealRelations = ['before_breakfast', 'after_breakfast', 'before_lunch', 'after_lunch', 'before_dinner', 'after_dinner', 'before_sleep', 'random'];
const insulinTypes = ['rapid_acting', 'long_acting', 'mixed'];
const insulinContexts = ['before_breakfast', 'after_breakfast', 'before_lunch', 'after_lunch', 'before_dinner', 'after_dinner', 'before_sleep', 'random', 'extra_correction'];
const mealTags = ['breakfast', 'lunch', 'dinner', 'snack', 'late_night'];
const moods = ['low', 'neutral', 'good', 'stressed', 'calm'];
const sleepQualities = ['poor', 'fair', 'good'];
const symptoms = ['headache', 'tired', 'shaky', 'thirsty', 'none'];

function getRandomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function determineStatus(value: number) {
  if (value < 70) return 'low';
  if (value > 180) return 'high';
  return 'normal';
}

export function generateSampleGlucoseReadings(): GlucoseReading[] {
  const readings: GlucoseReading[] = [];
  const today = new Date();

  // Generate 30 days of data
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const day = subDays(today, dayOffset);

    // Generate 3-5 readings per day at different times
    const readingsPerDay = getRandomValue(3, 5);
    const times = [7, 10, 12, 16, 20]; // Different times of day

    for (let i = 0; i < readingsPerDay; i++) {
      const hour = times[i] || getRandomValue(6, 22);
      const minute = getRandomValue(0, 59);

      const reading_time = new Date(day);
      reading_time.setHours(hour, minute, 0, 0);

      // Generate realistic glucose values (mix of low, normal, high)
      let value: number;
      const rand = Math.random();
      if (rand < 0.1) {
        value = getRandomValue(40, 65); // Low
      } else if (rand < 0.15) {
        value = getRandomValue(200, 280); // High
      } else {
        value = getRandomValue(80, 160); // Normal
      }

      const id = Math.random().toString(36).substr(2, 9);
      readings.push({
        id,
        value,
        meal_relation: mealRelations[Math.floor(Math.random() * mealRelations.length)],
        notes: Math.random() > 0.7 ? 'Ate a meal' : '',
        reading_time: reading_time.toISOString(),
        status: determineStatus(value),
        created_at: reading_time.toISOString(),
      });
    }
  }

  return readings;
}

export function generateSampleInsulinDoses(): InsulinDose[] {
  const doses: InsulinDose[] = [];
  const today = new Date();

  // Generate 30 days of data
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const day = subDays(today, dayOffset);

    // Generate 1-3 doses per day
    const dosesPerDay = getRandomValue(1, 3);
    const times = [7, 12, 19];

    for (let i = 0; i < dosesPerDay; i++) {
      const hour = times[i] || getRandomValue(6, 22);
      const minute = getRandomValue(0, 59);

      const dose_time = new Date(day);
      dose_time.setHours(hour, minute, 0, 0);

      const id = Math.random().toString(36).substr(2, 9);
      doses.push({
        id,
        insulin_type: insulinTypes[Math.floor(Math.random() * insulinTypes.length)],
        dose_context: insulinContexts[Math.floor(Math.random() * insulinContexts.length)],
        units: getRandomValue(5, 25) + Math.random(),
        notes: '',
        dose_time: dose_time.toISOString(),
        created_at: dose_time.toISOString(),
      });
    }
  }

  return doses;
}

export function generateSampleMeals(): MealLog[] {
  const meals: MealLog[] = [];
  const today = new Date();
  const mealNames = ['Oats and fruit', 'Rice and chicken', 'Pasta bowl', 'Yogurt snack', 'Late sandwich'];
  const mealDescriptions = ['Balanced meal', 'Rice-heavy meal', 'Pasta with sauce', 'Light snack', 'Late-night bite'];

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const day = subDays(today, dayOffset);
    const mealsPerDay = getRandomValue(2, 4);
    const times = [8, 13, 19, 22];

    for (let i = 0; i < mealsPerDay; i++) {
      const meal_time = new Date(day);
      meal_time.setHours(times[i] || getRandomValue(6, 23), getRandomValue(0, 59), 0, 0);
      const index = Math.floor(Math.random() * mealNames.length);

      meals.push({
        id: Math.random().toString(36).substr(2, 9),
        title: mealNames[index],
        description: mealDescriptions[index],
        tag: mealTags[Math.floor(Math.random() * mealTags.length)] as MealLog['tag'],
        carbs_estimate: getRandomValue(15, 90),
        meal_time: meal_time.toISOString(),
        created_at: meal_time.toISOString(),
      });
    }
  }

  return meals;
}

export function generateSampleWellnessEntries(): WellnessEntry[] {
  const entries: WellnessEntry[] = [];
  const today = new Date();

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const recorded_at = subDays(today, dayOffset);
    recorded_at.setHours(21, getRandomValue(0, 59), 0, 0);

    const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
    entries.push({
      id: Math.random().toString(36).substr(2, 9),
      mood: moods[Math.floor(Math.random() * moods.length)] as WellnessEntry['mood'],
      stress_level: getRandomValue(1, 5),
      sleep_quality: sleepQualities[Math.floor(Math.random() * sleepQualities.length)] as WellnessEntry['sleep_quality'],
      symptoms: symptom === 'none' ? [] : [symptom],
      notes: Math.random() > 0.5 ? 'Sample wellness note' : '',
      recorded_at: recorded_at.toISOString(),
      created_at: recorded_at.toISOString(),
    });
  }

  return entries;
}

export function initializeSampleData() {
  const glucoseStore = localStorage.getItem('glucose-store');
  const insulinStore = localStorage.getItem('insulin-store');
  const mealStore = localStorage.getItem('meal-store');
  const wellnessStore = localStorage.getItem('wellness-store');

  // Only initialize if stores are empty
  if (!glucoseStore || !insulinStore || !mealStore || !wellnessStore) {
    const glucoseReadings = generateSampleGlucoseReadings();
    const insulinDoses = generateSampleInsulinDoses();
    const meals = generateSampleMeals();
    const wellnessEntries = generateSampleWellnessEntries();

    if (!glucoseStore) {
      localStorage.setItem('glucose-store', JSON.stringify({
        state: { readings: glucoseReadings },
        version: 1,
      }));
    }

    if (!insulinStore) {
      localStorage.setItem('insulin-store', JSON.stringify({
        state: { doses: insulinDoses },
        version: 1,
      }));
    }

    if (!mealStore) {
      localStorage.setItem('meal-store', JSON.stringify({
        state: { meals },
        version: 1,
      }));
    }

    if (!wellnessStore) {
      localStorage.setItem('wellness-store', JSON.stringify({
        state: { entries: wellnessEntries },
        version: 1,
      }));
    }
  }
}
