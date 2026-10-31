import React from 'react';
import { SkyState } from '../types/weather';

interface SkyShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSky: (sky: SkyState) => void;
}

export const SkyShowcaseModal: React.FC<SkyShowcaseModalProps> = ({
  isOpen,
  onClose,
  onSelectSky
}) => {
  if (!isOpen) return null;

  const handlePick = (sky: SkyState) => {
    onSelectSky(sky);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-6xl my-auto rounded-[32px] bg-[#0c1323] border border-white/20 p-6 md:p-8 flex flex-col gap-6 shadow-[0_24px_80px_rgba(0,0,0,0.8)] text-white relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Aerie Atmospheric Palette Engine
              </span>
              <span className="text-xs uppercase tracking-wider text-white/40 font-medium hidden sm:inline">
                · WCAG AAA Calibrated
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              One layout, every sky
            </h2>
            <p className="text-sm md:text-base text-white/70 mt-1">
              The UI takes on the natural horizon of the sky over the place you searched. Click any atmosphere to activate it.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-end md:self-auto w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Four Atmospheric Mobile Frames Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* 1. CLEAR NOON */}
          <div
            onClick={() => handlePick('clear-noon')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-[260px] h-[520px] rounded-[28px] overflow-hidden sky-clear-noon relative shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col justify-between p-4 group-hover:scale-[1.03] group-hover:border-white/50 transition-all duration-300">
              {/* Status bar */}
              <div className="flex justify-between items-center text-white text-xs font-semibold px-1">
                <span className="tabular">12:15</span>
                <span className="material-symbols-outlined text-[15px]">wifi</span>
              </div>

              {/* Upper pill */}
              <div className="w-full h-8 rounded-full bg-white/20 backdrop-blur-md px-3 flex items-center justify-between text-xs text-white/90">
                <span>Kyoto, Japan</span>
                <span className="material-symbols-outlined text-[15px]">search</span>
              </div>

              {/* Center Hero */}
              <div className="my-auto py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                  KYOTO · NOON ☀️
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-[56px] leading-none font-light tracking-tight text-white tabular">
                    22°
                  </span>
                  <div className="w-10 h-10 rounded-full bg-amber-300/30 border border-amber-200/50 flex items-center justify-center sun-glow">
                    <span className="material-symbols-outlined text-[20px] text-amber-300">wb_sunny</span>
                  </div>
                </div>
                <div className="text-xs text-white/80 font-medium tabular mt-1">
                  Feels 22° · H 24° · L 15°
                </div>
                <div className="text-sm font-medium text-white mt-2 leading-snug">
                  Bright and breezy midday.
                </div>
              </div>

              {/* Lower Wear Banner */}
              <div className="rounded-xl p-2.5 bg-white/15 backdrop-blur-md border border-white/15 text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-300">wb_sunny</span>
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block">High UV 7 · Sunglasses</span>
                  <span className="text-white/70">Dry westerly breeze</span>
                </div>
              </div>

              <div className="w-20 h-1 bg-white/40 rounded-full mx-auto"></div>
            </div>

            <div className="mt-3 text-sm uppercase tracking-wider font-semibold text-white/80 flex items-center gap-1.5 group-hover:text-primary transition-colors">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              CLEAR NOON
            </div>
            <div className="text-xs text-white/40 font-mono">#1E5AA8 → #4F8FD0</div>
          </div>

          {/* 2. GOLDEN HOUR */}
          <div
            onClick={() => handlePick('golden-hour')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-[260px] h-[520px] rounded-[28px] overflow-hidden sky-golden-hour relative shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col justify-between p-4 group-hover:scale-[1.03] group-hover:border-white/50 transition-all duration-300">
              <div className="flex justify-between items-center text-white text-xs font-semibold px-1">
                <span className="tabular">16:40</span>
                <span className="material-symbols-outlined text-[15px]">wifi</span>
              </div>

              <div className="w-full h-8 rounded-full bg-white/20 backdrop-blur-md px-3 flex items-center justify-between text-xs text-white/90">
                <span>Kyoto, Japan</span>
                <span className="material-symbols-outlined text-[15px]">search</span>
              </div>

              <div className="my-auto py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                  KYOTO · NOW 🌅
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-[56px] leading-none font-light tracking-tight text-white tabular">
                    21°
                  </span>
                  <div className="w-10 h-10 rounded-full bg-amber-500/30 border border-amber-300/40 flex items-center justify-center sun-glow">
                    <span className="material-symbols-outlined text-[20px] text-amber-300">wb_twilight</span>
                  </div>
                </div>
                <div className="text-xs text-white/80 font-medium tabular mt-1">
                  Feels 20° · H 22° · L 14°
                </div>
                <div className="text-sm font-medium text-white mt-2 leading-snug">
                  Golden light now, showers after seven.
                </div>
              </div>

              <div className="rounded-xl p-2.5 bg-white/15 backdrop-blur-md border border-white/15 text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary">checkroom</span>
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block">Sunglasses now, umbrella by seven</span>
                  <span className="text-white/70">Feels 4° cooler in shade</span>
                </div>
              </div>

              <div className="w-20 h-1 bg-white/40 rounded-full mx-auto"></div>
            </div>

            <div className="mt-3 text-sm uppercase tracking-wider font-semibold text-white/80 flex items-center gap-1.5 group-hover:text-primary transition-colors">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              GOLDEN HOUR
            </div>
            <div className="text-xs text-white/40 font-mono">#1F2A44 → #D9782D</div>
          </div>

          {/* 3. OVERCAST */}
          <div
            onClick={() => handlePick('overcast')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-[260px] h-[520px] rounded-[28px] overflow-hidden sky-overcast relative shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col justify-between p-4 group-hover:scale-[1.03] group-hover:border-white/50 transition-all duration-300">
              <div className="flex justify-between items-center text-white text-xs font-semibold px-1">
                <span className="tabular">11:08</span>
                <span className="material-symbols-outlined text-[15px]">wifi</span>
              </div>

              <div className="w-full h-8 rounded-full bg-white/20 backdrop-blur-md px-3 flex items-center justify-between text-xs text-white/90">
                <span>Hakuba, Nagano</span>
                <span className="material-symbols-outlined text-[15px]">search</span>
              </div>

              <div className="my-auto py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                  HAKUBA · MID-DAY ☁️
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-[56px] leading-none font-light tracking-tight text-white tabular">
                    9°
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-400/25 border border-slate-300/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-slate-200">cloud</span>
                  </div>
                </div>
                <div className="text-xs text-white/80 font-medium tabular mt-1">
                  Feels 6° · H 11° · L 3°
                </div>
                <div className="text-sm font-medium text-white mt-2 leading-snug">
                  Gray and still, mountain chill deepening.
                </div>
              </div>

              <div className="rounded-xl p-2.5 bg-white/15 backdrop-blur-md border border-white/15 text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-200">ac_unit</span>
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block">Heavy wool layer + windbreaker</span>
                  <span className="text-white/70">Valley mist at 78%</span>
                </div>
              </div>

              <div className="w-20 h-1 bg-white/40 rounded-full mx-auto"></div>
            </div>

            <div className="mt-3 text-sm uppercase tracking-wider font-semibold text-white/80 flex items-center gap-1.5 group-hover:text-primary transition-colors">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              OVERCAST
            </div>
            <div className="text-xs text-white/40 font-mono">#323A48 → #7C8798</div>
          </div>

          {/* 4. NIGHT CLEAR */}
          <div
            onClick={() => handlePick('night')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-[260px] h-[520px] rounded-[28px] overflow-hidden sky-night relative shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col justify-between p-4 group-hover:scale-[1.03] group-hover:border-white/50 transition-all duration-300">
              {/* Star specks */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute w-1 h-1 bg-white rounded-full top-8 left-16"></div>
                <div className="absolute w-1 h-1 bg-white rounded-full top-24 right-12 opacity-70"></div>
                <div className="absolute w-1.5 h-1.5 bg-amber-100 rounded-full top-36 left-28"></div>
                <div className="absolute w-1 h-1 bg-white rounded-full top-52 right-8 opacity-60"></div>
              </div>

              <div className="flex justify-between items-center text-white text-xs font-semibold px-1 relative z-10">
                <span className="tabular">23:45</span>
                <span className="material-symbols-outlined text-[15px]">wifi</span>
              </div>

              <div className="w-full h-8 rounded-full bg-white/20 backdrop-blur-md px-3 flex items-center justify-between text-xs text-white/90 relative z-10">
                <span>Kyoto, Japan</span>
                <span className="material-symbols-outlined text-[15px]">search</span>
              </div>

              <div className="my-auto py-2 relative z-10">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                  KYOTO · NIGHT 🌙
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-[56px] leading-none font-light tracking-tight text-white tabular">
                    13°
                  </span>
                  <div className="w-10 h-10 rounded-full bg-indigo-400/25 border border-indigo-200/40 flex items-center justify-center moon-glow">
                    <span className="material-symbols-outlined text-[20px] text-indigo-100">nights_stay</span>
                  </div>
                </div>
                <div className="text-xs text-white/80 font-medium tabular mt-1">
                  Feels 12° · H 22° · L 11°
                </div>
                <div className="text-sm font-medium text-white mt-2 leading-snug">
                  Clear, cool, stars after midnight.
                </div>
              </div>

              <div className="rounded-xl p-2.5 bg-white/15 backdrop-blur-md border border-white/15 text-white flex items-center gap-2 relative z-10">
                <span className="material-symbols-outlined text-[18px] text-indigo-200">auto_awesome</span>
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block">Stargazing prime · Cloud 0%</span>
                  <span className="text-white/70">Quiet stillness</span>
                </div>
              </div>

              <div className="w-20 h-1 bg-white/40 rounded-full mx-auto relative z-10"></div>
            </div>

            <div className="mt-3 text-sm uppercase tracking-wider font-semibold text-white/80 flex items-center gap-1.5 group-hover:text-primary transition-colors">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              NIGHT CLEAR
            </div>
            <div className="text-xs text-white/40 font-mono">#0B1222 → #1E293B</div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="text-center text-xs text-white/50 pt-2 border-t border-white/10">
          Tip: You can also use the sky cycler icons at the top right of the navigation header at any time.
        </div>
      </div>
    </div>
  );
};

