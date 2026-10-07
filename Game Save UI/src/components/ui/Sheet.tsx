import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { sfx } from '../../sounds/sfx';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          sfx.playClick();
          onClose();
        }}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            'w-screen max-w-[460px] bg-[#0D121F] border-l border-slate-800 shadow-2xl p-6 flex flex-col',
            'animate-in slide-in-from-right duration-300 text-slate-100 z-10 relative overflow-y-auto'
          )}
        >
          {/* Top Edge Neon Conduit */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800/80 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  {title}
                </h3>
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 font-mono mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={() => {
                sfx.playClick();
                onClose();
              }}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto pr-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
