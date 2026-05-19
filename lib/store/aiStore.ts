import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AIChatMessage, AIInsightRecord, AIState } from '../types';

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      insightHistory: [],
      chatHistory: [],

      addInsightRecord: (record) => {
        const newRecord: AIInsightRecord = {
          ...record,
          id: uuidv4(),
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          insightHistory: [newRecord, ...state.insightHistory].slice(0, 40),
        }));
      },

      addChatMessage: (message) => {
        const newMessage: AIChatMessage = {
          ...message,
          id: uuidv4(),
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          chatHistory: [...state.chatHistory, newMessage].slice(-60),
        }));
      },

      clearChatHistory: () => {
        set({ chatHistory: [] });
      },
    }),
    {
      name: 'ai-store',
      version: 1,
    }
  )
);
