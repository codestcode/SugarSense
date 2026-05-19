import {
  differenceInCalendarDays,
  format,
  getHours,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns';
import {
  GlucoseReading,
  InsulinDose,
  MealLog,
  MealTag,
  MoodLevel,
  WellnessEntry,
} from '@/lib/types';

type MealPatternMap = Record<string, string>;

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getMealWindow(tag: MealTag) {
  switch (tag) {
    case 'breakfast':
      return { start: 5, end: 11 };
    case 'lunch':
      return { start: 11, end: 16 };
    case 'dinner':
      return { start: 17, end: 22 };
    case 'late_night':
      return { start: 21, end: 24 };
    case 'snack':
    default:
      return { start: 0, end: 24 };
  }
}

function describeMealPattern(values: number[]) {
  if (values.length === 0) return 'no clear pattern';
  const avg = average(values);
  if (avg > 180) return 'frequently high';
  if (avg < 80) return 'often lower than usual';
  return 'usually stable';
}

function findRelatedReadings(meal: MealLog, readings: GlucoseReading[]) {
  const mealTime = parseISO(meal.meal_time);
  const afterWindowEnd = new Date(mealTime.getTime() + 3 * 60 * 60 * 1000);
  const beforeWindowStart = new Date(mealTime.getTime() - 2 * 60 * 60 * 1000);

  const before = readings
    .filter((reading) => {
      const time = parseISO(reading.reading_time);
      return isAfter(time, beforeWindowStart) && isBefore(time, mealTime);
    })
    .sort((a, b) => parseISO(b.reading_time).getTime() - parseISO(a.reading_time).getTime())[0];

  const after = readings
    .filter((reading) => {
      const time = parseISO(reading.reading_time);
      return isAfter(time, mealTime) && isBefore(time, afterWindowEnd);
    })
    .sort((a, b) => parseISO(a.reading_time).getTime() - parseISO(b.reading_time).getTime())[0];

  return { before, after };
}

function getMoodDistribution(entries: WellnessEntry[]) {
  return entries.reduce<Record<MoodLevel, number>>(
    (acc, entry) => {
      acc[entry.mood] += 1;
      return acc;
    },
    { low: 0, neutral: 0, good: 0, stressed: 0, calm: 0 }
  );
}

export function buildHealthSummary({
  readings,
  doses,
  meals,
  wellnessEntries,
  targetLow,
  targetHigh,
}: {
  readings: GlucoseReading[];
  doses: InsulinDose[];
  meals: MealLog[];
  wellnessEntries: WellnessEntry[];
  targetLow: number;
  targetHigh: number;
}) {
  const now = new Date();
  const last7Days = subDays(now, 7);
  const previous7Days = subDays(now, 14);

  const recentReadings = readings.filter((reading) => parseISO(reading.reading_time) >= last7Days);
  const priorReadings = readings.filter((reading) => {
    const time = parseISO(reading.reading_time);
    return time >= previous7Days && time < last7Days;
  });
  const recentDoses = doses.filter((dose) => parseISO(dose.dose_time) >= last7Days);
  const recentMeals = meals.filter((meal) => parseISO(meal.meal_time) >= last7Days);
  const recentWellness = wellnessEntries.filter((entry) => parseISO(entry.recorded_at) >= last7Days);

  const recentValues = recentReadings.map((reading) => reading.value);
  const previousValues = priorReadings.map((reading) => reading.value);
  const inRange = recentReadings.filter(
    (reading) => reading.value >= targetLow && reading.value <= targetHigh
  ).length;

  const mealPatterns = recentMeals.reduce<MealPatternMap>((acc, meal) => {
    const mealReadings = recentReadings.filter((reading) => {
      const hour = getHours(parseISO(reading.reading_time));
      const window = getMealWindow(meal.tag);
      return hour >= window.start && hour < window.end;
    });
    acc[`after_${meal.tag}`] = describeMealPattern(mealReadings.map((reading) => reading.value));
    return acc;
  }, {});

  const repeatedHighContexts = ['after_breakfast', 'after_lunch', 'after_dinner', 'before_sleep']
    .map((context) => ({
      context,
      count: recentReadings.filter((reading) => reading.meal_relation === context && reading.value > targetHigh).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const repeatedLowContexts = ['before_breakfast', 'before_lunch', 'before_dinner', 'random']
    .map((context) => ({
      context,
      count: recentReadings.filter((reading) => reading.meal_relation === context && reading.value < targetLow).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const foodImpact = recentMeals.slice(-12).map((meal) => {
    const related = findRelatedReadings(meal, recentReadings);
    const beforeValue = related.before?.value ?? null;
    const afterValue = related.after?.value ?? null;
    return {
      meal: meal.title,
      tag: meal.tag,
      meal_time: meal.meal_time,
      carbs_estimate: meal.carbs_estimate ?? null,
      before_glucose: beforeValue,
      after_glucose: afterValue,
      delta: beforeValue !== null && afterValue !== null ? afterValue - beforeValue : null,
    };
  });

  const glucoseByDay = recentReadings.reduce<Record<string, number[]>>((acc, reading) => {
    const day = format(parseISO(reading.reading_time), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(reading.value);
    return acc;
  }, {});

  const stabilityByDay = Object.entries(glucoseByDay).map(([day, values]) => ({
    day,
    average: average(values),
    spread: values.length > 1 ? Math.max(...values) - Math.min(...values) : 0,
  }));

  const doseDays = new Set(recentDoses.map((dose) => format(parseISO(dose.dose_time), 'yyyy-MM-dd')));
  const mealDays = new Set(recentMeals.map((meal) => format(parseISO(meal.meal_time), 'yyyy-MM-dd')));

  return {
    period_days: 7,
    reading_count: recentReadings.length,
    insulin_log_count: recentDoses.length,
    meal_count: recentMeals.length,
    wellness_entry_count: recentWellness.length,
    weekly_average: average(recentValues),
    previous_week_average: average(previousValues),
    highest: recentValues.length ? Math.max(...recentValues) : null,
    lowest: recentValues.length ? Math.min(...recentValues) : null,
    time_in_range: recentReadings.length ? Math.round((inRange / recentReadings.length) * 100) : 0,
    repeated_high_contexts: repeatedHighContexts,
    repeated_low_contexts: repeatedLowContexts,
    meal_patterns: mealPatterns,
    insulin_consistency_days: doseDays.size,
    meal_logging_days: mealDays.size,
    stress_days: recentWellness.filter((entry) => entry.stress_level >= 4).length,
    low_sleep_days: recentWellness.filter((entry) => entry.sleep_quality === 'poor').length,
    mood_distribution: getMoodDistribution(recentWellness),
    symptoms_frequency: recentWellness.reduce<Record<string, number>>((acc, entry) => {
      entry.symptoms.forEach((symptom) => {
        acc[symptom] = (acc[symptom] || 0) + 1;
      });
      return acc;
    }, {}),
    daily_stability: stabilityByDay,
    food_impact: foodImpact,
    recent_glucose_points: recentReadings.slice(-18).map((reading) => ({
      value: reading.value,
      meal_relation: reading.meal_relation,
      status: reading.status,
      hour: getHours(parseISO(reading.reading_time)),
      day_offset: differenceInCalendarDays(now, startOfDay(parseISO(reading.reading_time))),
    })),
    safety_rules: [
      'Never diagnose diseases.',
      'Never replace doctors.',
      'Never prescribe insulin doses.',
      'Never provide dangerous medical instructions.',
      'Stay observational, educational, and supportive only.',
    ],
  };
}
