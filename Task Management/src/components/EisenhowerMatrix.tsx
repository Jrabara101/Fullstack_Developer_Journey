import React, { useState } from 'react';
import {
  Flame,
  Calendar,
  Zap,
  Trash,
  Plus,
  Check,
} from 'lucide-react';
import type { Task, Priority } from '../types';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onSelectTask: (id: string) => void;
  onToggleComplete: (id: string, e: React.MouseEvent) => void;
  onSetPriority: (id: string, priority: Priority) => void;
  onAddTask: (task: Partial<Task>) => void;
}

export const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({
  tasks,
  onSelectTask,
  onToggleComplete,
  onSetPriority,
  onAddTask,
}) => {
  const [addingQuadrant, setAddingQuadrant] = useState<Priority | null>(null);
  const [inlineInput, setInlineInput] = useState('');

  const quadrants: {
    priority: Priority;
    title: string;
    subtitle: string;
    color: string;
    border: string;
    bg: string;
    badge: string;
    icon: React.ElementType;
  }[] = [
    {
      priority: 'p1',
      title: 'Do First',
      subtitle: 'Urgent & Important',
      color: 'text-red-500',
      border: 'border-red-500/30 dark:border-red-500/30',
      bg: 'bg-red-500/5',
      badge: 'bg-red-500/10 text-red-500',
      icon: Flame,
    },
    {
      priority: 'p2',
      title: 'Schedule',
      subtitle: 'Not Urgent, but Important',
      color: 'text-amber-500',
      border: 'border-amber-500/30 dark:border-amber-500/30',
      bg: 'bg-amber-500/5',
      badge: 'bg-amber-500/10 text-amber-500',
      icon: Calendar,
    },
    {
      priority: 'p3',
      title: 'Delegate / Quick Hit',
      subtitle: 'Urgent, Not Important',
      color: 'text-blue-500',
      border: 'border-blue-500/30 dark:border-blue-500/30',
      bg: 'bg-blue-500/5',
      badge: 'bg-blue-500/10 text-blue-500',
      icon: Zap,
    },
    {
      priority: 'p4',
      title: 'Eliminate / Someday',
      subtitle: 'Not Urgent & Not Important',
      color: 'text-slate-400',
      border: 'border-slate-500/30 dark:border-slate-500/30',
      bg: 'bg-slate-500/5',
      badge: 'bg-slate-500/10 text-slate-400',
      icon: Trash,
    },
  ];

  const handleAddSubmit = (priority: Priority) => {
    if (!inlineInput.trim()) return;
    onAddTask({
      title: inlineInput.trim(),
      priority,
      status: 'todo',
    });
    setInlineInput('');
    setAddingQuadrant(null);
  };

  return (
    <div className="flex-1 h-full flex flex-col p-6 overflow-y-auto bg-[#FFFFFF] dark:bg-[#0C0D0E] font-sans select-none">
      {/* Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Eisenhower Decision Matrix</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
            Prioritize by urgency and importance to eliminate cognitive clutter
          </p>
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {quadrants.map((q) => {
          const Icon = q.icon;
          const qTasks = tasks.filter((t) => t.priority === q.priority && t.status !== 'completed');

          return (
            <div
              key={q.priority}
              className={`rounded-xl border ${q.border} ${q.bg} p-4 flex flex-col justify-between shadow-xs transition-all`}
            >
              {/* Quadrant Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-gray-800/80">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md ${q.badge}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                      {q.title}
                    </h3>
                    <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 block">
                      {q.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                    {qTasks.length} items
                  </span>
                  <button
                    onClick={() => {
                      setAddingQuadrant(q.priority);
                      setInlineInput('');
                    }}
                    className="p-1 rounded hover:bg-white dark:hover:bg-[#1C1D21] text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Task Items List */}
              <div className="py-3 flex-1 overflow-y-auto space-y-2 min-h-[140px] max-h-[300px]">
                {qTasks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-gray-400 dark:text-gray-600 italic">
                    No active tasks in this quadrant
                  </div>
                ) : (
                  qTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t.id)}
                      className="group flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#1C1D21] border border-gray-200/80 dark:border-gray-800 hover:border-blue-500/50 cursor-pointer shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => onToggleComplete(t.id, e)}
                          className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 hover:border-emerald-500 flex items-center justify-center shrink-0"
                        >
                          <Check className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40" />
                        </button>
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {t.title}
                        </span>
                      </div>

                      {/* Quick Move Priority buttons */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 ml-2"
                      >
                        {(['p1', 'p2', 'p3', 'p4'] as Priority[])
                          .filter((p) => p !== q.priority)
                          .map((targetP) => (
                            <button
                              key={targetP}
                              onClick={() => onSetPriority(t.id, targetP)}
                              title={`Move to ${targetP.toUpperCase()}`}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white transition-colors"
                            >
                              {targetP.toUpperCase()}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Inline Quick Add for Quadrant */}
              {addingQuadrant === q.priority && (
                <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800/80 flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={inlineInput}
                    onChange={(e) => setInlineInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubmit(q.priority);
                      if (e.key === 'Escape') setAddingQuadrant(null);
                    }}
                    placeholder={`Add task to ${q.title}...`}
                    className="flex-1 px-2.5 py-1 text-xs rounded bg-white dark:bg-[#1C1D21] border border-blue-500 text-gray-900 dark:text-gray-100 outline-none"
                  />
                  <button
                    onClick={() => handleAddSubmit(q.priority)}
                    className="px-2.5 py-1 text-xs font-mono rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
