import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Handshake, Copy, Check, Send, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DelegateStepModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { delegateCurrentStep, workspaceDraft, nextStep } = useOnboardingStore();
  const [email, setEmail] = useState('marcus@vercel.com');
  const [note, setNote] = useState('Hey Marcus! Could you please connect our production SDK keys so we can finish setting up Acme Studio?');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleDelegateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    const token = await delegateCurrentStep(email, note);
    setGeneratedToken(token);
    setSending(false);
  };

  const handleCopyLink = () => {
    if (!generatedToken) return;
    const link = `${window.location.origin}/?view=delegate&token=${generatedToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinishAndContinue = () => {
    onClose();
    nextStep();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ask a Teammate to Complete This Step
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zero-friction delegation. They won't need full admin access or a password.
            </p>
          </div>
        </div>

        {!generatedToken ? (
          <form onSubmit={handleDelegateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Teammate's Corporate Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. dev@yourcompany.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Role Permission Assignment
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Scoped Technical Setup (SDK & Database Only)
                </span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full font-mono">
                  Safe Bypass
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Personalized Note (Optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Generating Magic Link...' : 'Dispatch Invite & Delegate'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-xs">
              <div className="flex items-center justify-between font-semibold text-violet-900 dark:text-violet-200 mb-1">
                <span>Magic Delegation Link Generated!</span>
                <span className="font-mono text-[10px] bg-violet-200 dark:bg-violet-900 px-1.5 py-0.5 rounded">Active</span>
              </div>
              <p className="text-violet-700 dark:text-violet-300 text-[11px]">
                We sent an instant invitation to <strong>{email}</strong>. You can also copy the direct magic link below to paste in Slack:
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
              <span className="truncate text-slate-600 dark:text-slate-300 flex-1">
                {window.location.origin}/?view=delegate&token={generatedToken}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 flex items-center gap-1 shrink-0 font-sans font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`/?view=delegate&token=${generatedToken}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-violet-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Preview Teammate Screen</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={handleFinishAndContinue}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-custom hover:opacity-90 rounded-xl shadow-sm flex items-center gap-1 transition-opacity"
              >
                <span>Continue into Workspace →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
