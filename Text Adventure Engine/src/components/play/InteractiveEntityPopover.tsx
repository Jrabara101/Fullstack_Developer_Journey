import { useEngineStore } from '../../store/engineStore';
import { Eye, Hand, Sparkles, Merge, X } from 'lucide-react';

export interface EntityActionModalProps {
  entityId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function EntityActionPopover({ entityId, position, onClose }: EntityActionModalProps) {
  const { cartridge, inventoryIds, executeEntityAction } = useEngineStore();
  const entity = cartridge.entities[entityId];

  if (!entity) return null;

  const inSatchel = inventoryIds.includes(entityId);
  const canTake = entity.isTakeable && !inSatchel;
  const canUse = entity.isUsable;
  const canCombine = inSatchel && !!entity.combineWithEntityId;

  const handleAction = (action: string) => {
    executeEntityAction(entityId, action);
    onClose();
  };

  return (
    <div
      className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: Math.min(window.innerWidth - 220, Math.max(16, position.x - 100)),
        top: Math.min(window.innerHeight - 160, position.y + 12),
      }}
    >
      <div className="bg-panel/95 backdrop-blur-md border border-sky-500/40 rounded-xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-prose-main w-52">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-subtle-border">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sky-400 text-xs">◈</span>
            <span className="font-sans font-bold text-xs text-sky-200 truncate">{entity.name}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-elevated"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1 font-sans text-xs">
          <button
            onClick={() => handleAction('examine')}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-elevated text-slate-200 hover:text-amber-300 transition-colors text-left"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Examine</span>
          </button>

          {canTake && (
            <button
              onClick={() => handleAction('take')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-elevated text-slate-200 hover:text-emerald-300 transition-colors text-left"
            >
              <Hand className="w-3.5 h-3.5 text-emerald-400" />
              <span>Take Item</span>
            </button>
          )}

          {canUse && (
            <button
              onClick={() => handleAction('use')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-elevated text-slate-200 hover:text-sky-300 transition-colors text-left"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Use / Activate</span>
            </button>
          )}

          {canCombine && (
            <button
              onClick={() => handleAction('combine')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-elevated text-slate-200 hover:text-purple-300 transition-colors text-left"
            >
              <Merge className="w-3.5 h-3.5 text-purple-400" />
              <span>Combine with...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
