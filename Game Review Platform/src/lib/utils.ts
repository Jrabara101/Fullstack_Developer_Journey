import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ShelfStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatShelfStatus(status: ShelfStatus): { label: string; color: string; bg: string; border: string } {
  switch (status) {
    case 'MASTERED_100':
      return {
        label: '100% Mastered',
        color: 'text-purple-400',
        bg: 'bg-purple-950/40',
        border: 'border-purple-500/40',
      };
    case 'BEATEN':
      return {
        label: 'Main Story Beaten',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/40',
      };
    case 'PLAYING':
      return {
        label: 'Currently Playing',
        color: 'text-blue-400',
        bg: 'bg-blue-950/40',
        border: 'border-blue-500/40',
      };
    case 'DROPPED':
      return {
        label: 'Dropped / Shelved',
        color: 'text-rose-400',
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/40',
      };
    case 'BACKLOG':
      return {
        label: 'In Backlog',
        color: 'text-amber-400',
        bg: 'bg-amber-950/40',
        border: 'border-amber-500/40',
      };
    case 'WISHLIST':
      return {
        label: 'Wishlisted',
        color: 'text-pink-400',
        bg: 'bg-pink-950/40',
        border: 'border-pink-500/40',
      };
    default:
      return {
        label: 'Unshelved',
        color: 'text-slate-400',
        bg: 'bg-slate-900',
        border: 'border-slate-800',
      };
  }
}

export function renderStars(rating: number): string {
  return `${rating.toFixed(1)} ★`;
}
