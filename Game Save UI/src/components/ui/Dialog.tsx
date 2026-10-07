import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { sfx } from '../../sounds/sfx';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-2xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          sfx.playClick();
          onClose();
        }}
      />

      {/* Modal Dialog Box */}
      <div
        className={cn(
          'relative w-full bg-[#0D121F]/95 border border-[#1E293B] rounded-xl shadow-2xl p-6 z-10 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100',
          'before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-cyan-500 before:via-purple-500 before:to-cyan-500',
          maxWidth
        )}
      >
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold tracking-wide text-white uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {title}
            </h2>
            {description && (
              <p className="text-xs text-slate-400 mt-1 font-mono">{description}</p>
            )}
          </div>
          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};
