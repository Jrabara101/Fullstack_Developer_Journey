import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Mail, 
  ExternalLink, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Code, 
  Eye,
  CornerDownRight
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const TransactionalEmailPreview = ({ notification, onClose }) => {
  const [emailThemeDark, setEmailThemeDark] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview', 'headers', 'html'
  const [copiedCode, setCopiedCode] = useState(false);
  const [unsubscribedSuccess, setUnsubscribedSuccess] = useState(false);

  if (!notification) return null;

  const rawHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${notification.title}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: ${emailThemeDark ? '#0A0B0E' : '#F1F5F9'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: ${emailThemeDark ? '#131418' : '#FFFFFF'}; border: 1px solid ${emailThemeDark ? '#242730' : '#E2E8F0'}; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="border-bottom: 1px solid ${emailThemeDark ? '#242730' : '#E2E8F0'}; padding-bottom: 20px; margin-bottom: 24px;">
      <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: #3B82F6;">
        ${notification.category.toUpperCase()} • STITCH PULSE
      </span>
      <h1 style="font-size: 20px; font-weight: 600; color: ${emailThemeDark ? '#F8FAFC' : '#0F172A'}; margin: 8px 0 0 0;">
        ${notification.title}
      </h1>
    </div>

    <!-- Sender Profile -->
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <div style="margin-right: 12px;">
        <img src="${notification.actor?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop'}" style="width: 44px; height: 44px; border-radius: 10px;" />
      </div>
      <div>
        <div style="font-weight: 600; font-size: 14px; color: ${emailThemeDark ? '#F8FAFC' : '#0F172A'};">
          ${notification.actor?.name || 'Automated System'}
        </div>
        <div style="font-size: 12px; color: #64748B;">
          ${notification.actor?.role || 'Acme Workspace'}
        </div>
      </div>
    </div>

    <!-- Quoted Narrative Bubble -->
    <div style="border-left: 4px solid #2563EB; background: ${emailThemeDark ? '#191B20' : '#F8FAFC'}; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 28px; color: ${emailThemeDark ? '#E2E8F0' : '#1E293B'}; font-size: 14px; line-height: 1.6;">
      ${notification.body}
    </div>

    <!-- Action CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${notification.targetEntity?.url || '#'}" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
        Open &amp; Respond →
      </a>
    </div>

    <!-- Trust & RFC 8058 Unsubscribe Footer -->
    <div style="border-top: 1px solid ${emailThemeDark ? '#242730' : '#E2E8F0'}; padding-top: 20px; font-size: 12px; color: #64748B; line-height: 1.5;">
      <p style="margin: 0 0 8px 0;">
        ${notification.deliveryRuleReason}
      </p>
      <p style="margin: 0;">
        <a href="#unsub" style="color: #64748B; text-decoration: underline;">One-Click Unsubscribe from this thread</a> • 
        <a href="#settings" style="color: #64748B; text-decoration: underline;">Manage Notification Settings</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  const copyHtml = () => {
    navigator.clipboard.writeText(rawHtml);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#131418] border border-slate-200 dark:border-[#242730] shadow-2xl overflow-hidden">
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-[#242730] bg-slate-50 dark:bg-[#101217]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Transactional Email Preview
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                RFC 8058 compliant • React Email Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex items-center bg-slate-200/80 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
              </button>
              <button
                onClick={() => setActiveTab('headers')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'headers'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Headers
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'html'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5 inline mr-1" /> HTML
              </button>
            </div>

            {/* Email Dark/Light preview toggle */}
            <button
              onClick={() => setEmailThemeDark(!emailThemeDark)}
              title="Toggle preview client theme"
              className="p-1.5 rounded-lg bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
            >
              {emailThemeDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-[#0A0B0E]">
          {activeTab === 'preview' && (
            <div className="flex flex-col items-center">
              {/* Unsubscribe Success Banner */}
              {unsubscribedSuccess && (
                <div className="w-full max-w-[600px] mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-fade-in">
                  <span>✓ One-Click Unsubscribe registered. You will no longer receive emails for this thread.</span>
                  <button onClick={() => setUnsubscribedSuccess(false)} className="text-emerald-500 hover:text-emerald-700">Dismiss</button>
                </div>
              )}

              {/* 600px Centered Email Card (Blueprint D) */}
              <div
                className={`w-full max-w-[600px] rounded-2xl border shadow-xl p-8 transition-colors ${
                  emailThemeDark
                    ? 'bg-[#131418] border-[#242730] text-[#F8FAFC]'
                    : 'bg-white border-slate-200 text-[#0F172A]'
                }`}
              >
                {/* Brand Header */}
                <div
                  className={`border-b pb-4 mb-6 flex items-center justify-between ${
                    emailThemeDark ? 'border-[#242730]' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-blue-600"></span>
                    <span className="font-bold text-xs tracking-wider uppercase text-blue-600 dark:text-blue-400">
                      STITCH PULSE
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Transactional Delivery
                  </span>
                </div>

                {/* Subject Title */}
                <h2
                  className={`text-lg font-semibold mb-5 ${
                    emailThemeDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {notification.title}
                </h2>

                {/* Sender Info */}
                <div className="flex items-center gap-3 mb-6">
                  {notification.actor?.avatar ? (
                    <img
                      src={notification.actor.avatar}
                      alt={notification.actor.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-zinc-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 font-semibold flex items-center justify-center text-xs">
                      {notification.actor?.name?.slice(0, 2).toUpperCase() || 'SYS'}
                    </div>
                  )}

                  <div>
                    <div
                      className={`text-sm font-semibold ${
                        emailThemeDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {notification.actor?.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {notification.actor?.role} • {new Date(notification.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Quoted Message Bubble with Vertical Left Accent */}
                <div
                  className={`border-l-4 border-blue-600 p-4 rounded-r-xl mb-7 text-sm leading-relaxed ${
                    emailThemeDark ? 'bg-[#191B20] text-slate-200' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {notification.body}
                </div>

                {/* Primary Centered Action Button */}
                <div className="text-center my-8">
                  <a
                    href={notification.targetEntity?.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 px-7 rounded-xl shadow-md transition-all"
                  >
                    Reply to Comment →
                  </a>
                </div>

                {/* Footer Microcopy & One-Click Unsubscribe */}
                <div
                  className={`border-t pt-5 text-xs text-slate-500 leading-relaxed ${
                    emailThemeDark ? 'border-[#242730]' : 'border-slate-200'
                  }`}
                >
                  <p className="mb-2 text-slate-500">
                    {notification.deliveryRuleReason}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px]">
                    <button
                      onClick={() => setUnsubscribedSuccess(true)}
                      className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
                    >
                      One-Click Unsubscribe from this thread
                    </button>
                    <span>•</span>
                    <a
                      href="#settings"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                      }}
                      className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 underline"
                    >
                      Manage Notification Settings
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#131418] border border-slate-200 dark:border-[#242730] font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div className="text-slate-400 pb-2 border-b border-slate-200 dark:border-zinc-800">
                // RFC 8058 & Email Service Provider Telemetry
              </div>
              <div><strong className="text-blue-500">From:</strong> Stitch Pulse &lt;notifications@stitch.app&gt;</div>
              <div><strong className="text-blue-500">To:</strong> user@acme.corp</div>
              <div><strong className="text-blue-500">Subject:</strong> {notification.title}</div>
              <div><strong className="text-purple-500">List-Unsubscribe:</strong> &lt;https://api.stitch.app/unsubscribe?token={notification.metadata?.tokenHash || 'tok_981a'}&gt;</div>
              <div><strong className="text-purple-500">List-Unsubscribe-Post:</strong> List-Unsubscribe=One-Click</div>
              <div><strong className="text-emerald-500">X-Entity-ID:</strong> {notification.targetEntity?.name}</div>
              <div><strong className="text-emerald-500">X-Provider-Message-ID:</strong> {notification.metadata?.providerMessageId || 'resend_msg_01jh927bc9a'}</div>
              <div><strong className="text-amber-500">Deduplication-Hash:</strong> {notification.category}:{notification.targetEntity?.type}</div>
            </div>
          )}

          {activeTab === 'html' && (
            <div className="relative max-w-3xl mx-auto">
              <button
                onClick={copyHtml}
                className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy HTML'}</span>
              </button>
              <pre className="p-6 rounded-2xl bg-slate-900 text-slate-300 font-mono text-xs overflow-x-auto max-h-[500px]">
                {rawHtml}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
