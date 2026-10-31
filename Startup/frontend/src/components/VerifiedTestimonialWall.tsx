import React, { useState } from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import { CLIENT_TESTIMONIALS } from '../data/clientData.js';
import { StackBlueprintDrawer } from './StackBlueprintDrawer.js';
import { VerifiedTestimonial } from '../types/index.js';
import {
  MessageSquare,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Search
} from 'lucide-react';

export const VerifiedTestimonialWall: React.FC = () => {
  const { setActiveBlueprintTestimonial, incrementSandboxAction } = useMarketingStore();
  const [activePersonaFilter, setActivePersonaFilter] = useState<string>('all');
  const [activeStageFilter, setActiveStageFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic
  const filteredTestimonials = CLIENT_TESTIMONIALS.filter((t) => {
    const matchesPersona =
      activePersonaFilter === 'all' || t.personaTag === activePersonaFilter;
    const matchesStage =
      activeStageFilter === 'all' || t.companyStage.toLowerCase() === activeStageFilter.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      t.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.verifiedMetric.label.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesPersona && matchesStage && matchesSearch;
  });

  // Spotlight featured review (first one or match)
  const featured = filteredTestimonials[0] || CLIENT_TESTIMONIALS[0];

  const handleInspectBlueprint = (t: VerifiedTestimonial) => {
    setActiveBlueprintTestimonial(t);
    incrementSandboxAction();
  };

  return (
    <section id="proof-wall" className="py-24 relative bg-[#06080F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Metric-Verified Social Proof</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Zero Fluff. Pure Telemetry.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Every customer quote is backed by hard production telemetry deltas and inspectable deployment blueprints. Filter by persona lens or company stage to see how teams like yours scaled.
          </p>
        </div>

        {/* Filter Ribbon & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#0D111C] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Persona Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Persona:
            </span>
            {['all', 'founder', 'engineering', 'finance'].map((p) => (
              <button
                key={p}
                onClick={() => setActivePersonaFilter(p)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all capitalize ${
                  activePersonaFilter === p
                    ? 'bg-indigo-600 text-white font-semibold shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {p === 'all' ? 'All Roles' : p}
              </button>
            ))}
          </div>

          {/* Company Stage Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">Stage:</span>
            {['all', 'Seed', 'Series A', 'Series B+', 'Enterprise'].map((s) => (
              <button
                key={s}
                onClick={() => setActiveStageFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  activeStageFilter === s
                    ? 'bg-emerald-600 text-white font-semibold shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All Stages' : s}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by metric, founder, tool..."
              className="w-full bg-[#06080F] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* 1. Featured Spotlight Case Study Card */}
        {featured && (
          <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#0D111C] via-[#101626] to-[#0A0E18] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Author, Company & Quote */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
                    ★ Spotlight Case Study
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Stage: {featured.companyStage}
                  </span>
                </div>

                <blockquote className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                  "{featured.quote}"
                </blockquote>

                <div className="flex items-center gap-4 pt-2">
                  <img
                    src={featured.avatarUrl}
                    alt={featured.authorName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/40"
                  />
                  <div>
                    <div className="font-bold text-white text-base">{featured.authorName}</div>
                    <div className="text-xs text-slate-400">
                      {featured.authorRole} at{' '}
                      <span className="text-indigo-300 font-semibold">{featured.companyName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Telemetry Strip & Inspect Blueprint Button */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#06080F]/80 border border-white/10 rounded-2xl p-6 font-mono">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    VERIFIED PRODUCTION IMPACT
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                    {featured.verifiedMetric.deltaValue}
                  </div>
                  <div className="text-xs text-slate-300">
                    {featured.verifiedMetric.label} ({featured.verifiedMetric.timeframe})
                  </div>
                </div>

                {/* Modules Chip Tray */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase">BLUEPRINT CONFIGURATION</div>
                  <div className="flex flex-wrap gap-1.5">
                    {featured.blueprintUsed.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px]"
                      >
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleInspectBlueprint(featured)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Inspect Their Full Architecture Blueprint</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Masonry Review Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bento-card p-6 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all duration-200"
            >
              {/* Header: Author + Verified Metric Badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {testimonial.authorName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {testimonial.authorRole}, <span className="text-slate-300">{testimonial.companyName}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                    {testimonial.companyStage}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* Bottom Telemetry Pill & Blueprint Action */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {testimonial.verifiedMetric.deltaValue}
                </span>

                <button
                  onClick={() => handleInspectBlueprint(testimonial)}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] flex items-center gap-1 font-semibold transition-colors"
                >
                  <span>See Setup</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Stack Blueprint Drawer */}
      <StackBlueprintDrawer />
    </section>
  );
};
