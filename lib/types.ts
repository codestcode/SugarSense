// Glucose Reading Type
export type GlucoseStatus = 'low' | 'normal' | 'high';
export type MealRelation = 'before_breakfast' | 'after_breakfast' | 'before_lunch' | 'after_lunch' | 'before_dinner' | 'after_dinner' | 'before_sleep' | 'random';

export interface GlucoseReading {
  id: string;
  value: number;
  meal_relation: MealRelation;
  notes: string;
  reading_time: string; // ISO string
  status: GlucoseStatus;
  created_at: string; // ISO string
}

// Insulin Dose Type
export type InsulinType = 'rapid_acting' | 'long_acting' | 'mixed';
export type InsulinContext =
  | 'before_breakfast'
  | 'after_breakfast'
  | 'before_lunch'
  | 'after_lunch'
  | 'before_dinner'
  | 'after_dinner'
  | 'before_sleep'
  | 'random'
  | 'extra_correction';

export interface InsulinDose {
  id: string;
  insulin_type: InsulinType;
  dose_context?: InsulinContext;
  units: number;
  notes: string;
  dose_time: string; // ISO string
  created_at: string; // ISO string
}

// Meal Tracking
export type MealTag = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'late_night';

export interface MealLog {
  id: string;
  title: string;
  description: string;
  tag: MealTag;
  carbs_estimate?: number;
  meal_time: string; // ISO string
  created_at: string; // ISO string
}

// Wellness Tracking
export type MoodLevel = 'low' | 'neutral' | 'good' | 'stressed' | 'calm';
export type SleepQuality = 'poor' | 'fair' | 'good';

export interface WellnessEntry {
  id: string;
  mood: MoodLevel;
  stress_level: number; // 1-5
  sleep_quality: SleepQuality;
  symptoms: string[];
  notes: string;
  recorded_at: string; // ISO string
  created_at: string; // ISO string
}

// AI Support
export type AIInsightFeature =
  | 'pattern_detection'
  | 'food_impact'
  | 'predictive_alerts'
  | 'mood_correlation';

export interface AIInsightRecord {
  id: string;
  feature: AIInsightFeature;
  content: string;
  summary: string;
  created_at: string;
}

export type AIChatRole = 'user' | 'assistant';

export interface AIChatMessage {
  id: string;
  role: AIChatRole;
  content: string;
  created_at: string;
}

// Settings Type
export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  language: Language;
  theme: Theme;
  targetRangeLow: number;
  targetRangeHigh: number;
}

// Store State Types
export interface GlucoseState {
  readings: GlucoseReading[];
  addReading: (reading: Omit<GlucoseReading, 'id' | 'created_at'>) => void;
  updateReading: (id: string, reading: Partial<GlucoseReading>) => void;
  deleteReading: (id: string) => void;
  getReadings: () => GlucoseReading[];
  getTodayReadings: () => GlucoseReading[];
  getReadingsByDateRange: (startDate: Date, endDate: Date) => GlucoseReading[];
  getLatestReading: () => GlucoseReading | undefined;
  getTodayAverage: () => number;
  getWeeklyAverage: () => number;
  getMonthlyAverage: () => number;
}

export interface InsulinState {
  doses: InsulinDose[];
  addDose: (dose: Omit<InsulinDose, 'id' | 'created_at'>) => void;
  updateDose: (id: string, dose: Partial<InsulinDose>) => void;
  deleteDose: (id: string) => void;
  getDoses: () => InsulinDose[];
  getTodayDoses: () => InsulinDose[];
  getDosesByDateRange: (startDate: Date, endDate: Date) => InsulinDose[];
  getTotalTodayUnits: () => number;
}

export interface MealState {
  meals: MealLog[];
  addMeal: (meal: Omit<MealLog, 'id' | 'created_at'>) => void;
  updateMeal: (id: string, meal: Partial<MealLog>) => void;
  deleteMeal: (id: string) => void;
  getMeals: () => MealLog[];
}

export interface WellnessState {
  entries: WellnessEntry[];
  addEntry: (entry: Omit<WellnessEntry, 'id' | 'created_at'>) => void;
  updateEntry: (id: string, entry: Partial<WellnessEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntries: () => WellnessEntry[];
}

export interface AIState {
  insightHistory: AIInsightRecord[];
  chatHistory: AIChatMessage[];
  addInsightRecord: (record: Omit<AIInsightRecord, 'id' | 'created_at'>) => void;
  addChatMessage: (message: Omit<AIChatMessage, 'id' | 'created_at'>) => void;
  clearChatHistory: () => void;
}

export interface SettingsState {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  getSettings: () => AppSettings;
}

// Meal Scan Types
export interface ScannedFoodItem {
  name: string;
  portion_description: string;
  estimated_grams: number;
  confidence: number;
}

export interface FoodNutrition {
  carbs_per_100g: number;
  carbs_total: number;
  source: string;
}

export interface ScannedFoodWithNutrition extends ScannedFoodItem {
  nutrition?: FoodNutrition;
}

export interface SugarImpact {
  level: 'minimal' | 'moderate' | 'significant' | 'high';
  description: string;
  total_carbs: number;
  food_count: number;
}

export interface MealScanResult {
  foods: ScannedFoodWithNutrition[];
  meal_summary: string;
  overall_confidence: number;
  notes: string[];
  image_hash?: string;
  scanned_at: string;
  total_carbs?: number;
  sugar_impact?: SugarImpact;
}

export interface MealScanRecord {
  id: string;
  result: MealScanResult;
  image_hash: string;
  created_at: string;
}

export interface ScanState {
  recentScans: MealScanRecord[];
  cache: Record<string, MealScanResult>;
  addScan: (record: MealScanRecord) => void;
  getCached: (hash: string) => MealScanResult | undefined;
  clearCache: () => void;
}
