import React from 'react';
import { User, Mail, Phone, Globe, Sparkles } from 'lucide-react';
import { DraftPayload } from '../../types/index.ts';
import { LinkHealthBadge } from '../common/LinkHealthBadge.tsx';
import { GithubIcon } from '../common/BrandIcons.tsx';

interface FormStepIdentityProps {
  data: DraftPayload['identity'];
  onChange: (fields: Partial<DraftPayload['identity']>) => void;
  onFocusField: (fieldKey: string) => void;
  onBlurField: () => void;
  summary?: string;
  onSummaryChange?: (summary: string) => void;
}

export const FormStepIdentity: React.FC<FormStepIdentityProps> = ({
  data,
  onChange,
  onFocusField,
  onBlurField,
  summary,
  onSummaryChange
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-divider-light dark:border-divider-dark pb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Candidate Identity & Verified Profiles
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Auto-filled from your uploaded resume. Click any field to highlight its source on the left.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={data.fullName}
              onFocus={() => onFocusField('identity.fullName')}
              onBlur={onBlurField}
              onChange={e => onChange({ fullName: e.target.value })}
              placeholder="e.g. Alex Rivera"
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={data.email}
              onFocus={() => onFocusField('identity.email')}
              onBlur={onBlurField}
              onChange={e => onChange({ email: e.target.value })}
              placeholder="you@domain.com"
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={data.phone}
              onFocus={() => onFocusField('identity.phone')}
              onBlur={onBlurField}
              onChange={e => onChange({ phone: e.target.value })}
              placeholder="+1 (415) 890-4412"
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Current Timezone
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={data.timezone}
              onFocus={() => onFocusField('identity.timezone')}
              onBlur={onBlurField}
              onChange={e => onChange({ timezone: e.target.value })}
              placeholder="America/Los_Angeles"
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>
      </div>

      {/* Verified Online Links with Live Ping Sentinels */}
      <div className="pt-2 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              GitHub Profile / Code Samples
            </label>
            <LinkHealthBadge url={data.githubUrl} />
          </div>
          <div className="relative">
            <GithubIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={data.githubUrl}
              onFocus={() => onFocusField('identity.githubUrl')}
              onBlur={onBlurField}
              onChange={e => onChange({ githubUrl: e.target.value })}
              placeholder="https://github.com/username"
              className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Personal Portfolio / Read.cv / Case Studies
            </label>
            <LinkHealthBadge url={data.portfolioUrl} />
          </div>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={data.portfolioUrl}
              onFocus={() => onFocusField('identity.portfolioUrl')}
              onBlur={onBlurField}
              onChange={e => onChange({ portfolioUrl: e.target.value })}
              placeholder="https://yourportfolio.design"
              className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {onSummaryChange && (
        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Executive Summary / Elevator Pitch
          </label>
          <textarea
            rows={3}
            value={summary || ''}
            onFocus={() => onFocusField('identity.summary')}
            onBlur={onBlurField}
            onChange={e => onSummaryChange(e.target.value)}
            placeholder="Brief technical intro..."
            className="w-full px-3 py-2 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
          />
        </div>
      )}
    </div>
  );
};
