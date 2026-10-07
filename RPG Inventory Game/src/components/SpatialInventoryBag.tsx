import React, { useState, useRef, useEffect } from 'react';
import { CharacterSheet, EquipSlot, ItemCategory, ItemEntity, PlacedItem } from '../types/inventory';
import { ItemIcon } from './ItemIcon';
import { canPlaceItem, getItemDimensions } from '../engine/spatialGrid';
import { 
  RotateCw, 
  Sparkles, 
  Coins, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  Filter, 
  Package,
  Wand2
} from 'lucide-react';

interface SpatialInventoryBagProps {
  playerSheet: CharacterSheet;
  draggedItem: { item: ItemEntity; origin: string; originSlot?: EquipSlot } | null;
  hoveredCell: { x: number; y: number } | null;
  onHoverCell: (cell: { x: number; y: number } | null) => void;
  onStartDrag: (item: ItemEntity, origin: 'grid', originX?: number, originY?: number) => void;
  onDropOnGrid: (targetX: number, targetY: number) => void;
  onEquipItem: (item: ItemEntity) => void;
  onDropItem: (uid: string) => void;
  onQuickSort: () => void;
  onHoverItemForTooltip: (item: ItemEntity | null, e?: React.MouseEvent) => void;
  onRotateDragged: () => void;
  onAddItemDemo: (category: ItemCategory) => void;
}

