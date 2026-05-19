'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlucoseReading } from '@/lib/types';
import { format, isToday, parseISO } from 'date-fns';

interface GlucoseTrendChartProps {
  readings: GlucoseReading[];
  targetLow?: number;
  targetHigh?: number;
}

export const GlucoseTrendChart: React.FC<GlucoseTrendChartProps> = ({
  readings,
  targetLow = 70,
  targetHigh = 180,
}) => {
  // Group readings by time
  const chartData = readings
    .filter(r => isToday(parseISO(r.reading_time)))
    .sort((a, b) => new Date(a.reading_time).getTime() - new Date(b.reading_time).getTime())
    .map((r) => ({
      time: format(parseISO(r.reading_time), 'HH:mm'),
      glucose: r.value,
      fullTime: r.reading_time,
    }));

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 400]} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={(value) => [`${value} mg/dL`, 'Glucose']}
        />
        <Line
          type="monotone"
          dataKey="glucose"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />
        {/* Target range area */}
        <line
          x1="0"
          y1={`${((targetLow / 400) * 100).toFixed(0)}%`}
          x2="100%"
          y2={`${((targetLow / 400) * 100).toFixed(0)}%`}
          stroke="#10b981"
          strokeDasharray="5 5"
          opacity={0.5}
        />
        <line
          x1="0"
          y1={`${((targetHigh / 400) * 100).toFixed(0)}%`}
          x2="100%"
          y2={`${((targetHigh / 400) * 100).toFixed(0)}%`}
          stroke="#ef4444"
          strokeDasharray="5 5"
          opacity={0.5}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
