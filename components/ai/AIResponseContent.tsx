'use client';

import React from 'react';

function isListLine(line: string) {
  return /^(\-|\*|•|\d+\.)\s+/.test(line.trim());
}

function cleanListLine(line: string) {
  return line.trim().replace(/^(\-|\*|•|\d+\.)\s+/, '');
}

function renderInlineLabel(text: string) {
  const parts = text.split(/:\s(.+)/);
  if (parts.length >= 3) {
    return (
      <>
        <span className="font-semibold text-gray-900 dark:text-white">{parts[0]}:</span>{' '}
        <span>{parts[1]}</span>
      </>
    );
  }

  return text;
}

export const AIResponseContent: React.FC<{ content: string; compact?: boolean }> = ({ content, compact = false }) => {
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      {blocks.map((block, index) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);

        if (lines.length > 0 && lines.every(isListLine)) {
          return (
            <ul key={index} className="space-y-2">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex gap-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <span>{renderInlineLabel(cleanListLine(line))}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (lines.length === 1) {
          return (
            <p key={index} className="text-sm leading-6 text-gray-700 dark:text-gray-200">
              {renderInlineLabel(lines[0])}
            </p>
          );
        }

        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lineIndex) => (
              <p key={lineIndex} className="text-sm leading-6 text-gray-700 dark:text-gray-200">
                {renderInlineLabel(line)}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
};
