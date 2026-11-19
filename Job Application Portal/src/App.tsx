import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { JobPortalDirectory } from './components/directory/JobPortalDirectory.tsx';
import { SplitApplicationStudio } from './components/apply/SplitApplicationStudio.tsx';
import { CandidateStatusPortal } from './components/tracker/CandidateStatusPortal.tsx';
import { MultiApplicationHub } from './components/myApplications/MultiApplicationHub.tsx';
import { RecruiterPipelineBoard } from './components/recruiter/RecruiterPipelineBoard.tsx';
import { JobPosting, JobApplication } from './types/index.ts';
import { fetchJobBySlug, fetchApplicationByIdOrCode, redeemHandoffToken, fetchApplications } from './utils/api.ts';

type ActiveView = 'jobs' | 'apply' | 'track' | 'my-applications' | 'recruiter';

function MainApp() {
  const { info, success, error } = useToast();
  const [activeView, setActiveView] = useState<ActiveView>('jobs');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [trackingCode, setTrackingCode] = useState<string>('APP-2026-8941');
  const [applicationCount, setApplicationCount] = useState<number>(2);
  const [slaBreachCount, setSlaBreachCount] = useState<number>(1);

  // Parse URL hash on initial load for direct navigation or magic handoffs
  useEffect(() => {
    async function handleInitialRoute() {
      const hash = window.location.hash.replace('#', '');
      const path = window.location.pathname;

      if (path.startsWith('/handoff/') || hash.startsWith('handoff/')) {
        const token = path.replace('/handoff/', '') || hash.replace('handoff/', '');
        try {
          const res = await redeemHandoffToken(token);
          if (res.valid) {
            success('Device Handoff Successful!', 'Restored in-progress session.');
            setTrackingCode(res.trackingCode);
            setActiveView('track');
          }
        } catch (e) {
          console.error(e);
        }
      } else if (hash.startsWith('track/')) {
        const code = hash.replace('track/', '');
        setTrackingCode(code);
        setActiveView('track');
      } else if (hash === 'recruiter') {
        setActiveView('recruiter');
      } else if (hash === 'my-applications') {
        setActiveView('my-applications');
      }

      // Check app count & SLA metrics
      try {
        const res = await fetchApplications();
        setApplicationCount(res.applications.length);
        setSlaBreachCount(res.metrics.slaBreachedCount);
      } catch (err) {
        // quiet fallback
      }
    }

    handleInitialRoute();
  }, []);

  const handleStartApply = (job: JobPosting) => {
    setSelectedJob(job);
    setSelectedApplication(null);
    setActiveView('apply');
    window.location.hash = `apply/${job.slug}`;
  };

  const handleResumeDraft = (app: JobApplication) => {
    fetchJobBySlug(app.jobId)
      .then(res => {
        setSelectedJob(res.job);
        setSelectedApplication(app);
        setActiveView('apply');
      })
      .catch(() => {
        // Fallback default
        setSelectedApplication(app);
        setActiveView('apply');
      });
  };

  const handleOpenLiveTracker = (code: string) => {
    setTrackingCode(code);
    setActiveView('track');
    window.location.hash = `track/${code}`;
  };

  const handleApplicationSubmitSuccess = (app: JobApplication) => {
    setSelectedApplication(app);
    setTrackingCode(app.trackingCode);
    setActiveView('track');
    window.location.hash = `track/${app.trackingCode}`;
  };

  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-brand-500/20 selection:text-brand-600 transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={view => {
          setActiveView(view);
          window.location.hash = view;
        }}
        applicationCount={applicationCount}
        slaBreachCount={slaBreachCount}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeView === 'jobs' && (
          <JobPortalDirectory
            onSelectJobToApply={handleStartApply}
            onNavigateToDraft={() => setActiveView('my-applications')}
          />
        )}

        {activeView === 'apply' && selectedJob && (
          <SplitApplicationStudio
            job={selectedJob}
            initialApplication={selectedApplication}
            onExit={() => {
              setActiveView('jobs');
              window.location.hash = 'jobs';
            }}
            onSubmitSuccess={handleApplicationSubmitSuccess}
          />
        )}

        {activeView === 'track' && (
          <CandidateStatusPortal
            applicationIdOrCode={trackingCode}
            onBackToDirectory={() => {
              setActiveView('jobs');
              window.location.hash = 'jobs';
            }}
          />
        )}

        {activeView === 'my-applications' && (
          <MultiApplicationHub
            onResumeDraft={handleResumeDraft}
            onOpenLiveTracker={handleOpenLiveTracker}
            onExploreMoreRoles={() => {
              setActiveView('jobs');
              window.location.hash = 'jobs';
            }}
          />
        )}

        {activeView === 'recruiter' && (
          <RecruiterPipelineBoard
            onViewCandidateLiveTracker={handleOpenLiveTracker}
          />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-divider-light dark:border-divider-dark py-6 px-6 text-center text-xs text-slate-500 font-mono transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Atelier Candidate Experience Engine • Dual-Layer Keystroke Persistence Active</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Respectful Anti-Ghosting SLA &le; 5 Business Days</span>
            <span>•</span>
            <span>WCAG 2.1 AAA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
