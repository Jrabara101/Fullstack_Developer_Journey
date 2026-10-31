import React from 'react';
import { ChaosVsClarityScrubber } from './ChaosVsClarityScrubber.js';
import { BentoFeatureCards } from './BentoFeatureCards.js';
import { Sparkles, Layers } from 'lucide-react';

export const FeatureBentoMatrix: React.FC = () => {
  return (
    <section id="features-matrix" className="py-24 relative bg-[#06080F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture & Feature Proving Ground</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Engineered for Velocity. Architected for Trust.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminate fragile handoffs between staging and production. Every component in Acme is designed to collapse manual operational chores into automated, high-confidence edge workflows.
          </p>
        </div>

        {/* 1. Tactile "Chaos vs Clarity" Scrubber */}
        <ChaosVsClarityScrubber />

        {/* 2. Bento Feature Cards (Dynamic Persona Lens Morphing) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Core Architectural Pillars
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Interactive Micro-Demos Inside Every Bento Bay
            </span>
          </div>

          <BentoFeatureCards />
        </div>
      </div>
    </section>
  );
};
