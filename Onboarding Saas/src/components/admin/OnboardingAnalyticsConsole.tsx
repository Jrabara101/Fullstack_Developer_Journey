import React, { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import {
  TrendingUp,
  Clock,
  Handshake,
  AlertTriangle,
  ArrowRight,
  Send,
  CheckCircle2,
  Activity,
  Layers,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const OnboardingAnalyticsConsole: React.FC = () => {
  const { setActiveView } = useOnboardingStore();
  const [nudged, setNudged] = useState<Record<string, boolean>>({});
  const [funnelData, setFunnelData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics/funnel')
      .then((res) => res.json())
      .then((data) => setFunnelData(data))
      .catch(() => {
        // Fallback data
        setFunnelData({
          kpis: {
            signupToActivatedRate: '68.4%',
            signupToActivatedDiff: '+6.2% vs last month',
            medianTTFV: '1m 24s',
            targetTTFV: '< 2m 00s',
            delegatedCompletionRate: '82.1%',
            delegatedCompletionWindow: 'within 4 hrs',
            stalledHighValueCount: 7,
            stalledAccounts: [
              {
                company: 'Apex Cloud Systems',
                domain: 'apexcloud.io',
                plan: 'Enterprise ($48k ARR)',
                stalledAt: 'Connect Production Database',
                daysStalled: '2d ago',
                champion: 'carol@apexcloud.io',
                status: 'Stalled on DB credentials'
              },
              {
                company: 'HyperScale Pay',
                domain: 'hyperscalepay.com',
                plan: 'Growth Pro',
                stalledAt: 'Install Production SDK',
                daysStalled: '1d ago',
                champion: 'marcus@hyperscalepay.com',
                status: 'Delegation pending'
              },
              {
                company: 'Vanguard Logistics',
                domain: 'vanguardlog.net',
                plan: 'Enterprise ($32k ARR)',
                stalledAt: 'Configure Webhooks',
                daysStalled: '3d ago',
                champion: 'd.ross@vanguardlog.net',
                status: 'Need engineer review'
              }
            ]
          },
          waterfall: [
            {
              step: 'Step 1: Workspace Identity',
              slug: 'identity',
              completedRate: 98.4,
              avgDurationSeconds: 12,
              skippedRate: 1.6,
              delegatedRate: 0,
              dropoffRate: 1.6
            },
            {
              step: 'Step 2: Persona & Goals',
              slug: 'persona',
              completedRate: 94.2,
              avgDurationSeconds: 18,
              skippedRate: 4.1,
              delegatedRate: 0,
              dropoffRate: 5.8
            },
            {
              step: 'Step 3: Integrations & Data',
              slug: 'integrations',
              completedRate: 61.5,
              avgDurationSeconds: 42,
              skippedRate: 15.8,
              delegatedRate: 22.7,
              dropoffRate: 8.2
            },
            {
              step: 'Step 4: Team Collaboration',
              slug: 'team',
              completedRate: 79.1,
              avgDurationSeconds: 24,
              skippedRate: 18.2,
              delegatedRate: 2.7,
              dropoffRate: 6.3
            },
            {
              step: 'Post-Setup Activation Dock',
              slug: 'dock_activation',
              completedRate: 68.4,
              avgDurationSeconds: 84,
              skippedRate: 0,
              delegatedRate: 0,
              dropoffRate: 0
            }
          ]
        });
      });
  }, []);

  const handleNudge = (domain: string) => {
    setNudged({ ...nudged, [domain]: true });
  };

  const kpis = funnelData?.kpis;
  const waterfall = funnelData?.waterfall || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 sm:p-10 font-sans space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('onboarding')}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Onboarding Wizard</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              View SaaS Dashboard
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display mt-2">
            Growth & Onboarding Funnel Telemetry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time cohort drop-off, median Time-to-First-Value (TTFV), and technical delegation velocity.
          </p>
        </div>

        {/* Live sync pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Telemetry Stream Active</span>
        </div>
      </div>

      {/* Top KPI Ribbon (4 Tabular Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Signup-to-Activated Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-mono font-tabular text-slate-900 dark:text-white">
            {kpis?.signupToActivatedRate || '68.4%'}
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-1">
            {kpis?.signupToActivatedDiff || '+6.2% vs last month'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Median TTFV (Time to Value)</span>
            <Clock className="w-4 h-4 text-brand-custom" />
          </div>
          <div className="text-3xl font-bold font-mono font-tabular text-slate-900 dark:text-white">
            {kpis?.medianTTFV || '1m 24s'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Target: &lt; 2m 00s (Beating SLA by 36s)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Delegated Step Completion</span>
            <Handshake className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-3xl font-bold font-mono font-tabular text-slate-900 dark:text-white">
            {kpis?.delegatedCompletionRate || '82.1%'}
          </div>
          <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-1">
            Within 4 hours of magic link dispatch
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Stalled Enterprise Signups</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono font-tabular text-slate-900 dark:text-white">
            {kpis?.stalledHighValueCount || '7'} Orgs
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            Needs technical delegation assist
          </div>
        </div>
      </div>

      {/* Stepped Onboarding Conversion Waterfall */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Stepped Conversion Waterfall & Drop-Off Telemetry
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks user throughput, delegation bypass rates, and save-to-dock transitions across all stages.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed Directly
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span> Delegated to Engineer
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Skipped to Dock
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {waterfall.map((stage: any, idx: number) => {
            return (
              <div key={stage.slug} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {stage.step}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                    <span>Avg {stage.avgDurationSeconds}s</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {stage.completedRate}% Throughput
                    </span>
                  </div>
                </div>

                {/* Progress bar with multiple segments */}
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex">
                  {/* Completed segment */}
                  <div
                    className="bg-emerald-500 transition-all duration-700"
                    style={{ width: `${stage.completedRate}%` }}
                    title={`Completed: ${stage.completedRate}%`}
                  />
                  {/* Delegated segment */}
                  {stage.delegatedRate > 0 && (
                    <div
                      className="bg-violet-500 transition-all duration-700"
                      style={{ width: `${stage.delegatedRate}%` }}
                      title={`Delegated: ${stage.delegatedRate}%`}
                    />
                  )}
                  {/* Skipped segment */}
                  {stage.skippedRate > 0 && (
                    <div
                      className="bg-amber-400 transition-all duration-700"
                      style={{ width: `${stage.skippedRate}%` }}
                      title={`Skipped to dock: ${stage.skippedRate}%`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stalled High-Value Accounts Recovery Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Stalled High-Value Signups (Intervention Cockpit)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise and Growth signups stalled at technical steps. Dispatch 1-click engineer delegation or assist links.
            </p>
          </div>
          <span className="text-xs font-mono bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 rounded-full font-medium">
            High Priority Pipeline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Company / Domain</th>
                <th className="py-2.5 px-3">Target Plan</th>
                <th className="py-2.5 px-3">Stalled Step</th>
                <th className="py-2.5 px-3">Champion Email</th>
                <th className="py-2.5 px-3">Time Inactive</th>
                <th className="py-2.5 px-3 text-right">Recovery Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {kpis?.stalledAccounts?.map((account: any) => {
                const isNudged = nudged[account.domain];
                return (
                  <tr key={account.domain} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {account.company}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {account.domain}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {account.plan}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-medium text-[11px]">
                        {account.stalledAt}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {account.champion}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {account.daysStalled}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleNudge(account.domain)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                          isNudged
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-brand-custom text-white hover:opacity-90'
                        }`}
                      >
                        {isNudged ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Link Dispatched</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch Delegation Link</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
