import React, { useState, useEffect } from 'react';
import { LocationInfo } from '../types/weather';

interface RadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationInfo;
}

export const RadarModal: React.FC<RadarModalProps> = ({ isOpen, onClose, location }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const frames = ['-60m', '-45m', '-30m', '-15m', 'Now (16:40)', '+15m (Forecast)', '+30m', '+45m'];

  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % frames.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, frames.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-[24px] bg-[#141b2c] border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">radar</span>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">Live Atmospheric Radar & Satellite</h2>
              <p className="text-xs text-white/60">
                High-resolution doppler precipitation velocity & cloud reflection for {location.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/80"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Radar Map Canvas Simulation */}
        <div className="relative w-full h-[360px] bg-[#0c1323] overflow-hidden flex items-center justify-center">
          {/* Geographical Grid Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>

          {/* Range rings */}
          <div className="absolute w-[180px] h-[180px] rounded-full border border-white/15 pointer-events-none"></div>
          <div className="absolute w-[280px] h-[280px] rounded-full border border-white/10 pointer-events-none"></div>
          <div className="absolute w-[360px] h-[360px] rounded-full border border-white/5 pointer-events-none"></div>

          {/* Sweeping radar line animation */}
          <div className="absolute w-[360px] h-[360px] rounded-full overflow-hidden pointer-events-none animate-[spin_4s_linear_infinite]">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-emerald-500/20 to-transparent origin-bottom-right"></div>
          </div>

          {/* Animated Rain & Cloud Echoes */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Front cluster */}
            <div
              className="absolute w-72 h-48 rounded-full bg-gradient-to-r from-sky-500/30 via-emerald-400/35 to-amber-400/25 blur-2xl transition-all duration-1000"
              style={{
                transform: `translate(${(frameIndex - 3) * 20}px, ${(frameIndex - 3) * 12}px) rotate(${frameIndex * 4}deg)`
              }}
            ></div>
            <div
              className="absolute w-44 h-32 rounded-full bg-[#38BDF8]/40 blur-xl transition-all duration-1000"
              style={{
                transform: `translate(${(frameIndex - 3) * 25}px, ${(frameIndex - 3) * 15}px)`
              }}
            ></div>
          </div>

          {/* Target Station Marker */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-[0_0_12px_rgba(255,183,135,0.8)]"></div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white uppercase tracking-wider">
              {location.name} ({location.stationCode})
            </span>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-3 left-4 p-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-[10px] text-white flex items-center gap-3">
            <span className="text-white/60 font-semibold uppercase">Precipitation:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 bg-sky-400 rounded-sm"></span>
              <span>Light</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 bg-emerald-400 rounded-sm"></span>
              <span>Mod</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 bg-amber-400 rounded-sm"></span>
              <span>Heavy</span>
            </div>
          </div>

          {/* Frame timestamp badge */}
          <div className="absolute top-3 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-primary">
            Frame: {frames[frameIndex]}
          </div>
        </div>

        {/* Player Controls */}
        <div className="p-4 bg-surface-container-lowest/70 border-t border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <span className="text-xs text-white/70">
              {isPlaying ? 'Looping live sequence' : 'Paused at ' + frames[frameIndex]}
            </span>
          </div>

          {/* Timeline slider steps */}
          <div className="flex items-center gap-1">
            {frames.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setFrameIndex(i);
                  setIsPlaying(false);
                }}
                className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                  frameIndex === i ? 'bg-primary text-on-primary shadow-sm scale-105' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
