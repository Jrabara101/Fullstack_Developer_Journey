import * as React from "react";
import { cn } from "../../lib/utils.js";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "bottom" | "right";
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, side = "bottom", children }: SheetProps) {
  if (!open) return null;

  const sideStyles = {
    bottom: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t border-slate-700/80 animate-in slide-in-from-bottom duration-300",
    right: "inset-y-0 right-0 w-full sm:max-w-md rounded-l-3xl border-l border-slate-700/80 animate-in slide-in-from-right duration-300"
  }[side];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Drawer Body */}
      <div
        className={cn(
          "fixed z-50 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl",
          sideStyles
        )}
      >
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
