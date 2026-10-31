import React from 'react';
import { BillingAndUsageControls } from './BillingAndUsageControls.js';
import { TierComparisonCards } from './TierComparisonCards.js';
import { RoiAndQuoteDrawer } from './RoiAndQuoteDrawer.js';
import { DollarSign, ShieldCheck, HelpCircle } from 'lucide-react';

export const InteractivePricingMatrix: React.FC = () => {
  return (
    <section id="pricing-matrix" className="py-24 relative bg-[#06080F]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Transparent ROI & Usage Simulator</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Pay for Value. Never for Idle Servers.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Drag volume sliders to illuminate the most cost-effective plan for your team. Real-time competitor ROI calculation and 1-click shareable CFO budget quote export.
          </p>
        </div>

        {/* 1. Billing Cadence & Usage Volume Sliders */}
        <BillingAndUsageControls />

        {/* 2. 4 Responsive Tier Comparison Cards */}
        <TierComparisonCards />

        {/* 3. Bottom ROI Summary Bar & CFO Export Trigger */}
        <RoiAndQuoteDrawer />
      </div>
    </section>
  );
};
