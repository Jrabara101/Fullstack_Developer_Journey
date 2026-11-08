import React from 'react';
import { X, Cpu, Layers, Disc3, ShieldCheck, Download } from 'lucide-react';
import { Album } from '../types';

interface LinerNotesModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LinerNotesDeepDiveModal: React.FC<LinerNotesModalProps> = ({ album, isOpen, onClose }) => {
  if (!isOpen || !album) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-3xl bg-[#0D0F14] border border-white/20 shadow-2xl flex flex-col overflow-hidden hardware-transition animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[var(--era-accent)] uppercase tracking-wider font-bold">
              {album.catalog_number} // Archival Studio Dossier
            </div>
            <h3 className="text-2xl font-display font-extrabold uppercase text-white mt-0.5">
              {album.title} — Technical Liner Notes
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh] font-mono text-xs">
          {/* Manifesto Pullquote */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2">Master Tape Manifesto</div>
            <p className="font-editorial italic text-base sm:text-lg text-zinc-200 leading-relaxed">
              "{album.liner_notes_md}"
            </p>
          </div>

          {/* Recording Facilities & Engineering */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
              <div className="text-[11px] font-bold text-white uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-signal-cyan" />
                <span>Primary Facilities:</span>
              </div>
              <ul className="space-y-1 text-zinc-400 text-[11px]">
                <li>• Hansa Tonstudio (Berlin) — Saal 1 live tracking</li>
                <li>• Studio 2 (Tokyo, Shibuya) — Modular patch sessions</li>
                <li>• Sterling Sound (Nashville) — Vinyl lacquer cutting</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
              <div className="text-[11px] font-bold text-white uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--era-accent)]" />
                <span>Analog Signal Chain:</span>
              </div>
              <ul className="space-y-1 text-zinc-400 text-[11px]">
                <li>• Studer A800 2-Inch 16-Track Tape Machine</li>
                <li>• Ampex 456 Grand Master Tape @ 30 IPS</li>
                <li>• Roland RE-201 Space Echo & EMT 140 Plate</li>
                <li>• Neumann U67 & AKG C414 B-ULS Microphones</li>
              </ul>
            </div>
          </div>

          {/* Hardware Patch Notes */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Synthesizer & Drum Machine Patch Notes:
            </div>
            <div className="space-y-2 text-zinc-300">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[var(--era-accent)] font-bold">Sequential Prophet-6:</span> Configured in Poly-Mod with filter envelope sweeping Oscillator 2 frequency for metallic, bell-like overtones on "Anodized Skyline".
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-signal-cyan font-bold">Roland TR-909 & SH-101:</span> Driven through a vintage Boss overdrive and taped directly onto track 7 and 8 of the 2-inch tape reel for punchy, uncompressed low-end weight.
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-signal-amber font-bold">Buchla 200e Modular:</span> Used for rhythmic frequency modulation and random stepped voltage bursts during live improvisations.
              </div>
            </div>
          </div>

          {/* Critical Press Verdicts */}
          {album.press_quotes && (
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Archival Critical Reception:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {album.press_quotes.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[var(--era-accent)] font-bold text-[11px]">{q.publication}</div>
                    <div className="text-xs text-white font-editorial italic mt-1 leading-snug">"{q.quote}"</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-2">{q.score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between font-mono text-xs text-zinc-400 px-6">
          <span>Mastering Code: 24-96-STERLING</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

