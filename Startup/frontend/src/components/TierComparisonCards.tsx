import React from 'react';
import { usePricingCalculator } from '../hooks/usePricingCalculator.js';
import { useMarketingStore } from '../store/marketingStore.js';
import { PlanTierId } from '../types/index.js';
import { Check, X, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TierStaticMeta {
  id: PlanTierId;
  name: string;
  tagline: string;
  badge?: string;
  features: { label: string; tooltip: string; included: boolean }[];
}

const STATIC_TIERS: TierStaticMeta[] = [
  {
    id: 'starter',
    name: 'Developer',
    tagline: 'Ideal for bootstrapped builders, side projects & early proof of concepts.',
    badge: 'Zero Friction',
    features: [
      { label: '3 Team Members included', tooltip: 'Add extra seats at $12/seat/mo', included: true },
      { label: '50,000 Pipeline Events/mo', tooltip: 'Automatic scaling at $0.25/1k events', included: true },
      { label: 'Ephemeral Preview Sandboxes', tooltip: 'Created in <3.2s per Git commit', included: true },
      { label: 'Single-region Edge Routing', tooltip: 'US-East or EU-Central', included: true },
      { label: 'Community & Discord Support', tooltip: 'Direct access to core team engineers', included: true },
      { label: 'Multi-region Active-Active Mesh', tooltip: 'Available on Growth and higher', included: false },
      { label: 'SOC2 Type II Audit Trails', tooltip: 'Continuous compliance ledger', included: false },
      { label: 'Custom Domain SSL & Dedicated VPC', tooltip: 'Enterprise security network', included: false }
    ]
  },
  {
    id: 'pro',
    name: 'Growth',
    tagline: 'Engineered for high-velocity teams seeking uncompromised release speed.',
    badge: 'Most Popular',
    features: [
      { label: '10 Team Members included', tooltip: 'Add extra seats at $15/seat/mo', included: true },
      { label: '250,000 Pipeline Events/mo', tooltip: 'Overage billed at $0.20/1k events', included: true },
      { label: 'Unlimited Preview Sandboxes', tooltip: 'Isolated DB forks and edge mirrors', included: true },
      { label: 'Multi-Region Global Mesh (12 PoPs)', tooltip: 'Sub-15ms edge compute worldwide', included: true },
      { label: 'Zero-Downtime Rollback Canary', tooltip: 'Automated 1% to 100% traffic progression', included: true },
      { label: 'Priority Slack Support (<2hr SLA)', tooltip: 'Dedicated solutions engineers', included: true },
      { label: 'SOC2 Type II Audit Trails', tooltip: 'Available on Scale and higher', included: false },
      { label: 'Dedicated VPC & Custom SSO/SAML', tooltip: 'Enterprise identity & isolation', included: false }
    ]
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Mission-critical reliability, automated cost-guards & fleet orchestration.',
    badge: 'High Velocity',
    features: [
      { label: '25 Team Members included', tooltip: 'Scale seats flexibly at $18/seat/mo', included: true },
      { label: '1,000,000 Pipeline Events/mo', tooltip: 'High-volume tier at $0.15/1k events', included: true },
      { label: 'Continuous SOC2 & HIPAA Vault', tooltip: 'Export-ready tamperproof logs', included: true },
      { label: 'Global 35+ PoP Edge Anywhere', tooltip: 'Ultra-low latency with auto-failover', included: true },
      { label: 'Automated Cloud FinOps Quotas', tooltip: 'Prevent orphaned preview costs', included: true },
      { label: 'SSO / SAML (Okta, Google Workspace)', tooltip: 'Directory sync & RBAC', included: true },
      { label: 'Custom Synthetic Load Test Engine', tooltip: 'Simulate 100k req/s pre-release', included: true },
      { label: 'Dedicated Solutions Architect & 99.99%', tooltip: 'Available on Enterprise', included: false }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Custom infrastructure isolation, dedicated tenancy & bespoke compliance SLA.',
    badge: 'Dedicated Isolation',
    features: [
      { label: '100+ Team Members included', tooltip: 'Volume discounts on unlimited seat blocks', included: true },
      { label: '10,000,000+ Pipeline Events/mo', tooltip: 'Custom rates below $0.10/1k events', included: true },
      { label: 'Dedicated VPC or Hybrid Gateway', tooltip: 'Bring your own AWS/GCP or bare-metal', included: true },
      { label: 'Custom Data Residency & Geofencing', tooltip: 'Keep customer data in EU/US/APAC', included: true },
      { label: '99.999% Availability Financial SLA', tooltip: 'Contractually guaranteed uptime', included: true },
      { label: 'Dedicated 24/7 War Room Bridge', tooltip: 'Sub-15 minute response time SLA', included: true },
      { label: 'Custom Security Reviews & BAA', tooltip: 'Full legal and security white-glove', included: true },
      { label: 'Annual Architecture Planning', tooltip: 'Bi-annual roadmap influence', included: true }
    ]
  }
];

export const TierComparisonCards: React.FC = () => {
  const {
    calculation,
    recommendedTierId,
    billingInterval,
    formatCents,
    setSelectedPlan,
    selectedPlan
  } = usePricingCalculator();

  const { incrementSandboxAction } = useMarketingStore();

  const handleSelectTier = (tierId: PlanTierId) => {
    setSelectedPlan(tierId);
    incrementSandboxAction();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    const provisionDock = document.getElementById('instant-provision-dock');
    if (provisionDock) {
      provisionDock.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
      {STATIC_TIERS.map((tierMeta) => {
        const isRecommended = tierMeta.id === recommendedTierId;
        const calcTier = calculation.tiers.find((t) => t.id === tierMeta.id);

        const priceCents = calcTier
          ? billingInterval === 'annual'
            ? calcTier.annualPricePerMonthCents
            : calcTier.monthlyPriceCents
          : 0;

        const formattedPrice = formatCents(priceCents);

        return (
          <div
            key={tierMeta.id}
            className={`relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
              isRecommended
                ? 'bg-[#0D111C] border-2 border-indigo-500 shadow-2xl shadow-indigo-600/30 lg:-translate-y-3 z-10'
                : 'bg-[#0D111C]/80 border border-white/10 hover:border-white/20'
            }`}
          >
            {/* Top Recommended Spotlight Badge */}
            {isRecommended && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-indigo-600 text-white font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-indigo-600/50">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Recommended For Your Volume</span>
              </div>
            )}

            {/* Plan Header & Price Readout */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white tracking-tight">{tierMeta.name}</h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                  {tierMeta.badge}
                </span>
              </div>

              <p className="text-xs text-slate-400 min-h-[34px] leading-relaxed">
                {tierMeta.tagline}
              </p>

              {/* Dynamic Number Price Readout */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight transition-all">
                    {formattedPrice}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ month</span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {billingInterval === 'annual'
                    ? `Billed annually (${formatCents(priceCents * 12)}/yr)`
                    : 'Billed month-to-month'}
                </div>

                {/* Overages notice if configured volume exceeds base inclusion */}
                {calcTier && (calcTier.extraSeatCostCents > 0 || calcTier.extraEventsCostCents > 0) && (
                  <div className="mt-2 text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                    Includes {formatCents(calcTier.extraSeatCostCents + calcTier.extraEventsCostCents)} volume overage
                  </div>
                )}
              </div>

              {/* Feature Checklist */}
              <div className="pt-4 space-y-2.5 text-xs">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  What’s Included:
                </div>
                {tierMeta.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5">
                    {feat.included ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={feat.included ? 'text-slate-300' : 'text-slate-500 line-through'}
                    >
                      {feat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-4 border-t border-white/10">
              <button
                onClick={() => handleSelectTier(tierMeta.id)}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  isRecommended
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <span>{isRecommended ? 'Select Recommended Plan' : `Choose ${tierMeta.name}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
