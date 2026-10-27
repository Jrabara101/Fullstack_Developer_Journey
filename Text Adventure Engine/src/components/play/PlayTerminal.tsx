import React, { useState, useEffect, useRef } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { renderInteractiveProse } from '../../lib/markup';
import { EntityActionPopover } from './InteractiveEntityPopover';
import { Badge } from '../ui/badge';
import { Sparkles, Terminal, ChevronDown } from 'lucide-react';

export function PlayTerminal() {
  const {
    narrativeLog,
    cartridge,
    flags,
    variables,
    inventoryIds,
    currentRoomId,
    turnCount,
  } = useEngineStore();

  const [activeEntityPopover, setActiveEntityPopover] = useState<{
    entityId: string;
    position: { x: number; y: number };
  } | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [narrativeLog.length, currentRoomId]);

  // Check scroll position to show "scroll down" indicator
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    setShowScrollPrompt(!isAtBottom);
  };

  const currentRoom = cartridge.rooms[currentRoomId];

  // Biome mood badge color
  const getBiomeBadge = (mood?: string) => {
    switch (mood) {
      case 'sanctuary':
        return <Badge variant="amber">Sanctuary</Badge>;
      case 'arcane':
        return <Badge variant="cyan">Arcane</Badge>;
      case 'crypt':
        return <Badge variant="purple">Crypt</Badge>;
      case 'peril':
        return <Badge variant="crimson">Peril</Badge>;
      case 'twilight':
      default:
        return <Badge variant="default">Twilight</Badge>;
    }
  };

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-reader">
      {/* Narrative Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 reading-well-glow space-y-6"
      >
        <div className="max-w-[760px] mx-auto space-y-6 pb-6">
          {narrativeLog.map((entry, index) => {
            const isLatest = index === narrativeLog.length - 1;

            // 1. Room Discovery Entry Banner
            if (entry.type === 'DISCOVERY') {
              return (
                <div key={entry.id} className="pt-4 first:pt-0 animate-in fade-in duration-300">
                  {/* Decorative Banner Header */}
                  <div className="flex items-center gap-3 pb-3 mb-4 border-b border-subtle-border">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-prose-display">
                      {entry.roomTitle || 'Chamber'}
                    </h2>
                    <div className="ml-auto flex items-center gap-2">
                      {getBiomeBadge(currentRoom?.biomeMood)}
                      <span className="font-mono text-[10px] text-slate-500 uppercase">
                        TURN {entry.turn}
                      </span>
                    </div>
                  </div>

                  {/* Room Description Prose */}
                  <div className="font-serif text-[17px] sm:text-[18px] leading-[1.8] text-prose-main select-text space-y-4">
                    {renderInteractiveProse(entry.contentMarkup, {
                      cartridge,
                      flags,
                      variables,
                      inventoryIds,
                      currentRoomId,
                      onEntityClick: (entityId, _, event) => {
                        const rect = (event.target as HTMLElement).getBoundingClientRect();
                        setActiveEntityPopover({
                          entityId,
                          position: { x: rect.left, y: rect.bottom },
                        });
                      },
                    })}
                  </div>
                </div>
              );
            }

            // 2. Command Echo Entry
            if (entry.type === 'COMMAND_ECHO') {
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 py-1 px-3 rounded-lg bg-void/60 border border-subtle-border/60 font-mono text-xs text-amber-300 select-text"
                >
                  <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-bold">{entry.contentMarkup}</span>
                </div>
              );
            }

            // 3. System / Error / Regular Prose
            return (
              <div
                key={entry.id}
                className={`text-[16px] sm:text-[17px] leading-relaxed select-text ${
                  entry.type === 'ERROR'
                    ? 'font-sans text-peril-light p-3 rounded-lg bg-peril/10 border border-peril/30 text-sm'
                    : entry.type === 'SYSTEM'
                    ? 'font-mono text-xs text-slate-300 p-3 rounded-lg bg-elevated border border-subtle-border'
                    : 'font-serif text-prose-main'
                }`}
              >
                {renderInteractiveProse(entry.contentMarkup, {
                  cartridge,
                  flags,
                  variables,
                  inventoryIds,
                  currentRoomId,
                  onEntityClick: (entityId, _, event) => {
                    const rect = (event.target as HTMLElement).getBoundingClientRect();
                    setActiveEntityPopover({
                      entityId,
                      position: { x: rect.left, y: rect.bottom },
                    });
                  },
                })}
              </div>
            );
          })}

          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Floating Scroll-Down Prompt */}
      {showScrollPrompt && (
        <button
          onClick={() => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 right-8 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-panel/90 border border-amber-500/40 text-amber-300 text-xs font-sans shadow-xl backdrop-blur animate-bounce hover:bg-elevated transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span>New Narrative Below</span>
        </button>
      )}

      {/* Entity Action Popover Menu */}
      {activeEntityPopover && (
        <EntityActionPopover
          entityId={activeEntityPopover.entityId}
          position={activeEntityPopover.position}
          onClose={() => setActiveEntityPopover(null)}
        />
      )}
    </div>
  );
}
