import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-xs font-mono font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#F59E0B] text-black hover:bg-[#FFAA00] shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-[#F59E0B]",
        destructive:
          "bg-[#FF5500] text-white hover:bg-red-600 shadow-[0_0_15px_rgba(255,85,0,0.4)] border border-[#FF5500]",
        outline:
          "border border-[#282C38] bg-[#14161D] text-white hover:bg-[#1C1F28] hover:border-[#F59E0B]/60",
        secondary:
          "bg-[#1C1F28] text-neutral-200 hover:bg-[#282C38] border border-[#282C38]",
        ghost:
          "text-neutral-300 hover:bg-[#14161D] hover:text-white",
        link:
          "text-[#F59E0B] underline-offset-4 hover:underline",
        mecha:
          "bg-[#14161D] border-2 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]",
        caution:
          "bg-[#84CC16] text-black hover:bg-lime-400 font-bold shadow-[0_0_12px_rgba(132,204,22,0.4)]"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-2.5 text-[11px]",
        lg: "h-11 px-6 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
