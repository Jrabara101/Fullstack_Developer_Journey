import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Flame,
  CheckSquare,
  Plus,
  Trash2,
  Archive,
  Play,
  RotateCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Task, Project, EnergyLevel, RecurrencePattern } from '../types';
import { formatDateLabel } from '../utils/parser';

interface TaskInspectorProps {
  task: Task | null;
  projects: Project[];
  onClose: () => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onArchiveTask: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onStartFocus: (taskId: string) => void;
}

export const TaskInspector: React.FC<TaskInspectorProps> = ({
  task,
  projects,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onArchiveTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartFocus,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const isStagnant = !isCompleted && task.rescheduleCount >= 3;
  const { label: dateLabel } = formatDateLabel(task.dueDate, task.dueTime);

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      onUpdateTask(task.id, { title: title.trim() });
    }
  };

  const handleDescBlur = () => {
    if (description !== task.description) {
      onUpdateTask(task.id, { description });
    }
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  // Quick Date presets
  const setPresetDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const iso = d.toISOString().split('T')[0];
    onUpdateTask(task.id, { dueDate: iso, scheduledDate: iso });
  };

  return (
    <aside className="w-84 sm:w-96 h-full flex flex-col border-l border-[#E5E7EB] dark:border-[#26292D] bg-[#FFFFFF] dark:bg-[#141517] transition-all overflow-y-auto select-none font-sans text-xs">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#E5E7EB] dark:border-[#26292D] flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#141517]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartFocus(task.id)}
            title="Start Pomodoro Deep Focus"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Focus Mode</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onArchiveTask(task.id)}
            title="Archive Task (E)"
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#26292D] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteTask(task.id)}
            title="Delete Task"
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#26292D] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Stagnancy Sentinel Remediation Banner */}
        {isStagnant && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Stagnancy Sentinel Triggered</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[11px]">
              This task has lingered across {task.rescheduleCount} rescheduled deadlines. Unblock momentum with 1-click triage:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => {
                  onAddSubtask(task.id, 'Phase 1: 15-minute quick diagnostic');
                  onAddSubtask(task.id, 'Phase 2: Core implementation');
                }}
                className="px-2 py-1 rounded bg-white dark:bg-[#1C1D21] border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40"
              >
                + Break into 2 Subtasks
              </button>
              <button
                onClick={() => onUpdateTask(task.id, { priority: 'p3' })}
                className="px-2 py-1 rounded bg-white dark:bg-[#1C1D21] border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40"
              >
                Downgrade to P3
              </button>
              <button
                onClick={() => onUpdateTask(task.id, { priority: 'p4', dueDate: undefined, scheduledDate: undefined })}
                className="px-2 py-1 rounded bg-white dark:bg-[#1C1D21] border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40"
              >
                Shelve to Someday
              </button>
            </div>
          </div>
        )}

        {/* Inline Editable Title */}
        <div>
          <label className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 block mb-1">
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:border-blue-500 outline-none pb-1 transition-colors"
          />
        </div>

        {/* Priority 4-Segment Pill Switch */}
        <div>
          <label className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 block mb-1.5">
            Priority Tier
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 dark:bg-[#1C1D21] rounded-lg border border-gray-200 dark:border-gray-800">
            {(
              [
                { id: 'p1', label: 'P1 Urgent', color: 'text-red-500' },
                { id: 'p2', label: 'P2 High', color: 'text-amber-500' },
                { id: 'p3', label: 'P3 Med', color: 'text-blue-500' },
                { id: 'p4', label: 'P4 Low', color: 'text-slate-400' },
              ] as const
            ).map((p) => {
              const isSelected = task.priority === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onUpdateTask(task.id, { priority: p.id })}
                  className={`py-1.5 rounded-md font-mono text-[11px] font-medium transition-all ${
                    isSelected
                      ? `bg-white dark:bg-[#26292D] ${p.color} shadow-xs font-bold`
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Selector */}
        <div>
          <label className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 block mb-1">
            Project Allocation
          </label>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800">
            <Layers className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={task.projectId || ''}
              onChange={(e) => onUpdateTask(task.id, { projectId: e.target.value || undefined })}
              className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-100 outline-none cursor-pointer"
            >
              <option value="" className="dark:bg-[#1C1D21]">No Project (Inbox)</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} className="dark:bg-[#1C1D21]">
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date & Presets */}
        <div>
          <label className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 block mb-1">
            Due Date & Schedule
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="date"
                value={task.dueDate || ''}
                onChange={(e) => onUpdateTask(task.id, { dueDate: e.target.value, scheduledDate: e.target.value })}
                className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-100 outline-none font-mono"
              />
              {task.dueDate && (
                <span className="text-[11px] font-mono text-blue-500 shrink-0 font-medium">{dateLabel}</span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setPresetDate(0)}
                className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1C1D21] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[11px]"
              >
                Today
              </button>
              <button
                onClick={() => setPresetDate(1)}
                className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1C1D21] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[11px]"
              >
                Tomorrow
              </button>
              <button
                onClick={() => setPresetDate(7)}
                className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1C1D21] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[11px]"
              >
                Next Week
              </button>
              <button
                onClick={() => onUpdateTask(task.id, { dueDate: undefined, scheduledDate: undefined })}
                className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1C1D21] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-[11px]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Estimated Duration & Energy Match */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 block mb-1">
              Time Budget
            </label>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={task.estimatedMinutes || 30}
                onChange={(e) => onUpdateTask(task.id, { estimatedMinutes: parseInt(e.target.value, 10) })}
                className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-100 outline-none font-mono cursor-pointer"
              >
                <option value={15} className="dark:bg-[#1C1D21]">15 mins</option>
                <option value={30} className="dark:bg-[#1C1D21]">30 mins</option>
                <option value={45} className="dark:bg-[#1C1D21]">45 mins</option>
                <option value={60} className="dark:bg-[#1C1D21]">1 hour</option>
                <option value={90} className="dark:bg-[#1C1D21]">1.5 hours</option>
                <option value={120} className="dark:bg-[#1C1D21]">2 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 block mb-1">
              Energy Context
            </label>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <select
                value={task.energy || 'deep_work'}
                onChange={(e) => onUpdateTask(task.id, { energy: e.target.value as EnergyLevel })}
                className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-100 outline-none cursor-pointer"
              >
                <option value="deep_work" className="dark:bg-[#1C1D21]">🧠 Deep Work</option>
                <option value="quick_hit" className="dark:bg-[#1C1D21]">⚡ Quick Hit</option>
                <option value="low_energy" className="dark:bg-[#1C1D21]">🔋 Low Energy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recurrence Rule */}
        <div>
          <label className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 block mb-1">
            Recurrence Schedule
          </label>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800">
            <RotateCw className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={task.recurrence || 'none'}
              onChange={(e) => onUpdateTask(task.id, { recurrence: e.target.value as RecurrencePattern })}
              className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-100 outline-none cursor-pointer"
            >
              <option value="none" className="dark:bg-[#1C1D21]">Does not repeat</option>
              <option value="daily" className="dark:bg-[#1C1D21]">Daily</option>
              <option value="weekdays" className="dark:bg-[#1C1D21]">Every weekday (Mon-Fri)</option>
              <option value="weekly" className="dark:bg-[#1C1D21]">Weekly</option>
              <option value="monthly" className="dark:bg-[#1C1D21]">Monthly</option>
              <option value="after_completion_4d" className="dark:bg-[#1C1D21]">Complete + 4 days dynamic cycle</option>
            </select>
          </div>
        </div>

        {/* Subtask Decomposition List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>
                Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
              </span>
            </label>
          </div>

          <div className="space-y-1.5">
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                className="group flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-[#1C1D21] border border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => onToggleSubtask(task.id, st.id)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <span
                    className={`truncate text-xs ${
                      st.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteSubtask(task.id, st.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add Subtask Row */}
            <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-1.5 mt-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask breakdown..."
                className="flex-1 px-2.5 py-1.5 rounded-md bg-gray-50 dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Rich Markdown Description */}
        <div>
          <label className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 block mb-1">
            Notes & Context (Markdown)
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescBlur}
            placeholder="Add context, acceptance criteria, links, or execution steps..."
            className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 font-mono leading-relaxed"
          />
        </div>

        {/* Meta Footer */}
        <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#26292D] text-[11px] font-mono text-gray-400 dark:text-gray-500 space-y-1">
          <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
          {task.completedAt && (
            <div className="text-emerald-500">
              Completed: {new Date(task.completedAt).toLocaleTimeString()}
            </div>
          )}
          {task.rescheduleCount > 0 && <div>Rescheduled: {task.rescheduleCount} times</div>}
        </div>
      </div>
    </aside>
  );
};
