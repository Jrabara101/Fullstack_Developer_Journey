import React, { useState } from 'react';
import { X, Mail, Globe, Check, ArrowRight } from 'lucide-react';
import { GithubIcon } from '../common/BrandIcons';
import { api } from '../../services/api';

export function SocialSyncModal({ isOpen, onClose, currentEmail, currentGithub, onSyncSuccess }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('github'); // 'github' | 'gravatar' | 'google'
  const [ghHandle, setGhHandle] = useState(currentGithub || 'octocat');
  const [gravatarEmail, setGravatarEmail] = useState(currentEmail || 'alex.vance@atelier.systems');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSync = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      let identifier = ghHandle;
      if (activeTab === 'gravatar') identifier = gravatarEmail;
      if (activeTab === 'google') identifier = 'google_user_primary';

      const response = await api.syncSocial(activeTab, identifier);
      if (response && response.data) {
        onSyncSuccess(response.data);
        onClose();
      } else {
        throw new Error('Failed to synchronize social asset');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error syncing profile image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-2xl shadow-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#181B22] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
          <div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Social & Gravatar Sync Bridge
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Pull verified photos & identity metadata with a single click
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-border-light dark:border-border-dark px-6 pt-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'github'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gravatar')}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'gravatar'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Gravatar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'google'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Google Workspace</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                GitHub Username Handle
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121418] overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 py-2 text-xs text-slate-400 font-mono bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                  github.com/
                </span>
                <input
                  type="text"
                  value={ghHandle}
                  onChange={(e) => setGhHandle(e.target.value)}
                  placeholder="octocat"
                  className="w-full px-3 py-2 text-xs bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Directly imports verified GitHub avatar, company, and bio details.
              </p>
            </div>
          )}

          {activeTab === 'gravatar' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Email Address Registered on Gravatar
              </label>
              <input
                type="email"
                value={gravatarEmail}
                onChange={(e) => setGravatarEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121418] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Calculates cryptographic MD5 hash to fetch your globally recognized avatar.
              </p>
            </div>
          )}

          {activeTab === 'google' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Google SSO Active Connection
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Sync your high-resolution Google Workspace directory portrait and verified identity badge.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSync}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Synchronizing...</span>
              </>
            ) : (
              <>
                <span>Import Profile Photo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
