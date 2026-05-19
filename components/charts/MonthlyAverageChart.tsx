'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlucoseReading } from '@/lib/types';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

interface MonthlyAverageChartProps {
  readings: GlucoseReading[];
}

export const MonthlyAverageChart: React.FC<MonthlyAverageChartProps> = ({ readings }) => {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => subDays(today, 29 - i));

  const chartData = days.map((day, index) => {
    const dayReadings = readings.filter((r) => {
      const readingDate = parseISO(r.reading_time);
      return isWithinInterval(readingDate, {
        start: startOfDay(day),
        end: endOfDay(day),
      });
    });

    const average = dayReadings.length > 0
      ? Math.round(dayReadings.reduce((sum, r) => sum + r.value, 0) / dayReadings.length)
      : 0;

    return {
      day: format(day, 'd'),
      average: average,
      count: dayReadings.length,
    };
  });

  const hasData = chartData.some(d => d.count > 0);

  if (!hasData) {
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
        <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 300]} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={(value) => [`${value} mg/dL`, 'Average']}
        />
        <Line
          type="monotone"
          dataKey="average"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
