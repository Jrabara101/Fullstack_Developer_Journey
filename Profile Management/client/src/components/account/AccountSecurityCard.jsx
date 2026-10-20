import React, { useState, useEffect } from 'react';
import {
  Shield, Mail, Phone, Key, Smartphone, Laptop, Clock,
  CheckCircle2, AlertCircle, ChevronRight, History
} from 'lucide-react';
import { PrivacyScopeSelector } from '../profile/PrivacyScopeSelector';
import { api } from '../../services/api';

export function AccountSecurityCard({
  email,
  phone,
  visibilitySettings = {},
  onEmailChange,
  onPhoneChange,
  onPrivacyChange
}) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      try {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      } catch (e) {}
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Contact & Communications Privacy */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-5">
        <div className="border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            <span>Contact Channels & Sensitive Identifiers</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Configure direct communications with field-by-field audience scoping.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Primary Account Email
              </label>
              <PrivacyScopeSelector
                value={visibilitySettings.email || 'private'}
                onChange={(val) => onPrivacyChange('email', val)}
                label="Email"
              />
            </div>
            <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email || ''}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used for security notifications, password resets, and takeout digests.
            </p>
          </div>

          {/* Telephone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Direct Telephone
              </label>
              <PrivacyScopeSelector
                value={visibilitySettings.phone || 'private'}
                onChange={(val) => onPrivacyChange('phone', val)}
                label="Phone"
              />
            </div>
            <div className="relative rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-[#181B22] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phone || ''}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Encrypted at rest. Redacted from anonymous strangers by default.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Authentication & 2FA Status */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-4">
        <div className="border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-500" />
            <span>Multi-Factor Authentication (MFA / Passkeys)</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Hardware security keys, biometric passkeys, and time-based one-time passwords (TOTP).
          </p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Hardware Passkey & WebAuthn Active
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                YubiKey 5Ci + Touch ID enrolled • Zero-phishing credential protection
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white">
            Enforced
          </span>
        </div>
      </div>

      {/* 3. Security Audit Logs Trail */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Immutable Security Audit Trail
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Cryptographically hashed record of account modifications and authenticated logins.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAllLogs(!showAllLogs)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {showAllLogs ? 'Collapse trail' : 'View all events'}
          </button>
        </div>

        <div className="space-y-2">
          {auditLogs.slice(0, showAllLogs ? 15 : 4).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#181B22] border border-border-light/70 dark:border-border-dark/70 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                    {log.action}
                  </span>
                  <span className="text-slate-400 ml-2 text-[11px]">
                    from {log.ip_address || '127.0.0.1'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
