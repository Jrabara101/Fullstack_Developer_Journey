import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  CornerDownLeft,
  Calendar,
  Clock,
  Hash,
  Layers,
  Sparkles,
  Command,
  X,
} from 'lucide-react';
import type { Task, Project, Priority } from '../types';
import { parseNaturalLanguageInput, formatDateLabel } from '../utils/parser';
import { useVoiceTranscription } from '../hooks/useVoiceTranscription';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Partial<Task>) => void;
  projects: Project[];
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  projects,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice dictation integration
  const handleVoiceComplete = (transcribedText: string) => {
    setInput((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
  };

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    simulatedMode,
  } = useVoiceTranscription(handleVoiceComplete);

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Live NLP parsing
  const parsed = parseNaturalLanguageInput(input);
  const { label: dateLabel } = formatDateLabel(parsed.dueDate, parsed.dueTime);

  // Check project match from hint or tags
  const matchedProject = projects.find(
    (p) =>
      (parsed.projectHint && p.name.toLowerCase().includes(parsed.projectHint.toLowerCase())) ||
      parsed.tags.some((t) => p.name.toLowerCase().includes(t.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    onAddTask({
      title: parsed.cleanTitle || input.trim(),
      priority: parsed.priority || 'p3',
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      scheduledDate: parsed.scheduledDate,
      estimatedMinutes: parsed.estimatedMinutes || 30,
      tags: parsed.tags,
      projectId: matchedProject?.id,
      energy: parsed.energy || 'deep_work',
    });

    onClose();
  };

  const priorityLabels: Record<Priority, { label: string; color: string }> = {
    p1: { label: 'P1 Urgent', color: 'bg-red-500/15 text-red-500 border-red-500/30' },
    p2: { label: 'P2 High', color: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
    p3: { label: 'P3 Medium', color: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
    p4: { label: 'P4 Low', color: 'bg-slate-400/15 text-slate-400 border-slate-400/30' },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden text-gray-900 dark:text-gray-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Top Bar with Voice Dictation Indicator */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono pb-1 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-blue-500 font-medium">
              <Command className="w-3.5 h-3.5" />
              <span>Intelligent Quick Capture</span>
            </div>

            <div className="flex items-center gap-2">
              {isListening && (
                <span className="flex items-center gap-1.5 text-red-500 animate-pulse text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {simulatedMode ? 'Listening (Micro-Dictation)...' : 'Recording...'}
                </span>
              )}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                title={isListening ? 'Stop Dictation' : 'Voice Dictation'}
                className={`p-1.5 rounded-md transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Large Borderless Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What needs to be done? Try 'Draft roadmap tomorrow 3pm p1 #strategy ~45m'"
              className="w-full text-base sm:text-lg bg-transparent border-none text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none font-medium pr-10"
            />
          </div>

          {/* Voice Interim Display */}
          {isListening && transcript && (
            <div className="text-xs font-mono text-blue-500 italic bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-900/40">
              "{transcript}"
            </div>
          )}

          {/* Live Token Parser Preview Strip */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[28px] pt-1">
            {input.trim() ? (
              <>
                {/* Detected Priority */}
                {parsed.priority && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                      priorityLabels[parsed.priority].color
                    }`}
                  >
                    <span>{priorityLabels[parsed.priority].label}</span>
                  </span>
                )}

                {/* Detected Due Date */}
                {parsed.dueDate && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25">
                    <Calendar className="w-3 h-3" />
                    <span>{dateLabel}</span>
                  </span>
                )}

                {/* Detected Time */}
                {parsed.dueTime && !parsed.dueDate && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25">
                    <Clock className="w-3 h-3" />
                    <span>{parsed.dueTime}</span>
                  </span>
                )}

                {/* Detected Estimated Duration */}
                {parsed.estimatedMinutes && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-gray-500/15 text-gray-600 dark:text-gray-300 border border-gray-500/20">
                    <Clock className="w-3 h-3" />
                    <span>~{parsed.estimatedMinutes}m</span>
                  </span>
                )}

                {/* Detected Project */}
                {matchedProject && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                    <Layers className="w-3 h-3" />
                    <span>{matchedProject.name}</span>
                  </span>
                )}

                {/* Detected Energy */}
                {parsed.energy && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {parsed.energy === 'deep_work'
                        ? '🧠 Deep Work'
                        : parsed.energy === 'quick_hit'
                        ? '⚡ Quick Hit'
                        : '🔋 Low Energy'}
                    </span>
                  </span>
                )}

                {/* Detected Tags */}
                {parsed.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    <Hash className="w-2.5 h-2.5 opacity-60" />
                    <span>{t}</span>
                  </span>
                ))}
              </>
            ) : (
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                Tokens like <strong>!p1</strong>, <strong>tomorrow</strong>, <strong>#tag</strong>,{' '}
                <strong>~45m</strong> will be highlighted here in real time.
              </span>
            )}
          </div>

          {/* Bottom Hotkey Strip */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  ↵ Enter
                </kbd>
                <span>Create</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  Esc
                </kbd>
                <span>Dismiss</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={!input.trim()}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors shadow-xs"
            >
              <span>Add Task</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
