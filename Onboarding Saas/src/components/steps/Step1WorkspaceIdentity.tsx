import React, { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Sparkles, Check, Globe, Building2, UploadCloud, CheckCircle2, FlaskConical, ShieldCheck, RefreshCw } from 'lucide-react';

const SWATCHES = [
  { name: 'Electric Indigo', hex: '#4F46E5' },
  { name: 'Vibrant Emerald', hex: '#10B981' },
  { name: 'Electric Cobalt', hex: '#2563EB' },
  { name: 'Royal Violet', hex: '#7C3AED' },
  { name: 'Rose Ruby', hex: '#F43F5E' },
  { name: 'Warm Amber', hex: '#F59E0B' },
];

export const Step1WorkspaceIdentity: React.FC = () => {
  const {
    workspaceDraft,
    setWorkspaceDraft,
    setBrandColor,
    enrichedCompany,
    autoEnrichDismissed,
    dismissEnrichment,
    enrichDomain,
    isEnriching,
    toggleSampleData,
    completeCurrentStep
  } = useOnboardingStore();

  const [emailInput, setEmailInput] = useState('alex@vercel.com');
  const [manualEdit, setManualEdit] = useState(false);

  // Automatically trigger enrichment for initial work email on mount
  useEffect(() => {
    if (!enrichedCompany && !autoEnrichDismissed) {
      enrichDomain('alex@vercel.com');
    }
  }, []);

  const handleDomainLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      enrichDomain(emailInput);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setWorkspaceDraft({ slug: raw });
  };

  return (
    <div className="w-full space-y-7 animate-in fade-in duration-300">
      {/* 1. Zero-Input Corporate Domain Auto-Enrichment Banner */}
      {enrichedCompany && !autoEnrichDismissed && !manualEdit && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 p-4 transition-all shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-emerald-500/30 p-1 flex items-center justify-center overflow-hidden shadow-xs">
                {enrichedCompany.logoUrl ? (
                  <img
                    src={enrichedCompany.logoUrl}
                    alt={enrichedCompany.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Auto-enriched from @{enrichedCompany.domain}
                  </span>
                  <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded-full font-mono">
                    140ms
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Pre-populated <strong className="text-slate-800 dark:text-slate-200">{enrichedCompany.name}</strong>, brand palette & {enrichedCompany.teamSize}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setManualEdit(true)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                Edit Manually
              </button>
              <button
                type="button"
                onClick={completeCurrentStep}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1 transition-all"
              >
                <span>Looks right, continue</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Domain Lookup Bar (If user wants to test other domains like stripe.com, linear.app, ramp.com) */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 w-full sm:w-auto">
          <Globe className="w-4 h-4 text-brand-custom shrink-0" />
          <span>Test corporate auto-enrichment:</span>
        </div>
        <form onSubmit={handleDomainLookup} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="e.g. dev@stripe.com"
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs w-full sm:w-44 focus:ring-1 focus:ring-brand-custom focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={isEnriching}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-medium hover:opacity-90 flex items-center gap-1 shrink-0 transition-opacity"
          >
            {isEnriching ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Enrich'}
          </button>
        </form>
      </div>

      {/* Step Title & Subtext */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Name & brand your workspace
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          This is the primary home for your team, API telemetry, and active project workflows.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Company or Workspace Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={workspaceDraft.name}
              onChange={(e) => setWorkspaceDraft({ name: e.target.value })}
              placeholder="e.g. Acme Corporation"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-custom focus:border-brand-custom focus:outline-none transition-all shadow-xs"
            />
            <Building2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>
        </div>

        {/* Workspace URL / Slug */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Workspace URL Slug
            </label>
            <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Available for immediate claim
            </span>
          </div>
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 overflow-hidden focus-within:ring-2 focus-within:ring-brand-custom focus-within:border-brand-custom transition-all shadow-xs">
            <span className="inline-flex items-center px-3.5 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-500">
              acme.app/
            </span>
            <input
              type="text"
              value={workspaceDraft.slug}
              onChange={handleSlugChange}
              placeholder="workspace-slug"
              className="w-full px-3 py-2 text-sm text-slate-900 dark:text-white font-mono bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Brand Accent Palette Swatches */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Brand Accent Color
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              Cascades live to the preview canvas
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {SWATCHES.map((swatch) => {
              const isSelected = workspaceDraft.brandColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => setBrandColor(swatch.hex)}
                  title={swatch.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-xs ${
                    isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-105' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              );
            })}
            
            {/* Custom hex input */}
            <div className="flex items-center gap-1.5 ml-2 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-xs font-mono">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: workspaceDraft.brandColor }} />
              <input
                type="text"
                value={workspaceDraft.brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-16 bg-transparent font-mono text-xs uppercase focus:outline-none text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Anti-Empty-State Sample Data Sandbox Toggle */}
        <div className="pt-2">
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-brand-custom shrink-0 mt-0.5">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Anti-Empty-State Sample Data Sandbox
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 px-1.5 py-0.2 rounded font-medium">
                      Zero Cold-Start
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pre-populates realistic metrics, webhooks, and pipeline demo events. You can cleanly purge all sample records in 1-click once inside the app.
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => toggleSampleData(!workspaceDraft.hasSampleData)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  workspaceDraft.hasSampleData ? 'bg-brand-custom' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    workspaceDraft.hasSampleData ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
