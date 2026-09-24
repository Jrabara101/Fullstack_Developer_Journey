import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-mono font-semibold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40 select-none';

    const variantClasses = {
      default:
        'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 shadow-sm',
      primary:
        'bg-primary hover:bg-primary-light text-on-primary shadow-neon-cyan active:shadow-none',
      secondary:
        'bg-secondary hover:bg-secondary-dim text-on-secondary shadow-neon-amber active:shadow-none',
      outline:
        'border border-outline hover:border-primary text-on-surface hover:text-primary bg-transparent',
      ghost:
        'bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface',
      danger:
        'bg-error hover:bg-error-container text-white shadow-neon-crimson active:shadow-none',
    };

    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
