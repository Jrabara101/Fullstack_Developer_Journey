import React from 'react';
import { Volume2, VolumeX, Sparkles, Brain, Mail, Zap } from 'lucide-react';
import { AmbientAudioPlayer } from './AmbientAudioPlayer';
import { sounds } from '../../services/soundEffects';

interface NavbarProps {
  appMode: 'flashcards' | 'editorial';
  setAppMode: (mode: 'flashcards' | 'editorial') => void;
  editorialTheme?: 'wedding' | 'birthday' | 'conference';
  setEditorialTheme?: (theme: 'wedding' | 'birthday' | 'conference') => void;
  flashcardTab?: 'study' | 'decay' | 'magic' | 'crunch' | 'library';
  setFlashcardTab?: (tab: 'study' | 'decay' | 'magic' | 'crunch' | 'library') => void;
  isSfxMuted: boolean;
  setIsSfxMuted: (val: boolean) => void;
  onOpenBlitz?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appMode,
  setAppMode,
  editorialTheme = 'wedding',
  setEditorialTheme,
  flashcardTab = 'study',
  setFlashcardTab,
  isSfxMuted,
  setIsSfxMuted,
  onOpenBlitz,
}) => {
  const toggleSfx = () => {
    const next = !isSfxMuted;
    setIsSfxMuted(next);
    sounds.isMuted = next;
    if (!next) sounds.playCardSnap();
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 bg-white/80 border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 text-white shadow-sm ring-1 ring-black/5">
            {appMode === 'flashcards' ? (
              <Brain className="w-5 h-5 text-indigo-100" />
            ) : (
              <Mail className="w-5 h-5 text-amber-100" />
            )}
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-stone-900 block leading-tight">
              {appMode === 'flashcards' ? 'Cognitive Studio' : 'Bespoke Editorial'}
            </span>
            <span className="text-[10px] text-stone-500 block uppercase font-mono tracking-wider">
              {appMode === 'flashcards' ? 'Active Recall Engine' : 'Interactive Guest Suite'}
            </span>
          </div>
        </div>

        {/* Primary Segmented Pill Switcher between Cognitive Studio & Bespoke Editorial */}
        <div className="hidden md:flex items-center bg-stone-100/90 p-1 rounded-full border border-stone-200/90 shadow-2xs">
          <button
            onClick={() => {
              setAppMode('flashcards');
              sounds.playCardFlip();
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              appMode === 'flashcards'
                ? 'bg-white text-indigo-900 shadow-xs border border-stone-200/50'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            Cognitive Studio
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-mono">FSRS</span>
          </button>

          <button
            onClick={() => {
              setAppMode('editorial');
              sounds.playEnvelopeOpen();
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              appMode === 'editorial'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/50'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Bespoke Editorial
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-mono">Invite</span>
          </button>
        </div>

        {/* Right side controls: Quick Blitz button, Ambient Player, SFX toggle */}
        <div className="flex items-center gap-2.5">
          {appMode === 'flashcards' && onOpenBlitz && (
            <button
              onClick={onOpenBlitz}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>5-Min Blitz</span>
              <kbd className="bg-amber-700/60 border-amber-800 text-[9px] text-amber-100 px-1 py-0.2 rounded">B</kbd>
            </button>
          )}

          {/* Ambient Focus Audio Player */}
          <AmbientAudioPlayer />

          {/* Sound Effects Toggle */}
          <button
            onClick={toggleSfx}
            className={`p-2 rounded-full border text-xs transition-all cursor-pointer ${
              !isSfxMuted
                ? 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 shadow-2xs'
                : 'bg-stone-100 border-stone-200 text-stone-400'
            }`}
            title={isSfxMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isSfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Mobile Mode Switcher Toggle */}
          <button
            onClick={() => {
              const next = appMode === 'flashcards' ? 'editorial' : 'flashcards';
              setAppMode(next);
              sounds.playCardFlip();
            }}
            className="md:hidden p-2 rounded-full border border-stone-200 bg-white text-stone-700 text-xs font-medium cursor-pointer"
          >
            {appMode === 'flashcards' ? '💌 Switch to Invite' : '🧠 Switch to Cards'}
          </button>
        </div>
      </div>

      {/* Secondary Sub-Navbar Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2.5 pt-1 flex items-center justify-between border-t border-stone-100/60 overflow-x-auto no-scrollbar">
        {appMode === 'flashcards' ? (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => {
                setFlashcardTab?.('study');
                sounds.playCardSnap();
              }}
              className={`px-3 py-1.2 rounded-lg transition-all cursor-pointer ${
                flashcardTab === 'study'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Tactile Study Canvas
            </button>
            <button
              onClick={() => {
                setFlashcardTab?.('decay');
                sounds.playCardSnap();
              }}
              className={`px-3 py-1.2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                flashcardTab === 'decay'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>Memory Decay & Heatmap</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>
            <button
              onClick={() => {
                setFlashcardTab?.('magic');
                sounds.playCardSnap();
              }}
              className={`px-3 py-1.2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                flashcardTab === 'magic'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Instant Magic Deck</span>
            </button>
            <button
              onClick={() => {
                setFlashcardTab?.('crunch');
                sounds.playCardSnap();
              }}
              className={`px-3 py-1.2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                flashcardTab === 'crunch'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>Live Crunch Room</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-1 py-0.1 rounded font-bold">LIVE</span>
            </button>
            <button
              onClick={() => {
                setFlashcardTab?.('library');
                sounds.playCardSnap();
              }}
              className={`px-3 py-1.2 rounded-lg transition-all cursor-pointer ${
                flashcardTab === 'library'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Decks Library
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Bespoke Theme:</span>
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                onClick={() => {
                  setEditorialTheme?.('wedding');
                  sounds.playWaxSealBreak();
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  editorialTheme === 'wedding'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                💍 Wedding (Champagne & Ink)
              </button>
              <button
                onClick={() => {
                  setEditorialTheme?.('birthday');
                  sounds.playWaxSealBreak();
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  editorialTheme === 'birthday'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🎂 40th Birthday (Golden Hour)
              </button>
              <button
                onClick={() => {
                  setEditorialTheme?.('conference');
                  sounds.playCardSnap();
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  editorialTheme === 'conference'
                    ? 'bg-black text-[#CCFF00] shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ⚡ AI Summit (Kinetic Monolith)
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

