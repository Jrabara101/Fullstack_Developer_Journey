import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 'lg',
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-void/80 backdrop-blur-md transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full z-10 bg-panel border border-subtle-border rounded-xl shadow-2xl p-6 text-prose-main animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col',
          maxWidths[maxWidth]
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="mb-4 pr-6">
            {title && (
              <h2 className="text-lg font-sans font-bold text-prose-display tracking-tight flex items-center gap-2">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-prose-muted mt-1 font-sans">{description}</p>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-prose-display p-1 rounded-md hover:bg-elevated transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
}
