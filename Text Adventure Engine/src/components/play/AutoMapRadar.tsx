import { useState, useMemo } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { Compass, Lock, MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export function AutoMapRadar() {
  const {
    cartridge,
    currentRoomId,
    visitedRoomIds,
    fastTravel,
  } = useEngineStore();

  const [radarZoom, setRadarZoom] = useState(1);
  const [radarOffset, setRadarOffset] = useState({ x: 0, y: 0 });

  const rooms = cartridge.rooms;
  const currentRoom = rooms[currentRoomId];

  // Calculate bounding box of visited rooms to auto-center radar
  const { minX, minY, maxX, maxY } = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    visitedRoomIds.forEach((id) => {
      const r = rooms[id];
      if (r) {
        minX = Math.min(minX, r.editorPosition.x);
        minY = Math.min(minY, r.editorPosition.y);
        maxX = Math.max(maxX, r.editorPosition.x);
        maxY = Math.max(maxY, r.editorPosition.y);
      }
    });
    if (minX === Infinity) {
      minX = 100; minY = 100; maxX = 500; maxY = 500;
    }
    return { minX, minY, maxX, maxY };
  }, [visitedRoomIds, rooms]);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Biome color styling
  const getBiomeColors = (mood: string, isCurrent: boolean) => {
    if (isCurrent) {
      return {
        fill: '#1c2539',
        stroke: '#F59E0B',
        glow: 'rgba(245, 158, 11, 0.4)',
      };
    }
    switch (mood) {
      case 'sanctuary':
        return { fill: '#141A29', stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.2)' };
      case 'arcane':
        return { fill: '#141A29', stroke: '#38BDF8', glow: 'rgba(56, 189, 248, 0.2)' };
      case 'crypt':
        return { fill: '#141A29', stroke: '#A855F7', glow: 'rgba(168, 85, 247, 0.2)' };
      case 'peril':
        return { fill: '#141A29', stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.2)' };
      case 'twilight':
      default:
        return { fill: '#141A29', stroke: '#818CF8', glow: 'rgba(129, 140, 248, 0.2)' };
    }
  };

  const handleCenter = () => {
    setRadarZoom(1);
    setRadarOffset({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col h-full bg-panel/80 rounded-xl border border-subtle-border overflow-hidden shadow-lg select-none">
      {/* Radar Top Header */}
      <div className="px-3 py-2 bg-void/70 border-b border-subtle-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-sans font-bold text-xs uppercase tracking-wider text-prose-display">
            Auto-Cartographer
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            [{visitedRoomIds.length}/{Object.keys(rooms).length} Visited]
          </span>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRadarZoom((z) => Math.max(0.6, z - 0.2))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-elevated"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() => setRadarZoom((z) => Math.min(2.0, z + 0.2))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-elevated"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={handleCenter}
            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-elevated"
            title="Center Radar"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* SVG Radar Map Viewport */}
      <div className="relative flex-1 bg-void/90 overflow-hidden cursor-crosshair">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:16px_16px]" />

        <svg
          className="w-full h-full"
          viewBox={`${centerX - 240 / radarZoom + radarOffset.x} ${
            centerY - 160 / radarZoom + radarOffset.y
          } ${480 / radarZoom} ${320 / radarZoom}`}
        >
          <defs>
            {/* Arrow marker for conduits */}
            <marker
              id="radar-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748B" />
            </marker>
          </defs>

          {/* Draw exit conduits between visited rooms */}
          {visitedRoomIds.map((fromId) => {
            const fromRoom = rooms[fromId];
            if (!fromRoom) return null;

            return fromRoom.exits.map((exit, exIdx) => {
              const toRoom = rooms[exit.targetRoomId];
              const isToVisited = toRoom && visitedRoomIds.includes(toRoom.id);

              if (isToVisited && toRoom) {
                // Known corridor between two visited rooms
                const x1 = fromRoom.editorPosition.x + 40;
                const y1 = fromRoom.editorPosition.y + 25;
                const x2 = toRoom.editorPosition.x + 40;
                const y2 = toRoom.editorPosition.y + 25;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                return (
                  <g key={`corridor-${fromId}-${exit.targetRoomId}-${exIdx}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={exit.isLocked ? '#EF4444' : '#334155'}
                      strokeWidth={exit.isLocked ? 2 : 1.5}
                      strokeDasharray={exit.isLocked ? '4 2' : 'none'}
                    />
                    {exit.isLocked && (
                      <circle cx={midX} cy={midY} r="6" fill="#EF4444" opacity="0.8" />
                    )}
                  </g>
                );
              } else {
                // Mystery vector to an unvisited room
                const x1 = fromRoom.editorPosition.x + 40;
                const y1 = fromRoom.editorPosition.y + 25;
                let dx = 0;
                let dy = 0;
                if (exit.direction === 'north') dy = -35;
                else if (exit.direction === 'south') dy = 35;
                else if (exit.direction === 'east') dx = 35;
                else if (exit.direction === 'west') dx = -35;
                else if (exit.direction === 'up') { dx = 25; dy = -25; }
                else if (exit.direction === 'down') { dx = -25; dy = 25; }

                return (
                  <g key={`mystery-${fromId}-${exIdx}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x1 + dx}
                      y2={y1 + dy}
                      stroke="#475569"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle cx={x1 + dx} cy={y1 + dy} r="3" fill="#64748B" />
                  </g>
                );
              }
            });
          })}

          {/* Draw Visited Room Nodes */}
          {visitedRoomIds.map((roomId) => {
            const room = rooms[roomId];
            if (!room) return null;

            const isCurrent = roomId === currentRoomId;
            const colors = getBiomeColors(room.biomeMood, isCurrent);
            const x = room.editorPosition.x;
            const y = room.editorPosition.y;

            return (
              <g
                key={`radar-node-${roomId}`}
                onClick={() => fastTravel(roomId)}
                className="cursor-pointer group"
              >
                {/* Active Beacon Wave */}
                {isCurrent && (
                  <circle
                    cx={x + 40}
                    cy={y + 25}
                    r="34"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    className="animate-beacon opacity-75"
                  />
                )}

                {/* Room Rect Card */}
                <rect
                  x={x}
                  y={y}
                  width="80"
                  height="50"
                  rx="6"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isCurrent ? '2.5' : '1.5'}
                  className="transition-all group-hover:brightness-125"
                  style={{
                    filter: isCurrent ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' : 'none',
                  }}
                />

                {/* Biome color strip */}
                <rect
                  x={x + 1}
                  y={y + 1}
                  width="78"
                  height="4"
                  rx="2"
                  fill={colors.stroke}
                />

                {/* Room title text */}
                <text
                  x={x + 40}
                  y={y + 24}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="8.5"
                  fontWeight="600"
                  fontFamily="sans-serif"
                  className="pointer-events-none select-none"
                >
                  {room.title.length > 13 ? room.title.slice(0, 11) + '..' : room.title}
                </text>

                {/* Item indicator dots */}
                {room.entityIds.length > 0 && (
                  <circle
                    cx={x + 12}
                    cy={y + 38}
                    r="3"
                    fill="#38BDF8"
                    className="pointer-events-none"
                  />
                )}

                {/* Current room player pin */}
                {isCurrent && (
                  <g transform={`translate(${x + 34}, ${y + 30})`}>
                    <circle cx="6" cy="6" r="4.5" fill="#F59E0B" />
                    <circle cx="6" cy="6" r="2" fill="#080A0F" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover / Current room tooltip bar */}
        <div className="absolute bottom-1.5 left-2 right-2 px-2 py-1 bg-panel/90 backdrop-blur border border-subtle-border rounded text-[11px] font-sans flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="font-semibold text-slate-200 truncate">
              {currentRoom?.title || 'Unknown Room'}
            </span>
          </div>
          <span className="text-[10px] text-amber-300/80 font-mono shrink-0">
            Click room to fast-travel
          </span>
        </div>
      </div>
    </div>
  );
}
