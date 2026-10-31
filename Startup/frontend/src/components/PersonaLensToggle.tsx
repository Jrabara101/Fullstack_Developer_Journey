import React from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import { PersonaLens } from '../types/index.js';
import { Zap, Wrench, BarChart3 } from 'lucide-react';

export const PersonaLensToggle: React.FC = () => {
  const { activePersonaLens, setActivePersonaLens } = useMarketingStore();

  const lenses: { id: PersonaLens; label: string; icon: React.ReactNode; subtitle: string }[] = [
    {
      id: 'founder',
      label: 'For Founders',
      icon: <Zap className="w-3.5 h-3.5" />,
      subtitle: 'Speed & Scale'
    },
    {
      id: 'engineering',
      label: 'For Engineering',
      icon: <Wrench className="w-3.5 h-3.5" />,
      subtitle: 'Zero Drift & P99'
    },
    {
      id: 'finance',
      label: 'For Ops & Finance',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      subtitle: 'ROI & Audit Ready'
    }
  ];

  return (
    <div className="inline-flex p-1 rounded-full bg-[#0D111C]/90 border border-white/10 shadow-lg shadow-black/40 backdrop-blur-md">
      {lenses.map((lens) => {
        const isActive = activePersonaLens === lens.id;
        return (
          <button
            key={lens.id}
            onClick={() => setActivePersonaLens(lens.id)}
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className={isActive ? 'text-amber-300' : 'text-slate-400'}>{lens.icon}</span>
            <span>{lens.label}</span>
            <span
              className={`hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-800/60 text-slate-400'
              }`}
            >
              {lens.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
};
