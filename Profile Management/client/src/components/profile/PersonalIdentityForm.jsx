import React, { useState, useEffect } from 'react';
import {
  User, AtSign, Briefcase, FileText, Globe, CheckCircle2, XCircle, Loader2, Link2
} from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '../common/BrandIcons';
import { PrivacyScopeSelector } from './PrivacyScopeSelector';
import { api } from '../../services/api';

export function PersonalIdentityForm({
  formData,
  onChange,
  onPrivacyChange
}) {
  const [usernameStatus, setUsernameStatus] = useState({ state: 'idle', message: '' }); // 'idle' | 'checking' | 'available' | 'taken'
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Check username availability with debounce
  useEffect(() => {
    if (!formData.username) {
      setUsernameStatus({ state: 'idle', message: '' });
      return;
    }

    if (debounceTimeout) clearTimeout(debounceTimeout);

    const timeout = setTimeout(async () => {
      setUsernameStatus({ state: 'checking', message: 'Validating uniqueness...' });
      try {
        const res = await api.checkUsername(formData.username);
        if (res.available) {
          setUsernameStatus({ state: 'available', message: 'Username is available' });
        } else {
          setUsernameStatus({ state: 'taken', message: res.reason || 'Username is already taken' });
        }
      } catch (e) {
        setUsernameStatus({ state: 'idle', message: '' });
      }
    }, 400);

    setDebounceTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [formData.username]);

  const bioLength = formData.bio ? formData.bio.length : 0;
  const bioLimit = 500;
  const isBioNearLimit = bioLength > bioLimit * 0.85;
  const isBioOverLimit = bioLength > bioLimit;

  return (
    <div className="space-y-6">
      {/* 1. Core Profile Details Card */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-5">
        <div className="border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <span>Personal Identity & Public Persona</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Basic credentials displayed across platforms and public collaboration surfaces.
          </p>
        </div>

        {/* Display Name & Username (Side-by-side grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Display Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <PrivacyScopeSelector
                value={formData.visibility_settings?.real_name || 'public'}
                onChange={(val) => onPrivacyChange('real_name', val)}
                label="Display Name"
              />
            </div>
            <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <input
                type="text"
                value={formData.display_name || ''}
                onChange={(e) => onChange('display_name', e.target.value)}
                placeholder="e.g. Alex Vance"
                required
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Username with fixed prefix chip and debounce status */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Handle Identifier <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">Fixed URL</span>
            </div>
            <div className={`relative flex items-center rounded-xl border bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:border-transparent transition-all overflow-hidden ${
              usernameStatus.state === 'taken'
                ? 'border-rose-400 focus-within:ring-rose-500'
                : usernameStatus.state === 'available'
                ? 'border-emerald-400 focus-within:ring-emerald-500'
                : 'border-border-light dark:border-border-dark focus-within:ring-blue-500'
            }`}>
              <span className="px-3 py-2.5 text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 border-r border-border-light dark:border-border-dark select-none flex-shrink-0">
                atelier.id/@
              </span>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => onChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="alexvance"
                required
                className="w-full px-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none font-mono"
              />
              {/* Status icon indicator */}
              <div className="pr-3 flex items-center">
                {usernameStatus.state === 'checking' && (
                  <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                )}
                {usernameStatus.state === 'available' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {usernameStatus.state === 'taken' && (
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                )}
              </div>
            </div>
            {usernameStatus.message && (
              <p className={`text-[11px] mt-1 ${
                usernameStatus.state === 'taken' ? 'text-rose-500' :
                usernameStatus.state === 'available' ? 'text-emerald-500' : 'text-slate-400'
              }`}>
                {usernameStatus.message}
              </p>
            )}
          </div>
        </div>

        {/* Professional Headline */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Professional Headline / Role
          </label>
          <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={formData.headline || ''}
              onChange={(e) => onChange('headline', e.target.value)}
              placeholder="e.g. Senior Systems Architect & Distributed Systems Craftsman"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Bio Textarea with Character Countdown */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Personal Bio
            </label>
            <span className={`text-[11px] font-mono ${
              isBioOverLimit ? 'text-rose-500 font-bold' :
              isBioNearLimit ? 'text-amber-500' : 'text-slate-400'
            }`}>
              {bioLength} / {bioLimit} characters
            </span>
          </div>
          <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <textarea
              rows={3}
              value={formData.bio || ''}
              onChange={(e) => onChange('bio', e.target.value)}
              placeholder="Tell your professional story, technical interests, and what you are building..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 2. Web Footprint & Social Links Card */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>Web Ecosystem & Verified Links</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Connect external identities and personal engineering portfolio.
            </p>
          </div>
          <PrivacyScopeSelector
            value={formData.visibility_settings?.social_links || 'public'}
            onChange={(val) => onPrivacyChange('social_links', val)}
            label="Social Links"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Website URL */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Personal Website / Portfolio
            </label>
            <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => onChange('website_url', e.target.value)}
                placeholder="https://yourdomain.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* GitHub */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              GitHub Profile
            </label>
            <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <GithubIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.social_links?.github || ''}
                onChange={(e) => onChange('social_links', { ...formData.social_links, github: e.target.value })}
                placeholder="github_handle"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* X / Twitter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              X / Twitter
            </label>
            <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <TwitterIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.social_links?.x || ''}
                onChange={(e) => onChange('social_links', { ...formData.social_links, x: e.target.value })}
                placeholder="x_handle"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              LinkedIn
            </label>
            <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkedinIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.social_links?.linkedin || ''}
                onChange={(e) => onChange('social_links', { ...formData.social_links, linkedin: e.target.value })}
                placeholder="linkedin-vanity-name"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
