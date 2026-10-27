import { useEffect } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Play,
  PenTool,
  RotateCcw,
  Volume2,
  VolumeX,
  Wrench,
  BookOpen,
  FolderOpen,
} from 'lucide-react';

export function StudioTopBar() {
  const {
    mode,
    toggleMode,
    cartridge,
    historyStack,
    undoTurn,
    isGodModeOpen,
    setGodModeOpen,
    setCartridgeModalOpen,
    isAudioMuted,
    toggleAudioMute,
    turnCount,
  } = useEngineStore();

  // Spacebar hotkey to switch modes when not typing in an input/textarea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleMode();
      }

      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoTurn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMode, undoTurn]);

  const canUndo = historyStack.length > 0;

  return (
    <header className="h-12 bg-panel/90 backdrop-blur-xl border-b border-subtle-border px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Cartridge Title, Author & Cartridge Selector */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => setCartridgeModalOpen(true)}
          className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-elevated transition-colors text-left group"
          title="Open Cartridge Library & Import/Export"
        >
          <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-xs text-prose-display truncate max-w-[170px] sm:max-w-[240px]">
                {cartridge.title}
              </span>
              <FolderOpen className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <span className="text-[10px] text-prose-muted font-sans truncate">
              by {cartridge.author}
            </span>
          </div>
        </button>

        <Badge variant="cyan" className="hidden md:inline-flex">
          v{cartridge.version}
        </Badge>
      </div>

      {/* Center: Tactile Dual-Mode Switcher Capsule */}
      <div className="flex items-center">
        <div className="bg-void/80 p-0.5 rounded-full border border-subtle-border flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => mode !== 'CREATE' && toggleMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium transition-all ${
              mode === 'CREATE'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-prose-main'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>The Loom Studio</span>
          </button>

          <button
            type="button"
            onClick={() => mode !== 'PLAY' && toggleMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium transition-all ${
              mode === 'PLAY'
                ? 'bg-parser/25 text-parser-light font-bold border border-parser/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-prose-main'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Play className="w-3 h-3 fill-current" />
              {mode === 'PLAY' && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span>Play Adventure</span>
            <kbd className="hidden sm:inline-block ml-0.5 px-1 py-0.2 rounded text-[9px] bg-slate-900 border border-slate-700 font-mono text-slate-400">
              Space
            </kbd>
          </button>
        </div>
      </div>

      {/* Right: History Scrubbing, Audio, God Mode */}
      <div className="flex items-center gap-1.5">
        {/* Undo Turn Button */}
        {mode === 'PLAY' && (
          <Button
            variant="outline"
            size="sm"
            onClick={undoTurn}
            disabled={!canUndo}
            title="Undo Last Turn (Ctrl+Z)"
            className="text-xs h-7 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
            {canUndo && (
              <span className="text-[10px] text-amber-400 font-mono">
                ({historyStack.length})
              </span>
            )}
          </Button>
        )}

        {/* Turn indicator */}
        {mode === 'PLAY' && (
          <div className="hidden lg:flex items-center px-2 py-0.5 rounded bg-void/50 border border-subtle-border font-mono text-[11px] text-slate-400">
            TURN <span className="ml-1 text-amber-300 font-bold">{turnCount}</span>
          </div>
        )}

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleAudioMute}
          className={`p-1.5 rounded-md border transition-all ${
            isAudioMuted
              ? 'bg-void text-slate-500 border-subtle-border'
              : 'bg-elevated text-amber-400 border-amber-500/30 hover:border-amber-400'
          }`}
          title={isAudioMuted ? 'Sound Muted — Click to unmute' : 'Synthesized Sound Active — Click to mute'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* God Mode Bar Toggle */}
        <button
          onClick={() => setGodModeOpen(!isGodModeOpen)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-sans font-medium border transition-all ${
            isGodModeOpen
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-elevated text-slate-400 border-subtle-border hover:text-prose-main'
          }`}
          title="Toggle God Mode State Inspector"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">God Mode</span>
        </button>
      </div>
    </header>
  );
}
