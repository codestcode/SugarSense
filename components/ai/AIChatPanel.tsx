'use client';

import React, { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { AIChatMessage } from '@/lib/types';
import { AIResponseContent } from '@/components/ai/AIResponseContent';

interface AIChatPanelProps {
  messages: AIChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSend: (question: string) => Promise<void>;
  onClear: () => void;
  compact?: boolean;
}

const starterQuestions = [
  'Why is my sugar usually high at night?',
  'Did my glucose improve this week?',
  'What patterns do you notice?',
  'When are my readings most stable?',
];

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ messages, isLoading, error, onSend, onClear, compact = false }) => {
  const [question, setQuestion] = useState('');
  const sectionClassName = compact
    ? 'glass3d flex h-[min(78vh,42rem)] flex-col overflow-hidden rounded-[24px] border border-sky-200 bg-white dark:border-sky-500/20 dark:bg-zinc-900'
    : 'glass3d rounded-[28px] border border-sky-200 bg-white dark:border-sky-500/20 dark:bg-zinc-900';

  const submit = async (value: string) => {
    if (!value.trim() || isLoading) return;
    await onSend(value.trim());
    setQuestion('');
  };

  return (
    <section className={sectionClassName}>
      <div className={`${compact ? 'p-4' : 'p-5'} border-b border-sky-100 bg-[linear-gradient(135deg,#eff6ff,#f0fdf4)] dark:border-sky-500/20 dark:bg-[linear-gradient(135deg,rgba(12,74,110,0.22),rgba(20,83,45,0.18))]`}>
        <div className={`flex gap-3 ${compact ? 'flex-col items-start' : 'items-center justify-between'}`}>
          <div>
            <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-gray-950 dark:text-white`}>AI Chat Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Educational answers based on your tracked patterns.</p>
          </div>
          <button onClick={onClear} className={`inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5 ${compact ? 'self-stretch justify-center sm:self-auto' : ''}`}>
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      <div className={`${compact ? 'flex min-h-0 flex-1 flex-col p-4' : 'space-y-4 p-5'}`}>
        <div className={`${compact ? 'min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 touch-pan-y' : 'space-y-4'}`}>
        <div className="flex flex-wrap gap-2">
          {starterQuestions.map((item) => (
            <button key={item} onClick={() => submit(item)} className={`rounded-full bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800 transition-colors hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-100 dark:hover:bg-sky-500/20 ${compact ? 'max-w-full text-left whitespace-normal' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        <div className={`${compact ? '' : 'max-h-[420px] overflow-y-auto'} space-y-3 rounded-3xl bg-gray-50 p-4 dark:bg-white/5`}>
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Ask about trends, stability, timing, or consistency.</p>
          ) : null}
          {messages.map((message) => (
            <div key={message.id} className={message.role === 'user' ? 'ml-auto max-w-[92%] rounded-[24px] bg-sky-600 px-4 py-3 text-sm text-white' : 'max-w-[96%] rounded-[24px] border border-slate-200/80 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:text-gray-100'}>
              {message.role === 'user' ? (
                <p className="leading-6">{message.content}</p>
              ) : (
                <AIResponseContent content={message.content} compact={compact} />
              )}
            </div>
          ))}
          {isLoading ? <p className="text-sm text-gray-500 dark:text-gray-400">Thinking...</p> : null}
        </div>
        </div>

        {error ? <p className={`rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200 ${compact ? 'shrink-0' : ''}`}>{error}</p> : null}

        <div className={`flex gap-3 ${compact ? 'shrink-0 flex-col' : ''}`}>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={2}
            placeholder="Ask about your glucose trends..."
            className="min-h-[56px] flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <button onClick={() => submit(question)} disabled={isLoading || !question.trim()} className={`inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 ${compact ? 'h-12 w-full' : ''}`}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};
