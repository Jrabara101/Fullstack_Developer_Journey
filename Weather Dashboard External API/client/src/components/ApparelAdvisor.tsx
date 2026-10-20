import React from 'react';
import { Shirt, Umbrella, Glasses, Wind, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { ApparelAdvice } from '../types/weather';

interface ApparelAdvisorProps {
  apparel: ApparelAdvice;
}

export const ApparelAdvisor: React.FC<ApparelAdvisorProps> = ({ apparel }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-8">
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-weather-gold" />
            <h3 className="text-base font-semibold text-white tracking-tight">
              Intelligent Apparel & Meteorological Gear Advisor
            </h3>
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-weather-gold bg-weather-gold/15 px-3 py-1 rounded-full border border-weather-gold/25 self-start sm:self-auto">
            Thermal Index: {apparel.thermalFeeling}
          </span>
        </div>

        <p className="text-sm text-white/90 font-medium mb-5">
          "{apparel.summarySentence}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Base Layer */}
          <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-1">
              Base Layer
            </span>
            <p className="text-sm font-semibold text-white">{apparel.baseLayer}</p>
            <p className="text-xs text-white/50 mt-1">
              Maintains optimal thermal moisture and core body ventilation.
            </p>
          </div>

          {/* Outer Layer */}
          <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-1">
              Outer Shell / Insulation
            </span>
            <p className="text-sm font-semibold text-white">{apparel.outerLayer}</p>
            <p className="text-xs text-white/50 mt-1">
              Adaptive barrier against evening drops, wind gusts, and humidity.
            </p>
          </div>

          {/* Recommended Gear & Accessories */}
          <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-1">
              Recommended Daily Accessories
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {apparel.accessories && apparel.accessories.length > 0 ? (
                apparel.accessories.map((acc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-mono bg-white/[0.08] px-2.5 py-1 rounded-lg text-weather-cyan border border-white/10"
                  >
                    <Check className="w-3 h-3 text-weather-emerald" /> {acc}
                  </span>
                ))
              ) : (
                <span className="text-xs text-white/60">Standard everyday essentials</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
