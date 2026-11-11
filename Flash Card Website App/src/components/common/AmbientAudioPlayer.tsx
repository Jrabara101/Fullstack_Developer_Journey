import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Headphones, Radio } from 'lucide-react';
import { ambientAudio, AmbientMode } from '../../services/ambientAudio';

export const AmbientAudioPlayer: React.FC = () => {
  const [mode, setMode] = useState<AmbientMode>(ambientAudio.getMode());
  const [isPlaying, setIsPlaying] = useState<boolean>(mode !== 'off');
  const [volume, setVolume] = useState<number>(ambientAudio.getVolume());
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = ambientAudio.subscribe((newMode, playing, newVol) => {
      setMode(newMode);
      setIsPlaying(playing);
      setVolume(newVol);
    });
    return unsubscribe;
  }, []);

  const handleModeChange = (newMode: AmbientMode) => {
    ambientAudio.setMode(newMode);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambientAudio.setVolume(val);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          isPlaying
            ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm animate-pulse-subtle'
            : 'bg-white/80 hover:bg-white border border-stone-200 text-stone-700 shadow-xs'
        }`}
        title="Ambient Focus Soundscapes"
      >
        <Headphones className={`w-3.5 h-3.5 ${isPlaying ? 'text-indigo-600 animate-spin-slow' : 'text-stone-500'}`} />
        <span className="hidden sm:inline">
          {mode === 'off' ? 'Focus Audio' : mode === 'brown_noise' ? 'Brown Noise' : 'Lo-Fi Drone'}
        </span>
        {isPlaying ? (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
        )}
      </button>

      {showDropdown && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-4 shadow-xl border border-stone-200/80 z-50 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">Ambient Flow State</span>
            </div>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="py-3 space-y-2">
            <button
              onClick={() => handleModeChange('off')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                mode === 'off'
                  ? 'bg-stone-100 text-stone-900 border border-stone-300'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span>Muted / Silence</span>
              {mode === 'off' && <span className="text-emerald-600 text-xs font-bold">✓ Active</span>}
            </button>

            <button
              onClick={() => handleModeChange('brown_noise')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                mode === 'brown_noise'
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-xs'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold">Deep Brown Noise</div>
                <div className="text-[10px] text-stone-500">Smooth low-pass hum • Deep focus</div>
              </div>
              {mode === 'brown_noise' && <span className="text-indigo-600 text-xs font-bold">✓ Active</span>}
            </button>

            <button
              onClick={() => handleModeChange('lofi_drone')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                mode === 'lofi_drone'
                  ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-xs'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold">Lo-Fi Ambient Drone</div>
                <div className="text-[10px] text-stone-500">Warm resonant chords + soft rain</div>
              </div>
              {mode === 'lofi_drone' && <span className="text-indigo-600 text-xs font-bold">✓ Active</span>}
            </button>
          </div>

          {mode !== 'off' && (
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-stone-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600" />}
                  Soundscape Volume
                </span>
                <span className="font-mono text-[11px] font-semibold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-indigo-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

