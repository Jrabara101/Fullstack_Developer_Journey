import React, { useState, useEffect, useRef } from 'react';
import { Zap, Clock, Flame, CheckCircle, XCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard } from '../../types/flashcards';
import { sounds } from '../../services/soundEffects';

interface FiveMinuteBlitzModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  onBlitzCardGraded: (cardId: string, grade: 1 | 2 | 3 | 4) => void;
}

export const FiveMinuteBlitzModal: React.FC<FiveMinuteBlitzModalProps> = ({
  isOpen,
  onClose,
  cards,
  onBlitzCardGraded,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 minutes
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [blitzStreak, setBlitzStreak] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Filter or sort cards by highest decay / lowest interval
  const blitzQueue = React.useMemo(() => {
    return [...cards].sort((a, b) => a.intervalDays - b.intervalDays);
  }, [cards]);

  useEffect(() => {
    if (!isOpen) return;

    setSecondsRemaining(300);
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore(0);
    setBlitzStreak(0);
    setIsFinished(false);

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsFinished(true);
          sounds.playCompletionFanfare();
          confetti({ particleCount: 90, spread: 80 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const card = blitzQueue[currentIndex] || null;

  const handleGrade = (grade: 1 | 2 | 3 | 4) => {
    if (!card) return;

    if (grade >= 3) {
      setScore((s) => s + 100 * (blitzStreak >= 3 ? 2 : 1));
      setBlitzStreak((s) => s + 1);
      sounds.playMasteredSound();
    } else {
      setBlitzStreak(0);
      sounds.playCardSnap();
    }

    onBlitzCardGraded(card.id, grade);

    if (currentIndex < blitzQueue.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
      sounds.playCompletionFanfare();
      confetti({ particleCount: 100, spread: 90 });
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Blitz Header Bar */}
        <div className="px-6 py-4 bg-linear-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 fill-white text-white animate-bounce" />
            <div>
              <span className="font-extrabold text-sm tracking-wide uppercase">5-Minute Quick Blitz</span>
              <span className="block text-[10px] text-amber-100 font-mono">Rapid retrieval practice session</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Clock */}
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full font-mono text-sm font-bold">
              <Clock className="w-4 h-4 text-amber-200" />
              <span>{timeFormatted}</span>
            </div>

            {/* Streak flame */}
            <div className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-full font-mono text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{blitzStreak}x</span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex-1">
          {isFinished ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                🎉
              </div>
              <h3 className="text-2xl font-extrabold text-stone-900">Blitz Session Complete!</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Outstanding focus. You reinforced {currentIndex} high-decay cards and revitalized your memory stability.
              </p>

              <div className="flex justify-center gap-6 py-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-amber-600 font-mono">{score}</div>
                  <div className="text-[11px] text-stone-400 font-mono uppercase">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-emerald-600 font-mono">{currentIndex}</div>
                  <div className="text-[11px] text-stone-400 font-mono uppercase">Cards Reviewed</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Return to Studio
              </button>
            </div>
          ) : card ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>CARD {currentIndex + 1} OF {blitzQueue.length}</span>
                <span className="text-amber-600 font-semibold">{score} PTS</span>
              </div>

              {/* Blitz Card Display */}
              <div
                onClick={() => {
                  sounds.playCardFlip();
                  setIsFlipped(!isFlipped);
                }}
                className={`min-h-[220px] p-6 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer select-none shadow-sm ${
                  isFlipped
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-stone-50 border-stone-200 hover:border-amber-400'
                }`}
              >
                <div className="text-[11px] font-mono uppercase font-bold text-stone-400">
                  {isFlipped ? 'ANSWER' : 'QUESTION (TAP TO REVEAL)'}
                </div>

                <div className="py-4 text-base sm:text-lg font-semibold text-stone-900 leading-snug">
                  {isFlipped ? card.back : card.front}
                </div>

                <div className="text-right text-[11px] text-stone-400 font-mono">
                  {isFlipped ? 'Grade recall below' : 'Click to flip'}
                </div>
              </div>

              {/* Rapid Grading Controls */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleGrade(1)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 font-bold text-xs border border-stone-200 hover:border-rose-300 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Lapsed / Missed</span>
                </button>
                <button
                  onClick={() => handleGrade(4)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Recalled (+100)</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

