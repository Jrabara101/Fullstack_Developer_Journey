import React from 'react';
import { cn } from '../../lib/utils';
import { sfx } from '../../sounds/sfx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'amber' | 'emerald' | 'violet' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'cyan', size = 'md', onClick, onMouseEnter, children, disabled, ...props }, ref) => {
    const variants = {
      cyan: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]',
      amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      violet: 'bg-purple-500/20 text-purple-300 border border-purple-500/50 hover:bg-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]',
      destructive: 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]',
      outline: 'bg-slate-900/60 text-slate-300 border border-slate-700/80 hover:bg-slate-800/80 hover:text-white hover:border-slate-500',
      ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
    };

    const sizes = {
      sm: 'px-2.5 py-1 text-xs font-medium tracking-wide rounded',
      md: 'px-3.5 py-1.5 text-xs font-semibold tracking-wider rounded-md',
      lg: 'px-5 py-2.5 text-sm font-semibold tracking-wider rounded-lg',
      icon: 'p-2 rounded-md'
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        onMouseEnter={(e) => {
          sfx.playClick();
          onMouseEnter?.(e);
        }}
        onClick={(e) => {
          onClick?.(e);
        }}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer uppercase',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
