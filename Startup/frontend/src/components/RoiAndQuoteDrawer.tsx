import React, { useState } from 'react';
import { usePricingCalculator } from '../hooks/usePricingCalculator.js';
import { useMarketingStore } from '../store/marketingStore.js';
import { generateQuoteApi } from '../api/client.js';
import {
  FileText,
  Share2,
  Check,
  Copy,
  DollarSign,
  Clock,
  ShieldCheck,
  TrendingUp,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RoiAndQuoteDrawer: React.FC = () => {
  const {
    calculation,
    seats,
    eventsK,
    billingInterval,
    directMonthlySavings,
    directAnnualSavings,
    hoursSavedMonthly,
    totalAnnualValue,
    recommendedTierId
  } = usePricingCalculator();

  const { isCfoModalOpen, setIsCfoModalOpen, activeQuote, setActiveQuote, incrementSandboxAction } =
    useMarketingStore();

  const [companyName, setCompanyName] = useState('Acme Corp');
  const [email, setEmail] = useState('cfo@acme.dev');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleOpenCfoModal = () => {
    setIsCfoModalOpen(true);
    incrementSandboxAction();
  };

  const handleGenerateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await generateQuoteApi({
        companyName,
        email,
        planTier: recommendedTierId,
        billingInterval,
        seats,
        eventsK,
        currency: 'USD'
      });

      setActiveQuote(res.quote);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Failed to generate quote', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyQuoteLink = () => {
    if (!activeQuote) return;
    const fullUrl = `${window.location.origin}/quote/${activeQuote.id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Full-width ROI Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/60 via-[#0D111C] to-cyan-950/40 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Summary */}
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Projected Annual Savings vs. Fragmented Status Quo</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Save <span className="text-emerald-400">{directAnnualSavings}</span> in Direct Cloud Spend
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {calculation.roi.competitorComparisonSummary}
            </p>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono">
                <div className="text-[10px] text-slate-400">DIRECT SAVINGS</div>
                <div className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
                  {directMonthlySavings}/mo
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono">
                <div className="text-[10px] text-slate-400">ENGINEERING HOURS</div>
                <div className="text-base sm:text-lg font-bold text-cyan-400 mt-0.5">
                  +{hoursSavedMonthly} hrs/mo
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono">
                <div className="text-[10px] text-slate-400">ANNUAL CAPITAL ROI</div>
                <div className="text-base sm:text-lg font-bold text-indigo-300 mt-0.5">
                  {totalAnnualValue}
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end justify-center space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <button
              onClick={handleOpenCfoModal}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              <span>Export CFO-Ready Quote</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400 text-center md:text-right">
              Generates a 30-day shareable budget approval link
            </span>
          </div>
        </div>
      </div>

      {/* CFO Quote Modal / Dialog */}
      {isCfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0D111C] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              onClick={() => setIsCfoModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium mb-2">
                <FileText className="w-3.5 h-3.5" /> CFO-Ready Executive Proposal
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Itemized Budget Approval & Quote Generator
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Share this cryptographically timestamped link with your finance, procurement, and legal leads.
              </p>
            </div>

            {/* If Quote is not yet generated, show prompt form */}
            {!activeQuote ? (
              <form onSubmit={handleGenerateQuote} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Company Legal Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Global Inc."
                      className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300">Work Email (for Quote Copy)</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="finance@acme.com"
                      className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-2 text-xs font-mono">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Current Configuration Snapshot:
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Plan Tier:</span>
                    <span className="text-white font-bold capitalize">{recommendedTierId}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Team Seats:</span>
                    <span>{seats} Seats</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Pipeline Events:</span>
                    <span>{eventsK.toLocaleString()}k events/mo</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Cadence:</span>
                    <span className="capitalize">{billingInterval}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-white/10">
                    <span>Calculated Direct Savings:</span>
                    <span>{directAnnualSavings} / year</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating Secure Quote...' : 'Generate 30-Day CFO Quote URL'}</span>
                </button>
              </form>
            ) : (
              /* If quote generated, show shareable card */
              <div className="space-y-5">
                <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400">QUOTE IDENTIFIER</span>
                      <div className="text-sm font-bold text-white">{activeQuote.id}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                      ✓ Valid for 30 Days
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px]">ORGANIZATION:</span>
                      <div className="font-semibold text-white">{activeQuote.companyName}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">SELECTED TIER:</span>
                      <div className="font-semibold text-white uppercase">{activeQuote.planTier}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">EFFECTIVE COST:</span>
                      <div className="font-semibold text-white">
                        ${Math.round(activeQuote.effectiveMonthlyCents / 100)}/mo
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">PROJECTED SAVINGS:</span>
                      <div className="font-bold text-emerald-400">
                        ${Math.round(activeQuote.savingsAnnualCents / 100).toLocaleString()}/yr
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shareable Link Bar */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300">Shareable Quote URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/quote/${activeQuote.id}`}
                      className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-300 text-xs font-mono select-all focus:outline-none"
                    />
                    <button
                      onClick={handleCopyQuoteLink}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> SOC2 Compliant & Legal Signed
                  </span>
                  <button
                    onClick={() => setActiveQuote(null)}
                    className="text-indigo-400 hover:underline"
                  >
                    Generate another quote
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
