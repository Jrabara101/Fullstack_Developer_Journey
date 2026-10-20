// ----------------------------------------------------
// 7x7 Merge Matrix Board with Pointer Capture & Physics
// ----------------------------------------------------

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import type { BoardItem, Coordinate } from '../engine/types';
import { TileCell } from './TileCell';
import { ItemToken } from './ItemToken';
import { ParticleCanvas } from './ParticleCanvas';

export const MergeBoard: React.FC = () => {
  const {
    grid,
    anomalies,
    moveOrMerge,
    draggedItem,
    setDraggedItem,
    setHoveredCell,
    activeShockwave,
  } = useGameStore();

  const boardRef = useRef<HTMLDivElement | null>(null);
  const [dragOrigin, setDragOrigin] = useState<Coordinate | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [targetSlot, setTargetSlot] = useState<Coordinate | null>(null);

  // Compute if target is compatible for merge
  const isTargetCompatible = useCallback((targetCoord: Coordinate | null): boolean => {
    if (!targetCoord || !draggedItem || !dragOrigin) return false;
    if (targetCoord.x === dragOrigin.x && targetCoord.y === dragOrigin.y) return false;

    const targetItem = grid[targetCoord.y]?.[targetCoord.x];
    if (!targetItem) return false; // Empty slot is valid for move, but not a merge partner

    // Same tier
    if (targetItem.tier === draggedItem.tier && !targetItem.category.startsWith('branch_')) return true;

    // Catalyst infusion
    if (
      (draggedItem.category === 'catalyst' && targetItem.category === 'earth') ||
      (targetItem.category === 'catalyst' && draggedItem.category === 'earth')
    ) {
      return true;
    }

    return false;
  }, [draggedItem, dragOrigin, grid]);

  // Handle pointer down on an item
  const handlePointerDown = (e: React.PointerEvent, item: BoardItem, pos: Coordinate) => {
    e.preventDefault();
    if (item.isLocked) return;

    setDraggedItem(item);
    setDragOrigin(pos);
    setPointerPos({ x: e.clientX, y: e.clientY });
    setTargetSlot(pos);

    if (boardRef.current) {
      boardRef.current.setPointerCapture(e.pointerId);
    }
  };

  // Pointer move across board container
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedItem || !boardRef.current) return;
    setPointerPos({ x: e.clientX, y: e.clientY });

    // Calculate grid cell under pointer
    const rect = boardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
      const cellW = rect.width / 7;
      const cellH = rect.height / 7;
      const gx = Math.min(6, Math.max(0, Math.floor(relX / cellW)));
      const gy = Math.min(6, Math.max(0, Math.floor(relY / cellH)));

      const cellCoord = { x: gx, y: gy };
      setTargetSlot(cellCoord);
      setHoveredCell(cellCoord);
    } else {
      setTargetSlot(null);
      setHoveredCell(null);
    }
  };

  // Pointer release / drop
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggedItem || !dragOrigin) {
      setDraggedItem(null);
      setDragOrigin(null);
      setPointerPos(null);
      setTargetSlot(null);
      setHoveredCell(null);
      return;
    }

    if (targetSlot) {
      moveOrMerge(dragOrigin, targetSlot);
    }

    // Release pointer capture
    try {
      if (boardRef.current && boardRef.current.hasPointerCapture(e.pointerId)) {
        boardRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    setDraggedItem(null);
    setDragOrigin(null);
    setPointerPos(null);
    setTargetSlot(null);
    setHoveredCell(null);
  };

  // Global cancel on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDraggedItem(null);
        setDragOrigin(null);
        setPointerPos(null);
        setTargetSlot(null);
        setHoveredCell(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDraggedItem, setHoveredCell]);

  return (
    <div className="relative w-full max-w-[580px] aspect-square mx-auto p-2 sm:p-3 rounded-2xl board-sunken-well border border-[#24304A] shadow-2xl overflow-hidden select-none touch-none">
      {/* 60fps Shockwave & Particle Overlay */}
      <ParticleCanvas shockwave={activeShockwave} />

      {/* 7x7 Matrix Grid Container */}
      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="grid grid-cols-7 grid-rows-7 gap-1.5 sm:gap-2 w-full h-full relative"
      >
        {grid.map((row, y) =>
          row.map((item, x) => {
            const anomaly = anomalies.find(a => a.x === x && a.y === y) || null;
            const isHovered = targetSlot?.x === x && targetSlot?.y === y;
            const isDragSource = dragOrigin?.x === x && dragOrigin?.y === y;
            const isValid = isTargetCompatible({ x, y });

            return (
              <TileCell
                key={`${x}-${y}`}
                x={x}
                y={y}
                item={item}
                anomaly={anomaly}
                isHovered={isHovered}
                isValidTarget={isValid}
                isDragSource={isDragSource}
                onPointerDown={handlePointerDown}
                onPointerEnter={() => {}}
                onPointerUp={() => {}}
              />
            );
          })
        )}
      </div>

      {/* Floating Drag Ghost with Vector pointer */}
      {draggedItem && pointerPos && boardRef.current && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16"
          style={{
            left: pointerPos.x,
            top: pointerPos.y,
          }}
        >
          <ItemToken item={draggedItem} isDragging={true} />

          {/* Magnetic Snap Target Circle */}
          {targetSlot && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/80 animate-ping opacity-60 pointer-events-none" />
          )}
        </div>
      )}
    </div>
  );
};
