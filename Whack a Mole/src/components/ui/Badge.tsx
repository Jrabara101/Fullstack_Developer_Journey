import React from 'react';
import { cn } from '../../utils/formatters';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'pink' | 'cyan' | 'gold' | 'hazard' | 'purple';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'pink',
  children,
  ...props
}) => {
  const variantStyles = {
    pink: 'bg-fuchsia-950/90 text-pink-400 border-pink-500 shadow-[0_0_8px_#ec4899]',
    cyan: 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-[0_0_8px_#00f0ff]',
    gold: 'bg-yellow-950/90 text-yellow-300 border-yellow-400 shadow-[0_0_8px_#facc15]',
    hazard: 'bg-red-950/90 text-red-400 border-red-500 shadow-[0_0_8px_#ef4444]',
    purple: 'bg-purple-950/90 text-purple-300 border-purple-500 shadow-[0_0_8px_#7c3aed]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 border text-xs font-["Righteous"] tracking-widest uppercase font-bold select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
