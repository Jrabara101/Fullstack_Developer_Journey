import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'accent' | 'muted' | 'success' | 'danger'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium transition-colors'

  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border border-zinc-700/50',
    outline: 'border border-zinc-700 text-zinc-400 bg-transparent',
    accent: 'bg-amber-400/10 text-amber-400 border border-amber-400/30',
    muted: 'bg-zinc-900/60 text-zinc-500 border border-zinc-800/40',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}
