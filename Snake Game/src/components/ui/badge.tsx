import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "gold" | "neon"
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "border-transparent bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30",
    secondary: "border-transparent bg-[#27272a] text-[#e4e1e5]",
    destructive: "border-transparent bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/30",
    outline: "text-[#e4e1e5] border-[#27272a]",
    gold: "border-[#f59e0b]/40 bg-[#f59e0b]/15 text-[#fbbf24] shadow-[0_0_10px_rgba(245,158,11,0.25)]",
    neon: "border-[#4edea3]/50 bg-[#4edea3]/20 text-[#4edea3] shadow-[0_0_10px_rgba(78,222,163,0.3)] animate-pulse"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
