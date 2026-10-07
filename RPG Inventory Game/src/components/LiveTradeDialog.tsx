import React, { useState } from 'react';
import { CharacterSheet, ItemEntity, TradeSession } from '../types/inventory';
import { ItemIcon } from './ItemIcon';
import { 
  ArrowLeftRight, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  X, 
  Coins, 
  ShieldAlert, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import { playTradeLockSound } from '../engine/audioEngine';

interface LiveTradeDialogProps {
  trade: TradeSession;
  localPlayer: CharacterSheet;
  onUpdateOffer: (tradeId: string, items: ItemEntity[], gold: number) => void;
  onToggleLock: (tradeId: string, locked: boolean) => void;
  onAcceptTrade: (tradeId: string) => void;
  onCancelTrade: (tradeId: string) => void;
  onHoverItemForTooltip: (item: ItemEntity | null, e?: React.MouseEvent) => void;
}

export const LiveTradeDialog: React.FC<LiveTradeDialogProps> = ({
  trade,
  localPlayer,
  onUpdateOffer,
  onToggleLock,
  onAcceptTrade,
  onCancelTrade,
  onHoverItemForTooltip,
}) => {
  const isSender = trade.senderId === localPlayer.playerId;
  const myOffer = isSender ? trade.senderOffer : trade.receiverOffer;
  const partnerOffer = isSender ? trade.receiverOffer : trade.senderOffer;
  const partnerName = isSender ? trade.receiverName : trade.senderName;

  const [goldInput, setGoldInput] = useState<number>(myOffer.gold);

  const handleGoldChange = (val: number) => {
    const clamped = Math.max(0, Math.min(localPlayer.gold, val));
    setGoldInput(clamped);
    onUpdateOffer(trade.tradeId, myOffer.items, clamped);
  };

  const handleToggleLockClick = () => {
    playTradeLockSound();
    onToggleLock(trade.tradeId, !myOffer.locked);
  };

  const handleAddBagItemToTrade = (item: ItemEntity) => {
    if (myOffer.locked) return; // Cannot modify if locked
    if (myOffer.items.some(i => i.uid === item.uid)) return;

    const newItems = [...myOffer.items, item];
    onUpdateOffer(trade.tradeId, newItems, myOffer.gold);
  };

  const handleRemoveItemFromTrade = (itemUid: string) => {
    if (myOffer.locked) return;
    const newItems = myOffer.items.filter(i => i.uid !== itemUid);
    onUpdateOffer(trade.tradeId, newItems, myOffer.gold);
  };

  // Available items in bag not yet in trade
  const availableBagItems = localPlayer.inventoryGrid.items
    .map(p => p.item)
    .filter(item => !myOffer.items.some(i => i.uid === item.uid));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative max-w-4xl w-full glass-panel rounded-3xl border border-white/20 p-6 shadow-2xl flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-xl">
              <ArrowLeftRight className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-['Cinzel'] font-bold text-xl text-slate-100 flex items-center gap-2">
                Synchronized Trade Chamber
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Double-Lock Protocol • Anti-Scam Protection Active
              </p>
            </div>
          </div>

          <button
            onClick={() => onCancelTrade(trade.tradeId)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anti-Scam Banner Alert */}
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Any modification to items or gold immediately releases locks and resets verification.
          </span>
        </div>

        {/* Dual Trade Chambers: Left = You, Right = Partner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Local Player Deck */}
          <div className={`p-4 rounded-2xl border-2 flex flex-col gap-3 transition-colors ${
            myOffer.locked 
              ? 'border-indigo-500/60 bg-indigo-950/20' 
              : 'border-white/10 bg-slate-900/40'
          }`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2 font-['Cinzel']">
                Your Staged Offer
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                myOffer.locked 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white/10 text-slate-400'
              }`}>
                {myOffer.locked ? 'LOCKED IN' : 'STAGING'}
              </span>
            </div>

            {/* Staged Items Matrix */}
            <div className="min-h-32 bg-black/40 border border-white/5 rounded-xl p-2.5 flex flex-wrap gap-2 content-start">
              {myOffer.items.length === 0 ? (
                <div className="w-full h-28 flex flex-col items-center justify-center text-slate-500 text-xs italic">
                  No items staged. Click items below to add.
                </div>
              ) : (
                myOffer.items.map(item => (
                  <div
                    key={item.uid}
                    onMouseEnter={e => onHoverItemForTooltip(item, e)}
                    onMouseLeave={() => onHoverItemForTooltip(null)}
                    onClick={() => handleRemoveItemFromTrade(item.uid)}
                    className="relative group p-2 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/50 cursor-pointer transition-all"
                  >
                    <ItemIcon iconType={item.iconType} rarity={item.rarity} className="w-8 h-8" />
                    <span className="text-[9px] font-mono block mt-1 text-center truncate max-w-[60px]">
                      {item.name.split(' ')[0]}
                    </span>
                    {!myOffer.locked && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Gold Offer Input */}
            <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
                <Coins className="w-4 h-4" /> Gold Staged:
              </div>
              <input
                type="number"
                disabled={myOffer.locked}
                value={goldInput}
                onChange={e => handleGoldChange(parseInt(e.target.value) || 0)}
                max={localPlayer.gold}
                min={0}
                className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-400 disabled:opacity-50"
              />
            </div>

            {/* Bag Quick-Add Shelf (when not locked) */}
            {!myOffer.locked && (
              <div className="space-y-1.5 border-t border-white/10 pt-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Add from Bag:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-black/20 rounded-lg">
                  {availableBagItems.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic p-1">All bag items in trade</span>
                  ) : (
                    availableBagItems.map(item => (
                      <button
                        key={item.uid}
                        onClick={() => handleAddBagItemToTrade(item)}
                        onMouseEnter={e => onHoverItemForTooltip(item, e)}
                        onMouseLeave={() => onHoverItemForTooltip(null)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[90px]">{item.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Remote Partner Deck */}
          <div className={`p-4 rounded-2xl border-2 flex flex-col gap-3 transition-colors ${
            partnerOffer.locked 
              ? 'border-emerald-500/60 bg-emerald-950/20' 
              : 'border-white/10 bg-slate-900/40'
          }`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2 font-['Cinzel']">
                {partnerName}'s Offer
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                partnerOffer.locked 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white/10 text-slate-400'
              }`}>
                {partnerOffer.locked ? 'LOCKED IN' : 'STAGING'}
              </span>
            </div>

            {/* Partner Staged Items Matrix */}
            <div className="min-h-32 bg-black/40 border border-white/5 rounded-xl p-2.5 flex flex-wrap gap-2 content-start">
              {partnerOffer.items.length === 0 ? (
                <div className="w-full h-28 flex flex-col items-center justify-center text-slate-500 text-xs italic">
                  Partner has not placed items yet...
                </div>
              ) : (
                partnerOffer.items.map(item => (
                  <div
                    key={item.uid}
                    onMouseEnter={e => onHoverItemForTooltip(item, e)}
                    onMouseLeave={() => onHoverItemForTooltip(null)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer transition-all hover:scale-105"
                  >
                    <ItemIcon iconType={item.iconType} rarity={item.rarity} className="w-8 h-8" />
                    <span className="text-[9px] font-mono block mt-1 text-center truncate max-w-[60px]">
                      {item.name.split(' ')[0]}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Partner Gold Offer */}
            <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
                <Coins className="w-4 h-4" /> Partner Gold Offer:
              </div>
              <span className="font-mono text-sm text-amber-300 font-bold">
                {partnerOffer.gold.toLocaleString()} Gold
              </span>
            </div>

            {/* Lock status summary */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 flex items-center justify-between">
              <span>Partner Status:</span>
              <span className="font-bold text-slate-200">
                {partnerOffer.confirmed 
                  ? 'CONFIRMED & READY' 
                  : partnerOffer.locked 
                  ? 'OFFER LOCKED' 
                  : 'Adjusting items...'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Double-Lock Control Deck */}
        <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Lock Offer Button */}
            <button
              onClick={handleToggleLockClick}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                myOffer.locked
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              {myOffer.locked ? (
                <>
                  <Unlock className="w-4 h-4" /> Unlock My Offer
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Lock In My Offer
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={() => onCancelTrade(trade.tradeId)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors"
            >
              Abort Trade
            </button>
          </div>

          {/* Final Accept Button */}
          <button
            onClick={() => onAcceptTrade(trade.tradeId)}
            disabled={!myOffer.locked || !partnerOffer.locked}
            className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl ${
              myOffer.confirmed
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse'
                : myOffer.locked && partnerOffer.locked
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {myOffer.confirmed ? 'Accepted (Waiting for Partner)' : 'Accept & Execute Trade'}
          </button>
        </div>
      </div>
    </div>
  );
};
