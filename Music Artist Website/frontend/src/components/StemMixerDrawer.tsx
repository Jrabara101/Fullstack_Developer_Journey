import React from 'react';
import { SlidersHorizontal, Volume2, VolumeX, Eye, X, RotateCcw } from 'lucide-react';
import { useAudioEngine } from '../context/AudioEngineContext';
import { StemMixerState } from '../types';

export const StemMixerDrawer: React.FC = () => {
  const {
    openStemDrawer,
    setOpenStemDrawer,
    stemState,
    stemLevels,
    toggleStemMute,
    toggleStemSolo,
    setStemVolume,
    currentTrack
  } = useAudioEngine();

  if (!openStemDrawer) return null;

  const channels: Array<{
    key: keyof StemMixerState;
    label: string;
    sublabel: string;
    color: string;
    bgAccent: string;
  }> = [
    {
      key: 'vocals',
      label: 'CH1: VOCALS',
      sublabel: currentTrack?.stems_json.vocals || 'Lead & Harmonic Formants',
      color: '#10B981',
      bgAccent: 'rgba(16, 185, 129, 0.15)'
    },
    {
      key: 'synths',
      label: 'CH2: ANALOG SYNTHS',
      sublabel: currentTrack?.stems_json.synths || 'Prophet-6 Arpeggios',
      color: '#00F0FF',
      bgAccent: 'rgba(0, 240, 255, 0.15)'
    },
    {
      key: 'drums',
      label: 'CH3: DRUMS & 909',
      sublabel: currentTrack?.stems_json.drums || 'TR-909 Kick, Snare & Hats',
      color: '#FF6B00',
      bgAccent: 'rgba(255, 107, 0, 0.15)'
    },
    {
      key: 'bass',
      label: 'CH4: SUB BASS',
      sublabel: currentTrack?.stems_json.bass || 'Sub-37 44Hz Saw Wave',
      color: '#FF3366',
      bgAccent: 'rgba(255, 51, 102, 0.15)'
    }
  ];

  const handleResetAll = () => {
    (['vocals', 'synths', 'drums', 'bass'] as (keyof StemMixerState)[]).forEach(ch => {
      if (stemState[ch].solo) toggleStemSolo(ch);
      if (stemState[ch].muted) toggleStemMute(ch);
      setStemVolume(ch, 0.9);
    });
  };

  return (
    <div className="fixed bottom-20 inset-x-0 z-40 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-4xl mx-auto rounded-2xl bg-[#0D0F14]/98 border border-white/20 shadow-2xl p-4 sm:p-6 backdrop-blur-2xl pointer-events-auto hardware-transition">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--era-accent)]/10 text-[var(--era-accent)]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>4-Channel Stem Mixer & Isolator</span>
                <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald animate-pulse" />
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Real-time Web Audio GainNodes • Track: <span className="text-zinc-200">{currentTrack?.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300"
              title="Reset all stems to default unmuted state"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Mix</span>
            </button>
            <button
              onClick={() => setOpenStemDrawer(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Stem Fader Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map(({ key, label, sublabel, color, bgAccent }) => {
            const state = stemState[key];
            const level = stemLevels[key];

            return (
              <div
                key={key}
                className={`rounded-xl p-3.5 border transition-all ${
                  state.solo
                    ? 'border-[var(--era-accent)] shadow-lg shadow-[var(--era-accent)]/10 bg-white/[0.04]'
                    : state.muted
                    ? 'border-white/5 opacity-50 bg-black/40'
                    : 'border-white/10 bg-black/50'
                }`}
              >
                {/* Channel Header & Live LED Peak Meter */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}`
                      }}
                    />
                    <span className="text-[11px] font-mono font-bold text-white tracking-wide">
                      {label}
                    </span>
                  </div>

                  {/* Level readout */}
                  <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                    {level}%
                  </span>
                </div>

                <div className="text-[9px] font-mono text-zinc-400 truncate mb-3" title={sublabel}>
                  {sublabel}
                </div>

                {/* Vertical LED Meter Bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-3.5 p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-75"
                    style={{
                      width: `${level}%`,
                      backgroundColor: color
                    }}
                  />
                </div>

                {/* Solo & Mute Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => toggleStemSolo(key)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                      state.solo
                        ? 'bg-[var(--era-accent)] text-white shadow-md shadow-[var(--era-accent)]/30'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Solo
                  </button>

                  <button
                    onClick={() => toggleStemMute(key)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
                      state.muted
                        ? 'bg-signal-crimson/80 text-white'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {state.muted ? 'Muted' : 'Mute'}
                  </button>
                </div>

                {/* Fader Slider */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <span className="text-[9px] font-mono text-zinc-400">VOL</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={state.muted ? 0 : state.volume}
                    disabled={state.muted}
                    onChange={e => setStemVolume(key, parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: color }}
                  />
                  <span className="text-[10px] font-mono text-zinc-400 tabular-nums w-7 text-right">
                    {Math.round(state.volume * 100)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

