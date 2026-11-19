import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Mail,
  ChevronRight,
  FileText
} from 'lucide-react';
import { JobApplication, JobPosting, StageEvent } from '../../types/index.ts';
import { fetchApplications, advanceApplicationStage, fetchJobBySlug } from '../../utils/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface RecruiterPipelineBoardProps {
  onViewCandidateLiveTracker: (trackingCode: string) => void;
}

export const RecruiterPipelineBoard: React.FC<RecruiterPipelineBoardProps> = ({
  onViewCandidateLiveTracker
}) => {
  const { success, error, info } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalApplicants: 0,
    unreviewedCount: 0,
    slaBreachedCount: 0,
    inInterviewCount: 0,
    avgTimeToFirstReviewHours: 18
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [customRejectText, setCustomRejectText] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetchApplications();
      setApplications(res.applications);
      setMetrics(res.metrics);
    } catch (err) {
      console.error('Failed to load recruiter board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'sla_breached') return app.slaInfo?.isBreached;
    if (selectedFilter === 'unreviewed') return !app.recruiterViewedAt;
    if (selectedFilter === 'interviews') return ['recruiter_screen', 'technical_interview', 'onsite'].includes(app.status);
    return app.status === selectedFilter;
  });

  const selectedCandidate = filteredApplications[selectedIndex] || filteredApplications[0];

  // Stage Advance handler
  const handleAdvance = async (targetStage: string, stageIndex: number, publicMsg: string) => {
    if (!selectedCandidate) return;
    try {
      await advanceApplicationStage(selectedCandidate.id, {
        targetStage,
        targetStageIndex: stageIndex,
        publicMessage: publicMsg,
        internalNote: `Recruiter triage advanced candidate to ${targetStage}`
      });
      success(`Candidate Advanced!`, `${selectedCandidate.draftPayload?.identity?.fullName || 'Candidate'} moved to ${targetStage.replace('_', ' ')}.`);
      loadApplications();
    } catch (err: any) {
      error('Failed to advance', err.message);
    }
  };

  // Keyboard navigation shortcuts (J/K to navigate, A to advance, R to reject, S to scheduler)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in textarea or input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(filteredApplications.length - 1, prev + 1));
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (selectedCandidate) {
          handleAdvance(
            'technical_interview',
            3,
            'Advanced to Technical Deep-Dive! Please select a 45-minute calendar slot.'
          );
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setRejectModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredApplications, selectedCandidate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      {/* Top Header & SLA Watchdog Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
              Recruiter SLA Governance & Triage Cockpit
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Keyboard-driven triage: <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">J</kbd>/<kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">K</kbd> Navigate • <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">A</kbd> Advance • <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">R</kbd> Constructive Pass
          </p>
        </div>

        {/* Live Ribbon Metrics */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark shadow-xs text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Total Candidates</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {metrics.totalApplicants || applications.length}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark shadow-xs text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Unreviewed</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {metrics.unreviewedCount}
            </span>
          </div>

          <div className={`px-3.5 py-2 rounded-xl border shadow-xs text-xs ${
            metrics.slaBreachedCount > 0
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200 animate-pulse'
              : 'bg-surface-elevated-light dark:bg-surface-elevated-dark border-divider-light dark:border-divider-dark'
          }`}>
            <span className="block text-[10px] uppercase font-mono">
              ⚠️ SLA Watchdog ({metrics.slaBreachedCount})
            </span>
            <span className="font-mono font-bold tabular-nums">
              {metrics.slaBreachedCount > 0 ? `${metrics.slaBreachedCount} Action Needed` : 'Zero Breaches'}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark shadow-xs text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Avg Time to First Review</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {metrics.avgTimeToFirstReviewHours}h (Target &le; 24h)
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-divider-light dark:border-divider-dark pb-2 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'All Candidates' },
          { id: 'sla_breached', label: `⚠️ SLA Approaching / Breached (${metrics.slaBreachedCount})` },
          { id: 'unreviewed', label: `Unreviewed (${metrics.unreviewedCount})` },
          { id: 'interviews', label: 'In Interviews' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedFilter(tab.id);
              setSelectedIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedFilter === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Split-Pane Review Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Candidate Queue (4 Columns) */}
        <div className="lg:col-span-4 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-2xl border border-divider-light dark:border-divider-dark p-3 space-y-2 max-h-[750px] overflow-y-auto">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No candidates matching this filter.
            </div>
          ) : (
            filteredApplications.map((app, index) => {
              const isSelected = selectedIndex === index;
              const isBreached = app.slaInfo?.isBreached;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/10 shadow-xs'
                      : 'border-divider-light dark:border-divider-dark hover:border-slate-300 dark:hover:border-slate-700 bg-surface-secondary-light dark:bg-surface-secondary-dark'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {app.draftPayload?.identity?.fullName || 'Anonymous Candidate'}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {app.trackingCode}
                      </p>
                    </div>

                    {/* Skill Match pill */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {app.skillMatchScore}% Match
                    </span>
                  </div>

                  {/* Stage & SLA Alert */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {app.status.replace('_', ' ')}
                    </span>

                    {isBreached ? (
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        SLA Breached ({app.slaInfo?.daysInStage}d)
                      </span>
                    ) : (
                      <span className="font-mono text-slate-400">
                        {app.slaInfo?.daysInStage || 1}d in stage
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Center / Right Candidate Deep-Dive & Action Dock (8 Columns) */}
        {selectedCandidate ? (
          <div className="lg:col-span-8 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-2xl border border-divider-light dark:border-divider-dark p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Candidate Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider-light dark:border-divider-dark pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {selectedCandidate.draftPayload?.identity?.fullName}
                    </h2>
                    <span className="text-xs font-mono bg-surface-secondary-light dark:bg-surface-secondary-dark px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                      {selectedCandidate.trackingCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedCandidate.draftPayload?.identity?.email} • {selectedCandidate.draftPayload?.identity?.timezone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewCandidateLiveTracker(selectedCandidate.trackingCode)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium border border-divider-light dark:border-divider-dark bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand-500" />
                    <span>View Candidate Portal ↗</span>
                  </button>
                </div>
              </div>

              {/* Links & Portfolio */}
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                {selectedCandidate.draftPayload?.identity?.githubUrl && (
                  <a
                    href={selectedCandidate.draftPayload.identity.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>GitHub: {selectedCandidate.draftPayload.identity.githubUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedCandidate.draftPayload?.identity?.portfolioUrl && (
                  <a
                    href={selectedCandidate.draftPayload.identity.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>Portfolio: {selectedCandidate.draftPayload.identity.portfolioUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Parsed Work Experience snippet */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Extracted Work History
                </h4>
                <div className="space-y-2">
                  {selectedCandidate.draftPayload?.workHistory?.map((w, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-secondary-light dark:bg-surface-secondary-dark text-xs">
                      <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                        <span>{w.role} @ {w.company}</span>
                        <span className="font-mono text-[11px] text-slate-500">{w.startDate} – {w.endDate}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{w.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screening Answers */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Screening Responses
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedCandidate.screeningAnswers || selectedCandidate.draftPayload?.screeningAnswers || {}).map(([key, val], i) => (
                    <div key={key} className="p-3 rounded-xl bg-surface-secondary-light dark:bg-surface-secondary-dark text-xs space-y-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Question {i + 1}:</span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">&ldquo;{val}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage Transition Action Dock */}
            <div className="pt-4 border-t border-divider-light dark:border-divider-dark flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-mono">
                Current Stage: <strong className="text-slate-900 dark:text-slate-100">{selectedCandidate.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-divider-light dark:border-divider-dark text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Constructive Pass (R)</span>
                </button>

                <button
                  onClick={() =>
                    handleAdvance(
                      'technical_interview',
                      3,
                      'Advanced to Technical Deep-Dive! Please select a 45-minute calendar slot.'
                    )
                  }
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Send Scheduler Link (A)</span>
                </button>

                <button
                  onClick={() =>
                    handleAdvance(
                      'offer_extended',
                      5,
                      '🎊 Congratulations! Offer package extended by VP of People and VP of Engineering.'
                    )
                  }
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extend Offer</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Constructive Pass / Rejection Modal */}
      {rejectModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Send Constructive Decision Pass
            </h3>
            <p className="text-xs text-slate-500">
              Atelier policy requires respectful, feedback-oriented messaging so candidates are never ghosted.
            </p>

            <textarea
              rows={4}
              defaultValue="Thank you sincerely for your time and walkthrough. While we are proceeding with another candidate whose recent focus closely aligns with this phase of our token architecture, we were deeply impressed by your experience and would love to stay in touch."
              onChange={e => setCustomRejectText(e.target.value)}
              className="w-full p-3 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await advanceApplicationStage(selectedCandidate.id, {
                      targetStage: 'rejected',
                      publicMessage: customRejectText || 'Thank you for your application. We have decided to move forward with other candidates at this time.',
                      internalNote: 'Candidate passed with constructive template'
                    });
                    success('Constructive decision sent', 'Candidate tracker updated respectfully.');
                    setRejectModalOpen(false);
                    loadApplications();
                  } catch (e: any) {
                    error('Failed', e.message);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Send Decision & Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
