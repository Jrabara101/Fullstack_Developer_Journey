import React, { useRef, useState, useEffect } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { RoomNodeCard } from './RoomNodeCard';
import { BezierConduit } from './BezierConduit';
import { OutlinerDrawer } from './OutlinerDrawer';
import { PassageInspector } from './PassageInspector';
import { Button } from '../ui/button';
import { ZoomIn, ZoomOut, Maximize2, Plus, Play } from 'lucide-react';
import { sound } from '../../lib/audio';

export function CreatorStudio() {
  const {
    cartridge,
    selectedRoomId,
    setSelectedRoomId,
    canvasPan,
    setCanvasPan,
    canvasZoom,
    setCanvasZoom,
    addRoom,
    toggleMode,
  } = useEngineStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ mouseX: 0, mouseY: 0, startPanX: 0, startPanY: 0 });

  const rooms = Object.values(cartridge.rooms);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setCanvasZoom((prevZoom) => {
      const nextZoom = Math.max(0.35, Math.min(2.2, prevZoom * zoomFactor));
      return nextZoom;
    });
  };

  // Pan canvas drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background (not on a node card or control)
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      panStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        startPanX: canvasPan.x,
        startPanY: canvasPan.y,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - panStartRef.current.mouseX;
        const deltaY = moveEvent.clientY - panStartRef.current.mouseY;
        setCanvasPan({
          x: panStartRef.current.startPanX + deltaX,
          y: panStartRef.current.startPanY + deltaY,
        });
      };

      const handleMouseUp = () => {
        setIsPanning(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleResetView = () => {
    setCanvasPan({ x: 100, y: 80 });
    setCanvasZoom(1);
    sound.playParchmentTap();
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden relative">
      {/* 1. Left Outliner & Entity Drawer */}
      <OutlinerDrawer />

      {/* 2. Center 2D Pan-and-Zoom Canvas Workspace */}
      <div
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        className={`flex-1 h-full canvas-dot-grid relative overflow-hidden select-none ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Transformable Canvas Surface */}
        <div
          style={{
            transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
            transformOrigin: '0 0',
          }}
          className="absolute inset-0 pointer-events-none w-[5000px] h-[5000px]"
        >
          {/* SVG Conduits Layer */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
            {rooms.flatMap((fromRoom) =>
              fromRoom.exits.map((exit, idx) => {
                const toRoom = cartridge.rooms[exit.targetRoomId];
                if (!toRoom) return null;
                const isSelected =
                  selectedRoomId === fromRoom.id || selectedRoomId === toRoom.id;

                return (
                  <BezierConduit
                    key={`conduit-${fromRoom.id}-${exit.targetRoomId}-${idx}`}
                    fromRoom={fromRoom}
                    toRoom={toRoom}
                    exit={exit}
                    isSelected={isSelected}
                  />
                );
              })
            )}
          </svg>

          {/* HTML Room Cards Layer */}
          <div className="absolute inset-0 pointer-events-auto">
            {rooms.map((room) => (
              <RoomNodeCard
                key={room.id}
                room={room}
                isSelected={selectedRoomId === room.id}
                onSelect={() => setSelectedRoomId(room.id)}
                zoom={canvasZoom}
              />
            ))}
          </div>
        </div>

        {/* Floating Canvas Controls Overlay */}
        <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1.5 p-1 bg-panel/90 backdrop-blur-md border border-subtle-border rounded-xl shadow-xl">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCanvasZoom((z) => Math.min(2.2, z + 0.15))}
            title="Zoom In"
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCanvasZoom((z) => Math.max(0.35, z - 0.15))}
            title="Zoom Out"
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetView}
            title="Fit / Reset View"
            className="h-8 w-8 p-0"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-subtle-border mx-1" />

          <Button
            size="sm"
            variant="amber"
            onClick={() => {
              const newId = addRoom({
                editorPosition: {
                  x: Math.round((-canvasPan.x + 400) / canvasZoom),
                  y: Math.round((-canvasPan.y + 250) / canvasZoom),
                },
              });
              setSelectedRoomId(newId);
            }}
            className="h-8 text-xs px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Chamber</span>
          </Button>

          <div className="h-4 w-px bg-subtle-border mx-1" />

          <Button
            size="sm"
            variant="emerald"
            onClick={toggleMode}
            className="h-8 text-xs px-3"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Flight Check (Play)</span>
          </Button>
        </div>

        {/* Canvas HUD Legend */}
        <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 bg-panel/80 backdrop-blur border border-subtle-border rounded-lg text-[11px] font-mono text-slate-400">
          <span>ZOOM: {Math.round(canvasZoom * 100)}%</span>
          <span>CHAMBERS: {rooms.length}</span>
          <span>DRAG TO PAN</span>
        </div>
      </div>

      {/* 3. Right Passage & Logic Inspector */}
      {selectedRoomId && <PassageInspector />}
    </div>
  );
}
