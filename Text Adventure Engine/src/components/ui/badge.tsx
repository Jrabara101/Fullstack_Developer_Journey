import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'amber' | 'cyan' | 'emerald' | 'purple' | 'crimson' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-elevated border-subtle-border text-slate-300',
    amber: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    cyan: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
    emerald: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    purple: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    crimson: 'bg-red-500/15 border-red-500/30 text-red-300',
    outline: 'border-subtle-border text-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
