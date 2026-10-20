import React, { useState } from 'react';
import {
  Download, FileArchive, Search, AlertOctagon, Trash2,
  PauseCircle, PlayCircle, ShieldAlert, Check, X, Clock,
  FileCheck, ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { generateClientTakeoutZip } from '../../services/zipExporter';

export function DataSovereigntyModule({
  profile,
  pendingDeletion,
  onProfileUpdate,
  onAccountStatusChange
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isQuarantined = profile.account_status === 'quarantined';
  const isPendingDeletion = profile.account_status === 'pending_deletion';

  // Takeout export handler
  const handleRequestTakeout = async () => {
    setIsExporting(true);
    setExportSuccess(null);

    try {
      // First try server endpoint
      const response = await fetch('/api/account/export-takeout');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-takeout-${profile.username}-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setExportSuccess({
          filename: `data-takeout-${profile.username}.zip`,
          date: new Date().toLocaleDateString()
        });
      } else {
        // Client-side JSZip fallback
        const auditLogs = await api.getAuditLogs();
        const res = await generateClientTakeoutZip(profile, auditLogs);
        setExportSuccess({
          filename: res.filename,
          date: new Date().toLocaleDateString()
        });
      }
    } catch (e) {
      // JSZip fallback
      const auditLogs = await api.getAuditLogs();
      const res = await generateClientTakeoutZip(profile, auditLogs);
      setExportSuccess({
        filename: res.filename,
        date: new Date().toLocaleDateString()
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Quarantine toggle handler
  const handleToggleQuarantine = async () => {
    if (isQuarantined) {
      await api.reactivateAccount();
      onAccountStatusChange('active');
    } else {
      const confirmDeact = window.confirm(
        'Quarantine your account? Your public profile will be immediately hidden from the web, but all your data remains securely preserved.'
      );
      if (confirmDeact) {
        await api.deactivateAccount('User manual quarantine');
        onAccountStatusChange('quarantined');
      }
    }
  };

  // Delete account confirmation
  const handleConfirmDeletion = async () => {
    if (confirmPhrase !== 'delete my account') return;
    setIsDeleting(true);
    try {
      const result = await api.deleteAccountIntent(confirmPhrase, deleteReason);
      onAccountStatusChange('pending_deletion', result.deletion);
      setDeleteModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel deletion
  const handleCancelDeletion = async () => {
    try {
      await api.cancelAccountDeletion();
      onAccountStatusChange('active');
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Pending deletion alert banner if scheduled */}
      {isPendingDeletion && (
        <div className="p-5 rounded-2xl border border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 flex-shrink-0 text-rose-500" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Account Scheduled for Permanent Purge
              </h4>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                14-day recovery grace period active. Purge scheduled for {pendingDeletion?.scheduled_purge_at ? new Date(pendingDeletion.scheduled_purge_at).toLocaleDateString() : '14 days'}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelDeletion}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#181B22] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            Cancel Account Deletion & Reactivate
          </button>
        </div>
      )}

      {/* Quarantined alert banner if soft frozen */}
      {isQuarantined && !isPendingDeletion && (
        <div className="p-5 rounded-2xl border border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PauseCircle className="w-6 h-6 flex-shrink-0 text-amber-500" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Account in Soft Quarantine Freeze
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Your public profile is hidden from the web. All assets and configurations are preserved.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleQuarantine}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Reactivate Public Profile
          </button>
        </div>
      )}

      {/* 1. Personal Archive Export Card */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-4">
        <div className="border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileArchive className="w-4 h-4 text-blue-500" />
            <span>Zero-Lock-In Personal Data Takeout</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Download a complete machine-readable archive containing your profile details, audit history, and media (GDPR Article 20 & CCPA Section 1798.100 compliant).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181B22] border border-border-light dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
              <Download className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Machine-Readable RFC-8259 Archive (.zip)
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Includes: <code>identity/profile.json</code>, <code>preferences/settings.json</code>, <code>security/audit_trail.json</code>, <code>privacy/visibility_matrix.json</code>, and legal compliance attestation.
              </p>
              {exportSuccess && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Last generated archive: {exportSuccess.filename} ({exportSuccess.date})</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestTakeout}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-md transition-all flex-shrink-0 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Compiling Archive...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Request Data Archive (.zip)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Search Indexing & Discoverability Controls */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-500" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Search Engine Indexing & Discoverability
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Controls whether search crawlers (Google, Bing, DuckDuckGo) index your public page.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profile.discoverable_by_search !== false}
              onChange={(e) => onProfileUpdate('discoverable_by_search', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181B22] border border-border-light dark:border-border-dark text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${profile.discoverable_by_search !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span className="text-slate-700 dark:text-slate-300">
              Robots Meta Directive:
            </span>
            <code className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
              {profile.discoverable_by_search !== false ? 'robots: index, follow' : 'robots: noindex, nofollow'}
            </code>
          </div>
          <span className="text-[11px] text-slate-400">
            {profile.discoverable_by_search !== false ? 'Searchable by the public' : 'Invisible to web crawlers'}
          </span>
        </div>
      </div>

      {/* 3. Danger Zone (Quarantine vs Permanent Deletion) */}
      <div className="rounded-2xl border border-red-200 dark:border-red-950/40 bg-red-50/40 dark:bg-red-950/10 p-6 space-y-5">
        <div className="border-b border-red-200/60 dark:border-red-900/30 pb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-sm text-red-700 dark:text-red-400">
              Danger Zone & Account Lifecycle
            </h3>
            <p className="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5">
              Reversible soft quarantine freezing or irreversible scheduled account deletion.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Deactivation / Quarantine Option */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/80 dark:bg-[#121418]/80 border border-red-200/80 dark:border-red-950/60">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <PauseCircle className="w-4 h-4 text-amber-500" />
                <span>Soft Quarantine Deactivation</span>
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                Temporarily hide your profile and presence from all public search and team directories. All preferences and records remain frozen and can be instantly unpaused anytime.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleQuarantine}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors flex-shrink-0"
            >
              {isQuarantined ? 'Reactivate Profile' : 'Quarantine Account'}
            </button>
          </div>

          {/* Permanent Purge Option */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/80 dark:bg-[#121418]/80 border border-red-200/80 dark:border-red-950/60">
            <div>
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />
                <span>Permanent Account Deletion (14-Day Horizon)</span>
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                Schedules all database records, credentials, and media files for permanent cryptographic purge. Includes a 14-day recovery grace period before permanent erasure.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              disabled={isPendingDeletion}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all flex-shrink-0 disabled:opacity-50"
            >
              {isPendingDeletion ? 'Deletion Scheduled' : 'Delete Account Permanently...'}
            </button>
          </div>
        </div>
      </div>

      {/* Two-Step Deletion Confirmation Modal with Destructive Input Safeguard */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-2xl shadow-2xl border border-rose-500/30 bg-white dark:bg-[#181B22] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Delete Account Permanently?
                </h3>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
              <strong>Notice:</strong> This initiates a 14-day quarantine period. After this horizon, your username, identity keys, profile media, and preferences will be permanently wiped.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Optional Departure Feedback
              </label>
              <textarea
                rows={2}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Let us know why you are leaving..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121418] text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                To confirm, type <span className="font-mono font-bold text-rose-600 dark:text-rose-400">delete my account</span> below:
              </label>
              <input
                type="text"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder="delete my account"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-rose-300 dark:border-rose-900/60 bg-white dark:bg-[#121418] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletion}
                disabled={confirmPhrase !== 'delete my account' || isDeleting}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {isDeleting ? 'Scheduling Deletion...' : 'Confirm Permanent Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
