import type { PetEntity, PetMood } from '../types/pet';
import { Utensils, Sparkles, Heart, Zap, BedDouble, AlertCircle } from 'lucide-react';

interface VitalsDockProps {
  pet: PetEntity;
}

export const VitalsDock: React.FC<VitalsDockProps> = ({ pet }) => {
  const { hunger, hygiene, happiness, energy } = pet.vitals;

  // Hunger color interpolation: Coral (<35), Saffron (35-70), Emerald (>70)
  const getHungerColor = (val: number) => {
    if (val < 35) return 'from-rose-500 to-rose-600';
    if (val < 70) return 'from-amber-500 to-amber-600';
    return 'from-emerald-400 to-emerald-500';
  };

  const getMoodBadge = (mood: PetMood, isSleeping: boolean) => {
    if (isSleeping) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
          <BedDouble className="w-3.5 h-3.5" />
          <span>Dream State</span>
        </span>
      );
    }

    switch (mood) {
      case 'ECSTATIC':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-heart-pulse">
            <span>✨</span>
            <span>Ecstatic</span>
          </span>
        );
      case 'SICK':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Sick (Needs Meds)</span>
          </span>
        );
      case 'HUNGRY':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/25 text-orange-300 border border-orange-500/40">
            <span>🍽️</span>
            <span>Hungry</span>
          </span>
        );
      case 'DIRTY':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/25 text-yellow-300 border border-yellow-500/40">
            <span>🫧</span>
            <span>Needs Bath</span>
          </span>
        );
      case 'EXHAUSTED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/25 text-purple-300 border border-purple-500/40">
            <span>💤</span>
            <span>Exhausted</span>
          </span>
        );
      case 'CONTENT':
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span>💚</span>
            <span>Content</span>
          </span>
        );
    }
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-xl">
      <div className="glass-hud rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Vitals Telemetry</span>
          {getMoodBadge(pet.mood, pet.isSleeping)}
        </div>

        {/* 4 Gauges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Hunger */}
          <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-rose-300">
                <Utensils className="w-3.5 h-3.5" />
                Hunger
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-300">{Math.round(hunger)}%</span>
            </div>
            <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${getHungerColor(hunger)} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.max(4, hunger)}%` }}
              />
            </div>
          </div>

          {/* 2. Hygiene */}
          <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-sky-300">
                <Sparkles className="w-3.5 h-3.5" />
                Hygiene
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-300">{Math.round(hygiene)}%</span>
            </div>
            <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800 relative">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(4, hygiene)}%` }}
              />
            </div>
          </div>

          {/* 3. Happiness */}
          <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-amber-300">
                <Heart className="w-3.5 h-3.5 animate-heart-pulse text-amber-400" />
                Joy
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-300">{Math.round(happiness)}%</span>
            </div>
            <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(4, happiness)}%` }}
              />
            </div>
          </div>

          {/* 4. Energy */}
          <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-purple-300">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                Energy
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-300">{Math.round(energy)}%</span>
            </div>
            <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(4, energy)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
