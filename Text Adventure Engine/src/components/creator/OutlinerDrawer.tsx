import { useState } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { Button } from '../ui/button';
import {
  Compass,
  Box,
  Flag,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { sound } from '../../lib/audio';

export function OutlinerDrawer() {
  const {
    cartridge,
    selectedRoomId,
    setSelectedRoomId,
    addRoom,
    setEntityModalOpen,
    flags,
    setFlag,
    setCanvasPan,
  } = useEngineStore();

  const [search, setSearch] = useState('');
  const [roomsExpanded, setRoomsExpanded] = useState(true);
  const [entitiesExpanded, setEntitiesExpanded] = useState(true);
  const [flagsExpanded, setFlagsExpanded] = useState(false);

  const rooms = Object.values(cartridge.rooms).filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())
  );

  const entities = Object.values(cartridge.entities).filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoomClick = (roomId: string) => {
    setSelectedRoomId(roomId);
    sound.playParchmentTap();
    const r = cartridge.rooms[roomId];
    if (r) {
      // Pan canvas to focus on this room
      setCanvasPan({
        x: -r.editorPosition.x + 300,
        y: -r.editorPosition.y + 200,
      });
    }
  };

  const handleAddRoom = () => {
    // Generate new room slightly offset from current center
    const newId = addRoom({
      title: `Chamber ${Object.keys(cartridge.rooms).length + 1}`,
      editorPosition: { x: 340 + Math.random() * 80, y: 300 + Math.random() * 80 },
    });
    handleRoomClick(newId);
  };

  return (
    <div className="w-64 h-full bg-panel/90 backdrop-blur-md border-r border-subtle-border flex flex-col select-none text-prose-main z-20 shrink-0">
      {/* Search Bar */}
      <div className="p-2.5 border-b border-subtle-border">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Loom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-elevated/70 border border-subtle-border rounded-md pl-8 pr-2.5 py-1 text-xs font-sans text-prose-display placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 font-sans text-xs">
        {/* 1. Rooms Section */}
        <div>
          <div className="flex items-center justify-between py-1 text-slate-400 hover:text-prose-display">
            <button
              onClick={() => setRoomsExpanded(!roomsExpanded)}
              className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10.5px]"
            >
              {roomsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Chambers ({rooms.length})</span>
            </button>
            <button
              onClick={handleAddRoom}
              className="p-1 rounded text-amber-400 hover:bg-elevated"
              title="Add New Chamber"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {roomsExpanded && (
            <div className="mt-1 space-y-0.5 pl-2">
              {rooms.map((r) => {
                const isSelected = selectedRoomId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoomClick(r.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors truncate ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                        : 'text-slate-300 hover:bg-elevated hover:text-white'
                    }`}
                  >
                    <span className="truncate">{r.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-1">
                      {r.exits.length} exits
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. World Entities & Relics Section */}
        <div>
          <div className="flex items-center justify-between py-1 text-slate-400 hover:text-prose-display">
            <button
              onClick={() => setEntitiesExpanded(!entitiesExpanded)}
              className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10.5px]"
            >
              {entitiesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <Box className="w-3.5 h-3.5 text-sky-400" />
              <span>Relics & Items ({entities.length})</span>
            </button>
            <button
              onClick={() => setEntityModalOpen(true, null)}
              className="p-1 rounded text-sky-400 hover:bg-elevated"
              title="Add New Entity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {entitiesExpanded && (
            <div className="mt-1 space-y-0.5 pl-2">
              {entities.map((ent) => (
                <button
                  key={ent.id}
                  onClick={() => setEntityModalOpen(true, ent.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors text-slate-300 hover:bg-elevated hover:text-sky-300 group"
                >
                  <span className="truncate">{ent.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 group-hover:text-sky-400">
                    {ent.isTakeable ? 'Item' : 'Fixed'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Story Flags Section */}
        <div>
          <div className="flex items-center justify-between py-1 text-slate-400 hover:text-prose-display">
            <button
              onClick={() => setFlagsExpanded(!flagsExpanded)}
              className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10.5px]"
            >
              {flagsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <Flag className="w-3.5 h-3.5 text-purple-400" />
              <span>World Flags ({Object.keys(flags).length})</span>
            </button>
          </div>

          {flagsExpanded && (
            <div className="mt-1 space-y-1 pl-2">
              {Object.entries(flags).map(([fKey, val]) => (
                <div
                  key={fKey}
                  className="flex items-center justify-between px-2 py-1 rounded bg-void/50 border border-subtle-border/50 text-[11px]"
                >
                  <span className="font-mono text-slate-300 truncate" title={fKey}>
                    {fKey}
                  </span>
                  <button
                    onClick={() => setFlag(fKey, !val)}
                    className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      val ? 'bg-purple-500/20 text-purple-300' : 'text-slate-500'
                    }`}
                  >
                    {val ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
