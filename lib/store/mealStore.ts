import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { MealLog, MealState } from '../types';

export const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      meals: [],

      addMeal: (meal) => {
        const newMeal: MealLog = {
          ...meal,
          id: uuidv4(),
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          meals: [...state.meals, newMeal],
        }));
      },

      updateMeal: (id, updates) => {
        set((state) => ({
          meals: state.meals.map((meal) => (meal.id === id ? { ...meal, ...updates } : meal)),
        }));
      },

      deleteMeal: (id) => {
        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        }));
      },

      getMeals: () => get().meals,
    }),
    {
      name: 'meal-store',
      version: 1,
    }
  )
);
