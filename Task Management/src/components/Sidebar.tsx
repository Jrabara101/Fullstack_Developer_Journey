import React, { useState } from 'react';
import {
  Inbox,
  Sun,
  Calendar,
  Layers,
  Archive,
  Grid2X2,
  Plus,
  Hash,
  Sparkles,
  Command,
  Moon,
  Volume2,
  VolumeX,
  HelpCircle,
  Database,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import type { ViewType, Project, Tag } from '../types';
import { isSoundEnabled, setSoundEnabled, playTactileClick } from '../utils/sound';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  projects: Project[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  tags: Tag[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  counts: {
    inbox: number;
    today: number;
    upcoming: number;
    someday: number;
    overdue: number;
    stagnant: number;
  };
  onOpenQuickAdd: () => void;
  onOpenTriage: () => void;
  onOpenShortcuts: () => void;
  onOpenDatabase: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  tags,
  selectedTag,
  setSelectedTag,
  counts,
  onOpenQuickAdd,
  onOpenTriage,
  onOpenShortcuts,
  onOpenDatabase,
  theme,
  toggleTheme,
}) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playTactileClick();
  };

  const navItems = [
    { id: 'inbox' as ViewType, label: 'Inbox', icon: Inbox, count: counts.inbox, hotkey: '1' },
    { id: 'today' as ViewType, label: 'Today', icon: Sun, count: counts.today, color: 'text-amber-500', hotkey: '2' },
    { id: 'upcoming' as ViewType, label: 'Upcoming', icon: Calendar, count: counts.upcoming, hotkey: '3' },
    { id: 'anytime' as ViewType, label: 'Anytime', icon: Layers, hotkey: '4' },
    { id: 'someday' as ViewType, label: 'Someday', icon: Archive, count: counts.someday, hotkey: '5' },
    { id: 'matrix' as ViewType, label: 'Eisenhower Matrix', icon: Grid2X2, badge: 'Quad', hotkey: 'M' },
  ];

  return (
    <aside className="w-64 h-full flex flex-col border-r border-[#E5E7EB] dark:border-[#26292D] bg-[#F7F8F9] dark:bg-[#141517] transition-colors select-none text-[13px] font-sans">
      {/* Top Workspace Header */}
      <div className="p-3 border-b border-[#E5E7EB] dark:border-[#26292D] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 tracking-tight leading-none text-sm">
              FocusFlow
            </div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
              Production Suite
            </div>
          </div>
        </div>

        {/* Global Quick Capture Shortcut Trigger */}
        <button
          onClick={onOpenQuickAdd}
          title="Quick Capture (Cmd+K)"
          className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-[#26292D] text-gray-500 dark:text-gray-400 transition-colors flex items-center gap-1 text-[11px] font-mono border border-transparent hover:border-gray-300 dark:hover:border-gray-700"
        >
          <Command className="w-3.5 h-3.5" />
          <span>K</span>
        </button>
      </div>

      {/* Triage Banner Action */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenTriage}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium transition-all group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span>Triage Ritual</span>
          </div>
          <span className="text-[11px] font-mono px-1.5 py-0.2 bg-blue-200/60 dark:bg-blue-800/60 rounded text-blue-800 dark:text-blue-200">
            Sweep (T)
          </span>
        </button>
      </div>

      {/* Main Views Navigation */}
      <nav className="p-3 space-y-0.5">
        <div className="px-2 pb-1 text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Smart Horizons
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id && !selectedProjectId && !selectedTag;
          return (
            <button
              key={item.id}
              onClick={() => {
                playTactileClick();
                setActiveView(item.id);
                setSelectedProjectId(null);
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-left font-medium ${
                isActive
                  ? 'bg-white dark:bg-[#1C1D21] text-blue-600 dark:text-blue-400 shadow-xs border border-gray-200/80 dark:border-gray-800'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-[#1C1D21]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${item.color || (isActive ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400')}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-200/70 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Projects Section */}
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 pb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Projects
          </span>
          <button
            onClick={() => setIsAddingProject(!isAddingProject)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#26292D] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="Create Project"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {isAddingProject && (
          <div className="mb-2 px-2">
            <input
              type="text"
              autoFocus
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newProjectName.trim()) {
                  // In demo, we could trigger creation
                  setIsAddingProject(false);
                  setNewProjectName('');
                } else if (e.key === 'Escape') {
                  setIsAddingProject(false);
                }
              }}
              className="w-full text-xs px-2 py-1 rounded bg-white dark:bg-[#1C1D21] border border-blue-500 text-gray-900 dark:text-white outline-none"
            />
          </div>
        )}

        <div className="space-y-0.5">
          {projects.map((proj) => {
            const isSelected = selectedProjectId === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => {
                  playTactileClick();
                  setActiveView('project');
                  setSelectedProjectId(proj.id);
                  setSelectedTag(null);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-left ${
                  isSelected
                    ? 'bg-white dark:bg-[#1C1D21] text-gray-900 dark:text-gray-100 font-medium shadow-xs border border-gray-200/80 dark:border-gray-800'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-[#1C1D21]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color }}
                  />
                  <span className="truncate">{proj.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tags Section */}
        <div className="pt-4">
          <div className="px-2 pb-1.5 text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Contextual Tags
          </div>
          <div className="flex flex-wrap gap-1 px-1.5">
            {tags.map((tg) => {
              const isSelected = selectedTag === tg.name;
              return (
                <button
                  key={tg.id}
                  onClick={() => {
                    playTactileClick();
                    if (isSelected) {
                      setSelectedTag(null);
                      setActiveView('today');
                    } else {
                      setActiveView('tag');
                      setSelectedTag(tg.name);
                      setSelectedProjectId(null);
                    }
                  }}
                  className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full transition-colors border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-white dark:bg-[#1C1D21] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <Hash className="w-2.5 h-2.5 opacity-60" />
                  <span>{tg.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stagnancy & Overdue Warning Chips */}
        {(counts.overdue > 0 || counts.stagnant > 0) && (
          <div className="mt-5 space-y-1.5 pt-3 border-t border-[#E5E7EB] dark:border-[#26292D]">
            {counts.overdue > 0 && (
              <div className="flex items-center justify-between px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-overdue-pulse" />
                  Overdue
                </span>
                <span className="font-mono font-bold">{counts.overdue}</span>
              </div>
            )}
            {counts.stagnant > 0 && (
              <div className="flex items-center justify-between px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Stagnant
                </span>
                <span className="font-mono font-bold">{counts.stagnant}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Utility Rail */}
      <div className="p-3 border-t border-[#E5E7EB] dark:border-[#26292D] bg-[#F7F8F9] dark:bg-[#141517] flex items-center justify-between text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-[#26292D] hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleSound}
            title={soundOn ? 'Tactile Audio: Enabled' : 'Tactile Audio: Muted'}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-[#26292D] hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>
          <button
            onClick={onOpenDatabase}
            title="PostgreSQL / Supabase Schema"
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-[#26292D] hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#26292D] hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-mono"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>?</span>
        </button>
      </div>
    </aside>
  );
};
