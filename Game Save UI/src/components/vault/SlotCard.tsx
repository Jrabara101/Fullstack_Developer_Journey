import React, { useState } from 'react';
import type { SaveMetadata } from '../../types/save';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { HoldButton } from '../ui/HoldButton';
import { formatPlaytime, formatDate } from '../../lib/utils';
import { sfx } from '../../sounds/sfx';
import {
  Lock,
  Unlock,
  GitFork,
  Play,
  RotateCcw,
  Clock,
  MapPin,
  Heart,
  Coins
} from 'lucide-react';

interface SlotCardProps {
  metadata: SaveMetadata;
  isActive: boolean;
  onSelectInspect: (slotId: string) => void;
  onLoad: (slotId: string) => void;
  onOverwrite: (slotId: string) => void;
  onToggleLock: (slotId: string) => void;
  onForkTimeline: (slotId: string) => void;
  onDelete: (slotId: string) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  metadata,
  isActive,
  onSelectInspect,
  onLoad,
  onOverwrite,
  onToggleLock,
  onForkTimeline,
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const summary = metadata.summary;
  const isLocked = metadata.isLocked;
  const saveType = metadata.saveType;

  // Type-specific glowing border and accents
  const borderTypeStyles = {
    manual: 'hover:border-[#38BDF8]/70 hover:shadow-[0_0_25px_rgba(56,189,248,0.2)]',
    auto: 'hover:border-[#818CF8]/70 hover:shadow-[0_0_25px_rgba(129,140,248,0.2)]',
    quicksave: 'hover:border-[#F59E0B]/70 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]',
    milestone: 'border-[#A855F7]/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-[#A855F7]/80'
  };

  const activeStyles = isActive
    ? 'border-[#38BDF8] shadow-[0_0_25px_rgba(56,189,248,0.35)] ring-1 ring-[#38BDF8]/40'
    : 'border-slate-800';

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
        sfx.playClick();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-xl bg-[#131B2E] transition-all duration-300 ease-out flex flex-col overflow-hidden border select-none cursor-pointer ${activeStyles} ${borderTypeStyles[saveType]} ${
        isLocked ? 'before:absolute before:inset-0 before:border before:border-[#A855F7]/30 before:rounded-xl before:pointer-events-none' : ''
      } transform hover:scale-[1.018] hover:-translate-y-1`}
      onClick={() => onSelectInspect(metadata.slotId)}
    >
      {/* Top Holographic Conduit Strip */}
      <div
        className={`h-[2px] w-full transition-all duration-300 ${
          isLocked
            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
            : saveType === 'quicksave'
            ? 'bg-amber-400'
            : saveType === 'auto'
            ? 'bg-indigo-400'
            : 'bg-cyan-400'
        }`}
      />

      {/* 16:9 Thumbnail Visual Diorama */}
      <div className="relative aspect-video w-full overflow-hidden bg-black/90">
        <img
          src={metadata.thumbnailUrl}
          alt={metadata.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131B2E] via-transparent to-black/60 pointer-events-none" />

        {/* Slot Type Badge Pill (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge variant={saveType}>
            {saveType === 'quicksave' ? 'QUICK-SAVE' : saveType.toUpperCase()}
          </Badge>
          {isActive && (
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold">
              ACTIVE
            </span>
          )}
        </div>

        {/* Lock / Milestone Pin Toggle (Top-Right) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(metadata.slotId);
            }}
            title={isLocked ? 'Unlock Milestone Slot' : 'Lock as Protected Milestone'}
            className={`p-1.5 rounded-md transition-all cursor-pointer backdrop-blur-md ${
              isLocked
                ? 'bg-[#A855F7]/30 text-purple-300 border border-[#A855F7]/60 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                : 'bg-black/60 text-slate-400 border border-slate-700/60 hover:text-white hover:border-slate-500'
            }`}
          >
            {isLocked ? <Lock size={13} className="text-purple-300 animate-pulse" /> : <Unlock size={13} />}
          </button>
        </div>

        {/* Slot ID & Playtime Tag (Bottom-Right of Thumbnail) */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-slate-700/60 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
          <Clock size={10} />
          <span>{formatPlaytime(summary.playtimeSeconds)}</span>
        </div>
      </div>

      {/* Cartridge Body: Chapter, Location, Title */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="text-cyan-400 font-semibold truncate max-w-[200px]">
              {summary.currentChapter}
            </span>
            <span className="text-slate-500">LVL {summary.level}</span>
          </div>

          <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
            {metadata.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1">
            <MapPin size={12} className="text-slate-500 shrink-0" />
            <span className="truncate">{summary.currentLocation}</span>
          </div>
        </div>

        {/* Telemetry Mini-Bars & Status */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-rose-400">
              <Heart size={10} /> {summary.hp} / {summary.maxHp}
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Coins size={10} /> {summary.gold.toLocaleString()} CR
            </span>
            <span className="text-cyan-400">
              {summary.completionPercentage}% CMP
            </span>
          </div>
          <Progress value={summary.completionPercentage} color="cyan" />
        </div>

        {/* Timestamp & SHA-256 Hash */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span>{formatDate(metadata.updatedAt)}</span>
          <span className="text-slate-600" title={`SHA-256: ${metadata.checksum}`}>
            HASH: #{metadata.checksum ? metadata.checksum.slice(0, 6) : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Contextual Action Strip (Revealed on hover or always accessible) */}
      <div
        className="px-3 pb-3 pt-1 border-t border-slate-800/60 bg-[#0E1524] flex items-center justify-between gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          {/* Load */}
          <Button
            variant="cyan"
            size="sm"
            onClick={() => onLoad(metadata.slotId)}
            title="Load checkpoint into active game state"
            className="px-2.5"
          >
            <Play size={11} />
            <span>LOAD</span>
          </Button>

          {/* Overwrite (Blocked if locked) */}
          <Button
            variant="outline"
            size="sm"
            disabled={isLocked}
            onClick={() => onOverwrite(metadata.slotId)}
            title={isLocked ? 'Cannot overwrite locked milestone' : 'Overwrite this slot with current game state'}
            className="px-2"
          >
            <RotateCcw size={11} />
            <span>OVERWRITE</span>
          </Button>

          {/* Branch / Timeline Fork */}
          <Button
            variant="violet"
            size="sm"
            onClick={() => onForkTimeline(metadata.slotId)}
            title="Branch this cartridge into a divergent parallel timeline"
            className="px-2"
          >
            <GitFork size={11} />
            <span>BRANCH</span>
          </Button>
        </div>

        {/* Destructive Action Safeguard: Hold to Purge */}
        {!isLocked && (
          <HoldButton
            holdDurationMs={1500}
            label="DEL"
            onHoldComplete={() => onDelete(metadata.slotId)}
            className="px-2 py-1 text-[10px]"
          />
        )}
      </div>
    </div>
  );
};
