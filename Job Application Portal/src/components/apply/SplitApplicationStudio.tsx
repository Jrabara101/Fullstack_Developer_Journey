import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight, Smartphone, Check, Sparkles, AlertCircle, Save, Undo2 } from 'lucide-react';
import { JobPosting, JobApplication, ResumeVersion, DraftPayload, SkillAlignment } from '../../types/index.ts';
import { ResumeViewerPane } from './ResumeViewerPane.tsx';
import { FormStepIdentity } from './FormStepIdentity.tsx';
import { FormStepExperience } from './FormStepExperience.tsx';
import { FormStepQuestions } from './FormStepQuestions.tsx';
import { FormStepReview } from './FormStepReview.tsx';
import { AutosaveStatusBar } from '../common/AutosaveStatusBar.tsx';
import { QRModal } from '../common/QRModal.tsx';
import { UnbiasedPreviewModal } from '../common/UnbiasedPreviewModal.tsx';
import { fetchResumes, parseResume, autosaveDraft, submitApplication, getOrCreateDraft } from '../../utils/api.ts';
import { saveLocalDraft, getLocalDraft, markDraftSynced } from '../../db/indexedDb.ts';
import { formatSalaryRange } from '../../utils/formatters.ts';
import { useToast } from '../../context/ToastContext.tsx';
import confetti from 'canvas-confetti';

interface SplitApplicationStudioProps {
  job: JobPosting;
  initialApplication?: JobApplication | null;
  onExit: () => void;
  onSubmitSuccess: (application: JobApplication) => void;
}

