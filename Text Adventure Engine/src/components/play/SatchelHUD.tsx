import { useState } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Backpack, BookOpen, Flag, Sparkles, Merge, Eye, Check } from 'lucide-react';
import { sound } from '../../lib/audio';

export function SatchelHUD() {
  const {
    inventoryIds,
    cartridge,
    flags,
    submitCommand,
    executeEntityAction,
  } = useEngineStore();

  const [selectedCombineSource, setSelectedCombineSource] = useState<string | null>(null);

  const inventoryItems = inventoryIds
    .map((id) => cartridge.entities[id])
    .filter(Boolean);

  const activeFlags = Object.entries(flags).filter(([, val]) => val);

  const handleInspect = (entityName: string) => {
    sound.playParchmentTap();
    submitCommand(`examine ${entityName}`);
  };

  const handleUse = (entityName: string) => {
    sound.playParchmentTap();
    submitCommand(`use ${entityName}`);
  };

  const handleCombineClick = (entityId: string) => {
    sound.playParchmentTap();
    if (!selectedCombineSource) {
      setSelectedCombineSource(entityId);
    } else if (selectedCombineSource === entityId) {
      setSelectedCombineSource(null);
    } else {
      const source = cartridge.entities[selectedCombineSource];
      const target = cartridge.entities[entityId];
      if (source && target) {
        submitCommand(`combine ${source.name} with ${target.name}`);
      }
      setSelectedCombineSource(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-panel/80 rounded-xl border border-subtle-border overflow-hidden shadow-lg select-none">
      <Tabs defaultValue="satchel" className="h-full flex flex-col">
        {/* Header Tabs */}
        <div className="px-3 py-2 bg-void/70 border-b border-subtle-border">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="satchel" className="flex items-center justify-center gap-1.5 py-1">
              <Backpack className="w-3.5 h-3.5 text-amber-400" />
              <span>Satchel</span>
              <span className="text-[10px] font-mono text-amber-300">
                ({inventoryItems.length})
              </span>
            </TabsTrigger>

            <TabsTrigger value="journal" className="flex items-center justify-center gap-1.5 py-1">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Journal</span>
            </TabsTrigger>

            <TabsTrigger value="flags" className="flex items-center justify-center gap-1.5 py-1">
              <Flag className="w-3.5 h-3.5 text-purple-400" />
              <span>Flags</span>
              <span className="text-[10px] font-mono text-purple-300">
                ({activeFlags.length})
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Satchel Items */}
        <TabsContent value="satchel" className="flex-1 overflow-y-auto p-3 space-y-2 mt-0">
          {selectedCombineSource && (
            <div className="p-2 rounded bg-purple-950/40 border border-purple-500/50 flex items-center justify-between text-xs font-sans text-purple-200 animate-pulse">
              <div className="flex items-center gap-1.5">
                <Merge className="w-3.5 h-3.5 text-purple-400" />
                <span>Select second item to combine with...</span>
              </div>
              <button
                onClick={() => setSelectedCombineSource(null)}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}

          {inventoryItems.length === 0 ? (
            <div className="h-36 flex flex-col items-center justify-center text-center p-4 text-slate-500">
              <Backpack className="w-8 h-8 stroke-1 text-slate-600 mb-2" />
              <p className="text-xs font-sans">Your satchel is empty.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Explore rooms and click highlighted items to take them.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {inventoryItems.map((item) => {
                const isSelectedForCombine = selectedCombineSource === item.id;
                const canCombine = !!item.combineWithEntityId;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-lg border transition-all text-prose-main ${
                      isSelectedForCombine
                        ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : 'bg-elevated/70 border-subtle-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                          ◈
                        </div>
                        <div>
                          <div className="font-sans font-semibold text-xs text-prose-display">
                            {item.name}
                          </div>
                          <div className="font-sans text-[11px] text-prose-muted line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick action buttons on card */}
                    <div className="mt-2 pt-2 border-t border-subtle-border/60 flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => handleInspect(item.name)}
                        className="px-2 py-0.5 rounded text-[11px] font-sans font-medium text-slate-300 hover:text-amber-300 hover:bg-void/60 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>Inspect</span>
                      </button>

                      {item.isUsable && (
                        <button
                          onClick={() => handleUse(item.name)}
                          className="px-2 py-0.5 rounded text-[11px] font-sans font-medium text-slate-300 hover:text-sky-300 hover:bg-void/60 transition-colors flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-sky-400" />
                          <span>Use</span>
                        </button>
                      )}

                      {canCombine && (
                        <button
                          onClick={() => handleCombineClick(item.id)}
                          className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium transition-colors flex items-center gap-1 ${
                            isSelectedForCombine
                              ? 'bg-purple-500 text-white font-bold'
                              : 'text-purple-300 hover:bg-purple-950/60'
                          }`}
                        >
                          <Merge className="w-3 h-3 text-purple-400" />
                          <span>{isSelectedForCombine ? 'Source Item' : 'Combine'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Journal & Clues */}
        <TabsContent value="journal" className="flex-1 overflow-y-auto p-3 text-xs font-sans space-y-3 mt-0">
          <div className="p-2.5 rounded-lg bg-elevated/50 border border-subtle-border">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px] mb-1">
              Active Quest
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              {cartridge.synopsis}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-elevated/50 border border-subtle-border">
            <h4 className="font-bold text-sky-300 uppercase tracking-wider text-[11px] mb-1">
              Surveyor's Field Notes
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-sky-400">•</span>
                <span>The Chronos Vault requires the Assembled Chronos Key (toothed brass cog + star spindle).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-400">•</span>
                <span>The Great Telescope awaits an Aether Prism to filter celestial rays.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-sky-400">•</span>
                <span>Realigning the Grand Astrolabe powers the observatory's north conduit network.</span>
              </li>
            </ul>
          </div>
        </TabsContent>

        {/* Tab 3: World Flags */}
        <TabsContent value="flags" className="flex-1 overflow-y-auto p-3 text-xs font-sans space-y-2 mt-0">
          <div className="text-[11px] text-slate-400 mb-2">
            Story flags unlocked through your interactions:
          </div>
          {activeFlags.length === 0 ? (
            <div className="text-slate-500 italic text-center py-6">
              No narrative flags unlocked yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeFlags.map(([flag]) => (
                <div
                  key={flag}
                  className="flex items-center gap-2 p-1.5 rounded bg-void/50 border border-subtle-border"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-[11px] text-slate-300 truncate">
                    {flag}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
