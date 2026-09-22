import React from 'react';
import { GameSettings } from '../game/types';
import { X, Sliders, Volume2, Sparkles, Monitor, Activity, Compass } from 'lucide-react';
import { cn } from '../lib/utils';

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
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel-glow rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-base text-white">Arena Configurations</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configurations List */}
        <div className="space-y-3.5 text-xs font-mono">
          {/* 1. WebAudio Synth SFX Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="font-bold text-white">Procedural Synth Audio</p>
                <p className="text-[10px] text-slate-400 font-sans">Ascending chromatic combo pitch</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={cn(
                "w-11 h-6 rounded-full relative p-1 transition-colors",
                settings.soundEnabled ? "bg-cyan-600" : "bg-slate-700"
              )}
            >
              <div 
                className={cn(
                  "w-4 h-4 bg-white rounded-full transition-transform",
                  settings.soundEnabled ? "translate-x-5" : "translate-x-0"
                )} 
              />
            </button>
          </div>

          {/* 2. Reduced Motion / Screen Shake Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-bold text-white">Reduced Motion</p>
                <p className="text-[10px] text-slate-400 font-sans">Disable screen shake & heavy trails</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={cn(
                "w-11 h-6 rounded-full relative p-1 transition-colors",
                settings.reducedMotion ? "bg-cyan-600" : "bg-slate-700"
              )}
            >
              <div 
                className={cn(
                  "w-4 h-4 bg-white rounded-full transition-transform",
                  settings.reducedMotion ? "translate-x-5" : "translate-x-0"
                )} 
              />
            </button>
          </div>

          {/* 3. CRT Scanline Overlay */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-fuchsia-400" />
              <div>
                <p className="font-bold text-white">CRT Arcade Overlay</p>
                <p className="text-[10px] text-slate-400 font-sans">Retro scanline beam & phosphor grid</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ crtOverlay: !settings.crtOverlay })}
              className={cn(
                "w-11 h-6 rounded-full relative p-1 transition-colors",
                settings.crtOverlay ? "bg-cyan-600" : "bg-slate-700"
              )}
            >
              <div 
                className={cn(
                  "w-4 h-4 bg-white rounded-full transition-transform",
                  settings.crtOverlay ? "translate-x-5" : "translate-x-0"
                )} 
              />
            </button>
          </div>

          {/* 4. Anti-Rage Homing Assist ("Final Brick" Anti-Pattern) */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <div>
                <p className="font-bold text-white">Target Nudge Assist</p>
                <p className="text-[10px] text-slate-400 font-sans">Subtle homing bias after 8 non-hits</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ homingAssistEnabled: !settings.homingAssistEnabled })}
              className={cn(
                "w-11 h-6 rounded-full relative p-1 transition-colors",
                settings.homingAssistEnabled ? "bg-cyan-600" : "bg-slate-700"
              )}
            >
              <div 
                className={cn(
                  "w-4 h-4 bg-white rounded-full transition-transform",
                  settings.homingAssistEnabled ? "translate-x-5" : "translate-x-0"
                )} 
              />
            </button>
          </div>

          {/* 5. Ball Velocity Profile */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Kinetic Velocity
              </span>
              <span className="text-cyan-400 font-bold">
                {settings.ballSpeedMultiplier === 0.85 ? 'CASUAL' : (settings.ballSpeedMultiplier === 1.2 ? 'HYPER' : 'STANDARD')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '0.85x', val: 0.85 },
                { label: '1.0x', val: 1.0 },
                { label: '1.2x', val: 1.2 },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => onUpdateSettings({ ballSpeedMultiplier: opt.val })}
                  className={cn(
                    "py-1.5 rounded-lg border text-center font-bold transition-all",
                    settings.ballSpeedMultiplier === opt.val
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <button 
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
        >
          CONFIRM CONFIGURATIONS
        </button>
      </div>
    </div>
  );
};
