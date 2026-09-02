import React from 'react';
import { Crosshair, Eye, Gauge, RotateCcw, Volume2, X } from 'lucide-react';
import {
  CrosshairStyle,
  DEFAULT_SETTINGS,
  GameSettings,
  SETTINGS_LIMITS,
} from '../game/settings';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  onClose: () => void;
}

const CROSSHAIR_STYLES: { id: CrosshairStyle; label: string }[] = [
  { id: 'CROSS', label: 'Cross' },
  { id: 'DOT', label: 'Dot' },
  { id: 'CROSS_DOT', label: 'Cross + Dot' },
];

const CROSSHAIR_COLORS = ['#7ddf64', '#ffffff', '#22d3ee', '#f59e0b', '#ec4899'];

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, display, onChange }) => (
  <label className="block">
    <div className="mb-1.5 flex items-baseline justify-between">
      <span className="text-[11px] uppercase tracking-wider text-slate-400">{label}</span>
      <span className="font-mono text-[11px] font-bold tabular-nums text-amber-400">{display}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-amber-500"
    />
  </label>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, onClose }) => {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4 font-mono backdrop-blur-md">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-400">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-widest text-slate-100">Settings</h2>
              <p className="text-[11px] text-slate-500">Saved automatically to this browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-100"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2">
          {/* Aim */}
          <section className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-400">
              <Crosshair className="h-3.5 w-3.5" /> Aim
            </h3>

            <Slider
              label="Mouse sensitivity"
              value={settings.sensitivity}
              min={SETTINGS_LIMITS.sensitivity.min}
              max={SETTINGS_LIMITS.sensitivity.max}
              step={SETTINGS_LIMITS.sensitivity.step}
              display={(settings.sensitivity * 1000).toFixed(2)}
              onChange={(v) => onChange({ sensitivity: v })}
            />

            <Slider
              label="Field of view"
              value={settings.fov}
              min={SETTINGS_LIMITS.fov.min}
              max={SETTINGS_LIMITS.fov.max}
              step={SETTINGS_LIMITS.fov.step}
              display={`${settings.fov}°`}
              onChange={(v) => onChange({ fov: v })}
            />

            <button
              onClick={() => onChange({ invertY: !settings.invertY })}
              className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                settings.invertY
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider">Invert vertical look</span>
              <span className="text-[10px] font-bold">{settings.invertY ? 'ON' : 'OFF'}</span>
            </button>
          </section>

          {/* Audio */}
          <section className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              <Volume2 className="h-3.5 w-3.5" /> Audio
            </h3>

            <Slider
              label="Master volume"
              value={settings.masterVolume}
              min={0}
              max={1}
              step={0.05}
              display={`${Math.round(settings.masterVolume * 100)}%`}
              onChange={(v) => onChange({ masterVolume: v })}
            />

            <Slider
              label="Effects volume"
              value={settings.sfxVolume}
              min={0}
              max={1}
              step={0.05}
              display={`${Math.round(settings.sfxVolume * 100)}%`}
              onChange={(v) => onChange({ sfxVolume: v })}
            />

            <button
              onClick={() => onChange({ showFps: !settings.showFps })}
              className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                settings.showFps
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
                <Eye className="h-3.5 w-3.5" /> Show FPS counter
              </span>
              <span className="text-[10px] font-bold">{settings.showFps ? 'ON' : 'OFF'}</span>
            </button>
          </section>

          {/* Crosshair */}
          <section className="flex flex-col gap-4 sm:col-span-2">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-rose-400">
              <Crosshair className="h-3.5 w-3.5" /> Crosshair
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {CROSSHAIR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onChange({ crosshairStyle: style.id })}
                  className={`rounded-lg border p-3 text-[11px] uppercase tracking-wider transition-colors ${
                    settings.crosshairStyle === style.id
                      ? 'border-amber-500/50 bg-amber-500/10 font-bold text-amber-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Color</span>
              <div className="flex gap-2">
                {CROSSHAIR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChange({ crosshairColor: color })}
                    style={{ backgroundColor: color }}
                    aria-label={`Crosshair color ${color}`}
                    className={`h-7 w-7 rounded-md border-2 transition-transform hover:scale-110 ${
                      settings.crosshairColor === color ? 'border-slate-100' : 'border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-5">
          <button
            onClick={() => onChange({ ...DEFAULT_SETTINGS })}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-300 transition-colors hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-amber-500 px-6 py-2 text-[11px] font-black uppercase tracking-widest text-slate-950 transition-colors hover:bg-amber-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
