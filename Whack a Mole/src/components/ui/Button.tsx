import React from 'react';
import { cn } from '../../utils/formatters';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neon-pink' | 'neon-cyan' | 'neon-gold' | 'neon-hazard' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'neon-pink', size = 'md', active = false, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-["Righteous"] tracking-wider uppercase transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-95 cursor-pointer';

    const sizeStyles = {
      sm: 'px-2.5 py-1 text-xs gap-1.5',
      md: 'px-4 py-1.5 text-xs sm:text-sm gap-2',
      lg: 'px-6 py-2.5 text-sm sm:text-base gap-2.5',
    };

    const variantStyles = {
      'neon-pink':
        'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border border-pink-300 shadow-[0_0_15px_rgba(244,63,94,0.6)] hover:shadow-[0_0_20px_rgba(244,63,94,0.85)]',
      'neon-cyan':
        'bg-purple-950/80 hover:bg-purple-900 text-cyan-300 hover:text-white border border-cyan-500/70 shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_16px_rgba(0,240,255,0.6)]',
      'neon-gold':
        'bg-yellow-950/70 hover:bg-yellow-900 text-yellow-300 hover:text-white border border-yellow-400/80 shadow-[0_0_12px_rgba(250,204,21,0.5)]',
      'neon-hazard':
        'bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.5)]',
      outline:
        'bg-black/60 hover:bg-fuchsia-950/60 text-fuchsia-300 hover:text-white border border-fuchsia-700/80 shadow-[0_0_8px_rgba(236,72,153,0.3)]',
      ghost:
        'bg-transparent hover:bg-white/10 text-cyan-200 hover:text-white border border-transparent',
    };

    const activeStyles = active
      ? 'bg-pink-600 text-white border-pink-300 shadow-[0_0_12px_#ec4899]'
      : '';

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], activeStyles, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
