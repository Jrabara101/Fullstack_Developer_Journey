import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Command, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface IntentToken {
  field: string;
  operator: string;
  value: string | number;
  displayLabel: string;
}

interface IntentSearchHeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  parsedTokens?: IntentToken[];
  onRemoveToken?: (token: IntentToken) => void;
  executionLatencyMs?: number;
  totalIndexed?: number;
}

const SAMPLE_NLP_PROMPTS = [
  "waterproof ultralight trail running shoes under $160 for wide feet",
  "hall effect rapid trigger keyboard for esports",
  "audiophile reference studio headphones with wide soundstage",
  "creator laptop with oled display and 32gb ram under $3000",
];

export const IntentSearchHeader: React.FC<IntentSearchHeaderProps> = ({
  query,
  onQueryChange,
  parsedTokens = [],
  onRemoveToken,
  executionLatencyMs = 8,
  totalIndexed = 64,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div
        className={`relative flex items-center bg-[#0F131D] border rounded-xl px-3.5 py-2 transition-all duration-200 shadow-specular ${
          isFocused
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-[#141A28]'
            : 'border-[#1E2638] hover:border-slate-700'
        }`}
      >
        <Search className={`w-4 h-4 mr-2.5 transition-colors ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Type natural intent (e.g., 'waterproof ultralight trail running shoes under $160 for wide feet')..."
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none font-sans"
        />

        {/* Clear input button */}
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-1.5"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Latency & Keybinding Badge */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-[#1E2638] text-[11px] font-mono text-slate-400 shrink-0">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
            <Clock className="w-3 h-3" />
            {executionLatencyMs}ms
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-[#171D2B] border border-[#1E2638] px-1.5 py-0.5 rounded text-[10px] text-slate-400">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </div>
      </div>

      {/* Real-time Parsed Intent Token Chips */}
      {parsedTokens.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2 px-1 animate-fade-in">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> PARSED INTENT:
          </span>
          {parsedTokens.map((token, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-[0_0_8px_rgba(6,182,212,0.15)]"
            >
              <span>{token.displayLabel}</span>
              {onRemoveToken && (
                <button
                  onClick={() => onRemoveToken(token)}
                  className="hover:text-white transition-colors"
                  title="Remove dimension"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Suggested prompts dropdown when focused and query is short */}
      {isFocused && !query && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#0F131D] border border-[#1E2638] rounded-xl p-3 shadow-2xl z-40 backdrop-blur-xl animate-fade-in">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Conversational Intent Suggestions</span>
            <span className="text-cyan-400">{totalIndexed} SKUs Indexed</span>
          </div>
          <div className="space-y-1">
            {SAMPLE_NLP_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onMouseDown={() => onQueryChange(prompt)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-cyan-300 hover:bg-[#171D2B] transition-colors flex items-center justify-between group font-mono"
              >
                <span>"{prompt}"</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
