import React, { useRef } from 'react';
import { RoomNode } from '../../types/engine';
import { useEngineStore } from '../../store/engineStore';
import { Play, Trash2, Box, GitBranch } from 'lucide-react';
import { sound } from '../../lib/audio';

export interface RoomNodeCardProps {
  room: RoomNode;
  isSelected: boolean;
  onSelect: () => void;
  zoom: number;
}

export function RoomNodeCard({ room, isSelected, onSelect, zoom }: RoomNodeCardProps) {
  const {
    updateRoom,
    deleteRoom,
    setMode,
    currentRoomId,
  } = useEngineStore();

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, nodeX: 0, nodeY: 0 });

  const isPlayerHere = currentRoomId === room.id;

  // Biome header gradient & border styling
  const getBiomeStyle = (mood: string) => {
    switch (mood) {
      case 'sanctuary':
        return {
          bar: 'bg-amber-500',
          border: 'border-amber-500/40',
          tag: 'Sanctuary',
        };
      case 'arcane':
        return {
          bar: 'bg-sky-500',
          border: 'border-sky-500/40',
          tag: 'Arcane',
        };
      case 'crypt':
        return {
          bar: 'bg-purple-500',
          border: 'border-purple-500/40',
          tag: 'Crypt',
        };
      case 'peril':
        return {
          bar: 'bg-red-500',
          border: 'border-red-500/40',
          tag: 'Peril',
        };
      case 'twilight':
      default:
        return {
          bar: 'bg-indigo-500',
          border: 'border-indigo-500/40',
          tag: 'Twilight',
        };
    }
  };

  const biome = getBiomeStyle(room.biomeMood);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    sound.playParchmentTap();

    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: room.editorPosition.x,
      nodeY: room.editorPosition.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = (moveEvent.clientX - dragStartRef.current.mouseX) / zoom;
      const deltaY = (moveEvent.clientY - dragStartRef.current.mouseY) / zoom;

      updateRoom(room.id, {
        editorPosition: {
          x: Math.round(dragStartRef.current.nodeX + deltaX),
          y: Math.round(dragStartRef.current.nodeY + deltaY),
        },
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handlePlaytest = (e: React.MouseEvent) => {
    e.stopPropagation();
    useEngineStore.setState({ currentRoomId: room.id, mode: 'PLAY' });
    sound.playDiscoveryChime();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete room "${room.title}"?`)) {
      deleteRoom(room.id);
    }
  };

  return (
    <div
      style={{
        transform: `translate(${room.editorPosition.x}px, ${room.editorPosition.y}px)`,
        width: 200,
        height: 110,
      }}
      onMouseDown={handleMouseDown}
      className={`absolute top-0 left-0 rounded-xl bg-panel/95 backdrop-blur border text-prose-main cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isSelected
          ? 'border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.4)] z-20 ring-1 ring-amber-400'
          : `${biome.border} hover:border-slate-500 shadow-xl z-10`
      }`}
    >
      {/* Top Biome Accent Strip */}
      <div className={`h-1.5 w-full rounded-t-xl ${biome.bar}`} />

      {/* Card Content */}
      <div className="p-2.5 flex flex-col justify-between h-[104px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-1">
          <div className="truncate">
            <h3 className="font-sans font-bold text-xs text-prose-display truncate" title={room.title}>
              {room.title}
            </h3>
            <span className="font-mono text-[9.5px] text-slate-500 truncate block">
              {room.id}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isPlayerHere && (
              <span
                className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]"
                title="Player is currently in this room"
              />
            )}
            <button
              onClick={handlePlaytest}
              className="p-1 rounded text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 transition-colors"
              title="Playtest from this room"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              title="Delete Room"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Middle Stats Badges */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1" title={`${room.entityIds.length} Entities/Items`}>
            <Box className="w-3 h-3 text-sky-400" />
            <span>{room.entityIds.length}</span>
          </span>
          <span className="flex items-center gap-1" title={`${room.choices.length} Branching Choices`}>
            <GitBranch className="w-3 h-3 text-purple-400" />
            <span>{room.choices.length}</span>
          </span>
          <span className="ml-auto text-[9px] uppercase font-mono px-1 rounded bg-void/60 text-slate-400">
            {biome.tag}
          </span>
        </div>

        {/* Bottom Exits Pill Row */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 border-t border-subtle-border/60">
          {room.exits.length === 0 ? (
            <span className="text-[9px] text-slate-600 italic">No exits wired</span>
          ) : (
            room.exits.map((ex) => (
              <span
                key={`${ex.direction}-${ex.targetRoomId}`}
                className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase font-bold ${
                  ex.isLocked
                    ? 'bg-red-950/40 border-red-500/40 text-red-300'
                    : 'bg-void border-subtle-border text-slate-300'
                }`}
              >
                {ex.isLocked ? `🔒${ex.direction.slice(0, 1)}` : ex.direction.slice(0, 2)}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
