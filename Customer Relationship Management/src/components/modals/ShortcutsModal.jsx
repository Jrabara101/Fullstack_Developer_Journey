// ============================================================================
// Keyboard Shortcuts Cheat Sheet Modal (?)
// High-velocity Linear & Attio keyboard commands
// ============================================================================

import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export default function ShortcutsModal() {
  const { isShortcutsModalOpen, setIsShortcutsModalOpen } = useCRM();

  if (!isShortcutsModalOpen) return null;

  const shortcutGroups = [
    {
      title: 'Navigation & Views',
      items: [
        { key: '⌘ K', desc: 'Open Command Palette' },
        { key: 'V', desc: 'Switch to Kanban Board' },
        { key: 'R', desc: 'Toggle Rotting Deals Sentinel' },
        { key: 'T', desc: 'Toggle Dark / Light Theme' },
        { key: '?', desc: 'Show Keyboard Shortcuts' },
      ]
    },
    {
      title: 'Actions & Creation',
      items: [
        { key: 'C', desc: 'Create New Deal (with Auto-Enrichment)' },
        { key: 'E', desc: 'Dispatch Quick Check-in (Reconnect Queue)' },
        { key: 'S', desc: 'Snooze Contact 14 Days' },
        { key: 'Enter', desc: 'Edit Grid Cell / Submit Form' },
        { key: 'Esc', desc: 'Close Modal / Cancel Drawer' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark shadow-2xl p-6 space-y-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Keyboard Velocity Shortcuts
            </h3>
          </div>

          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-hairline-light/60 dark:border-hairline-dark/60">
                {group.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {item.desc}
                    </span>
                    <kbd className="px-2 py-0.5 font-mono text-[11px] font-semibold bg-surface-elevated-light dark:bg-surface-elevated-dark border border-hairline-light dark:border-hairline-dark rounded shadow-2xs text-slate-800 dark:text-slate-200">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 text-center pt-1">
          Designed for high-velocity reps. Never touch the mouse.
        </p>
      </div>
    </div>
  );
}
