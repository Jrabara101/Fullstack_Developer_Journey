import React, { useRef } from 'react';
import { GameEngine } from '../game/gameEngine';
import { Crosshair, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, ChevronUp } from 'lucide-react';

interface TouchControlsProps {
  engine: GameEngine;
  inputState: React.MutableRefObject<{
    moveForward: boolean;
    moveBackward: boolean;
    moveLeft: boolean;
    moveRight: boolean;
    jump: boolean;
    crouch: boolean;
    walk: boolean;
  }>;
  sensitivity?: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  engine,
  inputState,
  sensitivity = 0.0022,
}) => {
  const lastTouchRef = useRef<{ id: number; x: number; y: number } | null>(null);

  // Touch aim handler for the right side of the screen
  const handleAimTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Only capture touches on right half of screen for aiming
      if (touch.clientX > window.innerWidth * 0.35 && !lastTouchRef.current) {
        lastTouchRef.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleAimTouchMove = (e: React.TouchEvent) => {
    if (!lastTouchRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lastTouchRef.current.id) {
        const dx = touch.clientX - lastTouchRef.current.x;
        const dy = touch.clientY - lastTouchRef.current.y;
        lastTouchRef.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };

        engine.playerYaw -= dx * sensitivity * 1.5;
        engine.playerPitch = Math.max(-1.35, Math.min(1.35, engine.playerPitch - dy * sensitivity * 1.5));
        break;
      }
    }
  };

  const handleAimTouchEnd = (e: React.TouchEvent) => {
    if (!lastTouchRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lastTouchRef.current.id) {
        lastTouchRef.current = null;
        break;
      }
    }
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 select-none overflow-hidden font-mono"
      onTouchStart={handleAimTouchStart}
      onTouchMove={handleAimTouchMove}
      onTouchEnd={handleAimTouchEnd}
      onTouchCancel={handleAimTouchEnd}
    >
      {/* LEFT: Directional D-PAD */}
      <div className="pointer-events-auto absolute bottom-8 left-6 flex flex-col items-center gap-1.5 touch-none">
        <button
          onTouchStart={(e) => { e.preventDefault(); inputState.current.moveForward = true; }}
          onTouchEnd={(e) => { e.preventDefault(); inputState.current.moveForward = false; }}
          onMouseDown={() => { inputState.current.moveForward = true; }}
          onMouseUp={() => { inputState.current.moveForward = false; }}
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/40 bg-slate-900/80 text-amber-400 active:bg-amber-500/30 active:scale-95 transition-transform shadow-lg backdrop-blur-md"
          aria-label="Move Forward"
        >
          <ArrowUp className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); inputState.current.moveLeft = true; }}
            onTouchEnd={(e) => { e.preventDefault(); inputState.current.moveLeft = false; }}
            onMouseDown={() => { inputState.current.moveLeft = true; }}
            onMouseUp={() => { inputState.current.moveLeft = false; }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/40 bg-slate-900/80 text-amber-400 active:bg-amber-500/30 active:scale-95 transition-transform shadow-lg backdrop-blur-md"
            aria-label="Strafe Left"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); inputState.current.moveBackward = true; }}
            onTouchEnd={(e) => { e.preventDefault(); inputState.current.moveBackward = false; }}
            onMouseDown={() => { inputState.current.moveBackward = true; }}
            onMouseUp={() => { inputState.current.moveBackward = false; }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/40 bg-slate-900/80 text-amber-400 active:bg-amber-500/30 active:scale-95 transition-transform shadow-lg backdrop-blur-md"
            aria-label="Move Backward"
          >
            <ArrowDown className="h-6 w-6" />
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); inputState.current.moveRight = true; }}
            onTouchEnd={(e) => { e.preventDefault(); inputState.current.moveRight = false; }}
            onMouseDown={() => { inputState.current.moveRight = true; }}
            onMouseUp={() => { inputState.current.moveRight = false; }}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/40 bg-slate-900/80 text-amber-400 active:bg-amber-500/30 active:scale-95 transition-transform shadow-lg backdrop-blur-md"
            aria-label="Strafe Right"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* RIGHT: Action Buttons */}
      <div className="pointer-events-auto absolute bottom-8 right-6 flex flex-col items-end gap-3 touch-none">
        {/* Upper row: Jump & Crouch & Reload */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              engine.reload();
            }}
            onClick={() => engine.reload()}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-xs font-bold text-slate-200 active:bg-slate-700 active:scale-95 transition-transform shadow-lg backdrop-blur-md"
            title="Reload"
          >
            <RotateCw className="h-5 w-5 text-slate-300" />
          </button>

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              inputState.current.crouch = !inputState.current.crouch;
            }}
            onClick={() => {
              inputState.current.crouch = !inputState.current.crouch;
            }}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-[10px] font-bold text-slate-200 active:bg-slate-700 active:scale-95 transition-transform shadow-lg backdrop-blur-md"
            title="Crouch"
          >
            CROUCH
          </button>

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              inputState.current.jump = true;
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              inputState.current.jump = false;
            }}
            onMouseDown={() => { inputState.current.jump = true; }}
            onMouseUp={() => { inputState.current.jump = false; }}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-500/50 bg-slate-900/80 text-xs font-bold text-sky-300 active:bg-sky-500/30 active:scale-95 transition-transform shadow-lg backdrop-blur-md"
            title="Jump"
          >
            <ChevronUp className="h-6 w-6" />
          </button>

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              engine.toggleShoulderSwap();
            }}
            onClick={() => engine.toggleShoulderSwap()}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-[10px] font-bold text-slate-200 active:bg-slate-700 active:scale-95 transition-transform shadow-lg backdrop-blur-md"
            title="Swap Shoulder"
          >
            SWAP
          </button>
        </div>

        {/* Lower row: Primary FIRE button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            engine.isShooting = true;
            engine.handlePrimaryFire();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            engine.isShooting = false;
          }}
          onMouseDown={() => {
            engine.isShooting = true;
            engine.handlePrimaryFire();
          }}
          onMouseUp={() => {
            engine.isShooting = false;
          }}
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-500/60 bg-rose-600/30 text-rose-300 active:bg-rose-600/60 active:scale-95 transition-transform shadow-2xl backdrop-blur-md"
          title="Fire"
        >
          <Crosshair className="h-9 w-9 text-rose-400" />
        </button>
      </div>
    </div>
  );
};
