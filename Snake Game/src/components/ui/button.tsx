import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "arcade" | "neon"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4edea3] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none cursor-pointer"
    
    const variants = {
      default: "bg-[#4edea3] text-[#0e0e11] font-semibold hover:bg-[#6ffbbe] shadow-[0_0_15px_rgba(78,222,163,0.3)]",
      destructive: "bg-[#f43f5e] text-white hover:bg-[#fb7185] shadow-[0_0_15px_rgba(244,63,94,0.3)]",
      outline: "border border-[#27272a] bg-transparent hover:bg-[#1f1f22] text-[#e4e1e5] hover:border-[#3f3f46]",
      secondary: "bg-[#1f1f22] text-[#e4e1e5] hover:bg-[#2a2a2e] border border-[#2e2e32]",
      ghost: "hover:bg-[#1f1f22] hover:text-[#e4e1e5] text-[#9ca3af]",
      arcade: "bg-[#18181b] border-2 border-[#4edea3] text-[#4edea3] font-mono uppercase tracking-wider hover:bg-[#4edea3]/10 shadow-[0_0_12px_rgba(78,222,163,0.2)]",
      neon: "bg-gradient-to-r from-[#4edea3] to-[#00a572] text-[#0e0e11] font-bold shadow-[0_0_20px_rgba(78,222,163,0.4)] hover:brightness-110"
    }

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8 text-base font-semibold",
      icon: "h-9 w-9"
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
Button.displayName = "Button"
