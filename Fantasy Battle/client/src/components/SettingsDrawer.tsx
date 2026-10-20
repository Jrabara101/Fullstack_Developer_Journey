import React from 'react';
import { X, Volume2, ShieldCheck, Crosshair, Sparkles } from 'lucide-react';
import { soundManager } from '../game/audio';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cameraShake: number;
  onCameraShakeChange: (val: number) => void;
  isAimAssisting: boolean;
  onToggleAimAssist: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  cameraShake,
  onCameraShakeChange,
  isAimAssisting,
  onToggleAimAssist,
}) => {
  if (!isOpen) return null;

  const [masterVol, setMasterVol] = React.useState(Math.round(soundManager.getMasterVolume() * 100));
  const [sfxVol, setSfxVol] = React.useState(Math.round(soundManager.getSfxVolume() * 100));

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    soundManager.setMasterVolume(val / 100);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    soundManager.setSfxVolume(val / 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full bg-[#0D111A] border-l border-amber-500/30 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-cinzel text-lg font-bold text-white tracking-wider">
                Arena Battle Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audio Controls */}
          <div className="mt-6 flex flex-col gap-5">
            <h3 className="font-cinzel text-xs font-bold tracking-widest text-amber-400/90 uppercase">
              Audio Synthesis & Levels
            </h3>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-400" /> Master Volume
                </span>
                <span>{masterVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVol}
                onChange={(e) => handleMasterChange(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" /> Combat SFX Volume
                </span>
                <span>{sfxVol}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVol}
                onChange={(e) => handleSfxChange(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Gameplay Juice & Camera */}
          <div className="mt-8 flex flex-col gap-5">
            <h3 className="font-cinzel text-xs font-bold tracking-widest text-amber-400/90 uppercase">
              Sensory Combat Juice
            </h3>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Camera Impact Shake
                </span>
                <span>{Math.round(cameraShake * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(cameraShake * 100)}
                onChange={(e) => onCameraShakeChange(Number(e.target.value) / 100)}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Auto Aim Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-medium text-white">Target Lock Assistance</div>
                  <div className="text-[10px] text-slate-400">Assists cursor aim towards nearest enemy</div>
                </div>
              </div>
              <button
                onClick={onToggleAimAssist}
                className={`w-11 h-6 rounded-full transition-colors p-1 ${
                  isAimAssisting ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isAimAssisting ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Keybinding Reference Matrix */}
          <div className="mt-8">
            <h3 className="font-cinzel text-xs font-bold tracking-widest text-amber-400/90 uppercase mb-3">
              Gladiator Control Matrix
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Move:</span>
                <span className="text-amber-300 font-bold">[W][A][S][D]</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Slash:</span>
                <span className="text-amber-300 font-bold">[LMB]</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Parry (150ms):</span>
                <span className="text-cyan-300 font-bold">[RMB]</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Dodge (I-Frames):</span>
                <span className="text-emerald-300 font-bold">[SPACE]</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Frost Nova:</span>
                <span className="text-sky-300 font-bold">[Q]</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Flame Sweep:</span>
                <span className="text-orange-400 font-bold">[E]</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex justify-between items-center col-span-2">
                <span className="text-slate-400">Arcane Overdrive:</span>
                <span className="text-purple-300 font-bold">[R]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cinzel font-bold text-xs tracking-wider transition-colors"
          >
            Resume Battle
          </button>
        </div>
      </div>
    </div>
  );
};
