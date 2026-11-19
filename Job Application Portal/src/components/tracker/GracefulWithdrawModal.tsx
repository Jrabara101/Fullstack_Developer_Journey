import React, { useState } from 'react';
import { X, AlertCircle, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { withdrawApplication } from '../../utils/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface GracefulWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onWithdrawnSuccess: () => void;
}

export const GracefulWithdrawModal: React.FC<GracefulWithdrawModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  onWithdrawnSuccess
}) => {
  const { success, error } = useToast();
  const [reason, setReason] = useState('Accepted another offer');
  const [keepWarm, setKeepWarm] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await withdrawApplication(applicationId, {
        reason,
        keepInTalentPool: keepWarm
      });
      success('Application Gracefully Withdrawn', keepWarm ? 'We will notify you of future aligned openings!' : 'Application closed.');
      onWithdrawnSuccess();
      onClose();
    } catch (err: any) {
      error('Withdrawal failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Graceful Application Withdrawal
            </h3>
            <p className="text-xs text-slate-500">No penalties. We respect your career decisions.</p>
          </div>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reason for withdrawing (Optional)
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="Accepted another offer">Accepted another offer</option>
              <option value="Timing or personal circumstances changed">Timing or personal circumstances changed</option>
              <option value="Compensation or location misalignment">Compensation or location misalignment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Keep warm talent pool toggle */}
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="keepWarm"
              checked={keepWarm}
              onChange={e => setKeepWarm(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="keepWarm" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <strong className="block text-brand-900 dark:text-brand-200 font-semibold">
                Keep me in the priority talent pool
              </strong>
              Notify me when future Staff or Senior Frontend positions open up at Atelier.
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Withdrawing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
