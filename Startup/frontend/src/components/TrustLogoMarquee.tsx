import React from 'react';
import { TRUST_LOGOS } from '../data/clientData.js';
import { Zap, Database, Globe, DollarSign, Clock, BarChart, ShieldCheck, Cpu } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  zap: <Zap className="w-4 h-4 text-amber-400" />,
  database: <Database className="w-4 h-4 text-emerald-400" />,
  globe: <Globe className="w-4 h-4 text-cyan-400" />,
  'dollar-sign': <DollarSign className="w-4 h-4 text-emerald-400" />,
  clock: <Clock className="w-4 h-4 text-indigo-400" />,
  'bar-chart': <BarChart className="w-4 h-4 text-cyan-400" />,
  'shield-check': <ShieldCheck className="w-4 h-4 text-indigo-400" />,
  cpu: <Cpu className="w-4 h-4 text-amber-400" />
};

export const TrustLogoMarquee: React.FC = () => {
  // Duplicate array for seamless infinite marquee loop
  const logos = [...TRUST_LOGOS, ...TRUST_LOGOS];

  return (
    <div className="w-full py-10 overflow-hidden relative border-y border-white/5 bg-[#06080F]/60">
      {/* Subtle edge fade overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#06080F] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#06080F] to-transparent z-10 pointer-events-none" />

      <div className="text-center text-xs font-mono text-slate-400 uppercase tracking-widest mb-6">
        Backed by telemetry & trusted by elite engineering teams worldwide
      </div>

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {logos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="group relative mx-6 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0D111C]/60 hover:bg-[#151C2C] border border-white/5 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-indigo-500/10 transition-colors">
              {iconMap[logo.icon] || <Zap className="w-4 h-4 text-indigo-400" />}
            </div>
            <span className="font-display font-semibold text-sm text-slate-300 group-hover:text-white transition-colors">
              {logo.name}
            </span>

            {/* Hover Tooltip showing verified telemetry */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-[#06080F] border border-indigo-500/40 text-[11px] font-mono text-emerald-400 whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              {logo.metric}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#06080F]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
