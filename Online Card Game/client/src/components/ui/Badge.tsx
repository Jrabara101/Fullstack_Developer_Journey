import * as React from "react";
import { cn } from "../../lib/utils.js";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "gold" | "felt" | "glow";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variants = {
    default: "border-transparent bg-blue-600 text-white shadow hover:bg-blue-700",
    secondary: "border-transparent bg-slate-800 text-slate-200 hover:bg-slate-700",
    destructive: "border-transparent bg-red-600 text-white shadow hover:bg-red-700",
    outline: "border-slate-700 text-slate-200",
    gold: "border-amber-400/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-mono",
    felt: "border-emerald-400/30 bg-emerald-950/80 text-emerald-300 font-mono",
    glow: "border-cyan-400/40 bg-cyan-950/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}
