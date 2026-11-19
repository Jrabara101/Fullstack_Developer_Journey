import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, Play, Clock, Sparkles, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { JobApplication, JobPosting } from '../../types/index.ts';
import { fetchApplications, fetchJobs } from '../../utils/api.ts';
import { getAllLocalDrafts } from '../../db/indexedDb.ts';
import { formatTimeAgo } from '../../utils/formatters.ts';

interface MultiApplicationHubProps {
  onResumeDraft: (application: JobApplication) => void;
  onOpenLiveTracker: (trackingCode: string) => void;
  onExploreMoreRoles: () => void;
}

export const MultiApplicationHub: React.FC<MultiApplicationHubProps> = ({
  onResumeDraft,
  onOpenLiveTracker,
  onExploreMoreRoles
}) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobsMap, setJobsMap] = useState<Record<string, JobPosting>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadHub() {
      try {
        setLoading(true);
        const [appRes, jobsRes, localDrafts] = await Promise.all([
          fetchApplications(),
          fetchJobs(),
          getAllLocalDrafts()
        ]);

        if (!mounted) return;

        const map: Record<string, JobPosting> = {};
        jobsRes.jobs.forEach(j => {
          map[j.id] = j;
        });
        setJobsMap(map);
        setApplications(appRes.applications);
      } catch (err) {
        console.error('Failed to load candidate hub:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHub();

    return () => {
      mounted = false;
    };
  }, []);

  const drafts = applications.filter(a => a.status === 'draft');
  const activeApplications = applications.filter(a => a.status !== 'draft');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
            My Applications & Saved Drafts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply Once, Reuse Everywhere. Your baseline profile and work history are preserved across roles.
          </p>
        </div>

        <button
          onClick={onExploreMoreRoles}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>Explore Open Roles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section 1: In-Progress Drafts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>In-Progress Drafts ({drafts.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Zero-loss dual-layer persistence active
          </span>
        </div>

        {drafts.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark text-xs text-slate-400">
            No active drafts. Start an application to experience instant auto-fill and auto-save!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.map(draft => {
              const job = jobsMap[draft.jobId];

              return (
                <div
                  key={draft.id}
                  className="rounded-2xl border border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark p-5 shadow-xs hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                      <span>{draft.trackingCode}</span>
                      <span>Saved {formatTimeAgo(draft.lastAutosavedAt || draft.draftPayload?.updatedAt)}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {job?.title || 'Engineering Role'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {job?.department || 'Atelier Labs'}
                    </p>

                    {/* Progress indicator */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {draft.completionPercent}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full"
                          style={{ width: `${draft.completionPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onResumeDraft(draft)}
                    className="w-full py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-brand-500/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume Application</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Active & Past Submitted Applications */}
      <div className="space-y-4 pt-4 border-t border-divider-light dark:border-divider-dark">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>Active Applications ({activeApplications.length})</span>
        </h3>

        <div className="space-y-3">
          {activeApplications.map(app => {
            const job = jobsMap[app.jobId];
            const isOffer = app.status === 'offer_extended';

            return (
              <div
                key={app.id}
                onClick={() => onOpenLiveTracker(app.trackingCode)}
                className="p-5 rounded-2xl border border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark hover:border-brand-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {app.trackingCode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                        isOffer
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {job?.title || 'Staff Frontend Engineer'} — {job?.companyName || 'Atelier Labs'}
                  </h4>

                  <p className="text-xs text-slate-500">
                    Stage {app.currentStageIndex + 1} of 6 • SLA target:{' '}
                    {app.slaInfo?.dueFormatted || 'Within 5 business days'}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Live Tracker</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