export const SplitApplicationStudio: React.FC<SplitApplicationStudioProps> = ({
  job,
  initialApplication,
  onExit,
  onSubmitSuccess
}) => {
  const { success, error, info } = useToast();

  // Active step: 0: Identity & Auto-fill, 1: Experience & Education, 2: Role Questions, 3: Review & Submit
  const [activeStep, setActiveStep] = useState(0);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRedacted, setIsRedacted] = useState(false);
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [isUnbiasedModalOpen, setIsUnbiasedModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAutoFillBanner, setShowAutoFillBanner] = useState(true);

  // Resume state
  const [resumesList, setResumesList] = useState<ResumeVersion[]>([]);
  const [currentResume, setCurrentResume] = useState<ResumeVersion | null>(null);
  const [alignment, setAlignment] = useState<SkillAlignment | null>(null);

  // Application & Draft state
  const [applicationId, setApplicationId] = useState<string>(initialApplication?.id || '');
  const [trackingCode, setTrackingCode] = useState<string>(initialApplication?.trackingCode || 'APP-2026-DRAFT');
  const [draft, setDraft] = useState<DraftPayload>({
    activeStepIndex: 0,
    identity: {
      fullName: 'Alex Rivera',
      email: 'alex.rivera@atelier-dev.io',
      phone: '+1 (415) 890-4412',
      timezone: 'America/Los_Angeles',
      githubUrl: 'https://github.com/arivera',
      linkedinUrl: 'https://linkedin.com/in/alex-rivera-fe',
      portfolioUrl: 'https://alexrivera.design'
    },
    workHistory: [],
    education: [],
    screeningAnswers: {},
    updatedAt: new Date().toISOString()
  });

  // Autosave status state
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'offline' | 'idle'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<string>(new Date().toISOString());
  const autosaveTimerRef = useRef<any>(null);

  // Load Resumes & Initialize or Restore Draft
  useEffect(() => {
    let mounted = true;

    async function initStudio() {
      try {
        // 1. Fetch available resumes in vault
        const { resumes } = await fetchResumes();
        if (!mounted) return;
        setResumesList(resumes);

        const primary = resumes.find(r => r.isPrimary) || resumes[0];
        if (primary) {
          setCurrentResume(primary);
        }

        // 2. Check local IndexedDB draft first (Zero-Loss Dual Layer)
        const localRecord = await getLocalDraft(job.id);

        if (initialApplication) {
          setApplicationId(initialApplication.id);
          setTrackingCode(initialApplication.trackingCode);
          if (initialApplication.draftPayload) {
            setDraft(initialApplication.draftPayload);
            setActiveStep(initialApplication.draftPayload.activeStepIndex || 0);
          }
        } else if (localRecord) {
          setDraft(localRecord.draftPayload);
          setActiveStep(localRecord.draftPayload.activeStepIndex || 0);
          info('Restored your local draft', 'Keystroke progress saved from your last session.');
        } else {
          // 3. Create or load draft from backend
          const draftRes = await getOrCreateDraft({
            jobId: job.id,
            email: primary?.parsedData?.email,
            fullName: primary?.parsedData?.fullName
          });

          if (mounted) {
            setApplicationId(draftRes.application.id);
            setTrackingCode(draftRes.application.trackingCode);
            if (primary?.parsedData) {
              setDraft(prev => ({
                ...prev,
                identity: {
                  ...prev.identity,
                  fullName: primary.parsedData.fullName || prev.identity.fullName,
                  email: primary.parsedData.email || prev.identity.email,
                  phone: primary.parsedData.phone || prev.identity.phone,
                  githubUrl: primary.parsedData.githubUrl || prev.identity.githubUrl,
                  linkedinUrl: primary.parsedData.linkedinUrl || prev.identity.linkedinUrl,
                  portfolioUrl: primary.parsedData.portfolioUrl || prev.identity.portfolioUrl
                },
                workHistory: primary.parsedData.workHistory || prev.workHistory,
                education: primary.parsedData.education || prev.education
              }));
            }
          }
        }

        // Initial alignment parse check
        if (primary) {
          const parseRes = await parseResume({ sampleId: primary.id, jobId: job.id });
          if (mounted) setAlignment(parseRes.alignment);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }

    initStudio();

    return () => {
      mounted = false;
    };
  }, [job.id, initialApplication]);

  // Dual-Layer Autosave Trigger (IndexedDB immediately + debounced server sync)
  const triggerAutosave = useCallback(
    (newDraft: DraftPayload) => {
      setSaveStatus('saving');

      // 1. Immediate local persistence to IndexedDB
      saveLocalDraft(job.id, newDraft, Math.round(((activeStep + 1) / 4) * 100), trackingCode).catch(e =>
        console.error('IndexedDB save failed:', e)
      );

      // 2. Debounced sync to REST backend
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(async () => {
        if (!applicationId) return;
        try {
          const res = await autosaveDraft(applicationId, {
            draftPayload: newDraft,
            completionPercent: Math.round(((activeStep + 1) / 4) * 100),
            skillMatchScore: alignment?.matchPercentage || 100,
            resumeVersionId: currentResume?.id
          });

          await markDraftSynced(job.id);
          setSaveStatus('saved');
          setLastSavedAt(res.savedAt || new Date().toISOString());
        } catch (e) {
          setSaveStatus('offline');
        }
      }, 450);
    },
    [applicationId, job.id, activeStep, trackingCode, alignment, currentResume]
  );

  // Form field mutation helper
  const updateIdentity = (fields: Partial<DraftPayload['identity']>) => {
    setDraft(prev => {
      const updated = {
        ...prev,
        identity: { ...prev.identity, ...fields },
        updatedAt: new Date().toISOString()
      };
      triggerAutosave(updated);
      return updated;
    });
  };

  const updateWorkHistory = (work: any[]) => {
    setDraft(prev => {
      const updated = { ...prev, workHistory: work, updatedAt: new Date().toISOString() };
      triggerAutosave(updated);
      return updated;
    });
  };

  const updateEducation = (edu: any[]) => {
    setDraft(prev => {
      const updated = { ...prev, education: edu, updatedAt: new Date().toISOString() };
      triggerAutosave(updated);
      return updated;
    });
  };

  const updateSkills = (skills: string[]) => {
    if (currentResume) {
      setCurrentResume({
        ...currentResume,
        parsedData: { ...currentResume.parsedData, skills }
      });
    }
  };

  const updateScreeningAnswer = (questionId: string, answer: string) => {
    setDraft(prev => {
      const updated = {
        ...prev,
        screeningAnswers: { ...prev.screeningAnswers, [questionId]: answer },
        updatedAt: new Date().toISOString()
      };
      triggerAutosave(updated);
      return updated;
    });
  };

  // Upload or select new resume
  const handleSelectResume = async (resumeId: string) => {
    const selected = resumesList.find(r => r.id === resumeId);
    if (!selected) return;

    setIsScanning(true);
    setCurrentResume(selected);

    try {
      const parseRes = await parseResume({ sampleId: resumeId, jobId: job.id });
      setAlignment(parseRes.alignment);

      // Auto-populate form fields from new resume version
      if (selected.parsedData) {
        setDraft(prev => {
          const updated = {
            ...prev,
            identity: {
              ...prev.identity,
              fullName: selected.parsedData.fullName || prev.identity.fullName,
              email: selected.parsedData.email || prev.identity.email,
              phone: selected.parsedData.phone || prev.identity.phone,
              githubUrl: selected.parsedData.githubUrl || prev.identity.githubUrl,
              portfolioUrl: selected.parsedData.portfolioUrl || prev.identity.portfolioUrl
            },
            workHistory: selected.parsedData.workHistory || prev.workHistory,
            education: selected.parsedData.education || prev.education,
            selectedResumeId: selected.id,
            updatedAt: new Date().toISOString()
          };
          triggerAutosave(updated);
          return updated;
        });
      }

      success('Resume auto-filled in 1.1s', `Loaded "${selected.label}" with ${parseRes.alignment.matchPercentage}% role alignment.`);
    } finally {
      setTimeout(() => setIsScanning(false), 700);
    }
  };

  const handleUploadFile = async (file: File) => {
    setIsScanning(true);
    try {
      const text = await file.text().catch(() => 'ALEX RIVERA\nStaff Frontend Engineer');
      const parseRes = await parseResume({ text, jobId: job.id });

      setResumesList(prev => [parseRes.resume, ...prev]);
      setCurrentResume(parseRes.resume);
      setAlignment(parseRes.alignment);

      if (parseRes.resume.parsedData) {
        setDraft(prev => {
          const updated = {
            ...prev,
            identity: {
              ...prev.identity,
              fullName: parseRes.resume.parsedData.fullName || prev.identity.fullName,
              email: parseRes.resume.parsedData.email || prev.identity.email,
              phone: parseRes.resume.parsedData.phone || prev.identity.phone,
              githubUrl: parseRes.resume.parsedData.githubUrl || prev.identity.githubUrl,
              portfolioUrl: parseRes.resume.parsedData.portfolioUrl || prev.identity.portfolioUrl
            },
            workHistory: parseRes.resume.parsedData.workHistory || prev.workHistory,
            education: parseRes.resume.parsedData.education || prev.education,
            selectedResumeId: parseRes.resume.id,
            updatedAt: new Date().toISOString()
          };
          triggerAutosave(updated);
          return updated;
        });
      }

      success('Resume parsed successfully!', `Extracted ${parseRes.resume.parsedData.boundingBoxes.length} verified bounding blocks.`);
    } catch (err: any) {
      error('Failed to parse file', err.message);
    } finally {
      setTimeout(() => setIsScanning(false), 800);
    }
  };

  // Step Navigation
  const handleNextStep = () => {
    if (activeStep < 3) {
      const next = activeStep + 1;
      setActiveStep(next);
      setDraft(prev => {
        const u = { ...prev, activeStepIndex: next, updatedAt: new Date().toISOString() };
        triggerAutosave(u);
        return u;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      const prev = activeStep - 1;
      setActiveStep(prev);
      setDraft(d => {
        const u = { ...d, activeStepIndex: prev, updatedAt: new Date().toISOString() };
        triggerAutosave(u);
        return u;
      });
    }
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitApplication(applicationId, {
        screeningAnswers: draft.screeningAnswers,
        finalPayload: draft
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      success('Application Submitted!', `Tracking ID: ${res.trackingCode}. SLA timer started.`);
      onSubmitSuccess(res.application);
    } catch (err: any) {
      error('Submission failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 0, label: 'Resume & Auto-Fill', subtitle: 'Identity & verified links' },
    { id: 1, label: 'Experience & Links', subtitle: 'Parsed roles & education' },
    { id: 2, label: `Role Questions (${job.screeningQuestions.length})`, subtitle: 'Architecture & technical' },
    { id: 3, label: 'Review & Submit', subtitle: 'Blind screening check' }
  ];

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Sticky Application & Persistence Bar */}
      <header className="h-16 sticky top-0 z-40 border-b border-divider-light dark:border-divider-dark bg-canvas-light/95 dark:bg-canvas-dark/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
        {/* Left: Role Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Save & Return to Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              AT
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[240px] lg:max-w-xs">
                {job.title}
              </h2>
              <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                {job.location} • {formatSalaryRange(job.salaryMinCents, job.salaryMaxCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Center: 4-Step Interactive Progress Track */}
        <div className="hidden md:flex items-center gap-2">
          {steps.map((st, i) => {
            const isCompleted = activeStep > i;
            const isCurrent = activeStep === i;

            return (
              <React.Fragment key={st.id}>
                <button
                  onClick={() => setActiveStep(i)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    isCurrent
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : i + 1}
                  </span>
                  <span>{st.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <span className="w-3 h-px bg-divider-light dark:border-divider-dark" />
                )}
              </React.Fragment>
            );
          })}
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-500">
            ⏱ ~2m left
          </span>
        </div>

        {/* Right: Live Persistence & Handoff Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AutosaveStatusBar status={saveStatus} lastSavedAt={lastSavedAt} />

          <button
            onClick={() => setIsHandoffOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-700 dark:text-slate-200 hover:border-brand-500/40 transition-all shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-brand-500" />
            <span>Continue on mobile</span>
          </button>

          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Save & Exit
          </button>
        </div>
      </header>

      {/* 2-Column Split Master Stage */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
        {/* Left Pane: Interactive Resume Dropzone & Bounding-Box Document Viewer (5 Columns) */}
        <div className="lg:col-span-5 h-[500px] lg:h-auto border-b lg:border-b-0">
          <ResumeViewerPane
            currentResume={currentResume}
            resumesList={resumesList}
            onSelectResume={handleSelectResume}
            onUploadFile={handleUploadFile}
            onLoadSample={handleSelectResume}
            isScanning={isScanning}
            activeFieldKey={activeFieldKey}
            onSelectField={key => {
              setActiveFieldKey(key);
              if (key.includes('workHistory') || key.includes('education') || key === 'skills') {
                setActiveStep(1);
              } else if (key.startsWith('identity.')) {
                setActiveStep(0);
              }
            }}
            alignment={alignment}
            isRedacted={isRedacted}
            onToggleRedacted={() => setIsRedacted(!isRedacted)}
          />
        </div>

        {/* Right Pane: Auto-Populated Application Form Stage (7 Columns) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:px-12 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Auto-Fill Confirmation Banner */}
            {showAutoFillBanner && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mb-6 flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-100 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p>
                    ✨ We auto-filled 11 fields from your resume in 1.1s. Highlighted fields are bi-directionally linked to your PDF.
                  </p>
                </div>
                <button
                  onClick={() => setShowAutoFillBanner(false)}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 ml-3 text-[11px] font-mono"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Active Step Content */}
            {activeStep === 0 && (
              <FormStepIdentity
                data={draft.identity}
                onChange={updateIdentity}
                onFocusField={key => setActiveFieldKey(key)}
                onBlurField={() => setActiveFieldKey(null)}
                summary={currentResume?.parsedData?.summary}
                onSummaryChange={s => {
                  if (currentResume) {
                    setCurrentResume({
                      ...currentResume,
                      parsedData: { ...currentResume.parsedData, summary: s }
                    });
                  }
                }}
              />
            )}

            {activeStep === 1 && (
              <FormStepExperience
                workHistory={draft.workHistory}
                education={draft.education}
                skills={currentResume?.parsedData?.skills || job.requiredSkills}
                onChangeWorkHistory={updateWorkHistory}
                onChangeEducation={updateEducation}
                onChangeSkills={updateSkills}
                onFocusField={key => setActiveFieldKey(key)}
                onBlurField={() => setActiveFieldKey(null)}
              />
            )}

            {activeStep === 2 && (
              <FormStepQuestions
                questions={job.screeningQuestions}
                answers={draft.screeningAnswers}
                onChangeAnswer={updateScreeningAnswer}
              />
            )}

            {activeStep === 3 && (
              <FormStepReview
                job={job}
                draft={draft}
                resume={currentResume}
                onOpenUnbiasedModal={() => setIsUnbiasedModalOpen(true)}
                isSubmitting={isSubmitting}
                onSubmit={handleFinalSubmit}
              />
            )}
          </div>

          {/* Sticky Form Navigation Footer */}
          <footer className="mt-8 pt-4 border-t border-divider-light dark:border-divider-dark flex items-center justify-between">
            <div>
              {activeStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-divider-light dark:border-divider-dark text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-400">
                  Keystroke autosave enabled
                </span>
              )}
            </div>

            <div>
              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-xs flex items-center gap-2 active:scale-98"
                >
                  <span>Continue to {steps[activeStep + 1]?.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Application (⌘+Enter)'}</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>

      {/* Cross-Device Magic Handoff Modal */}
      <QRModal
        isOpen={isHandoffOpen}
        onClose={() => setIsHandoffOpen(false)}
        applicationId={applicationId}
        trackingCode={trackingCode}
      />

      {/* Unbiased Blind Screening Preview Modal */}
      {currentResume && (
        <UnbiasedPreviewModal
          isOpen={isUnbiasedModalOpen}
          onClose={() => setIsUnbiasedModalOpen(false)}
          parsedData={currentResume.parsedData}
        />
      )}
    </div>
  );
};
