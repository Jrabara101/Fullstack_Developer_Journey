import React from 'react';
import { CheckCircle2, ShieldCheck, EyeOff, FileText, ArrowRight, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { DraftPayload, JobPosting, ResumeVersion } from '../../types/index.ts';

interface FormStepReviewProps {
  job: JobPosting;
  draft: DraftPayload;
  resume: ResumeVersion | null;
  onOpenUnbiasedModal: () => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const FormStepReview: React.FC<FormStepReviewProps> = ({
  job,
  draft,
  resume,
  onOpenUnbiasedModal,
  isSubmitting,
  onSubmit
}) => {
  const { identity, workHistory, screeningAnswers } = draft;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-divider-light dark:border-divider-dark pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Review & Final Submission
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verify your information before submitting to the {job.companyName} hiring team.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenUnbiasedModal}
          className="px-3 py-1.5 rounded-xl text-xs font-medium border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
        >
          <EyeOff className="w-3.5 h-3.5 text-indigo-500" />
          <span>Preview Blind Review</span>
        </button>
      </div>

      {/* SLA Commitment Reassurance Card */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
        <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-emerald-900 dark:text-emerald-200">
            Respectful Anti-Ghosting SLA Guarantee
          </p>
          <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-400">
            {job.companyName} guarantees a substantive review of your application within{' '}
            <strong className="text-slate-900 dark:text-slate-100">{job.slaBusinessDays} business days</strong>.
            You will be able to track every stage live on your personalized Domino&apos;s-style status dashboard.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Candidate & Links Summary */}
        <div className="p-4 rounded-xl bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark space-y-2">
          <div className="flex items-center justify-between border-b border-divider-light dark:border-divider-dark pb-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Candidate Identity</span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">Verified ✓</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Name:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{identity.fullName || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Email:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{identity.email || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">GitHub / Code:</span>
              <span className="font-mono text-[11px] text-brand-600 dark:text-brand-400 truncate block">
                {identity.githubUrl || 'None'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Portfolio:</span>
              <span className="font-mono text-[11px] text-brand-600 dark:text-brand-400 truncate block">
                {identity.portfolioUrl || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Resume Version Summary */}
        <div className="p-4 rounded-xl bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                Attached Document
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {resume?.fileName || 'Alex_Rivera_Staff_FE_2026.pdf'} • Parsed with 100% fidelity
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            6/6 Core Skills Matched
          </span>
        </div>

        {/* Screening Responses Summary */}
        <div className="p-4 rounded-xl bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark space-y-3">
          <div className="border-b border-divider-light dark:border-divider-dark pb-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Screening Answers</span>
          </div>
          {job.screeningQuestions.map((q, i) => (
            <div key={q.id} className="text-xs space-y-1">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {i + 1}. {q.question}
              </p>
              <p className="text-slate-600 dark:text-slate-400 italic bg-surface-secondary-light dark:bg-surface-secondary-dark p-2.5 rounded-lg border border-divider-light dark:border-divider-dark line-clamp-3">
                &ldquo;{screeningAnswers[q.id] || 'No answer provided'}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Trigger */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-divider-light dark:border-divider-dark">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>All data encrypted. You can withdraw or update your resume anytime.</span>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application Now'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
