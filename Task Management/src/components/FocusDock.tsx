import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import type { Task } from '../types';
import { playTimerChime, playTactileClick } from '../utils/sound';

interface FocusDockProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask: (id: string) => void;
}

export const FocusDock: React.FC<FocusDockProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
}) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [isZenFullscreen, setIsZenFullscreen] = useState(false);

  // Handle countdown
  useEffect(() => {
    let interval: number | undefined = undefined;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playTimerChime();
    }
    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  if (!isOpen || !task) return null;

  const toggleRun = () => {
    playTactileClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = (minutes: number) => {
    playTactileClick();
    setIsRunning(false);
    setTimeLeft(minutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleComplete = () => {
    onCompleteTask(task.id);
    onClose();
  };

  if (isZenFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0C0D0E] text-white flex flex-col justify-between p-8 animate-in fade-in select-none">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
              Deep Work Focus Chamber
            </span>
          </div>
          <button
            onClick={() => setIsZenFullscreen(false)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Center Stage: Title + Huge Timer */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs">
            {task.priority.toUpperCase()} • {task.energy === 'deep_work' ? 'Deep Work Horizon' : 'Core Commitment'}
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-100 leading-tight">
            {task.title}
          </h1>

          {task.description && (
            <p className="text-sm text-gray-400 max-w-xl mx-auto line-clamp-3 font-mono leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Huge Digital Clock */}
          <div className="py-4">
            <div className="text-7xl sm:text-9xl font-mono font-bold tracking-tighter text-blue-500 selection:bg-none">
              {timeFormatted}
            </div>
          </div>

          {/* Timer Mode and Play / Reset buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleRun}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
            <button
              onClick={() => resetTimer(25)}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pb-4">
          <button
            onClick={handleComplete}
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2.5 mx-auto shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Complete Task & End Session</span>
          </button>
        </div>
      </div>
    );
  }

  // Floating Minimalist Bottom Dock
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-[#1C1D21] border border-gray-700/80 rounded-2xl shadow-2xl p-3 text-white flex items-center justify-between gap-4 font-sans select-none backdrop-blur-md animate-in slide-in-from-bottom-4">
      {/* Task Title & Timer */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">
              FOCUS
            </span>
            <span className="text-xs font-semibold text-gray-100 truncate">
              {task.title}
            </span>
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            Pomodoro Interval
          </div>
        </div>
      </div>

      {/* Countdown Timer Display & Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="font-mono text-lg font-bold text-blue-400 px-2 py-0.5 rounded bg-black/40 border border-gray-800">
          {timeFormatted}
        </div>

        <button
          onClick={toggleRun}
          title={isRunning ? 'Pause' : 'Start'}
          className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={() => resetTimer(25)}
          title="Reset Pomodoro"
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Complete Task Trigger & Expand */}
      <div className="flex items-center gap-1.5 shrink-0 border-l border-gray-800 pl-3">
        <button
          onClick={handleComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Complete</span>
        </button>

        <button
          onClick={() => setIsZenFullscreen(true)}
          title="Fullscreen Zen Mode"
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={onClose}
          title="Close Dock"
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
