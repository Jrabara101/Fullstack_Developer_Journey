import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { updateApplicationResume } from '../../utils/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { ResumeVersion } from '../../types/index.ts';

interface EditResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  resumesList: ResumeVersion[];
  onUpdatedSuccess: () => void;
}

export const EditResumeModal: React.FC<EditResumeModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  resumesList,
  onUpdatedSuccess
}) => {
  const { success, error } = useToast();
  const [selectedResumeId, setSelectedResumeId] = useState(resumesList[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selected = resumesList.find(r => r.id === selectedResumeId);
      await updateApplicationResume(applicationId, {
        resumeVersionId: selectedResumeId,
        label: selected?.label || 'Updated PDF'
      });
      success('Resume Updated!', 'Your new document has replaced the previous version in the recruiter review stage.');
      onUpdatedSuccess();
      onClose();
    } catch (err: any) {
      error('Failed to update resume', err.message);
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
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Grace Window Resume Update
            </h3>
            <p className="text-xs text-slate-500">Fix a typo or attach an updated PDF before review.</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Resume from Your Vault
            </label>
            <div className="space-y-2">
              {resumesList.map(r => (
                <label
                  key={r.id}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedResumeId === r.id
                      ? 'border-brand-500 bg-brand-500/10 text-brand-900 dark:text-brand-100'
                      : 'border-divider-light dark:border-divider-dark bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="resumeSelect"
                      value={r.id}
                      checked={selectedResumeId === r.id}
                      onChange={() => setSelectedResumeId(r.id)}
                      className="text-brand-600"
                    />
                    <div>
                      <p className="font-semibold">{r.label}</p>
                      <p className="text-[11px] text-slate-500">{r.fileName}</p>
                    </div>
                  </div>
                  {selectedResumeId === r.id && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                </label>
              ))}
            </div>
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
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save & Replace Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
