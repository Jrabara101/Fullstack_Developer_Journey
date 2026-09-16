import React from 'react';
import { GameSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-surface-container p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col border border-outline-variant/30">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">tune</span>
            <div>
              <h2 id="settings-title" className="font-headline text-xl font-bold text-on-surface">
                Engine Settings
              </h2>
              <span className="font-mono text-[11px] text-outline">
                Accessibility & Audio Preferences
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-outline hover:text-on-surface transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Setting Items */}
        <div className="py-4 space-y-5">
          {/* Audio Synthesizer */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-headline text-sm font-semibold text-on-surface">
                Synthesizer Audio
              </div>
              <div className="text-[11px] text-outline">
                Real-time Web Audio API feedback for flips and matches
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
                settings.soundEnabled
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-lowest border-outline-variant/40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-surface transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          {settings.soundEnabled && (
            <div className="space-y-1.5 pl-2 border-l-2 border-primary/30">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-outline">Master Gain</span>
                <span className="text-primary font-bold">
                  {Math.round(settings.soundVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={e => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-surface-container-lowest rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Reduced Motion (Accessibility) */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-headline text-sm font-semibold text-on-surface flex items-center gap-1.5">
                <span>Reduced Motion</span>
                <span className="font-mono text-[9px] px-1 rounded bg-surface-container-high text-secondary">
                  A11y
                </span>
              </div>
              <div className="text-[11px] text-outline">
                Replaces 3D rotational flip with smooth cross-fade opacity
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
                settings.reducedMotion
                  ? 'bg-secondary border-secondary'
                  : 'bg-surface-container-lowest border-outline-variant/40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-surface transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Glimpse Priming Phase */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-headline text-sm font-semibold text-on-surface">
                Glimpse Priming (2s)
              </div>
              <div className="text-[11px] text-outline">
                Brief initial reveal at round start to anchor working memory
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ glimpseEnabled: !settings.glimpseEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
                settings.glimpseEnabled
                  ? 'bg-primary border-primary'
                  : 'bg-surface-container-lowest border-outline-variant/40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-surface transition-transform ${
                  settings.glimpseEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-headline font-bold transition-all shadow-[0_2px_0_#494bd6]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
