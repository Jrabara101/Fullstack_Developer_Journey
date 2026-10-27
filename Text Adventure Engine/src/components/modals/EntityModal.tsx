import { useState, useEffect } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { WorldEntity, Direction } from '../../types/engine';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { generateId } from '../../lib/utils';
import { sound } from '../../lib/audio';
import { Box, Trash2, Check } from 'lucide-react';

export function EntityModal() {
  const {
    isEntityModalOpen,
    setEntityModalOpen,
    editingEntityId,
    cartridge,
    updateEntity,
    deleteEntity,
  } = useEngineStore();

  const isEditing = !!editingEntityId && !!cartridge.entities[editingEntityId];

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [aliasesStr, setAliasesStr] = useState('');
  const [description, setDescription] = useState('');
  const [isTakeable, setIsTakeable] = useState(true);
  const [isUsable, setIsUsable] = useState(true);
  const [combineWithEntityId, setCombineWithEntityId] = useState('');
  const [onInspectText, setOnInspectText] = useState('');
  const [onUseText, setOnUseText] = useState('');
  const [setFlagsStr, setSetFlagsStr] = useState('');
  const [unlocksDirection, setUnlocksDirection] = useState<Direction | ''>('');

  useEffect(() => {
    if (editingEntityId && cartridge.entities[editingEntityId]) {
      const ent = cartridge.entities[editingEntityId];
      setId(ent.id);
      setName(ent.name);
      setAliasesStr(ent.aliases.join(', '));
      setDescription(ent.description);
      setIsTakeable(ent.isTakeable);
      setIsUsable(ent.isUsable);
      setCombineWithEntityId(ent.combineWithEntityId || '');
      setOnInspectText(ent.onInspectText || '');
      setOnUseText(ent.onUseText || '');
      setSetFlagsStr((ent.setFlagsOnUse || []).join(', '));
      setUnlocksDirection(ent.unlocksExitDirection || '');
    } else {
      setId(generateId('ent'));
      setName('');
      setAliasesStr('');
      setDescription('');
      setIsTakeable(true);
      setIsUsable(true);
      setCombineWithEntityId('');
      setOnInspectText('');
      setOnUseText('');
      setSetFlagsStr('');
      setUnlocksDirection('');
    }
  }, [editingEntityId, cartridge.entities, isEntityModalOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter an entity name.');
      return;
    }

    const aliases = aliasesStr
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const setFlagsOnUse = setFlagsStr
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const entity: WorldEntity = {
      id: id.trim() || generateId('ent'),
      name: name.trim(),
      aliases: aliases.length > 0 ? aliases : [name.toLowerCase().trim()],
      description: description.trim(),
      isTakeable,
      isUsable,
      combineWithEntityId: combineWithEntityId || undefined,
      onInspectText: onInspectText.trim() || undefined,
      onUseText: onUseText.trim() || undefined,
      setFlagsOnUse: setFlagsOnUse.length > 0 ? setFlagsOnUse : undefined,
      unlocksExitDirection: unlocksDirection || undefined,
    };

    updateEntity(entity);
    sound.playPickup();
    setEntityModalOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete entity "${name}"?`)) {
      deleteEntity(id);
      sound.playParchmentTap();
      setEntityModalOpen(false);
    }
  };

  const otherEntities = Object.values(cartridge.entities).filter((e) => e.id !== id);

  return (
    <Dialog
      open={isEntityModalOpen}
      onOpenChange={setEntityModalOpen}
      maxWidth="lg"
      title={isEditing ? `Edit Relic: ${name}` : 'Create World Relic or Item'}
      description="Define interactive entities, relics, keys, and mechanical props in the world."
    >
      <div className="space-y-4 pt-2 font-sans text-xs">
        {/* Name and ID */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
              Entity Display Name
            </label>
            <input
              type="text"
              placeholder="e.g., Toothed Brass Cog"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-elevated border border-subtle-border rounded-md px-2.5 py-1.5 text-xs text-prose-display font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
              Unique ID
            </label>
            <input
              type="text"
              value={id}
              disabled={isEditing}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-void border border-subtle-border rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-400 focus:outline-none focus:border-amber-400 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Aliases */}
        <div>
          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
            Parser Aliases (Comma-separated synonyms)
          </label>
          <input
            type="text"
            placeholder="e.g., cog, brass gear, gear, wheel"
            value={aliasesStr}
            onChange={(e) => setAliasesStr(e.target.value)}
            className="w-full bg-elevated border border-subtle-border rounded-md px-2.5 py-1.5 text-xs text-prose-main focus:outline-none focus:border-sky-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
            General Description
          </label>
          <textarea
            rows={2}
            placeholder="Physical appearance in satchel or room survey..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-elevated border border-subtle-border rounded-md p-2 text-xs text-prose-main focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        {/* Behaviors (Takeable / Usable) */}
        <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-void/50 border border-subtle-border">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isTakeable}
              onChange={(e) => setIsTakeable(e.target.checked)}
              className="rounded bg-void border-subtle-border text-amber-500"
            />
            <span className="font-semibold text-slate-200">
              Can Be Taken into Satchel
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isUsable}
              onChange={(e) => setIsUsable(e.target.checked)}
              className="rounded bg-void border-subtle-border text-amber-500"
            />
            <span className="font-semibold text-slate-200">
              Can Be Used / Activated
            </span>
          </label>
        </div>

        {/* Combinable Pair */}
        <div>
          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
            Combines With Entity (Recipe Pair)
          </label>
          <select
            value={combineWithEntityId}
            onChange={(e) => setCombineWithEntityId(e.target.value)}
            className="w-full bg-elevated border border-subtle-border rounded-md px-2.5 py-1.5 text-xs text-prose-main focus:outline-none focus:border-purple-400"
          >
            <option value="">None (Cannot combine)</option>
            {otherEntities.map((ent) => (
              <option key={ent.id} value={ent.id}>
                {ent.name} ({ent.id})
              </option>
            ))}
          </select>
        </div>

        {/* On Use Text & Flag triggers */}
        <div className="space-y-2">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
              On Use Response Text
            </label>
            <textarea
              rows={2}
              placeholder="Narrative printed when player uses this item..."
              value={onUseText}
              onChange={(e) => setOnUseText(e.target.value)}
              className="w-full bg-elevated border border-subtle-border rounded-md p-2 text-xs text-prose-main focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
                Flags to Set on Use
              </label>
              <input
                type="text"
                placeholder="e.g. astrolabe_aligned"
                value={setFlagsStr}
                onChange={(e) => setSetFlagsStr(e.target.value)}
                className="w-full bg-elevated border border-subtle-border rounded px-2 py-1 text-xs font-mono text-purple-300"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
                Unlocks Direction (Optional)
              </label>
              <select
                value={unlocksDirection}
                onChange={(e) => setUnlocksDirection(e.target.value as Direction | '')}
                className="w-full bg-elevated border border-subtle-border rounded px-2 py-1 text-xs text-prose-main"
              >
                <option value="">None</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-subtle-border flex items-center justify-between">
          {isEditing ? (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Entity</span>
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEntityModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Check className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Changes' : 'Create Entity'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
