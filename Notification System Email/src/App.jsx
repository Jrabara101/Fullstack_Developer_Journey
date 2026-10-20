import React, { useState, useEffect } from 'react';
import { NavigationBar } from './components/layout/NavigationBar';
import { NotificationInboxView } from './components/views/NotificationInboxView';
import { NotificationMatrixTable } from './components/views/NotificationMatrixTable';
import { TransactionalEmailPreview } from './components/views/TransactionalEmailPreview';
import { DeliveryAuditModal } from './components/views/DeliveryAuditModal';
import { EventSimulatorDrawer } from './components/devtools/EventSimulatorDrawer';
import { QueueDiagnosticsDrawer } from './components/devtools/QueueDiagnosticsDrawer';
import { UndoToast } from './components/notification/UndoToast';
import { useNotifications } from './context/NotificationContext';

export function App() {
  const [currentView, setCurrentView] = useState('inbox'); // 'inbox', 'settings'
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);

  const {
    auditTarget,
    setAuditTarget,
    emailPreviewTarget,
    setEmailPreviewTarget,
  } = useNotifications();

  // Keyboard shortcut listener for Cmd+I or Ctrl+I to toggle bell
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        const bellBtn = document.getElementById('notification-bell-button');
        bellBtn?.click();
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0B0E] text-slate-900 dark:text-[#F8FAFC]">
      {/* Top Application Bar */}
      <NavigationBar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSimulator={() => setSimulatorOpen(true)}
        onOpenDiagnostics={() => setDiagnosticsOpen(true)}
      />

      {/* Main Content Horizon */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {currentView === 'inbox' ? (
          <NotificationInboxView />
        ) : (
          <NotificationMatrixTable />
        )}
      </main>

      {/* 5-Second Non-Blocking Undo Toast */}
      <UndoToast />

      {/* Transactional Email Preview Modal (Blueprint D) */}
      {emailPreviewTarget && (
        <TransactionalEmailPreview
          notification={emailPreviewTarget}
          onClose={() => setEmailPreviewTarget(null)}
        />
      )}

      {/* Personal Delivery Transparency Audit Log Modal */}
      {auditTarget && (
        <DeliveryAuditModal
          notification={auditTarget}
          onClose={() => setAuditTarget(null)}
        />
      )}

      {/* Real-Time Webhook Simulator Drawer */}
      <EventSimulatorDrawer
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      {/* BullMQ & Redis Queue Diagnostics Drawer */}
      <QueueDiagnosticsDrawer
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
      />
    </div>
  );
}

export default App;
