import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[#F59E0B]/60 bg-[#F59E0B]/15 text-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.2)]",
        secondary:
          "border-[#282C38] bg-[#14161D] text-neutral-300",
        destructive:
          "border-[#FF5500]/60 bg-[#FF5500]/20 text-[#FF5500] shadow-[0_0_8px_rgba(255,85,0,0.2)]",
        outline: "text-foreground border-[#282C38]",
        caution:
          "border-[#84CC16]/60 bg-[#84CC16]/15 text-[#84CC16] shadow-[0_0_8px_rgba(132,204,22,0.2)]",
        ghost:
          "border-purple-500/60 bg-purple-950/60 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
