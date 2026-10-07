import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  Flame,
  Archive,
  Trash2,
  Play,
  RotateCcw,
  CheckSquare,
} from 'lucide-react';
import type { Task, Project, Priority } from '../types';
import { formatDateLabel } from '../utils/parser';

interface TaskCardProps {
  task: Task;
  project?: Project;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
  onReschedule: (days: number) => void;
  onSetPriority: (priority: Priority) => void;
  onArchive: () => void;
  onDelete: () => void;
  onStartFocus: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  isSelected,
  isFocused,
  onSelect,
  onToggleComplete,
  onReschedule,
  onSetPriority,
  onArchive,
  onDelete,
  onStartFocus,
}) => {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const isCompleted = task.status === 'completed';
  const { label: dateLabel, isOverdue, isToday } = formatDateLabel(task.dueDate, task.dueTime);

  // Subtask progress
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

  // Stagnancy Sentinel
  const isStagnant = !isCompleted && task.rescheduleCount >= 3;

  // Priority Styles
  const priorityStyles: Record<Priority, { border: string; bg: string; text: string; label: string }> = {
    p1: { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-500', label: 'P1' },
    p2: { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'P2' },
    p3: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'P3' },
    p4: { border: 'border-slate-400', bg: 'bg-slate-400/10', text: 'text-slate-400', label: 'P4' },
  };

  const pConfig = priorityStyles[task.priority];

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer ${
        isCompleted
          ? 'bg-transparent border-transparent opacity-60 hover:opacity-85'
          : isSelected
          ? 'bg-white dark:bg-[#1C1D21] border-blue-500/60 dark:border-blue-500/80 shadow-xs'
          : 'bg-white dark:bg-[#141517] border-gray-200/90 dark:border-[#26292D] hover:border-gray-300 dark:hover:border-gray-700 shadow-xs'
      } ${
        isFocused ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-[#0C0D0E]' : ''
      } ${
        isStagnant ? 'border-amber-400/80 dark:border-amber-500/60 bg-amber-500/5' : ''
      }`}
    >
      {/* Left Column: Tactile Checkbox + Title + Meta */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Custom Tactile Checkbox */}
        <button
          type="button"
          onClick={onToggleComplete}
          title={isCompleted ? 'Mark incomplete (Space)' : 'Mark completed (Space)'}
          className={`spring-checkbox w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-transform ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : `${pConfig.border} hover:scale-110 active:scale-95 bg-transparent`
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Title & Details */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium tracking-tight truncate ${
                isCompleted
                  ? 'line-through text-gray-400 dark:text-gray-500 font-normal'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {task.title}
            </span>

            {/* Stagnancy Sentinel Indicator */}
            {isStagnant && (
              <span
                title="Stagnancy Sentinel: Rescheduled multiple times without completion."
                className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0"
              >
                <Flame className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                <span>Stagnant ({task.rescheduleCount}x)</span>
              </span>
            )}
          </div>

          {/* Micro Meta Information Bar */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
            {/* Project Indicator */}
            {project && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="truncate max-w-[120px] font-sans font-medium text-gray-600 dark:text-gray-300">
                  {project.name}
                </span>
              </div>
            )}

            {/* Subtask Progress Fraction */}
            {totalSubtasks > 0 && (
              <div className="flex items-center gap-1 shrink-0 text-gray-500 dark:text-gray-400">
                <CheckSquare className="w-3 h-3 opacity-70" />
                <span>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex items-center gap-1 truncate">
                {task.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-[#1F2024] text-gray-600 dark:text-gray-400 text-[10px]"
                  >
                    #{t}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-[10px] text-gray-400">+{task.tags.length - 2}</span>
                )}
              </div>
            )}

            {/* Energy Context */}
            {task.energy && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-sans shrink-0 ${
                  task.energy === 'deep_work'
                    ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                    : task.energy === 'quick_hit'
                    ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {task.energy === 'deep_work' ? '🧠 Deep' : task.energy === 'quick_hit' ? '⚡ Quick' : '🔋 Admin'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Time Pill + Date Urgency + Hover Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Estimated Duration */}
        {task.estimatedMinutes && !isCompleted && (
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-gray-400 dark:text-gray-500 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1C1D21]">
            <Clock className="w-3 h-3 opacity-60" />
            <span>~{task.estimatedMinutes}m</span>
          </div>
        )}

        {/* Due Date Chip */}
        {task.dueDate && !isCompleted && (
          <div
            className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
              isOverdue
                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 animate-overdue-pulse'
                : isToday
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                : 'bg-gray-50 dark:bg-[#1C1D21] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800'
            }`}
          >
            <Calendar className="w-3 h-3 opacity-70" />
            <span>{dateLabel}</span>
          </div>
        )}

        {/* Hover Action Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-0.5 bg-white dark:bg-[#1C1D21] p-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          {/* Deep Focus Trigger */}
          <button
            onClick={onStartFocus}
            title="Focus Deep Work (F)"
            className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/50 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
          </button>

          {/* Quick Reschedule */}
          <button
            onClick={() => onReschedule(1)}
            title="Reschedule +1 day"
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Priority Menu */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityMenu(!showPriorityMenu)}
              title="Set Priority"
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${pConfig.text} hover:bg-gray-100 dark:hover:bg-gray-800`}
            >
              {task.priority.toUpperCase()}
            </button>

            {showPriorityMenu && (
              <div className="absolute right-0 bottom-full mb-1 z-30 w-28 bg-white dark:bg-[#1C1D21] rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-1 flex flex-col gap-0.5">
                {(['p1', 'p2', 'p3', 'p4'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      onSetPriority(p);
                      setShowPriorityMenu(false);
                    }}
                    className={`flex items-center justify-between px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 font-mono ${priorityStyles[p].text}`}
                  >
                    <span>{priorityStyles[p].label}</span>
                    <span className="text-[10px] text-gray-400">
                      {p === 'p1' ? 'Urgent' : p === 'p2' ? 'High' : p === 'p3' ? 'Medium' : 'Low'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Archive */}
          <button
            onClick={onArchive}
            title="Archive (E)"
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            title="Delete task"
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
