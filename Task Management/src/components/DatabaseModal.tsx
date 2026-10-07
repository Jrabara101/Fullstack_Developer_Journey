import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { Storage } from '../utils/storage';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'sync'>('schema');

  if (!isOpen) return null;

  const sqlSchema = `-- FocusFlow: PostgreSQL / Supabase Production Schema
-- Tables: tasks, projects, tags, task_tags, subtasks, task_activity_logs
-- Security: Strict Row-Level Security (RLS)
-- Functions: Nightly Rollover Worker & Lexorank indexing

CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority VARCHAR(4) NOT NULL DEFAULT 'p3',
    status VARCHAR(16) NOT NULL DEFAULT 'todo',
    due_date DATE,
    due_time TIME,
    scheduled_date DATE,
    estimated_minutes INT DEFAULT 30,
    energy VARCHAR(16) DEFAULT 'deep_work',
    recurrence_rule TEXT DEFAULT 'none',
    reschedule_count INT DEFAULT 0,
    sort_order DOUBLE PRECISION DEFAULT 1000.0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation" ON public.tasks FOR ALL USING (auth.uid() = user_id);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const json = Storage.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && Storage.importData(content)) {
        alert('Data imported successfully! Reloading...');
        window.location.reload();
      } else {
        alert('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all animate-in fade-in select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-6 text-gray-900 dark:text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Backend Architecture & Supabase Engine
              </h2>
              <span className="text-[11px] font-mono text-gray-400">
                PostgreSQL • Row-Level Security • Rollover Worker
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-gray-100 dark:border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === 'schema'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            PostgreSQL Schema (DDL)
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === 'sync'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Data Portability & Backup
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'schema' ? (
          <div className="py-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Includes multi-tenant RLS policies and rollover worker function</span>
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="p-3 bg-gray-900 text-gray-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-[320px] leading-relaxed border border-gray-800">
              <code>{sqlSchema}</code>
            </pre>
            <div className="text-[11px] font-mono text-gray-400">
              Full production schema file saved at: <code className="text-blue-400">supabase/schema.sql</code>
            </div>
          </div>
        ) : (
          <div className="py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#141517] border border-gray-200 dark:border-gray-800 space-y-2">
                <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Export Local Snapshot</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Download all active and archived tasks, subtasks, projects, and capacity metrics in standard JSON.
                </p>
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs"
                >
                  Download Backup JSON
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#141517] border border-gray-200 dark:border-gray-800 space-y-2">
                <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>Restore from JSON</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Restore tasks and projects from a previously exported backup payload.
                </p>
                <label className="inline-block px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium text-xs cursor-pointer">
                  <span>Upload File</span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Want to clear everything and restore default showcase data?
              </span>
              <button
                onClick={() => {
                  if (confirm('Reset all tasks and projects to initial demo state?')) {
                    Storage.resetToDefault();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Seed Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
