import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Activity,
  Users,
  Receipt,
  Terminal,
  KeyRound,
  Network,
  History,
  Settings,
  ChevronDown,
  ChevronsUpDown,
  CheckCircle2,
  Layers
} from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav }) {
  const navSections = [
    {
      title: 'Core',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'live-ops', label: 'Live Ops', icon: Activity },
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'users', label: 'Users & Permissions', icon: Users },
        { id: 'billing', label: 'Billing & Revenue', icon: Receipt },
        { id: 'logs', label: 'System Logs', icon: Terminal },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { id: 'api-keys', label: 'API Keys', icon: KeyRound },
        { id: 'integrations', label: 'Integrations', icon: Network },
        { id: 'audit', label: 'Audit Trail', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-container-lowest z-40 flex flex-col justify-between border-r border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.03)] select-none">
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-surface-container-low bg-surface-container-lowest">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-sm font-bold text-sm">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-base text-on-surface tracking-tight">Apex</span>
          </div>
          <span className="bg-surface-container text-on-surface-variant font-mono text-[11px] px-2 py-0.5 rounded font-medium">
            v4.2
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navSections.map(section => (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-outline font-medium">
                {section.title}
              </div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all text-left ${
                      isActive
                        ? 'bg-primary-container text-on-primary font-medium shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-normal'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-on-primary' : 'text-outline'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer SLA & Tenant Selector */}
        <div className="p-3 border-t border-surface-container-low bg-surface-container-lowest space-y-2">
          {/* Operational Health Badge */}
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface-container-low/70 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-mono text-[11px] text-on-surface-variant font-medium">SLA Status</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 font-semibold">99.98%</span>
          </div>

          {/* Workspace Switcher */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-high/60 transition-colors cursor-pointer group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded bg-primary text-on-primary flex items-center justify-center font-mono text-xs font-bold shadow-xs">
                US
              </div>
              <div className="min-w-0">
                <div className="text-xs text-on-surface font-medium truncate group-hover:text-primary transition-colors">
                  US-East Prod
                </div>
                <div className="text-[11px] text-outline truncate">Enterprise Tier</div>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-outline group-hover:text-on-surface transition-colors" />
          </div>
        </div>
      </div>
    </aside>
  );
}