export const SpatialInventoryBag: React.FC<SpatialInventoryBagProps> = ({
  playerSheet,
  draggedItem,
  hoveredCell,
  onHoverCell,
  onStartDrag,
  onDropOnGrid,
  onEquipItem,
  onDropItem,
  onQuickSort,
  onHoverItemForTooltip,
  onRotateDragged,
  onAddItemDemo,
}) => {
  const [filterCategory, setFilterCategory] = useState<ItemCategory | 'all'>('all');
  const [contextMenuItem, setContextMenuItem] = useState<{ item: ItemEntity; x: number; y: number } | null>(null);

  const gridCols = playerSheet.inventoryGrid.cols; // 10
  const gridRows = playerSheet.inventoryGrid.rows; // 6
  const cellSize = 54; // px per cell

  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Filtered items
  const filteredPlacedItems = playerSheet.inventoryGrid.items.filter(p => {
    if (filterCategory === 'all') return true;
    return p.item.category === filterCategory;
  });

  // Calculate if the current hovered cell is a valid placement for dragged item
  let isPlacementValid = false;
  if (draggedItem && hoveredCell) {
    const itemsWithoutDragged = playerSheet.inventoryGrid.items.filter(
      p => p.item.uid !== draggedItem.item.uid
    );
    isPlacementValid = canPlaceItem(
      itemsWithoutDragged,
      draggedItem.item,
      hoveredCell.x,
      hoveredCell.y,
      draggedItem.item.isRotated,
      gridCols,
      gridRows
    );
  }

  // Handle Drag Over grid calculation
  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedItem || !gridContainerRef.current) return;

    const rect = gridContainerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    const cellX = Math.floor(relX / cellSize);
    const cellY = Math.floor(relY / cellSize);

    if (cellX >= 0 && cellX < gridCols && cellY >= 0 && cellY < gridRows) {
      if (!hoveredCell || hoveredCell.x !== cellX || hoveredCell.y !== cellY) {
        onHoverCell({ x: cellX, y: cellY });
      }
    } else {
      onHoverCell(null);
    }
  };

  const handleGridMouseLeave = () => {
    onHoverCell(null);
  };

  const handleGridMouseUp = () => {
    if (draggedItem && hoveredCell) {
      onDropOnGrid(hoveredCell.x, hoveredCell.y);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const closeMenu = () => setContextMenuItem(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const getRarityItemBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500 bg-amber-950/40 shadow-[inset_0_0_12px_rgba(245,158,11,0.25)]';
      case 'epic':
        return 'border-purple-500 bg-purple-950/40 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]';
      case 'rare':
        return 'border-blue-500 bg-blue-950/40 shadow-[inset_0_0_8px_rgba(59,130,246,0.2)]';
      case 'uncommon':
        return 'border-emerald-500 bg-emerald-950/40 shadow-[inset_0_0_6px_rgba(34,197,94,0.15)]';
      default:
        return 'border-slate-500/80 bg-slate-900/60';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 w-full max-w-2xl border border-white/10 shadow-2xl relative">
      {/* Top Bar: Title, Category Filters, and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-400" />
          <h2 className="font-['Cinzel'] font-bold text-base text-slate-100 tracking-wide">
            Spatial Guild Bag
          </h2>
          <span className="text-xs text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            {playerSheet.inventoryGrid.items.length} Items ({gridCols}×{gridRows} Grid)
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px]">
          {(['all', 'weapon', 'armor', 'consumable', 'relic'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Spatial Grid Viewport */}
      <div className="relative flex justify-center py-2 select-none overflow-x-auto">
        <div
          ref={gridContainerRef}
          onMouseMove={handleGridMouseMove}
          onMouseLeave={handleGridMouseLeave}
          onMouseUp={handleGridMouseUp}
          className="relative inventory-grid-bg border-2 border-white/15 rounded-xl bg-[#0b0e17] shadow-inner"
          style={{
            width: `${gridCols * cellSize}px`,
            height: `${gridRows * cellSize}px`,
          }}
        >
          {/* Individual Cell Wireframe */}
          {Array.from({ length: gridRows }).map((_, rIdx) => (
            <div key={rIdx} className="flex">
              {Array.from({ length: gridCols }).map((_, cIdx) => (
                <div
                  key={cIdx}
                  className="border border-white/[0.04] box-border transition-colors duration-150"
                  style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                />
              ))}
            </div>
          ))}

          {/* Drag Placement Highlight Ghost (Green for valid, Red for blocked) */}
          {draggedItem && hoveredCell && (
            (() => {
              const { width, height } = getItemDimensions(
                draggedItem.item,
                draggedItem.item.isRotated
              );
              return (
                <div
                  className={`absolute rounded-lg border-2 pointer-events-none transition-all duration-75 z-30 ${
                    isPlacementValid
                      ? 'bg-emerald-500/35 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                      : 'bg-rose-500/35 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                  }`}
                  style={{
                    left: `${hoveredCell.x * cellSize}px`,
                    top: `${hoveredCell.y * cellSize}px`,
                    width: `${width * cellSize}px`,
                    height: `${height * cellSize}px`,
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] font-mono font-bold text-white uppercase drop-shadow">
                    {isPlacementValid ? 'Drop' : 'Blocked'}
                    <span className="text-[9px] opacity-80">[R] to Rotate</span>
                  </div>
                </div>
              );
            })()
          )}

          {/* Placed Items on the Grid */}
          {filteredPlacedItems.map(placed => {
            const { item, x, y } = placed;
            const { width, height } = getItemDimensions(item, item.isRotated);
            const isBeingDragged = draggedItem?.item.uid === item.uid;

            return (
              <div
                key={item.uid}
                onMouseDown={e => {
                  if (e.button === 0) {
                    onStartDrag(item, 'grid', x, y);
                  }
                }}
                onContextMenu={e => {
                  e.preventDefault();
                  setContextMenuItem({ item, x: e.clientX, y: e.clientY });
                }}
                onMouseEnter={e => onHoverItemForTooltip(item, e)}
                onMouseLeave={() => onHoverItemForTooltip(null)}
                className={`absolute rounded-xl border-2 flex flex-col items-center justify-between p-1.5 cursor-grab active:cursor-grabbing group transition-all duration-150 z-20 ${getRarityItemBorder(
                  item.rarity
                )} ${isBeingDragged ? 'opacity-30 scale-95' : 'hover:scale-[1.02] hover:z-30 hover:shadow-xl'} ${
                  item.rarity === 'legendary' ? 'legendary-shimmer' : ''
                }`}
                style={{
                  left: `${x * cellSize + 2}px`,
                  top: `${y * cellSize + 2}px`,
                  width: `${width * cellSize - 4}px`,
                  height: `${height * cellSize - 4}px`,
                }}
              >
                {/* Header tag: Name or Stack */}
                <div className="w-full flex items-center justify-between text-[9px] font-mono leading-none">
                  {item.isRotated && (
                    <span className="text-amber-400 font-bold bg-amber-950/60 px-1 rounded">
                      90°
                    </span>
                  )}
                  {item.stackCount && item.stackCount > 1 && (
                    <span className="text-white font-bold bg-indigo-600/80 px-1.5 py-0.5 rounded-full ml-auto">
                      ×{item.stackCount}
                    </span>
                  )}
                </div>

                {/* Main Item Visual Icon */}
                <div className="relative flex-1 flex items-center justify-center">
                  <ItemIcon
                    iconType={item.iconType}
                    rarity={item.rarity}
                    className={`${width >= 2 && height >= 2 ? 'w-12 h-12' : 'w-7 h-7'} group-hover:scale-110 transition-transform`}
                  />
                </div>

                {/* Bottom Durability or Quick Stats */}
                <div className="w-full flex items-center justify-between text-[9px] font-mono text-slate-400 leading-none pt-0.5">
                  <span className="truncate max-w-[85%] font-medium">
                    {item.name.split(' ')[0]}
                  </span>
                  {item.stats.attackPower ? (
                    <span className="text-rose-400 font-bold">⚔{item.stats.attackPower}</span>
                  ) : item.stats.armor ? (
                    <span className="text-blue-400 font-bold">🛡{item.stats.armor}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Context Menu */}
      {contextMenuItem && (
        <div
          className="fixed z-50 bg-[#121622] border border-white/15 rounded-xl shadow-2xl p-1.5 w-44 flex flex-col gap-1 text-xs text-slate-200"
          style={{
            left: `${Math.min(window.innerWidth - 180, contextMenuItem.x)}px`,
            top: `${Math.min(window.innerHeight - 150, contextMenuItem.y)}px`,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-2 py-1 font-bold text-[11px] border-b border-white/10 text-slate-400 truncate">
            {contextMenuItem.item.name}
          </div>

          {contextMenuItem.item.equipSlot && (
            <button
              onClick={() => {
                onEquipItem(contextMenuItem.item);
                setContextMenuItem(null);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors text-left font-medium"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Equip to {contextMenuItem.item.equipSlot}
            </button>
          )}

          <button
            onClick={() => {
              onRotateDragged();
              setContextMenuItem(null);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <RotateCw className="w-4 h-4 text-amber-400" /> Rotate (Key: R)
          </button>

          <button
            onClick={() => {
              onDropItem(contextMenuItem.item.uid);
              setContextMenuItem(null);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 text-rose-400" /> Discard / Drop
          </button>
        </div>
      )}

      {/* Bottom Bar: Action Buttons & Gold Bag */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          {/* 2D Bin-Packing Auto-Sort Button */}
          <button
            onClick={onQuickSort}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow"
          >
            <Layers className="w-4 h-4 text-indigo-400" /> 2D Auto-Pack
          </button>

          {/* Rotate Dragged helper button */}
          {draggedItem && (
            <button
              onClick={onRotateDragged}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold animate-pulse"
            >
              <RotateCw className="w-4 h-4" /> Rotate [R] ({draggedItem.item.isRotated ? 'Rotated' : 'Standard'})
            </button>
          )}
        </div>

        {/* Demo Loot Dispenser */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-mono">Spawn:</span>
          <button
            onClick={() => onAddItemDemo('weapon')}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] rounded-lg text-rose-300 font-mono"
            title="Add random weapon to bag"
          >
            +Weapon
          </button>
          <button
            onClick={() => onAddItemDemo('armor')}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] rounded-lg text-blue-300 font-mono"
            title="Add random armor to bag"
          >
            +Armor
          </button>
          <button
            onClick={() => onAddItemDemo('consumable')}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] rounded-lg text-emerald-300 font-mono"
            title="Add potion to bag"
          >
            +Potion
          </button>
        </div>

        {/* Gold Pouch Tally */}
        <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-500/30 px-3 py-1 rounded-xl">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-amber-300 text-sm">
            {playerSheet.gold.toLocaleString()} <span className="text-[10px] text-amber-400/80">GOLD</span>
          </span>
        </div>
      </div>
    </div>
  );
};
