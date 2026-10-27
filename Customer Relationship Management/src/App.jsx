// ============================================================================
// AetherCRM Root Application Component
// High-Velocity Zero-Admin Relational CRM & Revenue Suite
// ============================================================================

import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import KanbanBoard from './components/kanban/KanbanBoard';
import RelationalGrid from './components/grid/RelationalGrid';
import RevenueForecastConsole from './components/forecast/RevenueForecastConsole';
import ReconnectRadar from './components/reconnect/ReconnectRadar';
import Account360Inspector from './components/inspector/Account360Inspector';
import StageGateModal from './components/modals/StageGateModal';
import CommandPalette from './components/modals/CommandPalette';
import NewDealModal from './components/modals/NewDealModal';
import JobChangeModal from './components/modals/JobChangeModal';
import ShortcutsModal from './components/modals/ShortcutsModal';

function WorkspaceLayout() {
  const { activeView } = useCRM();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Collapsible Left Rail (240px) */}
      <Sidebar />

      {/* Main Stage */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top 4-Segment Live Horizon Bar & View Switcher */}
        <Navbar />

        {/* Dynamic Workspace Canvas */}
        <main className="flex-1 flex overflow-hidden">
          {activeView === 'kanban' && <KanbanBoard />}
          {activeView === 'grid' && <RelationalGrid />}
          {activeView === 'forecast' && <RevenueForecastConsole />}
          {activeView === 'reconnect' && <ReconnectRadar />}
        </main>
      </div>

      {/* Modals & Inspectors */}
      <Account360Inspector />
      <StageGateModal />
      <CommandPalette />
      <NewDealModal />
      <JobChangeModal />
      <ShortcutsModal />
    </div>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <WorkspaceLayout />
    </CRMProvider>
  );
}
