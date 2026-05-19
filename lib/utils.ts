import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { GlucoseReading } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGlucoseStatusColor(status: string): string {
  switch (status) {
    case 'low':
      return 'bg-red-50 border-red-200 text-red-900 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-100'
    case 'high':
      return 'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-100'
    case 'normal':
    default:
      return 'bg-green-50 border-green-200 text-green-900 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-100'
  }
}

export function getGlucoseStatusBgColor(status: string): string {
  switch (status) {
    case 'low':
      return 'bg-red-500'
    case 'high':
      return 'bg-orange-500'
    case 'normal':
    default:
      return 'bg-green-500'
  }
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(time: string | Date): string {
  const d = typeof time === 'string' ? new Date(time) : time
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateTime(dateTime: string | Date): string {
  const d = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function exportToJSON(data: any, filename: string) {
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(data: any[], filename: string, headers: string[]) {
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function calculateTimeInRange(readings: GlucoseReading[], lowTarget: number, highTarget: number): number {
  if (readings.length === 0) return 0
  const inRangeCount = readings.filter((r) => r.value >= lowTarget && r.value <= highTarget).length
  return Math.round((inRangeCount / readings.length) * 100)
}

export function getWeekDayName(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function getMonthName(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short' })
}
