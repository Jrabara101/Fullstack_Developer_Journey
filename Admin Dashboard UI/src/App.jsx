import React, { useState, useEffect } from 'react';
import Sidebar from './components/dashboard/Sidebar';
import Header from './components/dashboard/Header';
import IncidentAlertBanner from './components/dashboard/IncidentAlertBanner';
import KpiCards from './components/dashboard/KpiCards';
import ThroughputChart from './components/dashboard/ThroughputChart';
import PlanDistributionChart from './components/dashboard/PlanDistributionChart';
import InfrastructureGallery from './components/dashboard/InfrastructureGallery';
import UserTable from './components/dashboard/UserTable';
import CommandPalette from './components/dashboard/CommandPalette';
import Toast from './components/dashboard/Toast';
import { INITIAL_NOTIFICATIONS } from './data/mockData';
import { SlidersHorizontal, Download, Plus, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeNav, setActiveNav] = useState('overview');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [incidentBannerVisible, setIncidentBannerVisible] = useState(true);
  const [activeKpiFilter, setActiveKpiFilter] = useState(null);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeDateRange, setActiveDateRange] = useState('Oct 1 - Oct 31, 2024');
  const [lastSyncTime, setLastSyncTime] = useState('14s ago');

  // Trigger toast with auto-dismiss
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notification action handler
  const handleNotificationAction = (notifId, actionId) => {
    if (actionId === 'triage') {
      showToast('Redirected to Incident Room: INC-8942 · eu-central-1');
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } else if (actionId === 'ack') {
      showToast('Incident acknowledged by operator.');
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } else if (actionId === 'approve_role') {
      showToast('Approved privilege escalation for David Wayne (Admin role).');
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } else if (actionId === 'deny_role') {
      showToast('Declined privilege escalation request.');
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    }
  };

  // Command palette execution
  const handleExecuteCommand = (commandId) => {
    if (commandId === 'triage-incident') {
      showToast('Opening incident triage interface for Cluster eu-central-1.');
    } else if (commandId === 'export-csv') {
      showToast('Generated enterprise telemetry CSV report.');
    } else if (commandId === 'create-batch') {
      showToast('Opened batch action orchestrator modal.');
    } else if (commandId === 'view-high-spenders') {
      showToast('Applied filter: High Spenders (>$20k).');
    } else if (commandId === 'view-pending') {
      showToast('Applied filter: Pending Approvals.');
    } else if (commandId === 'view-suspended') {
      showToast('Applied filter: Suspended Accounts.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* 1. Collapsible / Persistent Sidebar */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* 2. Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        <Header
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          notifications={notifications}
          onNotificationAction={handleNotificationAction}
          activeDateRange={activeDateRange}
          setActiveDateRange={setActiveDateRange}
        />

        <main className="pt-14 px-6 md:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          {/* 5-Second Rule: Incident Alert Bar */}
          <IncidentAlertBanner
            isVisible={incidentBannerVisible}
            onTriage={() => showToast('Opening incident triage view for INC-8942...')}
            onDismiss={() => setIncidentBannerVisible(false)}
          />

          {/* Page Title & Operational Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                  Enterprise Overview
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-mono text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Edge Feed
                </span>
              </div>
              <p className="text-xs text-outline flex items-center gap-2">
                <span>Real-time Operations & Multi-Tenant Telemetry</span>
                <span className="inline-block w-1 h-1 rounded-full bg-outline-variant" />
                <span className="font-mono text-on-surface-variant font-medium">
                  Last synced {lastSyncTime}
                </span>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-medium border border-surface-container shadow-xs transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-outline" />
                <span>Filter Presets</span>
              </button>

              <button
                onClick={() => showToast('Exporting global system report...')}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-medium border border-surface-container shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-outline" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => showToast('Opened Batch Action Builder modal.')}
                className="h-8 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Batch Action</span>
              </button>
            </div>
          </div>

          {/* KPI Metric Cards */}
          <KpiCards
            activeKpi={activeKpiFilter}
            onFilterByKpi={id => {
              setActiveKpiFilter(prev => prev === id ? null : id);
              showToast(`Drilled down into metric: ${id}`);
            }}
          />

          {/* React Bits AccordionGallery: Regional Datacenters & Edge Infrastructure */}
          <InfrastructureGallery
            onSelectNode={node => showToast(`Selected node: ${node.label}`)}
          />

          {/* Visualizations Grid: Area Throughput Chart (2/3) + Donut Distribution (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2">
              <ThroughputChart />
            </div>
            <div className="lg:col-span-1">
              <PlanDistributionChart />
            </div>
          </div>

          {/* High-Density Actionable Data Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-on-surface">
                  Enterprise User & Tenant Directory
                </h3>
                <p className="text-xs text-outline">
                  High-density actionable operational workspace with bulk batch operations
                </p>
              </div>
            </div>
            <UserTable onToast={showToast} />
          </div>
        </main>
      </div>

      {/* Global Cmd + K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={navId => {
          setActiveNav(navId);
          showToast(`Navigated to: ${navId}`);
        }}
        onExecuteAction={handleExecuteCommand}
      />

      {/* Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
