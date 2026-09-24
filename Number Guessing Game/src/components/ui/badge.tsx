import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-surface-container-high text-on-surface-variant border-transparent',
    primary: 'bg-primary/15 text-primary border-primary/30',
    secondary: 'bg-secondary/15 text-secondary border-secondary/30',
    tertiary: 'bg-tertiary/15 text-tertiary border-tertiary/30',
    danger: 'bg-error/15 text-error border-error/30',
    outline: 'border-outline text-on-surface-variant bg-transparent',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-wider border transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
