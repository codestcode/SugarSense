'use client';

import React, { useState } from 'react';
import { Bot, MessageCircleMore, X } from 'lucide-react';
import { AIChatPanel } from '@/components/ai/AIChatPanel';

interface FloatingAIChatProps {
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>;
  isLoading: boolean;
  error: string | null;
  onSend: (question: string) => Promise<void>;
  onClear: () => void;
}

export const FloatingAIChat: React.FC<FloatingAIChatProps> = ({
  messages,
  isLoading,
  error,
  onSend,
  onClear,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed inset-x-4 bottom-24 z-50 mx-auto w-auto max-w-sm sm:right-4 sm:left-auto sm:mx-0 sm:w-[22rem]">
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-lg dark:bg-white dark:text-slate-950"
            >
              <X size={14} />
              Close
            </button>
          </div>
          <AIChatPanel
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSend={onSend}
            onClear={onClear}
            compact
          />
        </div>
      ) : null}

      <button
        onClick={() => setOpen(true)}
        className="glass3d fixed bottom-24 right-4 z-50 inline-flex items-center gap-3 rounded-full border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 dark:border-sky-500/20 dark:bg-zinc-900 dark:text-white"
      >
        <div className="rounded-full bg-sky-600 p-2 text-white">
          {messages.length > 0 ? <Bot size={18} /> : <MessageCircleMore size={18} />}
        </div>
        <div className="text-left">
          <p>Ask AI</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Trends, meals, stability</p>
        </div>
      </button>
    </>
  );
};
