import React, { useState, useRef, useEffect } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { generateAutocompleteSuggestions, AutocompleteSuggestion } from '../../lib/parser';
import { sound } from '../../lib/audio';
import { Send, CornerDownLeft, Lock } from 'lucide-react';

export function CommandBar() {
  const {
    currentRoomId,
    cartridge,
    inventoryIds,
    submitCommand,
    selectChoice,
    commandInputShake,
  } = useEngineStore();

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentRoom = cartridge.rooms[currentRoomId];

  // Update suggestions whenever input or room changes
  useEffect(() => {
    if (!currentRoom) return;
    const items = generateAutocompleteSuggestions(input, currentRoom, cartridge, inventoryIds);
    setSuggestions(items);
    setSelectedSuggestionIndex(-1);
  }, [input, currentRoom, cartridge, inventoryIds]);

  const handleSubmit = (cmdToSubmit?: string) => {
    const raw = cmdToSubmit !== undefined ? cmdToSubmit : input;
    if (!raw.trim()) return;

    sound.playTypewriterChirp();
    submitCommand(raw);

    // Record command history
    setCommandHistory((prev) => [raw, ...prev.slice(0, 30)]);
    setHistoryIndex(-1);
    setInput('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Autocomplete navigation
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        return;
      }
      if ((e.key === 'Tab' || e.key === 'Enter') && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[selectedSuggestionIndex];
        if (selected) {
          handleSubmit(selected.command);
          return;
        }
      }
      if (e.key === 'Escape') {
        setSuggestions([]);
        return;
      }
    }

    // Command history traversal when input is empty or traversing
    if (e.key === 'ArrowUp' && (input === '' || historyIndex !== -1)) {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = Math.min(commandHistory.length - 1, historyIndex + 1);
        setHistoryIndex(nextIdx);
        setInput(commandHistory[nextIdx]);
      }
      return;
    }

    if (e.key === 'ArrowDown' && historyIndex !== -1) {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(commandHistory[nextIdx]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!currentRoom) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 select-none">
      {/* 1. Quick Choice Pills & Exit Compass Row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {/* Room Choices */}
        {currentRoom.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => selectChoice(choice)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium bg-amber-500/10 border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 hover:border-amber-400 transition-all shadow-sm active:scale-95"
          >
            <span className="text-amber-400 font-bold">»</span>
            <span>{choice.label}</span>
          </button>
        ))}

        {/* Direction Exits */}
        {currentRoom.exits.map((exit) => {
          const target = cartridge.rooms[exit.targetRoomId];
          const isLocked = exit.isLocked;

          return (
            <button
              key={`${exit.direction}-${exit.targetRoomId}`}
              type="button"
              onClick={() => submitCommand(`go ${exit.direction}`)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-all active:scale-95 ${
                isLocked
                  ? 'bg-peril/10 border-peril/40 text-peril-light hover:bg-peril/20'
                  : 'bg-elevated border-subtle-border text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-emerald-950/20'
              }`}
              title={`Go ${exit.direction.toUpperCase()} to ${target?.title || ''}`}
            >
              {isLocked ? (
                <Lock className="w-3 h-3 text-peril-light shrink-0" />
              ) : (
                <span className="text-emerald-400 text-[10px]">▲</span>
              )}
              <span className="font-bold uppercase">{exit.direction}</span>
              {target && (
                <span className="text-[10px] text-slate-400 hidden sm:inline truncate max-w-[100px]">
                  ({target.title})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Command Prompt Bar */}
      <div className="relative">
        {/* Autocomplete Dropdown */}
        {suggestions.length > 0 && input.trim() && (
          <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-panel/95 backdrop-blur-md border border-subtle-border rounded-lg shadow-2xl p-1.5 z-40 max-h-56 overflow-y-auto">
            <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 tracking-wider">
              Suggestions (Tab/Enter to select)
            </div>
            {suggestions.map((sugg, idx) => {
              const isSelected = idx === selectedSuggestionIndex;
              return (
                <div
                  key={`${sugg.command}-${idx}`}
                  onClick={() => handleSubmit(sugg.command)}
                  onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer text-xs font-mono transition-colors ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                      : 'text-slate-300 hover:bg-elevated'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">&gt;</span>
                    <span>{sugg.label}</span>
                  </div>
                  {sugg.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-void/60 text-slate-400 border border-subtle-border uppercase">
                      {sugg.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Input Box */}
        <div
          className={`flex items-center bg-elevated/90 backdrop-blur border rounded-xl px-3.5 py-2 shadow-2xl transition-all duration-150 ${
            commandInputShake
              ? 'animate-shake border-peril bg-peril/10'
              : 'border-subtle-border focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/50'
          }`}
        >
          <span className="font-mono font-bold text-amber-400 text-base select-none mr-2">
            &gt;
          </span>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sound.playTypewriterChirp();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g., 'examine astrolabe', 'take cog', 'go north')..."
            className="flex-1 bg-transparent border-none text-prose-display font-mono text-sm placeholder:text-slate-500 placeholder:font-sans focus:outline-none"
            autoFocus
          />

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!input.trim()}
            className="ml-2 p-1.5 rounded-md text-slate-400 hover:text-amber-300 hover:bg-void/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Execute Command (Enter)"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
