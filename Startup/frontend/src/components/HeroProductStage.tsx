import React, { useState } from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import { PersonaLensToggle } from './PersonaLensToggle.js';
import { InteractiveProductSandbox } from './InteractiveProductSandbox.js';
import { TrustLogoMarquee } from './TrustLogoMarquee.js';
import { checkWorkspaceSlug } from '../api/client.js';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';

export const HeroProductStage: React.FC = () => {
  const {
    activePersonaLens,
    workspaceSlugInput,
    setWorkspaceSlugInput,
    incrementSandboxAction,
    setIsEnterpriseModalOpen
  } = useMarketingStore();

  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  // Persona Copy Map
  const heroCopyMap = {
    founder: {
      badge: 'Zero Sign-Up Fatigue · Real-Time Product Sandbox',
      title: 'From First Commit to Series A Without the $180k DevOps Tax.',
      highlight: 'Without the $180k DevOps Tax',
      description:
        'Transform weeks of fragile cloud setup into a 4-second edge deployment. Manipulate live product workflows below with zero signup, calculate real-time ROI, and provision your team workspace in seconds.',
      metricPill: '⚡ 3.4x Faster Release Cycles · 0 Dedicated DevOps Hires'
    },
    engineering: {
      badge: 'Zero Drift · Sub-12ms Anycast Routing · 35 Global PoPs',
      title: 'Production-Identical Sandboxes. Sub-12ms Global Latency.',
      highlight: 'Sub-12ms Global Latency',
      description:
        'Every pull request gets an isolated edge clone with instant DB forks. Automated blue/green canary pipelines with 380ms anomaly circuit breakers, zero cold-starts, and real-time P99 observability.',
      metricPill: '🛡️ 99.994% Availability SLA · <380ms Heuristic Rollback'
    },
    finance: {
      badge: 'Transparent Tiered Sliders · Guaranteed Capital Efficiency',
      title: 'Cut Idle Cloud Spend 48%. Guarantee CFO-Ready ROI.',
      highlight: 'Guarantee CFO-Ready ROI',
      description:
        'Eliminate runaway egress bills and persistent idle dev staging servers. Sleep-to-zero compute, continuous SOC2 compliance ledger, and instant one-click shareable CFO budget proposals.',
      metricPill: '💰 $14,200/mo Average Cloud Savings · 1-Click Budget Approval'
    }
  };

  const activeCopy = heroCopyMap[activePersonaLens];

  const handleSlugCheck = async (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setWorkspaceSlugInput(clean);

    if (clean.length < 3) {
      setSlugStatus({ checking: false });
      return;
    }

    setSlugStatus({ checking: true });
    try {
      const res = await checkWorkspaceSlug(clean);
      setSlugStatus({
        checking: false,
        available: res.available,
        message: res.available ? '✓ Available! Ready in 4s' : res.reason || 'Unavailable'
      });
    } catch {
      setSlugStatus({ checking: false, available: true, message: '✓ Available! Ready in 4s' });
    }
  };

  const handleClaimWorkspace = () => {
    incrementSandboxAction();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    // Scroll smoothly to bottom CTA provision dock
    const ctaDock = document.getElementById('instant-provision-dock');
    if (ctaDock) {
      ctaDock.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSandbox = () => {
    const sandbox = document.getElementById('interactive-sandbox-viewport');
    if (sandbox) {
      sandbox.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-16 overflow-hidden bg-radial-aurora bg-grid-architectural">
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Top Persona Lens Switcher Pill */}
        <div className="mb-6 flex flex-col items-center">
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Switch Buyer Lens in Real Time
          </div>
          <PersonaLensToggle />
        </div>

        {/* Dynamic Metric Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-mono mb-6 transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{activeCopy.badge}</span>
        </div>

        {/* Hero Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12] transition-all duration-300">
          {activeCopy.title}
        </h1>

        {/* Hero Subheadline */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          {activeCopy.description}
        </p>

        {/* Verified Telemetry Strip for active lens */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0D111C]/80 border border-white/10 text-xs font-mono text-emerald-400 shadow-inner">
          <span>{activeCopy.metricPill}</span>
        </div>

        {/* Dual-Velocity CTA Cluster */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl">
          {/* Real-time Workspace Slug Input */}
          <div className="relative flex-1 w-full">
            <div className="flex items-center rounded-xl bg-[#0D111C] border border-white/15 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xl transition-all overflow-hidden">
              <span className="pl-3.5 pr-1 text-slate-500 text-xs font-mono select-none">
                app.acme.dev/
              </span>
              <input
                type="text"
                value={workspaceSlugInput}
                onChange={(e) => handleSlugCheck(e.target.value)}
                placeholder="your-team-handle"
                className="w-full bg-transparent py-3 pr-3 text-white text-xs font-mono placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Instant Slug Availability Feedback */}
            {slugStatus.message && (
              <div
                className={`absolute left-2 -bottom-5 text-[11px] font-mono transition-all ${
                  slugStatus.available ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {slugStatus.message}
              </div>
            )}
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={handleClaimWorkspace}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs whitespace-nowrap shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all group"
          >
            <span>Claim Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Secondary Trust & Keyboard Hint Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <button
            onClick={scrollToSandbox}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Sandbox (No signup needed)</span>
          </button>
          <span>·</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>No Credit Card Required</span>
          </span>
          <span>·</span>
          <button
            onClick={() => setIsEnterpriseModalOpen(true)}
            className="hover:text-indigo-300 underline underline-offset-4 transition-colors"
          >
            Schedule Architecture Review
          </button>
        </div>

        {/* Hero Interactive Sandbox Container */}
        <div id="interactive-sandbox-viewport" className="mt-14 w-full relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-60 pointer-events-none" />
          <InteractiveProductSandbox />
        </div>
      </div>

      {/* Trust Logo Marquee */}
      <div className="mt-16">
        <TrustLogoMarquee />
      </div>
    </section>
  );
};
