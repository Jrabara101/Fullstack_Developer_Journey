import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardColor } from '../../types/game.js';
import { cn } from '../../lib/utils.js';
import { Ban, RefreshCw, Layers, Sparkles, Flame, Check } from 'lucide-react';

interface Card3DProps {
  card: Card;
  isPlayable?: boolean;
  isSelectedForMeld?: boolean;
  onSelectForMeld?: (cardId: string) => void;
  onPlay?: (card: Card, isBluff: boolean) => void;
  onPeekingChange?: (isPeeking: boolean) => void;
  fanAngle?: number;
  fanOffset?: number;
  zIndex?: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card3D: React.FC<Card3DProps> = ({
  card,
  isPlayable = false,
  isSelectedForMeld = false,
  onSelectForMeld,
  onPlay,
  onPeekingChange,
  fanAngle = 0,
  fanOffset = 0,
  zIndex = 1,
  interactive = true,
  size = 'md',
  className
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlicking, setIsFlicking] = useState(false);
  const [flickAngle, setFlickAngle] = useState(0);

  // 3D Card-peeking and physics coordinates
  const [transform3D, setTransform3D] = useState({
    rotateX: 0,
    rotateY: 0,
    translateY: 0,
    translateX: 0,
    shadowOffset: 10
  });

  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Size dimensions
  const dimensions = {
    sm: 'w-20 h-28 text-xs',
    md: 'w-28 h-40 text-sm',
    lg: 'w-36 h-52 text-base'
  }[size];

  // Dynamic color styling
  const getColorStyles = (color: CardColor) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-gradient-to-br from-red-600 to-rose-800',
          border: 'border-red-400/80',
          glow: 'hover:shadow-[0_0_25px_rgba(239,35,60,0.8)]',
          badge: 'bg-red-950/60 text-red-200'
        };
      case 'blue':
        return {
          bg: 'bg-gradient-to-br from-blue-600 to-cyan-800',
          border: 'border-blue-400/80',
          glow: 'hover:shadow-[0_0_25px_rgba(0,119,182,0.8)]',
          badge: 'bg-blue-950/60 text-blue-200'
        };
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-emerald-600 to-teal-800',
          border: 'border-emerald-400/80',
          glow: 'hover:shadow-[0_0_25px_rgba(46,196,182,0.8)]',
          badge: 'bg-emerald-950/60 text-emerald-200'
        };
      case 'yellow':
        return {
          bg: 'bg-gradient-to-br from-amber-500 to-yellow-700',
          border: 'border-amber-300/80',
          glow: 'hover:shadow-[0_0_25px_rgba(255,183,3,0.8)]',
          badge: 'bg-amber-950/60 text-yellow-200'
        };
      case 'wild':
      default:
        return {
          bg: 'bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-800',
          border: 'border-purple-300',
          glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.9)]',
          badge: 'bg-purple-950/60 text-purple-200'
        };
    }
  };

  const colorStyle = getColorStyles(card.color);

  // Render card emblem & icons
  const renderCardContent = () => {
    switch (card.type) {
      case 'skip':
        return (
          <div className="flex flex-col items-center justify-center">
            <Ban className="w-10 h-10 drop-shadow-md text-white" />
            <span className="font-extrabold tracking-widest text-[11px] uppercase mt-1">SKIP</span>
          </div>
        );
      case 'reverse':
        return (
          <div className="flex flex-col items-center justify-center">
            <RefreshCw className="w-9 h-9 drop-shadow-md text-white animate-spin-slow" />
            <span className="font-extrabold tracking-widest text-[11px] uppercase mt-1">REVERSE</span>
          </div>
        );
      case 'draw_two':
        return (
          <div className="flex flex-col items-center justify-center font-black">
            <div className="flex items-center gap-1">
              <Layers className="w-6 h-6 text-white" />
              <span className="text-3xl tracking-tighter drop-shadow-lg">+2</span>
            </div>
            <span className="font-extrabold tracking-widest text-[10px] uppercase text-white/90">DRAW TWO</span>
          </div>
        );
      case 'wild_ante':
        return (
          <div className="flex flex-col items-center justify-center">
            <Flame className="w-9 h-9 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-xs font-black tracking-widest text-amber-200 uppercase mt-1">WILD ANTE</span>
            <span className="text-[9px] font-bold text-amber-300/90 tracking-tight">+50 CHIPS</span>
          </div>
        );
      case 'wild':
        return (
          <div className="flex flex-col items-center justify-center">
            <Sparkles className="w-9 h-9 text-purple-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <span className="text-xs font-black tracking-widest text-white uppercase mt-1">COLOR SHIFT</span>
          </div>
        );
      case 'number':
      default:
        return (
          <div className="flex items-center justify-center">
            <span className="text-5xl font-black tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] font-mono text-white">
              {card.value}
            </span>
          </div>
        );
    }
  };

  // Tactile Corner-Peeking & Flick Velocity Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const now = Date.now();
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: now };
    lastPosRef.current = { x: e.clientX, y: e.clientY, time: now };
    setIsDragging(true);
    onPeekingChange?.(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Corner Peeking: localize rotateX and rotateY based on drag vector
    const rotateX = Math.max(-45, Math.min(45, -deltaY * 0.35));
    const rotateY = Math.max(-45, Math.min(45, deltaX * 0.35));

    setTransform3D({
      rotateX,
      rotateY,
      translateX: deltaX * 0.6,
      translateY: deltaY * 0.8,
      shadowOffset: Math.min(30, 10 + Math.abs(deltaY) * 0.15)
    });

    lastPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !lastPosRef.current) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const now = Date.now();
    const totalDeltaY = e.clientY - dragStartRef.current.y;
    const timeElapsed = Math.max(1, now - lastPosRef.current.time);
    const releaseVelocityY = (e.clientY - lastPosRef.current.y) / timeElapsed;

    setIsDragging(false);
    onPeekingChange?.(false);

    // Physics Flick Detection: Upward velocity or significant upward displacement
    const isUpwardFlick = releaseVelocityY < -0.45 || totalDeltaY < -90;

    if (isUpwardFlick && (isPlayable || onPlay)) {
      // Calculate dynamic rotation offsets (-15deg to +15deg)
      const randomOffset = (Math.random() * 30 - 15);
      setFlickAngle(randomOffset);
      setIsFlicking(true);

      // Trigger card play after flick animation initiates
      setTimeout(() => {
        onPlay?.(card, false);
      }, 250);
    } else {
      // Smoothly snap back to resting position
      setTransform3D({
        rotateX: 0,
        rotateY: 0,
        translateX: 0,
        translateY: 0,
        shadowOffset: 10
      });
    }

    dragStartRef.current = null;
    lastPosRef.current = null;
  };

  // Click handler for meld selection (if clicking without drag)
  const handleClick = (e: React.MouseEvent) => {
    if (Math.abs(transform3D.translateY) < 10 && onSelectForMeld) {
      e.stopPropagation();
      onSelectForMeld(card.id);
    }
  };

  // Base resting transform with fan spread
  const restingTransform = `rotate(${fanAngle}deg) translateX(${fanOffset}px)`;
  const hoverTransform = isHovered && !isDragging
    ? 'translateY(-24px) scale(1.08)'
    : isSelectedForMeld
    ? 'translateY(-32px) scale(1.05)'
    : '';

  const dynamic3DStyle: React.CSSProperties = isFlicking
    ? {
        transform: `translateY(-320px) rotate(${flickAngle}deg) scale(0.85)`,
        opacity: 0,
        transition: 'transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease'
      }
    : isDragging
    ? {
        transform: `${restingTransform} translate3d(${transform3D.translateX}px, ${transform3D.translateY}px, 50px) rotateX(${transform3D.rotateX}deg) rotateY(${transform3D.rotateY}deg)`,
        filter: `drop-shadow(0 ${transform3D.shadowOffset}px 20px rgba(0,0,0,0.6))`,
        cursor: 'grabbing',
        transition: 'none',
        zIndex: 999
      }
    : {
        transform: `${restingTransform} ${hoverTransform}`,
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
        zIndex: isHovered || isSelectedForMeld ? 50 : zIndex
      };

  return (
    <div
      ref={cardRef}
      style={dynamic3DStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      className={cn(
        'relative select-none preserve-3d cursor-grab rounded-xl border-2 transition-shadow duration-200',
        dimensions,
        card.isFaceDown
          ? 'bg-slate-900 border-amber-600/60 shadow-xl'
          : `${colorStyle.bg} ${colorStyle.border} ${colorStyle.glow} shadow-card-elevated`,
        isSelectedForMeld && 'ring-4 ring-gold ring-offset-2 ring-offset-slate-950',
        isPlayable && !card.isFaceDown && 'ring-2 ring-emerald-400/90 shadow-[0_0_20px_rgba(52,211,153,0.7)]',
        className
      )}
    >
      {/* Card Face Down (Back Pattern) */}
      {card.isFaceDown ? (
        <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden p-2 flex flex-col items-center justify-center bg-slate-950 border border-amber-500/30">
          <div className="w-full h-full rounded-lg border-2 border-amber-500/40 flex flex-col items-center justify-center bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:8px_8px] relative">
            <div className="w-12 h-12 rounded-full border border-amber-400/80 bg-slate-900 flex items-center justify-center shadow-lg">
              <span className="font-extrabold text-amber-400 text-xs font-mono tracking-wider">FELT</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/80 mt-1">ARENA</span>
          </div>
        </div>
      ) : (
        /* Card Face Up */
        <div className="absolute inset-0 w-full h-full rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          {/* Specular sheen overlay */}
          <div className="absolute inset-0 pointer-events-none card-specular opacity-40 rounded-xl" />

          {/* Top Left Value Pip */}
          <div className="flex items-center justify-between z-10">
            <div className="flex flex-col items-start leading-none font-black font-mono drop-shadow">
              <span className="text-base text-white">
                {card.type === 'number' ? card.value : card.type === 'draw_two' ? '+2' : card.type[0].toUpperCase()}
              </span>
              <span className="text-[9px] uppercase tracking-tighter text-white/80 font-sans">
                {card.color}
              </span>
            </div>

            {/* Meld Selection Checkmark Badge */}
            {isSelectedForMeld && (
              <div className="w-5 h-5 rounded-full bg-gold text-slate-950 flex items-center justify-center shadow-md animate-bounce">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>

          {/* Center Graphic */}
          <div className="flex-1 flex items-center justify-center z-10">
            {renderCardContent()}
          </div>

          {/* Bottom Right Inverted Pip */}
          <div className="flex items-end justify-between z-10 rotate-180">
            <div className="flex flex-col items-start leading-none font-black font-mono drop-shadow">
              <span className="text-base text-white">
                {card.type === 'number' ? card.value : card.type === 'draw_two' ? '+2' : card.type[0].toUpperCase()}
              </span>
              <span className="text-[9px] uppercase tracking-tighter text-white/80 font-sans">
                {card.color}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
