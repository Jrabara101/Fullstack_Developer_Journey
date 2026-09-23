import React from 'react'
import { Dialog } from './ui/dialog'
import { Badge } from './ui/badge'
import { Zap, Volume2, ShieldCheck, Sparkles } from 'lucide-react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="ZenType // Cognitive Flow Guide" className="max-w-2xl font-sans">
      <div className="flex flex-col gap-5 text-xs text-zinc-300">
        {/* Intro */}
        <p className="leading-relaxed text-zinc-400">
          A typing speed game is not just a test of mechanical finger speed; it is an exercise in{' '}
          <span className="text-zinc-200 font-medium">cognitive flow states</span>,{' '}
          <span className="text-zinc-200 font-medium">optical chunking</span> (looking 2-3 words ahead), and{' '}
          <span className="text-zinc-200 font-medium">rhythmic tactile feedback</span>.
        </p>

        {/* Shortcuts table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
            Zero-Click Ergonomic Lifecycle
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
              <span className="text-zinc-400">Any Keypress</span>
              <span className="text-zinc-200">Start / Auto-focus</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
              <span className="text-zinc-400">Esc</span>
              <span className="text-zinc-200">Instant Test Reset</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
              <span className="text-zinc-400">Tab + Enter</span>
              <span className="text-zinc-200">Fresh Wordset</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
              <span className="text-zinc-400">Ctrl+K / Cmd+K</span>
              <span className="text-zinc-200">Command Palette</span>
            </div>
          </div>
        </div>

        {/* Error Modes */}
        <div className="space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
            Error Modes & Interaction Mechanics
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Confidence</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Default flow mode. Marks typos in red but allows continuous forward typing with spacebar soft skip.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Strict</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Cursor halts at mistakes. Forces deliberate precision; must hit Backspace to resolve typos.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                <span>Sudden Death</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Extreme adrenaline test. The first mistake immediately terminates the session.
              </p>
            </div>
          </div>
        </div>

        {/* Audio Engine */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Volume2 className="h-4 w-4 text-amber-400" />
            <div>
              <div className="font-medium text-zinc-200">Web Audio Synthesizer</div>
              <div className="text-[11px] text-zinc-500">
                Procedural tactile mechanical switches: Thock (Brown), Clicky (Blue), and Vintage Typewriter.
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">Zero Latency</Badge>
        </div>
      </div>
    </Dialog>
  )
}
