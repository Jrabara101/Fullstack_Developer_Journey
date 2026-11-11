import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard } from '../../types/flashcards';
import { sounds } from '../../services/soundEffects';
import { SpacedRepetitionEngine } from '../../services/spacedRepetition';
import { RecallInput } from './RecallInput';
import { ImageOcclusionModal } from './ImageOcclusionModal';

interface TactileCardCanvasProps {
  cards: Flashcard[];
  activeCardIndex: number;
  setActiveCardIndex: (index: number) => void;
  onGradeCard: (cardId: string, grade: 1 | 2 | 3 | 4, speedMs: number) => void;
  deckTitle: string;
  deckId: string;
  onAddOcclusionCard: (card: Flashcard) => void;
  onOpenBlitz?: () => void;
}

export const TactileCardCanvas: React.FC<TactileCardCanvasProps> = ({
  cards,
  activeCardIndex,
  setActiveCardIndex,
  onGradeCard,
  deckTitle,
  deckId,
  onAddOcclusionCard,
  onOpenBlitz,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [activeRecallMode, setActiveRecallMode] = useState<'off' | 'type' | 'voice'>('off');
  const [isOcclusionModalOpen, setIsOcclusionModalOpen] = useState<boolean>(false);

  // 3D Tilt parameters
  const [tilt, setTilt] = useState<{ rx: number; ry: number; mx: number; my: number }>({
    rx: 0,
    ry: 0,
    mx: 50,
    my: 50,
  });

  // Swipe gesture state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardStartTimeRef = useRef<number>(Date.now());

  // Occlusion mask reveal state for current card
  const [revealedMasks, setRevealedMasks] = useState<Record<string, boolean>>({});

  const card = cards[activeCardIndex] || null;

  // Reset state when moving between cards
  useEffect(() => {
    setIsFlipped(false);
    setDragOffset({ x: 0, y: 0 });
    cardStartTimeRef.current = Date.now();
    setRevealedMasks({});
  }, [activeCardIndex, cards]);

  const flipCard = useCallback(() => {
    sounds.playCardFlip();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleGrade = useCallback(
    (grade: 1 | 2 | 3 | 4) => {
      if (!card) return;
      const speedMs = Date.now() - cardStartTimeRef.current;

      if (grade === 4) {
        sounds.playMasteredSound();
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#34D399', '#6EE7B7'],
        });
      } else if (grade === 1) {
        sounds.playCardSnap();
      } else {
        sounds.playReviewSound();
      }

      onGradeCard(card.id, grade, speedMs);

      // Advance to next card or loop
      if (activeCardIndex < cards.length - 1) {
        setActiveCardIndex(activeCardIndex + 1);
      } else {
        sounds.playCompletionFanfare();
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.6 },
        });
      }
    },
    [card, activeCardIndex, cards.length, onGradeCard, setActiveCardIndex]
  );

  // Global Keyboard listener for tactile shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        flipCard();
      } else if (e.key === '1') {
        e.preventDefault();
        handleGrade(1);
      } else if (e.key === '2') {
        e.preventDefault();
        handleGrade(2);
      } else if (e.key === '3') {
        e.preventDefault();
        handleGrade(3);
      } else if (e.key === '4') {
        e.preventDefault();
        handleGrade(4);
      } else if (e.key === 'ArrowRight' && activeCardIndex < cards.length - 1) {
        e.preventDefault();
        setActiveCardIndex(activeCardIndex + 1);
        sounds.playCardSnap();
      } else if (e.key === 'ArrowLeft' && activeCardIndex > 0) {
        e.preventDefault();
        setActiveCardIndex(activeCardIndex - 1);
        sounds.playCardSnap();
      } else if (e.key === 'b' || e.key === 'B') {
        if (onOpenBlitz) onOpenBlitz();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipCard, handleGrade, activeCardIndex, cards.length, setActiveCardIndex, onOpenBlitz]);

  // Pointer move tilt handler
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt angles (max +/- 12deg)
    const ry = ((x - centerX) / centerX) * 12;
    const rx = -((y - centerY) / centerY) * 12;

    const mx = (x / rect.width) * 100;
    const my = (y / rect.height) * 100;

    setTilt({ rx, ry, mx, my });
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
    }
  };

  // Drag / Swipe handling
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag from primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 110;
    if (dragOffset.x > threshold) {
      // Swipe Right -> Mastered
      handleGrade(4);
    } else if (dragOffset.x < -threshold) {
      // Swipe Left -> Review Soon
      handleGrade(2);
    } else if (dragOffset.y < -threshold) {
      // Swipe Up -> Hard
      handleGrade(1);
    }

    setDragOffset({ x: 0, y: 0 });
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
  };

  if (!card) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-stone-200 shadow-sm text-center">
        <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-900">Deck Completed or Empty</h3>
        <p className="text-xs text-stone-500 mt-1">You've reviewed all cards in this collection for now.</p>
      </div>
    );
  }

  // Memory Status computation for visual indicator
  const memoryInfo = SpacedRepetitionEngine.getMemoryStatus(card);

  // Swipe Direction indicator badge
  let swipeBadge = null;
  if (dragOffset.x > 50) {
    swipeBadge = (
      <div className="absolute top-4 right-4 z-30 bg-emerald-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
        <CheckCircle className="w-4 h-4" />
        <span>Mastered [4]</span>
      </div>
    );
  } else if (dragOffset.x < -50) {
    swipeBadge = (
      <div className="absolute top-4 left-4 z-30 bg-amber-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
        <RotateCcw className="w-4 h-4" />
        <span>Review Soon [2]</span>
      </div>
    );
  } else if (dragOffset.y < -50) {
    swipeBadge = (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg uppercase tracking-wider flex items-center gap-1.5 animate-bounce">
        <span>Hard / Lapse [1]</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Deck Header & Breadcrumbs */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-indigo-600 font-bold">
              {deckTitle}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1"
              style={{ backgroundColor: `${memoryInfo.color}15`, color: memoryInfo.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: memoryInfo.color }}></span>
              {memoryInfo.label} ({memoryInfo.retention}%)
            </span>
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            Card {activeCardIndex + 1} of {cards.length} • Interval: {card.intervalDays.toFixed(1)} days
          </div>
        </div>

        {/* Action icons: Image Occlusion creator, Blitz */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOcclusionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 shadow-2xs transition-all cursor-pointer"
            title="Create visual occlusion card"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Image Occlusion</span>
          </button>

          {onOpenBlitz && (
            <button
              onClick={onOpenBlitz}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
              <span>5-Min Blitz</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200/70 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((activeCardIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D TACTILE CARD CANVAS CONTAINER */}
      <div
        className="perspective-1200 w-full select-none cursor-pointer relative"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerMoveCapture={handlePointerDrag}
        onPointerUp={handlePointerUp}
      >
        {swipeBadge}

        {/* Dynamic Card Shell with 3D Transforms and Specular Sheen */}
        <div
          onClick={flipCard}
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0px) rotateX(${tilt.rx}deg) rotateY(${
              tilt.ry + (isFlipped ? 180 : 0)
            }deg) rotateZ(${dragOffset.x * 0.05}deg)`,
            transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="preserve-3d relative w-full min-h-[380px] rounded-3xl shadow-xl border border-stone-200/90 bg-white"
        >
          {/* Specular Sheen Gradient Overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none z-20 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle 380px at ${tilt.mx}% ${tilt.my}%, rgba(255, 255, 255, 0.45), transparent 80%)`,
            }}
          />

          {/* FRONT FACE OF CARD */}
          <div className="backface-hidden absolute inset-0 p-8 flex flex-col justify-between bg-white rounded-3xl">
            {/* Top Card Meta */}
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-mono uppercase tracking-wider font-semibold text-stone-500">
                PROMPT / QUESTION
              </span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">Tap to reveal</span>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="my-auto py-4">
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug tracking-tight">
                {card.front}
              </h3>

              {/* Tags */}
              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {card.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200/80"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* In-Card Image Occlusion Preview (if card has occlusion data) */}
              {card.occlusionData && (
                <div
                  className="mt-4 relative rounded-xl overflow-hidden border border-stone-200 max-h-56 select-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={card.occlusionData.imageUrl}
                    alt={card.occlusionData.imageTitle || 'Diagram'}
                    className="w-full h-auto object-cover max-h-56"
                  />
                  {card.occlusionData.masks.map((mask, idx) => {
                    const isRevealed = revealedMasks[mask.id];
                    return (
                      <button
                        key={mask.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playCardFlip();
                          setRevealedMasks((prev) => ({ ...prev, [mask.id]: !prev[mask.id] }));
                        }}
                        style={{
                          left: `${mask.x}%`,
                          top: `${mask.y}%`,
                          width: `${mask.width}%`,
                          height: `${mask.height}%`,
                        }}
                        className={`absolute rounded-md border text-[10px] font-bold p-1 flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                          isRevealed
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-700'
                        }`}
                      >
                        {isRevealed ? mask.label : `[#${idx + 1} Tap]`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Card Footer with Keyboard Hint */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs text-stone-400">
              <span className="flex items-center gap-1.5 text-stone-500">
                <kbd className="font-mono text-[11px]">Space</kbd> or Click to flip
              </span>
              <span className="hidden sm:inline text-stone-400 font-mono text-[11px]">
                Swipe: ➔ Mastered | ⬅ Review | ⬆ Hard
              </span>
            </div>
          </div>

          {/* BACK FACE OF CARD (Flipped 180deg) */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 p-8 flex flex-col justify-between bg-stone-50/90 rounded-3xl border border-indigo-100">
            {/* Top Back Meta */}
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-mono uppercase tracking-wider font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> REVEALED ANSWER
              </span>
              <span className="font-mono text-[11px] text-stone-400">
                Grade recall: <kbd className="text-[10px]">1</kbd> to <kbd className="text-[10px]">4</kbd>
              </span>
            </div>

            {/* Answer Content */}
            <div className="my-auto py-4">
              <div className="text-lg sm:text-xl font-medium text-stone-900 leading-relaxed whitespace-pre-line">
                {card.back}
              </div>

              {/* If Occlusion card, show full revealed diagram on back */}
              {card.occlusionData && (
                <div className="mt-4 relative rounded-xl overflow-hidden border border-emerald-200 max-h-56">
                  <img
                    src={card.occlusionData.imageUrl}
                    alt="Diagram"
                    className="w-full h-auto object-cover max-h-56"
                  />
                  {card.occlusionData.masks.map((mask) => (
                    <div
                      key={mask.id}
                      style={{
                        left: `${mask.x}%`,
                        top: `${mask.y}%`,
                        width: `${mask.width}%`,
                        height: `${mask.height}%`,
                      }}
                      className="absolute rounded-md bg-emerald-600/90 text-white font-bold text-[10px] p-1 flex items-center justify-center border border-emerald-400 shadow-xs"
                    >
                      {mask.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
              <span className="font-mono text-[11px]">Ease: {card.easeFactor.toFixed(2)}x</span>
              <span className="text-stone-400 text-[11px]">Rate confidence below to schedule next review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Type-to-Verify & Voice Recall Panel */}
      <RecallInput
        expectedAnswer={card.back}
        isFlipped={isFlipped}
        onRevealCard={flipCard}
        activeMode={activeRecallMode}
        setActiveMode={setActiveRecallMode}
      />

      {/* CONFIDENCE GRADING BUTTONS (1 to 4) */}
      <div className="mt-6 pt-2">
        <div className="text-center text-xs text-stone-400 font-mono mb-2 uppercase tracking-wider">
          {isFlipped ? 'Rate Your Retrieval Confidence' : 'Quick Actions'}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleGrade(1)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 shadow-2xs transition-all active:scale-95 group cursor-pointer"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600">
              <span>Again / Hard</span>
              <kbd className="text-[10px]">1</kbd>
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5">Reset interval (~10m)</span>
          </button>

          <button
            onClick={() => handleGrade(2)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 shadow-2xs transition-all active:scale-95 group cursor-pointer"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
              <span>Hard</span>
              <kbd className="text-[10px]">2</kbd>
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5">+1.2x Interval</span>
          </button>

          <button
            onClick={() => handleGrade(3)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-blue-50 border border-stone-200 hover:border-blue-300 shadow-2xs transition-all active:scale-95 group cursor-pointer"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
              <span>Good</span>
              <kbd className="text-[10px]">3</kbd>
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5">Optimal SM-2 step</span>
          </button>

          <button
            onClick={() => handleGrade(4)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 shadow-2xs transition-all active:scale-95 group cursor-pointer"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span>Mastered</span>
              <kbd className="text-[10px]">4</kbd>
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5">+1.5x Interval boost</span>
          </button>
        </div>
      </div>

      {/* Navigation bar between cards */}
      <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
        <button
          onClick={() => {
            if (activeCardIndex > 0) {
              setActiveCardIndex(activeCardIndex - 1);
              sounds.playCardSnap();
            }
          }}
          disabled={activeCardIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <button
          onClick={flipCard}
          className="px-4 py-1.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'Show Question' : 'Flip to Answer'}</span>
          <kbd className="text-[10px]">[Space]</kbd>
        </button>

        <button
          onClick={() => {
            if (activeCardIndex < cards.length - 1) {
              setActiveCardIndex(activeCardIndex + 1);
              sounds.playCardSnap();
            }
          }}
          disabled={activeCardIndex === cards.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
        >
          <span>Next Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Image Occlusion Modal */}
      <ImageOcclusionModal
        isOpen={isOcclusionModalOpen}
        onClose={() => setIsOcclusionModalOpen(false)}
        onSaveToDeck={onAddOcclusionCard}
        deckId={deckId}
      />
    </div>
  );
};

