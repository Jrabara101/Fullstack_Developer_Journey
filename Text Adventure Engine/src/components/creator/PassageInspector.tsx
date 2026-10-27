import { useState, useRef } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { BiomeMood, Direction, RoomExit, RoomChoice } from '../../types/engine';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { renderInteractiveProse } from '../../lib/markup';
import {
  Compass,
  Edit3,
  Eye,
  GitBranch,
  Lock,
  Plus,
  Trash2,
  X,
  Play,
  Box,
} from 'lucide-react';
import { sound } from '../../lib/audio';
import { generateId } from '../../lib/utils';

export function PassageInspector() {
  const {
    selectedRoomId,
    setSelectedRoomId,
    cartridge,
    updateRoom,
    flags,
    variables,
    inventoryIds,
  } = useEngineStore();

  const [activeTab, setActiveTab] = useState<'prose' | 'exits' | 'choices' | 'entities'>('prose');
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!selectedRoomId) return null;
  const room = cartridge.rooms[selectedRoomId];
  if (!room) return null;

  const allRooms = Object.values(cartridge.rooms);
  const allEntities = Object.values(cartridge.entities);

  // Helper to insert syntax snippets into the prose textarea
  const insertSyntax = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const nextText = text.substring(0, start) + snippet + text.substring(end);

    updateRoom(room.id, { descriptionMarkup: nextText });
    sound.playParchmentTap();

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  const handleAddExit = () => {
    const directions: Direction[] = ['north', 'south', 'east', 'west', 'up', 'down'];
    // Find first unused direction
    const usedDirs = room.exits.map((e) => e.direction);
    const availDir = directions.find((d) => !usedDirs.includes(d)) || 'north';
    const otherRoom = allRooms.find((r) => r.id !== room.id);
    if (!otherRoom) return;

    const newExit: RoomExit = {
      direction: availDir,
      targetRoomId: otherRoom.id,
      conduitLabel: `${availDir.toUpperCase()} Path`,
    };

    updateRoom(room.id, { exits: [...room.exits, newExit] });
    sound.playDiscoveryChime();
  };

  const handleRemoveExit = (index: number) => {
    const nextExits = room.exits.filter((_, idx) => idx !== index);
    updateRoom(room.id, { exits: nextExits });
  };

  const handleUpdateExit = (index: number, patch: Partial<RoomExit>) => {
    const nextExits = [...room.exits];
    nextExits[index] = { ...nextExits[index], ...patch };
    updateRoom(room.id, { exits: nextExits });
  };

  const handleAddChoice = () => {
    const newChoice: RoomChoice = {
      id: generateId('choice'),
      label: 'Inspect the surroundings closely',
      responseMarkup: 'You observe subtle details carved into the ancient masonry.',
    };
    updateRoom(room.id, { choices: [...room.choices, newChoice] });
    sound.playDiscoveryChime();
  };

  const handleRemoveChoice = (choiceId: string) => {
    updateRoom(room.id, {
      choices: room.choices.filter((c) => c.id !== choiceId),
    });
  };

  const handleUpdateChoice = (choiceId: string, patch: Partial<RoomChoice>) => {
    updateRoom(room.id, {
      choices: room.choices.map((c) => (c.id === choiceId ? { ...c, ...patch } : c)),
    });
  };

  const handleToggleEntityInRoom = (entityId: string) => {
    const has = room.entityIds.includes(entityId);
    const nextEntities = has
      ? room.entityIds.filter((id) => id !== entityId)
      : [...room.entityIds, entityId];
    updateRoom(room.id, { entityIds: nextEntities });
    sound.playParchmentTap();
  };

  return (
    <div className="w-96 h-full bg-panel/95 backdrop-blur-xl border-l border-subtle-border flex flex-col select-none text-prose-main z-20 shrink-0">
      {/* Top Header */}
      <div className="p-3 border-b border-subtle-border flex items-center justify-between bg-void/50">
        <div className="flex items-center gap-2 truncate">
          <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-sans font-bold text-xs uppercase tracking-wider text-prose-display truncate">
            Chamber Inspector
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="emerald"
            className="text-[11px] h-6 px-2"
            onClick={() => {
              useEngineStore.setState({ currentRoomId: room.id, mode: 'PLAY' });
              sound.playDiscoveryChime();
            }}
            title="Playtest immediately from this chamber"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Playtest</span>
          </Button>
          <button
            onClick={() => setSelectedRoomId(null)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-elevated"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Room Title & Biome Mood */}
      <div className="p-3.5 border-b border-subtle-border space-y-2.5 bg-void/30">
        <div>
          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
            Chamber Title
          </label>
          <input
            type="text"
            value={room.title}
            onChange={(e) => updateRoom(room.id, { title: e.target.value })}
            className="w-full bg-elevated border border-subtle-border rounded-md px-2.5 py-1 text-sm font-sans font-semibold text-prose-display focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
              Biome Mood
            </label>
            <select
              value={room.biomeMood}
              onChange={(e) => updateRoom(room.id, { biomeMood: e.target.value as BiomeMood })}
              className="w-full bg-elevated border border-subtle-border rounded-md px-2 py-1 text-xs font-sans text-prose-main focus:outline-none focus:border-amber-400"
            >
              <option value="sanctuary">Sanctuary (Amber)</option>
              <option value="arcane">Arcane (Cyan)</option>
              <option value="crypt">Crypt (Purple)</option>
              <option value="peril">Peril (Crimson)</option>
              <option value="twilight">Twilight (Indigo)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
              ID Identifier
            </label>
            <div className="px-2 py-1 bg-void/80 rounded border border-subtle-border text-xs font-mono text-slate-400 truncate">
              {room.id}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-3 pt-2 border-b border-subtle-border bg-void/50 flex gap-1 font-sans text-xs">
        <button
          onClick={() => setActiveTab('prose')}
          className={`px-2.5 py-1.5 rounded-t-md font-semibold transition-colors ${
            activeTab === 'prose'
              ? 'bg-elevated text-amber-300 border-t border-x border-subtle-border'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Prose & Markup
        </button>
        <button
          onClick={() => setActiveTab('exits')}
          className={`px-2.5 py-1.5 rounded-t-md font-semibold transition-colors flex items-center gap-1 ${
            activeTab === 'exits'
              ? 'bg-elevated text-amber-300 border-t border-x border-subtle-border'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Exits</span>
          <span className="text-[10px] font-mono opacity-80">({room.exits.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('choices')}
          className={`px-2.5 py-1.5 rounded-t-md font-semibold transition-colors flex items-center gap-1 ${
            activeTab === 'choices'
              ? 'bg-elevated text-amber-300 border-t border-x border-subtle-border'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Choices</span>
          <span className="text-[10px] font-mono opacity-80">({room.choices.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('entities')}
          className={`px-2.5 py-1.5 rounded-t-md font-semibold transition-colors flex items-center gap-1 ${
            activeTab === 'entities'
              ? 'bg-elevated text-amber-300 border-t border-x border-subtle-border'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Relics</span>
          <span className="text-[10px] font-mono opacity-80">({room.entityIds.length})</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-3 font-sans text-xs">
        {/* TAB 1: PROSE & MARKUP */}
        {activeTab === 'prose' && (
          <div className="space-y-2.5">
            {/* Syntax Toolbar */}
            <div className="p-1.5 rounded bg-void/80 border border-subtle-border space-y-1.5">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold flex items-center justify-between">
                <span>Syntax Palette</span>
                <button
                  type="button"
                  onClick={() => setIsPreview(!isPreview)}
                  className="text-amber-400 hover:underline flex items-center gap-1 text-[10px] font-sans"
                >
                  <Eye className="w-3 h-3" />
                  <span>{isPreview ? 'Edit Mode' : 'Live Preview'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1 text-[10.5px] font-mono">
                <button
                  type="button"
                  onClick={() => insertSyntax('[[Relic Name|id:relic_id]]')}
                  className="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/40 text-sky-300 hover:bg-sky-900/60"
                  title="Insert interactive entity link"
                >
                  + [[Entity]]
                </button>
                <button
                  type="button"
                  onClick={() => insertSyntax('{if flag:flag_key}Conditional text{else}Fallback{/if}')}
                  className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60"
                  title="Insert conditional prose"
                >
                  + {'{if flag}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertSyntax('[shake]earthquake tremor[/shake]')}
                  className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60"
                >
                  + [shake]
                </button>
                <button
                  type="button"
                  onClick={() => insertSyntax('[glow]arcane light[/glow]')}
                  className="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/40 text-sky-300 hover:bg-sky-900/60"
                >
                  + [glow]
                </button>
                <button
                  type="button"
                  onClick={() => insertSyntax('[ember]crackling embers[/ember]')}
                  className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60"
                >
                  + [ember]
                </button>
                <button
                  type="button"
                  onClick={() => insertSyntax('[ghost]spectral whisper[/ghost]')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  + [ghost]
                </button>
                <button
                  type="button"
                  onClick={() => insertSyntax('[gold]celestial gold[/gold]')}
                  className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60"
                >
                  + [gold]
                </button>
                <button
                  type="button"
                  onClick={() => insertSyntax('[dropcap]Y[/dropcap]')}
                  className="px-1.5 py-0.5 rounded bg-void border border-subtle-border text-slate-400 hover:text-white"
                >
                  + [dropcap]
                </button>
              </div>
            </div>

            {/* Textarea or Live Preview */}
            {isPreview ? (
              <div className="p-3 bg-reader rounded-lg border border-subtle-border font-serif text-sm leading-relaxed text-prose-main min-h-[220px]">
                {renderInteractiveProse(room.descriptionMarkup, {
                  cartridge,
                  flags,
                  variables,
                  inventoryIds,
                  currentRoomId: room.id,
                })}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={room.descriptionMarkup}
                onChange={(e) => updateRoom(room.id, { descriptionMarkup: e.target.value })}
                rows={12}
                className="w-full bg-elevated border border-subtle-border rounded-lg p-3 font-mono text-xs text-prose-main leading-relaxed focus:outline-none focus:border-amber-400 resize-y"
                placeholder="Write atmospheric room prose here. Supports [[Entity Links]], {if flag} logic, and [kinetic] effects."
              />
            )}
          </div>
        )}

        {/* TAB 2: EXITS */}
        {activeTab === 'exits' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Directional Passages
              </span>
              <Button size="sm" variant="outline" onClick={handleAddExit}>
                <Plus className="w-3 h-3" />
                <span>Add Exit</span>
              </Button>
            </div>

            {room.exits.length === 0 ? (
              <p className="text-slate-500 italic text-center py-6">
                No exits wired. Click "Add Exit" to connect to another chamber.
              </p>
            ) : (
              room.exits.map((exit, idx) => (
                <div
                  key={`exit-${idx}`}
                  className="p-2.5 rounded-lg bg-elevated/70 border border-subtle-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <select
                        value={exit.direction}
                        onChange={(e) =>
                          handleUpdateExit(idx, { direction: e.target.value as Direction })
                        }
                        className="bg-void border border-subtle-border rounded px-1.5 py-0.5 font-mono text-xs uppercase font-bold text-amber-300"
                      >
                        <option value="north">NORTH</option>
                        <option value="south">SOUTH</option>
                        <option value="east">EAST</option>
                        <option value="west">WEST</option>
                        <option value="up">UP</option>
                        <option value="down">DOWN</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleRemoveExit(idx)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Target Room */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Leads to Chamber:
                    </label>
                    <select
                      value={exit.targetRoomId}
                      onChange={(e) => handleUpdateExit(idx, { targetRoomId: e.target.value })}
                      className="w-full bg-void border border-subtle-border rounded px-2 py-1 text-xs text-prose-main"
                    >
                      {allRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Conduit Label */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Conduit Label (on wire):
                    </label>
                    <input
                      type="text"
                      value={exit.conduitLabel || ''}
                      placeholder="e.g., Vault Bulkhead"
                      onChange={(e) => handleUpdateExit(idx, { conduitLabel: e.target.value })}
                      className="w-full bg-void border border-subtle-border rounded px-2 py-0.5 text-xs text-slate-300"
                    />
                  </div>

                  {/* Locked Toggle & Condition */}
                  <div className="pt-1.5 border-t border-subtle-border/60">
                    <label className="flex items-center gap-2 cursor-pointer mb-1.5">
                      <input
                        type="checkbox"
                        checked={!!exit.isLocked}
                        onChange={(e) => handleUpdateExit(idx, { isLocked: e.target.checked })}
                        className="rounded border-subtle-border bg-void text-amber-500"
                      />
                      <span className="font-semibold text-slate-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-red-400" />
                        <span>Passage Locked</span>
                      </span>
                    </label>

                    {exit.isLocked && (
                      <div className="space-y-1.5 pl-4">
                        <input
                          type="text"
                          placeholder="Lock description prompt..."
                          value={exit.lockDescription || ''}
                          onChange={(e) =>
                            handleUpdateExit(idx, { lockDescription: e.target.value })
                          }
                          className="w-full bg-void border border-subtle-border rounded px-2 py-1 text-xs text-slate-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: CHOICES */}
        {activeTab === 'choices' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Narrative Choices
              </span>
              <Button size="sm" variant="outline" onClick={handleAddChoice}>
                <Plus className="w-3 h-3" />
                <span>Add Choice</span>
              </Button>
            </div>

            {room.choices.length === 0 ? (
              <p className="text-slate-500 italic text-center py-6">
                No choices defined for this chamber. Click "Add Choice" to add interactive prompt options.
              </p>
            ) : (
              room.choices.map((choice) => (
                <div
                  key={choice.id}
                  className="p-2.5 rounded-lg bg-elevated/70 border border-subtle-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Choice Option</span>
                    </span>
                    <button
                      onClick={() => handleRemoveChoice(choice.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Button Label:
                    </label>
                    <input
                      type="text"
                      value={choice.label}
                      onChange={(e) => handleUpdateChoice(choice.id, { label: e.target.value })}
                      className="w-full bg-void border border-subtle-border rounded px-2 py-1 text-xs text-prose-main font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Response Prose Markup:
                    </label>
                    <textarea
                      rows={3}
                      value={choice.responseMarkup || ''}
                      onChange={(e) =>
                        handleUpdateChoice(choice.id, { responseMarkup: e.target.value })
                      }
                      className="w-full bg-void border border-subtle-border rounded px-2 py-1 text-xs font-mono text-slate-300"
                      placeholder="Story passage printed when player selects this choice..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Teleports To Room (Optional):
                    </label>
                    <select
                      value={choice.targetRoomId || ''}
                      onChange={(e) =>
                        handleUpdateChoice(choice.id, {
                          targetRoomId: e.target.value || undefined,
                        })
                      }
                      className="w-full bg-void border border-subtle-border rounded px-2 py-1 text-xs text-prose-main"
                    >
                      <option value="">Stay in current room</option>
                      {allRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: ENTITIES / RELICS */}
        {activeTab === 'entities' && (
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">
              Relics Present in Chamber
            </span>

            <div className="space-y-1.5">
              {allEntities.map((ent) => {
                const isPresent = room.entityIds.includes(ent.id);
                return (
                  <label
                    key={ent.id}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                      isPresent
                        ? 'bg-sky-950/40 border-sky-500/50 text-sky-200'
                        : 'bg-void/60 border-subtle-border text-slate-400 hover:text-prose-main'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isPresent}
                      onChange={() => handleToggleEntityInRoom(ent.id)}
                      className="mt-0.5 rounded border-subtle-border bg-void text-sky-500"
                    />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-xs text-prose-display truncate">
                        {ent.name}
                      </div>
                      <div className="text-[10.5px] text-prose-muted truncate">
                        {ent.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
