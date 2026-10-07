import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: 'cyan' | 'amber' | 'emerald' | 'violet' | 'coral';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  color = 'cyan',
  className,
  ...props
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  const colorStyles = {
    cyan: 'bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]',
    amber: 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]',
    emerald: 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]',
    violet: 'bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.7)]',
    coral: 'bg-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
  };

  return (
    <div
      className={cn('h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50', className)}
      {...props}
    >
      <div
        className={cn('h-full transition-all duration-300 ease-out rounded-full', colorStyles[color])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
