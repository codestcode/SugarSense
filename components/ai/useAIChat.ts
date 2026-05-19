'use client';

import { useState } from 'react';
import { useAIStore } from '@/lib/store/aiStore';

export function useAIChat(summary: Record<string, unknown>) {
  const { chatHistory, addChatMessage, clearChatHistory } = useAIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (question: string) => {
    setIsLoading(true);
    setError(null);
    addChatMessage({ role: 'user', content: question });

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'chat',
          question,
          summary,
          messages: chatHistory.slice(-4).map((message) => ({ role: message.role, content: message.content })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to get AI answer.');
      }

      addChatMessage({ role: 'assistant', content: data.answer });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to get AI answer.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    chatHistory,
    isLoading,
    error,
    clearChatHistory,
    send,
  };
}
