import { useState } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Wrench,
  X,
  Compass,
  Flag,
  Binary,
  Backpack,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export function GodModeDrawer() {
  const {
    isGodModeOpen,
    setGodModeOpen,
    flags,
    setFlag,
    variables,
    setVariable,
    currentRoomId,
    teleportToRoom,
    cartridge,
    inventoryIds,
    spawnItemInSatchel,
    removeItemFromSatchel,
    resetPlayRuntime,
    turnCount,
  } = useEngineStore();

  const [newFlagName, setNewFlagName] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newVarVal, setNewVarVal] = useState(0);

  if (!isGodModeOpen) return null;

  const allEntities = Object.values(cartridge.entities);
  const allRooms = Object.values(cartridge.rooms);

  return (
    <div className="fixed top-12 right-0 z-40 w-96 max-w-full h-[calc(100vh-48px)] bg-panel/95 backdrop-blur-xl border-l border-subtle-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-prose-main">
      {/* Header */}
      <div className="p-3.5 border-b border-subtle-border flex items-center justify-between bg-void/50">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400" />
          <span className="font-sans font-bold text-xs uppercase tracking-wider text-prose-display">
            God Mode State Inspector
          </span>
          <Badge variant="amber">Turn {turnCount}</Badge>
        </div>
        <button
          onClick={() => setGodModeOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-elevated"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body with scrolling sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-sans">
        {/* 1. Teleport Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Teleport Player Chamber</span>
          </div>
          <select
            value={currentRoomId}
            onChange={(e) => teleportToRoom(e.target.value)}
            className="w-full bg-elevated border border-subtle-border rounded-md px-2.5 py-1.5 text-prose-main focus:outline-none focus:border-amber-400"
          >
            {allRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.title} ({room.id})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Story Flags Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-purple-400" />
              <span>World Flags ({Object.keys(flags).length})</span>
            </div>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {Object.entries(flags).map(([flag, val]) => (
              <div
                key={flag}
                className="flex items-center justify-between p-1.5 rounded bg-void/50 border border-subtle-border/60"
              >
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[190px]" title={flag}>
                  {flag}
                </span>
                <button
                  type="button"
                  onClick={() => setFlag(flag, !val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    val
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {val ? 'TRUE' : 'FALSE'}
                </button>
              </div>
            ))}
          </div>

          {/* Quick add flag */}
          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              placeholder="new_flag_key"
              value={newFlagName}
              onChange={(e) => setNewFlagName(e.target.value)}
              className="flex-1 bg-elevated border border-subtle-border rounded px-2 py-1 text-xs font-mono text-prose-main focus:outline-none focus:border-purple-400"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (newFlagName.trim()) {
                  setFlag(newFlagName.trim(), true);
                  setNewFlagName('');
                }
              }}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* 3. Numeric Variables Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Binary className="w-3.5 h-3.5 text-emerald-400" />
            <span>Story Variables</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {Object.entries(variables).map(([vName, val]) => (
              <div
                key={vName}
                className="flex items-center justify-between p-1.5 rounded bg-void/50 border border-subtle-border/60"
              >
                <span className="font-mono text-[11px] text-slate-300">{vName}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setVariable(vName, val - 1)}
                    className="w-5 h-5 bg-elevated rounded border border-subtle-border hover:bg-slate-700 text-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs w-6 text-center text-emerald-400 font-bold">{val}</span>
                  <button
                    onClick={() => setVariable(vName, val + 1)}
                    className="w-5 h-5 bg-elevated rounded border border-subtle-border hover:bg-slate-700 text-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              placeholder="var_name"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              className="flex-1 bg-elevated border border-subtle-border rounded px-2 py-1 text-xs font-mono text-prose-main focus:outline-none focus:border-emerald-400"
            />
            <input
              type="number"
              value={newVarVal}
              onChange={(e) => setNewVarVal(parseInt(e.target.value, 10) || 0)}
              className="w-14 bg-elevated border border-subtle-border rounded px-2 py-1 text-xs font-mono text-prose-main focus:outline-none focus:border-emerald-400"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (newVarName.trim()) {
                  setVariable(newVarName.trim(), newVarVal);
                  setNewVarName('');
                  setNewVarVal(0);
                }
              }}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* 4. Satchel Item Spawner */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Backpack className="w-3.5 h-3.5 text-amber-400" />
            <span>Satchel Inventory Spawner</span>
          </div>

          <div className="space-y-1.5">
            {allEntities.map((ent) => {
              const inSatchel = inventoryIds.includes(ent.id);
              return (
                <div
                  key={ent.id}
                  className="flex items-center justify-between p-1.5 rounded bg-void/50 border border-subtle-border/60"
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                    <span className="text-amber-400">◈</span>
                    <span className="truncate">{ent.name}</span>
                  </div>
                  {inSatchel ? (
                    <button
                      onClick={() => removeItemFromSatchel(ent.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/30"
                      title="Remove from satchel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => spawnItemInSatchel(ent.id)}
                      className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-emerald-950/30"
                      title="Add to satchel"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Hard Reset */}
        <div className="pt-2 border-t border-subtle-border">
          <Button
            variant="danger"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              if (confirm('Reset entire story runtime back to turn 1?')) {
                resetPlayRuntime();
              }
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restart Play Session (Turn 1)
          </Button>
        </div>
      </div>
    </div>
  );
}
