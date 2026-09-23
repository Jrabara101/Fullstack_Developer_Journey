import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function calculateWpm(correctChars: number, timeInSeconds: number): number {
  if (timeInSeconds <= 0) return 0
  const minutes = timeInSeconds / 60
  // Standard word length = 5 characters
  const words = correctChars / 5
  return Math.max(0, Math.round(words / minutes))
}

export function calculateRawWpm(totalChars: number, timeInSeconds: number): number {
  if (timeInSeconds <= 0) return 0
  const minutes = timeInSeconds / 60
  const words = totalChars / 5
  return Math.max(0, Math.round(words / minutes))
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars === 0) return 100
  return Math.min(100, Math.max(0, Math.round((correctChars / totalChars) * 100)))
}

/**
 * Calculates typing consistency as a percentage (100% = perfectly even rhythm)
 * Uses standard deviation of instantaneous WPM intervals.
 */
export function calculateConsistency(wpmSnapshots: number[]): number {
  if (wpmSnapshots.length < 2) return 100
  const mean = wpmSnapshots.reduce((a, b) => a + b, 0) / wpmSnapshots.length
  if (mean === 0) return 100
  
  const variance = wpmSnapshots.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wpmSnapshots.length
  const stdDev = Math.sqrt(variance)
  const cv = (stdDev / mean) * 100
  
  // Consistency score clamped between 0 and 100%
  return Math.max(0, Math.min(100, Math.round(100 - cv)))
}
