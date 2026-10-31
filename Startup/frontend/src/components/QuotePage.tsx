import React, { useEffect, useState } from 'react';
import { fetchQuoteById } from '../api/client.js';
import { QuoteRecord } from '../types/index.js';
import {
  FileText,
  CheckCircle2,
  Calendar,
  DollarSign,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  Printer,
  Sparkles,
  Zap
} from 'lucide-react';

export const QuotePage: React.FC<{ quoteId: string; onBack: () => void }> = ({
  quoteId,
  onBack
}) => {
  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadQuote() {
      try {
        setLoading(true);
        const res = await fetchQuoteById(quoteId);
        setQuote(res.quote);
      } catch (err: any) {
        setError(err.message || 'Quote not found or expired');
      } finally {
        setLoading(false);
      }
    }
    loadQuote();
  }, [quoteId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080F] flex items-center justify-center p-6 text-slate-400 font-mono text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>Retrieving verified CFO quote record...</span>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#06080F] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Quote Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          {error || 'The requested quote link may have expired or is invalid.'}
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </button>
      </div>
    );
  }

  const formatCents = (cents: number) => `$${Math.round(cents / 100).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-[#06080F] text-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Interactive Proving Ground</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#0D111C] hover:bg-[#151C2C] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share Quote Link'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Executive Proposal Invoice Card */}
        <div className="rounded-3xl bg-[#0D111C] border border-indigo-500/40 p-8 sm:p-12 shadow-2xl shadow-indigo-950/40 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold font-display text-xl mb-1">
                <Zap className="w-5 h-5 fill-indigo-400/20" />
                <span>Acme Cloud Executive Proposal</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Official Infrastructure & Cost-Efficiency Estimate
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <span className="text-slate-500 text-[10px]">DOCUMENT ID:</span>
              <div className="text-sm font-bold text-white">{quote.id}</div>
              <div className="text-emerald-400 text-[11px] font-semibold mt-0.5">
                ✓ Guaranteed Rate (Valid 30 Days)
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#06080F] border border-white/5 font-mono text-xs">
            <div>
              <span className="text-slate-500 text-[10px]">PREPARED FOR:</span>
              <div className="text-white font-semibold mt-0.5">{quote.companyName}</div>
              <div className="text-slate-400 text-[11px]">{quote.email}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">SELECTED TIER:</span>
              <div className="text-indigo-400 font-bold capitalize mt-0.5">{quote.planTier} Plan</div>
              <div className="text-slate-400 text-[11px]">Billed {quote.billingInterval}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">CONFIGURED CAPACITY:</span>
              <div className="text-white font-semibold mt-0.5">{quote.seats} Seats</div>
              <div className="text-slate-400 text-[11px]">{quote.eventsK.toLocaleString()}k events/mo</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">EXPIRES ON:</span>
              <div className="text-white font-semibold mt-0.5">
                {new Date(quote.expiresAt).toLocaleDateString()}
              </div>
              <div className="text-emerald-400 text-[11px]">Price Lock Active</div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-3 font-mono text-xs">
            <div className="text-slate-400 uppercase font-semibold text-[11px]">
              Itemized Financial Breakdown:
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#06080F] text-slate-400 text-[11px] border-b border-white/10">
                  <tr>
                    <th className="p-3">Resource Component</th>
                    <th className="p-3">Volume Allocation</th>
                    <th className="p-3 text-right">Effective Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-white">
                      {quote.planTier.toUpperCase()} Base Subscription
                    </td>
                    <td className="p-3 text-slate-400">Included Core Features</td>
                    <td className="p-3 text-right font-bold text-white">
                      {formatCents(quote.effectiveMonthlyCents)}/mo
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">Active Engineering Seats</td>
                    <td className="p-3 text-slate-400">{quote.seats} Authorized Users</td>
                    <td className="p-3 text-right text-emerald-400">Included in Tier</td>
                  </tr>
                  <tr>
                    <td className="p-3">Edge Pipeline Execution Volume</td>
                    <td className="p-3 text-slate-400">{quote.eventsK.toLocaleString()}k monthly runs</td>
                    <td className="p-3 text-right text-emerald-400">Included in Tier</td>
                  </tr>
                  <tr>
                    <td className="p-3">Global 35-Region Edge Mesh & Anycast</td>
                    <td className="p-3 text-slate-400">Unlimited Egress Bandwidth</td>
                    <td className="p-3 text-right text-emerald-400">$0.00 (Zero Markup)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ROI Executive Summary */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/30 border border-emerald-500/30 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Executive ROI & Capital Recovery Justification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-slate-400 text-[10px]">DIRECT INFRA SAVINGS:</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  {formatCents(quote.savingsAnnualCents)} / yr
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Vs. fragmented hyperscalers</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-slate-400 text-[10px]">ENGINEERING HOURS RECOVERED:</div>
                <div className="text-xl font-extrabold text-cyan-400 mt-0.5">
                  {quote.hoursSavedMonthly * 12} hrs / yr
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Dev pipeline toil eliminated</div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-slate-400 text-[10px]">TOTAL ANNUAL CAPITAL VALUE:</div>
                <div className="text-xl font-extrabold text-indigo-300 mt-0.5">
                  {formatCents(quote.savingsAnnualCents + quote.hoursSavedMonthly * 12 * 11000)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Recovered productivity capital</div>
              </div>
            </div>
          </div>

          {/* Governance & SLA Guarantees */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>SOC2 Type II Audited · ISO 27001 Certified · 99.999% Financial SLA</span>
            </div>
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
            >
              Activate This Workspace Rate →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
