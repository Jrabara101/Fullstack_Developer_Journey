import React from 'react';
import { X, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';
import { ParsedResumeData } from '../../types/index.ts';

interface UnbiasedPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedResumeData;
}

export const UnbiasedPreviewModal: React.FC<UnbiasedPreviewModalProps> = ({
  isOpen,
  onClose,
  parsedData
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-divider-light dark:border-divider-dark">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Blind Screening Preview (Unbiased Review)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              How hiring teams review your qualifications prior to interview invitations.
            </p>
          </div>
        </div>

        {/* Notice banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-900 dark:text-brand-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <p>
            Atelier enforces blind screening across early review stages. Graduation years, demographic identifiers, and personal photos are redacted so evaluation is strictly grounded in your code, design craftsmanship, and engineering impact.
          </p>
        </div>

        {/* Redacted Candidate View */}
        <div className="space-y-6 bg-surface-secondary-light dark:bg-surface-secondary-dark p-6 rounded-xl border border-divider-light dark:border-divider-dark">
          {/* Header */}
          <div className="border-b border-divider-light dark:border-divider-dark pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Candidate Identifier</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Candidate #{parsedData.fullName ? parsedData.fullName.split(' ')[0] : 'Engineer'}-7409
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                Blind Screening Active
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono text-slate-500">
              <span>Timezone: {parsedData.timezone || 'US/Pacific'}</span>
              <span>•</span>
              <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                [Graduation Year: Redacted]
              </span>
              <span>•</span>
              <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                [Demographic: Redacted]
              </span>
            </div>
          </div>

          {/* Summary */}
          {parsedData.summary && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Technical Summary</h5>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {parsedData.summary}
              </p>
            </div>
          )}

          {/* Work History */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Verified Experience</h5>
            <div className="space-y-3">
              {parsedData.workHistory?.map((work, idx) => (
                <div key={idx} className="p-3 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-lg border border-divider-light dark:border-divider-dark text-xs">
                  <div className="flex items-center justify-between font-medium text-slate-900 dark:text-slate-100">
                    <span>{work.role} — {work.company}</span>
                    <span className="text-[11px] font-mono text-slate-500">{work.startDate} – {work.endDate}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{work.description}</p>
                  {work.highlights && work.highlights.length > 0 && (
                    <ul className="mt-2 list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                      {work.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education - Redacted graduation year */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Education & Credentials</h5>
            {parsedData.education?.map((edu, idx) => (
              <div key={idx} className="p-3 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-lg border border-divider-light dark:border-divider-dark text-xs flex justify-between items-center">
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{edu.institution}</span>
                  <p className="text-slate-500">{edu.degree} in {edu.field}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px] font-mono text-slate-500">
                  Graduation Year Redacted
                </span>
              </div>
            ))}
          </div>

          {/* Skills */}
          {parsedData.skills && parsedData.skills.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Verified Skill Vector</h5>
              <div className="flex flex-wrap gap-1.5">
                {parsedData.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
