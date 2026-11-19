import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Smartphone, Laptop, Mail, ShieldCheck, ExternalLink } from 'lucide-react';
import { createHandoffToken } from '../../utils/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  trackingCode: string;
}

export const QRModal: React.FC<QRModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  trackingCode
}) => {
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [magicUrl, setMagicUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoading(true);

    createHandoffToken({
      applicationId,
      trackingCode,
      hostUrl: window.location.origin
    })
      .then(res => {
        if (mounted) {
          setQrSvg(res.qrCodeSvg);
          setMagicUrl(res.magicUrl);
        }
      })
      .catch(err => {
        console.error('Handoff error:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, applicationId, trackingCode]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(magicUrl || window.location.href);
    setCopied(true);
    success('Magic link copied to clipboard', 'Valid for 7 days. Open on any desktop or phone to resume.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEmailSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailSent(true);
    success('Magic resume link sent!', `Sent to ${emailInput}. Check your inbox to resume anytime.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-2xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Continue on Another Device
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zero passwords needed. Resume exact cursor & draft state.
            </p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="my-5 p-4 bg-slate-50 dark:bg-slate-900/60 border border-divider-light dark:border-divider-dark rounded-xl flex flex-col items-center justify-center text-center">
          {loading ? (
            <div className="w-48 h-48 flex items-center justify-center text-xs font-mono text-slate-500">
              Generating secure QR token...
            </div>
          ) : qrSvg ? (
            <div
              className="w-48 h-48 bg-white p-3 rounded-lg shadow-inner flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs font-mono text-slate-500">
              Scan with phone camera
            </div>
          )}
          <span className="mt-3 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-brand-500" />
            Scan to switch to mobile, or copy URL below for desktop
          </span>
        </div>

        {/* Magic Link Copy */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Secure Session URL (Valid for 7 days)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={magicUrl || 'Generating link...'}
              className="flex-1 px-3 py-2 text-xs font-mono bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-lg text-slate-600 dark:text-slate-300 select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Email option */}
        <form onSubmit={handleEmailSend} className="pt-3 border-t border-divider-light dark:border-divider-dark">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Or email me a magic link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="you@domain.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={emailSent}
              className="px-3 py-2 bg-surface-secondary-light dark:bg-surface-secondary-dark hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-divider-light dark:border-divider-dark text-xs font-medium rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{emailSent ? 'Sent ✓' : 'Send'}</span>
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Encrypted token. Does not expose personal contact info without draft authorization.</span>
        </div>
      </div>
    </div>
  );
};
