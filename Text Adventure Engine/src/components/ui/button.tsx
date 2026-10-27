import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber' | 'emerald';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium rounded-md transition-all focus:outline-none focus:ring-1 focus:ring-amber-400/50 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-lantern text-void hover:bg-lantern-light font-semibold shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      secondary: 'bg-elevated hover:bg-slate-700/60 text-prose-main border border-subtle-border hover:border-slate-600',
      outline: 'bg-transparent border border-subtle-border hover:bg-elevated text-slate-300 hover:text-prose-display',
      ghost: 'bg-transparent hover:bg-elevated text-slate-300 hover:text-prose-display',
      danger: 'bg-peril/20 border border-peril/40 text-peril-light hover:bg-peril/30',
      amber: 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30',
      emerald: 'bg-parser/20 border border-parser/40 text-parser-light hover:bg-parser/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1 gap-1.5',
      md: 'text-sm px-3.5 py-1.5 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'p-1.5 h-8 w-8',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
