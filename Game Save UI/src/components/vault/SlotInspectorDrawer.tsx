import React, { useState, useEffect } from 'react';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { GameSavePayload } from '../../types/save';
import { getLocalSavePayload, auditSaveIntegrity } from '../../lib/storage';
import { formatPlaytime, formatDate } from '../../lib/utils';
import { sfx } from '../../sounds/sfx';
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  Copy,
  Check,
  Bug,
  Package,
  Compass,
  Terminal
} from 'lucide-react';

interface SlotInspectorDrawerProps {
  slotId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onExportCapsule: (slotId: string) => Promise<string>;
  onSimulateCorruption: (slotId: string) => void;
  onLoadSlot: (slotId: string) => void;
}

export const SlotInspectorDrawer: React.FC<SlotInspectorDrawerProps> = ({
  slotId,
  isOpen,
  onClose,
  onExportCapsule,
  onSimulateCorruption,
  onLoadSlot
}) => {
  const [payload, setPayload] = useState<GameSavePayload | null>(null);
  const [integrityValid, setIntegrityValid] = useState<boolean>(true);
  const [calculatedHash, setCalculatedHash] = useState<string>('');
  const [copiedCapsule, setCopiedCapsule] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'quests' | 'raw'>('inventory');

  useEffect(() => {
    if (!slotId || !isOpen) {
      setPayload(null);
      return;
    }

    getLocalSavePayload(slotId).then(async (data) => {
      setPayload(data);
      if (data) {
        const audit = await auditSaveIntegrity(data);
        setIntegrityValid(audit.valid);
        setCalculatedHash(audit.calculatedHash);
      }
    });
  }, [slotId, isOpen]);

  if (!payload) return null;

  const metadata = payload.metadata;
  const summary = metadata.summary;
  const inventory = payload.inventory || {};
  const questJournal = payload.questJournal || {};
  const worldState = payload.worldState || {};

  const handleDownloadSav = () => {
    sfx.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${metadata.slotId}_${summary.characterName.replace(/\s+/g, '_')}.sav`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyCapsule = async () => {
    if (!slotId) return;
    try {
      const capStr = await onExportCapsule(slotId);
      await navigator.clipboard.writeText(capStr);
      setCopiedCapsule(true);
      sfx.playSyncSuccess();
      setTimeout(() => setCopiedCapsule(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={`CARTRIDGE INSPECTOR // ${metadata.slotId.toUpperCase()}`}
      subtitle={`Vector Clock: v${metadata.vectorClock || 1} • Schema: ${metadata.version}`}
    >
      <div className="space-y-5 pb-8 font-sans">
        {/* Diorama Preview Card */}
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
          <img
            src={metadata.thumbnailUrl}
            alt={metadata.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <Badge variant={metadata.saveType}>{metadata.saveType.toUpperCase()}</Badge>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-cyan-300">
            {formatPlaytime(summary.playtimeSeconds)}
          </div>
        </div>

        {/* SHA-256 Checksum Audit Badge */}
        <div
          className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono ${
            integrityValid
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/50 text-red-300 animate-pulse'
          }`}
        >
          <div className="flex items-center gap-2">
            {integrityValid ? (
              <ShieldCheck size={18} className="text-emerald-400" />
            ) : (
              <ShieldAlert size={18} className="text-rose-400" />
            )}
            <div>
              <div className="font-bold">
                {integrityValid ? 'SHA-256 CHECKSUM VERIFIED' : 'CORRUPTED CHECKSUM DETECTED'}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[260px]">
                {metadata.checksum || 'NO HASH COMPUTED'}
              </div>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40">
            {integrityValid ? 'INTEGRAL' : 'TAMPERED'}
          </span>
        </div>

        {/* Story Telemetry Overview */}
        <div className="bg-[#07090E] border border-slate-800 rounded-lg p-3 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>OPERATIVE:</span>
            <span className="text-white font-bold">{summary.characterName}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>CHAPTER:</span>
            <span className="text-cyan-300">{summary.currentChapter}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>LOCATION:</span>
            <span className="text-slate-200">{summary.currentLocation}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>HEALTH:</span>
            <span className="text-rose-400 font-bold">{summary.hp} / {summary.maxHp} HP</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>CREDITS:</span>
            <span className="text-amber-400 font-bold">{summary.gold.toLocaleString()} CR</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>TIMESTAMP:</span>
            <span className="text-slate-500">{formatDate(metadata.updatedAt)}</span>
          </div>
        </div>

        {/* Tab Selector: Inventory / Quests / Raw State */}
        <div className="flex items-center gap-1 p-1 bg-[#07090E] rounded-lg border border-slate-800">
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('inventory');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={13} />
            <span>Inventory</span>
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('quests');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'quests'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={13} />
            <span>Quests</span>
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('raw');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'raw'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal size={13} />
            <span>Raw JSON</span>
          </button>
        </div>

        {/* Tab 1: Inventory Snapshot */}
        {activeTab === 'inventory' && (
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">
              WEAPONS & COMBAT GEAR
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {Array.isArray(inventory.weapons) ? (
                inventory.weapons.map((w: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-[#07090E] border border-slate-800 text-xs text-slate-200 font-mono flex items-center justify-between"
                  >
                    <span>{w}</span>
                    <span className="text-[10px] text-cyan-400">EQUIPPED</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 font-mono">Standard Arsenal</div>
              )}
            </div>

            <div className="text-xs font-mono uppercase text-slate-400 font-bold pt-2">
              RESOURCES & CONSUMABLES
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-[#07090E] border border-slate-800 flex justify-between">
                <span className="text-slate-400">Nanites:</span>
                <span className="text-cyan-400 font-bold">{String(inventory.nanites ?? 30)}</span>
              </div>
              <div className="p-2 rounded bg-[#07090E] border border-slate-800 flex justify-between">
                <span className="text-slate-400">Medkits:</span>
                <span className="text-emerald-400 font-bold">{String(inventory.medkits ?? 4)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Quest Checklist */}
        {activeTab === 'quests' && (
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">
              ACTIVE OBJECTIVE
            </div>
            <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 font-mono">
              {String(questJournal.activeQuest || questJournal.primaryObjective || 'Sector Reconnaissance')}
            </div>

            <div className="text-xs font-mono uppercase text-slate-400 font-bold pt-2">
              SUBTASKS & MILESTONES
            </div>
            <div className="space-y-1.5">
              {Array.isArray(questJournal.subtasks) ? (
                questJournal.subtasks.map((st: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-[#07090E] border border-slate-800 flex items-center gap-2 text-xs font-mono"
                  >
                    {st.completed ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                    )}
                    <span className={st.completed ? 'text-slate-400 line-through' : 'text-slate-200'}>
                      {st.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 font-mono">Telemetry synchronized.</div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Raw JSON Inspector */}
        {activeTab === 'raw' && (
          <div className="space-y-2">
            <pre className="p-3 rounded bg-black/90 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-64">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions Bar */}
        <div className="space-y-2.5 pt-4 border-t border-slate-800">
          <Button
            variant="cyan"
            size="md"
            onClick={() => {
              onLoadSlot(metadata.slotId);
              onClose();
            }}
            className="w-full flex items-center gap-2 py-2.5"
          >
            <span>HYDRATE INTO ACTIVE SESSION</span>
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCapsule}
              className="w-full flex items-center gap-1.5 py-2 text-xs"
            >
              {copiedCapsule ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedCapsule ? 'COPIED!' : 'COPY CAPSULE'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSav}
              className="w-full flex items-center gap-1.5 py-2 text-xs"
            >
              <Download size={13} />
              <span>EXPORT .SAV</span>
            </Button>
          </div>

          {/* Simulate Corruption Test Button */}
          <button
            onClick={() => onSimulateCorruption(metadata.slotId)}
            className="w-full py-1.5 rounded border border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/40 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bug size={13} />
            <span>SIMULATE DATA CORRUPTION (TEST ROLLBACK)</span>
          </button>
        </div>
      </div>
    </Sheet>
  );
};
