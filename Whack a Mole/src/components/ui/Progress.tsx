import React from 'react';
import { cn } from '../../utils/formatters';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorClassName?: string;
  variant?: 'nitro' | 'timer' | 'cyan';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  variant = 'nitro',
  className,
  indicatorClassName,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const variantStyles = {
    nitro: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-pink-500 shadow-[0_0_8px_#facc15]',
    timer: 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]',
    cyan: 'bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_#00f0ff]',
  };

  return (
    <div
      className={cn('w-full h-2 bg-black/80 border border-fuchsia-950/80 overflow-hidden relative', className)}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all duration-200 ease-out',
          variantStyles[variant],
          indicatorClassName
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
