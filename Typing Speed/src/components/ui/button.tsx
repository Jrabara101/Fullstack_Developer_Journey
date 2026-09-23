import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'subtle' | 'accent'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-40 select-none'
    
    const variants = {
      default: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:scale-[0.98]',
      outline: 'border border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 active:scale-[0.98]',
      ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 active:scale-[0.98]',
      subtle: 'bg-zinc-900/80 text-zinc-300 border border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-100 active:scale-[0.98]',
      accent: 'bg-amber-400 text-zinc-950 font-semibold hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] active:scale-[0.98]'
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
      icon: 'h-8 w-8 p-0'
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
