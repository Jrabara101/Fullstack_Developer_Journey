import React, { useState } from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import { checkWorkspaceSlug, provisionWorkspaceApi } from '../api/client.js';
import { EnterpriseBookerModal } from './EnterpriseBookerModal.js';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const InstantProvisionCtaDock: React.FC = () => {
  const {
    workspaceSlugInput,
    setWorkspaceSlugInput,
    selectedPlan,
    billingInterval,
    seats,
    eventsK,
    activePersonaLens,
    visitedPersonas,
    sandboxActionsCount,
    sessionStartTime,
    setIsEnterpriseModalOpen,
    incrementSandboxAction
  } = useMarketingStore();

  const [email, setEmail] = useState('');
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
    suggestions?: string[];
  }>({ checking: false });

  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState<{
    workspaceSlug: string;
    workspaceUrl: string;
    magicLinkUrl: string;
    message: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  const handleSlugInput = async (val: string) => {
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
        message: res.available ? res.message : res.reason,
        suggestions: res.suggestions
      });
    } catch {
      setSlugStatus({
        checking: false,
        available: true,
        message: '✓ Available! Ready to provision'
      });
    }
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceSlugInput || workspaceSlugInput.length < 3 || !email) return;

    setIsProvisioning(true);
    incrementSandboxAction();

    try {
      const durationSec = Math.round((Date.now() - sessionStartTime) / 1000);

      const res = await provisionWorkspaceApi({
        email,
        workspaceSlug: workspaceSlugInput,
        selectedPlan,
        billingInterval,
        configuredSeats: seats,
        configuredEventsK: eventsK,
        activePersonaLens,
        sessionDurationSec: durationSec,
        visitedPersonas,
        sandboxActionsCount
      });

      setProvisionSuccess(res);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert(err.message || 'Provisioning failed. Please choose another slug.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleCopyMagicLink = () => {
    if (!provisionSuccess) return;
    navigator.clipboard.writeText(provisionSuccess.magicLinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="instant-provision-dock" className="py-24 relative bg-radial-bottom-aurora bg-grid-architectural">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0D111C] via-[#111728] to-[#0A0D17] border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 relative overflow-hidden">
          {/* Top Radial Glow Accent */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 blur-[130px] rounded-full pointer-events-none" />

          {!provisionSuccess ? (
            <div className="relative z-10 space-y-8 text-center max-w-2xl mx-auto">
              {/* Header */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dual-Velocity Provisioner · Sub-200ms Validation</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  Claim Your Pre-Seeded Workspace
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Lock in your team’s custom subdomain. We provision an isolated edge container with your selected{' '}
                  <span className="text-indigo-300 font-semibold uppercase">{selectedPlan}</span> plan and sandbox telemetry snapshot in under 3 seconds.
                </p>
              </div>

              {/* High-Conversion Claim Form */}
              <form onSubmit={handleProvisionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-left">
                  {/* Workspace Slug Input (7 Cols) */}
                  <div className="sm:col-span-7 space-y-1">
                    <label className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
                      <span>Desired Workspace Subdomain:</span>
                      {slugStatus.message && (
                        <span
                          className={`text-[10px] ${
                            slugStatus.available ? 'text-emerald-400 font-bold' : 'text-amber-400'
                          }`}
                        >
                          {slugStatus.message}
                        </span>
                      )}
                    </label>

                    <div className="flex items-center rounded-xl bg-[#06080F] border border-white/15 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 p-1 transition-all">
                      <span className="pl-3 pr-1 text-slate-500 text-xs font-mono select-none">
                        app.acme.dev/
                      </span>
                      <input
                        type="text"
                        required
                        value={workspaceSlugInput}
                        onChange={(e) => handleSlugInput(e.target.value)}
                        placeholder="my-company"
                        className="w-full bg-transparent py-2 pr-3 text-white text-xs font-mono placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    {/* Suggestions if claimed */}
                    {slugStatus.suggestions && slugStatus.suggestions.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-slate-400">
                        <span>Try:</span>
                        {slugStatus.suggestions.slice(0, 3).map((sug) => (
                          <button
                            type="button"
                            key={sug}
                            onClick={() => handleSlugInput(sug)}
                            className="text-indigo-400 underline hover:text-indigo-300"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Work Email (5 Cols) */}
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[11px] font-mono text-slate-300">
                      Work Email (Magic Link):
                    </label>
                    <div className="flex items-center rounded-xl bg-[#06080F] border border-white/15 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 p-1 transition-all">
                      <Mail className="w-4 h-4 text-slate-500 ml-3 mr-1 shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full bg-transparent py-2 pr-3 text-white text-xs font-mono placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Provision Button */}
                <button
                  type="submit"
                  disabled={isProvisioning || slugStatus.available === false}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isProvisioning
                      ? 'Spinning Up Edge Micro-Instance...'
                      : `Provision ${workspaceSlugInput ? workspaceSlugInput + '.launch.dev' : 'Workspace Free'} →`}
                  </span>
                </button>
              </form>

              {/* Guarantees Strip */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-white/10">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No Credit Card Required
                </span>
                <span>·</span>
                <span>Sub-3s Provisioning SLA</span>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setIsEnterpriseModalOpen(true)}
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  Need Custom VPC / Enterprise Review?
                </button>
              </div>
            </div>
          ) : (
            /* Celebratory Confirmation View */
            <div className="relative z-10 text-center py-6 space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  🎉 Workspace Claimed Successfully!
                </h3>
                <p className="text-sm text-slate-300">
                  Your isolated micro-instance is running live at{' '}
                  <span className="text-indigo-300 font-mono font-semibold">
                    {provisionSuccess.workspaceUrl}
                  </span>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#06080F] border border-white/10 space-y-3 font-mono text-xs text-left">
                <div className="flex justify-between text-slate-400 text-[11px] border-b border-white/5 pb-2">
                  <span>TELEMETRY SNAPSHOT</span>
                  <span className="text-emerald-400">✓ Attached</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Owner Email:</span>
                  <span className="text-white font-semibold">{email}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Selected Tier:</span>
                  <span className="text-indigo-400 font-bold uppercase">{selectedPlan}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Provisioned Slug:</span>
                  <span className="text-emerald-400 font-semibold">{provisionSuccess.workspaceSlug}</span>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-xs font-mono text-slate-300">Instant Access Magic Link:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={provisionSuccess.magicLinkUrl}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyMagicLink}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setProvisionSuccess(null);
                    setWorkspaceSlugInput('');
                  }}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
                >
                  Provision another workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EnterpriseBookerModal />
    </section>
  );
};
