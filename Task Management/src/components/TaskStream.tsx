import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import type { Task, Project, ViewType, GroupingMode, Priority, EnergyLevel } from '../types';
import { TaskCard } from './TaskCard';
import { parseNaturalLanguageInput } from '../utils/parser';

interface TaskGroup {
  key: string;
  label: string;
  priority?: Priority;
  color?: string;
  items: Task[];
}

interface TaskStreamProps {
  tasks: Task[];
  projects: Project[];
  activeView: ViewType;
  selectedProject?: Project;
  selectedTag: string | null;
  selectedTaskId: string | null;
  focusedTaskId: string | null;
  groupingMode: GroupingMode;
  setGroupingMode: (mode: GroupingMode) => void;
  energyFilter: EnergyLevel | 'all';
  setEnergyFilter: (energy: EnergyLevel | 'all') => void;
  dailyCapacityHours: number;
  todayEstimatedMinutes: number;
  isOverbooked: boolean;
  dailyBig3Count: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  onSelectTask: (id: string) => void;
  onToggleComplete: (id: string, e: React.MouseEvent) => void;
  onReschedule: (id: string, days: number) => void;
  onSetPriority: (id: string, priority: Priority) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onStartFocus: (id: string) => void;
  onAddTask: (data: Partial<Task>) => void;
}

