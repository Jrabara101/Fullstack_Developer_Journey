import React from 'react';
import { cn } from '../../lib/utils';
import type { SaveType } from '../../types/save';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: SaveType | 'conflict' | 'synced' | 'pending' | 'offline' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  children,
  ...props
}) => {
  const styles: Record<string, string> = {
    manual: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]',
    auto: 'bg-[#818CF8]/15 text-[#818CF8] border-[#818CF8]/40 shadow-[0_0_10px_rgba(129,140,248,0.2)]',
    quicksave: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    milestone: 'bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    synced: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    offline: 'bg-slate-700/30 text-slate-400 border-slate-600/40',
    conflict: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50 animate-pulse',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded border select-none',
        styles[variant] || styles.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
