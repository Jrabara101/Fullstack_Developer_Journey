import React from 'react';

// Generative SVG & visual renderer for cards when external image is absent or offline
export default function CardArt({ theme, element, rarity, isHolo }) {
  switch (theme) {
    case 'time-astrolabe':
      return (
        <div className="w-full h-full bg-gradient-to-b from-purple-950 via-surface-container-low to-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d0bcff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <svg className="w-36 h-36 text-secondary/70 animate-[spin_25s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" strokeDasharray="4 2" strokeWidth="1.5"></circle>
            <circle cx="50" cy="50" r="34" strokeWidth="2"></circle>
            <polygon points="50,18 56,44 82,50 56,56 50,82 44,56 18,50 44,44" strokeWidth="1.5"></polygon>
            <circle cx="50" cy="50" fill="currentColor" fillOpacity="0.25" r="8"></circle>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="material-symbols-outlined text-secondary text-[40px] drop-shadow-[0_0_12px_rgba(208,188,255,0.8)]">hourglass_top</span>
            <span className="text-[10px] font-mono tracking-widest text-secondary/80 mt-1 uppercase">Continuum</span>
          </div>
        </div>
      );

    case 'solar-drake':
      return (
        <div className="w-full h-full bg-gradient-to-br from-amber-950 via-surface-container-low to-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-tertiary/15 to-transparent animate-pulse"></div>
          <div className="w-36 h-36 rounded-full border border-tertiary/40 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30 animate-[spin_18s_linear_infinite]"></div>
            <span className="material-symbols-outlined text-tertiary text-[48px] drop-shadow-[0_0_20px_rgba(255,185,95,0.9)]">local_fire_department</span>
          </div>
          <div className="absolute bottom-4 text-center font-mono text-[9px] text-tertiary/90 uppercase tracking-widest">
            Thermonuclear Ignition
          </div>
        </div>
      );

    case 'singularity-core':
      return (
        <div className="w-full h-full bg-gradient-to-tr from-cyan-950 via-surface-container-low to-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute w-48 h-48 rounded-full bg-primary/10 blur-xl animate-pulse"></div>
          <div className="relative flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border border-primary/50 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary animate-[spin_12s_linear_infinite] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary shadow-[0_0_16px_#4cd7f6]"></div>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary text-[32px] absolute">all_inclusive</span>
          </div>
          <div className="absolute bottom-4 text-center font-mono text-[9px] text-primary/80 uppercase tracking-widest">
            Genesis Matrix Singularity
          </div>
        </div>
      );

    case 'valkyrie-mech':
      return (
        <div className="w-full h-full bg-gradient-to-b from-blue-950 via-surface-container-low to-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
          <div className="w-32 h-32 flex items-center justify-center border border-primary/30 rounded-2xl rotate-45 relative">
            <span className="material-symbols-outlined text-primary text-[44px] -rotate-45 drop-shadow-[0_0_16px_rgba(76,215,246,0.8)]">shield_with_heart</span>
          </div>
          <div className="absolute bottom-4 text-center font-mono text-[9px] text-primary/80 uppercase tracking-widest">
            Cyber Aegis Commander
          </div>
        </div>
      );

    case 'cyber-colossus':
      return (
        <div className="w-full h-full bg-gradient-to-br from-emerald-950/70 via-surface-container-low to-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
          <div className="w-32 h-32 rounded-xl bg-surface-container-high/60 border border-outline-variant flex items-center justify-center relative">
            <span className="material-symbols-outlined text-outline text-[48px]">fort</span>
          </div>
          <div className="absolute bottom-4 text-center font-mono text-[9px] text-on-surface-variant uppercase tracking-widest">
            Fortress Engine
          </div>
        </div>
      );

    case 'fire-pyro':
      return (
        <div className="w-full h-full bg-gradient-to-br from-red-950 via-surface-container-high to-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-error/10 to-transparent animate-pulse"></div>
          <div className="w-28 h-28 rounded-full border border-error/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-[48px] drop-shadow-[0_0_16px_rgba(255,180,171,0.8)]">whatshot</span>
          </div>
          <div className="absolute bottom-4 text-center font-mono text-[9px] text-error/90 uppercase tracking-widest">
            Abyssal Pyromancy
          </div>
        </div>
      );

    case 'glitch-beast':
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-950 via-surface-container-high to-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
          <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center border border-dashed border-secondary/40">
            <span className="material-symbols-outlined text-secondary text-[40px] drop-shadow-[0_0_12px_rgba(208,188,255,0.7)]">pest_control</span>
          </div>
          <div className="absolute bottom-4 text-center font-mono text-[9px] text-secondary/90 uppercase tracking-widest">
            Nanite Hybrid
          </div>
        </div>
      );

    case 'vortex-falcon':
      return (
        <div className="w-full h-full bg-gradient-to-b from-cyan-950 via-surface-container-low to-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
          <div className="w-28 h-28 rounded-full border border-primary/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
            <span className="material-symbols-outlined text-primary text-[42px] -rotate-45">air</span>
          </div>
          <div className="absolute bottom-4 text-center font-mono text-[9px] text-primary/80 uppercase tracking-widest">
            Tempest Aviator
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full h-full bg-gradient-to-b from-surface-container-high to-surface-container-lowest flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <span className="material-symbols-outlined text-outline text-[44px]">shield</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mt-2">
            {element || 'Cyber'} Unit
          </span>
        </div>
      );
  }
}
