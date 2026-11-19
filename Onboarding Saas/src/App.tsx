import React, { useEffect } from 'react';
import { useOnboardingStore, STEP_ORDER, type StepSlug } from './store/useOnboardingStore';
import { OnboardingSplitShell } from './components/onboarding/OnboardingSplitShell';
import { MainSaaSDashboard } from './components/dashboard/MainSaaSDashboard';
import { OnboardingAnalyticsConsole } from './components/admin/OnboardingAnalyticsConsole';
import { TeammateDelegationPortal } from './components/delegation/TeammateDelegationPortal';
import { NotificationToast } from './components/common/NotificationToast';

export function App() {
  const {
    activeView,
    setActiveView,
    currentStepSlug,
    goToStep,
    initWebSocket,
    activeDelegationToken
  } = useOnboardingStore();

  // Initialize WebSockets and URL parameter parsing on mount
  useEffect(() => {
    initWebSocket();

    const parseParams = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const tokenParam = params.get('token');
      const stepParam = params.get('step') as StepSlug | null;

      if (viewParam === 'delegate') {
        setActiveView('teammate_portal');
      } else if (viewParam === 'dashboard') {
        setActiveView('dashboard');
      } else if (viewParam === 'admin') {
        setActiveView('admin');
      } else if (viewParam === 'onboarding') {
        setActiveView('onboarding');
      }

      if (stepParam && STEP_ORDER.includes(stepParam)) {
        goToStep(stepParam);
      }
    };

    parseParams();

    const handlePopState = () => {
      parseParams();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state to URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeView === 'onboarding') {
      params.set('view', 'onboarding');
      params.set('step', currentStepSlug);
      params.delete('token');
    } else if (activeView === 'dashboard') {
      params.set('view', 'dashboard');
      params.delete('step');
    } else if (activeView === 'admin') {
      params.set('view', 'admin');
      params.delete('step');
    } else if (activeView === 'teammate_portal') {
      params.set('view', 'delegate');
      if (activeDelegationToken) params.set('token', activeDelegationToken);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeView, currentStepSlug, activeDelegationToken]);

  return (
    <div className="min-h-screen bg-canvas-light text-slate-900 selection:bg-brand-custom selection:text-white">
      {activeView === 'onboarding' && <OnboardingSplitShell />}
      {activeView === 'dashboard' && <MainSaaSDashboard />}
      {activeView === 'admin' && <OnboardingAnalyticsConsole />}
      {activeView === 'teammate_portal' && <TeammateDelegationPortal token={activeDelegationToken || 'tk_magic_direct'} />}
      
      {/* Toast Notification Layer */}
      <NotificationToast />
    </div>
  );
}

export default App;
