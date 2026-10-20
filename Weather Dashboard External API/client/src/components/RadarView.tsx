import React, { useState, useEffect } from 'react';
import { Radio, Play, Pause, RotateCcw, Layers, MapPin } from 'lucide-react';
import { WeatherLocation } from '../types/weather';

interface RadarViewProps {
  location: WeatherLocation;
}

export const RadarView: React.FC<RadarViewProps> = ({ location }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [frameIndex, setFrameIndex] = useState(3);
  const frames = ['-45 min', '-30 min', '-15 min', 'Live Now', '+15 min Nowcast', '+30 min Nowcast'];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-8">
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden relative">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-weather-cyan/15 text-weather-cyan">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                High-Resolution Atmospheric Radar & Precipitation Echo
              </h3>
              <p className="text-xs text-white/50">
                Doppler sweep simulation focused on {location.name} ({location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°).
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-mono text-white flex items-center gap-1.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-weather-cyan" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <div className="px-3 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-weather-cyan font-bold">
              {frames[frameIndex]}
            </div>
          </div>
        </div>

        {/* Radar Viewport Display */}
        <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-[#090D14] border border-white/10 overflow-hidden flex items-center justify-center">
          {/* Radar Sweep Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-24 h-24 rounded-full border border-weather-cyan" />
            <div className="w-48 h-48 rounded-full border border-weather-cyan" />
            <div className="w-72 h-72 rounded-full border border-weather-cyan" />
            <div className="w-96 h-96 rounded-full border border-weather-cyan" />
            <div className="absolute w-full h-px bg-weather-cyan/30" />
            <div className="absolute h-full w-px bg-weather-cyan/30" />
          </div>

          {/* Rotating radar sweep arm */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full animate-spin [animation-duration:8s] opacity-25 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(56,189,248,0.3)_60deg,transparent_60deg)]" />
          </div>

          {/* Simulated Doppler Precipitation Blips */}
          <div
            className="absolute transition-all duration-700 ease-out pointer-events-none"
            style={{
              transform: `translate(${Math.sin(frameIndex) * 20}px, ${Math.cos(frameIndex) * 15}px) scale(${1 + frameIndex * 0.05})`,
            }}
          >
            {/* Cell 1 */}
            <div className="absolute -top-16 -left-20 w-36 h-28 rounded-full bg-weather-cyan/25 blur-xl" />
            <div className="absolute -top-14 -left-16 w-24 h-20 rounded-full bg-weather-azure/35 blur-md" />
            <div className="absolute -top-10 -left-12 w-12 h-10 rounded-full bg-weather-amber/40 blur-sm" />

            {/* Cell 2 */}
            <div className="absolute top-12 left-28 w-44 h-32 rounded-full bg-weather-cyan/20 blur-xl" />
            <div className="absolute top-16 left-32 w-28 h-20 rounded-full bg-weather-azure/30 blur-md" />
          </div>

          {/* Center Target Marker */}
          <div className="z-10 flex flex-col items-center">
            <div className="p-2 rounded-full bg-weather-cyan/20 border border-weather-cyan shadow-[0_0_15px_rgba(56,189,248,0.8)] text-white">
              <MapPin className="w-5 h-5 text-weather-cyan" />
            </div>
            <span className="text-xs font-mono font-bold text-white mt-1 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10">
              {location.name}
            </span>
          </div>

          {/* Legend Bottom Bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-[10px] font-mono text-white/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-weather-cyan/60" /> Light
              <span className="w-2.5 h-2.5 rounded-full bg-weather-azure" /> Moderate
              <span className="w-2.5 h-2.5 rounded-full bg-weather-amber" /> Heavy
              <span className="w-2.5 h-2.5 rounded-full bg-weather-crimson" /> Severe
            </div>
            <div className="text-white/40 hidden sm:block">Reflectivity dBZ 15 – 65</div>
          </div>
        </div>
      </div>
    </div>
  );
};