export const TaskStream: React.FC<TaskStreamProps> = ({
  tasks,
  projects,
  activeView,
  selectedProject,
  selectedTag,
  selectedTaskId,
  focusedTaskId,
  groupingMode,
  setGroupingMode,
  energyFilter,
  setEnergyFilter,
  dailyCapacityHours,
  todayEstimatedMinutes,
  isOverbooked,
  dailyBig3Count,
  todayCompletedCount,
  todayTotalCount,
  onSelectTask,
  onToggleComplete,
  onReschedule,
  onSetPriority,
  onArchive,
  onDelete,
  onStartFocus,
  onAddTask,
}) => {
  const [inlineInput, setInlineInput] = useState('');

  // Handle inline quick add
  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineInput.trim()) return;

    const parsed = parseNaturalLanguageInput(inlineInput);
    onAddTask({
      title: parsed.cleanTitle,
      priority: parsed.priority || 'p3',
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      scheduledDate: parsed.scheduledDate,
      estimatedMinutes: parsed.estimatedMinutes || 30,
      tags: parsed.tags,
      energy: parsed.energy,
    });

    setInlineInput('');
  };

  // Header Title
  const getHeaderTitle = () => {
    if (selectedProject) return selectedProject.name;
    if (selectedTag) return `#${selectedTag}`;
    switch (activeView) {
      case 'inbox':
        return 'Inbox';
      case 'today': {
        const today = new Date();
        const formatted = today.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        });
        return `Today • ${formatted}`;
      }
      case 'upcoming':
        return 'Upcoming Schedule';
      case 'anytime':
        return 'Anytime';
      case 'someday':
        return 'Someday & Archived';
      default:
        return 'Tasks';
    }
  };

  // Capacity calculations
  const totalCapacityMinutes = dailyCapacityHours * 60;
  const capacityPercent = Math.min(Math.round((todayEstimatedMinutes / totalCapacityMinutes) * 100), 100);

  // Group tasks
  const groupedTasks: TaskGroup[] = React.useMemo(() => {
    if (groupingMode === 'none') {
      return [{ key: 'all', label: 'All Tasks', items: tasks }];
    }

    if (groupingMode === 'priority') {
      const priorityOrder: Priority[] = ['p1', 'p2', 'p3', 'p4'];
      const labels: Record<Priority, string> = {
        p1: 'P1 — Urgent & Crucial',
        p2: 'P2 — High Priority',
        p3: 'P3 — Medium Priority',
        p4: 'P4 — Someday / Backlog',
      };

      return priorityOrder
        .map((p) => ({
          key: p,
          label: labels[p],
          priority: p,
          items: tasks.filter((t) => t.priority === p),
        }))
        .filter((g) => g.items.length > 0);
    }

    if (groupingMode === 'project') {
      const groups = projects.map((proj) => ({
        key: proj.id,
        label: proj.name,
        color: proj.color,
        items: tasks.filter((t) => t.projectId === proj.id),
      }));

      const noProject = tasks.filter((t) => !t.projectId);
      if (noProject.length > 0) {
        groups.push({
          key: 'no-proj',
          label: 'No Project (Inbox)',
          color: '#94A3B8',
          items: noProject,
        });
      }

      return groups.filter((g) => g.items.length > 0);
    }

    return [{ key: 'all', label: 'Tasks', items: tasks }];
  }, [tasks, groupingMode, projects]);

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#FFFFFF] dark:bg-[#0C0D0E] transition-colors select-none font-sans">
      {/* Header Ribbon */}
      <header className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#26292D] shrink-0 bg-white/70 dark:bg-[#0C0D0E]/70 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {selectedProject && (
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProject.color }} />
              )}
              <span>{getHeaderTitle()}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
              {activeView === 'today' && (
                <span>
                  {todayCompletedCount} of {todayTotalCount} completed
                </span>
              )}
              {tasks.length > 0 && <span>• {tasks.length} active in stream</span>}
            </div>
          </div>

          {/* Controls: Grouping & Energy Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Energy Filter Pills */}
            <div className="flex items-center bg-gray-100 dark:bg-[#1C1D21] p-0.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'deep_work', label: '🧠 Deep' },
                  { id: 'quick_hit', label: '⚡ Quick' },
                  { id: 'low_energy', label: '🔋 Low' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setEnergyFilter(f.id)}
                  className={`px-2 py-1 rounded-md transition-all font-medium ${
                    energyFilter === f.id
                      ? 'bg-white dark:bg-[#26292D] text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grouping Selector */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1C1D21] p-1 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-600 dark:text-gray-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 ml-1" />
              <select
                value={groupingMode}
                onChange={(e) => setGroupingMode(e.target.value as GroupingMode)}
                className="bg-transparent border-none text-xs outline-none cursor-pointer pr-1"
              >
                <option value="priority" className="dark:bg-[#1C1D21]">By Priority</option>
                <option value="project" className="dark:bg-[#1C1D21]">By Project</option>
                <option value="none" className="dark:bg-[#1C1D21]">Ungrouped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Temporal Ergonomics: Daily Horizon Capacity Meter (Shown on 'today' view) */}
        {activeView === 'today' && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-gray-600 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  Daily Horizon: <strong>{(todayEstimatedMinutes / 60).toFixed(1)}h</strong> / {dailyCapacityHours}h planned
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="w-28 sm:w-40 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOverbooked ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Overbooked or Big 3 Status */}
            {isOverbooked ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40">
                <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                Overbooked! (+{((todayEstimatedMinutes - totalCapacityMinutes) / 60).toFixed(1)}h)
              </span>
            ) : (
              <span className="text-[11px] font-mono text-gray-400">
                {dailyCapacityHours * 60 - todayEstimatedMinutes > 0
                  ? `${Math.round(dailyCapacityHours * 60 - todayEstimatedMinutes)}m focus reserve remaining`
                  : 'At exact daily capacity'}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Anti-Overwhelm Banner: The Daily Big 3 Soft Ceiling */}
      {activeView === 'today' && dailyBig3Count > 3 && (
        <div className="mx-6 mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">The Daily Big 3 Alert:</strong> You have {dailyBig3Count} high-priority
            commitments scheduled for today. Cognitive ergonomics recommends committing to no more than 3 critical
            anchors per day to guarantee quality and avoid burnout.
          </div>
        </div>
      )}

      {/* Task Stream Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Inline Quick-Add Row */}
        <form onSubmit={handleInlineSubmit} className="relative">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#26292D] bg-white dark:bg-[#141517] focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-xs transition-all">
            <Plus className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={inlineInput}
              onChange={(e) => setInlineInput(e.target.value)}
              placeholder="Add a task... Press Enter to save, or use #project @deepwork !p1 ~45m"
              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none font-sans"
            />
            {inlineInput.trim() && (
              <button
                type="submit"
                className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
              >
                ↵ Add
              </button>
            )}
          </div>
        </form>

        {/* Task Groups */}
        {groupedTasks.length === 0 || tasks.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#1C1D21] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500/70" />
            </div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Clean Slate Horizon</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm">
              All tasks in this view are resolved or none matched the current filter. Enjoy uninterrupted deep focus.
            </p>
          </div>
        ) : (
          groupedTasks.map((group) => (
            <div key={group.key} className="space-y-1.5">
              {/* Group Header */}
              {groupingMode !== 'none' && (
                <div className="flex items-center justify-between pb-1 px-1">
                  <div className="flex items-center gap-2">
                    {group.color && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                    )}
                    {group.priority && (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          group.priority === 'p1'
                            ? 'bg-red-500'
                            : group.priority === 'p2'
                            ? 'bg-amber-500'
                            : group.priority === 'p3'
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    )}
                    <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {group.label}
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                    {group.items.length}
                  </span>
                </div>
              )}

              {/* Task Items */}
              <div className="space-y-1.5">
                {group.items.map((task) => {
                  const proj = projects.find((p) => p.id === task.projectId);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      project={proj}
                      isSelected={selectedTaskId === task.id}
                      isFocused={focusedTaskId === task.id}
                      onSelect={() => onSelectTask(task.id)}
                      onToggleComplete={(e) => onToggleComplete(task.id, e)}
                      onReschedule={(days) => onReschedule(task.id, days)}
                      onSetPriority={(p) => onSetPriority(task.id, p)}
                      onArchive={() => onArchive(task.id)}
                      onDelete={() => onDelete(task.id)}
                      onStartFocus={() => onStartFocus(task.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
