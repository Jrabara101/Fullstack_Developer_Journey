import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  X,
  Flame,
} from 'lucide-react';
import type { Task } from '../types';
import { playSuccessSweepSound, playTactileClick } from '../utils/sound';

interface TriageSweepModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasksToTriage: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onArchiveTask: (id: string) => void;
}

export const TriageSweepModal: React.FC<TriageSweepModalProps> = ({
  isOpen,
  onClose,
  tasksToTriage,
  onUpdateTask,
  onArchiveTask,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const currentTask = tasksToTriage[currentIndex];
  const total = tasksToTriage.length;

  const handleNext = () => {
    playTactileClick();
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      playSuccessSweepSound();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
      });
    }
  };

  const handleDoToday = () => {
    if (!currentTask) return;
    const todayISO = new Date().toISOString().split('T')[0];
    onUpdateTask(currentTask.id, {
      scheduledDate: todayISO,
      dueDate: todayISO,
      priority: 'p1',
    });
    handleNext();
  };

  const handleReschedule = (days: number) => {
    if (!currentTask) return;
    const d = new Date();
    d.setDate(d.getDate() + days);
    const iso = d.toISOString().split('T')[0];
    onUpdateTask(currentTask.id, {
      scheduledDate: iso,
      dueDate: iso,
      rescheduleCount: currentTask.rescheduleCount + 1,
    });
    handleNext();
  };

  const handleDelegate = () => {
    if (!currentTask) return;
    onUpdateTask(currentTask.id, {
      priority: 'p3',
      energy: 'quick_hit',
    });
    handleNext();
  };

  const handleArchive = () => {
    if (!currentTask) return;
    onArchiveTask(currentTask.id);
    handleNext();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 text-gray-900 dark:text-gray-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h2 className="text-base font-bold tracking-tight">60-Second Triage Ritual</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isCompleted || total === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Inbox Zero Achieved
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                All pending tasks have been triaged into intentional daily horizons. Your cognitive slate is clean.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md transition-colors"
            >
              Return to Focused Work
            </button>
          </div>
        ) : (
          <div className="py-5 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>Reviewing Item</span>
                <span>
                  {currentIndex + 1} of {total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Task Card Spotlight */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#141517] border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    currentTask.priority === 'p1'
                      ? 'bg-red-500/20 text-red-500'
                      : currentTask.priority === 'p2'
                      ? 'bg-amber-500/20 text-amber-500'
                      : 'bg-blue-500/20 text-blue-500'
                  }`}
                >
                  {currentTask.priority.toUpperCase()}
                </span>
                {currentTask.rescheduleCount >= 2 && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-amber-500">
                    <Flame className="w-3 h-3" />
                    <span>Languishing ({currentTask.rescheduleCount}x)</span>
                  </span>
                )}
              </div>

              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                {currentTask.title}
              </h4>

              {currentTask.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {currentTask.description}
                </p>
              )}
            </div>

            {/* Decision Actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDoToday}
                className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    Execute Today
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Schedule as Top Anchor
                  </div>
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-blue-800 dark:text-blue-200">
                  1
                </span>
              </button>

              <button
                onClick={() => handleReschedule(1)}
                className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Reschedule (+1d)
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Move to Tomorrow
                  </div>
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 rounded text-amber-800 dark:text-amber-200">
                  2
                </span>
              </button>

              <button
                onClick={handleDelegate}
                className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Quick Hit / P3
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Batch in Admin Slot
                  </div>
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.5 bg-purple-200 dark:bg-purple-800 rounded text-purple-800 dark:text-purple-200">
                  3
                </span>
              </button>

              <button
                onClick={handleArchive}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Shelve to Someday
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    De-commit without guilt
                  </div>
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                  4
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
