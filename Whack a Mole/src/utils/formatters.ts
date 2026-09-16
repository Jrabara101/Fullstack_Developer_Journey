import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNum(num: number): string {
  return Math.max(0, Math.floor(num)).toLocaleString();
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function calculateAccuracy(hits: number, clicks: number): number {
  if (clicks <= 0) return 0;
  return Math.min(100, Math.round((hits / clicks) * 100));
}

export function calculateRank(score: number): { rank: string; color: string; desc: string } {
  if (score >= 3500) {
    return { rank: 'S-CLASS', color: 'text-cyan-300 text-glow-cyan', desc: 'STREET LEGEND' };
  }
  if (score >= 2200) {
    return { rank: 'A-CLASS', color: 'text-pink-400 text-glow-pink', desc: 'TURBO RACER' };
  }
  if (score >= 1100) {
    return { rank: 'B-CLASS', color: 'text-yellow-300 text-glow-gold', desc: 'NIGHT CRUISER' };
  }
  return { rank: 'C-CLASS', color: 'text-fuchsia-300', desc: 'ROOKIE DRIVER' };
}
