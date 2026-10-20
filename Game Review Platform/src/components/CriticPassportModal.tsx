import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { CriticProfile, GameCatalogItem } from '../types';
import { FivePillarRadar } from './FivePillarRadar';
import { X, Download, Share2, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store';

interface CriticPassportModalProps {
  profile: CriticProfile;
  topGames: GameCatalogItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const CriticPassportModal: React.FC<CriticPassportModalProps> = ({
  profile,
  topGames,
  isOpen,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${profile.username.replace(/[^a-zA-Z0-9]/g, '_')}_Critic_Passport.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export passport PNG', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      // Fallback download if clipboard item fails
      handleDownloadImage();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-[#0D111C] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#10141F]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-white text-sm tracking-widest uppercase">
              Critic Passport Generator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: The High-Contrast Shareable Card Container */}
        <div className="p-6 flex flex-col items-center">
          <div
            ref={cardRef}
            className="w-full max-w-[560px] bg-[#07090E] border-2 border-[#1E293B] rounded-2xl p-6 shadow-2xl relative overflow-hidden text-white"
          >
            {/* Ambient Lighting Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Passport Card Header */}
            <div className="flex items-start justify-between relative z-10 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-lg text-white">
                      {profile.username}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {profile.criticTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 max-w-[280px] mt-0.5">
                    {profile.bio}
                  </p>
                </div>
              </div>

              {/* Watermark / Brand */}
              <div className="text-right font-mono text-[10px] text-slate-500">
                <div className="text-cyan-400 font-bold tracking-widest">CRITIC.VAULT</div>
                <div>PASSPORT v2.4</div>
              </div>
            </div>

            {/* Middle Section: Taste Radar & Core Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 relative z-10 items-center">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-1">
                  Taste Signature Radar
                </span>
                <FivePillarRadar
                  primaryPillars={profile.tasteVector || { gameplay: 4.5, narrative: 4.5, visuals: 4.5, audio: 4.5, polish: 4.5 }}
                  size={190}
                  showLegend={false}
                />
              </div>

              {/* Metrics Grid */}
              <div className="space-y-3 font-mono">
                <div className="bg-[#10141F] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Games Logged</span>
                  <span className="text-sm font-bold text-white">{profile.stats.totalGamesLogged}</span>
                </div>
                <div className="bg-[#10141F] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Reviews Published</span>
                  <span className="text-sm font-bold text-amber-400">{profile.stats.totalReviewsWritten}</span>
                </div>
                <div className="bg-[#10141F] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Hours Logged This Year</span>
                  <span className="text-sm font-bold text-cyan-400">{profile.stats.hoursLoggedThisYear} hrs</span>
                </div>
                <div className="bg-[#10141F] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Mean Critic Score</span>
                  <span className="text-sm font-bold text-rose-400">{profile.stats.meanRating.toFixed(1)} ★</span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Top 4 Plinth Showcase */}
            <div className="relative z-10 border-t border-slate-800/80 pt-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">
                All-Time Showcase Plinth
              </span>
              <div className="grid grid-cols-4 gap-2">
                {topGames.slice(0, 4).map((game, i) => (
                  <div
                    key={game.id}
                    className="relative aspect-[2/3] rounded-md overflow-hidden border border-slate-700 shadow-md"
                  >
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 text-[9px] font-mono bg-black/80 px-1 rounded text-cyan-300 font-bold">
                      #{i + 1}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 text-[9px] font-mono text-center text-amber-400 font-bold">
                      5.0 ★
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Cryptographic Footer Bar */}
            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-600 relative z-10">
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                <span>CRYPTOGRAPHICALLY TELEMETRY-VERIFIED</span>
              </div>
              <span>ID: {profile.id.toUpperCase()}</span>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider transition-all duration-150 shadow-glow-gold"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PNG...' : 'Download PNG Card'}</span>
            </button>

            <button
              onClick={handleCopyImage}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181F30] hover:bg-[#1E293B] border border-slate-700 text-slate-200 font-bold text-xs tracking-wider transition-all duration-150"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Discord Card'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
