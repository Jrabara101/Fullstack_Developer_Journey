import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Command,
  LayoutDashboard,
  Users,
  Terminal,
  Receipt,
  Download,
  ShieldAlert,
  Zap,
  Check,
  X
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onExecuteAction
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Command palette options
  const commands = [
    {
      category: 'Navigation',
      items: [
        { id: 'nav-overview', label: 'Go to Overview Dashboard', icon: LayoutDashboard, action: () => onNavigate('overview') },
        { id: 'nav-analytics', label: 'Go to Telemetry & Analytics', icon: Zap, action: () => onNavigate('analytics') },
        { id: 'nav-users', label: 'Go to Users & Permissions', icon: Users, action: () => onNavigate('users') },
        { id: 'nav-billing', label: 'Go to Billing & Revenue Allocation', icon: Receipt, action: () => onNavigate('billing') },
        { id: 'nav-logs', label: 'Go to System Audit Logs', icon: Terminal, action: () => onNavigate('logs') },
      ]
    },
    {
      category: 'Operational Commands',
      items: [
        { id: 'cmd-triage', label: 'Triage P1 Incident (Cluster eu-central-1)', icon: ShieldAlert, action: () => onExecuteAction('triage-incident') },
        { id: 'cmd-export', label: 'Export Current Table View to CSV', icon: Download, action: () => onExecuteAction('export-csv') },
        { id: 'cmd-batch', label: 'Create New Multi-Tenant Batch Action', icon: Zap, action: () => onExecuteAction('create-batch') },
      ]
    },
    {
      category: 'Table Filters',
      items: [
        { id: 'filter-high-spenders', label: 'View: High Spenders (>$20,000/mo)', icon: Search, action: () => onExecuteAction('view-high-spenders') },
        { id: 'filter-pending', label: 'View: Pending Access Approvals', icon: Search, action: () => onExecuteAction('view-pending') },
        { id: 'filter-suspended', label: 'View: Suspended & Flagged Accounts', icon: Search, action: () => onExecuteAction('view-suspended') },
      ]
    }
  ];

  // Flattened filtered items
  const filteredCommands = commands.flatMap(cat =>
    cat.items
      .filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
      .map(item => ({ ...item, category: cat.category }))
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-surface-container-lowest border border-surface-container rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-surface-container flex items-center gap-3 bg-surface-container-low/50">
          <Search className="w-5 h-5 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, navigate, or filter data..."
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-outline">
              No matching commands or operations found for "{query}".
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-primary-container text-white shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-outline'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-container text-outline'
                  }`}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div className="px-4 py-2 bg-surface-container-low/60 border-t border-surface-container flex items-center justify-between text-[11px] text-outline font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-surface-container px-1 py-0.5 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="bg-surface-container px-1 py-0.5 rounded">↵</kbd> select</span>
            <span><kbd className="bg-surface-container px-1 py-0.5 rounded">esc</kbd> close</span>
          </div>
          <span>Apex Faceted Command Engine</span>
        </div>
      </div>
    </div>
  );
}
