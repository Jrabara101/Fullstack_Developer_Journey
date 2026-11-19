import React, { useEffect } from 'react';
import { useOnboardingStore, STEP_ORDER, STEP_METADATA } from '../../store/useOnboardingStore';
import { MultiStepProgressHeader } from '../progress/MultiStepProgressHeader';
import { Step1WorkspaceIdentity } from '../steps/Step1WorkspaceIdentity';
import { Step2PersonaAndGoals } from '../steps/Step2PersonaAndGoals';
import { Step3IntegrationsAndData } from '../steps/Step3IntegrationsAndData';
import { Step4TeamInvite } from '../steps/Step4TeamInvite';
import { LiveWorkspacePreviewCanvas } from '../preview/LiveWorkspacePreviewCanvas';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CornerDownLeft,
  ShieldCheck,
  LayoutDashboard,
  BarChart3,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const OnboardingSplitShell: React.FC = () => {
  const {
    currentStepSlug,
    stepIndex,
    nextStep,
    prevStep,
    skipCurrentStep,
    completeCurrentStep,
    setActiveView,
    flyToDockAnimation
  } = useOnboardingStore();

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEP_ORDER.length - 1;

  // Keyboard shortcut listener for Enter (continue) and Esc (back)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or modal
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        completeCurrentStep();
      } else if (e.key === 'Escape' && !isFirstStep) {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [completeCurrentStep, prevStep, isFirstStep]);

  return (
    <div className="min-h-screen bg-canvas-light text-slate-900 flex flex-col">
      {/* Top utility bar for effortless prototype exploration */}
      <header className="h-11 border-b border-divider-light dark:border-divider-dark px-6 flex items-center justify-between text-xs bg-white dark:bg-slate-900 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="w-4 h-4 rounded bg-brand-custom flex items-center justify-center text-[10px] text-white">▲</span>
            <span>Acme Studio</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
            Tactile Zero-Friction Onboarding & Activation Suite
          </span>
        </div>

        {/* Quick jump tabs to view Main Dashboard or Admin Analytics Console */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-[11px]"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
            <span>View SaaS Dashboard & Dock</span>
          </button>

          <button
            onClick={() => setActiveView('admin')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-[11px]"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
            <span>Growth Funnel Cockpit</span>
          </button>
        </div>
      </header>

      {/* Master 2-Column Split Viewport */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Focused Setup Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between px-6 sm:px-12 lg:px-16 py-8 overflow-y-auto bg-white dark:bg-slate-900 relative">
          {/* Top Multi-Signal Header */}
          <MultiStepProgressHeader />

          {/* Center Interactive Question Stage */}
          <div className={`my-auto py-4 max-w-xl w-full mx-auto transition-transform duration-500 ${flyToDockAnimation ? 'scale-95 opacity-60 translate-y-8' : ''}`}>
            {currentStepSlug === 'identity' && <Step1WorkspaceIdentity />}
            {currentStepSlug === 'persona' && <Step2PersonaAndGoals />}
            {currentStepSlug === 'integrations' && <Step3IntegrationsAndData />}
            {currentStepSlug === 'team' && <Step4TeamInvite />}
          </div>

          {/* Bottom Sticky Navigation & Escape-Hatch Footer */}
          <div className="pt-6 mt-6 border-t border-divider-light dark:border-divider-dark flex flex-wrap items-center justify-between gap-3 max-w-xl w-full mx-auto">
            {/* Left: Back button & Auto-save heartbeat */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={isFirstStep}
                className={`text-xs font-medium px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  isFirstStep
                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
                <span className="font-mono text-[10px] opacity-60 hidden sm:inline">Esc</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Auto-saved</span>
              </div>
            </div>

            {/* Right Cluster: Skip for now & Primary Continue CTA */}
            <div className="flex items-center gap-3">
              {/* Skip for now escape hatch */}
              {!isLastStep && (
                <button
                  type="button"
                  onClick={skipCurrentStep}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-2 py-1.5 rounded-lg hover:underline"
                >
                  Skip for now — I'll do this in app →
                </button>
              )}

              {/* Primary CTA */}
              <button
                type="button"
                onClick={completeCurrentStep}
                className="text-xs font-semibold text-white bg-brand-custom hover:opacity-90 px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all transform active:scale-98"
              >
                <span>
                  {isLastStep ? 'Launch Workspace 🚀' : `Continue to ${STEP_METADATA[STEP_ORDER[stepIndex + 1]].title.split(' ')[0]}`}
                </span>
                <CornerDownLeft className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Workspace Mirror (5 cols) */}
        <div className="lg:col-span-5 bg-canvas-secondary dark:bg-canvas-secondary-dark border-l border-divider-light dark:border-divider-dark p-6 lg:p-8 flex flex-col justify-center items-center dot-matrix-bg relative overflow-hidden">
          <LiveWorkspacePreviewCanvas />
        </div>
      </div>
    </div>
  );
};
